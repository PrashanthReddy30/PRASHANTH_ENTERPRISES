// Prashanth Enterprises HRMS - New Employee Onboarding Service
// Handles salary breakups, document generation, statutory forms (PF/ESIC/BGV), and email workflows.

/**
 * Calculates complete Indian corporate CTC breakup with statutory deductions.
 * ESIC is mandatory if Monthly Gross <= ₹21,000.
 */
export function calculateSalaryBreakup(annualCtcInput) {
  const annualCtc = Math.max(0, Number(annualCtcInput) || 0);
  const monthlyGross = Math.round(annualCtc / 12);

  // Typical Indian IT/Corporate Structure:
  // Basic: 40% of Gross
  // HRA: 20% of Gross
  // Conveyance: ₹1,600/month or 5%
  // Special Allowance: Remaining balancing figure
  const basic = Math.round(monthlyGross * 0.40);
  const hra = Math.round(monthlyGross * 0.20);
  const conveyance = monthlyGross > 20000 ? 1600 : 800;
  
  // Provident Fund: 12% of Basic (statutory cap on ₹15,000 basic = ₹1,800, or actual 12%)
  const pfBasicBase = Math.min(basic, 15000);
  const employeePf = basic > 0 ? Math.round(pfBasicBase * 0.12) : 0;
  const employerPf = employeePf;

  // ESIC: Applicable only if monthly gross <= ₹21,000
  const esiEligible = monthlyGross > 0 && monthlyGross <= 21000;
  const esiEmployee = esiEligible ? Math.round(monthlyGross * 0.0075) : 0; // 0.75%
  const esiEmployer = esiEligible ? Math.round(monthlyGross * 0.0325) : 0; // 3.25%

  // Professional Tax (Standard Telangana / Maharashtra slab ~ ₹200)
  const professionalTax = monthlyGross > 15000 ? 200 : monthlyGross > 10000 ? 150 : 0;

  // Special Allowance & Other Allowances
  const coreEarnings = basic + hra + conveyance;
  const specialAllowance = Math.max(0, monthlyGross - coreEarnings);
  const otherAllowances = 0;

  // Net Take Home Salary = Monthly Gross - (Employee PF + ESI + PT)
  const totalDeductions = employeePf + esiEmployee + professionalTax;
  const netSalary = Math.max(0, monthlyGross - totalDeductions);

  return {
    annualCtc,
    monthlyGross,
    basicSalary: basic,
    hra,
    conveyanceAllowance: conveyance,
    specialAllowance,
    otherAllowances,
    employeePf,
    employerPf,
    esiApplicable: esiEligible,
    esiEmployee,
    esiEmployer,
    professionalTax,
    totalDeductions,
    netSalary,
    paymentFrequency: 'Monthly'
  };
}

/**
 * Standard Default Document Templates for Prashanth Enterprises
 */
export const DEFAULT_ONBOARDING_TEMPLATES = [
  {
    id: 'TPL-APPOINTMENT',
    category: 'EMPLOYMENT_LETTERS',
    code: 'APPOINTMENT_LETTER',
    title: 'Formal Appointment Letter',
    description: 'Comprehensive employment terms, probation, notice period, and detailed compensation structure.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `PRASHANTH ENTERPRISES PRIVATE LIMITED
Registered Office: Plot 42, Hitec City, Cyberabad, Hyderabad 500081, Telangana, India
CIN: U72200TG2021PTC148291 | Email: hr@prashanthenterprises.in | Phone: +91 40 4829 1000

STRICTLY PRIVATE & CONFIDENTIAL
Date: {{CURRENT_DATE}}

To:
{{EMPLOYEE_NAME}}
{{EMPLOYEE_ADDRESS}}
Email: {{EMPLOYEE_EMAIL}} | Mobile: {{EMPLOYEE_PHONE}}

Subject: Formal Letter of Appointment — {{DESIGNATION}}

Dear {{EMPLOYEE_NAME}},

With reference to your application and the subsequent interview rounds you have successfully qualified, the Board of Directors and Management of Prashanth Enterprises are pleased to appoint you as {{DESIGNATION}} in the {{DEPARTMENT}} department, based at our {{WORK_LOCATION}}.

1. DATE OF COMMENCEMENT & PROBATION
Your appointment is effective from your Date of Joining, {{JOINING_DATE}}. You shall be on probation for a period of {{PROBATION_PERIOD}} from the date of joining. Upon successful completion of your probation period, your employment will be confirmed in writing by the Human Resources department.

2. COMPENSATION & EMOLUMENTS
Your Annual Cost to Company (CTC) will be INR {{ANNUAL_CTC}}/- (Rupees {{ANNUAL_CTC_WORDS}} Only), payable monthly in arrears as per the Company's standard payroll disbursement cycle:
- Monthly Gross Salary: INR {{MONTHLY_GROSS}}/-
- Basic Salary: INR {{BASIC_SALARY}}/- per month
- House Rent Allowance (HRA): INR {{HRA}}/- per month
- Special Allowance: INR {{SPECIAL_ALLOWANCE}}/- per month
- Provident Fund (PF): Deducted as per Statutory Employees' Provident Funds and Miscellaneous Provisions Act, 1952.
- Taxes: Income tax, Professional Tax and other statutory levies shall be deducted at source (TDS).

3. WORKING HOURS & ATTENDANCE
The standard business working hours are 09:00 AM to 06:00 PM (Monday through Friday), logged via the corporate Matrix COSEC biometric reader intranet system. You are entitled to 12 days Casual Leave (CL), 10 days Sick Leave (SL), and 18 days Privilege Leave (PL) per fiscal calendar annum upon confirmation.

4. NOTICE PERIOD & SEPARATION
During the probation period, either party may terminate this agreement by providing {{NOTICE_PERIOD}} written notice or gross salary in lieu thereof. Upon confirmation, the notice period shall be 60 days.

5. COMPANY POLICIES & CODE OF DISCIPLINE
You agree to abide by the Company's Code of Conduct, Anti-Bribery regulations, and Prevention of Sexual Harassment (POSH) guidelines in letter and spirit.

Kindly sign and return the duplicate copy of this letter along with your accepted joining report to confirm your acceptance.

Yours sincerely,
For PRASHANTH ENTERPRISES PRIVATE LIMITED

Prashanth Reddy
Director of Operations & Managing Signatory
Corporate HR Seal Attached
--------------------------------------------------------------------------------
ACCEPTANCE AND DECLARATION BY EMPLOYEE:
I, {{EMPLOYEE_NAME}}, have read, understood, and hereby accept the terms and conditions outlined in this Appointment Letter.
Signature: __________________________    Date: {{ACCEPTANCE_DATE}}`
  },
  {
    id: 'TPL-NDA',
    category: 'AGREEMENTS',
    code: 'NDA',
    title: 'Non-Disclosure Agreement (NDA) & Confidentiality Covenant',
    description: 'Protection of enterprise intellectual assets, client proprietary data, and intranet secrets.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `EMPLOYEE NON-DISCLOSURE & PROPRIETARY INFORMATION AGREEMENT

This Non-Disclosure Agreement ("Agreement") is executed as of {{JOINING_DATE}}, by and between:
PRASHANTH ENTERPRISES PRIVATE LIMITED ("Employer / Company"), and {{EMPLOYEE_NAME}} ("Employee"), residing at {{EMPLOYEE_ADDRESS}}.

WHEREAS Employee is engaged in confidential projects and system infrastructure in the {{DEPARTMENT}} department:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes, without limitation: trade secrets, proprietary software source code, system credentials, biometric authentication logs, corporate ERP/HRMS databases, client records, financial statements, and technical architectures.

2. OBLIGATIONS OF EMPLOYEE
(a) Employee shall hold all Confidential Information in strict trust and confidence.
(b) Employee shall not disclose, duplicate, transfer, or reverse engineer any proprietary asset outside the authorized Intranet perimeter (192.168.1.0/24).
(c) Employee shall immediately report any unauthorized access attempt or security breach to the IT Security Officer.

3. DURATION & SURVIVAL
This confidentiality covenant shall remain in full force during Employee's tenure and for a period of three (3) years subsequent to separation from Prashanth Enterprises.

4. REMEDIES FOR BREACH
Employee acknowledges that any breach of this covenant causes irreparable harm to the Company, entitling Prashanth Enterprises to injunctive relief and monetary damages under the Information Technology Act, 2000 and Indian Contract Act, 1872.

Employee Full Name: {{EMPLOYEE_NAME}}
Employee Signature: __________________________    Date: {{ACCEPTANCE_DATE}}`
  },
  {
    id: 'TPL-CODE-OF-CONDUCT',
    category: 'EMPLOYMENT_LETTERS',
    code: 'CODE_OF_CONDUCT',
    title: 'Code of Conduct, IT Usage & POSH Policy Acknowledgement',
    description: 'Corporate ethics, attendance logging, cyber safety, and zero-tolerance workplace harassment policy.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `CORPORATE ETHICS, IT SECURITY & WORKPLACE CONDUCT ACKNOWLEDGEMENT

Prashanth Enterprises upholds the highest standards of professional ethics, employee safety, and technical discipline.

1. ATTENDANCE & BIOMETRIC REGISTRATION
- Every employee must record their daily punch IN and punch OUT via the designated Matrix COSEC optical biometric terminals located at office hub gates.
- Late arrivals exceeding 15 minutes beyond shift schedule require manager regularization.

2. IT ASSETS & NETWORK SECURITY
- Enterprise computers, VPN credentials, and intranet services are designated solely for authorized business operations.
- Installation of unlicensed software, peer-to-peer file sharing, or unauthorized external data storage drives is strictly prohibited.

3. PREVENTION OF SEXUAL HARASSMENT (POSH) ACT, 2013
- Prashanth Enterprises operates under a ZERO TOLERANCE policy regarding any form of workplace discrimination or harassment.
- An Internal Complaints Committee (ICC) is established at every regional hub (Hyderabad, Chennai, Mumbai) to investigate complaints with utmost confidentiality.

DECLARATION:
I, {{EMPLOYEE_NAME}}, hereby acknowledge that I have received, reviewed, and agree to strictly comply with the Prashanth Enterprises Code of Conduct, IT Policy, and POSH Regulations.

Employee Signature: __________________________    Date: {{ACCEPTANCE_DATE}}`
  },
  {
    id: 'TPL-ASSET-ALLOCATION',
    category: 'EMPLOYMENT_LETTERS',
    code: 'ASSET_ALLOCATION',
    title: 'Asset Allocation & Equipment Handover Letter',
    description: 'Formal assignment of IT hardware (Laptop, Charger, Access Card, ID Card) with return covenant.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `EQUIPMENT ALLOCATION & CUSTODIAN HANDOVER FORM

Employee Name: {{EMPLOYEE_NAME}}
Employee ID: {{EMPLOYEE_ID}}
Department: {{DEPARTMENT}} | Work Location: {{WORK_LOCATION}}
Issue Date: {{JOINING_DATE}}

ALLOCATED ASSETS:
1. Primary Workstation: {{LAPTOP_DETAILS}}
   Serial Number / Service Tag: {{LAPTOP_SERIAL}}
2. Power Supply & Adapter: {{CHARGER_DETAILS}}
3. RFID Door Controller Card: {{ACCESS_CARD_ID}}
4. Corporate Identity Card: {{EMPLOYEE_ID}}
5. Mobile Device (if applicable): {{COMPANY_PHONE}}

TERMS OF ASSET USAGE:
- The allocated assets remain the exclusive legal property of Prashanth Enterprises Private Limited.
- Employee undertakes to exercise reasonable care and maintain equipment security.
- In the event of separation, employee shall return all allocated equipment in good working order to the IT Operations Helpdesk on or before the last working day.

Employee Signature: __________________________    IT Custodian: Rajesh Kannan`
  },
  {
    id: 'TPL-JOINING-REPORT',
    category: 'EMPLOYMENT_LETTERS',
    code: 'JOINING_REPORT',
    title: 'Employee Joining Report & Declaration',
    description: 'Official confirmation of joining duty on the appointed date and time.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `OFFICIAL JOINING REPORT & COMMENCEMENT OF DUTIES

To:
The Head of Human Resources,
Prashanth Enterprises Private Limited

Dear Sir / Madam,

I, {{EMPLOYEE_NAME}}, hereby report for duty today, {{JOINING_DATE}}, in the forenoon as {{DESIGNATION}} in the {{DEPARTMENT}} department at the {{BRANCH_NAME}} Hub.

I confirm that I have submitted my required identity verifications, educational documents, and statutory declarations. I affirm that all information furnished is true, complete, and accurate.

Employee Full Name: {{EMPLOYEE_NAME}}
Employee ID: {{EMPLOYEE_ID}}
Reporting Manager: {{REPORTING_MANAGER}}
Signature of Employee: __________________________

HR Verification & Onboarding Officer Sign-off:
Pooja Hegde (VP People Operations)`
  },
  {
    id: 'TPL-SERVICE-BOND',
    category: 'AGREEMENTS',
    code: 'SERVICE_BOND',
    title: 'Service Agreement & Training Commitment Covenant',
    description: 'Optional training commitment covenant for specialized or technical cadres.',
    isMandatory: false,
    enabled: false,
    version: '2026.1',
    templateText: `SPECIALIZED TRAINING & SERVICE COMMITMENT COVENANT
(Applicable only where specifically marked by HR)

Employee: {{EMPLOYEE_NAME}}
Cadre: {{DESIGNATION}} | Department: {{DEPARTMENT}}

1. The Company invests substantial resources in providing specialized enterprise infrastructure training.
2. In consideration thereof, the employee agrees to remain in active service of Prashanth Enterprises for a minimum period of {{BOND_PERIOD}} from the Date of Joining.
3. In case of voluntary breach, the employee agrees to reimburse reasonable training expenditure of INR {{BOND_AMOUNT}}/-.

Employee Signature: __________________________`
  },
  {
    id: 'TPL-IP-ASSIGNMENT',
    category: 'AGREEMENTS',
    code: 'IP_ASSIGNMENT',
    title: 'Intellectual Property (IP) & Invention Assignment Agreement',
    description: 'Exclusive assignment of all code, algorithms, designs, and patents created during employment.',
    isMandatory: false,
    enabled: true,
    version: '2026.1',
    templateText: `INTELLECTUAL PROPERTY & INVENTION ASSIGNMENT AGREEMENT

1. WORK FOR HIRE
All software code, engineering blueprints, system architectures, algorithms, and documentation developed by {{EMPLOYEE_NAME}} during employment with Prashanth Enterprises shall constitute "Works Made for Hire" under Indian Copyright and Patent Laws.

2. ASSIGNMENT
Employee hereby irrevocably and exclusively assigns to Prashanth Enterprises all worldwide rights, title, and interest in and to any and all inventions, discoveries, and intellectual property developed during the course of employment.

Employee Name: {{EMPLOYEE_NAME}}
Signature: __________________________    Date: {{ACCEPTANCE_DATE}}`
  },
  {
    id: 'TPL-PF-FORM-11',
    category: 'STATUTORY_FORMS',
    code: 'PF_FORM_11',
    title: 'Employees\' Provident Fund Scheme — Form 11 (Revised)',
    description: 'Statutory declaration form under EPF Scheme, 1952 and EPS, 1995.',
    isMandatory: true,
    enabled: true,
    version: 'GOVT_STATUTORY_FORM_11',
    templateText: `EMPLOYEES' PROVIDENT FUND SCHEME, 1952 (PARAGRAPH 34 & 57)
AND EMPLOYEES' PENSION SCHEME, 1995 (PARAGRAPH 24)
DECLARATION BY A PERSON TAKING UP EMPLOYMENT IN AN ESTABLISHMENT

1. Name of the Member: {{EMPLOYEE_NAME}}
2. Father's / Spouse's Name: {{FATHER_SPOUSE_NAME}}
3. Date of Birth: {{DOB}}
4. Gender: {{GENDER}}
5. Marital Status: {{MARITAL_STATUS}}
6. Email ID: {{EMPLOYEE_EMAIL}} | Mobile: {{EMPLOYEE_PHONE}}
7. Whether earlier a member of Employees' Provident Fund Scheme, 1952? {{PREV_PF_MEMBER}}
8. Whether earlier a member of Employees' Pension Scheme, 1995? {{PREV_EPS_MEMBER}}
9. Previous Universal Account Number (UAN): {{PREV_UAN}}
10. Previous PF Account Number: {{PREV_PF_NUMBER}}
11. Date of Exit from previous employment: {{PREV_EXIT_DATE}}
12. Scheme Certificate No. (if held): {{SCHEME_CERT}}
13. KYC Details:
    - Bank Account Number & IFSC: {{BANK_ACCOUNT_NO}} / {{IFSC_CODE}}
    - Aadhaar Number: {{AADHAAR_MASKED}}
    - PAN Number: {{PAN_NUMBER}}

UNDERTAKING:
I certify that the above declarations are true to the best of my knowledge. In case of any false statement, I shall be liable under Section 14 of the EPF & MP Act, 1952.

Signature of Employee: __________________________`
  },
  {
    id: 'TPL-PF-FORM-2',
    category: 'STATUTORY_FORMS',
    code: 'PF_FORM_2',
    title: 'Employees\' Provident Fund Scheme — Form 2 (Nomination)',
    description: 'Statutory nomination and declaration form for EPF & Employees\' Pension Scheme.',
    isMandatory: true,
    enabled: true,
    version: 'GOVT_STATUTORY_FORM_2',
    templateText: `FORM 2 (REVISED) — NOMINATION AND DECLARATION FORM
(Under Employees' Provident Fund and Employees' Pension Schemes)

Name of Member: {{EMPLOYEE_NAME}}
Father's / Spouse's Name: {{FATHER_SPOUSE_NAME}}
Permanent Address: {{PERMANENT_ADDRESS}}

PART A (EPF NOMINATION):
I hereby nominate the person(s) mentioned below to receive the amount standing to my credit in the Employees' Provident Fund in the event of my death:
- Nominee Name: {{NOMINEE_NAME}}
- Relationship with Member: {{NOMINEE_RELATION}}
- Date of Birth / Age of Nominee: {{NOMINEE_DOB}}
- Proportion / Share: {{NOMINEE_SHARE}}%

PART B (EPS FAMILY DETAILS):
- Family Member 1: {{NOMINEE_NAME}} (Relation: {{NOMINEE_RELATION}})

Signature / Thumb Impression of Member: __________________________`
  },
  {
    id: 'TPL-ESIC-FORM',
    category: 'STATUTORY_FORMS',
    code: 'ESIC_FORM_1',
    title: 'Employees\' State Insurance Corporation (ESIC) — Form 1 Declaration',
    description: 'Declaration form under ESI Act, 1948 (Applicable for monthly gross wages <= ₹21,000).',
    isMandatory: false,
    enabled: false,
    version: 'GOVT_ESIC_FORM_1',
    templateText: `EMPLOYEES' STATE INSURANCE CORPORATION — FORM 1 (REGULATION 11 & 12)
DECLARATION FORM FOR REGISTRATION OF INSURED PERSON

(Eligibility Notice: Applicable only if Employee Monthly Gross Wages <= INR 21,000/-)

1. Insured Person's Name: {{EMPLOYEE_NAME}}
2. Father's / Husband's Name: {{FATHER_SPOUSE_NAME}}
3. Date of Birth: {{DOB}}
4. Present Address: {{CURRENT_ADDRESS}}
5. Permanent Address: {{PERMANENT_ADDRESS}}
6. Branch Office / Dispensary Preferred: {{ESIC_DISPENSARY}}
7. Employer's Code No.: 52000482910001001 (Prashanth Enterprises)
8. Family Details: {{NOMINEE_NAME}} ({{NOMINEE_RELATION}})

Employee Signature: __________________________`
  },
  {
    id: 'TPL-BGV-CONSENT',
    category: 'STATUTORY_FORMS',
    code: 'BGV_CONSENT',
    title: 'Background Verification (BGV) Authorization & Consent',
    description: 'Consent for third-party verification of academic credentials, past employment, and address records.',
    isMandatory: true,
    enabled: true,
    version: '2026.1',
    templateText: `BACKGROUND CHECK & CREDENTIAL VERIFICATION AUTHORIZATION

I, {{EMPLOYEE_NAME}}, hereby grant full consent and authorization to Prashanth Enterprises Private Limited and its appointed third-party verification agencies (e.g. AuthBridge / First Advantage) to conduct comprehensive verification of:
1. Past employment history, service tenures, and conduct records with prior employers.
2. Academic degrees, certificates, and marks statements from universities and boards.
3. Residential address records and criminal background checks through law enforcement databases.

I release Prashanth Enterprises and past institutions from any liability arising from disclosure of verified records.

Employee Name: {{EMPLOYEE_NAME}}
Aadhaar Number (Last 4 Digits): {{AADHAAR_LAST4}}
Signature: __________________________    Date: {{ACCEPTANCE_DATE}}`
  }
];

/**
 * Replaces placeholders in document templates with real candidate/employee data.
 */
export function populateDocumentText(templateText, caseData) {
  if (!templateText) return '';
  const personal = caseData.personal || {};
  const employment = caseData.employment || {};
  const salary = caseData.salary || {};
  const address = caseData.address || {};
  const statutory = caseData.statutoryForms || {};
  const assets = caseData.lettersConfig?.assetAllocation || {};
  const bond = caseData.lettersConfig?.serviceBond || {};

  const replacements = {
    '{{EMPLOYEE_NAME}}': personal.fullName || caseData.candidateInfo?.name || 'Valued Candidate',
    '{{EMPLOYEE_EMAIL}}': personal.personalEmail || caseData.candidateInfo?.email || '',
    '{{EMPLOYEE_PHONE}}': personal.mobile || caseData.candidateInfo?.phone || '',
    '{{EMPLOYEE_ADDRESS}}': address.currentAddress ? `${address.currentAddress}, ${address.city || ''} ${address.pinCode || ''}` : 'Address on File',
    '{{PERMANENT_ADDRESS}}': address.permanentAddress || address.currentAddress || 'On File',
    '{{DESIGNATION}}': employment.designation || caseData.candidateInfo?.jobTitle || 'Specialist',
    '{{DEPARTMENT}}': employment.department || caseData.candidateInfo?.department || 'Information Technology',
    '{{WORK_LOCATION}}': employment.workLocation || `${employment.branch || 'Hyderabad'} Hub`,
    '{{BRANCH_NAME}}': employment.branch || 'Hyderabad',
    '{{JOINING_DATE}}': employment.dateOfJoining || '2026-12-01',
    '{{PROBATION_PERIOD}}': employment.probationPeriod || '6 Months',
    '{{NOTICE_PERIOD}}': employment.noticePeriod || '60 Days',
    '{{EMPLOYEE_ID}}': employment.employeeId || 'EMP-2026-011',
    '{{REPORTING_MANAGER}}': employment.reportingManager || 'Rajesh Kannan',
    '{{ANNUAL_CTC}}': Number(salary.annualCtc || 1800000).toLocaleString('en-IN'),
    '{{ANNUAL_CTC_WORDS}}': 'Eighteen Lakhs',
    '{{MONTHLY_GROSS}}': Number(salary.monthlyGross || 150000).toLocaleString('en-IN'),
    '{{BASIC_SALARY}}': Number(salary.basicSalary || 60000).toLocaleString('en-IN'),
    '{{HRA}}': Number(salary.hra || 30000).toLocaleString('en-IN'),
    '{{SPECIAL_ALLOWANCE}}': Number(salary.specialAllowance || 45000).toLocaleString('en-IN'),
    '{{CURRENT_DATE}}': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    '{{ACCEPTANCE_DATE}}': caseData.signatures?.signedAt ? new Date(caseData.signatures.signedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    '{{DOB}}': personal.dob || '1996-05-15',
    '{{GENDER}}': personal.gender || 'Not Specified',
    '{{MARITAL_STATUS}}': personal.maritalStatus || 'Single',
    '{{FATHER_SPOUSE_NAME}}': caseData.emergencyContact?.name || 'On File',
    '{{PREV_PF_MEMBER}}': statutory.pfForm11?.prevUan ? 'Yes' : 'No',
    '{{PREV_EPS_MEMBER}}': statutory.pfForm11?.prevUan ? 'Yes' : 'No',
    '{{PREV_UAN}}': statutory.pfForm11?.prevUan || 'Not Applicable / Fresh Member',
    '{{PREV_PF_NUMBER}}': statutory.pfForm11?.prevPfNumber || 'N/A',
    '{{PREV_EXIT_DATE}}': 'As per Previous Relieving Letter',
    '{{SCHEME_CERT}}': 'N/A',
    '{{BANK_ACCOUNT_NO}}': caseData.bank?.accountNumber || '5010048291048',
    '{{IFSC_CODE}}': caseData.bank?.ifscCode || 'HDFC0001823',
    '{{AADHAAR_MASKED}}': 'XXXX-XXXX-8921',
    '{{AADHAAR_LAST4}}': '8921',
    '{{PAN_NUMBER}}': 'ABCDE1234F',
    '{{NOMINEE_NAME}}': statutory.pfForm2?.nomineeName || caseData.emergencyContact?.name || 'Family Nominee',
    '{{NOMINEE_RELATION}}': statutory.pfForm2?.nomineeRelation || caseData.emergencyContact?.relationship || 'Parent',
    '{{NOMINEE_DOB}}': 'On Record',
    '{{NOMINEE_SHARE}}': statutory.pfForm2?.nomineeShare || '100',
    '{{ESIC_DISPENSARY}}': 'Hitec City ESI Dispensary, Cyberabad',
    '{{LAPTOP_DETAILS}}': assets.laptopDetails || 'MacBook Pro M3 / 16GB RAM / 512GB SSD',
    '{{LAPTOP_SERIAL}}': assets.laptopSerial || 'C02XYZ12345M',
    '{{CHARGER_DETAILS}}': assets.charger || '70W USB-C Power Adapter with Braided Cable',
    '{{ACCESS_CARD_ID}}': assets.accessCard || 'HID-RFID-8921',
    '{{COMPANY_PHONE}}': assets.companyPhone || 'N/A',
    '{{BOND_PERIOD}}': bond.bondPeriod || '2 Years',
    '{{BOND_AMOUNT}}': Number(bond.bondAmount || 200000).toLocaleString('en-IN')
  };

  let result = templateText;
  for (const [key, val] of Object.entries(replacements)) {
    result = result.split(key).join(val);
  }
  return result;
}

/**
 * Generates an executive, branded HTML email template for sending to candidate.
 */
export function generateOnboardingEmailHtml(caseData, onboardingUrl) {
  const candidateName = caseData.personal?.fullName || caseData.candidateInfo?.name || 'Valued Candidate';
  const designation = caseData.employment?.designation || caseData.candidateInfo?.jobTitle || 'Team Member';
  const doj = caseData.employment?.dateOfJoining || '2026-12-01';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Prashanth Enterprises — Complete Your Onboarding</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%); padding: 36px 40px; text-align: left;">
              <table width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 900; font-size: 20px; width: 44px; height: 44px; line-height: 44px; text-align: center; border-radius: 10px; margin-bottom: 12px;">PE</div>
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">PRASHANTH ENTERPRISES</h1>
                    <p style="color: #93c5fd; font-size: 13px; margin: 4px 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Human Resources & Talent Onboarding</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Congratulations and Welcome, ${candidateName}! 🎉</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
                We are thrilled to welcome you to the Prashanth Enterprises family as our newly appointed <strong>${designation}</strong>. Your scheduled Date of Joining is <strong>${doj}</strong>.
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                To ensure a smooth transition, we have prepared your complete electronic onboarding kit. You can review your formal Appointment Letter, execute your Non-Disclosure Agreement (NDA), and complete your statutory PF/BGV documentation through our secure Onboarding Portal:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${onboardingUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
                      Access Secure Employee Onboarding Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Action List Checklist -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0 0 12px;">What You Need to Complete:</h3>
                <ul style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Verify your personal, address, and bank account information.</li>
                  <li>Review and electronically sign your Appointment Letter & NDA.</li>
                  <li>Fill PF Form 11 (UAN declaration) and Form 2 (Nominee details).</li>
                  <li>Upload clear scanned copies of your Aadhaar Card, PAN Card, and Certificates.</li>
                </ul>
              </div>

              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                If you have any questions prior to joining, feel free to contact our People Operations team at <a href="mailto:hr@prashanthenterprises.in" style="color: #2563eb; text-decoration: none;">hr@prashanthenterprises.in</a> or call +91 40 4829 1000.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 11px; margin: 0; font-weight: 500;">
                Prashanth Enterprises Private Limited • Corporate Headquarters: Plot 42, Hitec City, Cyberabad, Hyderabad 500081
              </p>
              <p style="color: #94a3b8; font-size: 10px; margin: 6px 0 0;">
                This is an automated enterprise invitation sent via Prashanth Enterprises HRMS Onboarding Service.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
