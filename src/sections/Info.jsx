
import React, { useState, useEffect, useContext } from 'react';
import { TitleDashboard, Section } from '../styles/MyStyled';
import { StyledInfoPage, CenteredInfo, InfoTitle } from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";

function Info({ theme }) {
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    

    return (
        <Section theme={theme}>
            <div className="grid"> 
                <TitleDashboard theme={theme} style={isMobileScreen ? { fontSize: '1.2rem', marginLeft: '5%', marginBottom: '1rem' } : {}}>
                    {languages[language].info.title}
                </TitleDashboard>
                <StyledInfoPage theme={theme} style={isMobileScreen ? { padding: '1rem', height: 'auto' } : {}}>
                    <InfoTitle theme={theme} style={isMobileScreen ? { fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' } : {}}>
                        {languages[language].info.title2}
                    </InfoTitle>
                    <CenteredInfo theme={theme} style={isMobileScreen ? { 
                        marginLeft: '1rem', 
                        marginRight: '1rem',
                        gap: '0.3rem'
                    } : {}}>
                        <p className="text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.description}
                        </p>
                        <p className="text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.description2}
                        </p>
                        <p className="text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.description3}
                        </p>
                        <p className="text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.description4}
                        </p>
                        <p className="text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.description5}
                        </p>
                    </CenteredInfo>
                    
                    <InfoTitle theme={theme} style={isMobileScreen ? { fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem' } : {}}>
                        {languages[language].info.developers.title}
                    </InfoTitle>
                    <CenteredInfo theme={theme} style={isMobileScreen ? { 
                        marginLeft: '1rem', 
                        marginRight: '1rem',
                        gap: '0.3rem'
                    } : {}}>
                        <p className="m-0.5 text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.developers.description}
                        </p>
                        <p className="m-0.5 text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.developers.description2}
                        </p>
                        <p className="m-0.5 text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.developers.description3}
                        </p>
                        <p className="m-0.5 text-l" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.developers.calltoaction}
                        </p>
                        <div style={isMobileScreen ? { width: '100%', display: 'flex', justifyContent: 'center', margin: '1rem 0' } : {}}>
                            <a href="https://buymeacoffee.com/pacifinance" target="_blank" rel="noopener noreferrer">
                                <BuyMeACoffeeWidget showLink={true} />
                            </a>
                        </div>
                    </CenteredInfo>
                    
                    <InfoTitle theme={theme} style={isMobileScreen ? { fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem' } : {}}>
                        {languages[language].info.faq.title}
                    </InfoTitle>
                    <CenteredInfo theme={theme} style={isMobileScreen ? { 
                        marginLeft: '1rem', 
                        marginRight: '1rem',
                        gap: '0.3rem'
                    } : {}}>
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question1}
                        </h2>
                        <p className="mt-4 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer1}
                        </p>
                        
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question2}
                        </h2>
                        <p className="mt-4 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer2}
                        </p>
                        
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question3}
                        </h2>
                        <p className="mt-4 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer3}
                        </p>
                        
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question4}
                        </h2>
                        <p className="mt-4 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer4}
                        </p>
                        
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question5}
                        </h2>
                        <p className="mt-4" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer5}
                        </p>
                        
                        <h2 className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question6}
                        </h2>
                        <p className="mt-4 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '0.8rem' } : {}}>
                            {languages[language].info.faq.answer6}
                        </p>
                        <p className="mt-1 mb-10" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.2rem', marginBottom: '1rem' } : {}}>
                            {languages[language].info.faq.answer6CallToAction}
                        </p>
                        
                        <p className="text-2xl font-bold" style={isMobileScreen ? { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' } : {}}>
                            {languages[language].info.faq.question7}
                        </p>
                        <p className="mt-4" style={isMobileScreen ? { fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', marginBottom: '2rem' } : {}}>
                            {languages[language].info.faq.answer7}
                        </p>
                    </CenteredInfo>
                </StyledInfoPage>
            </div>
        </Section>
    )
}
  
export default Info;
