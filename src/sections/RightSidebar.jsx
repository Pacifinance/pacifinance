import React from 'react'
import styled from 'styled-components'
import Notification from '../components/Notification'
// import Activity from '../components/Activity'
// import Payment from '../components/Payment'

function RightSidebar() {
    return (
        <Section>
            <div className="grid">
                <Notification />
                {/* <Activity /> */}
                {/* <Payment /> */}
            </div>
        </Section>
    )
}

export default RightSidebar
const Section = styled.section`
    position: fixed;
    right: 0;
    top: 0;
    background-color: #17202A;
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
