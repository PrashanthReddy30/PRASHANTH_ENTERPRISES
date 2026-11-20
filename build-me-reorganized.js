import fs from 'fs';

const content = fs.readFileSync('src/pages/Me.jsx', 'utf8');

// 1. Extract attendance block: from '{activeTab === \'attendance\' && (' to '{activeTab === \'loginSessions\' && ('
const attStart = content.indexOf("{activeTab === 'attendance' && (");
const attEnd = content.indexOf("{activeTab === 'loginSessions' && (");
const attendanceBlock = content.slice(attStart, attEnd).trim();

// 2. Extract calendar logic: from lines before attendance
const calLogicStart = content.indexOf('const [currentYear, setCurrentYear] = useState(');
const calLogicEnd = content.indexOf('// --- Strict Data Isolation & Selectors for Authenticated Employee ---');
const calendarLogic = content.slice(calLogicStart, calLogicEnd).trim();

// 3. Extract the 4 attendance modals: from '{/* Modal: Request Duty (OD) */}' to the closing of the last modal
const modalStart = content.indexOf('{/* Modal: Request Duty (OD) */}');
const modalEnd = content.indexOf('    </div>\n  );\n}\n\nexport default Me;');
const attendanceModals = content.slice(modalStart, modalEnd).trim();

// 4. Extract personal edit modal, education modal, experience modal, upload doc modal
const editPersonalStart = content.indexOf('{/* Modal: Edit Personal Information */}');
const editPersonalEnd = content.indexOf('{/* Modal: View Corporate Salary Payslip */}');
const customModals = content.slice(editPersonalStart, editPersonalEnd).trim();

console.log('Attendance Block Length:', attendanceBlock.length);
console.log('Calendar Logic Length:', calendarLogic.length);
console.log('Attendance Modals Length:', attendanceModals.length);
console.log('Custom Modals Length:', customModals.length);

if (!attendanceBlock || !calendarLogic || !attendanceModals || !customModals) {
  throw new Error('Failed to extract essential sections!');
}

console.log('All sections extracted successfully!');
