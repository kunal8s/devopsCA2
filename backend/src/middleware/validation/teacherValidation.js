const Joi = require('joi');
const { UNIVERSITY_NAMES } = require('../../utils/constants/universities');

const teacherValidation = {
  sendOTP: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please enter a valid email address',
          'string.empty': 'Email is required',
          'any.required': 'Email is required'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  },

  verifyOTP: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please enter a valid email address',
          'string.empty': 'Email is required'
        }),
      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          'string.length': 'OTP must be 6 digits',
          'string.pattern.base': 'OTP must contain only numbers',
          'string.empty': 'OTP is required'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  },

  register: (req, res, next) => {
    const schema = Joi.object({
      // Email is actually taken from the verified OTP session on the server,
      // but the frontend sends it in the body. We allow it here so Joi does
      // not reject the payload with `"email" is not allowed`.
      email: Joi.string()
        .email()
        .optional(),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters',
          'string.max': 'First name cannot exceed 50 characters',
          'string.empty': 'First name is required'
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters',
          'string.max': 'Last name cannot exceed 50 characters',
          'string.empty': 'Last name is required'
        }),
      teacherId: Joi.string()
        .pattern(/^[A-Z0-9]{6,12}$/)
        .required()
        .messages({
          'string.pattern.base': 'Teacher ID must be 6-12 alphanumeric characters',
          'string.empty': 'Teacher ID is required'
        }),
      university: Joi.string()
        .min(2)
        .max(120)
        .required()
        .messages({
          'string.min': 'University name must be at least 2 characters',
          'string.max': 'University name cannot exceed 120 characters',
          'string.empty': 'University is required'
        }),
      otherUniversity: Joi.string()
        .min(2)
        .max(100)
        .allow('')
        .messages({
          'string.min': 'University name must be at least 2 characters',
          'string.max': 'University name cannot exceed 100 characters',
          'any.required': 'Please specify your university name'
        }),
      password: Joi.string()
        .min(8)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters',
          'string.empty': 'Password is required'
        }),
      passwordConfirm: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'string.empty': 'Please confirm your password'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  },

  login: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please enter a valid email address',
          'string.empty': 'Email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'string.empty': 'Password is required'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  }
};

module.exports = teacherValidation;