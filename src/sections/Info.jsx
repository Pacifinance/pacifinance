import React, { useState, useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";
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

// I styled components sono ora nel file ModernInfoStyled.jsx

function Info({ theme }) {
    const { translations } = useContext(LanguageContext);
    useContext(MediaQueryContext);
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    // Gestione più robusta dei testi da translations
    const getTranslation = (path) => {
        const keys = path.split('.');
        let result = translations;
        
        for (const key of keys) {
            if (result && typeof result === 'object' && result[key] !== undefined) {
                result = result[key];
            } else {
                console.warn(`Translation not found for path: ${path}`);
                return path; // Fallback al path originale
            }
        }
        
        return result || path;
    };

    // Dati FAQ con gestione sicura delle traduzioni
    const faqData = Array.from({ length: 7 }, (_, index) => {
        const questionKey = `info.faq.question${index + 1}`;
        const answerKey = `info.faq.answer${index + 1}`;
        const question = getTranslation(questionKey);
        const answer = getTranslation(answerKey);
        
        return {
            question,
            answer
        };
    }).filter(item => !item.question.startsWith('info.faq.question')); // Filtra se la traduzione non è stata trovata

    // Features della piattaforma
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
                        <ModernSupportText>
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
                                    ☕ Support PaciFinance
                                </div>
                                <BuyMeACoffeeWidget showLink={false} />
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
            </ModernInfoContent>
        </ModernInfoContainer>
    );
}

export default Info;