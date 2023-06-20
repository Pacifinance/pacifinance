import React, {useState, useContext}from 'react'
import styled from 'styled-components'
import { BiHomeAlt } from "react-icons/bi";
import { BiCar } from "react-icons/bi";
import { ThemeContext } from '../contexts/ThemeContext';


function Payment() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const Section = styled.section `
        display: grid;
        gap: 0.2rem;
        .title{
            margin-left: 15px;
            h4{
                font-weight:bold;
            }
            h6{
                color: white;
            }
        }
        .analytic {
            padding: 0.3rem 0.8rem 0.3rem 1.2rem;
            
            color: white;
            justify-content: space-evenly;
            align-items: center;
            gap: 1rem;
            transition: 0.5s ease-in-out;
            &:hover {
                background-color: ${theme.backgroundColor};
                color: ${theme.textColor};
                svg {
                    color: ${theme.textColor};
                }
            }
            float: both;
            .design{
                display: flex;
                align-items: center;
                gap: 1rem;
                .logo {
                    background-color: ${theme.backgroundColor};
                    border-radius: 1rem;
                    border: 1px solid white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5rem;
                    svg {
                        font-size: 1.5rem;
                    }
                }
                .color{
                    color: ${theme.textColor};
                }    
            }
            .money{ 
                h5{
                    float: right;
                    margin-top: -30px;
                }  
            }   
        }
        
    `;
    return (
        <Section>
            <div>
                <div className='title'>
                    <h4>Upcoming Payments</h4>
                    <h6>Data di oggi</h6>
                </div>
                <div className="analytic ">
                    <div className="design">
                        <div className="logo">
                        <BiHomeAlt />
                    </div>
                    <div className="content">
                        <h5>Home Rent</h5>
                        <h5 className='color'>Pending</h5>
                    </div>           
                </div>
                <div className="money">
                        <h5>€1500</h5>                 
                </div>         
            </div>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <BiCar />
                    </div>
                    <div className="content">
                        <h5>Car Insurance</h5>
                        <h5 className='color'>Pending</h5>
                    </div>              
                </div>
                <div className="money">
                        <h5>€150</h5>            
                    </div>   
            </div>
        </div>
    </Section>
    )
}

export default Payment;


