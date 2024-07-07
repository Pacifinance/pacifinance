// import React, { useContext } from "react";
// import { PrivacyContext } from "../contexts/PrivacyContext";
import * as XLSX from 'xlsx';
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

  export const downloadExcel = (data, headers, fileName = 'report.xlsx') => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
  
    // Prepare the worksheet data with headers
    const ws = XLSX.utils.json_to_sheet(data, {header: headers.map(header => header.key), skipHeader: true});
  
    // Optionally, you can manually set the headers in the first row
    XLSX.utils.sheet_add_aoa(ws, [headers.map(header => header.label)], {origin: 'A1'});
  
    // Add the sheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Report");
  
    // Generate the file and download it
    XLSX.writeFile(wb, fileName);
  };
