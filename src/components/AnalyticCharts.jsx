import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import { AiOutlineMore } from "react-icons/ai";
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { ThemeContext } from '../contexts/ThemeContext';

function AnalyticCharts() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const Section = styled.section `
        display: flex;
        grid-template-columns: repeat(4, 1fr);
        justify-content: space-between;
        margin: 0 60px;
        .analytic {
            justify-content: space-between;
            padding: 1rem 2rem 1rem 2rem;
            border-radius: 1rem;
            color: black;
            background-color: ${theme.backgroundColor};
            justify-content: space-evenly;
            align-items: center;
            transition: 0.5s ease-in-out;
            width: 170px;
        
            .design{
                display: flex;
                align-items: center;
                
                .logo {
                    background-color: ${theme.backgroundColor};
                    display: flex;
                    justify-content: center;
                    align-items: center;
                
                    svg {
                        font-size: 2rem;
                    }
                }
                .action {
                    margin-left: 80px;
                svg{
                    font-size: 1.5rem;
                }
                }

            }
            .transfer {
                margin-top: 20px;
                color: grey
            }
            .money {
                margin-top: 20px;  
            }
        }
    `;
    return (
        <div className="wrapper">
        <Section>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <AiOutlineStock />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Invested</h6>
                    <h6>in Stocks & ETF</h6>
                </div>
                <div className="money">
                    <h5>€1200</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <BsBank />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Invested</h6>
                    <h6>in Bank</h6>
                </div>
                <div className="money">
                    <h5>€1500</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <BsCashCoin />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Cash</h6>
                    <h6>money</h6>
                </div>
                <div className="money">
                    <h5>€1200</h5>
                </div>
            </div>
            
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <FaBitcoin />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Invested</h6>
                    <h6>in Crypto</h6>
                </div>
                <div className="money">
                    <h5>€1500</h5>
                </div>
            </div>   
        </Section>
    </div>
    )
}

export default AnalyticCharts;
