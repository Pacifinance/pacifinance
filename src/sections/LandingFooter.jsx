
import React, { useContext } from 'react';
import { LocalizedLink } from '../components/LocalizedLink';
import { LanguageContext } from '../contexts/LanguageContext';
import LogoPaci from '../components/Logo';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesConfig';

export default function LandingFooter({ theme }) {
  const { language, translations } = useContext(LanguageContext);

  return (
    <footer 
      className="w-full mt-auto border-t-2"
      style={{ 
        backgroundColor: theme.backgroundColor, 
        color: theme.textColor,
        borderColor: theme.borderColor
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <LogoPaci />
            <p className="mt-4 text-sm opacity-80">
              {translations.footer.description}
            </p>
            <div className="mt-6">
              <BuyMeACoffeeWidget />
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {translations.footer.legal.title}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <LocalizedLink 
                  to="/privacy-policy" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.legal.privacy}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/terms-of-service" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.legal.terms}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/cookie-policy" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.legal.cookies}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/disclaimer" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.legal.disclaimer}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {translations.footer.support.title}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <LocalizedLink 
                  to="/faq" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.support.faq}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/pricing" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.support.pricing}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/contact" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.support.contact}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/sitemap" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.support.sitemap}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink 
                  to="/roadmap" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {translations.footer.support.roadmap || (language === 'it' ? 'Roadmap' : 'Roadmap')}
                </LocalizedLink>
              </li>
              <li>
                <a 
                  href="https://github.com/Pacifinance/Pacifinance/issues/new/choose"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                  data-umami-event="footer-feedback-click"
                >
                  {translations.footer.support.feedback || (language === 'it' ? 'Feedback & Bug' : 'Feedback & Bugs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Donation */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {translations.footer.community.title}
            </h3>
            <div className="space-y-4">
              <p className="text-sm opacity-80">
                {translations.footer.community.donationText}
              </p>
              <div className="p-4 rounded-lg border" style={{ borderColor: theme.borderColor, backgroundColor: theme.primaryColor }}>
                <p className="text-xs mb-2 font-medium" style={{ color: theme.secondaryColor }}>
                  {translations.footer.community.supportTitle}
                </p>
                <p className="text-xs opacity-80 mb-3">
                  {translations.footer.community.supportDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="pt-8 border-t mb-8" style={{ borderColor: theme.borderColor }}>
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-3" style={{ color: theme.secondaryColor }}>
              {translations.footer.languages.title}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {translations.footer.languages.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
                    transition-all duration-200
                    ${language === lang.code 
                      ? 'ring-2 ring-offset-2' 
                      : 'opacity-80 hover:opacity-100'
                    }
                  `}
                  style={{ 
                    backgroundColor: language === lang.code 
                      ? theme.secondaryColor 
                      : theme.primaryColor,
                    color: language === lang.code 
                      ? '#fff' 
                      : theme.textColor,
                    borderColor: theme.borderColor,
                    ringColor: theme.secondaryColor
                  }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: theme.borderColor }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} PaciFinance. {translations.footer.rights}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-xs opacity-60">
                {translations.footer.madeWith} ❤️ {translations.footer.forPrivacy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
