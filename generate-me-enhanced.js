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
const dutyModalMarker = "{/* Modal: Request Duty (OD) */}";
const dutyModalIndex = oldMe.indexOf(dutyModalMarker);
const lastBraceIndex = oldMe.lastIndexOf("export default Me;");
let existingModals = oldMe.substring(dutyModalIndex, lastBraceIndex).trim();
// Trim the final wrapper </div>\n  );\n}
const lastDivIdx = existingModals.lastIndexOf("</div>\n  );");
if (lastDivIdx !== -1) {
  existingModals = existingModals.substring(0, lastDivIdx).trim();
}

console.log("Successfully extracted attendanceBlock:", attendanceBlock.length);
console.log("Successfully extracted calendarLogic:", calendarLogic.length);
console.log("Successfully extracted existingModals:", existingModals.length);
