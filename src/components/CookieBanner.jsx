import React, { useState, useEffect, useRef } from 'react';
import { CookieBannerContainer } from '../contexts/MyStyled';

function CookieBanner({ show }) {
  const [acceptedCookies, setAcceptedCookies] = useState(false);
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
      <h4>Questo sito utilizza solo cookie tecnici</h4>
      <br></br>
      <p>
        Pacifinance utilizza solo cookie tecnici <br></br> 
        per facilitare l'accesso e rendere  <br></br>
        l'esperienza dell'utente più piacevole. <br></br>
        <br></br> La tua privacy è la nostra priorità.
        <br></br>
        <br></br>
      </p>
      <button onClick={handleAcceptCookies}>Ok capito</button>
    </CookieBannerContainer>
  );
}

export default CookieBanner;