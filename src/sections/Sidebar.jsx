//VERSIONE JSX:
import React, {useState} from 'react'
import styled from 'styled-components'
import { BiHomeAlt } from "react-icons/bi";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { AiOutlineTrophy } from "react-icons/ai";

import { AiOutlineDotChart } from "react-icons/ai";

import { BsCircleFill } from "react-icons/bs";
import { BsBook } from "react-icons/bs";
import { BsInfoCircle } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { Link } from "react-router-dom";
//import {Route, Link, Routes, useLocation} from 'react-router-dom';

function Sidebar() {
    const [currentLink, setCurrentLink] = useState(1);
    return (
        <Section>
            <div className="top">
                    <div className="brand">
                        <BsCircleFill className="color1" style={{ color: '#F7B510' }}/>
                        <BsCircleFill className="color4" style={{ color: '#BCBCBC' }}/>
                        <BsCircleFill className="color3" style={{ color: '#F7B510' }}/>
                    </div>
                    <div className="links">
                        <ul>
                            <li
                            className={currentLink === 1 ? "active" : "none"}
                            onClick={() => setCurrentLink(1)}
                            >
                                <Link to="/">
                                    <BiHomeAlt />
                                    
                                </Link>
                            </li>

                            <li
                            className={currentLink === 6 ? "active" : "none"}
                            onClick={() => setCurrentLink(6)}
                            >
                                <Link to="/your-charts">
                                    <AiOutlineDotChart />
                                    
                                </Link>
                            </li>

                            <li
                            className={currentLink === 3 ? "active" : "none"}
                            onClick={() => setCurrentLink(3)}
                            >
                                <Link to="/insert-values">
                                    <HiOutlinePencilAlt/>
                                    
                                </Link>
                            </li>
                            
                            <li
                            className={currentLink === 2 ? "active" : "none"}
                            onClick={() => setCurrentLink(2)}
                            >
                                <Link to="/check-prices">
                                    <AiOutlineFundProjectionScreen />
                                    
                                </Link>
                            </li>

                            <li
                            className={currentLink === 5 ? "active" : "none"}
                            onClick={() => setCurrentLink(5)}
                            >
                                <Link to="/leaderboard">
                                    <AiOutlineTrophy />
                                    
                                </Link>
                            </li>
                            
                            

                            <li
                            className={currentLink === 7 ? "active" : "none"}
                            onClick={() => setCurrentLink(7)}
                            >
                                <Link to="/knowledge">
                                    <BsBook />
                                    
                                </Link>
                            </li>

                            <li
                            className={currentLink === 8 ? "active" : "none"}
                            onClick={() => setCurrentLink(8)}
                            >
                                <Link to="/info">
                                    <BsInfoCircle/>
                                    
                                </Link>
                            </li>
                          
                        </ul>

                    </div>
            </div>
           
        </Section>
    )
}

export default Sidebar
const Section = styled.section`
position: fixed;
left: 0;
background-color: black;
height: 100vh;
width: 6vw;
display: flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
padding: 2rem 0;
gap: 2rem;
.top{
    display: flex;
    flex-direction: column;
    gap: 4rem;
    width: 100%;
    .brand {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.3rem 0;
        .color1{
            color: red;
        }
        .color2{
            color: yellow;
        }
        .color3{
            color: green;
        }
        svg {
            margin: 0 2px;
            font-size: 0.8rem;
            
        }
       
    }
    .links {
       
        ul {
          
            margin-bottom: 3rem;
            .active {
                border-right: 0.2rem solid black;   
                a {
                    color: #27ae60;
                }
            }
            
            li{
                display: flex;
                justify-content: center;
               border-right: 0.2rem solid transparent;
                margin: 1rem 0;
                list-style-type: none;
                a {   
                    text-decoration: none;
                    color: grey;
                    font-size: 1.6rem;
                    gap: 0 0.4rem;;
                }
                .noti{
                    display: flex;
                    margin-left: 21px;
                    span {
                        background-color: red;
                        font-size: 0.5rem;
                        border-radius: 50%;
                        padding: 2px 5px 2px 5px;
                        color: white;
                        margin-bottom: 19px;
                        margin-top: -10px;
                    }
                }
                transition: 0.3s ease-in-out;
                &:hover{
                    a {
                        color: black;
                    }
                }
               
            }
           
        }
    }
}


`
;