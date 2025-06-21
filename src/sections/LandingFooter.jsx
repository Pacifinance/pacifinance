
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import LogoPaci from '../components/Logo';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import languages from '../data/languages.json';

export default function LandingFooter({ theme }) {
  const { language } = useContext(LanguageContext);

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
              {languages[language].footer.description}
            </p>
            <div className="mt-6">
              <BuyMeACoffeeWidget />
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {languages[language].footer.legal.title}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.legal.privacy}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.legal.terms}
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookie-policy" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.legal.cookies}
                </Link>
              </li>
              <li>
                <Link 
                  to="/disclaimer" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.legal.disclaimer}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {languages[language].footer.support.title}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/faq" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.support.faq}
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.support.pricing}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.support.contact}
                </Link>
              </li>
              <li>
                <Link 
                  to="/sitemap" 
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].footer.support.sitemap}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Donation */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.secondaryColor }}>
              {languages[language].footer.community.title}
            </h3>
            <div className="space-y-4">
              <p className="text-sm opacity-80">
                {languages[language].footer.community.donationText}
              </p>
              <div className="p-4 rounded-lg border" style={{ borderColor: theme.borderColor, backgroundColor: theme.primaryColor }}>
                <p className="text-xs mb-2 font-medium" style={{ color: theme.secondaryColor }}>
                  {languages[language].footer.community.supportTitle}
                </p>
                <p className="text-xs opacity-80 mb-3">
                  {languages[language].footer.community.supportDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: theme.borderColor }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} PaciFinance. {languages[language].footer.rights}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-xs opacity-60">
                {languages[language].footer.madeWith} ❤️ {languages[language].footer.forPrivacy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
