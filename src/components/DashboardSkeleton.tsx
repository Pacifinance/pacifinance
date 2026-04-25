/**
 * DashboardSkeleton Component
 * 
 * Shows skeleton placeholders during dashboard data loading.
 * Replicates the layout of the real dashboard for seamless transition.
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonBase = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)'};
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${props => props.$radius || '0.5rem'};
`;

const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '1rem'};
  margin-bottom: ${props => props.$mb || '0'};
`;

const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.$size || '50px'};
  height: ${props => props.$size || '50px'};
  border-radius: 50%;
  flex-shrink: 0;
`;

// Container for entire skeleton dashboard
const SkeletonContainer = styled.div`
  padding: 2rem;
  max-width: none;
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

// Header skeleton
const HeaderSkeleton = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.03)'
    : 'rgba(0,0,0,0.02)'};
  border-radius: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
  }
`;

const MetricCardsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 0.35rem;
  }
`;

const MetricCardSkeleton = styled.div`
  flex: 1;
  padding: 1rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(0,0,0,0.03)'};
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    border-radius: 0.75rem;
    gap: 0.3rem;
  }
`;

// Asset card skeleton
const AssetCardsSkeleton = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const AssetCardSkeleton = styled.div`
  flex: 1;
  min-width: 200px;
  padding: 1.5rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(0,0,0,0.03)'};
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    flex: 0 0 calc(50% - 0.25rem);
    min-width: 0;
    padding: 0.8rem;
    gap: 0.5rem;
  }
`;

// Chart skeleton
const ChartSkeleton = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.03)'
    : 'rgba(0,0,0,0.02)'};
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 1rem;
  }
`;

const ColumnsLayout = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const SectionLabel = styled.div`
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const DashboardSkeleton = ({ theme }) => {
  return (
    <SkeletonContainer>
      {/* Dashboard Title */}
      <SkeletonRect theme={theme} $width="200px" $height="2rem" $mb="1.5rem" $radius="0.5rem" />

      {/* Header: Balance Overview */}
      <HeaderSkeleton theme={theme}>
        {/* Title label */}
        <SkeletonRect theme={theme} $width="180px" $height="1rem" $mb="0.75rem" />
        {/* Balance value */}
        <SkeletonRect theme={theme} $width="250px" $height="2.5rem" $mb="0.5rem" $radius="0.5rem" />
        {/* Subtitle */}
        <SkeletonRect theme={theme} $width="200px" $height="0.8rem" $mb="1rem" />

        {/* Metric Cards */}
        <MetricCardsRow>
          {[1, 2, 3].map((i) => (
            <MetricCardSkeleton key={i} theme={theme}>
              <SkeletonCircle theme={theme} $size="28px" />
              <SkeletonRect theme={theme} $width="80%" $height="1.2rem" />
              <SkeletonRect theme={theme} $width="60%" $height="0.7rem" />
              <SkeletonRect theme={theme} $width="40%" $height="0.6rem" />
            </MetricCardSkeleton>
          ))}
        </MetricCardsRow>
      </HeaderSkeleton>

      {/* Two columns: Assets + Investments */}
      <ColumnsLayout>
        {/* Left: Liquidity */}
        <Column>
          <div>
            <SectionLabel>
              <SkeletonRect theme={theme} $width="200px" $height="1.3rem" $mb="1rem" />
            </SectionLabel>
            <AssetCardsSkeleton>
              {[1, 2, 3].map((i) => (
                <AssetCardSkeleton key={i} theme={theme}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SkeletonCircle theme={theme} $size="32px" />
                    <SkeletonCircle theme={theme} $size="24px" />
                  </div>
                  <SkeletonRect theme={theme} $width="70%" $height="0.9rem" />
                  <SkeletonRect theme={theme} $width="100%" $height="1.5rem" />
                  <SkeletonRect theme={theme} $width="50%" $height="0.7rem" />
                  <SkeletonRect theme={theme} $width="100%" $height="4px" $radius="2px" />
                </AssetCardSkeleton>
              ))}
            </AssetCardsSkeleton>
          </div>
        </Column>

        {/* Right: Investments */}
        <Column>
          <div>
            <SectionLabel>
              <SkeletonRect theme={theme} $width="220px" $height="1.3rem" $mb="1rem" />
            </SectionLabel>
            <AssetCardsSkeleton>
              {[1, 2, 3, 4].map((i) => (
                <AssetCardSkeleton key={i} theme={theme}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SkeletonCircle theme={theme} $size="32px" />
                    <SkeletonRect theme={theme} $width="60px" $height="0.7rem" />
                  </div>
                  <SkeletonRect theme={theme} $width="60%" $height="0.9rem" />
                  <SkeletonRect theme={theme} $width="100%" $height="1.5rem" />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <SkeletonRect theme={theme} $width="45%" $height="0.7rem" />
                    <SkeletonRect theme={theme} $width="45%" $height="0.7rem" />
                  </div>
                  <SkeletonRect theme={theme} $width="100%" $height="2rem" $radius="0.5rem" />
                </AssetCardSkeleton>
              ))}
            </AssetCardsSkeleton>
          </div>
        </Column>
      </ColumnsLayout>

      {/* Income/Expense Section */}
      <div style={{ marginBottom: '2rem' }}>
        <SkeletonRect theme={theme} $width="200px" $height="1.5rem" $mb="1.5rem" style={{ margin: '0 auto' }} />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[1, 2, 3].map((i) => (
            <ChartSkeleton key={i} theme={theme} style={{ flex: 1, minWidth: '150px' }}>
              <SkeletonCircle theme={theme} $size="40px" />
              <SkeletonRect theme={theme} $width="80%" $height="1rem" />
              <SkeletonRect theme={theme} $width="60%" $height="1.5rem" />
              <SkeletonRect theme={theme} $width="50%" $height="0.7rem" />
            </ChartSkeleton>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '2rem' }}>
        <SkeletonRect theme={theme} $width="220px" $height="1.5rem" $mb="1.5rem" style={{ margin: '0 auto' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <ChartSkeleton key={i} theme={theme}>
              <SkeletonRect theme={theme} $width="160px" $height="1rem" $mb="0.5rem" />
              <SkeletonCircle theme={theme} $size="160px" />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map((j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <SkeletonRect theme={theme} $width="12px" $height="12px" $radius="3px" />
                    <SkeletonRect theme={theme} $width="60%" $height="0.7rem" />
                    <SkeletonRect theme={theme} $width="25%" $height="0.7rem" />
                  </div>
                ))}
              </div>
            </ChartSkeleton>
          ))}
        </div>
      </div>
    </SkeletonContainer>
  );
};

export default DashboardSkeleton;
