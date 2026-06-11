const xlsx = require('xlsx');
const wb = xlsx.readFile('../Membros e Parceiros ISTAA - Detalhado.xlsx');
const sheetName = wb.SheetNames[0];
const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
console.log('Total rows:', data.length);
if(data.length > 0) {
  console.log('Sample row:', JSON.stringify(data[0], null, 2));
  console.log('Sample row 2:', JSON.stringify(data[1], null, 2));
}
