/**
 * City Portal Backend - Main Entry Point
 * Based on Muenchen.de architecture analysis
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const eventsRoutes = require('./routes/events.routes');
const newsRoutes = require('./routes/news.routes');
const businessRoutes = require('./routes/business.routes');
const locationsRoutes = require('./routes/locations.routes');
const searchRoutes = require('./routes/search.routes');
const mediaRoutes = require('./routes/media.routes');
const i18nRoutes = require('./routes/i18n.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { languageMiddleware } = require('./middleware/language');

// Import config
const config = require('./config');
const logger = require('./utils/logger');

const app = express();

// ===========================================
// MIDDLEWARE SETUP
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Language detection middleware
app.use(languageMiddleware);

// ===========================================
// ROUTES
// ===========================================

const API_PREFIX = `/api/${config.apiVersion}`;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: config.apiVersion
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/content`, contentRoutes);
app.use(`${API_PREFIX}/events`, eventsRoutes);
app.use(`${API_PREFIX}/news`, newsRoutes);
app.use(`${API_PREFIX}/business`, businessRoutes);
app.use(`${API_PREFIX}/locations`, locationsRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use(`${API_PREFIX}/i18n`, i18nRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use(errorHandler);

// ===========================================
// SERVER START
// ===========================================

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 API: http://localhost:${PORT}${API_PREFIX}`);
});

module.exports = app;
