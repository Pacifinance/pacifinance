
import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { slideIn } from '../styles/MyStyled';
import { themes } from '../styles/Themes';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false
  });
  const [showDetails, setShowDetails] = useState(false);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      const saved = JSON.parse(cookieConsent);
      setPreferences(saved.preferences);
      setShowBanner(false);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    savePreferences(newPreferences);
  };

  const handleAcceptNecessary = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    savePreferences(newPreferences);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs) => {
    const consent = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowBanner(false);
    
    // Apply analytics based on preferences
    if (prefs.analytics) {
      // Enable analytics (already loaded via Umami in index.html)
      window.umami?.track('cookies_accepted_analytics');
    }
  };

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <CookieBannerContainer>
      <div className="cookie-content">
        <div className="cookie-header">
          <h3>🍪 {languages[language]?.cookie?.title || 'We use cookies'}</h3>
        </div>

        <div className="cookie-body">
          <p>
            {languages[language]?.cookie?.description || 
            'We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. You can choose which cookies to accept.'}
          </p>

          {showDetails && (
            <div className="cookie-details">
              <div className="cookie-category">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.necessary} 
                    disabled 
                  />
                  <strong>Necessary Cookies</strong>
                  <span className="required">(Required)</span>
                </label>
                <p>Essential for the website to function properly. Cannot be disabled.</p>
              </div>

              <div className="cookie-category">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={() => handlePreferenceChange('analytics')}
                  />
                  <strong>Analytics Cookies</strong>
                </label>
                <p>Help us understand how visitors interact with our website (Umami Analytics).</p>
              </div>

              <div className="cookie-category">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing} 
                    onChange={() => handlePreferenceChange('marketing')}
                  />
                  <strong>Marketing Cookies</strong>
                </label>
                <p>Used to track visitors for personalized advertising (currently not used).</p>
              </div>
            </div>
          )}
        </div>

        <div className="cookie-actions">
          <button 
            className="btn-link" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Customize'}
          </button>
          
          <div className="btn-group">
            <button 
              className="btn-secondary" 
              onClick={handleAcceptNecessary}
            >
              Accept Necessary Only
            </button>
            
            {showDetails && (
              <button 
                className="btn-primary" 
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            )}
            
            <button 
              className="btn-primary" 
              onClick={handleAcceptAll}
              data-umami-event="cookie-accept-all"
            >
              Accept All
            </button>
          </div>
        </div>

        <div className="cookie-footer">
          <small>
            You can change your preferences at any time in our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </small>
        </div>
      </div>
    </CookieBannerContainer>
  );
}

export default CookieBanner;

const CookieBannerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  z-index: 9999;
  animation: ${slideIn} 0.3s ease-out;

  @media (min-width: 768px) {
    left: 20px;
    right: auto;
    margin: 0;
  }

  .cookie-content {
    padding: 20px;
  }

  .cookie-header h3 {
    margin: 0 0 12px 0;
    color: #079164;
    font-size: 18px;
    font-weight: 600;
  }

  .cookie-body {
    margin-bottom: 16px;
    
    p {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .cookie-details {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-top: 12px;
  }

  .cookie-category {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
      cursor: pointer;
      
      input[type="checkbox"] {
        margin-top: 2px;
      }
      
      input[type="checkbox"]:disabled {
        cursor: not-allowed;
      }
      
      strong {
        color: #333;
        font-size: 14px;
      }
    }
    
    .required {
      color: #666;
      font-size: 12px;
      font-weight: normal;
      margin-left: 4px;
    }
    
    p {
      margin: 4px 0 0 24px;
      color: #666;
      font-size: 12px;
    }
  }

  .cookie-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
    
    @media (min-width: 480px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .btn-link {
    background: none;
    border: none;
    color: #079164;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    
    &:hover {
      color: #065a4a;
    }
  }

  .btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn-primary, .btn-secondary {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background: #079164;
    color: white;
    
    &:hover {
      background: #065a4a;
    }
  }

  .btn-secondary {
    background: #f1f3f4;
    color: #333;
    border: 1px solid #d0d7de;
    
    &:hover {
      background: #e1e7ea;
    }
  }

  .cookie-footer {
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
    
    small {
      color: #666;
      font-size: 11px;
      
      a {
        color: #079164;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
