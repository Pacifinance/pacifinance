import React from 'react'
import LogoPaci from '../assets/Brand/PacifinanceLogoPNG3NoBg.webp';
// import LogoPaci from '../assets/Brand/LogoPacifinance.png';
import {LogoStyled} from '../contexts/MyStyled';

function Logo() {

    return (
        <LogoStyled>
            <img src={LogoPaci} width="100%" height="100%" alt="Pacifinance Logo" draggable="false" onContextMenu={(e) => e.preventDefault()}/>
        </LogoStyled>
    )
}

export default Logo;
