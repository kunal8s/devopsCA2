const { Server } = require('socket.io');
const logger = require('../utils/helpers/logger');

let io;

/**
 * Initialize Socket.io server and basic WebRTC signaling channels.
 * This handles student ⇄ teacher signaling for screen sharing.
 *
 * Rooms are keyed by `proctoring:<testId>`.
 * Each socket stores its role (student/teacher) and identifiers in socket.data.
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('proctoring:join', ({ testId, role, userId }) => {
      if (!testId || !role || !userId) {
        return;
      }
      const room = `proctoring:${testId}`;
      socket.join(room);
      socket.data = { testId, role, userId };
      logger.info(
        `Socket ${socket.id} joined room ${room} as ${role} (userId=${userId})`,
      );
    });

    /**
     * Lightweight screen-sharing over Socket.io:
     * Students send image frames, teachers receive them.
     */
    socket.on('screen:frame', ({ testId, studentId, image }) => {
      if (!testId || !studentId || !image) return;
      const room = `proctoring:${testId}`;
      io.in(room)
        .fetchSockets()
        .then((socketsInRoom) => {
          socketsInRoom.forEach((s) => {
            if (s.id === socket.id) return;
            if (s.data?.role === 'teacher') {
              s.emit('screen:frame', {
                testId,
                studentId,
                image,
                ts: Date.now(),
              });
            }
          });
        })
        .catch((err) =>
          logger.error('Error broadcasting screen frame in room:', err),
        );
    });

    /**
     * Student sends WebRTC offer for their screen stream.
     * Broadcast to all teachers in the same room and set remote socket mapping.
     */
    socket.on('webrtc:offer', ({ testId, studentId, offer }) => {
      const room = `proctoring:${testId}`;
      if (!offer || !testId || !studentId) return;

      logger.info(
        `Received WebRTC offer from student ${studentId} in test ${testId}`,
      );

      // Emit to all teachers in the room. Each teacher will decide whether to answer.
      io.in(room)
        .fetchSockets()
        .then((socketsInRoom) => {
          socketsInRoom.forEach((s) => {
            if (s.id === socket.id) return;
            if (s.data?.role === 'teacher') {
              s.emit('webrtc:offer', {
                fromSocketId: socket.id,
                testId,
                studentId,
                offer,
              });
              // Inform student which teacher socket they are paired with
              socket.emit('webrtc:set-remote-socket', {
                teacherSocketId: s.id,
              });
            }
          });
        })
        .catch((err) => logger.error('Error fetching sockets in room:', err));
    });

    /**
     * Teacher sends WebRTC answer back to a specific student socket.
     */
    socket.on('webrtc:answer', ({ toSocketId, testId, studentId, answer }) => {
      if (!toSocketId || !answer) return;
      logger.info(
        `Forwarding WebRTC answer for student ${studentId} in test ${testId} to socket ${toSocketId}`,
      );
      io.to(toSocketId).emit('webrtc:answer', {
        testId,
        studentId,
        answer,
      });
    });

    /**
     * ICE candidates forwarded between peers.
     * Direction is determined by `toSocketId`.
     */
    socket.on(
      'webrtc:ice-candidate',
      ({ toSocketId, testId, studentId, candidate }) => {
        if (!toSocketId || !candidate) return;
        io.to(toSocketId).emit('webrtc:ice-candidate', {
          testId,
          studentId,
          candidate,
        });
      },
    );

    /**
     * Real-time chat messaging
     * Rooms are keyed by `chat:<testId>` or `chat:room:<roomId>`
     */
    socket.on('chat:join', ({ testId, roomId, userId, userType }) => {
      if (!testId && !roomId) {
        return;
      }
      const room = roomId ? `chat:room:${roomId}` : `chat:${testId}`;
      socket.join(room);
      socket.data = { ...socket.data, chatRoom: room, userId, userType };
      logger.info(`Socket ${socket.id} joined chat room ${room} as ${userType} (userId=${userId})`);
    });

    socket.on('chat:message', async ({ roomId, testId, message, senderId, senderType, senderName, recipientId }) => {
      if (!message || !senderId || !senderType) {
        return;
      }

      const room = roomId ? `chat:room:${roomId}` : `chat:${testId}`;
      
      const messageData = {
        roomId,
        testId,
        message,
        senderId,
        senderType,
        senderName,
        recipientId, // Include recipient ID for filtering
        timestamp: new Date().toISOString(),
      };

      // If teacher is sending to a specific student, send only to that student
      if (senderType === 'teacher' && recipientId) {
        // Find the student's socket and send directly
        const socketsInRoom = await io.in(room).fetchSockets();
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        
        socketsInRoom.forEach((s) => {
          // Send to the specific student recipient
          if (s.data?.userId === recipientId || s.data?.userId?.toString() === recipientId?.toString()) {
            s.emit('chat:message', {
              ...messageData,
              _id: messageId, // Add unique ID
            });
          }
          // Also send to the teacher (sender) for their own view - ONLY if they're viewing this student
          if (s.data?.userId === senderId || s.data?.userId?.toString() === senderId?.toString()) {
            // Only send to teacher if they're the sender (for their own view)
            s.emit('chat:message', {
              ...messageData,
              _id: messageId, // Add unique ID
            });
          }
        });
      } else if (senderType === 'student') {
        // Student messages go to teacher and the student themselves
        // IMPORTANT: Include recipientId so teacher knows which student sent it
        const socketsInRoom = await io.in(room).fetchSockets();
        socketsInRoom.forEach((s) => {
          // Send to teacher with recipientId set to student's ID
          if (s.data?.userType === 'teacher') {
            s.emit('chat:message', { 
              ...messageData, 
              recipientId: senderId, // Tell teacher this message is from this student
              _id: `msg_${Date.now()}_${Math.random()}` // Add unique ID
            });
          }
          // Send to the student sender
          if (s.data?.userId === senderId || s.data?.userId?.toString() === senderId?.toString()) {
            s.emit('chat:message', {
              ...messageData,
              _id: `msg_${Date.now()}_${Math.random()}` // Add unique ID
            });
          }
        });
      } else {
        // Fallback: broadcast to all (shouldn't happen)
        io.to(room).emit('chat:message', {
          ...messageData,
          _id: `msg_${Date.now()}_${Math.random()}` // Add unique ID
        });
      }

      logger.info(`Chat message sent from ${senderType} ${senderId}${recipientId ? ` to ${recipientId}` : ''} in room ${room}`);
    });

    socket.on('chat:typing', ({ roomId, testId, userId, userType, isTyping }) => {
      if (!userId || !userType) {
        return;
      }
      const room = roomId ? `chat:room:${roomId}` : `chat:${testId}`;
      
      // Broadcast typing indicator to others in the room
      socket.to(room).emit('chat:typing', {
        roomId,
        testId,
        userId,
        userType,
        isTyping,
      });
    });

    /**
     * Video Proctoring - WebRTC signaling for live video/audio
     */
    socket.on('video-proctoring:join', ({ testId, studentId, teacherId, role }) => {
      if (!testId || !role) {
        logger.warn('Invalid video-proctoring:join - missing testId or role');
        return;
      }
      
      const room = `video-proctoring:${testId}`;
      socket.join(room);
      
      // Ensure userId is stored as string for consistent comparison
      const userId = (studentId || teacherId)?.toString() || (studentId || teacherId);
      socket.data = { ...socket.data, videoRoom: room, userId, role };
      
      logger.info(`Socket ${socket.id} joined video proctoring room ${room} as ${role} (userId: ${userId})`);
      
      // Notify teacher when student joins
      if (role === 'student' && studentId) {
        const studentIdStr = studentId?.toString() || studentId;
        logger.info(`Notifying teachers that student ${studentIdStr} joined`);
        io.to(room).emit('video-proctoring:student-joined', {
          testId,
          studentId: studentIdStr,
          socketId: socket.id,
        });
      }
    });

    // Teacher sends offer to student
    socket.on('video-proctoring:offer', async ({ testId, studentId, teacherId, offer }) => {
      if (!testId || !studentId || !offer) {
        logger.warn('Invalid video-proctoring:offer - missing required fields');
        return;
      }
      
      const room = `video-proctoring:${testId}`;
      const socketsInRoom = await io.in(room).fetchSockets();
      
      logger.info(`Looking for student ${studentId} in room ${room}, found ${socketsInRoom.length} sockets`);
      
      // Find student socket - compare as strings
      let found = false;
      const studentIdStr = studentId?.toString() || studentId;
      
      socketsInRoom.forEach((s) => {
        const socketUserId = s.data?.userId?.toString() || s.data?.userId;
        if (socketUserId === studentIdStr && s.data?.role === 'student') {
          logger.info(`Found student socket ${s.id}, sending offer`);
          s.emit('video-proctoring:offer', {
            offer,
            teacherSocketId: socket.id,
            teacherId,
            testId,
            studentId: studentIdStr,
          });
          found = true;
        }
      });
      
      if (!found) {
        logger.warn(`Student ${studentIdStr} not found in room ${room}. Available sockets:`, 
          socketsInRoom.map(s => ({ id: s.id, userId: s.data?.userId, role: s.data?.role }))
        );
      }
    });

    // Student sends answer to teacher
    socket.on('video-proctoring:answer', ({ testId, studentId, teacherSocketId, teacherId, answer }) => {
      if (!teacherSocketId || !answer) return;
      
      io.to(teacherSocketId).emit('video-proctoring:answer', {
        answer,
        studentId,
        testId,
      });
    });

    // ICE candidate exchange for video proctoring
    socket.on('video-proctoring:ice-candidate', ({ testId, studentId, teacherId, teacherSocketId, candidate }) => {
      if (!candidate) return;
      
      const room = `video-proctoring:${testId}`;
      
      if (teacherSocketId) {
        // Student sending to teacher
        io.to(teacherSocketId).emit('video-proctoring:ice-candidate', {
          candidate,
          studentId,
          testId,
        });
      } else if (studentId) {
        // Teacher sending to student
        io.in(room).fetchSockets().then((socketsInRoom) => {
          socketsInRoom.forEach((s) => {
            if (s.data?.userId === studentId && s.data?.role === 'student') {
              s.emit('video-proctoring:ice-candidate', {
                candidate,
                teacherSocketId: socket.id,
                testId,
              });
            }
          });
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};


