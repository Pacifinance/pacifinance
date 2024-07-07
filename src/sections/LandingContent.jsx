import React, { useContext } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import LandingPageImage from '../assets/LandingPage/PacifinanceArt2NoBg.webp';
import CookieBanner from '../components/CookieBanner';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';

export default function LandingContent({theme}) {
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const disabled = false;
  

  return (
      <div className="relative left-0 w-full p-1 overflow-y-hidden"
        style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
      >
        <CookieBanner />
        <h1 className="text-3xl mb-1 text-center md:text-6xl md:mb-1">
          <span className="text-paciGreen">Paci</span>
          <span className={`${theme.mode === 'dark' ? 'text-paciWhite' : 'text-paciBlack'}`}>Finance</span>
        </h1>
        <h2 className="text-xs text-center text-paciGreen md:mb-5 md:text-base">Personal, Privacy, Pacify</h2>
        
        <section className="flex items-center justify-between ml-5 mb-0.5 md:ml-10 md:mr-10">

          <div className="max-w-xs md:max-w-xl">
            {isMobileScreen && (
              <div className="flex justify-center">
                <img className="max-w-[10em] mr-3" src={LandingPageImage} width="100%" height="100%" alt="Pacifinance Art" draggable="false" onContextMenu={(e) => e.preventDefault()} />
              </div>
            )}
              <div className={`${isMobileScreen ? 'flex flex-col items-center' : ''}`}>
                <h1 className="text-base md:text-3xl font-bold mb-4">{languages[language].landing.sectionTitle}</h1>
              </div>
              <p>{languages[language].landing.descriptionRow1}</p>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.descriptionRow2 }}></p>
              <p>{languages[language].landing.descriptionRow3}</p>
              <div className={`${isMobileScreen ? 'flex flex-col items-center' : ''}`}>
                <button className={`mt-4 p-2 border-none rounded-sm items-center text-base cursor-pointer ${disabled ? 'bg-gray-300 text-gray-600' : 'bg-paciGreen text-white'} sm:p-1 sm:text-lg rounded-xl shadow-xl`} disabled={disabled} data-umami-event="discoverMore">
                  {languages[language].landing.discoverButton}
                </button>
              </div>
          </div>
          {!isMobileScreen && (
            <img className="max-w-[30em]" src={LandingPageImage} width="100%" height="100%" alt="Pacifinance Art" draggable="false" onContextMenu={(e) => e.preventDefault()} />
          )}
        </section>

        <section className="featurePacifinace flex flex-col items-center md:grid md:grid-cols-3 max-w-full mt-20 md:mt-2 pb-20">
          <div className="flex flex-col justify-center items-center w-30 p-8">
            <div className="bg-paciGreen text-white p-4 rounded-full flex items-center justify-center text-lg shadow-xl">
              <CheckCircleIcon />
            </div>
            <div className="flex flex-col items-center p-2">
              <h3 className="font-bold text-xl">{languages[language].landing.point1.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point1.description }}></p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-30 p-8">
            <div className="bg-paciGreen text-white p-4 rounded-full flex items-center justify-center text-lg shadow-xl">
              <ShieldIcon />
            </div>
            <div className="flex flex-col items-center p-2">
              <h3 className="font-bold text-xl">{languages[language].landing.point2.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point2.description }}></p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-30 p-8">
            <div className="bg-paciGreen text-white p-4 rounded-full flex items-center justify-center text-lg shadow-xl">
              <LockIcon />
            </div>
            <div className="flex flex-col items-center p-2">
              <h3 className="font-bold text-xl">{languages[language].landing.point3.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point3.description }}></p>
            </div>
          </div>
        </section>
        <BuyMeACoffeeWidget />
      </div>
  );
};



