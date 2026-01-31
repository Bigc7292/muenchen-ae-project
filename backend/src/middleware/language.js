/**
 * Language Middleware
 * Detects and sets the request language
 */

const config = require('../config');

/**
 * Language detection middleware
 * Priority: Query param > Header > Cookie > Default
 */
const languageMiddleware = (req, res, next) => {
  const supportedLanguages = config.i18n.supportedLanguages;
  const defaultLanguage = config.i18n.defaultLanguage;

  let language = defaultLanguage;

  // 1. Check query parameter
  if (req.query.lang && supportedLanguages.includes(req.query.lang)) {
    language = req.query.lang;
  }
  // 2. Check Accept-Language header
  else if (req.headers['accept-language']) {
    const acceptLanguage = req.headers['accept-language'].split(',')[0].split('-')[0];
    if (supportedLanguages.includes(acceptLanguage)) {
      language = acceptLanguage;
    }
  }
  // 3. Check cookie
  else if (req.cookies && req.cookies.language && supportedLanguages.includes(req.cookies.language)) {
    language = req.cookies.language;
  }

  // Set language on request object
  req.language = language;

  // Set response header
  res.setHeader('Content-Language', language);

  next();
};

/**
 * Get supported languages
 */
const getSupportedLanguages = () => config.i18n.supportedLanguages;

/**
 * Check if language is supported
 */
const isLanguageSupported = (lang) => config.i18n.supportedLanguages.includes(lang);

module.exports = {
  languageMiddleware,
  getSupportedLanguages,
  isLanguageSupported
};
