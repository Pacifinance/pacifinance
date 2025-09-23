import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Sidebar from '../sections/Sidebar';

const SidebarDesktop = () => {
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
    
    return (
        <Sidebar 
            userData={userData} 
            handleSetIsUpdated={handleSetIsUpdated} 
            handleSetIsAuthenticated={handleSetIsAuthenticated} 
        />
    );
};

export default SidebarDesktop;