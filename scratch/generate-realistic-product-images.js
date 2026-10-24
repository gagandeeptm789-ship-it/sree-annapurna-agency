import fs from 'fs'
import path from 'path'

const outputDir = path.resolve('public', 'images', 'products')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Common studio backdrop & shadow defs
const commonDefs = `
    <radialGradient id="studio-bg" cx="50%" cy="40%" r="65%" fx="45%" fy="30%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#faf7f0"/>
      <stop offset="100%" stop-color="#ede5d5"/>
    </radialGradient>
    <filter id="contact-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="9"/>
    </filter>
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf1c8"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa8010"/>
      <stop offset="100%" stop-color="#e8cf65"/>
    </linearGradient>
    <linearGradient id="foil-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="white" stop-opacity="0.0"/>
      <stop offset="25%" stop-color="white" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="white" stop-opacity="0.05"/>
      <stop offset="80%" stop-color="white" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.0"/>
    </linearGradient>
`

function vegBadge(x, y) {
  return `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="0" width="16" height="16" rx="2" fill="#ffffff" stroke="#238838" stroke-width="1.5"/>
      <circle cx="8" cy="8" r="4.5" fill="#238838"/>
    </g>
  `
}

// -------------------------------------------------------------
// 1. SWASTIK MANGO PICKLE (Transparent glass jar with red lid & visible mango pickle)
// -------------------------------------------------------------
function svgSwastikMangoPickle() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Red Lid Gradients -->
    <linearGradient id="red-lid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8a1111"/>
      <stop offset="18%" stop-color="#c92222"/>
      <stop offset="50%" stop-color="#e83e3e"/>
      <stop offset="82%" stop-color="#c92222"/>
      <stop offset="100%" stop-color="#7a0e0e"/>
    </linearGradient>
    <!-- Pickle Contents Gradient -->
    <linearGradient id="mango-gravy" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7a1f05"/>
      <stop offset="30%" stop-color="#b53f09"/>
      <stop offset="70%" stop-color="#cf500e"/>
      <stop offset="100%" stop-color="#691a03"/>
    </linearGradient>
    <!-- Glass Reflections -->
    <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Studio Surface Backdrop -->
  <rect width="500" height="500" fill="url(#studio-bg)"/>
  
  <!-- Studio Contact Shadow -->
  <ellipse cx="250" cy="428" rx="135" ry="16" fill="rgba(40, 30, 20, 0.22)" filter="url(#contact-shadow)"/>
  <ellipse cx="250" cy="426" rx="90" ry="9" fill="rgba(30, 20, 10, 0.35)" filter="url(#contact-shadow)"/>

  <!-- JAR BASE & GLASS BODY (Clear transparent jar) -->
  <!-- Glass bottom base -->
  <rect x="156" y="380" width="188" height="28" rx="14" fill="#d9d4c7" stroke="#b0a896" stroke-width="1.5"/>
  <rect x="159" y="382" width="182" height="22" rx="11" fill="#edeae1"/>

  <!-- Inner Pickle Contents visible through glass -->
  <path d="M 152 165 C 152 145, 175 140, 195 140 L 305 140 C 325 140, 348 145, 348 165 L 344 382 C 344 394, 330 400, 310 400 L 190 400 C 170 400, 156 394, 156 382 Z" fill="url(#mango-gravy)"/>

  <!-- Visible Spiced Mango Pickle Chunks inside -->
  <!-- Mango chunk 1 (top left) -->
  <path d="M 165 170 Q 185 160 205 175 Q 210 195 190 205 Q 168 200 165 170 Z" fill="#e07314" stroke="#8f2b05" stroke-width="1.2"/>
  <path d="M 175 172 Q 192 166 200 180" stroke="#fcd34d" stroke-width="2" fill="none" opacity="0.8"/>
  <!-- Mango chunk 2 (top right) -->
  <path d="M 290 165 Q 320 170 335 190 Q 325 210 300 205 Q 285 190 290 165 Z" fill="#d4650d" stroke="#8f2b05" stroke-width="1.2"/>
  <path d="M 298 174 Q 318 180 322 195" stroke="#fcd34d" stroke-width="2" fill="none" opacity="0.8"/>
  <!-- Mustard seeds & chili flakes inside gravy -->
  <circle cx="178" cy="195" r="2.5" fill="#fef08a"/>
  <circle cx="192" cy="182" r="2" fill="#1c1917"/>
  <circle cx="215" cy="198" r="2" fill="#1c1917"/>
  <circle cx="285" cy="188" r="2.5" fill="#fef08a"/>
  <circle cx="318" cy="178" r="2" fill="#1c1917"/>
  <circle cx="330" cy="202" r="2.5" fill="#991b1b"/>
  <!-- Mango chunk 3 (lower visible) -->
  <path d="M 168 340 Q 200 330 220 350 Q 210 380 180 382 Q 160 370 168 340 Z" fill="#d9680f" stroke="#7a2003" stroke-width="1.2"/>
  <path d="M 280 345 Q 310 335 330 355 Q 325 385 295 385 Q 275 375 280 345 Z" fill="#e07314" stroke="#7a2003" stroke-width="1.2"/>
  <circle cx="240" cy="360" r="2.5" fill="#fef08a"/>
  <circle cx="260" cy="375" r="2" fill="#1c1917"/>
  <circle cx="195" cy="368" r="2.5" fill="#7f1d1d"/>

  <!-- Glass jar outer contour & gloss -->
  <path d="M 150 160 C 150 135, 175 130, 200 130 L 300 130 C 325 130, 350 135, 350 160 L 346 385 C 346 398, 330 404, 308 404 L 192 404 C 170 404, 154 398, 154 385 Z" fill="none" stroke="#cfc7b4" stroke-width="2.5"/>

  <!-- Specular vertical glass highlights -->
  <path d="M 160 160 L 164 382" stroke="url(#glass-specular)" stroke-width="12" stroke-linecap="round"/>
  <path d="M 172 165 L 174 380" stroke="#ffffff" stroke-width="2" stroke-opacity="0.75" stroke-linecap="round"/>
  <path d="M 334 165 L 332 380" stroke="#ffffff" stroke-width="3" stroke-opacity="0.45" stroke-linecap="round"/>

  <!-- BRAND WRAP-AROUND LABEL (Centered on Jar) -->
  <g transform="translate(162, 210)">
    <!-- Label Background with cream paper texture & green header band -->
    <rect x="0" y="0" width="176" height="128" rx="5" fill="#fffdfa" stroke="#d5cdbc" stroke-width="1.5"/>
    
    <!-- Top Green Heritage Band -->
    <path d="M 0 5 C 0 2, 2 0, 5 0 L 171 0 C 174 0, 176 2, 176 5 L 176 34 L 0 34 Z" fill="#174d35"/>
    <line x1="0" y1="34" x2="176" y2="34" stroke="#d4af37" stroke-width="1.5"/>

    <!-- Brand Hallmark -->
    <text x="88" y="16" font-family="'Poppins', sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">SWASTIK</text>
    <text x="88" y="27" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#d9a441" text-anchor="middle" letter-spacing="1.2">HERITAGE PICKLES</text>

    <!-- Product Name Section -->
    <rect x="10" y="42" width="156" height="26" rx="3" fill="#faf2e3" stroke="#e0cfa6" stroke-width="1"/>
    <text x="88" y="58" font-family="'Poppins', sans-serif" font-size="12" font-weight="800" fill="#991b1b" text-anchor="middle" letter-spacing="0.5">MANGO PICKLE</text>

    <!-- Subtitle / Traditional Recipe -->
    <text x="88" y="77" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#44403c" text-anchor="middle">Aged in Cold-Pressed Mustard Oil</text>
    <text x="88" y="87" font-family="'Inter', sans-serif" font-size="6" font-weight="500" fill="#78716c" text-anchor="middle">Authentic South Indian Spiced Recipe</text>

    <!-- Small Mango Illustration icon on label -->
    <g transform="translate(78, 92)">
      <path d="M 10 4 C 18 4, 22 14, 14 20 C 6 22, 2 14, 10 4 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
      <path d="M 12 4 C 13 1, 15 0, 18 1" stroke="#15803d" stroke-width="1.2" fill="none"/>
    </g>

    <!-- Vegetarian Dot & Net Wt -->
    ${vegBadge(8, 102)}
    <text x="164" y="114" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#174d35" text-anchor="end">Net Wt: 300 g</text>
  </g>

  <!-- JAR NECK & THREAD -->
  <rect x="180" y="124" width="140" height="12" rx="3" fill="#ded8cc" stroke="#b0a896" stroke-width="1.5"/>

  <!-- RED TWIST-OFF LID (Realistic Ribbed Red Cap) -->
  <g id="jar-lid">
    <!-- Lid Shadow -->
    <rect x="162" y="122" width="176" height="5" rx="2" fill="rgba(0,0,0,0.2)"/>
    <!-- Lid Main Body -->
    <rect x="164" y="82" width="172" height="42" rx="5" fill="url(#red-lid-grad)" stroke="#660a0a" stroke-width="1.5"/>
    <!-- Lid Top Dome -->
    <ellipse cx="250" cy="84" rx="86" ry="10" fill="#e83e3e"/>
    <ellipse cx="250" cy="83" rx="80" ry="7" fill="#ff5c5c" opacity="0.6"/>
    <!-- Ribbed grips on cap -->
    <line x1="176" y1="88" x2="176" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="178" y1="88" x2="178" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="192" y1="88" x2="192" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="194" y1="88" x2="194" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="208" y1="88" x2="208" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="210" y1="88" x2="210" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="224" y1="88" x2="224" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="226" y1="88" x2="226" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="240" y1="88" x2="240" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="242" y1="88" x2="242" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="256" y1="88" x2="256" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="258" y1="88" x2="258" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="272" y1="88" x2="272" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="274" y1="88" x2="274" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="288" y1="88" x2="288" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="290" y1="88" x2="290" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="304" y1="88" x2="304" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="306" y1="88" x2="306" y2="120" stroke="#ff7373" stroke-width="1"/>
    <line x1="320" y1="88" x2="320" y2="120" stroke="#7a0e0e" stroke-width="2"/>
    <line x1="322" y1="88" x2="322" y2="120" stroke="#ff7373" stroke-width="1"/>
    <!-- Gold Security Seal Ring below lid -->
    <rect x="168" y="120" width="164" height="4" fill="url(#gold-foil)"/>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 2. SWASTIK LIME PICKLE (Transparent glass jar with yellow/green lid & visible lime pickle)
// -------------------------------------------------------------
function svgSwastikLimePickle() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Zesty Yellow/Green Lid Gradient -->
    <linearGradient id="lime-lid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b48206"/>
      <stop offset="20%" stop-color="#eab308"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#9a6e04"/>
    </linearGradient>
    <!-- Lime Pickle Contents Gradient (Tangy yellow-mustard & green cured lime) -->
    <linearGradient id="lime-gravy" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="30%" stop-color="#ca8a04"/>
      <stop offset="70%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <!-- Glass Specular -->
    <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Studio Surface Backdrop -->
  <rect width="500" height="500" fill="url(#studio-bg)"/>
  
  <!-- Studio Contact Shadow -->
  <ellipse cx="250" cy="428" rx="135" ry="16" fill="rgba(40, 30, 20, 0.22)" filter="url(#contact-shadow)"/>
  <ellipse cx="250" cy="426" rx="90" ry="9" fill="rgba(30, 20, 10, 0.35)" filter="url(#contact-shadow)"/>

  <!-- JAR BASE & GLASS BODY -->
  <rect x="156" y="380" width="188" height="28" rx="14" fill="#d9d4c7" stroke="#b0a896" stroke-width="1.5"/>
  <rect x="159" y="382" width="182" height="22" rx="11" fill="#edeae1"/>

  <!-- Inner Cured Lime Pickle Gravy -->
  <path d="M 152 165 C 152 145, 175 140, 195 140 L 305 140 C 325 140, 348 145, 348 165 L 344 382 C 344 394, 330 400, 310 400 L 190 400 C 170 400, 156 394, 156 382 Z" fill="url(#lime-gravy)"/>

  <!-- Visible Lime Wedges / Pieces through Glass -->
  <!-- Lime wedge 1 (top left) -->
  <path d="M 166 170 C 180 155, 205 160, 215 180 C 195 195, 175 195, 166 170 Z" fill="#65a30d" stroke="#365314" stroke-width="1.2"/>
  <path d="M 175 174 Q 190 170 205 180" stroke="#bef264" stroke-width="2.5" fill="none"/>
  <!-- Lime wedge 2 (top right) -->
  <path d="M 285 168 C 305 158, 328 170, 335 195 C 315 205, 295 195, 285 168 Z" fill="#eab308" stroke="#854d0e" stroke-width="1.2"/>
  <path d="M 295 175 Q 315 178 325 190" stroke="#fef08a" stroke-width="2" fill="none"/>
  <!-- Chili & mustard seeds in lime pickle -->
  <circle cx="180" cy="195" r="2" fill="#1c1917"/>
  <circle cx="205" cy="188" r="2.5" fill="#b91c1c"/>
  <circle cx="280" cy="185" r="2" fill="#1c1917"/>
  <circle cx="310" cy="195" r="2.5" fill="#b91c1c"/>
  <circle cx="325" cy="175" r="2" fill="#1c1917"/>
  <!-- Lime wedges lower -->
  <path d="M 168 340 C 190 330, 215 345, 218 375 C 195 385, 175 370, 168 340 Z" fill="#84cc16" stroke="#365314" stroke-width="1.2"/>
  <path d="M 285 345 C 310 330, 330 350, 332 378 C 310 385, 290 375, 285 345 Z" fill="#eab308" stroke="#854d0e" stroke-width="1.2"/>
  <circle cx="240" cy="355" r="2.5" fill="#1c1917"/>
  <circle cx="260" cy="370" r="2.5" fill="#b91c1c"/>

  <!-- Glass jar outer contour & gloss -->
  <path d="M 150 160 C 150 135, 175 130, 200 130 L 300 130 C 325 130, 350 135, 350 160 L 346 385 C 346 398, 330 404, 308 404 L 192 404 C 170 404, 154 398, 154 385 Z" fill="none" stroke="#cfc7b4" stroke-width="2.5"/>

  <!-- Specular vertical glass highlights -->
  <path d="M 160 160 L 164 382" stroke="url(#glass-specular)" stroke-width="12" stroke-linecap="round"/>
  <path d="M 172 165 L 174 380" stroke="#ffffff" stroke-width="2" stroke-opacity="0.75" stroke-linecap="round"/>
  <path d="M 334 165 L 332 380" stroke="#ffffff" stroke-width="3" stroke-opacity="0.45" stroke-linecap="round"/>

  <!-- BRAND WRAP-AROUND LABEL -->
  <g transform="translate(162, 210)">
    <rect x="0" y="0" width="176" height="128" rx="5" fill="#fffdfa" stroke="#d5cdbc" stroke-width="1.5"/>
    
    <!-- Top Green Heritage Band -->
    <path d="M 0 5 C 0 2, 2 0, 5 0 L 171 0 C 174 0, 176 2, 176 5 L 176 34 L 0 34 Z" fill="#174d35"/>
    <line x1="0" y1="34" x2="176" y2="34" stroke="#d4af37" stroke-width="1.5"/>

    <text x="88" y="16" font-family="'Poppins', sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">SWASTIK</text>
    <text x="88" y="27" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#d9a441" text-anchor="middle" letter-spacing="1.2">HERITAGE PICKLES</text>

    <!-- Product Name Section -->
    <rect x="10" y="42" width="156" height="26" rx="3" fill="#fefce8" stroke="#ca8a04" stroke-width="1"/>
    <text x="88" y="58" font-family="'Poppins', sans-serif" font-size="12" font-weight="800" fill="#854d0e" text-anchor="middle" letter-spacing="0.5">LIME PICKLE</text>

    <text x="88" y="77" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#44403c" text-anchor="middle">Zesty Cured Lemons in Mustard Oil</text>
    <text x="88" y="87" font-family="'Inter', sans-serif" font-size="6" font-weight="500" fill="#78716c" text-anchor="middle">Authentic Tangy &amp; Spiced Recipe</text>

    <!-- Lime wedge motif -->
    <g transform="translate(78, 92)">
      <circle cx="10" cy="11" r="9" fill="#84cc16" stroke="#4d7c0f" stroke-width="0.8"/>
      <circle cx="10" cy="11" r="7" fill="#fef08a"/>
      <line x1="10" y1="4" x2="10" y2="18" stroke="#65a30d" stroke-width="0.8"/>
      <line x1="3" y1="11" x2="17" y2="11" stroke="#65a30d" stroke-width="0.8"/>
    </g>

    ${vegBadge(8, 102)}
    <text x="164" y="114" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#174d35" text-anchor="end">Net Wt: 300 g</text>
  </g>

  <!-- JAR NECK & THREAD -->
  <rect x="180" y="124" width="140" height="12" rx="3" fill="#ded8cc" stroke="#b0a896" stroke-width="1.5"/>

  <!-- YELLOW/GREEN TWIST-OFF LID -->
  <g id="jar-lid">
    <rect x="162" y="122" width="176" height="5" rx="2" fill="rgba(0,0,0,0.2)"/>
    <rect x="164" y="82" width="172" height="42" rx="5" fill="url(#lime-lid-grad)" stroke="#854d0e" stroke-width="1.5"/>
    <ellipse cx="250" cy="84" rx="86" ry="10" fill="#fef08a"/>
    <ellipse cx="250" cy="83" rx="80" ry="7" fill="#ffffff" opacity="0.6"/>
    <!-- Lid Ribs -->
    ${[176,192,208,224,240,256,272,288,304,320].map((x) => `
      <line x1="${x}" y1="88" x2="${x}" y2="120" stroke="#a16207" stroke-width="2"/>
      <line x1="${x+2}" y1="88" x2="${x+2}" y2="120" stroke="#fef9c3" stroke-width="1"/>
    `).join('')}
    <!-- Gold Rim -->
    <rect x="168" y="120" width="164" height="4" fill="url(#gold-foil)"/>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 3. POUCH GENERATOR (Sealed Retail Pouches for Spices & Mixes)
// -------------------------------------------------------------
function svgRetailPouch({
  id,
  brand,
  productTitle,
  subtitle,
  category,
  pack,
  themeColor,
  accentColor,
  dishIconType = 'bowl',
}) {
  const pouchGradId = `pouch-grad-${id}`
  const headerGradId = `hdr-grad-${id}`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <linearGradient id="${pouchGradId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${themeColor}"/>
      <stop offset="25%" stop-color="${accentColor}"/>
      <stop offset="65%" stop-color="${themeColor}"/>
      <stop offset="100%" stop-color="${themeColor}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="${headerGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <!-- Studio Surface Backdrop -->
  <rect width="500" height="500" fill="url(#studio-bg)"/>
  
  <!-- Soft Studio Ground Shadow -->
  <ellipse cx="250" cy="432" rx="145" ry="17" fill="rgba(35, 25, 15, 0.22)" filter="url(#contact-shadow)"/>
  <ellipse cx="250" cy="430" rx="100" ry="9" fill="rgba(25, 18, 10, 0.32)" filter="url(#contact-shadow)"/>

  <!-- POUCH 3D BODY -->
  <!-- Top Heat-Sealed Crimp (with micro-ridges) -->
  <path d="M 132 82 L 368 82 L 362 108 L 138 108 Z" fill="${themeColor}" stroke="#1e293b" stroke-width="1.2"/>
  <rect x="135" y="82" width="230" height="26" fill="url(#gold-foil)" opacity="0.85"/>
  <!-- Crimp texture micro-lines -->
  ${[142,150,158,166,174,182,190,198,206,214,222,230,238,246,254,262,270,278,286,294,302,310,318,326,334,342,350,358].map((x) => `
    <line x1="${x}" y1="83" x2="${x}" y2="107" stroke="#78350f" stroke-width="1.5" opacity="0.6"/>
  `).join('')}
  <!-- Euro-slot / Peg hole in top seal -->
  <path d="M 235 94 C 235 91, 238 88, 243 88 L 257 88 C 262 88, 265 91, 265 94 L 265 95 C 265 98, 262 101, 257 101 L 243 101 C 238 101, 235 98, 235 95 Z" fill="#faf7f0" stroke="#78350f" stroke-width="1"/>
  <!-- Tear notches on sides of top seal -->
  <polygon points="132,108 140,111 132,114" fill="#faf7f0"/>
  <polygon points="368,108 360,111 368,114" fill="#faf7f0"/>

  <!-- Main Pillow Pouch Body (with realistic curved 3D lighting) -->
  <path d="M 138 108 C 122 180, 120 320, 142 410 C 180 422, 320 422, 358 410 C 380 320, 378 180, 362 108 Z" fill="url(#${pouchGradId})" stroke="#0f172a" stroke-width="1.5"/>

  <!-- Foil Sheen / 3D Specular Highlight layer -->
  <path d="M 148 112 C 135 180, 134 320, 150 405 C 190 415, 310 415, 350 405 C 366 320, 365 180, 352 112 Z" fill="url(#foil-sheen)"/>

  <!-- Bottom Heat Seal / Stand-up Gusset Base -->
  <path d="M 142 410 C 180 422, 320 422, 358 410 L 354 424 C 320 434, 180 434, 146 424 Z" fill="#1e293b" opacity="0.4"/>
  <path d="M 146 408 L 354 408 L 350 418 L 150 418 Z" fill="url(#gold-foil)" opacity="0.75"/>

  <!-- POUCH GRAPHIC ARTWORK & BRANDING -->
  <!-- Top Brand Header Block -->
  <g transform="translate(145, 124)">
    <rect x="0" y="0" width="210" height="42" rx="4" fill="#ffffff" opacity="0.95"/>
    <rect x="0" y="0" width="210" height="42" rx="4" fill="none" stroke="#d4af37" stroke-width="1.5"/>
    <text x="105" y="22" font-family="'Poppins', sans-serif" font-size="16" font-weight="800" fill="#143e2b" text-anchor="middle" letter-spacing="2">${brand.toUpperCase()}</text>
    <text x="105" y="34" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#b45309" text-anchor="middle" letter-spacing="1">AUTHENTIC QUALITY ASSURED</text>
  </g>

  <!-- Central Product Feature Card / Vignette -->
  <g transform="translate(150, 178)">
    <!-- White Card Background for High Readability -->
    <rect x="0" y="0" width="200" height="156" rx="8" fill="#ffffff" stroke="#e2d8c3" stroke-width="1.5"/>
    
    <!-- Decorative Category Ribbon -->
    <rect x="15" y="10" width="170" height="20" rx="3" fill="${themeColor}"/>
    <text x="100" y="24" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1.2">${category.toUpperCase()}</text>

    <!-- Product Title -->
    <text x="100" y="52" font-family="'Poppins', sans-serif" font-size="14" font-weight="800" fill="#1c1917" text-anchor="middle">${productTitle}</text>
    <line x1="40" y1="60" x2="160" y2="60" stroke="#d4af37" stroke-width="1.5"/>

    <!-- Subtitle / Formulation notes -->
    <text x="100" y="74" font-family="'Inter', sans-serif" font-size="8" font-weight="600" fill="#57534e" text-anchor="middle">${subtitle}</text>

    <!-- Center Icon Artwork (Aromatic Bowl or Spice Motif) -->
    <g transform="translate(100, 106)">
      ${getDishIcon(dishIconType, themeColor, accentColor)}
    </g>

    <!-- Freshness / Aroma Seal -->
    <g transform="translate(24, 126)">
      <circle cx="10" cy="10" r="10" fill="url(#gold-foil)"/>
      <text x="10" y="13" font-family="'Inter', sans-serif" font-size="5.5" font-weight="800" fill="#78350f" text-anchor="middle">SEALED</text>
    </g>

    <!-- Veg Badge -->
    ${vegBadge(160, 126)}
  </g>

  <!-- Bottom Net Wt Banner & Barcode Badge -->
  <g transform="translate(150, 348)">
    <rect x="0" y="0" width="200" height="42" rx="6" fill="#ffffff" opacity="0.95" stroke="#d4af37" stroke-width="1"/>
    <text x="100" y="18" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#1e293b" text-anchor="middle">FACTORY FRESH · MOISTURE RESISTANT</text>
    
    <!-- Big Pack Size Tag -->
    <rect x="45" y="23" width="110" height="15" rx="3" fill="#143e2b"/>
    <text x="100" y="34" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">NET WEIGHT: ${pack}</text>
  </g>
</svg>`
}

function getDishIcon(type, theme, accent) {
  if (type === 'idli') {
    return `
      <!-- Steamed Rava Idli illustration -->
      <ellipse cx="0" cy="8" rx="28" ry="12" fill="#e2d8c3"/>
      <ellipse cx="-12" cy="0" rx="18" ry="12" fill="#fffef0" stroke="#d5c8a8" stroke-width="1"/>
      <ellipse cx="12" cy="0" rx="18" ry="12" fill="#fffef0" stroke="#d5c8a8" stroke-width="1"/>
      <!-- Cashew & mustard garnish -->
      <ellipse cx="-10" cy="-2" rx="4" ry="2" fill="#f59e0b"/>
      <ellipse cx="14" cy="-2" rx="4" ry="2" fill="#f59e0b"/>
      <circle cx="-14" cy="3" r="1" fill="#1c1917"/>
      <circle cx="10" cy="3" r="1" fill="#1c1917"/>
    `
  }

  if (type === 'jamun') {
    return `
      <!-- Gulab Jamun bowl with syrup -->
      <path d="M -26 0 C -26 18, 26 18, 26 0 Z" fill="#d4af37" stroke="#92400e" stroke-width="1"/>
      <circle cx="-10" cy="-2" r="10" fill="#78350f" stroke="#451a03" stroke-width="1"/>
      <circle cx="10" cy="-2" r="10" fill="#78350f" stroke="#451a03" stroke-width="1"/>
      <circle cx="0" cy="-8" r="9" fill="#92400e" stroke="#451a03" stroke-width="1"/>
      <circle cx="-2" cy="-9" r="2" fill="#ffffff" opacity="0.6"/>
    `
  }

  if (type === 'badam') {
    return `
      <!-- Badam / Almond and saffron motif -->
      <path d="M -12 8 C -22 -4, -6 -14, 0 -14 C 6 -14, 22 -4, 12 8 Z" fill="#fde68a" stroke="#b45309" stroke-width="1.2"/>
      <path d="M -2 2 Q 0 -10 6 -4" stroke="#d97706" stroke-width="1.2" fill="none"/>
      <!-- Saffron threads -->
      <path d="M 8 -6 Q 16 -12 20 -4" stroke="#dc2626" stroke-width="1.5" fill="none"/>
      <path d="M 12 -2 Q 22 -6 24 2" stroke="#dc2626" stroke-width="1.5" fill="none"/>
    `
  }

  if (type === 'chilli') {
    return `
      <!-- Red chillies graphic -->
      <path d="M -15 -10 Q 0 8 15 14 Q 5 2 0 -6 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
      <path d="M -15 -10 Q -18 -14 -22 -12" stroke="#15803d" stroke-width="2" fill="none"/>
      <path d="M 5 -12 Q 18 2 26 10 Q 15 2 12 -8 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
      <path d="M 5 -12 Q 3 -16 0 -15" stroke="#15803d" stroke-width="2" fill="none"/>
    `
  }

  if (type === 'turmeric') {
    return `
      <!-- Turmeric rhizome -->
      <rect x="-18" y="-4" width="36" height="14" rx="7" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
      <circle cx="-10" cy="3" r="5" fill="#fde047"/>
      <circle cx="10" cy="3" r="5" fill="#fde047"/>
      <path d="M -6 -12 L 0 -4 L 8 -10" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
    `
  }

  if (type === 'coriander') {
    return `
      <!-- Coriander seeds & sprig -->
      <circle cx="-8" cy="2" r="5" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
      <circle cx="4" cy="-2" r="5" fill="#a16207" stroke="#713f12" stroke-width="0.8"/>
      <circle cx="2" cy="7" r="4.5" fill="#eab308" stroke="#713f12" stroke-width="0.8"/>
      <path d="M -4 -12 Q 0 -4 4 -6 Q 10 -10 12 -4" stroke="#16a34a" stroke-width="1.8" fill="none"/>
    `
  }

  if (type === 'methi') {
    return `
      <!-- Dried fenugreek leaves / herbal cluster -->
      <ellipse cx="-8" cy="0" rx="8" ry="4" fill="#65a30d" transform="rotate(-25)"/>
      <ellipse cx="6" cy="-4" rx="8" ry="4" fill="#4d7c0f" transform="rotate(30)"/>
      <ellipse cx="2" cy="6" rx="9" ry="4" fill="#3f6212" transform="rotate(-10)"/>
      <path d="M -12 8 Q 0 0 10 -8" stroke="#1e3a1f" stroke-width="1" fill="none"/>
    `
  }

  if (type === 'meat' || type === 'chicken') {
    return `
      <!-- Sauté pan / roasting vessel -->
      <ellipse cx="0" cy="6" rx="26" ry="10" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
      <path d="M -20 6 Q 0 -6 20 6" fill="#ea580c"/>
      <!-- Whole spices: cloves, star anise -->
      <circle cx="-8" cy="4" r="2.5" fill="#1c1917"/>
      <polygon points="6,2 10,6 6,10 2,6" fill="#78350f"/>
      <circle cx="0" cy="2" r="1.5" fill="#facc15"/>
    `
  }

  if (type === 'fish') {
    return `
      <!-- Coastal Fish & Kokum Motif -->
      <path d="M -20 0 Q 0 -12 18 0 Q 0 12 -20 0 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
      <polygon points="18,0 26,-8 26,8" fill="#0284c7"/>
      <circle cx="-12" cy="-2" r="1.5" fill="#ffffff"/>
      <!-- Kokum piece -->
      <circle cx="6" cy="6" r="5" fill="#7f1d1d"/>
    `
  }

  if (type === 'egg') {
    return `
      <!-- Egg roast motif -->
      <ellipse cx="-6" cy="2" rx="10" ry="14" fill="#ffffff" stroke="#eab308" stroke-width="1.5"/>
      <circle cx="-6" cy="4" r="5" fill="#facc15"/>
      <ellipse cx="10" cy="4" rx="8" ry="12" fill="#fffbeb" stroke="#ca8a04" stroke-width="1.2"/>
    `
  }

  if (type === 'biryani') {
    return `
      <!-- Royal Handi / Biryani Pot -->
      <ellipse cx="0" cy="-6" rx="24" ry="6" fill="#ca8a04" stroke="#78350f" stroke-width="1"/>
      <path d="M -24 -6 C -26 12, -18 20, 0 20 C 18 20, 26 12, 24 -6 Z" fill="#854d0e" stroke="#451a03" stroke-width="1.2"/>
      <ellipse cx="0" cy="-4" rx="20" ry="4" fill="#fef08a"/>
      <!-- Star Anise -->
      <polygon points="0,-12 3,-8 8,-8 4,-4 6,1 0,-2 -6,1 -4,-4 -8,-8 -3,-8" fill="#451a03"/>
    `
  }

  // Default Aromatic Spices Mortar & Pestle
  return `
    <path d="M -22 -4 C -22 16, 22 16, 22 -4 Z" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <ellipse cx="0" cy="-4" rx="22" ry="6" fill="#e2e8f0"/>
    <line x1="-12" y1="-14" x2="4" y2="-4" stroke="#ca8a04" stroke-width="4" stroke-linecap="round"/>
    <circle cx="2" cy="-4" r="2" fill="#dc2626"/>
    <circle cx="-4" cy="-3" r="1.5" fill="#16a34a"/>
  `
}

// -------------------------------------------------------------
// 4. SWASTIK / ARUNA ROASTED VERMICELLI (Transparent poly window showing golden roasted vermicelli)
// -------------------------------------------------------------
function svgVermicelli(brand, themeColor, id, pack = '400 g') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Vermicelli Texture Pattern -->
    <pattern id="vermicelli-strands" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#f8eed6"/>
      <path d="M 0 5 Q 10 12, 20 5 T 40 5" stroke="#c48a27" stroke-width="1.2" fill="none"/>
      <path d="M 0 12 Q 10 18, 20 12 T 40 12" stroke="#aa7118" stroke-width="1" fill="none"/>
      <path d="M 0 20 Q 10 26, 20 20 T 40 20" stroke="#d99f36" stroke-width="1.2" fill="none"/>
      <path d="M 0 28 Q 10 34, 20 28 T 40 28" stroke="#c48a27" stroke-width="1" fill="none"/>
      <path d="M 0 35 Q 10 42, 20 35 T 40 35" stroke="#aa7118" stroke-width="1.2" fill="none"/>
      <path d="M 5 0 Q 12 10, 5 20 T 5 40" stroke="#c48a27" stroke-width="0.8" fill="none" opacity="0.6"/>
      <path d="M 25 0 Q 32 10, 25 20 T 25 40" stroke="#8c580e" stroke-width="0.8" fill="none" opacity="0.6"/>
    </pattern>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="432" rx="145" ry="17" fill="rgba(35, 25, 15, 0.22)" filter="url(#contact-shadow)"/>
  <ellipse cx="250" cy="430" rx="100" ry="9" fill="rgba(25, 18, 10, 0.32)" filter="url(#contact-shadow)"/>

  <!-- Pouch Outer Contour -->
  <rect x="135" y="80" width="230" height="335" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Top Heat-Sealed Header Band -->
  <path d="M 135 92 C 135 85, 142 80, 150 80 L 350 80 C 358 80, 365 85, 365 92 L 365 140 L 135 140 Z" fill="${themeColor}"/>
  <rect x="135" y="80" width="230" height="12" fill="url(#gold-foil)" opacity="0.8"/>

  <!-- Brand & Product Title in Header -->
  <text x="250" y="110" font-family="'Poppins', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${brand.toUpperCase()}</text>
  <text x="250" y="128" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#fde68a" text-anchor="middle" letter-spacing="1">PREMIUM PANTRY STAPLES</text>

  <!-- Clear Poly Window (Showing Real Roasted Vermicelli Strands) -->
  <g transform="translate(150, 152)">
    <rect x="0" y="0" width="200" height="175" rx="8" fill="url(#vermicelli-strands)" stroke="#d99f36" stroke-width="2"/>
    
    <!-- Transparent Poly Bag Gloss reflections -->
    <path d="M 10 10 L 40 165" stroke="#ffffff" stroke-width="10" stroke-opacity="0.45" stroke-linecap="round"/>
    <path d="M 190 10 L 175 165" stroke="#ffffff" stroke-width="6" stroke-opacity="0.3" stroke-linecap="round"/>

    <!-- Center Floating Badge over window -->
    <rect x="25" y="65" width="150" height="45" rx="5" fill="#ffffff" opacity="0.95" stroke="${themeColor}" stroke-width="1.5"/>
    <text x="100" y="85" font-family="'Poppins', sans-serif" font-size="13" font-weight="800" fill="#143e2b" text-anchor="middle">ROASTED VERMICELLI</text>
    <text x="100" y="100" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#b45309" text-anchor="middle">100% DURUM WHEAT SEMOLINA</text>
  </g>

  <!-- Bottom Sealed Banner -->
  <path d="M 135 340 L 365 340 L 365 403 C 365 410, 358 415, 350 415 L 150 415 C 142 415, 135 410, 135 403 Z" fill="${themeColor}"/>
  
  <text x="250" y="365" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">NON-STICKY · PRE-ROASTED</text>
  <text x="250" y="380" font-family="'Inter', sans-serif" font-size="7.5" font-weight="500" fill="#fde68a" text-anchor="middle">Ideal for Payasam, Upma &amp; Kheer</text>

  <!-- Big Net Weight Pill -->
  <rect x="195" y="388" width="110" height="18" rx="4" fill="#ffffff"/>
  <text x="250" y="401" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="${themeColor}" text-anchor="middle">NET WT: ${pack}</text>
  ${vegBadge(148, 388)}
</svg>`
}

// -------------------------------------------------------------
// 5. DEEPPAM AARTI POOJA OIL 450 ML (Realistic contoured oil bottle with golden oil & lamp flame)
// -------------------------------------------------------------
function svgDeeppamOil() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Glowing Golden Pooja Oil Gradient -->
    <linearGradient id="pooja-oil-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <!-- Red Tamper Cap Gradient -->
    <linearGradient id="red-cap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="30%" stop-color="#dc2626"/>
      <stop offset="70%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <!-- Flame Glow Filter -->
    <filter id="diya-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="430" rx="120" ry="15" fill="rgba(40, 25, 10, 0.24)" filter="url(#contact-shadow)"/>
  <ellipse cx="250" cy="428" rx="80" ry="8" fill="rgba(30, 18, 5, 0.35)" filter="url(#contact-shadow)"/>

  <!-- BOTTLE BODY (Contoured Transparent PET Bottle filled with golden oil) -->
  <!-- Bottle Base -->
  <rect x="175" y="395" width="150" height="20" rx="10" fill="#d4af37" stroke="#b45309" stroke-width="1.5"/>

  <!-- Bottle Outer Shell Filled With Golden Oil -->
  <path d="M 220 120 L 280 120 L 284 150 C 310 170, 328 200, 325 240 L 320 300 C 326 330, 326 370, 320 400 L 180 400 C 174 370, 174 330, 180 300 L 175 240 C 172 200, 190 170, 216 150 Z" fill="url(#pooja-oil-grad)" stroke="#ca8a04" stroke-width="2"/>

  <!-- Ribbed Grip Grooves on PET Bottle -->
  <path d="M 176 250 Q 250 262 324 250" stroke="#fef08a" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M 178 285 Q 250 297 322 285" stroke="#fef08a" stroke-width="3" fill="none" opacity="0.6"/>

  <!-- Specular Bottle Glass/Plastic Highlights -->
  <path d="M 186 165 C 182 220, 185 340, 188 395" stroke="#ffffff" stroke-width="7" stroke-opacity="0.55" stroke-linecap="round"/>
  <path d="M 314 165 C 318 220, 315 340, 312 395" stroke="#ffffff" stroke-width="4" stroke-opacity="0.35" stroke-linecap="round"/>

  <!-- TRADITIONAL POOJA LABEL -->
  <g transform="translate(182, 190)">
    <!-- Label Shield / Background -->
    <rect x="0" y="0" width="136" height="185" rx="6" fill="#fffdf5" stroke="#d4af37" stroke-width="1.5"/>
    <rect x="3" y="3" width="130" height="179" rx="4" fill="none" stroke="#b45309" stroke-width="0.8"/>

    <!-- Marigold Flower Arch Header -->
    <path d="M 0 0 L 136 0 L 136 28 L 0 28 Z" fill="#b45309"/>
    <text x="68" y="14" font-family="'Poppins', sans-serif" font-size="9" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="1">DEEPPAM</text>
    <text x="68" y="24" font-family="'Inter', sans-serif" font-size="6" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">AARTI POOJA OIL</text>

    <!-- Glowing Brass Diya / Deepam Artwork in Center -->
    <g transform="translate(68, 70)">
      <!-- Radiating Halo Glow -->
      <circle cx="0" cy="-14" r="22" fill="#fef08a" opacity="0.45" filter="url(#diya-glow)"/>
      <circle cx="0" cy="-14" r="14" fill="#fde047" opacity="0.6"/>
      <!-- Sacred Flame -->
      <path d="M 0 -28 C 6 -20, 7 -14, 0 -8 C -7 -14, -6 -20, 0 -28 Z" fill="#ef4444"/>
      <path d="M 0 -24 C 4 -18, 4 -14, 0 -10 C -4 -14, -4 -18, 0 -24 Z" fill="#facc15"/>
      <circle cx="0" cy="-12" r="2.5" fill="#ffffff"/>
      <!-- Brass Lamp (Kuthu Vilakku / Diya) -->
      <path d="M -18 0 C -18 8, 18 8, 18 0 Z" fill="url(#gold-foil)" stroke="#78350f" stroke-width="1"/>
      <rect x="-3" y="6" width="6" height="12" fill="url(#gold-foil)" stroke="#78350f" stroke-width="0.8"/>
      <ellipse cx="0" cy="18" rx="14" ry="4" fill="url(#gold-foil)" stroke="#78350f" stroke-width="1"/>
    </g>

    <!-- Sacred Sanskrit / Auspicious blessing tag -->
    <text x="68" y="108" font-family="'Poppins', sans-serif" font-size="9" font-weight="800" fill="#991b1b" text-anchor="middle">DIVINE LIGHT</text>
    <text x="68" y="119" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#78350f" text-anchor="middle">Pure Sesame &amp; Pancha Deepam</text>
    <text x="68" y="129" font-family="'Inter', sans-serif" font-size="6" font-weight="600" fill="#15803d" text-anchor="middle">Soot-Free Long Lasting Flame</text>

    <!-- FSSAI / Purity Mark -->
    <rect x="18" y="136" width="100" height="16" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="0.8"/>
    <text x="68" y="147" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#92400e" text-anchor="middle">100% PURE PUJA FORMULA</text>

    <!-- Bottom Volume Badge -->
    <rect x="24" y="158" width="88" height="18" rx="4" fill="#b45309"/>
    <text x="68" y="171" font-family="'Poppins', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">NET: 450 ml</text>
  </g>

  <!-- BOTTLE NECK & THREADS -->
  <rect x="220" y="115" width="60" height="20" rx="3" fill="#ded8cc" stroke="#b45309" stroke-width="1"/>
  <line x1="222" y1="125" x2="278" y2="125" stroke="#b45309" stroke-width="1.5"/>

  <!-- RED TAMPER-EVIDENT SCREW CAP -->
  <rect x="222" y="80" width="56" height="38" rx="4" fill="url(#red-cap-grad)" stroke="#450a0a" stroke-width="1.5"/>
  <ellipse cx="250" cy="82" rx="28" ry="6" fill="#ef4444"/>
  <!-- Cap grip ribs -->
  ${[228,234,240,246,252,258,264,270].map((x) => `
    <line x1="${x}" y1="84" x2="${x}" y2="114" stroke="#450a0a" stroke-width="1.5"/>
    <line x1="${x+1}" y1="84" x2="${x+1}" y2="114" stroke="#fca5a5" stroke-width="0.8"/>
  `).join('')}
  <!-- Golden Seal Ring -->
  <rect x="222" y="114" width="56" height="4" fill="url(#gold-foil)"/>
</svg>`
}

// -------------------------------------------------------------
// 6. MONKEY 555 DELUXE GRASS BROOM
// -------------------------------------------------------------
function svgMonkey555Broom() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Natural Grass Bristle Gradient -->
    <linearGradient id="grass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b48325"/>
      <stop offset="30%" stop-color="#eab308"/>
      <stop offset="65%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#9a6e04"/>
    </linearGradient>
    <!-- Handle Gradient -->
    <linearGradient id="handle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="432" rx="130" ry="15" fill="rgba(35, 25, 15, 0.2)" filter="url(#contact-shadow)"/>

  <!-- LONG BROOM ASSEMBLY -->
  <!-- Upper Handle Grip (Reinforced Virgin Plastic with Hang Ring) -->
  <circle cx="250" cy="55" r="12" fill="none" stroke="#15803d" stroke-width="5"/>
  <rect x="242" y="65" width="16" height="130" rx="4" fill="url(#handle-grad)" stroke="#052e16" stroke-width="1.5"/>
  <!-- Handle Ribbed Ergonomic Grips -->
  ${[80, 95, 110, 125, 140, 155, 170].map((y) => `
    <line x1="240" y1="${y}" x2="260" y2="${y}" stroke="#052e16" stroke-width="2"/>
    <line x1="240" y1="${y+2}" x2="260" y2="${y+2}" stroke="#86efac" stroke-width="1"/>
  `).join('')}

  <!-- BRANDED PROTECTIVE COLLAR SLEEVE (MONKEY 555) -->
  <g transform="translate(195, 195)">
    <rect x="0" y="0" width="110" height="65" rx="5" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
    <rect x="4" y="4" width="102" height="57" rx="3" fill="#ffffff"/>
    
    <!-- Monkey 555 Brand Hallmark -->
    <rect x="10" y="8" width="90" height="20" rx="3" fill="#14532d"/>
    <text x="55" y="22" font-family="'Poppins', sans-serif" font-size="10" font-weight="800" fill="#facc15" text-anchor="middle" letter-spacing="1">MONKEY 555</text>
    
    <text x="55" y="38" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="800" fill="#991b1b" text-anchor="middle">DELUXE GRASS</text>
    <text x="55" y="48" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#1f2937" text-anchor="middle">Shillong Hill Grass</text>
    <text x="55" y="56" font-family="'Inter', sans-serif" font-size="5.5" font-weight="600" fill="#15803d" text-anchor="middle">Zero Dust Shedding</text>
  </g>

  <!-- Heavy Binding Bands -->
  <rect x="235" y="260" width="30" height="10" fill="#dc2626" rx="2"/>
  <rect x="230" y="272" width="40" height="10" fill="#15803d" rx="2"/>

  <!-- NATURAL SHILLONG HILL GRASS BRISTLES (Fanned Gracefully) -->
  <g id="broom-bristles">
    <!-- Base Fanned Fill -->
    <path d="M 230 282 L 270 282 L 340 420 C 300 426, 200 426, 160 420 Z" fill="url(#grass-grad)" stroke="#854d0e" stroke-width="1.5"/>
    
    <!-- Detailed Natural Grass Strands -->
    ${[-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60].map((dx) => `
      <path d="M 250 282 Q ${250 + dx*0.6} 350 ${250 + dx*1.3} 420" stroke="#713f12" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M 250 282 Q ${250 + dx*0.5} 350 ${250 + dx*1.2} 420" stroke="#fef08a" stroke-width="1" fill="none" opacity="0.8"/>
    `).join('')}

    <!-- Bottom Bristle Trim Edge with Natural Tips -->
    <path d="M 160 420 Q 250 430 340 420" stroke="#713f12" stroke-width="3" fill="none"/>
  </g>

  <!-- Quality Stamp -->
  <g transform="translate(320, 120)">
    <circle cx="20" cy="20" r="20" fill="url(#gold-foil)" stroke="#854d0e" stroke-width="1"/>
    <text x="20" y="16" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#78350f" text-anchor="middle">SUPER</text>
    <text x="20" y="26" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#78350f" text-anchor="middle">CLEAN</text>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 7. MONKEY 555 COTTON FLOOR MOP
// -------------------------------------------------------------
function svgMonkey555Mop() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="432" rx="140" ry="16" fill="rgba(35, 25, 15, 0.2)" filter="url(#contact-shadow)"/>

  <!-- HANDLE ASSEMBLY -->
  <rect x="242" y="50" width="16" height="150" rx="3" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <line x1="246" y1="50" x2="246" y2="200" stroke="#fca5a5" stroke-width="2"/>

  <!-- MOP HEAD MOLDED SOCKET (Heavy-Duty Virgin Plastic Clamp) -->
  <path d="M 220 200 L 280 200 L 295 240 L 205 240 Z" fill="#15803d" stroke="#052e16" stroke-width="1.5"/>
  <rect x="228" y="195" width="44" height="10" rx="2" fill="#166534"/>

  <!-- Branded Badge on Socket -->
  <rect x="220" y="210" width="60" height="20" rx="3" fill="#ffffff"/>
  <text x="250" y="222" font-family="'Poppins', sans-serif" font-size="8" font-weight="800" fill="#dc2626" text-anchor="middle">MONKEY 555</text>
  <text x="250" y="228" font-family="'Inter', sans-serif" font-size="5" font-weight="700" fill="#15803d" text-anchor="middle">COTTON MOP</text>

  <!-- PURE WHITE LOOPED COTTON YARN STRINGS -->
  <g id="cotton-yarn">
    <!-- Soft background mass for volume -->
    <path d="M 210 240 L 290 240 L 330 420 C 290 430, 210 430, 170 420 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    
    <!-- Individual looping thick yarn strings -->
    ${[-45,-35,-25,-15,-5,5,15,25,35,45].map((dx) => `
      <path d="M ${250 + dx*0.6} 240 C ${250 + dx*0.8} 320, ${250 + dx*1.4} 380, ${250 + dx*1.4} 420" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M ${250 + dx*0.6} 240 C ${250 + dx*0.8} 320, ${250 + dx*1.4} 380, ${250 + dx*1.4} 420" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
    `).join('')}

    <!-- Looped ends at bottom -->
    ${[-50,-38,-26,-14,-2,10,22,34,46].map((dx) => `
      <ellipse cx="${250 + dx*1.3}" cy="420" rx="7" ry="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    `).join('')}
  </g>

  <!-- Super Absorbent Feature Tag -->
  <g transform="translate(320, 160)">
    <rect x="0" y="0" width="85" height="42" rx="5" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
    <text x="42" y="16" font-family="'Inter', sans-serif" font-size="8" font-weight="800" fill="#dc2626" text-anchor="middle">HIGH ABSORB</text>
    <text x="42" y="27" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#334155" text-anchor="middle">100% Cotton Yarn</text>
    <text x="42" y="36" font-family="'Inter', sans-serif" font-size="6" font-weight="700" fill="#15803d" text-anchor="middle">Durable Socket</text>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 8. MONKEY 555 FLOOR CLEANER PHENYL (1 Litre Pine Disinfectant Bottle)
// -------------------------------------------------------------
function svgMonkey555Phenyl() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Pine Green Disinfectant Liquid -->
    <linearGradient id="pine-liquid" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="30%" stop-color="#059669"/>
      <stop offset="70%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="430" rx="125" ry="15" fill="rgba(25, 35, 25, 0.22)" filter="url(#contact-shadow)"/>

  <!-- 1 LITRE BOTTLE (Translucent White Ribbed Bottle with Pine Liquid Inside) -->
  <path d="M 215 110 L 285 110 L 290 145 C 320 170, 335 200, 335 240 L 335 390 C 335 404, 320 410, 300 410 L 200 410 C 180 410, 165 404, 165 390 L 165 240 C 165 200, 180 170, 210 145 Z" fill="url(#pine-liquid)" stroke="#065f46" stroke-width="2"/>

  <!-- Liquid Meniscus Line -->
  <ellipse cx="250" cy="148" rx="40" ry="6" fill="#34d399" opacity="0.6"/>

  <!-- Bottle Structural Ribs -->
  <line x1="172" y1="230" x2="328" y2="230" stroke="#a7f3d0" stroke-width="2" opacity="0.4"/>
  <line x1="172" y1="365" x2="328" y2="365" stroke="#a7f3d0" stroke-width="2" opacity="0.4"/>

  <!-- Specular Bottle Shine -->
  <path d="M 175 160 C 175 220, 178 350, 180 395" stroke="#ffffff" stroke-width="7" stroke-opacity="0.5" stroke-linecap="round"/>

  <!-- BRAND LABEL -->
  <g transform="translate(175, 220)">
    <rect x="0" y="0" width="150" height="135" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    
    <!-- Top Green Header -->
    <path d="M 0 5 C 0 2, 2 0, 5 0 L 145 0 C 148 0, 150 2, 150 5 L 150 28 L 0 28 Z" fill="#047857"/>
    <text x="75" y="14" font-family="'Poppins', sans-serif" font-size="10" font-weight="800" fill="#facc15" text-anchor="middle" letter-spacing="1">MONKEY 555</text>
    <text x="75" y="24" font-family="'Inter', sans-serif" font-size="6" font-weight="700" fill="#ffffff" text-anchor="middle">DISINFECTANT Phenyl</text>

    <!-- Product Title -->
    <text x="75" y="48" font-family="'Poppins', sans-serif" font-size="11" font-weight="800" fill="#065f46" text-anchor="middle">PINE CLEANER</text>
    <text x="75" y="60" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#334155" text-anchor="middle">Kills 99.9% of Germs</text>

    <!-- Pine Tree Motif -->
    <g transform="translate(75, 80)">
      <polygon points="0,-14 10,-4 -10,-4" fill="#059669"/>
      <polygon points="0,-7 14,5 -14,5" fill="#047857"/>
      <rect x="-2" y="5" width="4" height="6" fill="#78350f"/>
    </g>

    <rect x="15" y="98" width="120" height="14" rx="3" fill="#ecfdf5" stroke="#10b981" stroke-width="0.8"/>
    <text x="75" y="108" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#065f46" text-anchor="middle">LONG LASTING FRAGRANCE</text>

    <!-- Volume Tag -->
    <rect x="35" y="116" width="80" height="15" rx="3" fill="#047857"/>
    <text x="75" y="127" font-family="'Inter', sans-serif" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">NET: 1 LITRE</text>
  </g>

  <!-- CAP (Ribbed Green Cap) -->
  <rect x="220" y="70" width="60" height="40" rx="4" fill="#064e3b" stroke="#022c22" stroke-width="1.5"/>
  <ellipse cx="250" cy="72" rx="30" ry="6" fill="#059669"/>
  ${[226,234,242,250,258,266,274].map((x) => `
    <line x1="${x}" y1="74" x2="${x}" y2="108" stroke="#022c22" stroke-width="1.5"/>
  `).join('')}
</svg>`
}

// -------------------------------------------------------------
// 9. MONKEY 555 OZONE SURFACE CLEANER (500 ml Trigger Spray Bottle)
// -------------------------------------------------------------
function svgMonkey555Ozone() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <linearGradient id="ozone-liquid" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="35%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="430" rx="115" ry="14" fill="rgba(20, 30, 40, 0.2)" filter="url(#contact-shadow)"/>

  <!-- TRIGGER SPRAY HEAD (Realistic Nozzle, Trigger, Collar) -->
  <g id="spray-head" transform="translate(190, 60)">
    <!-- Nozzle Tip -->
    <rect x="-16" y="28" width="18" height="16" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>
    <!-- Head Body -->
    <path d="M 0 24 L 75 14 C 95 14, 105 24, 105 45 L 85 65 L 45 65 L 45 78 L 25 78 L 25 50 Z" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
    <!-- Trigger Lever -->
    <path d="M 28 50 C 26 75, 10 95, 0 105" stroke="#0284c7" stroke-width="6" stroke-linecap="round" fill="none"/>
    <!-- Collar Ring -->
    <rect x="25" y="76" width="35" height="16" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  </g>

  <!-- BOTTLE BODY (Contoured Ergonomic 500 ml Bottle) -->
  <path d="M 222 152 L 258 152 L 275 180 C 295 195, 310 220, 310 250 L 305 385 C 305 400, 290 408, 275 408 L 205 408 C 190 408, 175 400, 175 385 L 170 250 C 170 220, 185 195, 205 180 Z" fill="url(#ozone-liquid)" stroke="#0369a1" stroke-width="1.5"/>

  <!-- Specular Shines -->
  <path d="M 180 200 C 180 260, 182 340, 185 395" stroke="#ffffff" stroke-width="6" stroke-opacity="0.6" stroke-linecap="round"/>

  <!-- BRAND LABEL -->
  <g transform="translate(185, 235)">
    <rect x="0" y="0" width="110" height="120" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    
    <rect x="0" y="0" width="110" height="24" rx="4" fill="#0284c7"/>
    <text x="55" y="12" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">MONKEY 555</text>
    <text x="55" y="20" font-family="'Inter', sans-serif" font-size="5.5" font-weight="700" fill="#fde047" text-anchor="middle">OZONE FORMULA</text>

    <text x="55" y="42" font-family="'Poppins', sans-serif" font-size="9" font-weight="800" fill="#0369a1" text-anchor="middle">MULTI-SURFACE</text>
    <text x="55" y="52" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#334155" text-anchor="middle">Cleaner Spray</text>

    <!-- Clean Spray Mist / Sparkle graphics -->
    <circle cx="55" cy="72" r="10" fill="#e0f2fe"/>
    <text x="55" y="76" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#0284c7" text-anchor="middle">✨</text>

    <text x="55" y="94" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#15803d" text-anchor="middle">Streak-Free Shine</text>

    <rect x="20" y="102" width="70" height="12" rx="3" fill="#0284c7"/>
    <text x="55" y="111" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#ffffff" text-anchor="middle">500 ml</text>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 10. MONKEY 555 BLEACHING POWDER (1 kg Heavy-Duty Sanitation Pack)
// -------------------------------------------------------------
function svgMonkey555Bleach() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="430" rx="140" ry="16" fill="rgba(30, 35, 45, 0.22)" filter="url(#contact-shadow)"/>

  <!-- HEAVY DUTY SANITATION SACK -->
  <path d="M 145 100 L 355 100 L 365 410 C 330 422, 170 422, 135 410 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
  
  <!-- Sealed Top Fold -->
  <rect x="140" y="85" width="220" height="24" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  <text x="250" y="101" font-family="'Poppins', sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">HEAVY-DUTY SANITATION</text>

  <!-- Blue Cross Protection Shield Motif -->
  <g transform="translate(250, 165)">
    <circle cx="0" cy="0" r="30" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    <path d="M -7 -18 L 7 -18 L 7 -7 L 18 -7 L 18 7 L 7 7 L 7 18 L -7 18 L -7 7 L -18 7 L -18 -7 L -7 -7 Z" fill="#0284c7"/>
  </g>

  <!-- Brand & Product Title -->
  <text x="250" y="222" font-family="'Poppins', sans-serif" font-size="18" font-weight="800" fill="#0f172a" text-anchor="middle">MONKEY 555</text>
  <rect x="160" y="235" width="180" height="26" rx="4" fill="#0284c7"/>
  <text x="250" y="253" font-family="'Poppins', sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">BLEACHING POWDER</text>

  <text x="250" y="280" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#334155" text-anchor="middle">HIGH GRADE DISINFECTANT</text>
  <text x="250" y="294" font-family="'Inter', sans-serif" font-size="8" font-weight="500" fill="#64748b" text-anchor="middle">For Water Purification, Floor Sanitization &amp; Hygiene</text>

  <!-- Technical Spec Box -->
  <g transform="translate(160, 312)">
    <rect x="0" y="0" width="180" height="42" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="90" y="16" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#0369a1" text-anchor="middle">STABLE CHLORINE FORMULATION</text>
    <text x="90" y="28" font-family="'Inter', sans-serif" font-size="7" font-weight="600" fill="#15803d" text-anchor="middle">Fast Acting · Disinfectant Grade</text>
  </g>

  <!-- Weight Seal -->
  <rect x="190" y="370" width="120" height="24" rx="4" fill="#0f172a"/>
  <text x="250" y="386" font-family="'Poppins', sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">NET WT: 1 KG</text>
</svg>`
}

// -------------------------------------------------------------
// 11. MONKEY VVV DETERGENT POWDER (1 kg Bag with Handle)
// -------------------------------------------------------------
function svgMonkeyVvvDetergent() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <linearGradient id="detergent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="35%" stop-color="#06b6d4"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="432" rx="145" ry="16" fill="rgba(25, 35, 45, 0.22)" filter="url(#contact-shadow)"/>

  <!-- Top Die-Cut Carry Handle -->
  <path d="M 180 85 C 180 60, 320 60, 320 85 L 320 95 L 180 95 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  <ellipse cx="250" cy="80" rx="36" ry="10" fill="#ffffff" stroke="#0369a1" stroke-width="1.5"/>

  <!-- DETERGENT PACK BODY -->
  <path d="M 140 95 L 360 95 L 370 410 C 330 422, 170 422, 130 410 Z" fill="url(#detergent-grad)" stroke="#0369a1" stroke-width="2"/>
  
  <!-- Foaming Wash Waves / Splashes -->
  <path d="M 134 260 Q 250 200 366 260 L 370 410 C 330 422, 170 422, 130 410 Z" fill="#ffffff" opacity="0.95"/>

  <!-- Washing Bubbles & Active Oxygen Graphic -->
  <circle cx="210" cy="270" r="14" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="280" cy="255" r="18" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="250" cy="290" r="24" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
  <text x="250" y="296" font-family="'Poppins', sans-serif" font-size="11" font-weight="800" fill="#0284c7" text-anchor="middle">OXY</text>

  <!-- BRAND HEADER -->
  <g transform="translate(160, 115)">
    <rect x="0" y="0" width="180" height="42" rx="5" fill="#ffffff" stroke="#facc15" stroke-width="2"/>
    <text x="90" y="24" font-family="'Poppins', sans-serif" font-size="15" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="1">MONKEY VVV</text>
    <text x="90" y="35" font-family="'Inter', sans-serif" font-size="7.5" font-weight="800" fill="#0284c7" text-anchor="middle">ACTIVE WASH DETERGENT</text>
  </g>

  <!-- Power Slogan -->
  <text x="250" y="185" font-family="'Poppins', sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">TOUGH STAIN REMOVAL</text>
  <text x="250" y="200" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#fef08a" text-anchor="middle">Deep Action Enzyme Power</text>

  <!-- Lower Pack Details -->
  <text x="250" y="345" font-family="'Poppins', sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">SUPER FRESH FRAGRANCE</text>
  <text x="250" y="360" font-family="'Inter', sans-serif" font-size="8" font-weight="600" fill="#64748b" text-anchor="middle">Suitable for Bucket &amp; Machine Wash</text>

  <!-- 1 KG Pill -->
  <rect x="190" y="375" width="120" height="24" rx="4" fill="#0284c7"/>
  <text x="250" y="391" font-family="'Poppins', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">NET: 1 KG</text>
</svg>`
}

// -------------------------------------------------------------
// 12. MONKEY VVV DISHWASH BAR (250 g Wrapped Cake with Lemon Graphics)
// -------------------------------------------------------------
function svgMonkeyVvvDishwashBar() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Green Dishwash Bar Wrap Gradient -->
    <linearGradient id="bar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="30%" stop-color="#22c55e"/>
      <stop offset="70%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="385" rx="145" ry="18" fill="rgba(30, 40, 20, 0.22)" filter="url(#contact-shadow)"/>

  <!-- 3D WRAPPED DISHWASH BAR (Isometric rectangular perspective) -->
  <g transform="translate(130, 180)">
    <!-- Main Wrapped Body -->
    <rect x="20" y="20" width="200" height="130" rx="8" fill="url(#bar-grad)" stroke="#14532d" stroke-width="2"/>
    
    <!-- Wrapper Folds on Sides -->
    <polygon points="20,20 0,55 0,115 20,150" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
    <polygon points="220,20 240,55 240,115 220,150" fill="#166534" stroke="#14532d" stroke-width="1.5"/>

    <!-- Shiny Wrap Reflection -->
    <path d="M 35 25 L 180 25 L 150 145 L 35 145 Z" fill="#ffffff" opacity="0.15"/>

    <!-- Center Label Area -->
    <rect x="35" y="32" width="170" height="105" rx="5" fill="#ffffff" stroke="#facc15" stroke-width="1.5"/>

    <text x="120" y="52" font-family="'Poppins', sans-serif" font-size="13" font-weight="900" fill="#dc2626" text-anchor="middle">MONKEY VVV</text>
    <text x="120" y="65" font-family="'Poppins', sans-serif" font-size="10" font-weight="800" fill="#15803d" text-anchor="middle">DISHWASH BAR</text>

    <!-- Lemon Graphic Badge -->
    <g transform="translate(65, 88)">
      <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="12" fill="#fef08a"/>
      <!-- Lemon segments -->
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ca8a04" stroke-width="1"/>
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ca8a04" stroke-width="1"/>
    </g>

    <text x="140" y="86" font-family="'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#15803d">BURNT GREASE</text>
    <text x="140" y="97" font-family="'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#b45309">REMOVAL</text>
    <text x="140" y="108" font-family="'Inter', sans-serif" font-size="6.5" font-weight="600" fill="#475569">Power of Real Lemons</text>

    <rect x="50" y="118" width="140" height="14" rx="3" fill="#15803d"/>
    <text x="120" y="128" font-family="'Inter', sans-serif" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">NET WEIGHT: 250 g</text>
  </g>
</svg>`
}

// -------------------------------------------------------------
// 13. MONKEY VVV DISHWASH LIQUID GEL (500 ml Squeeze Bottle with Lime Gel)
// -------------------------------------------------------------
function svgMonkeyVvvDishwashGel() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    ${commonDefs}
    <!-- Sparkling Lemon Gel Gradient -->
    <linearGradient id="dish-gel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4d7c0f"/>
      <stop offset="30%" stop-color="#84cc16"/>
      <stop offset="65%" stop-color="#bef264"/>
      <stop offset="100%" stop-color="#65a30d"/>
    </linearGradient>
  </defs>

  <rect width="500" height="500" fill="url(#studio-bg)"/>
  <ellipse cx="250" cy="430" rx="120" ry="15" fill="rgba(25, 35, 15, 0.22)" filter="url(#contact-shadow)"/>

  <!-- CONTOURED SQUEEZE BOTTLE -->
  <path d="M 220 115 L 280 115 L 286 150 C 315 175, 325 210, 320 250 L 315 385 C 315 400, 300 408, 280 408 L 220 408 C 200 408, 185 400, 185 385 L 180 250 C 175 210, 185 175, 214 150 Z" fill="url(#dish-gel-grad)" stroke="#4d7c0f" stroke-width="2"/>

  <!-- Glossy bottle specular shine -->
  <path d="M 192 165 C 190 220, 192 340, 195 395" stroke="#ffffff" stroke-width="7" stroke-opacity="0.6" stroke-linecap="round"/>

  <!-- FRONT LABEL -->
  <g transform="translate(185, 205)">
    <rect x="0" y="0" width="130" height="155" rx="6" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5"/>

    <rect x="0" y="0" width="130" height="26" rx="4" fill="#15803d"/>
    <text x="65" y="14" font-family="'Poppins', sans-serif" font-size="10" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="1">MONKEY VVV</text>
    <text x="65" y="22" font-family="'Inter', sans-serif" font-size="5.5" font-weight="700" fill="#ffffff" text-anchor="middle">CONCENTRATED FORMULA</text>

    <text x="65" y="44" font-family="'Poppins', sans-serif" font-size="11" font-weight="900" fill="#047857" text-anchor="middle">DISHWASH GEL</text>
    <text x="65" y="55" font-family="'Inter', sans-serif" font-size="7" font-weight="700" fill="#b45309" text-anchor="middle">LEMON POWER</text>

    <!-- Lemon icon -->
    <g transform="translate(65, 80)">
      <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="12" fill="#fef08a"/>
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ca8a04" stroke-width="1"/>
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ca8a04" stroke-width="1"/>
    </g>

    <text x="65" y="112" font-family="'Inter', sans-serif" font-size="7.5" font-weight="800" fill="#15803d" text-anchor="middle">1 Spoon Cuts Tough Grease</text>
    <text x="65" y="122" font-family="'Inter', sans-serif" font-size="6.5" font-weight="500" fill="#475569" text-anchor="middle">Leaves Sparkling Clean Vessels</text>

    <rect x="25" y="132" width="80" height="16" rx="3" fill="#15803d"/>
    <text x="65" y="143" font-family="'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">NET: 500 ml</text>
  </g>

  <!-- FLIP-TOP YELLOW DISPENSER CAP -->
  <rect x="225" y="80" width="50" height="35" rx="5" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
  <rect x="235" y="72" width="30" height="10" rx="3" fill="#eab308"/>
</svg>`
}

// -------------------------------------------------------------
// CATALOGUE DEFINITION & BULK GENERATOR
// -------------------------------------------------------------
const allProducts = [
  // Swastik
  { id: 'swastik-mango-pickle', type: 'custom', fn: svgSwastikMangoPickle },
  { id: 'swastik-lime-pickle', type: 'custom', fn: svgSwastikLimePickle },
  {
    id: 'swastik-sambar-powder',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'SAMBAR POWDER',
    subtitle: 'Roasted Coriander & Dal Blend',
    category: 'Traditional Spice Powders',
    pack: '200 g',
    themeColor: '#991b1b',
    accentColor: '#f59e0b',
    dishIconType: 'mortar',
  },
  {
    id: 'swastik-rasam-powder',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'RASAM POWDER',
    subtitle: 'Black Pepper & Cumin Infused',
    category: 'Authentic Spice Blends',
    pack: '200 g',
    themeColor: '#14532d',
    accentColor: '#d4af37',
    dishIconType: 'mortar',
  },
  {
    id: 'swastik-puliyogare-powder',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'PULIYOGARE POWDER',
    subtitle: 'Tangy Tamarind Rice Masala',
    category: 'Traditional Culinary Mixes',
    pack: '200 g',
    themeColor: '#78350f',
    accentColor: '#f59e0b',
    dishIconType: 'mortar',
  },
  {
    id: 'swastik-badam-powder',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'ROYAL BADAM POWDER',
    subtitle: 'Real Almond Bits & Saffron',
    category: 'Nourishing Beverage Mix',
    pack: '200 g',
    themeColor: '#d97706',
    accentColor: '#fde68a',
    dishIconType: 'badam',
  },
  {
    id: 'swastik-rava-idli-mix',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'RAVA IDLI MIX',
    subtitle: 'Mustard & Cashew Seasoning',
    category: 'Instant Breakfast Mix',
    pack: '500 g',
    themeColor: '#ca8a04',
    accentColor: '#fef08a',
    dishIconType: 'idli',
  },
  {
    id: 'swastik-gulab-jamun-mix',
    type: 'pouch',
    brand: 'Swastik',
    productTitle: 'GULAB JAMUN MIX',
    subtitle: 'Melt-In-Mouth Festivity',
    category: 'Instant Celebration Dessert',
    pack: '200 g',
    themeColor: '#831843',
    accentColor: '#f43f5e',
    dishIconType: 'jamun',
  },
  { id: 'swastik-roasted-vermicelli', type: 'vermicelli', brand: 'Swastik', themeColor: '#14532d', pack: '400 g' },

  // Rala Food Specialists
  {
    id: 'rala-chilli-powder',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'PURE CHILLI POWDER',
    subtitle: 'High Pungency Guntur Blend',
    category: 'Pure Ground Spices',
    pack: '200 g',
    themeColor: '#b91c1c',
    accentColor: '#ef4444',
    dishIconType: 'chilli',
  },
  {
    id: 'rala-turmeric-powder',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'TURMERIC POWDER',
    subtitle: 'High Curcumin Golden Spice',
    category: 'Pure Ground Spices',
    pack: '200 g',
    themeColor: '#ca8a04',
    accentColor: '#fde047',
    dishIconType: 'turmeric',
  },
  {
    id: 'rala-coriander-powder',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'CORIANDER POWDER',
    subtitle: 'Cold-Ground Whole Dhaniya',
    category: 'Pure Ground Spices',
    pack: '200 g',
    themeColor: '#15803d',
    accentColor: '#86efac',
    dishIconType: 'coriander',
  },
  {
    id: 'rala-chicken-masala',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'CHICKEN MASALA',
    subtitle: 'Special Roasted Poultry Blend',
    category: 'Blended Masala Powders',
    pack: '100 g',
    themeColor: '#c2410c',
    accentColor: '#fb923c',
    dishIconType: 'chicken',
  },
  {
    id: 'rala-meat-masala',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'MEAT MASALA',
    subtitle: 'Robust Mutton & Curry Recipe',
    category: 'Blended Masala Powders',
    pack: '100 g',
    themeColor: '#78350f',
    accentColor: '#b45309',
    dishIconType: 'meat',
  },
  {
    id: 'rala-garam-masala',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'ROYAL GARAM MASALA',
    subtitle: 'Finishing Whole Spice Blend',
    category: 'Blended Masala Powders',
    pack: '100 g',
    themeColor: '#451a03',
    accentColor: '#d4af37',
    dishIconType: 'mortar',
  },
  {
    id: 'rala-kasuri-methi',
    type: 'pouch',
    brand: 'Rala',
    productTitle: 'KASURI METHI',
    subtitle: 'Sun-Dried Fenugreek Leaves',
    category: 'Fragrant Culinary Herbs',
    pack: '50 g',
    themeColor: '#365314',
    accentColor: '#65a30d',
    dishIconType: 'methi',
  },

  // Monkey 555
  { id: 'monkey-555-grass-broom', type: 'custom', fn: svgMonkey555Broom },
  { id: 'monkey-555-cotton-mop', type: 'custom', fn: svgMonkey555Mop },
  { id: 'monkey-555-phenyl', type: 'custom', fn: svgMonkey555Phenyl },
  { id: 'monkey-555-ozone-cleaner', type: 'custom', fn: svgMonkey555Ozone },
  { id: 'monkey-555-bleaching-powder', type: 'custom', fn: svgMonkey555Bleach },

  // Monkey VVV
  { id: 'monkey-vvv-detergent-powder', type: 'custom', fn: svgMonkeyVvvDetergent },
  { id: 'monkey-vvv-dishwash-bar', type: 'custom', fn: svgMonkeyVvvDishwashBar },
  { id: 'monkey-vvv-dishwash-gel', type: 'custom', fn: svgMonkeyVvvDishwashGel },

  // Aruna Masala
  { id: 'aruna-roasted-vermicelli', type: 'vermicelli', brand: 'Aruna', themeColor: '#991b1b', pack: '400 g' },
  {
    id: 'aruna-gulab-jamun-mix',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'GULAB JAMUN MIX',
    subtitle: 'Instant Celebration Dessert',
    category: 'Dessert Mixes',
    pack: '200 g',
    themeColor: '#701a75',
    accentColor: '#d946ef',
    dishIconType: 'jamun',
  },
  {
    id: 'aruna-chicken-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'CHICKEN MASALA',
    subtitle: 'Coastal Kitchen Recipe',
    category: 'Curry Blends',
    pack: '100 g',
    themeColor: '#991b1b',
    accentColor: '#f97316',
    dishIconType: 'chicken',
  },
  {
    id: 'aruna-mutton-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'MUTTON MASALA',
    subtitle: 'Slow-Toasted Rich Spices',
    category: 'Curry Blends',
    pack: '100 g',
    themeColor: '#581c87',
    accentColor: '#a855f7',
    dishIconType: 'meat',
  },
  {
    id: 'aruna-fish-curry-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'FISH CURRY MASALA',
    subtitle: 'Coastal Kokum & Chili Blend',
    category: 'Seafood Masalas',
    pack: '100 g',
    themeColor: '#0369a1',
    accentColor: '#f97316',
    dishIconType: 'fish',
  },
  {
    id: 'aruna-egg-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'EGG MASALA',
    subtitle: 'Spiced Egg Roast Recipe',
    category: 'Curry Blends',
    pack: '100 g',
    themeColor: '#b45309',
    accentColor: '#facc15',
    dishIconType: 'egg',
  },
  {
    id: 'aruna-garam-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'GARAM MASALA',
    subtitle: 'Aromatic Whole Spices',
    category: 'Curry Blends',
    pack: '100 g',
    themeColor: '#713f12',
    accentColor: '#d4af37',
    dishIconType: 'mortar',
  },
  {
    id: 'aruna-biryani-masala',
    type: 'pouch',
    brand: 'Aruna',
    productTitle: 'SHAHI BIRYANI MASALA',
    subtitle: 'Layered Dum Biryani Special',
    category: 'Royal Rice Spices',
    pack: '100 g',
    themeColor: '#134e4a',
    accentColor: '#f59e0b',
    dishIconType: 'biryani',
  },

  // Deeppam Aarti
  { id: 'deeppam-aarti-oil-450ml', type: 'custom', fn: svgDeeppamOil },
]

console.log(`Generating ${allProducts.length} realistic retail packaging images...`)

allProducts.forEach((item) => {
  let svgContent = ''
  if (item.type === 'custom') {
    svgContent = item.fn()
  } else if (item.type === 'vermicelli') {
    svgContent = svgVermicelli(item.brand, item.themeColor, item.id, item.pack)
  } else if (item.type === 'pouch') {
    svgContent = svgRetailPouch(item)
  }

  const filePath = path.join(outputDir, `${item.id}.svg`)
  fs.writeFileSync(filePath, svgContent.trim() + '\n', 'utf8')
  console.log(`✓ Generated ${item.id}.svg`)
})

console.log('All 33 realistic product images generated successfully!')

