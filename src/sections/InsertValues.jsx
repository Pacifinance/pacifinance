import React, { useState, useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";

const InsertValue = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  const [bank, setBank] = useState(0);
  const [cash, setCash] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [crypto, setCrypto] = useState(0);
  const [salary, setSalary] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [lastAdds, setLastAdds] = useState([]);
  const [tableData, setTableData] = useState([]);

  const StyledSection = styled.div`
    font-family: Roboto, sans-serif; 
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px;
  `;

  const StyledInputs = styled.div`
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    margin-bottom: 20px;

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 20px;
    }

    input {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }

    button {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }
  `;

  const StyledTable = styled.table`
    border-collapse: collapse;
    width: 100%;

    td, th {
      border: 1px solid black;
      padding: 5px;
    }

    th {
      background-color: ${theme.backgroundColor};
    }
  `;

  const StyledAddSection = styled.div`
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    margin-bottom: 20px;

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 20px;
    }

    input {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }

    button {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }
  `;

  const StyledLastAdds = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
    }

    button {
      font-size: 1.2rem;
      padding: 5px;
    }
  `;

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const data = [...tableData];
    data[index][name] = value;
    setTableData(data);
  };

  const handleAdd = () => {
    const newAdd = {
      bank,
      cash,
      stocks,
      crypto,
      salary,
      income,
      expense,
    };
    setLastAdds([newAdd, ...lastAdds].slice(0, 20));
    setBank(0);
    setCash(0);
    setStocks(0);
    setCrypto(0);
    setSalary(0);
    setIncome(0);
    setExpense(0);
  };

  const handleDelete = (index) => {
    const newAdds = [...lastAdds];
    newAdds.splice(index, 1);
    setLastAdds(newAdds);
  };

  return (
    <StyledSection>
      <StyledInputs>
        <label>
          Bank
          <input type="number" value={bank} onChange={(e) => setBank(e.target.value)} />
          <button onClick={() => setBank(bank + 1)}>+</button>
        </label>
        <label>
          Cash
          <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
          <button onClick={() => setCash(cash + 1)}>+</button>
        </label>
        <label>
          Stocks/ETFs
          <input type="number" value={stocks} onChange={(e) => setStocks(e.target.value)} />
          <button onClick={() => setStocks(stocks + 1)}>+</button>
        </label>
        <label>
          Crypto
          <input type="number" value={crypto} onChange={(e) => setCrypto(e.target.value)} />
          <button onClick={() => setCrypto(crypto + 1)}>+</button>
        </label>
      </StyledInputs>
      <StyledAddSection>
        <label>
          Salary (current month)
          <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </label>
        <label>
          Income
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
        </label>
        <label>
          Expense
          <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} />
        </label>
        <button onClick={handleAdd}>Add</button>
      </StyledAddSection>
      <StyledTable>
        <thead>
          <tr>
            <th>Category</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr key={index}>
              <td>{data.category}</td>
              <td><input type="number" name="value" value={data.value} onChange={(e) => handleInputChange(index, e)} /></td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      <StyledLastAdds>
        <h2>Last 20 Adds</h2>
        <ul>
          {lastAdds.map((add, index) => (
            <li key={index}>
              <div>
                Bank: {add.bank}, Cash: {add.cash}, Stocks/ETFs: {add.stocks}, Crypto: {add.crypto}, Salary: {add.salary}, Income: {add.income}, Expense: {add.expense}
              </div>
              <button onClick={() => handleDelete(index)}>X</button>
            </li>
          ))}
        </ul>
      </StyledLastAdds>
    </StyledSection>
  );
};

export default InsertValue;

// import React, { useState, useContext } from "react";
// import styled from "styled-components";
// import { ThemeContext } from "../contexts/ThemeContext";

// const InsertValue = () => {
//   const { theme } = useContext(ThemeContext);
//   const { mode } = theme;
//   const [bank, setBank] = useState(0);
//   const [cash, setCash] = useState(0);
//   const [stocks, setStocks] = useState(0);
//   const [crypto, setCrypto] = useState(0);
//   const [salary, setSalary] = useState(0);

//   const StyledSection = styled.div`
//     font-family: Roboto, sans-serif; 
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     margin: 50px;
//   `;

//   const StyledInputs = styled.div`
//     display: flex;
//     justify-content: space-evenly;
//     width: 100%;
//     margin-bottom: 20px;

//     label {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       font-weight: bold;
//       font-size: 1.2rem;
//       margin-right: 20px;
//     }

//     input {
//       margin-top: 10px;
//       font-size: 1.2rem;
//       padding: 5px;
//     }
//   `;

//   const StyledTable = styled.table`
//     border-collapse: collapse;
//     width: 100%;

//     td, th {
//       border: 1px solid black;
//       padding: 5px;
//     }

//     th {
//       background-color: ${theme.backgroundColor};
//     }
//   `;
  
//   const [tableData, setTableData] = useState([
//     { category: "Food", value: 0 },
//     { category: "Housing", value: 0 },
//     { category: "Utilities", value: 0 },
//     { category: "Transportation", value: 0 },
//     { category: "Entertainment", value: 0 },
//     { category: "Other", value: 0 },
//   ]);

//   const handleInputChange = (index, e) => {
//     const { name, value } = e.target;
//     const data = [...tableData];
//     data[index][name] = value;
//     setTableData(data);
//   };

//   return (
//     <StyledSection>
//       <StyledInputs>
//         <label>
//           Bank
//           <input type="number" value={bank} onChange={(e) => setBank(e.target.value)} />
//         </label>
//         <label>
//           Cash
//           <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
//         </label>
//         <label>
//           Stocks/ETFs
//           <input type="number" value={stocks} onChange={(e) => setStocks(e.target.value)} />
//         </label>
//         <label>
//           Crypto
//           <input type="number" value={crypto} onChange={(e) => setCrypto(e.target.value)} />
//         </label>
//         <label>
//           Salary (current month)
//           <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
//         </label>
//       </StyledInputs>
//       <StyledTable>
//         <thead>
//           <tr>
//             <th>Category</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tableData.map((data, index) => (
//             <tr key={index}>
//               <td>{data.category}</td>
//               <td><input type="number" name="value" value={data.value} onChange={(e) => handleInputChange(index, e)} /></td>
//             </tr>
//           ))}
//         </tbody>
//       </StyledTable>
//     </StyledSection>
//   );
// };

// export default InsertValue;