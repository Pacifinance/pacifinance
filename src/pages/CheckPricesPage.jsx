import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import MarketPrices from '../sections/MarketPrices';

function CheckPricesPage() {
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);

  useEffect(() => {
    handleSetIsUpdated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Div>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <MarketPrices />
    </Div>
  );
}

export default CheckPricesPage;
const Div = styled.div `
position: relative;
`;