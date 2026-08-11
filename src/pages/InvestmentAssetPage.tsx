import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useDemoServices } from '../hooks/useDemoServices';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { addLanguageToPath } from '../utils/i18nRouting';
import { getCurrentBalance } from '../utils/userDataSelectors';
import { isVerifiableAssetKey } from '../constants/investmentSchema';
import SEOHead from '../components/SEOHead';
import Sidebar from '../sections/Sidebar';
import InvestmentHoldingsPanel from '../sections/InvestmentHoldingsPanel';
import type { InvestmentAssetKey, InvestmentHoldingDto } from '../types/api';
import type { PacifinanceTheme } from '../types/theme';
import type enTranslations from '../i18n/locales/en.json';
import { appBackgroundValue } from '../styles/appBackground';

/**
 * One page per verified asset (stocks, ETF, bitcoin, crypto, bonds, funds,
 * commodities) - a single generic route parameterized by assetKey rather
 * than per-asset pages, so it works for any current or future asset type
 * without new code. Renders InvestmentHoldingsPanel in variant="page",
 * reusing 100% of its existing holdings/history/community-price logic - only
 * the outer chrome differs from the modal used elsewhere (Dashboard's list
 * icon, BalanceSection's past-month view).
 *
 * Always the CURRENT month's live portfolio - a past month's holdings stay
 * on the modal inside BalanceSection, where "which month am I editing" is
 * already established by that page's own date picker; a standalone route
 * for a specific past month would need that context re-established via the
 * URL too, which isn't worth it for what's a much rarer edit than the norm.
 */
const PageContainer = styled.div`
  position: relative;
`;

const ContentWrapper = styled.div`
  background: ${(p) => appBackgroundValue(p.theme)};
  min-height: 100vh;
  margin-left: 0;
  margin-top: 80px;
  padding: 1.25rem 1rem 3rem;
  width: 100%;

  @media (min-width: 768px) {
    margin-left: 5.5rem;
    margin-top: 0;
    padding: 2rem 1.5rem 3rem;
    width: calc(100% - 5.5rem);
  }
`;

export default function InvestmentAssetPage() {
  const { theme } = useContext(ThemeContext) as { theme: PacifinanceTheme };
  const { language, translations } = useContext(LanguageContext) as {
    language: string;
    translations: typeof enTranslations;
  };
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useAuth();
  const { investmentService } = useDemoServices();
  const navigate = useLocalizedNavigate();
  const { assetKey } = useParams<{ assetKey: string }>();
  const [searchParams] = useSearchParams();
  const [holdings, setHoldings] = useState<InvestmentHoldingDto[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshHoldings = async () => {
    const all = await investmentService.getHoldings();
    setHoldings(Array.isArray(all) ? all : []);
    setLoaded(true);
  };

  useEffect(() => {
    refreshHoldings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetKey]);

  if (!assetKey || !isVerifiableAssetKey(assetKey)) {
    return <Navigate to={addLanguageToPath('/dashboard', language)} replace />;
  }
  const typedAssetKey = assetKey as InvestmentAssetKey;
  const assetHoldings = holdings.filter((h) => h.assetKey === typedAssetKey);
  const categoryTotal = getCurrentBalance(userData)[typedAssetKey as keyof ReturnType<typeof getCurrentBalance>] || 0;
  const editMode = searchParams.get('mode') === 'edit';

  return (
    <PageContainer>
      <SEOHead
        title={`${translations.assets?.[typedAssetKey] || typedAssetKey} | Pacifinance`}
        noindex
      />
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <ContentWrapper theme={theme}>
        {loaded && (
          <InvestmentHoldingsPanel
            variant="page"
            assetKey={typedAssetKey}
            holdings={assetHoldings}
            onClose={() => navigate('/dashboard')}
            onChanged={refreshHoldings}
            categoryTotal={categoryTotal}
            initialTab={editMode ? 'current' : undefined}
            autoEditSingleHolding={editMode}
          />
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
