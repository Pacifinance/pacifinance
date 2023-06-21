//VERSIONE JSX:
import React, {useState, useContext} from 'react'
import Select from 'react-select';
import styled from 'styled-components'
import { BiHomeAlt } from "react-icons/bi";

import { AiOutlineFundProjectionScreen, AiOutlineTrophy, AiOutlineDotChart, AiOutlineBell, AiOutlineCaretDown } from "react-icons/ai";

import { BsCircleFill, BsBook, BsInfoCircle } from "react-icons/bs";

import { HiOutlinePencilAlt } from 'react-icons/hi';
import { Link } from "react-router-dom";
import avatarImage from "../assets/account-logo.png"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import ToggleModeButton from '../components/ToggleModeButton';
import { ThemeContext } from '../contexts/ThemeContext';



function Sidebar() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const [currentLink, setCurrentLink] = useState(1);
    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        { value: 'account', label: 'Account' },
        { value: 'changePassword', label: 'Cambio password' },
        // { value: 'logout', label: 'Logout' },
    ];
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setShowPopup(true);
        setShowDropdown(false);

    };
    
    const handleLogout = async (event) => {
        // Perform logout logic here
        // Redirect the user to the login page
        event.preventDefault();
        try {
            const response = await axios.post('/logout');
            console.log(response.data);
            if(response.status === 200) {
                console.log("Logout successfull");
                navigate('/'); //direct redirect 
        
            }
            else {
                console.log("Login failed");
            }
            
        } catch (error) {
            console.error(error);
        }
    };

    const Section = styled.section`
        font-family: Roboto, sans-serif;
        position: fixed;
        left: 0;
        background-color: ${theme.backgroundColor};
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
                            color: ${theme.buttonBackgroundColor};
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
                            color: ${theme.textColor};
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
                                color: ${theme.textColor};
                                margin-bottom: 19px;
                                margin-top: -10px;
                            }
                        }
                        transition: 0.3s ease-in-out;
                        &:hover{
                            a {
                                color: ${theme.backgroundColor};
                            }
                        }
                    
                    }
                
                }
            }

            .notification{
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0 1rem;
                .font_icon{
                    font-size: 1.5rem;
                }

                svg{
                    color: white;
                }

                .image {
                    display: flex;
                    gap: 1rem;
                    img{
                        height: 2.5rem;
                        width: 2.5rem;
                        border-radius: 3rem;
                    }
                }

                .account-image {
                    height: 2.5rem;
                    width: 2.5rem;
                    border-radius: 3rem;
                    background-color: white; /* Imposta il colore di sfondo dell'immagine */
                }

                .bell-icon {
                    font-size: 2rem; /* Imposta la grandezza desiderata */
                }

                
                .dropdown-container {
                    position: relative;
                }
                
                .dropdown-header {
                    cursor: pointer;
                }
                
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 200px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .dropdown-option {
                    padding: 8px;
                    cursor: pointer;
                }
                
                .dropdown-option:hover {
                    background-color: #f5f5f5;
                }
                
                .dropdown-option.selected {
                    background-color: #007bff;
                    color: #fff;
                }
                
                .dropdown-option.logout {
                    margin-top: 8px;
                    color: #dc3545;
                }

                .popup-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .popup-window {
                    width: 400px;
                    padding: 20px;
                    background-color: white;
                    border: 2px solid orange;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }
                
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                }
            }
        }


        `
        ;

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
                                <Link to="/dashboard">
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
                    <div className="toggle">
                        <ToggleModeButton />
                    </div>
                        
                    <div className="notification">
                        <AiOutlineBell />
                        <div className="account-container">
                            <div className="account-image-wrapper">
                                <img src={avatarImage} alt="Account" className="account-image" />
                            </div>
                        </div>
                        <div className="dropdown-container">
                            <div className="dropdown-header" onClick={() => setShowDropdown(!showDropdown)}>
                                <AiOutlineCaretDown />
                            </div>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`dropdown-option ${selectedOption === option ? 'selected' : ''}`}
                                            
                                            onClick={() => handleOptionSelect(option)} >
                                        
                                            {option.label}

                                            
                                        </div>
                                    ))}
                                    <div className="dropdown-option logout" onClick={handleLogout}>
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
                        {showPopup && (
                            <div className="popup-container">
                                <div className="popup-window">
                                <h3>{selectedOption.label}</h3>
                                {/* Add content for the popup here */}
                                </div>
                                <div className="overlay" onClick={() => setShowPopup(false)}></div>
                            </div>
                        )}
                    </div>
            </div>
        </Section>
  );
}

export default Sidebar