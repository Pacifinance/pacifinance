import React, { useState, useContext } from "react";
import { TitleDashboard, Section } from "../styles/MyStyled";
import {
    StyledInfoPage,
    CenteredInfo,
    FAQContainer,
    FAQItem,
    FAQQuestionButton,
    FAQAnswerContainer,
    FAQAnswerContent,
    StandardPageTitle,
    StandardPageTitleGreen,
} from "../styles/MyStyled";
import languages from "../data/languages.json";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";
import styled from "styled-components";

const InfoSection = styled.section`
    margin: 1.5rem 0;

    @media (max-width: 768px) {
        margin: 1rem 0;
    }
`;

const InfoSubtitle = styled.h2`
    font-family:
        "Inter",
        "Segoe UI",
        -apple-system,
        BlinkMacSystemFont,
        "Roboto",
        sans-serif;
    color: ${({ theme }) => theme.buttonBackgroundColor};
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.3;
    text-align: center;
    margin: 1.5rem 0 1rem 0;

    @media (max-width: 768px) {
        margin: 1rem 0 0.75rem 0;
    }
`;

const InfoText = styled.p`
    font-family:
        "Inter",
        "Segoe UI",
        -apple-system,
        BlinkMacSystemFont,
        "Roboto",
        sans-serif;
    color: ${({ theme }) => theme.textColor};
    font-size: clamp(1rem, 2vw, 1.125rem);
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.01em;
    margin-bottom: 0.6rem;
    text-align: left;

    @media (max-width: 768px) {
        margin-bottom: 0.5rem;
        line-height: 1.6;
    }
`;

const FAQAnswer = styled.p`
    font-family:
        "Inter",
        "Segoe UI",
        -apple-system,
        BlinkMacSystemFont,
        "Roboto",
        sans-serif;
    color: ${({ theme }) => theme.textColor};
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.01em;
    margin: 0;
    opacity: 0.9;

    @media (max-width: 768px) {
        line-height: 1.6;
    }
`;

const CoffeeContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1.5rem 0;

    @media (max-width: 768px) {
        margin: 1rem 0;
    }
`;

function Info({ theme }) {
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqData = [
        {
            question: languages[language].info.faq.question1,
            answer: languages[language].info.faq.answer1,
        },
        {
            question: languages[language].info.faq.question2,
            answer: languages[language].info.faq.answer2,
        },
        {
            question: languages[language].info.faq.question3,
            answer: languages[language].info.faq.answer3,
        },
        {
            question: languages[language].info.faq.question4,
            answer: languages[language].info.faq.answer4,
        },
        {
            question: languages[language].info.faq.question5,
            answer: languages[language].info.faq.answer5,
        },
        {
            question: languages[language].info.faq.question6,
            answer: languages[language].info.faq.answer6,
        },
        {
            question: languages[language].info.faq.question7,
            answer: languages[language].info.faq.answer7,
        },
    ];

    return (
        <Section theme={theme}>
            <div className="grid">

                <StyledInfoPage theme={theme}>
                    <StandardPageTitle theme={theme}>
                        {languages[language].info.title}
                    </StandardPageTitle>
                    <StandardPageTitleGreen theme={theme}>
                        {languages[language].info.title2}
                    </StandardPageTitleGreen>

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
                                {
                                    languages[language].info.developers
                                        .description
                                }
                            </InfoText>
                            <InfoText theme={theme}>
                                {
                                    languages[language].info.developers
                                        .description2
                                }
                            </InfoText>
                            <InfoText theme={theme}>
                                {
                                    languages[language].info.developers
                                        .description3
                                }
                            </InfoText>
                            <InfoText theme={theme}>
                                {
                                    languages[language].info.developers
                                        .calltoaction
                                }
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
                            <FAQContainer>
                                {faqData.map((faq, index) => (
                                    <FAQItem key={index} theme={theme}>
                                        <FAQQuestionButton
                                            theme={theme}
                                            $isOpen={openFAQ === index}
                                            onClick={() => toggleFAQ(index)}
                                        >
                                            <span>{faq.question}</span>
                                            <span className="icon">+</span>
                                        </FAQQuestionButton>

                                        <FAQAnswerContainer
                                            $isOpen={openFAQ === index}
                                            theme={theme}
                                        >
                                            <FAQAnswerContent
                                                $isOpen={openFAQ === index}
                                            >
                                                <FAQAnswer theme={theme}>
                                                    {faq.answer}
                                                </FAQAnswer>
                                                {index === 5 &&
                                                    openFAQ === index && (
                                                        <FAQAnswer
                                                            theme={theme}
                                                            style={{
                                                                marginTop:
                                                                    "0.75rem",
                                                            }}
                                                        >
                                                            {
                                                                languages[
                                                                    language
                                                                ].info.faq
                                                                    .answer6CallToAction
                                                            }
                                                        </FAQAnswer>
                                                    )}
                                            </FAQAnswerContent>
                                        </FAQAnswerContainer>
                                    </FAQItem>
                                ))}
                            </FAQContainer>
                        </CenteredInfo>
                    </InfoSection>
                </StyledInfoPage>
            </div>
        </Section>
    );
}

export default Info;