/**
 * Internationalization Controller
 * Language and translation endpoints
 */

const config = require('../config');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Language metadata
 */
const languageData = {
  de: { name: 'Deutsch', nativeName: 'Deutsch', direction: 'ltr' },
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', direction: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  'zh-hans': { name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr' }
};

/**
 * Get supported languages
 */
exports.getLanguages = asyncHandler(async (req, res) => {
  const languages = config.i18n.supportedLanguages.map(code => ({
    code,
    ...languageData[code],
    isDefault: code === config.i18n.defaultLanguage
  }));

  res.json({
    data: languages,
    default: config.i18n.defaultLanguage
  });
});

/**
 * Get UI translations for a language
 */
exports.getTranslations = asyncHandler(async (req, res) => {
  const { lang } = req.params;

  // UI translations (these would typically come from a database or JSON files)
  const translations = {
    de: {
      common: {
        search: 'Suchen',
        menu: 'Menü',
        home: 'Startseite',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Zurück',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        close: 'Schließen',
        readMore: 'Mehr lesen',
        showAll: 'Alle anzeigen',
        language: 'Sprache'
      },
      navigation: {
        freizeit: 'Freizeit',
        leben: 'Leben',
        rathaus: 'Rathaus',
        wirtschaft: 'Wirtschaft',
        veranstaltungen: 'Veranstaltungen',
        sehenswuerdigkeiten: 'Sehenswürdigkeiten',
        uebernachten: 'Übernachten',
        branchenbuch: 'Branchenbuch'
      },
      footer: {
        impressum: 'Impressum',
        datenschutz: 'Datenschutz',
        kontakt: 'Kontakt',
        barrierefreiheit: 'Barrierefreiheit'
      },
      auth: {
        login: 'Anmelden',
        logout: 'Abmelden',
        register: 'Registrieren',
        email: 'E-Mail',
        password: 'Passwort',
        forgotPassword: 'Passwort vergessen?'
      }
    },
    en: {
      common: {
        search: 'Search',
        menu: 'Menu',
        home: 'Home',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        readMore: 'Read more',
        showAll: 'Show all',
        language: 'Language'
      },
      navigation: {
        freizeit: 'Leisure',
        leben: 'Living',
        rathaus: 'City Hall',
        wirtschaft: 'Business',
        veranstaltungen: 'Events',
        sehenswuerdigkeiten: 'Attractions',
        uebernachten: 'Accommodation',
        branchenbuch: 'Business Directory'
      },
      footer: {
        impressum: 'Imprint',
        datenschutz: 'Privacy Policy',
        kontakt: 'Contact',
        barrierefreiheit: 'Accessibility'
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?'
      }
    }
  };

  // Return translations for requested language, fallback to German
  const langTranslations = translations[lang] || translations.de;

  res.json({
    language: lang,
    data: langTranslations
  });
});
