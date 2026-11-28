// Prashanth Enterprises HRMS - Automated Celebration Poster Engine
// Generates high-fidelity personalized celebration posters using HTML5 Canvas & SVG graphics.
// Supports dynamic placeholders: {{EMPLOYEE_NAME}}, {{EMPLOYEE_PHOTO}}, {{EMPLOYEE_ID}}, 
// {{JOINING_DATE}}, {{ANNIVERSARY_YEARS}}, {{BRANCH_NAME}}, {{MESSAGE}}.

/**
 * Default Template Configurations for Prashanth Enterprises
 */
export const DEFAULT_CELEBRATION_TEMPLATES = [
  {
    id: "tpl-welcome-default",
    category: "welcome", // 'welcome' | 'birthday' | 'anniversary'
    name: "Corporate Sapphire Welcome",
    description: "Official welcome banner for new joiners with corporate branding",
    isActive: true,
    width: 800,
    height: 500,
    theme: "blue",
    customBgImage: null,
    photoConfig: {
      x: 400,
      y: 175,
      size: 130,
      shape: "circle", // 'circle' | 'square'
      borderColor: "#38BDF8",
      borderWidth: 5
    },
    nameConfig: {
      x: 400,
      y: 280,
      fontSize: 26,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "800",
      color: "#FFFFFF",
      align: "center"
    },
    roleConfig: {
      x: 400,
      y: 312,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
      color: "#BAE6FD",
      align: "center"
    },
    messageConfig: {
      x: 400,
      y: 365,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
      color: "#F0F9FF",
      align: "center",
      templateText: "Welcome to the Prashanth Enterprises family, {{EMPLOYEE_NAME}}! Wishing you a fruitful and rewarding journey ahead."
    },
    badgeConfig: {
      x: 400,
      y: 85,
      title: "WELCOME ABOARD! 🚀",
      subtitle: "New Joiner Celebration",
      bgColor: "rgba(56, 189, 248, 0.2)",
      borderColor: "#38BDF8",
      textColor: "#38BDF8"
    },
    updatedAt: "2026-11-28T01:00:00+05:30"
  },
  {
    id: "tpl-birthday-default",
    category: "birthday",
    name: "Ruby & Gold Festive Birthday",
    description: "Vibrant festive birthday wish poster with celebration ribbons & confetti",
    isActive: true,
    width: 800,
    height: 500,
    theme: "pink",
    customBgImage: null,
    photoConfig: {
      x: 400,
      y: 175,
      size: 130,
      shape: "circle",
      borderColor: "#F472B6",
      borderWidth: 5
    },
    nameConfig: {
      x: 400,
      y: 280,
      fontSize: 26,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "800",
      color: "#FFFFFF",
      align: "center"
    },
    roleConfig: {
      x: 400,
      y: 312,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
      color: "#FBCFE8",
      align: "center"
    },
    messageConfig: {
      x: 400,
      y: 365,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
      color: "#FFF1F2",
      align: "center",
      templateText: "Wishing you a very Happy Birthday, {{EMPLOYEE_NAME}}! May your year ahead be filled with happiness, health, and stellar success! 🎂🎉"
    },
    badgeConfig: {
      x: 400,
      y: 85,
      title: "HAPPY BIRTHDAY! 🎂",
      subtitle: "Celebrating Your Special Day",
      bgColor: "rgba(244, 114, 182, 0.2)",
      borderColor: "#F472B6",
      textColor: "#F472B6"
    },
    updatedAt: "2026-11-28T01:00:00+05:30"
  },
  {
    id: "tpl-anniversary-default",
    category: "anniversary",
    name: "Royal Emerald & Gold Milestone",
    description: "Prestigious work anniversary celebration poster honoring long-term commitment",
    isActive: true,
    width: 800,
    height: 500,
    theme: "purple",
    customBgImage: null,
    photoConfig: {
      x: 400,
      y: 175,
      size: 130,
      shape: "circle",
      borderColor: "#FBBF24",
      borderWidth: 5
    },
    nameConfig: {
      x: 400,
      y: 280,
      fontSize: 26,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "800",
      color: "#FFFFFF",
      align: "center"
    },
    roleConfig: {
      x: 400,
      y: 312,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
      color: "#FDE68A",
      align: "center"
    },
    messageConfig: {
      x: 400,
      y: 365,
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "500",
      color: "#FEF3C7",
      align: "center",
      templateText: "Congratulations on completing {{ANNIVERSARY_YEARS}} at Prashanth Enterprises! Thank you for your leadership and remarkable dedication."
    },
    badgeConfig: {
      x: 400,
      y: 85,
      title: "WORK ANNIVERSARY MILESTONE 🎖️",
      subtitle: "Honoring Dedication & Growth",
      bgColor: "rgba(251, 191, 36, 0.2)",
      borderColor: "#FBBF24",
      textColor: "#FBBF24"
    },
    updatedAt: "2026-11-28T01:00:00+05:30"
  }
];

/**
 * Helper to replace all celebration placeholders in a text string
 */
export function interpolatePlaceholders(text, employee, eventData = {}) {
  if (!text) return '';
  const empName = employee?.name || 'Valued Team Member';
  const empId = employee?.employeeId || employee?.id || 'EMP';
  const branch = employee?.branch || 'Hyderabad';
  const joiningDate = employee?.joiningDate || '2024';
  const years = eventData.completedYears || 1;
  const yearsText = `${years} Year${years > 1 ? 's' : ''}`;
  const customMessage = eventData.message || '';

  return text
    .replace(/\{\{EMPLOYEE_NAME\}\}/g, empName)
    .replace(/\{\{EMPLOYEE_ID\}\}/g, empId)
    .replace(/\{\{BRANCH_NAME\}\}/g, branch)
    .replace(/\{\{JOINING_DATE\}\}/g, joiningDate)
    .replace(/\{\{ANNIVERSARY_YEARS\}\}/g, yearsText)
    .replace(/\{\{MESSAGE\}\}/g, customMessage);
}

/**
 * Safely loads an image into an Image element with CORS handling.
 */
function loadImageSafe(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Could not load image source:", src);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Draw background styling onto canvas based on category theme
 */
function drawThemeBackground(ctx, width, height, theme, category) {
  let grad;
  if (theme === 'blue' || category === 'welcome') {
    grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.4, '#1E3A8A');
    grad.addColorStop(1, '#0369A1');
  } else if (theme === 'pink' || category === 'birthday') {
    grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1E1B4B');
    grad.addColorStop(0.4, '#831843');
    grad.addColorStop(1, '#B91C1C');
  } else {
    // Purple / Anniversary
    grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1E1B4B');
    grad.addColorStop(0.4, '#581C87');
    grad.addColorStop(1, '#92400E');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Background artistic glow flares
  ctx.save();
  const radGlow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, 260);
  radGlow1.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  radGlow1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, width, height);

  const radGlow2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 10, width * 0.15, height * 0.85, 240);
  radGlow2.addColorStop(0, 'rgba(253, 224, 71, 0.15)');
  radGlow2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Subtle celebratory sparkles & confetti dots
  ctx.save();
  const particleColors = ['#FDE047', '#38BDF8', '#F472B6', '#FFFFFF', '#A78BFA'];
  for (let i = 0; i < 40; i++) {
    const px = (Math.sin(i * 997) * 0.5 + 0.5) * width;
    const py = (Math.cos(i * 613) * 0.5 + 0.5) * height;
    const size = (i % 3) + 1.5;
    ctx.fillStyle = particleColors[i % particleColors.length];
    ctx.globalAlpha = 0.4 + (i % 5) * 0.1;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Decorative border around canvas
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.restore();
}

/**
 * Draws rounded rectangle path
 */
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Main poster generation function
 * Takes a template, employee object, and event metadata.
 * Returns a high-res Data URL (PNG) of the rendered poster.
 */
export async function generateCelebrationPoster(template, employee, eventData = {}) {
  const width = template.width || 800;
  const height = template.height || 500;

  // Create an offscreen canvas
  let canvas;
  if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  } else {
    // Node environment fallback / mock
    return generateFallbackSvgPoster(template, employee, eventData);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return generateFallbackSvgPoster(template, employee, eventData);

  // 1. Draw Background
  if (template.customBgImage) {
    const bgImg = await loadImageSafe(template.customBgImage);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, width, height);
      // Dark overlay for text readability
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(0, 0, width, height);
    } else {
      drawThemeBackground(ctx, width, height, template.theme, template.category);
    }
  } else {
    drawThemeBackground(ctx, width, height, template.theme, template.category);
  }

  // 2. Header Badge Banner
  const badge = template.badgeConfig || {};
  const badgeTitle = eventData.badgeTitle || badge.title || "CELEBRATION";
  const badgeSubtitle = eventData.badgeSubtitle || badge.subtitle || "Prashanth Enterprises Intranet";

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Badge pill
  const pillW = 380;
  const pillH = 36;
  const pillX = (width - pillW) / 2;
  const pillY = 32;

  ctx.fillStyle = badge.bgColor || 'rgba(255, 255, 255, 0.12)';
  roundedRect(ctx, pillX, pillY, pillW, pillH, 18);
  ctx.fill();

  ctx.strokeStyle = badge.borderColor || '#38BDF8';
  ctx.lineWidth = 1.5;
  roundedRect(ctx, pillX, pillY, pillW, pillH, 18);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = "800 13px 'Inter', sans-serif";
  ctx.fillText(badgeTitle, width / 2, pillY + pillH / 2);
  ctx.restore();

  // 3. Draw Employee Avatar Photo
  const pCfg = template.photoConfig || { x: width / 2, y: 175, size: 130, shape: 'circle' };
  const pX = pCfg.x !== undefined ? pCfg.x : width / 2;
  const pY = pCfg.y !== undefined ? pCfg.y : 175;
  const pSize = pCfg.size || 130;
  const pRadius = pSize / 2;

  const photoUrl = employee?.avatar || employee?.personal?.profilePhoto || null;
  const avatarImg = photoUrl ? await loadImageSafe(photoUrl) : null;

  ctx.save();
  if (pCfg.shape === 'circle') {
    // Shadow glow
    ctx.shadowColor = pCfg.borderColor || '#38BDF8';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clip circle
    ctx.beginPath();
    ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
    ctx.clip();

    if (avatarImg) {
      ctx.drawImage(avatarImg, pX - pRadius, pY - pRadius, pSize, pSize);
    } else {
      // Fallback stylized initials avatar
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(pX - pRadius, pY - pRadius, pSize, pSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(pSize * 0.4)}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = (employee?.name || 'PE').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      ctx.fillText(initials, pX, pY);
    }

    ctx.restore();

    // Circle Border
    ctx.save();
    ctx.strokeStyle = pCfg.borderColor || '#38BDF8';
    ctx.lineWidth = pCfg.borderWidth || 4;
    ctx.beginPath();
    ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else {
    // Rectangular / Rounded Square
    const rectX = pX - pRadius;
    const rectY = pY - pRadius;

    ctx.shadowColor = pCfg.borderColor || '#38BDF8';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#0F172A';
    roundedRect(ctx, rectX, rectY, pSize, pSize, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.save();
    roundedRect(ctx, rectX, rectY, pSize, pSize, 16);
    ctx.clip();

    if (avatarImg) {
      ctx.drawImage(avatarImg, rectX, rectY, pSize, pSize);
    } else {
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(rectX, rectY, pSize, pSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(pSize * 0.4)}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = (employee?.name || 'PE').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      ctx.fillText(initials, pX, pY);
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = pCfg.borderColor || '#38BDF8';
    ctx.lineWidth = pCfg.borderWidth || 4;
    roundedRect(ctx, rectX, rectY, pSize, pSize, 16);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Employee Name
  const nCfg = template.nameConfig || { x: width / 2, y: 280, fontSize: 26, color: '#FFFFFF', align: 'center' };
  ctx.save();
  ctx.font = `${nCfg.fontWeight || '800'} ${nCfg.fontSize || 26}px ${nCfg.fontFamily || "'Inter', sans-serif"}`;
  ctx.fillStyle = nCfg.color || '#FFFFFF';
  ctx.textAlign = nCfg.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText(employee?.name || 'Valued Employee', nCfg.x, nCfg.y);
  ctx.restore();

  // 5. Designation, Department & Branch Pill
  const rCfg = template.roleConfig || { x: width / 2, y: 312, fontSize: 14, color: '#BAE6FD', align: 'center' };
  const roleText = `${employee?.role || 'Staff Member'} • ${employee?.department || 'Operations'} (${employee?.branch || 'Hyderabad'})`;
  ctx.save();
  ctx.font = `600 ${rCfg.fontSize || 14}px ${rCfg.fontFamily || "'Inter', sans-serif"}`;
  ctx.fillStyle = rCfg.color || '#BAE6FD';
  ctx.textAlign = rCfg.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 4;
  ctx.fillText(roleText, rCfg.x, rCfg.y);
  ctx.restore();

  // 6. Celebration Message
  const mCfg = template.messageConfig || { x: width / 2, y: 365, fontSize: 14, color: '#F0F9FF', align: 'center' };
  const rawMessage = eventData.message || mCfg.templateText || "Wishing you continued success and joy at Prashanth Enterprises!";
  const finalMessage = interpolatePlaceholders(rawMessage, employee, eventData);

  ctx.save();
  ctx.font = `500 ${mCfg.fontSize || 14}px ${mCfg.fontFamily || "'Inter', sans-serif"}`;
  ctx.fillStyle = mCfg.color || '#F0F9FF';
  ctx.textAlign = mCfg.align || 'center';
  ctx.textBaseline = 'middle';

  // Word wrap for long messages
  const maxMsgW = width - 120;
  wrapText(ctx, finalMessage, mCfg.x, mCfg.y, maxMsgW, 22);
  ctx.restore();

  // 7. Footer Branding
  ctx.save();
  ctx.font = "700 11px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PRASHANTH ENTERPRISES • AUTOMATED ENTERPRISE CELEBRATIONS", width / 2, height - 24);
  ctx.restore();

  // Return base64 PNG data URL
  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Canvas multi-line text wrapping utility
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Center vertical offset if multiple lines
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  for (let k = 0; k < lines.length; k++) {
    ctx.fillText(lines[k], x, startY + (k * lineHeight));
  }
}

/**
 * Fallback SVG data URL generator (works in Node.js / offline / serverless without DOM)
 */
export function generateFallbackSvgPoster(template, employee, eventData = {}) {
  const width = template?.width || 800;
  const height = template?.height || 500;
  const empName = employee?.name || 'Valued Team Member';
  const role = employee?.role || 'Team Member';
  const dept = employee?.department || 'Operations';
  const branch = employee?.branch || 'Hyderabad';
  const category = template?.category || 'celebration';
  const message = interpolatePlaceholders(
    eventData.message || template?.messageConfig?.templateText || "Wishing you joy and success!",
    employee,
    eventData
  );

  let bgGrad1 = '#0F172A';
  let bgGrad2 = '#1E3A8A';
  let accent = '#38BDF8';
  let badgeTitle = 'WELCOME ABOARD! 🚀';

  if (category === 'birthday') {
    bgGrad1 = '#1E1B4B';
    bgGrad2 = '#831843';
    accent = '#F472B6';
    badgeTitle = 'HAPPY BIRTHDAY! 🎂';
  } else if (category === 'anniversary') {
    bgGrad1 = '#1E1B4B';
    bgGrad2 = '#581C87';
    accent = '#FBBF24';
    badgeTitle = `WORK ANNIVERSARY MILESTONE 🎖️`;
  }

  const initials = empName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarUrl = employee?.avatar || '';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGrad1}" />
      <stop offset="50%" stop-color="${bgGrad2}" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <clipPath id="circleClip">
      <circle cx="400" cy="175" r="65" />
    </clipPath>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" rx="8" />

  <!-- Badge Pill -->
  <rect x="210" y="32" width="380" height="36" rx="18" fill="rgba(255,255,255,0.12)" stroke="${accent}" stroke-width="1.5" />
  <text x="400" y="55" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">${badgeTitle}</text>

  <!-- Avatar -->
  <circle cx="400" cy="175" r="67" fill="none" stroke="${accent}" stroke-width="4" />
  ${avatarUrl ? `
  <image href="${avatarUrl}" x="335" y="110" width="130" height="130" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid slice" />
  ` : `
  <circle cx="400" cy="175" r="65" fill="#1E3A8A" />
  <text x="400" y="185" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  `}

  <!-- Name -->
  <text x="400" y="285" font-family="system-ui, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF" text-anchor="middle">${empName}</text>
  
  <!-- Designation -->
  <text x="400" y="315" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#BAE6FD" text-anchor="middle">${role} • ${dept} (${branch})</text>

  <!-- Message -->
  <text x="400" y="370" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#F0F9FF" text-anchor="middle">${message}</text>

  <!-- Footer -->
  <text x="400" y="475" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle">PRASHANTH ENTERPRISES • AUTOMATED ENTERPRISE CELEBRATIONS</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
