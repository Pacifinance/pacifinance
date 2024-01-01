import React, { useState, useEffect, useContext, useRef } from 'react';
import { CookieBannerContainer } from '../contexts/MyStyled';
import { LanguageContext } from '../contexts/LanguageContext';
import languages  from '../contexts/languages.json';

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
    <CookieBannerContainer show={show} ref={bannerRef}>
      <h4>{languages[language].cookie.title}</h4>
      <br></br>
      <p dangerouslySetInnerHTML={{ __html: languages[language].cookie.description}}>
      </p>
      <button onClick={handleAcceptCookies}>{languages[language].cookie.acceptButton}</button>
    </CookieBannerContainer>
  );
}

export default CookieBanner;