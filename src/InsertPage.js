import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import InsertValues from './sections/InsertValues';
import { PageWrapper } from './contexts/MyStyled';

function InsertPage() {
  return (
    <PageWrapper>
      <Sidebar />
      <InsertValues />
    </PageWrapper>
  );
}

export default InsertPage;
