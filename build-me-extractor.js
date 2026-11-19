const fs = require('fs');

const meOld = fs.readFileSync('src/pages/Me.jsx', 'utf8');

const attStartMarker = "{/* Tab 1: Attendance (Keka-style Reference Layout) */}";
const attEndMarker = "{/* Tab 2: Leave (Apply & Balance) */}";

const attStartIndex = meOld.indexOf(attStartMarker);
const attEndIndex = meOld.indexOf(attEndMarker);

if (attStartIndex === -1 || attEndIndex === -1) {
  console.error("Could not find attendance tab boundaries in Me.jsx");
  process.exit(1);
}

const attendanceTabCode = meOld.substring(attStartIndex, attEndIndex).trim();

const modalsMarker = "{/* Modal: Request Duty */}";
const modalsIndex = meOld.indexOf(modalsMarker);
const existingModalsCode = meOld.substring(modalsIndex, meOld.lastIndexOf("</div>\n    </div>\n  );\n}\n\nexport default Me;")).trim();

console.log("Extracted attendance code length:", attendanceTabCode.length);
console.log("Extracted modals code length:", existingModalsCode.length);
