import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import { ThemeContext } from '../contexts/ThemeContext';
import LogoPaci from '../assets/Brand/PacifinanceLogoPNG3NoBg.png';
function Logo() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    
    const Logo = styled.h1`
    font-size: 0px;
    img {
      width: 90px;
    }
  `;

    return (
        <Logo>
            <img src={LogoPaci} alt="Pacifinance Logo" />
        </Logo>
    )
}

export default Logo;
