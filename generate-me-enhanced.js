import fs from 'fs';

const oldMe = fs.readFileSync('src/pages/Me.jsx', 'utf8');

const dutyModalMarker = "{/* Modal: Request Duty */}";
const dutyModalIndex = oldMe.indexOf(dutyModalMarker);
const lastBraceIndex = oldMe.lastIndexOf("export default Me;");
const existingModals = oldMe.substring(dutyModalIndex, lastBraceIndex).trim();

// Remove the final </div> closing tag of the main container if it was included
console.log("existingModals length:", existingModals.length);
console.log("ends with:", existingModals.slice(-50));
