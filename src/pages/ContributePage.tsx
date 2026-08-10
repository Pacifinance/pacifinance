import React, { useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { useAuth } from '../hooks/useAuth';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import Sidebar from '../sections/Sidebar';
import SEOHead from '../components/SEOHead';
import { LocalizedLink } from '../components/LocalizedLink';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import FeedbackForm from '../components/FeedbackForm';
import { GITHUB_REPO_URL, GITHUB_ISSUES_URL } from '../data/externalLinks';
import BugReportIcon from '@mui/icons-material/BugReport';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CodeIcon from '@mui/icons-material/Code';

const PageWrapper = styled.div<{ $withTopOffset: boolean }>`
  min-height: 100vh;
  background: ${p => p.theme.mode === 'dark'
    ? `linear-gradient(135deg, ${p.theme.backgroundColor} 0%, #0a0a1a 100%)`
    : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`};
  padding: 2rem;
  padding-top: ${p => p.$withTopOffset ? 'calc(2rem + 72px)' : '2rem'};

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: ${p => p.$withTopOffset ? 'calc(1rem + 72px)' : '1rem'};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  h1 {
    font-size: 2.4rem;
    font-weight: 800;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.1rem;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)'};
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    h1 { font-size: 1.8rem; }
    p { font-size: 0.95rem; }
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'};
  border-radius: 16px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  padding: 1.5rem;

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: ${p => p.theme.secondaryColor};
    color: white;
    margin-bottom: 0.75rem;
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.88rem;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'};
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  a, button.link-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    font-size: 0.85rem;
    color: ${p => p.theme.secondaryColor};
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    &:hover { text-decoration: underline; }
  }
`;

const RoadmapLinkRow = styled.div`
  text-align: center;

  a {
    color: ${p => p.theme.secondaryColor};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export default function ContributePage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { isAuthenticated, userData, handleSetIsUpdated, handleSetIsAuthenticated } = useAuth();
  const navigate = useLocalizedNavigate();
  const { mode } = theme;
  const t = translations.contribute;

  const content = (
    <PageWrapper theme={theme} $withTopOffset={!isAuthenticated || isMobileScreen}>
      <SEOHead
        title={`${t.title} - Pacifinance`}
        description={t.subtitle}
        canonical="/contribute"
        language={language}
      />

      <PageHeader theme={theme}>
        <h1>🤝 {t.title}</h1>
        <p>{t.subtitle}</p>
      </PageHeader>

      <SectionsGrid>
        <SectionCard theme={theme}>
          <span className="icon"><BugReportIcon fontSize="small" /></span>
          <h3>{t.feedback.title}</h3>
          <p>{t.feedback.description}</p>
          {isAuthenticated ? (
            <FeedbackForm />
          ) : (
            <>
              <p style={{ marginBottom: '0.5rem' }}>{t.feedback.loginPrompt}</p>
              <button type="button" className="link-button" onClick={() => navigate('/auth')}>
                {t.feedback.signInCta}
              </button>
              <div style={{ marginTop: '0.5rem' }}>
                <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
                  {t.feedback.githubFallback}
                </a>
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard theme={theme}>
          <span className="icon"><FavoriteIcon fontSize="small" /></span>
          <h3>{t.support.title}</h3>
          <p>{t.support.description}</p>
          <BuyMeACoffeeWidget />
        </SectionCard>

        <SectionCard theme={theme}>
          <span className="icon"><CodeIcon fontSize="small" /></span>
          <h3>{t.code.title}</h3>
          <p>{t.code.description}</p>
          <a href={`${GITHUB_REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer" data-umami-event="contribute-code-click">
            {t.code.cta}
          </a>
        </SectionCard>
      </SectionsGrid>

      <RoadmapLinkRow theme={theme}>
        <LocalizedLink to="/roadmap">{t.roadmapLink}</LocalizedLink>
      </RoadmapLinkRow>
    </PageWrapper>
  );

  if (isAuthenticated) {
    return (
      <>
        <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
        {content}
      </>
    );
  }

  return (
    <div className="w-full flex overflow-auto min-h-screen flex-col" style={{ backgroundColor: theme.backgroundColor }}>
      <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage} />
      <main className="flex-1">{content}</main>
      <LandingFooter theme={theme} />
    </div>
  );
}
