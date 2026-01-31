/**
 * Authentication Controller
 * Handles user authentication operations
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

/**
 * Register new user
 */
exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, language } = req.body;

  // Check if user exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    language: language || 'de'
  });

  // Generate tokens
  const tokens = generateTokens(user.id);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      language: user.language
    },
    ...tokens
  });
});

/**
 * Login user
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      language: user.language
    },
    ...tokens
  });
});

/**
 * Logout user
 */
exports.logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

/**
 * Refresh access token
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const tokens = generateTokens(user.id);

    res.json({
      message: 'Token refreshed',
      ...tokens
    });
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

/**
 * Get current user
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
      language: req.user.language
    }
  });
});

/**
 * Update current user
 */
exports.updateCurrentUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, language } = req.body;

  const user = await User.update(req.user.id, {
    first_name: firstName,
    last_name: lastName,
    language
  });

  res.json({
    message: 'User updated',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      language: user.language
    }
  });
});

/**
 * Forgot password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  
  // Always return success to prevent email enumeration
  res.json({
    message: 'If an account exists with this email, a password reset link has been sent'
  });

  // TODO: Implement email sending logic
});

/**
 * Reset password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // TODO: Implement password reset logic
  res.json({ message: 'Password reset successful' });
});
