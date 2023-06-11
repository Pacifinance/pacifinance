import React from 'react'
import styled from 'styled-components'
//import {BiSearch} from 'react-icons/bi'

function NavbarCharts() {
    return (
        <Nav>
            <div className="title">
                <h1>Your charts</h1>
                <h3>Percentage</h3>
                <h5>in the time</h5>
            </div>
        </Nav>
                
    )
}
// <div className="search">
//<BiSearch />
//<input type="text" placeholder="Search" />
//</div>
export default NavbarCharts
const Nav = styled.nav`
    display: flex;
    justify-content: space-between;
    color: black;
    .title{
        h1{
            color: black;
            margin.bottom: 1rm;
            text-align: center;
        }
        h5{
            color: grey;
        }
    }
    .search {
        background-color: white;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 8rem 1rem 1rem;
        border-radius: 1.5rem;
        svg{
            color: grey;
        }
        input{
            background-color: transparent;
            border: none;
            color: grey;
            &:focus{
                outline: none;
            }
            &::placeholder {
                color: grey;
            }
        }
    }

`;
