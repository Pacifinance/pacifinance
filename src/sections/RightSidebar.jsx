import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import Notification from '../components/Notification'
import { ThemeContext } from '../contexts/ThemeContext';

function RightSidebar() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;

    const Section = styled.section`
        position: fixed;
        right: 0;
        top: 0;
        background-color: #3d3d3d;
        height: 100vh;
        width: 20vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0.5rem;
        gap: 2rem;
        .grid{
            z-index: 2;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    `;

    return (
        <Section>
            <div className="grid">
                <Notification />
            </div>
        </Section>
    )
}

export default RightSidebar;

