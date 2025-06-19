import React, { useState, useEffect, useContext } from "react";
import { TitleDashboard, Section } from "../styles/MyStyled";
import { StyledInfoPage, CenteredInfo, InfoTitle } from "../styles/MyStyled";
import InfoIcon from "@mui/icons-material/Info";
import languages from "../data/languages.json";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";
import styled from 'styled-components';

const InfoSection = styled.section`
  margin: 3rem 0;

  @media (max-width: 768px) {
    margin: 2rem 0;
  }
`;

const InfoSubtitle = styled.h2`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  color: ${({ theme }) => theme.buttonBackgroundColor};
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  text-align: center;
  margin: 2.5rem 0 1.5rem 0;

  @media (max-width: 768px) {
    margin: 2rem 0 1rem 0;
  }
`;

const InfoText = styled.p`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  color: ${({ theme }) => theme.textColor};
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: 0.01em;
  margin-bottom: 1.25rem;
  text-align: left;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
`;

const FAQQuestion = styled.h3`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  color: ${({ theme }) => theme.textColor};
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.4;
  margin: 2rem 0 0.75rem 0;
  text-align: left;

  @media (max-width: 768px) {
    margin: 1.5rem 0 0.5rem 0;
  }
`;

const FAQAnswer = styled.p`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  color: ${({ theme }) => theme.textColor};
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: 0.01em;
  margin-bottom: 1.5rem;
  text-align: left;

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    line-height: 1.6;
  }
`;

const CoffeeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;

  @media (max-width: 768px) {
    margin: 1.5rem 0;
  }
`;

function Info({ theme }) {
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);

    return (
        <Section theme={theme}>
            <div className="grid">
                <TitleDashboard
                    theme={theme}
                    style={{
                        marginLeft: isMobileScreen ? "5%" : "2rem",
                        textAlign: isMobileScreen ? "center" : "left"
                    }}
                >
                    {languages[language].info.title}
                </TitleDashboard>

                <StyledInfoPage theme={theme}>
                    <InfoTitle theme={theme}>
                        {languages[language].info.title2}
                    </InfoTitle>

                    <CenteredInfo theme={theme}>
                        <InfoText theme={theme}>
                            {languages[language].info.description}
                        </InfoText>
                        <InfoText theme={theme}>
                            {languages[language].info.description2}
                        </InfoText>
                        <InfoText theme={theme}>
                            {languages[language].info.description3}
                        </InfoText>
                        <InfoText theme={theme}>
                            {languages[language].info.description4}
                        </InfoText>
                        <InfoText theme={theme}>
                            {languages[language].info.description5}
                        </InfoText>
                    </CenteredInfo>

                    <InfoSection>
                        <InfoSubtitle theme={theme}>
                            {languages[language].info.developers.title}
                        </InfoSubtitle>

                        <CenteredInfo theme={theme}>
                            <InfoText theme={theme}>
                                {languages[language].info.developers.description}
                            </InfoText>
                            <InfoText theme={theme}>
                                {languages[language].info.developers.description2}
                            </InfoText>
                            <InfoText theme={theme}>
                                {languages[language].info.developers.description3}
                            </InfoText>
                            <InfoText theme={theme}>
                                {languages[language].info.developers.calltoaction}
                            </InfoText>

                            <CoffeeContainer>
                                <a
                                    href="https://buymeacoffee.com/pacifinance"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <BuyMeACoffeeWidget showLink={true} />
                                </a>
                            </CoffeeContainer>
                        </CenteredInfo>
                    </InfoSection>

                    <InfoSection>
                        <InfoSubtitle theme={theme}>
                            {languages[language].info.faq.title}
                        </InfoSubtitle>

                        <CenteredInfo theme={theme}>
                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question1}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer1}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question2}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer2}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question3}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer3}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question4}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer4}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question5}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer5}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question6}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer6}
                            </FAQAnswer>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer6CallToAction}
                            </FAQAnswer>

                            <FAQQuestion theme={theme}>
                                {languages[language].info.faq.question7}
                            </FAQQuestion>
                            <FAQAnswer theme={theme}>
                                {languages[language].info.faq.answer7}
                            </FAQAnswer>
                        </CenteredInfo>
                    </InfoSection>
                </StyledInfoPage>
            </div>
        </Section>
    );
}

export default Info;