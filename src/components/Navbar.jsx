import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import { ThemeContext } from '../contexts/ThemeContext';
//import {BiSearch} from 'react-icons/bi'

function Navbar() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const Nav = styled.nav`
        display: flex;
        justify-content: space-between;
        color: black;
        .title{
            h5{
                color: ${theme.textColor};
            }
        }
        .search {
            background-color: ${theme.backgroundColor};
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 8rem 1rem 1rem;
            border-radius: 1.5rem;
            svg{
                color: ${theme.textColor};
            }
            input{
                background-color: transparent;
                border: none;
                color: ${theme.textColor};
                &:focus{
                    outline: none;
                }
                &::placeholder {
                    color: ${theme.textColor};
                }
            }
        }

    `;
    return (
        <Nav>
            <div className="title">
                <h1>Dashboard</h1>
                <h5>Check Portfolio</h5>
            </div>
        </Nav>
                
    )
}
// <div className="search">
//<BiSearch />
//<input type="text" placeholder="Search" />
//</div>
export default Navbar;

