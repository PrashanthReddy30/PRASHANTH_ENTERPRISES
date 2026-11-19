import fs from 'fs';

const oldMe = fs.readFileSync('src/pages/Me.jsx', 'utf8');

// 1. Extract Attendance tab exactly
const attStartMarker = "{/* Tab 1: Attendance (Keka-style Reference Layout) */}";
const attEndMarker = "{/* Tab 2: Leave (Apply & Balance) */}";
const attStartIndex = oldMe.indexOf(attStartMarker);
const attEndIndex = oldMe.indexOf(attEndMarker);
const attendanceBlock = oldMe.substring(attStartIndex, attEndIndex).trim();

// 2. Extract Attendance state and calendar logic
const helperStartMarker = "// Dynamic Calendar generation for any month and year";
const helperEndMarker = "const attendanceLog = [";
const helperStartIndex = oldMe.indexOf(helperStartMarker);
const helperEndIndex = oldMe.indexOf(helperEndMarker);
const calendarLogic = oldMe.substring(helperStartIndex, helperEndIndex).trim();

// 3. Extract existing modals
const dutyModalMarker = "{/* Modal: Request Duty */}";
const dutyModalIndex = oldMe.indexOf(dutyModalMarker);
const existingModals = oldMe.substring(dutyModalIndex, oldMe.lastIndexOf("</div>\n    </div>\n  );\n}\n\nexport default Me;")).trim();

console.log("attendanceBlock found:", attendanceBlock.length > 0);
console.log("calendarLogic found:", calendarLogic.length > 0);
console.log("existingModals found:", existingModals.length > 0);
