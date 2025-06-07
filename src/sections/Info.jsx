import React, { useState, useEffect, useContext } from 'react';
import { TitleDashboard, Section } from '../styles/MyStyled';
import { StyledInfoPage, CenteredInfo, InfoTitle } from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';

function Info({ theme }) {
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    

    return (
        <Section theme={theme}>
            <div className="grid"> 
                    <TitleDashboard theme={theme}>{languages[language].info.title}</TitleDashboard>
                    <StyledInfoPage theme={theme}>
                        <InfoTitle theme={theme}>{languages[language].info.title2} </InfoTitle>
                        <CenteredInfo theme={theme}>
                                <p className="text-l">{languages[language].info.description}</p>
                                <p className="text-l">{languages[language].info.description2}</p>
                                <p className= "text-l">{languages[language].info.description3}</p>
                                <p className="text-l">{languages[language].info.description4}</p>
                                <p className="text-l">{languages[language].info.description5}</p>
                        </CenteredInfo>
                        <InfoTitle theme={theme}>{languages[language].info.developers.title} </InfoTitle>
                        <CenteredInfo theme={theme}>
                            <p className="m-0.5 text-l">{languages[language].info.developers.description}</p>
                            <p className="m-0.5 text-l">{languages[language].info.developers.description2}</p>
                            <p className="m-0.5 text-l">{languages[language].info.developers.description3}</p>
                            <p className="m-0.5 text-l">{languages[language].info.developers.calltoaction}</p>
                            <a href="https://buymeacoffee.com/pacifinance" target="_blank" rel="noopener noreferrer">
                                <button className="bg-white text-paciGreen font-bold shadow rounded-xl p-4 mt-4 mb-4">{languages[language].info.calltoaction}</button>
                            </a>
                        </CenteredInfo>
                        <InfoTitle theme={theme}>{languages[language].info.faq.title} </InfoTitle >
                        <CenteredInfo theme={theme}>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question1}</h2>
                                <p className="mt-4 mb-10">{languages[language].info.faq.answer1}</p>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question2}</h2>
                                <p className="mt-4 mb-10">{languages[language].info.faq.answer2}</p>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question3}</h2>
                                <p className="mt-4 mb-10">{languages[language].info.faq.answer3}</p>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question4}</h2>
                                <p className="mt-4 mb-10">{languages[language].info.faq.answer4}</p>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question5}</h2>
                                <p className="mt-4">{languages[language].info.faq.answer5}</p>
                                <h2 className="text-2xl font-bold">{languages[language].info.faq.question6}</h2>
                                <p className="mt-4 mb-10">{languages[language].info.faq.answer6}</p>
                                <p className="mt-1 mb-10">{languages[language].info.faq.answer6CallToAction}</p>
                                <p className="text-2xl font-bold">{languages[language].info.faq.question7}</p>
                                <p className="mt-4">{languages[language].info.faq.answer7}</p>
                        </CenteredInfo>
                    </StyledInfoPage>
            </div>
        </Section>
    )
}
  
export default Info;