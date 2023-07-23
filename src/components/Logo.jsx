import React from 'react'
import LogoPaci from '../assets/Brand/PacifinanceLogoPNG3NoBg.png';
import MyStyled from '../contexts/MyStyled';

function Logo() {
    
  const {
    Logo,
  } = MyStyled()

    return (
        <Logo>
            <img src={LogoPaci} alt="Pacifinance Logo" />
        </Logo>
    )
}

export default Logo;
