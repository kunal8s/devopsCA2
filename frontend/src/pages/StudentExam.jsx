import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaSave, FaCheckCircle } from 'react-icons/fa';
import { testAPI } from '../services/api/testAPI';
import axiosClient from '../services/axiosClient';

const STATUS = {
  UNVISITED: 'unvisited',
  VISITED: 'visited',
  ANSWERED: 'answered',
};

const StudentExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [warnings, setWarnings] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Check authentication before loading test
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/student-login', { replace: true });
    }
  }, [navigate]);

  // Load test from backend API
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access this test.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const testData = await testAPI.getById(testId);
        
        // axiosClient already returns response.data
        // Backend returns ApiResponse: { status, data: { id, title, questions, ... }, message }
        // So testData is already the ApiResponse object, extract data
        const testInfo = testData?.data || testData;
        
        console.log('Test API Response:', { testData, testInfo });
        
        if (!testInfo || !testInfo.questions) {
          setError('Test not found or no longer available.');
          return;
        }

        // Sort questions by order
        const sortedQuestions = [...(testInfo.questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setTest({
          id: testInfo.id,
          title: testInfo.title,
          description: testInfo.description,
          course: testInfo.course,
          duration: testInfo.duration,
          totalMarks: testInfo.totalMarks,
          passingMarks: testInfo.passingMarks,
          instructions: testInfo.instructions,
          scheduledDate: testInfo.scheduledDate,
          questions: sortedQuestions,
        });

        // Initialize time if duration is available
        if (testInfo.duration) {
          setTimeRemaining(testInfo.duration * 60); // Convert minutes to seconds
          setStartTime(new Date());
        }
      } catch (e) {
        console.error('Error loading test:', e);
        
        // Handle authentication errors
        if (e.response?.status === 401 || e.message?.includes('authentication') || e.message?.includes('401')) {
          localStorage.removeItem('token');
          localStorage.removeItem('student');
          navigate('/auth/student-login', { replace: true });
          return;
        }
        
        setError(e.message || 'Unable to load test. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || !startTime || autoSubmitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date() - startTime) / 1000);
      const remaining = (timeRemaining - elapsed);
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        handleSubmit(true); // Auto-submit when time runs out
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, startTime, autoSubmitted]);

  // Track tab/window focus for anti-cheat
  useEffect(() => {
    if (!test || autoSubmitted || showInstructions) return;

    let devToolsOpen = false;
    const checkDevTools = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          setWarnings((prev) => {
            const newWarnings = prev + 1;
            if (newWarnings >= 3) {
              handleSubmit(true);
            }
            return newWarnings;
          });
        }
      } else {
        devToolsOpen = false;
      }
    }, 1000);

    const handleBlur = () => {
      setWarnings((prev) => {
        const newWarnings = prev + 1;
        if (newWarnings >= 3) {
          handleSubmit(true);
        }
        return newWarnings;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(checkDevTools);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [test, autoSubmitted, showInstructions]);

  const questions = test?.questions || [];

  const statuses = useMemo(() => {
    const map = {};
    questions.forEach((q, idx) => {
      const key = String(idx);
      if (!visited[key]) {
        map[key] = STATUS.UNVISITED;
      } else if (answers[key] && answers[key].length > 0) {
        map[key] = STATUS.ANSWERED;
      } else {
        map[key] = STATUS.VISITED;
      }
    });
    return map;
  }, [questions, visited, answers]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (index, option) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: [option], // Single select - array with one option
    }));
    setVisited((prev) => ({ ...prev, [index]: true }));
  };

  const goToQuestion = (index) => {
    setVisited((prev) => ({ ...prev, [index]: true }));
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const handleSave = async () => {
    try {
      // Save answers to localStorage as backup
      localStorage.setItem(`test_${testId}_answers`, JSON.stringify(answers));
      // TODO: Save to backend when API is ready
      alert('Answers saved successfully!');
    } catch (e) {
      console.error('Error saving answers:', e);
    }
  };

  const handleSubmit = async (forced = false) => {
    if (!forced && !showSubmitConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    const confirmSubmit =
      forced ||
      window.confirm(
        'Are you sure you want to submit the test? You will not be able to change your answers afterwards.',
      );
    if (!confirmSubmit) {
      setShowSubmitConfirm(false);
      return;
    }

    try {
      // Save attempt to backend (TODO: implement backend API)
      const attemptData = {
        testId,
        answers,
        submittedAt: new Date().toISOString(),
        timeSpent: startTime ? Math.floor((new Date() - startTime) / 1000) : 0,
      };

      // For now, save to localStorage
      const attemptsRaw = localStorage.getItem('examAttempts');
      const attempts = attemptsRaw ? JSON.parse(attemptsRaw) : [];
      attempts.push(attemptData);
      localStorage.setItem('examAttempts', JSON.stringify(attempts));

      setAutoSubmitted(true);
      alert('Test submitted successfully!');
      navigate('/student/dashboard', { replace: true });
    } catch (e) {
      console.error('Error submitting test:', e);
      alert('Error submitting test. Please try again.');
    }
  };

  // Load saved answers on mount
  useEffect(() => {
    if (test) {
      try {
        const saved = localStorage.getItem(`test_${testId}_answers`);
        if (saved) {
          const savedAnswers = JSON.parse(saved);
          setAnswers(savedAnswers);
          // Mark all answered questions as visited
          Object.keys(savedAnswers).forEach((key) => {
            if (savedAnswers[key] && savedAnswers[key].length > 0) {
              setVisited((prev) => ({ ...prev, [key]: true }));
            }
          });
        }
      } catch (e) {
        console.error('Error loading saved answers:', e);
      }
    }
  }, [test, testId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-600" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Test not available.'}</p>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            {test.title}
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Duration: {test.duration} minutes • Total Questions: {questions.length} • Total Marks: {test.totalMarks}
          </p>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Instructions</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              {test.instructions && (
                <li className="whitespace-pre-line">{test.instructions}</li>
              )}
              <li>Do not close this tab or switch to other applications unnecessarily.</li>
              <li>Do not open browser developer tools (F12) or inspect the page.</li>
              <li>Browser extensions that interfere with the exam are not allowed.</li>
              <li>You will receive warnings if suspicious activity is detected. After 3 warnings, the test will be auto-submitted.</li>
              <li>Red boxes indicate unvisited questions, grey boxes indicate visited but unanswered questions, and green boxes indicate answered questions.</li>
              <li>Review your answers carefully before submitting the test.</li>
              <li>Use the "Save" button to save your progress periodically.</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="px-6 py-2.5 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
            >
              I understand, Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSubmitConfirm) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Confirm Submission
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to submit the test? You will not be able to change your answers afterwards.
          </p>
          <div className="space-y-2 mb-6 text-sm">
            <p className="text-slate-700">
              <span className="font-medium">Total Questions:</span> {questions.length}
            </p>
            <p className="text-slate-700">
              <span className="font-medium">Answered:</span>{' '}
              {Object.values(answers).filter(a => a && a.length > 0).length}
            </p>
            <p className="text-slate-700">
              <span className="font-medium">Unanswered:</span>{' '}
              {questions.length - Object.values(answers).filter(a => a && a.length > 0).length}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(false)}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{test.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Question {currentIndex + 1} of {questions.length} • Total Marks: {test.totalMarks}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {warnings > 0 && (
              <div className="flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <FaExclamationTriangle className="mr-1.5" />
                Warning {warnings}/3
              </div>
            )}
            {timeRemaining !== null && (
              <div className="flex items-center text-sm font-medium text-slate-700">
                <FaClock className="mr-2" />
                <span className={timeRemaining < 300 ? 'text-red-600' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - 70/30 Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side - 70% - Question Area */}
        <section className="flex-[0.7] p-8 overflow-y-auto bg-slate-50">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    {currentQuestion.questionText || currentQuestion.prompt}
                  </h2>
                  {currentQuestion.marks && (
                    <p className="text-sm text-slate-500">
                      Marks: {currentQuestion.marks}
                      {currentQuestion.negativeMarks > 0 && (
                        <span className="text-red-600 ml-2">
                          (Negative: -{currentQuestion.negativeMarks})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Options - Radio Buttons */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, optIndex) => {
                    const isSelected = (answers[currentIndex] || []).includes(option);
                    return (
                      <label
                        key={optIndex}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentIndex}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleSelectOption(currentIndex, option)}
                          className="mt-1 mr-4 w-5 h-5 text-sky-600 focus:ring-sky-500 focus:ring-2"
                        />
                        <span className="flex-1 text-slate-900 text-base">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentIndex === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaChevronLeft />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentIndex === questions.length - 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                  }`}
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Side - 30% - Question Navigator */}
        <aside className="flex-[0.3] border-l border-slate-200 bg-white p-6 overflow-y-auto">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Question Navigator
          </h3>

          {/* Question Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((_, idx) => {
              const status = statuses[String(idx)];
              const isCurrent = idx === currentIndex;
              let bgColor = 'bg-red-500 hover:bg-red-600';
              if (status === STATUS.VISITED) bgColor = 'bg-gray-400 hover:bg-gray-500';
              if (status === STATUS.ANSWERED) bgColor = 'bg-green-500 hover:bg-green-600';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center transition-colors ${
                    bgColor
                  } ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                  }`}
                  title={`Question ${idx + 1}${status === STATUS.ANSWERED ? ' - Answered' : status === STATUS.VISITED ? ' - Visited' : ' - Unvisited'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Status Legend
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 flex-shrink-0"></div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-400 flex-shrink-0"></div>
                <span>Visited (Not Attempted)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0"></div>
                <span>Attempted</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-600 text-white hover:bg-slate-700 font-medium transition-colors"
            >
              <FaSave />
              Save Progress
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm"
            >
              <FaCheckCircle />
              Submit Test
            </button>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
            <h4 className="text-xs font-semibold text-sky-900 mb-2">
              Progress Summary
            </h4>
            <div className="space-y-1 text-xs text-sky-700">
              <p>
                Answered: {Object.values(answers).filter(a => a && a.length > 0).length} / {questions.length}
              </p>
              <p>
                Remaining: {questions.length - Object.values(answers).filter(a => a && a.length > 0).length}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default StudentExam;
