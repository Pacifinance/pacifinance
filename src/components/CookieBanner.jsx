import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';
import { slideIn } from '../styles/MyStyled';
import { themes } from '../styles/Themes';
import { LanguageContext } from '../contexts/LanguageContext';
import languages  from '../data/languages.json';

function CookieBanner({ show }) {
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  const { language } = useContext(LanguageContext);
  const bannerRef = useRef(null);

  const handleAcceptCookies = () => {
    // Add animation class (doesn't work the animation to hide the banner)
    bannerRef.current.style.animation = `
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(100%);
            opacity: 0;
        } 
        1s ease-out forwards
    `;

    //set cookie expiration to a date in the future 
    document.cookie = 'cookiesAccepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    // Set the state to true to hide the banner after the animation ends
    setTimeout(() => {
        setAcceptedCookies(true);
    }, 250); // Time of the animation
  };

  if (acceptedCookies) return null;

  return (
    // <div className={`fixed flex flex-col justify-center items-center left-11 bottom-10 rounded-lg bg-white text-black text-center p-2 shadow-md z-50 ${show ? 'bottom-10' : 'bottom-20'} transition-all duration-1000 ease-in-out`}>
    <CookieBannerContainer ref={bannerRef} show={show}>
      <h4 className="text-base font-bold text-paciGreen m-1 p-2">{languages[language].cookie.title}</h4>
      <p className="text-left mb-4" dangerouslySetInnerHTML={{ __html: languages[language].cookie.description}}></p>
      <p className="mb-6" dangerouslySetInnerHTML={{ __html: languages[language].cookie.catchyPhrase}}></p>
      <button data-umami-event="cookieButton" className="bg-paciGreen text-white mb-3 p-2 rounded"onClick={handleAcceptCookies}>{languages[language].cookie.acceptButton}</button>
    </CookieBannerContainer>
    // </div>
  );
}

export default CookieBanner;




const CookieBannerContainer = styled.div`
  position: fixed;
  left: 5.1vw;
  width: auto;
  bottom: 10vh;
  border-radius: 0.8em;
  background-color: white;
  color: black;
  text-align: center; 
  padding: 0.6em;
  box-shadow: 0em -0.1em 0.5em rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 1s ease forwards;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  height: auto;

  &.accepted {
    bottom: -5em;
  }

  &.show {
    bottom: 10%;
  }

  button.reject {
    background-color: ${themes.dark.backgroundColor};
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    
  }
`;


