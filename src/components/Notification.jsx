import React from 'react'
import styled from 'styled-components'
//import { AiOutlineCalendar } from "react-icons/ai";
import { AiOutlineBell } from "react-icons/ai";
import { AiOutlineCaretDown } from "react-icons/ai";
import avatarImage from "../assets/account-logo.png"
function Notification() {
    return (
        <Nav>
            <div className="notification">
                <AiOutlineBell />
                <div className="image">
                    <img src={avatarImage} alt="Account" />
                </div>
                <AiOutlineCaretDown />
            </div>
        </Nav>
    )
}

//<AiOutlineCalendar className="font_icon" />

export default Notification
const Nav = styled.nav`
display: flex;
justify-content: space-between;
justify-content: right;
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
}
`;
