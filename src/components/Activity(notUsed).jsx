import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import { MdOutlineWaterDrop } from "react-icons/md";
import { GiPayMoney } from "react-icons/gi";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { AiOutlineWifi } from "react-icons/ai";
import { ThemeContext } from '../contexts/ThemeContext';


function Activity() {
    return (
        <Section>
            <div>
                <div className='title'>
                    <h4>Recent Activities</h4>
                    <h6>Data di oggi</h6>
                </div>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <MdOutlineWaterDrop />
                    </div>
                    <div className="content">
                        <h5>Water Bill</h5>
                        <h5 className='color'>Outcome</h5>
                    </div>
                
                </div>
                <div className="money">
                        <h5>€120</h5>
                    
                    </div>
            
            </div>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <GiPayMoney />
                    </div>
                    <div className="content">
                        <h5>Income Salary</h5>
                        <h5 className='color'>Income</h5>
                    </div>
                    
                </div>
                <div className="money">
                        <h5>€1800</h5>
                    
                    </div>
            
            </div>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <AiOutlineThunderbolt />
                    </div>
                    <div className="content">
                        <h5>Electric Bill</h5>
                        <h5 className='color'>Outcome</h5>
                    </div>
                
                </div>
                <div className="money">
                        <h5>€150</h5>
                    
                    </div>
            
            </div>
            <div className="analytic ">
                <div className="design">
                    <div className="logo">
                        <AiOutlineWifi />
                    </div>
                    <div className="content">
                        <h5>Internet Bill</h5>
                        <h5 className='color'>Outcome</h5>
                    </div>
                    
                </div>
                <div className="money">
                        <h5>€50</h5>
                    
                    </div>
            
            </div>
        </div>
    
    </Section> 
    )
}

export default Activity;

