import React from 'react'
import LogoPaci from '../assets/Brand/PacifinanceLogoPNG3NoBg.png';
import {LogoStyled} from '../contexts/MyStyled';

function Logo() {
    
  // const {
  //   Logo,
  // } = MyStyled()

    return (
        <LogoStyled>
            <img src={LogoPaci} alt="Pacifinance Logo" draggable="false" onContextMenu={(e) => e.preventDefault()}/>
        </LogoStyled>
    )
}

export default Logo;
