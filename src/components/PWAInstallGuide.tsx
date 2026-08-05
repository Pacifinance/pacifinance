// Belongs in components/ despite reading LanguageContext/ThemeContext: it's a generic
// app-install guide, not tied to one business domain (see CONTRIBUTING.md's
// components/ vs sections/ rule).
import React, { useState, useMemo, useContext } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { BsPhone, BsLaptop, BsApple, BsAndroid2 } from 'react-icons/bs';
import { detectPlatform } from '../utils/platformDetection';

/* ─── Styled components ─── */
const GuideContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const PlatformTabs = styled.div`
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
`;

const PlatformTab = styled.button`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1.5px solid ${p => p.$active
        ? p.theme.buttonBackgroundColor || p.theme.secondaryColor
        : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
    background: ${p => p.$active
        ? (p.theme.mode === 'dark' ? 'rgba(7,145,100,0.2)' : 'rgba(7,145,100,0.08)')
        : 'transparent'};
    color: ${p => p.$active
        ? (p.theme.buttonBackgroundColor || p.theme.secondaryColor)
        : p.theme.textColor};
    font-size: 0.8rem;
    font-weight: ${p => p.$active ? '600' : '500'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
        background: ${p => p.theme.mode === 'dark' ? 'rgba(7,145,100,0.12)' : 'rgba(7,145,100,0.05)'};
    }
`;

const DetectedBadge = styled.span`
    font-size: 0.6rem;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    background: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

const StepsList = styled.ol`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    counter-reset: step-counter;
`;

const StepItem = styled.li`
    counter-increment: step-counter;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
    border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
`;

const StepNumber = styled.span`
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
`;

const StepText = styled.span`
    font-size: 0.82rem;
    line-height: 1.5;
    color: ${p => p.theme.textColor};
    padding-top: 0.15rem;
`;

const Tip = styled.div`
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(7,145,100,0.1)' : 'rgba(7,145,100,0.06)'};
    border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(7,145,100,0.25)' : 'rgba(7,145,100,0.15)'};
    font-size: 0.78rem;
    color: ${p => p.theme.textColor};
    line-height: 1.5;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
`;

/* ─── Component ─── */
export default function PWAInstallGuide({ variant = 'full' }) {
    const { translations } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);
    const detectedPlatform = useMemo(() => detectPlatform(), []);
    const [activePlatform, setActivePlatform] = useState(detectedPlatform);

    const t = translations?.pwaInstall || {};

    const platforms = [
        { id: 'ios', label: 'iPhone / iPad', icon: <BsApple /> },
        { id: 'android', label: 'Android', icon: <BsAndroid2 /> },
        { id: 'desktop', label: 'Desktop', icon: <BsLaptop /> },
    ];

    const getSteps = (platform) => {
        const steps = t?.steps?.[platform];
        if (Array.isArray(steps)) return steps;
        return [];
    };

    const steps = getSteps(activePlatform);

    // Compact variant for Settings page - no tabs, just show detected platform inline
    if (variant === 'compact') {
        return (
            <GuideContainer>
                <PlatformTabs>
                    {platforms.map(p => (
                        <PlatformTab
                            key={p.id}
                            theme={theme}
                            $active={activePlatform === p.id}
                            onClick={() => setActivePlatform(p.id)}
                        >
                            {p.icon} {p.label}
                            {p.id === detectedPlatform && (
                                <DetectedBadge theme={theme}>
                                    {t.detected || '✓'}
                                </DetectedBadge>
                            )}
                        </PlatformTab>
                    ))}
                </PlatformTabs>

                {steps.length > 0 && (
                    <StepsList>
                        {steps.map((step, i) => (
                            <StepItem key={i} theme={theme}>
                                <StepNumber theme={theme}>{i + 1}</StepNumber>
                                <StepText theme={theme}>{step}</StepText>
                            </StepItem>
                        ))}
                    </StepsList>
                )}

                {t.tip && (
                    <Tip theme={theme}>
                        <span>💡</span>
                        <span>{t.tip}</span>
                    </Tip>
                )}
            </GuideContainer>
        );
    }

    // Full variant for Info/FAQ page
    return (
        <GuideContainer>
            <div style={{
                fontSize: '0.85rem',
                color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                lineHeight: 1.5,
                marginBottom: '0.25rem',
            }}>
                {t.intro || ''}
            </div>

            <PlatformTabs>
                {platforms.map(p => (
                    <PlatformTab
                        key={p.id}
                        theme={theme}
                        $active={activePlatform === p.id}
                        onClick={() => setActivePlatform(p.id)}
                    >
                        {p.icon} {p.label}
                        {p.id === detectedPlatform && (
                            <DetectedBadge theme={theme}>
                                {t.detected || '✓'}
                            </DetectedBadge>
                        )}
                    </PlatformTab>
                ))}
            </PlatformTabs>

            {steps.length > 0 && (
                <StepsList>
                    {steps.map((step, i) => (
                        <StepItem key={i} theme={theme}>
                            <StepNumber theme={theme}>{i + 1}</StepNumber>
                            <StepText theme={theme}>{step}</StepText>
                        </StepItem>
                    ))}
                </StepsList>
            )}

            {t.tip && (
                <Tip theme={theme}>
                    <span>💡</span>
                    <span>{t.tip}</span>
                </Tip>
            )}
        </GuideContainer>
    );
}
