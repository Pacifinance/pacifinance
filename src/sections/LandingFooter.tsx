import React, { useContext } from 'react';
import { LocalizedLink } from '../components/LocalizedLink';
import { LanguageContext } from '../contexts/LanguageContext';
import LogoPaci from '../components/Logo';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import { APP_VERSION } from '../data/appVersion';

export default function LandingFooter({ theme }) {
  const { language, translations } = useContext(LanguageContext);
  const dividerColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <footer
      className="w-full mt-auto border-t"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        borderColor: dividerColor
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-9">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <LogoPaci />
            <p className="mt-3 text-sm opacity-80">
              {translations.footer.description}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3" style={{ color: theme.secondaryColor }}>
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
            <h3 className="font-semibold text-lg mb-3" style={{ color: theme.secondaryColor }}>
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
                <LocalizedLink
                  to="/contribute"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                  data-umami-event="footer-feedback-click"
                >
                  {translations.footer.support.feedback || (language === 'it' ? 'Feedback & Bug' : 'Feedback & Bugs')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Community & Donation */}
          <div>
            <h3 className="font-semibold text-lg mb-3" style={{ color: theme.secondaryColor }}>
              {translations.footer.community.title}
            </h3>
            <div className="space-y-3">
              <p className="text-sm opacity-80">
                {translations.footer.community.donationText}
              </p>
              <div className="p-3.5 rounded-lg border" style={{ borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : `${theme.secondaryColor}25`, backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.045)' : theme.primaryColor }}>
                <p className="text-xs mb-1.5 font-medium" style={{ color: theme.secondaryColor }}>
                  {translations.footer.community.supportTitle}
                </p>
                <p className="text-xs opacity-80">
                  {translations.footer.community.supportDescription}
                </p>
              </div>
              <BuyMeACoffeeWidget />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t" style={{ borderColor: dividerColor }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} Pacifinance. {translations.footer.rights}
            </p>
            <span className="text-xs opacity-50 order-last md:order-none">
              v{APP_VERSION}
            </span>
            <span className="text-xs opacity-60">
              {translations.footer.madeWith} ❤️ {translations.footer.forPrivacy}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
