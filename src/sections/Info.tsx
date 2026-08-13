import React, { useState, useContext } from "react";
import { APP_VERSION } from '../data/appVersion';
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import { LocalizedLink } from "../components/LocalizedLink";
import {
    ModernInfoContainer,
    ModernInfoContent,
    ModernInfoHeader,
    ModernInfoTitle,
    ModernInfoSubtitle,
    ModernInfoDescription,
    ModernInfoSection,
    ModernSectionCard,
    ModernSectionTitle,
    ModernSectionText,
    ModernSupportSection,
    ModernSupportTitle,
    ModernSupportText,
    ModernCoffeeButton,
    ModernFAQContainer,
    ModernFAQItem,
    ModernFAQQuestion,
    ModernFAQAnswer,
    ModernFAQAnswerContent,
    ModernFeaturesGrid,
    ModernFeatureCard,
    ModernFeatureIcon,
    ModernFeatureTitle,
    ModernFeatureText,
} from "../styles/ModernInfoStyled";
import { BsShield, BsBarChart, BsPhone, BsGear, BsGithub, BsGraphUpArrow } from 'react-icons/bs';
import { MdAccountBalance } from 'react-icons/md';
import { FaBrain, FaRobot } from 'react-icons/fa';
import { GITHUB_REPO_URL, GITHUB_VISION_URL } from '../data/externalLinks';
import PWAInstallGuide from '../components/PWAInstallGuide';

// The styled components now live in ModernInfoStyled.jsx

// Small pill-shaped CTA link, reused for the roadmap/GitHub links.
// `light` picks the white-on-transparent style that reads well against
// ModernSupportSection's green gradient; without it, it uses theme-aware
// colors so it also works on the plain (non-green) section cards.
const PillLink = ({ theme, light = false, href, to, children, umamiEvent }) => {
    const style = light
        ? {
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
        }
        : {
            background: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
            color: theme.textColor,
        };
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1.25rem',
        borderRadius: '2rem',
        fontWeight: 500,
        fontSize: '0.85rem',
        transition: 'all 0.3s ease',
        letterSpacing: '0.02em',
        textDecoration: 'none',
        ...style,
    };
    if (to) {
        return (
            <LocalizedLink to={to} style={{ textDecoration: 'none', display: 'inline-block' }} data-umami-event={umamiEvent}>
                <div style={baseStyle}>{children}</div>
            </LocalizedLink>
        );
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }} data-umami-event={umamiEvent}>
            <div style={baseStyle}>{children}</div>
        </a>
    );
};

function Info({ theme }) {
    const { translations } = useContext(LanguageContext);
    useContext(MediaQueryContext);
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    // More robust handling of text from translations
    const getTranslation = (path) => {
        const keys = path.split('.');
        let result = translations;

        for (const key of keys) {
            if (result && typeof result === 'object' && result[key] !== undefined) {
                result = result[key];
            } else {
                console.warn(`Translation not found for path: ${path}`);
                return path; // Fall back to the original path
            }
        }

        return result || path;
    };

    // FAQ data with safe translation handling
    const faqData = Array.from({ length: 7 }, (_, index) => {
        const questionKey = `info.faq.question${index + 1}`;
        const answerKey = `info.faq.answer${index + 1}`;
        const question = getTranslation(questionKey);
        const answer = getTranslation(answerKey);

        return {
            question,
            answer
        };
    }).filter(item => !item.question.startsWith('info.faq.question')); // Filter out if the translation wasn't found

    // Platform features
    const features = [
        {
            icon: BsShield,
            title: getTranslation('info.features.security.title'),
            description: getTranslation('info.features.security.description'),
            delay: '0.1s'
        },
        {
            icon: BsBarChart,
            title: getTranslation('info.features.analytics.title'),
            description: getTranslation('info.features.analytics.description'),
            delay: '0.2s'
        },
        {
            icon: BsPhone,
            title: getTranslation('info.features.responsive.title'),
            description: getTranslation('info.features.responsive.description'),
            delay: '0.3s'
        },
        {
            icon: BsGear,
            title: getTranslation('info.features.customization.title'),
            description: getTranslation('info.features.customization.description'),
            delay: '0.4s'
        },
        {
            icon: BsGraphUpArrow,
            title: getTranslation('info.features.insights.title'),
            description: getTranslation('info.features.insights.description'),
            delay: '0.5s'
        },
        {
            icon: BsGithub,
            title: getTranslation('info.features.openSource.title'),
            description: getTranslation('info.features.openSource.description'),
            delay: '0.6s'
        }
    ];

    // What's next — condensed from docs/PRODUCT_VISION.md, kept honest and
    // non-committal ("direction, not a promise" — see that doc's own framing).
    const visionItems = [
        {
            icon: MdAccountBalance,
            title: getTranslation('info.vision.netWorth.title'),
            description: getTranslation('info.vision.netWorth.description'),
            delay: '0.1s'
        },
        {
            icon: BsGraphUpArrow,
            title: getTranslation('info.vision.simulations.title'),
            description: getTranslation('info.vision.simulations.description'),
            delay: '0.2s'
        },
        {
            icon: FaBrain,
            title: getTranslation('info.vision.explainable.title'),
            description: getTranslation('info.vision.explainable.description'),
            delay: '0.3s'
        },
        {
            icon: FaRobot,
            title: getTranslation('info.vision.ai.title'),
            description: getTranslation('info.vision.ai.description'),
            delay: '0.4s'
        }
    ];

    return (
        <ModernInfoContainer theme={theme}>
            <ModernInfoContent>
                {/* Header Principal */}
                <ModernInfoHeader>
                    <ModernInfoTitle>
                        {getTranslation('info.title')}
                    </ModernInfoTitle>
                    <ModernInfoSubtitle theme={theme}>
                        {getTranslation('info.title2')}
                    </ModernInfoSubtitle>
                    <ModernInfoDescription theme={theme}>
                        {getTranslation('info.description')}
                    </ModernInfoDescription>
                </ModernInfoHeader>

                {/* Sezione Caratteristiche */}
                <ModernInfoSection delay="0.2s">
                    <ModernSectionCard theme={theme}>
                        <ModernSectionTitle theme={theme}>
                            {getTranslation('info.features.title') || 'Caratteristiche Principali'}
                        </ModernSectionTitle>

                        <ModernSectionText theme={theme}>
                            {getTranslation('info.description2')}
                        </ModernSectionText>
                        <ModernSectionText theme={theme}>
                            {getTranslation('info.description3')}
                        </ModernSectionText>

                        <ModernFeaturesGrid>
                            {features.map((feature, index) => (
                                <ModernFeatureCard
                                    key={index}
                                    theme={theme}
                                    delay={feature.delay}
                                >
                                    <ModernFeatureIcon>
                                        <feature.icon />
                                    </ModernFeatureIcon>
                                    <ModernFeatureTitle theme={theme}>
                                        {feature.title}
                                    </ModernFeatureTitle>
                                    <ModernFeatureText theme={theme}>
                                        {feature.description}
                                    </ModernFeatureText>
                                </ModernFeatureCard>
                            ))}
                        </ModernFeaturesGrid>
                    </ModernSectionCard>
                </ModernInfoSection>

                {/* Sezione Visione: dove sta andando il progetto */}
                <ModernInfoSection delay="0.3s">
                    <ModernSectionCard theme={theme}>
                        <ModernSectionTitle theme={theme}>
                            {getTranslation('info.vision.title')}
                        </ModernSectionTitle>

                        <ModernSectionText theme={theme}>
                            {getTranslation('info.vision.intro')}
                        </ModernSectionText>

                        <ModernFeaturesGrid>
                            {visionItems.map((item, index) => (
                                <ModernFeatureCard
                                    key={index}
                                    theme={theme}
                                    delay={item.delay}
                                >
                                    <ModernFeatureIcon>
                                        <item.icon />
                                    </ModernFeatureIcon>
                                    <ModernFeatureTitle theme={theme}>
                                        {item.title}
                                    </ModernFeatureTitle>
                                    <ModernFeatureText theme={theme}>
                                        {item.description}
                                    </ModernFeatureText>
                                </ModernFeatureCard>
                            ))}
                        </ModernFeaturesGrid>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
                            <PillLink theme={theme} to="/roadmap" umamiEvent="info-roadmap-link-clicked">
                                🗺️ {getTranslation('info.roadmapLink')}
                            </PillLink>
                            <PillLink theme={theme} href={GITHUB_VISION_URL} umamiEvent="info-vision-link-clicked">
                                📖 {getTranslation('info.vision.readMore')}
                            </PillLink>
                        </div>
                    </ModernSectionCard>
                </ModernInfoSection>

                {/* Sezione Supporta il Progetto */}
                <ModernInfoSection delay="0.4s">
                    <ModernSupportSection>
                        <ModernSupportTitle>
                            {getTranslation('info.developers.title')}
                        </ModernSupportTitle>

                        <ModernSupportText>
                            {getTranslation('info.developers.description')}
                        </ModernSupportText>

                        <ModernSupportText style={{ marginBottom: '1.5rem' }}>
                            {getTranslation('info.developers.calltoaction')}
                        </ModernSupportText>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <a
                                href="https://buymeacoffee.com/pacifinance"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                                data-umami-event="info-coffee-link-clicked"
                            >
                                <ModernCoffeeButton>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}>
                                        ☕ {getTranslation('info.developers.coffeeButton')}
                                    </div>
                                </ModernCoffeeButton>
                            </a>
                            <PillLink theme={theme} light href={GITHUB_REPO_URL} umamiEvent="info-github-link-clicked">
                                ⭐ {getTranslation('info.developers.githubButton')}
                            </PillLink>
                        </div>
                    </ModernSupportSection>
                </ModernInfoSection>

                {/* Sezione FAQ */}
                <ModernInfoSection delay="0.6s">
                    <ModernSectionCard theme={theme}>
                        <ModernSectionTitle theme={theme}>
                            {getTranslation('info.faq.title')}
                        </ModernSectionTitle>

                        <ModernFAQContainer>
                            {faqData.map((faq, index) => (
                                <ModernFAQItem key={index} theme={theme}>
                                    <ModernFAQQuestion
                                        theme={theme}
                                        $isOpen={openFAQ === index}
                                        onClick={() => toggleFAQ(index)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="icon">+</span>
                                    </ModernFAQQuestion>

                                    <ModernFAQAnswer $isOpen={openFAQ === index}>
                                        <ModernFAQAnswerContent
                                            $isOpen={openFAQ === index}
                                            theme={theme}
                                        >
                                            {faq.answer}
                                        </ModernFAQAnswerContent>
                                    </ModernFAQAnswer>
                                </ModernFAQItem>
                            ))}
                        </ModernFAQContainer>
                    </ModernSectionCard>
                </ModernInfoSection>

                {/* Sezione Installa come App (PWA) */}
                <ModernInfoSection delay="0.8s">
                    <ModernSectionCard theme={theme}>
                        <ModernSectionTitle theme={theme}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BsPhone style={{ color: theme.secondaryColor }} />
                                {getTranslation('pwaInstall.title')}
                            </span>
                        </ModernSectionTitle>
                        <ModernSectionText theme={theme} style={{ marginBottom: '0.5rem' }}>
                            {getTranslation('pwaInstall.subtitle')}
                        </ModernSectionText>
                        <PWAInstallGuide variant="full" />
                    </ModernSectionCard>
                </ModernInfoSection>
            </ModernInfoContent>
            <div style={{
                textAlign: 'center',
                padding: '1.25rem 1rem 2rem',
                borderTop: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                opacity: 0.4,
                color: theme.mode === 'dark' ? '#d1d5db' : '#374151',
                userSelect: 'none',
            }}>
                v{APP_VERSION}
            </div>
        </ModernInfoContainer>
    );
}

export default Info;
