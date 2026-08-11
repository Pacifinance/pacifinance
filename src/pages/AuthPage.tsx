import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import SignInForm from '../sections/SignInForm';
import SignUpForm from '../sections/SignUpForm';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SEOHead from '../components/SEOHead';
import { GITHUB_REPO_URL } from '../data/externalLinks';
import heroBackground from '../assets/landing/hero-background.webp';
import type { PacifinanceTheme } from '../types/theme';

export default function AuthPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;
  const [isSignUp, setIsSignUp] = useState(false);
  const t = translations.auth;
  const header = translations.header;

  const toggleAuthMode = () => setIsSignUp(!isSignUp);

  return (
    <>
      <SEOHead
        title={isSignUp ? 'Sign Up - Pacifinance | Secure Access' : 'Sign In - Pacifinance | Secure Access'}
        description="Access your Pacifinance account securely. Sign in or sign up to manage your personal finances with complete privacy — no email required, open source, AGPLv3."
        keywords="sign in, sign up, secure access, personal finance, privacy, open source"
        canonical="/auth"
        language={language}
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage} />

        <div
          className="relative flex-1 w-full flex items-center justify-center px-4 py-10 md:py-16 overflow-hidden"
          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          {mode === 'dark' && (
            <>
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  backgroundImage: `url(${heroBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 30%',
                  opacity: 0.16,
                }}
              />
              {/* Vignette keeps the form legible — the art shows mainly at the edges. */}
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  background: `radial-gradient(ellipse at center, ${theme.backgroundColor} 25%, transparent 75%)`,
                  opacity: 0.92,
                }}
              />
            </>
          )}

          <div className="relative z-10 max-w-5xl w-full">
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {isSignUp ? (
                  <>
                    <span style={{ color: theme.secondaryColor }}>{language === 'it' ? 'Unisciti a' : 'Join'}</span> Pacifinance
                  </>
                ) : (
                  <span style={{ color: theme.secondaryColor }}>{language === 'it' ? 'Bentornato' : 'Welcome Back'}</span>
                )}
              </h1>
              <p className="text-base md:text-lg opacity-80 max-w-lg mx-auto">
                {isSignUp ? header.register.info : header.login.info}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10 items-start">
              {/* Form — first on mobile so it's not buried below supporting info */}
              <div className="order-1 xl:order-2 flex justify-center">
                <div
                  className="w-full max-w-md p-6 md:p-8 rounded-2xl shadow-2xl"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}15` : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${theme.secondaryColor}30`,
                  }}
                >
                  <div className="flex mb-6 md:mb-8 rounded-lg overflow-hidden" style={{ backgroundColor: `${theme.secondaryColor}20` }}>
                    <AuthTab
                      theme={theme}
                      active={!isSignUp}
                      onClick={() => setIsSignUp(false)}
                      label={header.login.titleButton}
                    >
                      <LockIcon className="mr-2" fontSize="small" />
                    </AuthTab>
                    <AuthTab
                      theme={theme}
                      active={isSignUp}
                      onClick={() => setIsSignUp(true)}
                      label={header.register.titleButton}
                    >
                      <PersonAddIcon className="mr-2" fontSize="small" />
                    </AuthTab>
                  </div>

                  {isSignUp ? (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">{header.register.title}</h2>
                      <SignUpForm />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">{header.login.title}</h2>
                      <SignInForm />
                    </div>
                  )}

                  <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t" style={{ borderColor: `${theme.secondaryColor}30` }}>
                    <p className="text-center text-sm opacity-70">
                      {isSignUp
                        ? (language === 'it' ? 'Hai già un account? ' : 'Already have an account? ')
                        : (language === 'it' ? 'Nuovo su Pacifinance? ' : 'New to Pacifinance? ')}
                      <button onClick={toggleAuthMode} className="font-semibold hover:underline" style={{ color: theme.secondaryColor }}>
                        {isSignUp ? header.login.titleButton : header.register.titleButton}
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Context — no email required, open source, credential recovery */}
              <div className="order-2 xl:order-1 space-y-4">
                {isSignUp && (
                  <div
                    className="p-4 rounded-xl border text-sm"
                    style={{ backgroundColor: `${theme.secondaryColor}0d`, borderColor: `${theme.secondaryColor}30` }}
                  >
                    <div className="font-semibold mb-1" style={{ color: theme.secondaryColor }}>{t.signupSteps.label}</div>
                    <div className="opacity-90">{t.signupSteps.flow}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <TrustCard theme={theme} title={t.trust.noEmailTitle} description={t.trust.noEmailDescription}>
                    <LockIcon className="text-white" sx={{ fontSize: 20 }} />
                  </TrustCard>
                  <TrustCard
                    theme={theme}
                    title={t.trust.openSourceTitle}
                    description={t.trust.openSourceDescription}
                    href={GITHUB_REPO_URL}
                  >
                    <CodeIcon className="text-white" sx={{ fontSize: 20 }} />
                  </TrustCard>
                </div>

                <div
                  className="flex items-start gap-2.5 p-4 rounded-xl border"
                  style={{
                    borderColor: `${theme.secondaryColor}30`,
                    backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}0d` : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <InfoOutlinedIcon style={{ color: theme.secondaryColor }} fontSize="small" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1 text-sm">{t.recoveryNotice.title}</div>
                    <p className="text-xs md:text-sm opacity-80">{t.recoveryNotice.text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LandingFooter theme={theme} />
      </div>
    </>
  );
}

function AuthTab({
  theme,
  active,
  onClick,
  label,
  children,
}: {
  theme: PacifinanceTheme;
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 flex items-center justify-center ${
        active ? 'shadow-lg' : 'opacity-70 hover:opacity-100'
      }`}
      style={{
        backgroundColor: active ? theme.secondaryColor : 'transparent',
        color: active ? 'white' : theme.textColor,
      }}
    >
      {children}
      {label}
    </button>
  );
}

function TrustCard({
  theme,
  title,
  description,
  children,
  href,
}: {
  theme: PacifinanceTheme;
  title: string;
  description: string;
  children: React.ReactNode;
  href?: string;
}) {
  const cardStyle: React.CSSProperties = {
    borderColor: `${theme.secondaryColor}40`,
    backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}10` : 'rgba(255,255,255,0.5)',
  };

  const content = (
    <>
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full mb-2"
        style={{ backgroundColor: theme.secondaryColor }}
      >
        {children}
      </div>
      <h4 className="font-semibold mb-1 text-sm">{title}</h4>
      <p className="text-xs opacity-80">{description}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-xl border block transition-opacity hover:opacity-80"
        style={cardStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="p-4 rounded-xl border" style={cardStyle}>
      {content}
    </div>
  );
}
