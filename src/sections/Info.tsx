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
import { BsShield, BsBarChart, BsPhone, BsGear, BsHeart, BsLightbulb } from 'react-icons/bs';
import PWAInstallGuide from '../components/PWAInstallGuide';

// I styled components sono ora nel file ModernInfoStyled.jsx

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
    const faqData = Array.from({ length: 8 }, (_, index) => {
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
            icon: BsLightbulb,
            title: getTranslation('info.features.insights.title'),
            description: getTranslation('info.features.insights.description'),
            delay: '0.5s'
        },
        {
            icon: BsHeart,
            title: getTranslation('info.features.support.title'),
            description: getTranslation('info.features.support.description'),
            delay: '0.6s'
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

                {/* Sezione Supporta il Progetto */}
                <ModernInfoSection delay="0.4s">
                    <ModernSupportSection>
                        <ModernSupportTitle>
                            {getTranslation('info.developers.title')}
                        </ModernSupportTitle>
                        
                        <ModernSupportText>
                            {getTranslation('info.developers.description')}
                        </ModernSupportText>

                        {/* Roadmap CTA - subtle, between text blocks */}
                        <div style={{
                            position: 'relative',
                            zIndex: 1,
                            margin: '0.5rem 0 1.5rem',
                        }}>
                            <LocalizedLink
                                to="/roadmap"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                                data-umami-event="info-roadmap-link-clicked"
                            >
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '2rem',
                                    background: 'rgba(255, 255, 255, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(4px)',
                                    letterSpacing: '0.02em',
                                }}>
                                    🗺️ {getTranslation('info.roadmapLink')}
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>→</span>
                                </div>
                            </LocalizedLink>
                        </div>

                        {/* Divider */}
                        <div style={{
                            width: '60px',
                            height: '2px',
                            background: 'rgba(255, 255, 255, 0.25)',
                            margin: '0 auto 1.5rem',
                            borderRadius: '1px',
                            position: 'relative',
                            zIndex: 1,
                        }} />

                        <ModernSupportText style={{ marginBottom: '1.5rem' }}>
                            {getTranslation('info.developers.calltoaction')}
                        </ModernSupportText>
                        
                        <a
                            href="https://buymeacoffee.com/pacifinance"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
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
                                    ☕ Support Pacifinance
                                </div>
                            </ModernCoffeeButton>
                        </a>
                    </ModernSupportSection>
                </ModernInfoSection>

                {/* Sezione Informazioni Aggiuntive */}
                <ModernInfoSection delay="0.6s">
                    <ModernSectionCard theme={theme}>
                        <ModernSectionTitle theme={theme}>
                            {getTranslation('info.about.title') || 'Maggiori Informazioni'}
                        </ModernSectionTitle>
                        
                        <ModernSectionText theme={theme}>
                            {getTranslation('info.description4')}
                        </ModernSectionText>
                        <ModernSectionText theme={theme}>
                            {getTranslation('info.description5')}
                        </ModernSectionText>
                        <ModernSectionText theme={theme}>
                            {getTranslation('info.developers.description2')}
                        </ModernSectionText>
                        <ModernSectionText theme={theme}>
                            {getTranslation('info.developers.description3')}
                        </ModernSectionText>
                    </ModernSectionCard>
                </ModernInfoSection>

                {/* Sezione FAQ */}
                <ModernInfoSection delay="0.8s">
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
                                            {index === 5 && openFAQ === index && (
                                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(7, 145, 100, 0.2)' }}>
                                                    {getTranslation('info.faq.answer6CallToAction')}
                                                </div>
                                            )}
                                        </ModernFAQAnswerContent>
                                    </ModernFAQAnswer>
                                </ModernFAQItem>
                            ))}
                        </ModernFAQContainer>
                    </ModernSectionCard>
                </ModernInfoSection>

                {/* Sezione Installa come App (PWA) */}
                <ModernInfoSection delay="1.0s">
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