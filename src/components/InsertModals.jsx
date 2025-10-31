
import React from 'react';
import { Select, MenuItem, Typography } from '@mui/material';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  MuiCustomDialog,
  MuiCustomButton,
  MuiCustomDialogTitle,
  MuiCustomDialogContent,
  MuiCustomDialogContentText,
  MuiCustomDialogActions,
} from '../styles/MyStyled';

export default function InsertModals({
  isConfirmBalanceOpen,
  setIsConfirmBalanceOpen,
  isConfirmIncomeOpen,
  setIsConfirmIncomeOpen,
  isConfirmOutflowOpen,
  setIsConfirmOutflowOpen,
  showConfirmationDeleteIncome,
  setShowConfirmationDeleteIncome,
  showConfirmationDeleteOutflow,
  setShowConfirmationDeleteOutflow,
  balanceDate,
  bankValue,
  cashValue,
  digitalServicesValue,
  emergencyFundValue,
  stocksValue,
  etfValue,
  bitcoinValue,
  cryptoValue,
  bondsValue,
  fundsValue,
  goldValue,
  categoryIncome,
  income,
  noteIncomeAreaValue,
  incomeDate,
  categoryOutflow,
  typoOutflow,
  outflow,
  noteOutflowAreaValue,
  outflowDate,
  selectedOption,
  setSelectedOption,
  options,
  onConfirmBalance,
  onConfirmIncome,
  onConfirmOutflow,
  onConfirmDeleteIncome,
  onConfirmDeleteOutflow,
}) {
  const { language } = React.useContext(LanguageContext);

  // Function to convert month/year selection to display date for popup
  const getDisplayDateForBalance = (monthYearObj) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // If selected month/year is current month/year, show current date
    if (monthYearObj.month === currentMonth && monthYearObj.year === currentYear) {
      return currentDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US');
    }
    
    // Otherwise, show the last day of the selected month
    const lastDayOfMonth = new Date(monthYearObj.year, monthYearObj.month, 0).getDate();
    const date = new Date(monthYearObj.year, monthYearObj.month - 1, lastDayOfMonth);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US');
  };

  const handleExitConfirm = (setModalState) => {
    setModalState(false);
  };

  return (
    <>
      {isConfirmBalanceOpen && (
        <MuiCustomDialog
          open={isConfirmBalanceOpen}
          onClose={() => handleExitConfirm(setIsConfirmBalanceOpen)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.balanceSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].assets.bank}: {bankValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.cash}: {cashValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.digitalServices}:{' '}
              {digitalServicesValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.emergencyFund}: {emergencyFundValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.stocks}: {stocksValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.etf}: {etfValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.bitcoin}: {bitcoinValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.crypto}: {cryptoValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.bonds}: {bondsValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.funds}: {fundsValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.gold}: {goldValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {getDisplayDateForBalance(balanceDate)}
            </MuiCustomDialogContentText>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="balanceUpdate"
              onClick={onConfirmBalance}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}

      {isConfirmIncomeOpen && (
        <MuiCustomDialog
          open={isConfirmIncomeOpen}
          onClose={() => handleExitConfirm(setIsConfirmIncomeOpen)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].general.category}: {categoryIncome.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.value}: {income}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.note}: {noteIncomeAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {incomeDate}
            </MuiCustomDialogContentText>
            <Typography variant="body1" style={{ marginTop: '1em' }}>
              {languages[language].insert.incomeSection.increaseWhichBalance}:{' '}
            </Typography>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="incomeUpdate"
              onClick={onConfirmIncome}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}

      {isConfirmOutflowOpen && (
        <MuiCustomDialog
          open={isConfirmOutflowOpen}
          onClose={() => handleExitConfirm(setIsConfirmOutflowOpen)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].general.category}: {categoryOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].insert.outflowSection.paymentType}:{' '}
              {typoOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.value}: {outflow}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.note}: {noteOutflowAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {outflowDate}
            </MuiCustomDialogContentText>
            <Typography variant="body2" style={{ marginTop: '1em' }}>
              {languages[language].insert.outflowSection.decreaseWhichBalance}:{' '}
            </Typography>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="outflowUpdate"
              onClick={onConfirmOutflow}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmOutflowOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}

      {showConfirmationDeleteIncome && (
        <MuiCustomDialog
          open={showConfirmationDeleteIncome}
          onClose={() => setShowConfirmationDeleteIncome(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].insert.incomeSection.deleteBalanceRestore ||
                'Se vuoi, puoi scegliere da quale bilancio togliere i soldi per mantenere il saldo corretto. (Opzionale)'}
            </MuiCustomDialogContentText>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              displayEmpty
              style={{ marginTop: '1em', minWidth: 200 }}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton onClick={onConfirmDeleteIncome}>
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteIncome(false)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}

      {showConfirmationDeleteOutflow && (
        <MuiCustomDialog
          open={showConfirmationDeleteOutflow}
          onClose={() => setShowConfirmationDeleteOutflow(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].insert.outflowSection.deleteBalanceRestore ||
                'Se vuoi, puoi scegliere dove riaggiungere i soldi per mantenere il saldo corretto. (Opzionale)'}
            </MuiCustomDialogContentText>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              displayEmpty
              style={{ marginTop: '1em', minWidth: 200 }}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton onClick={onConfirmDeleteOutflow}>
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteOutflow(false)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
    </>
  );
}
