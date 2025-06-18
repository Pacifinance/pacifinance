
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import SignInForm from '../sections/SignInForm';
import SignUpForm from '../sections/SignUpForm';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import languages from '../data/languages.json';

export default function AuthPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { mode } = theme;
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{isSignUp ? 'Register' : 'Login'} - PaciFinance | Secure Access</title>
      <meta name="description" content="Access your PaciFinance account securely. Login or register to manage your personal finances with complete privacy." />
      <meta name="keywords" content="login, register, secure access, personal finance, privacy" />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>
        
        <div 
          className="flex-1 w-full flex items-center justify-center px-4 py-8"
          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Information and Security Notice */}
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {isSignUp ? (
                    <>
                      <span style={{ color: theme.secondaryColor }}>Join</span> PaciFinance
                    </>
                  ) : (
                    <>
                      <span style={{ color: theme.secondaryColor }}>Welcome</span> Back
                    </>
                  )}
                </h1>
                <p className="text-xl opacity-80 mb-8">
                  {isSignUp 
                    ? languages[language].header.register.info
                    : languages[language].header.login.info
                  }
                </p>
              </div>

              {/* Security Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4 flex items-center">
                  <SecurityIcon style={{ color: theme.secondaryColor }} className="mr-3" />
                  Your Privacy & Security
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      borderColor: `${theme.secondaryColor}40`,
                      backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}10` : "rgba(255,255,255,0.5)"
                    }}
                  >
                    <LockIcon style={{ color: theme.secondaryColor }} className="mb-2" />
                    <h4 className="font-semibold mb-2">No Email Required</h4>
                    <p className="text-sm opacity-80">Complete anonymity with secure ID-based authentication</p>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      borderColor: `${theme.secondaryColor}40`,
                      backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}10` : "rgba(255,255,255,0.5)"
                    }}
                  >
                    <SecurityIcon style={{ color: theme.secondaryColor }} className="mb-2" />
                    <h4 className="font-semibold mb-2">256-bit Encryption</h4>
                    <p className="text-sm opacity-80">Bank-level security for all your financial data</p>
                  </div>
                </div>
              </div>

              {/* Important Security Notice */}
              <div 
                className="p-6 rounded-lg border-2"
                style={{ 
                  borderColor: '#ff9800',
                  backgroundColor: theme.mode === "dark" ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <WarningIcon style={{ color: '#ff9800' }} className="mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Important Security Recommendation</h4>
                    <p className="text-sm opacity-90 mb-3">
                      Since we don't require email addresses to maintain your anonymity, please save your 
                      <strong> User ID and password</strong> in a secure password manager like:
                    </p>
                    <ul className="text-sm opacity-80 space-y-1 ml-4">
                      <li>• Bitwarden (Free & Open Source)</li>
                      <li>• 1Password</li>
                      <li>• LastPass</li>
                      <li>• Your browser's built-in password manager</li>
                    </ul>
                    <p className="text-sm opacity-90 mt-3 font-medium">
                      ⚠️ Without these credentials, account recovery is impossible due to our privacy-first approach.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Authentication Form */}
            <div className="flex justify-center">
              <div 
                className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
                style={{ 
                  backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}15` : "rgba(255,255,255,0.9)",
                  border: `1px solid ${theme.secondaryColor}30`
                }}
              >
                {/* Toggle Buttons */}
                <div className="flex mb-8 rounded-lg overflow-hidden" style={{ backgroundColor: `${theme.secondaryColor}20` }}>
                  <button
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 flex items-center justify-center ${
                      !isSignUp 
                        ? 'text-white shadow-lg' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: !isSignUp ? theme.secondaryColor : 'transparent',
                      color: !isSignUp ? 'white' : theme.textColor
                    }}
                  >
                    <LockIcon className="mr-2" fontSize="small" />
                    {languages[language].header.login.titleButton}
                  </button>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 flex items-center justify-center ${
                      isSignUp 
                        ? 'text-white shadow-lg' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: isSignUp ? theme.secondaryColor : 'transparent',
                      color: isSignUp ? 'white' : theme.textColor
                    }}
                  >
                    <PersonAddIcon className="mr-2" fontSize="small" />
                    {languages[language].header.register.titleButton}
                  </button>
                </div>

                {/* Form Content */}
                <div className="transition-all duration-300">
                  {isSignUp ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-center">
                        {languages[language].header.register.title}
                      </h2>
                      <SignUpForm />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-center">
                        {languages[language].header.login.titleButton}
                      </h2>
                      <SignInForm />
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.secondaryColor}30` }}>
                  <p className="text-center text-sm opacity-70">
                    {isSignUp ? (
                      <>Already have an account? </>
                    ) : (
                      <>New to PaciFinance? </>
                    )}
                    <button
                      onClick={toggleAuthMode}
                      className="font-semibold hover:underline"
                      style={{ color: theme.secondaryColor }}
                    >
                      {isSignUp ? 'Sign In' : 'Create Account'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
