// import React, { useContext } from "react";
// import { PrivacyContext } from "../contexts/PrivacyContext";
import ExcelJS from 'exceljs';
import domtoimage from 'dom-to-image';

export const downloadPNG = () => {
    const node = document.getElementById('myChart');
    domtoimage.toPng(node)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'my-image-name.png';
        link.href = dataUrl;
        link.click();
      });
  };

  export const downloadExcel = async (data, headers, fileName = 'report.xlsx') => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
  
    // Add headers
    const headerRow = headers.map(header => header.label);
    worksheet.addRow(headerRow);
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  
    // Add data rows
    data.forEach(row => {
      const rowData = headers.map(header => row[header.key] || '');
      worksheet.addRow(rowData);
    });
    
    // Auto-size columns
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(header.label.length, 15);
    });
  
    // Generate the file and download it
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };
