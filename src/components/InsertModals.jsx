
import React from 'react';
import { Select, MenuItem, Typography } from '@mui/material';
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
  const { language, translations } = React.useContext(LanguageContext);

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
    const date = new Date(monthYearObj.year, monthYearObj.month, 0);
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
            {translations.insert.balanceSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {translations.assets.bank}: {bankValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.cash}: {cashValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.digitalServices}:{' '}
              {digitalServicesValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.emergencyFund}: {emergencyFundValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.stocks}: {stocksValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.etf}: {etfValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.bitcoin}: {bitcoinValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.crypto}: {cryptoValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.bonds}: {bondsValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.funds}: {fundsValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.assets.gold}: {goldValue}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.selectedDate}: {getDisplayDateForBalance(balanceDate)}
            </MuiCustomDialogContentText>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="balanceUpdate"
              onClick={onConfirmBalance}
            >
              {translations.general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}
            >
              {translations.general.cancel}
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
            {translations.insert.incomeSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {translations.general.category}: {categoryIncome.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.value}: {income}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.note}: {noteIncomeAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.selectedDate}: {incomeDate}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.insert.incomeSection.increaseWhichBalance}:{' '}
            </MuiCustomDialogContentText>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {translations.general.selectAnOption}
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
              {translations.general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}
            >
              {translations.general.cancel}
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
            {translations.insert.outflowSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {translations.general.category}: {categoryOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.insert.outflowSection.paymentType}:{' '}
              {typoOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.value}: {outflow}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.note}: {noteOutflowAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {translations.general.selectedDate}: {outflowDate}
            </MuiCustomDialogContentText>
            <Typography variant="body2" style={{ marginTop: '1em' }}>
              {translations.insert.outflowSection.decreaseWhichBalance}:{' '}
            </Typography>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {translations.general.selectAnOption}
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
              {translations.general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmOutflowOpen)}
            >
              {translations.general.cancel}
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
            {translations.insert.incomeSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {translations.insert.incomeSection.deleteBalanceRestore ||
                'Se vuoi, puoi scegliere da quale bilancio togliere i soldi per mantenere il saldo corretto. (Opzionale)'}
            </MuiCustomDialogContentText>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              displayEmpty
              style={{ marginTop: '1em', minWidth: 200 }}
            >
              <MenuItem value="">
                {translations.general.selectAnOption}
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
              {translations.general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteIncome(false)}
            >
              {translations.general.cancel}
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
            {translations.insert.outflowSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {translations.insert.outflowSection.deleteBalanceRestore ||
                'Se vuoi, puoi scegliere dove riaggiungere i soldi per mantenere il saldo corretto. (Opzionale)'}
            </MuiCustomDialogContentText>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              displayEmpty
              style={{ marginTop: '1em', minWidth: 200 }}
            >
              <MenuItem value="">
                {translations.general.selectAnOption}
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
              {translations.general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteOutflow(false)}
            >
              {translations.general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
    </>
  );
}
