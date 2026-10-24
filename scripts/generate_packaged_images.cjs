const fs = require('fs')
const path = require('path')

const productsDir = path.join(__dirname, '..', 'public', 'images', 'products')
const brandsDir = path.join(__dirname, '..', 'public', 'images', 'brands')

fs.mkdirSync(productsDir, { recursive: true })
fs.mkdirSync(brandsDir, { recursive: true })

// Helper for SVG generation
function createSvg(width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#142118" flood-opacity="0.12"/>
    </filter>
    <filter id="pouchShadow" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#12251a" flood-opacity="0.16"/>
    </filter>
    <linearGradient id="foilSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="20%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="80%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#f6f3eb" rx="16"/>
  ${content}
</svg>`
}

// 1. Stand-up Pouch Generator
function generatePouch({ brand, title, category, pack, mainColor, accentColor, iconSvg }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="135" ry="16" fill="#1b2e22" opacity="0.15"/>

    <!-- Pouch Body -->
    <g filter="url(#pouchShadow)">
      <!-- Base pouch shape -->
      <path d="M 140 100 
               C 140 92, 146 86, 154 86 
               L 346 86 
               C 354 86, 360 92, 360 100 
               L 375 410 
               C 376 422, 368 430, 354 430 
               L 146 430 
               C 132 430, 124 422, 125 410 
               Z" fill="${mainColor}"/>

      <!-- Foil sheen overlay -->
      <path d="M 140 100 L 360 100 L 375 410 C 376 422, 368 430, 354 430 L 146 430 C 132 430, 124 422, 125 410 Z" fill="url(#foilSheen)"/>

      <!-- Heat seal crimp at top -->
      <rect x="138" y="86" width="224" height="24" fill="${accentColor}" opacity="0.9" rx="3"/>
      <!-- Seal crimp lines -->
      <path d="M 145 92 L 355 92 M 145 98 L 355 98 M 145 104 L 355 104" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.6"/>
      <!-- Tear notch -->
      <polygon points="138,98 144,95 144,101" fill="#f6f3eb"/>
      <polygon points="362,98 356,95 356,101" fill="#f6f3eb"/>

      <!-- Front Packaging Label Area -->
      <rect x="156" y="130" width="188" height="270" rx="8" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="156" y="130" width="188" height="12" fill="${accentColor}" rx="4 4 0 0"/>

      <!-- Brand Header -->
      <text x="250" y="165" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="${mainColor}" letter-spacing="1.5" text-anchor="middle">${brand.toUpperCase()}</text>
      <line x1="180" y1="174" x2="320" y2="174" stroke="${mainColor}" stroke-width="1" opacity="0.3"/>

      <!-- Icon / Emblem Graphic -->
      <g transform="translate(215, 186)">
        ${iconSvg}
      </g>

      <!-- Product Title -->
      <text x="250" y="278" font-family="'Poppins', 'Inter', sans-serif" font-size="16" font-weight="700" fill="#1b241e" text-anchor="middle">${title}</text>
      <text x="250" y="296" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#68756c" text-anchor="middle">${category}</text>

      <!-- Packaging details & weight badge -->
      <rect x="180" y="320" width="140" height="28" rx="14" fill="#f0eee6"/>
      <text x="250" y="338" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#1d3d29" text-anchor="middle">Net Wt. ${pack}</text>

      <rect x="176" y="362" width="148" height="20" rx="4" fill="${mainColor}" opacity="0.1"/>
      <text x="250" y="376" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="${mainColor}" text-anchor="middle" letter-spacing="0.5">SEALED RETAIL PACK</text>
    </g>
  `)
}

// 2. Glass / PET Pickle Jar Generator
function generateJar({ brand, title, flavor, pack, capColor = '#B94B35', pickleColor = '#9E3818' }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="125" ry="16" fill="#1b2e22" opacity="0.16"/>

    <g filter="url(#pouchShadow)">
      <!-- Jar Cap -->
      <rect x="175" y="80" width="150" height="36" rx="6" fill="${capColor}"/>
      <!-- Cap ridges -->
      <path d="M 185 80 L 185 116 M 195 80 L 195 116 M 205 80 L 205 116 M 215 80 L 215 116 M 225 80 L 225 116 M 235 80 L 235 116 M 245 80 L 245 116 M 255 80 L 255 116 M 265 80 L 265 116 M 275 80 L 275 116 M 285 80 L 285 116 M 295 80 L 295 116 M 305 80 L 305 116 M 315 80 L 315 116" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/>
      <!-- Safety Neck Seal -->
      <rect x="180" y="116" width="140" height="18" fill="#e8d89e" opacity="0.95"/>
      <text x="250" y="129" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#5c430e" text-anchor="middle" letter-spacing="1">SEALED FOR FRESHNESS</text>

      <!-- Glass Jar Body -->
      <path d="M 160 145 C 160 134, 175 134, 185 134 L 315 134 C 325 134, 340 134, 340 145 L 345 405 C 345 422, 332 430, 315 430 L 185 430 C 168 430, 155 422, 155 405 Z" fill="${pickleColor}"/>

      <!-- Jar glass sheen -->
      <path d="M 160 145 C 160 134, 175 134, 185 134 L 315 134 C 325 134, 340 134, 340 145 L 345 405 C 345 422, 332 430, 315 430 L 185 430 C 168 430, 155 422, 155 405 Z" fill="url(#jarGlass)"/>

      <!-- Front Jar Label -->
      <rect x="165" y="195" width="170" height="185" rx="8" fill="#ffffff" stroke="#e0d6c3" stroke-width="2"/>
      <rect x="170" y="200" width="160" height="175" rx="6" fill="#fffdfa"/>
      
      <!-- Gold inner border -->
      <rect x="173" y="203" width="154" height="169" rx="4" fill="none" stroke="#d4af37" stroke-width="1.2"/>

      <text x="250" y="228" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="${capColor}" letter-spacing="2" text-anchor="middle">${brand.toUpperCase()}</text>
      <text x="250" y="244" font-family="'Inter', sans-serif" font-size="8" font-weight="600" fill="#7d6a48" letter-spacing="1" text-anchor="middle">AUTHENTIC RECIPE</text>

      <!-- Label Illustration Badge -->
      <circle cx="250" cy="276" r="24" fill="${pickleColor}" opacity="0.15"/>
      <circle cx="250" cy="276" r="20" fill="${pickleColor}" opacity="0.8"/>
      <text x="250" y="282" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">${flavor[0]}</text>

      <text x="250" y="322" font-family="'Poppins', 'Inter', sans-serif" font-size="14" font-weight="700" fill="#222b24" text-anchor="middle">${title}</text>
      <text x="250" y="338" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#69756b" text-anchor="middle">In Cold-Pressed Mustard Oil</text>

      <!-- Weight badge -->
      <rect x="200" y="348" width="100" height="18" rx="9" fill="${capColor}"/>
      <text x="250" y="361" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">Net Wt. ${pack}</text>
    </g>
  `)
}

// 3. Clear/Printed Vermicelli Packet Generator
function generateVermicelli({ brand, title, pack, brandColor }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="140" ry="16" fill="#1b2e22" opacity="0.14"/>

    <g filter="url(#pouchShadow)">
      <!-- Poly packet bag shape -->
      <rect x="135" y="90" width="230" height="335" rx="10" fill="#dfca9b"/>
      <!-- Packet crimps -->
      <rect x="135" y="85" width="230" height="20" fill="#bfa56a" rx="3"/>
      <rect x="135" y="415" width="230" height="20" fill="#bfa56a" rx="3"/>
      <path d="M 140 92 L 360 92 M 140 98 L 360 98 M 140 422 L 360 422 M 140 428 L 360 428" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.5"/>

      <!-- Vermicelli strands inside transparent window -->
      <rect x="150" y="115" width="200" height="295" fill="#f4e4bf" rx="6"/>
      <!-- Vermicelli strands pattern -->
      <g stroke="#c79c51" stroke-width="1.8" opacity="0.75">
        <line x1="160" y1="125" x2="340" y2="128"/>
        <line x1="158" y1="135" x2="342" y2="137"/>
        <line x1="162" y1="145" x2="338" y2="149"/>
        <line x1="159" y1="155" x2="341" y2="157"/>
        <line x1="161" y1="165" x2="339" y2="167"/>
        <line x1="158" y1="175" x2="342" y2="178"/>
        <line x1="162" y1="355" x2="338" y2="357"/>
        <line x1="159" y1="365" x2="341" y2="368"/>
        <line x1="161" y1="375" x2="339" y2="377"/>
        <line x1="158" y1="385" x2="342" y2="387"/>
        <line x1="160" y1="395" x2="340" y2="397"/>
      </g>

      <!-- Center Brand Label -->
      <rect x="155" y="195" width="190" height="145" rx="8" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="155" y="195" width="190" height="10" fill="${brandColor}" rx="4 4 0 0"/>

      <text x="250" y="228" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="${brandColor}" letter-spacing="1.5" text-anchor="middle">${brand.toUpperCase()}</text>
      <text x="250" y="258" font-family="'Poppins', 'Inter', sans-serif" font-size="15" font-weight="700" fill="#222b24" text-anchor="middle">${title}</text>
      <text x="250" y="278" font-family="'Inter', sans-serif" font-size="9.5" font-weight="600" fill="#69756b" text-anchor="middle">Pre-Roasted Wheat Semolina</text>
      <text x="250" y="293" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#997b3d" text-anchor="middle" letter-spacing="0.5">NON-STICKY · QUICK COOKING</text>

      <!-- Weight badge -->
      <rect x="195" y="306" width="110" height="22" rx="11" fill="${brandColor}"/>
      <text x="250" y="321" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Net Wt. ${pack}</text>
    </g>
  `)
}

// 4. Bottle Generator (Phenyl, Spray, Dishwash Gel, Pooja Oil)
function generateBottle({ brand, title, volume, liquidColor, bottleColor = '#ffffff', capColor = '#174D35', subtitle = 'RETAIL FMCG PACK' }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="90" ry="15" fill="#1b2e22" opacity="0.16"/>

    <g filter="url(#pouchShadow)">
      <!-- Cap -->
      <rect x="220" y="70" width="60" height="30" rx="5" fill="${capColor}"/>
      <path d="M 228 70 L 228 100 M 238 70 L 238 100 M 248 70 L 248 100 M 258 70 L 258 100 M 268 70 L 268 100" stroke="#ffffff" stroke-width="1.2" opacity="0.4"/>

      <!-- Bottle Neck -->
      <rect x="230" y="100" width="40" height="24" fill="${bottleColor}"/>

      <!-- Bottle Body -->
      <path d="M 230 124 
               C 210 135, 175 165, 175 195 
               L 175 410 
               C 175 425, 188 430, 205 430 
               L 295 430 
               C 312 430, 325 425, 325 410 
               L 325 195 
               C 325 165, 290 135, 270 124 
               Z" fill="${bottleColor}" stroke="#d6dcd7" stroke-width="1.5"/>

      <!-- Liquid fill indication -->
      <path d="M 178 260 L 322 260 L 322 410 C 322 422, 312 427, 295 427 L 205 427 C 188 427, 178 422, 178 410 Z" fill="${liquidColor}" opacity="0.25"/>

      <!-- Bottle Sheen -->
      <path d="M 185 180 L 200 180 L 200 415 L 185 415 Z" fill="#ffffff" opacity="0.45"/>

      <!-- Front Label -->
      <rect x="185" y="210" width="130" height="175" rx="8" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="185" y="210" width="130" height="10" fill="${capColor}" rx="4 4 0 0"/>

      <text x="250" y="238" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="${capColor}" letter-spacing="1.2" text-anchor="middle">${brand.toUpperCase()}</text>
      <line x1="205" y1="246" x2="295" y2="246" stroke="${capColor}" stroke-width="0.8" opacity="0.3"/>

      <!-- Emblem -->
      <circle cx="250" cy="275" r="20" fill="${liquidColor}" opacity="0.3"/>
      <circle cx="250" cy="275" r="16" fill="${capColor}"/>
      <text x="250" y="281" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">★</text>

      <text x="250" y="318" font-family="'Poppins', 'Inter', sans-serif" font-size="13" font-weight="700" fill="#1b241e" text-anchor="middle">${title}</text>
      <text x="250" y="334" font-family="'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#68756c" text-anchor="middle">${subtitle}</text>

      <!-- Volume Badge -->
      <rect x="200" y="348" width="100" height="22" rx="11" fill="${capColor}"/>
      <text x="250" y="363" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">${volume}</text>
    </g>
  `)
}

// 5. Broom Generator (Monkey 555 Deluxe Grass Broom)
function generateBroom() {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="110" ry="14" fill="#1b2e22" opacity="0.14"/>

    <g filter="url(#pouchShadow)">
      <!-- Long Handle -->
      <rect x="238" y="55" width="24" height="230" rx="8" fill="#174D35"/>
      <!-- Handle grip grooves -->
      <rect x="241" y="70" width="18" height="60" rx="3" fill="#0d3121"/>
      <text x="250" y="195" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle" transform="rotate(-90 250 195)" letter-spacing="2">MONKEY 555</text>

      <!-- Binding Collar -->
      <rect x="225" y="270" width="50" height="35" rx="6" fill="#D9A441"/>
      <line x1="225" y1="280" x2="275" y2="280" stroke="#7a5b18" stroke-width="2"/>
      <line x1="225" y1="290" x2="275" y2="290" stroke="#7a5b18" stroke-width="2"/>

      <!-- Grass Bristles (Splayed Triangle) -->
      <path d="M 230 305 L 155 425 C 150 435, 160 440, 180 440 L 320 440 C 340 440, 350 435, 345 425 L 270 305 Z" fill="#d2b56e"/>
      <!-- Bristle texture lines -->
      <path d="M 235 305 L 165 440 M 240 305 L 190 440 M 245 305 L 215 440 M 250 305 L 250 440 M 255 305 L 285 440 M 260 305 L 310 440 M 265 305 L 335 440" stroke="#a4843b" stroke-width="1.2" opacity="0.75"/>

      <!-- Retail Protective Band / Label -->
      <rect x="180" y="340" width="140" height="50" rx="6" fill="#ffffff" stroke="#174D35" stroke-width="2" filter="url(#shadow)"/>
      <text x="250" y="358" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#174D35" text-anchor="middle" letter-spacing="1">MONKEY 555</text>
      <text x="250" y="372" font-family="'Poppins', 'Inter', sans-serif" font-size="10" font-weight="700" fill="#202922" text-anchor="middle">DELUXE GRASS BROOM</text>
      <text x="250" y="384" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#a87f22" text-anchor="middle">100% HILL GRASS · 1 UNIT</text>
    </g>
  `)
}

// 6. Cotton Mop Generator (Monkey 555 Cotton Floor Mop)
function generateMop() {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="120" ry="15" fill="#1b2e22" opacity="0.14"/>

    <g filter="url(#pouchShadow)">
      <!-- Long Mop Handle -->
      <rect x="240" y="55" width="20" height="240" rx="6" fill="#174D35"/>
      <text x="250" y="170" font-family="'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle" transform="rotate(-90 250 170)" letter-spacing="2">MONKEY 555</text>

      <!-- Plastic Mop Head Connector -->
      <path d="M 215 290 L 285 290 L 295 325 L 205 325 Z" fill="#D9A441" rx="4"/>
      <rect x="225" y="285" width="50" height="15" fill="#174D35" rx="3"/>

      <!-- Cotton Yarn Strands / Head -->
      <path d="M 205 325 C 190 340, 160 380, 160 415 C 160 435, 175 440, 200 440 L 300 440 C 325 440, 340 435, 340 415 C 340 380, 310 340, 295 325 Z" fill="#f0ede4"/>
      <!-- Looped yarn lines -->
      <g stroke="#b8b5a9" stroke-width="2.5" fill="none" opacity="0.8">
        <path d="M 210 328 C 195 355, 175 390, 180 435"/>
        <path d="M 225 328 C 210 355, 195 390, 200 435"/>
        <path d="M 240 328 C 230 355, 220 390, 225 435"/>
        <path d="M 255 328 C 255 355, 250 390, 250 435"/>
        <path d="M 270 328 C 275 355, 280 390, 275 435"/>
        <path d="M 285 328 C 300 355, 315 390, 310 435"/>
      </g>

      <!-- Branded Packaging Wrap -->
      <rect x="185" y="345" width="130" height="48" rx="6" fill="#ffffff" stroke="#174D35" stroke-width="2" filter="url(#shadow)"/>
      <text x="250" y="362" font-family="'Inter', sans-serif" font-size="9.5" font-weight="800" fill="#174D35" text-anchor="middle" letter-spacing="1">MONKEY 555</text>
      <text x="250" y="376" font-family="'Poppins', 'Inter', sans-serif" font-size="10" font-weight="700" fill="#202922" text-anchor="middle">COTTON FLOOR MOP</text>
      <text x="250" y="388" font-family="'Inter', sans-serif" font-size="7.5" font-weight="700" fill="#a87f22" text-anchor="middle">SUPER ABSORBENT · 1 UNIT</text>
    </g>
  `)
}

// 7. Bleaching Powder & Detergent Poly Pack
function generateSack({ brand, title, pack, mainColor, accentColor, iconSvg, subtitle }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="130" ry="16" fill="#1b2e22" opacity="0.15"/>

    <g filter="url(#pouchShadow)">
      <!-- Heavy Poly Bag shape -->
      <rect x="145" y="90" width="210" height="335" rx="14" fill="${mainColor}"/>

      <!-- Top Seal with Handle cutout -->
      <rect x="145" y="90" width="210" height="35" rx="6" fill="${accentColor}"/>
      <rect x="215" y="98" width="70" height="14" rx="7" fill="#f6f3eb"/>

      <!-- Front Label Area -->
      <rect x="160" y="145" width="180" height="260" rx="8" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="160" y="145" width="180" height="12" fill="${accentColor}" rx="4 4 0 0"/>

      <text x="250" y="180" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="${mainColor}" letter-spacing="1.5" text-anchor="middle">${brand.toUpperCase()}</text>
      <line x1="185" y1="188" x2="315" y2="188" stroke="${mainColor}" stroke-width="1" opacity="0.3"/>

      <!-- Emblem -->
      <g transform="translate(215, 200)">
        ${iconSvg}
      </g>

      <text x="250" y="295" font-family="'Poppins', 'Inter', sans-serif" font-size="15" font-weight="700" fill="#1b241e" text-anchor="middle">${title}</text>
      <text x="250" y="312" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#68756c" text-anchor="middle">${subtitle}</text>

      <!-- Weight badge -->
      <rect x="190" y="335" width="120" height="28" rx="14" fill="${mainColor}"/>
      <text x="250" y="353" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Net Wt. ${pack}</text>

      <rect x="180" y="375" width="140" height="18" rx="4" fill="#eef2ee"/>
      <text x="250" y="388" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="${mainColor}" text-anchor="middle" letter-spacing="0.5">HEAVY-DUTY RETAIL PACK</text>
    </g>
  `)
}

// 8. Dishwash Bar
function generateBar({ brand, title, pack }) {
  return createSvg(500, 500, `
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="445" rx="140" ry="16" fill="#1b2e22" opacity="0.15"/>

    <g filter="url(#pouchShadow)">
      <!-- Rectangular Soap Bar with Wrap -->
      <rect x="130" y="170" width="240" height="180" rx="16" fill="#2e7d32"/>
      <!-- Foil wrap sheen -->
      <rect x="130" y="170" width="240" height="180" rx="16" fill="url(#foilSheen)"/>

      <!-- End fold creases -->
      <polygon points="130,170 150,195 130,220" fill="#1b5e20"/>
      <polygon points="130,300 150,325 130,350" fill="#1b5e20"/>
      <polygon points="370,170 350,195 370,220" fill="#1b5e20"/>
      <polygon points="370,300 350,325 370,350" fill="#1b5e20"/>

      <!-- Wrapper center label -->
      <rect x="155" y="195" width="190" height="130" rx="10" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="155" y="195" width="190" height="10" fill="#D9A441" rx="4 4 0 0"/>

      <text x="250" y="228" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#205B6F" letter-spacing="1.5" text-anchor="middle">${brand.toUpperCase()}</text>
      <text x="250" y="258" font-family="'Poppins', 'Inter', sans-serif" font-size="16" font-weight="700" fill="#1b241e" text-anchor="middle">${title}</text>
      <text x="250" y="278" font-family="'Inter', sans-serif" font-size="9.5" font-weight="600" fill="#558b2f" text-anchor="middle">With Real Lemon Extracts</text>

      <rect x="195" y="292" width="110" height="22" rx="11" fill="#2e7d32"/>
      <text x="250" y="307" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Net Wt. ${pack}</text>
    </g>
  `)
}

// 9. Brand Master Banner Visual (800 x 450)
function generateBrandBanner({ brand, tagline, category, primaryColor, accentColor, itemsText }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#14211a"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="800" height="450" fill="url(#bgGrad)" rx="20"/>
  
  <!-- Subtle background line patterns -->
  <g stroke="#ffffff" stroke-width="1" opacity="0.06">
    <circle cx="650" cy="225" r="180" fill="none"/>
    <circle cx="650" cy="225" r="130" fill="none"/>
    <circle cx="650" cy="225" r="80" fill="none"/>
  </g>

  <!-- Left Content Info -->
  <g transform="translate(60, 110)">
    <!-- Category Pill -->
    <rect x="0" y="0" width="150" height="28" rx="14" fill="${accentColor}"/>
    <text x="75" y="18" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#16291e" text-anchor="middle" letter-spacing="1">${category.toUpperCase()}</text>

    <!-- Brand Name -->
    <text x="0" y="70" font-family="'Poppins', 'Inter', sans-serif" font-size="34" font-weight="700" fill="#ffffff">${brand}</text>
    <text x="0" y="105" font-family="'Inter', sans-serif" font-size="14" font-weight="500" fill="#e0e8e2">${tagline}</text>

    <!-- Packaging Highlights -->
    <rect x="0" y="140" width="340" height="40" rx="8" fill="#ffffff" opacity="0.12"/>
    <text x="16" y="165" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#fdfcf8">Packaged Line: ${itemsText}</text>

    <text x="0" y="220" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="${accentColor}" letter-spacing="1">AUTHENTIC FMCG PACKAGING · OFFICIAL AGENCY DISTRIBUTION</text>
  </g>

  <!-- Right Packaged Product Graphic Mockup Group -->
  <g transform="translate(560, 90)" filter="url(#cardShadow)">
    <!-- Main Pouch Mockup -->
    <path d="M 40 40 L 150 40 L 158 240 C 158 248, 150 255, 140 255 L 50 255 C 40 255, 32 248, 32 240 Z" fill="#ffffff"/>
    <rect x="40" y="40" width="110" height="14" fill="${accentColor}" rx="2"/>
    <rect x="45" y="75" width="100" height="145" fill="#f4efe5" rx="6"/>
    <text x="95" y="105" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="${primaryColor}" text-anchor="middle">${brand.split(' ')[0]}</text>
    <circle cx="95" cy="135" r="16" fill="${accentColor}"/>
    <text x="95" y="175" font-family="'Poppins', sans-serif" font-size="11" font-weight="700" fill="#1b241e" text-anchor="middle">RETAIL</text>
    <text x="95" y="190" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="${primaryColor}" text-anchor="middle">PACK</text>

    <!-- Secondary Item Mockup -->
    <g transform="translate(110, 60)">
      <rect x="0" y="0" width="75" height="150" rx="8" fill="#fdfbf7" filter="url(#cardShadow)"/>
      <rect x="0" y="0" width="75" height="10" fill="${primaryColor}" rx="4 4 0 0"/>
      <circle cx="37" cy="45" r="14" fill="${accentColor}" opacity="0.6"/>
      <text x="37" y="80" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#202b23" text-anchor="middle">SEALED</text>
      <text x="37" y="94" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="${primaryColor}" text-anchor="middle">JAR / BTL</text>
    </g>
  </g>
</svg>`
}

// Icon templates
const chilliIcon = `<circle cx="35" cy="35" r="28" fill="#d32f2f" opacity="0.15"/><path d="M 24 45 C 24 45, 32 25, 46 22 C 45 28, 38 48, 24 45 Z" fill="#d32f2f"/><path d="M 46 22 C 48 18, 50 16, 52 15" stroke="#388e3c" stroke-width="2.5" stroke-linecap="round"/>`
const turmericIcon = `<circle cx="35" cy="35" r="28" fill="#fbc02d" opacity="0.2"/><circle cx="35" cy="35" r="20" fill="#fbc02d"/><path d="M 28 35 Q 35 25 42 35" stroke="#ffffff" stroke-width="2" fill="none"/>`
const corianderIcon = `<circle cx="35" cy="35" r="28" fill="#388e3c" opacity="0.15"/><circle cx="30" cy="35" r="8" fill="#689f38"/><circle cx="42" cy="32" r="7" fill="#8bc34a"/><circle cx="36" cy="42" r="6" fill="#558b2f"/>`
const spiceBlendIcon = `<circle cx="35" cy="35" r="28" fill="#d84315" opacity="0.15"/><polygon points="35,15 39,27 52,27 41,35 45,47 35,39 25,47 29,35 18,27 31,27" fill="#d84315"/>`
const instantMixIcon = `<circle cx="35" cy="35" r="28" fill="#ef6c00" opacity="0.15"/><path d="M 20 38 Q 35 18 50 38 Z" fill="#ef6c00"/><circle cx="35" cy="44" r="3" fill="#ef6c00"/>`
const poojaIcon = `<circle cx="35" cy="35" r="28" fill="#f9a825" opacity="0.2"/><path d="M 22 45 C 22 45, 26 50, 35 50 C 44 50, 48 45, 48 45 Z" fill="#c49000"/><path d="M 35 20 C 35 20, 42 30, 42 37 C 42 42, 38 45, 35 45 C 32 45, 28 42, 28 37 C 28 30, 35 20, 35 20 Z" fill="#ff6f00"/>`
const cleanIcon = `<circle cx="35" cy="35" r="28" fill="#00897b" opacity="0.15"/><path d="M 35 18 L 40 30 L 52 35 L 40 40 L 35 52 L 30 40 L 18 35 L 30 30 Z" fill="#00897b"/>`
const soapIcon = `<circle cx="35" cy="35" r="28" fill="#0288d1" opacity="0.15"/><circle cx="30" cy="30" r="10" fill="#03a9f4"/><circle cx="42" cy="40" r="7" fill="#29b6f6"/><circle cx="25" cy="44" r="5" fill="#4fc3f7"/>`

// Generate Products
const products = [
  // Swastik Pickles & Masalas
  { id: 'swastik-mango-pickle', fn: () => generateJar({ brand: 'Swastik', title: 'Mango Pickle', flavor: 'Mango', pack: '300 g', capColor: '#B94B35', pickleColor: '#8a2b16' }) },
  { id: 'swastik-lime-pickle', fn: () => generateJar({ brand: 'Swastik', title: 'Lime Pickle', flavor: 'Lime', pack: '300 g', capColor: '#B94B35', pickleColor: '#967812' }) },
  { id: 'swastik-sambar-powder', fn: () => generatePouch({ brand: 'Swastik', title: 'Sambar Powder', category: 'Traditional Spice Blend', pack: '200 g', mainColor: '#B94B35', accentColor: '#e06d53', iconSvg: spiceBlendIcon }) },
  { id: 'swastik-rasam-powder', fn: () => generatePouch({ brand: 'Swastik', title: 'Rasam Powder', category: 'Aromatic Peppercorn Blend', pack: '200 g', mainColor: '#A03823', accentColor: '#c7573e', iconSvg: spiceBlendIcon }) },
  { id: 'swastik-badam-powder', fn: () => generatePouch({ brand: 'Swastik', title: 'Badam Powder', category: 'Almond Beverage Mix', pack: '200 g', mainColor: '#b8860b', accentColor: '#daa520', iconSvg: instantMixIcon }) },
  { id: 'swastik-rava-idli-mix', fn: () => generatePouch({ brand: 'Swastik', title: 'Rava Idli Mix', category: 'Instant Breakfast Mix', pack: '500 g', mainColor: '#9c412b', accentColor: '#c46048', iconSvg: instantMixIcon }) },
  { id: 'swastik-puliyogare-powder', fn: () => generatePouch({ brand: 'Swastik', title: 'Puliyogare Powder', category: 'Tamarind Rice Masala', pack: '200 g', mainColor: '#873220', accentColor: '#ad4f39', iconSvg: spiceBlendIcon }) },
  { id: 'swastik-gulab-jamun-mix', fn: () => generatePouch({ brand: 'Swastik', title: 'Gulab Jamun Mix', category: 'Instant Celebration Dessert', pack: '200 g', mainColor: '#882d3b', accentColor: '#b0495a', iconSvg: instantMixIcon }) },
  { id: 'swastik-roasted-vermicelli', fn: () => generateVermicelli({ brand: 'Swastik', title: 'Roasted Vermicelli', pack: '400 g', brandColor: '#B94B35' }) },

  // Rala Food Specialists
  { id: 'rala-chilli-powder', fn: () => generatePouch({ brand: 'Rala', title: 'Chilli Powder', category: 'Pure Ground Red Chilli', pack: '200 g', mainColor: '#c62828', accentColor: '#e53935', iconSvg: chilliIcon }) },
  { id: 'rala-turmeric-powder', fn: () => generatePouch({ brand: 'Rala', title: 'Turmeric Powder', category: 'Pure High-Curcumin Turmeric', pack: '200 g', mainColor: '#D9A441', accentColor: '#f9a825', iconSvg: turmericIcon }) },
  { id: 'rala-coriander-powder', fn: () => generatePouch({ brand: 'Rala', title: 'Coriander Powder', category: 'Pure Ground Coriander', pack: '200 g', mainColor: '#43a047', accentColor: '#66bb6a', iconSvg: corianderIcon }) },
  { id: 'rala-chicken-masala', fn: () => generatePouch({ brand: 'Rala', title: 'Chicken Masala', category: 'Special Chicken Curry Blend', pack: '100 g', mainColor: '#c05621', accentColor: '#dd6b20', iconSvg: spiceBlendIcon }) },
  { id: 'rala-meat-masala', fn: () => generatePouch({ brand: 'Rala', title: 'Meat Masala', category: 'Robust Mutton Spice Blend', pack: '100 g', mainColor: '#7b341e', accentColor: '#9c4221', iconSvg: spiceBlendIcon }) },
  { id: 'rala-garam-masala', fn: () => generatePouch({ brand: 'Rala', title: 'Garam Masala', category: 'Select Aromatic Whole Spices', pack: '100 g', mainColor: '#825a2c', accentColor: '#a67c52', iconSvg: spiceBlendIcon }) },
  { id: 'rala-kasuri-methi', fn: () => generatePouch({ brand: 'Rala', title: 'Kasuri Methi', category: 'Sun-Dried Fenugreek Leaves', pack: '50 g', mainColor: '#2e7d32', accentColor: '#4caf50', iconSvg: corianderIcon }) },

  // Monkey 555
  { id: 'monkey-555-grass-broom', fn: () => generateBroom() },
  { id: 'monkey-555-cotton-mop', fn: () => generateMop() },
  { id: 'monkey-555-phenyl', fn: () => generateBottle({ brand: 'Monkey 555', title: 'Pine Disinfectant', volume: '1 Litre', liquidColor: '#2e7d32', bottleColor: '#ffffff', capColor: '#174D35', subtitle: 'PINE GERMICIDAL PHENYL' }) },
  { id: 'monkey-555-ozone-cleaner', fn: () => generateBottle({ brand: 'Monkey 555', title: 'Ozone Cleaner', volume: '500 ml', liquidColor: '#00acc1', bottleColor: '#f2fafa', capColor: '#00838f', subtitle: 'MULTI-SURFACE SANITIZER' }) },
  { id: 'monkey-555-bleaching-powder', fn: () => generateSack({ brand: 'Monkey 555', title: 'Bleaching Powder', pack: '1 kg', mainColor: '#174D35', accentColor: '#267352', iconSvg: cleanIcon, subtitle: 'DISINFECTANT CHLORINATED' }) },

  // Monkey VVV
  { id: 'monkey-vvv-detergent-powder', fn: () => generateSack({ brand: 'Monkey VVV', title: 'Detergent Powder', pack: '1 kg', mainColor: '#205B6F', accentColor: '#0288d1', iconSvg: soapIcon, subtitle: 'ACTIVE ENZYME WASHING' }) },
  { id: 'monkey-vvv-dishwash-bar', fn: () => generateBar({ brand: 'Monkey VVV', title: 'Dishwash Bar', pack: '250 g' }) },
  { id: 'monkey-vvv-dishwash-gel', fn: () => generateBottle({ brand: 'Monkey VVV', title: 'Dishwash Gel', volume: '500 ml', liquidColor: '#7cb342', bottleColor: '#f9fdf5', capColor: '#558b2f', subtitle: 'GREASE CUTTING FORMULA' }) },

  // Aruna Masala
  { id: 'aruna-roasted-vermicelli', fn: () => generateVermicelli({ brand: 'Aruna Masala', title: 'Roasted Vermicelli', pack: '400 g', brandColor: '#A63820' }) },
  { id: 'aruna-gulab-jamun-mix', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Gulab Jamun Mix', category: 'Instant Dessert Mix Pack', pack: '200 g', mainColor: '#8a2334', accentColor: '#ad394d', iconSvg: instantMixIcon }) },
  { id: 'aruna-chicken-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Chicken Masala', category: 'Coastal Recipe Chicken Masala', pack: '100 g', mainColor: '#A63820', accentColor: '#c94f34', iconSvg: spiceBlendIcon }) },
  { id: 'aruna-mutton-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Mutton Masala', category: 'Special Meat Curry Masala', pack: '100 g', mainColor: '#7a2214', accentColor: '#9e3422', iconSvg: spiceBlendIcon }) },
  { id: 'aruna-fish-curry-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Fish Curry Masala', category: 'Authentic Coastal Fish Curry', pack: '100 g', mainColor: '#c2410c', accentColor: '#ea580c', iconSvg: spiceBlendIcon }) },
  { id: 'aruna-egg-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Egg Masala', category: 'Egg Curry & Roast Masala', pack: '100 g', mainColor: '#b45309', accentColor: '#d97706', iconSvg: spiceBlendIcon }) },
  { id: 'aruna-garam-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Garam Masala', category: 'Master Whole Spice Blend', pack: '100 g', mainColor: '#854d0e', accentColor: '#a16207', iconSvg: spiceBlendIcon }) },
  { id: 'aruna-biryani-masala', fn: () => generatePouch({ brand: 'Aruna Masala', title: 'Biryani Masala', category: 'Royal Dum Biryani Spice Blend', pack: '100 g', mainColor: '#6d28d9', accentColor: '#8b5cf6', iconSvg: spiceBlendIcon }) },

  // Deeppam Aarti
  { id: 'deeppam-aarti-oil-450ml', fn: () => generateBottle({ brand: 'Deeppam Aarti', title: 'Pooja Aarti Oil', volume: '450 ml', liquidColor: '#f59e0b', bottleColor: '#fffbeb', capColor: '#C98A2C', subtitle: 'PURE DEVOTIONAL LAMP OIL' }) },
]

// Generate Brands
const brands = [
  { id: 'swastik', brand: 'Swastik Pickles & Masalas', tagline: 'Authentic Heritage Pickles & Powders', category: 'Food & Spices', primaryColor: '#B94B35', accentColor: '#f7d070', itemsText: 'Pickles, Sambar, Rasam, Instant Mixes' },
  { id: 'rala', brand: 'Rala Food Specialists', tagline: 'Pure Ground Spices & Culinary Masalas', category: 'Food & Spices', primaryColor: '#946c18', accentColor: '#f3c456', itemsText: 'Chilli, Turmeric, Coriander, Chicken Masala' },
  { id: 'monkey-555', brand: 'Monkey 555', tagline: 'Household Cleaning & Sanitation Essentials', category: 'Home Care', primaryColor: '#174D35', accentColor: '#7dd3a8', itemsText: 'Brooms, Mops, Phenyl, Bleaching Powder' },
  { id: 'monkey-vvv', brand: 'Monkey VVV', tagline: 'Active Laundry & Dishwashing Care', category: 'Home Care', primaryColor: '#205B6F', accentColor: '#72c8e3', itemsText: 'Detergent Powder, Dishwash Bar & Gel' },
  { id: 'aruna', brand: 'Aruna Masala', tagline: 'Coastal & Regional Masalas of Tradition', category: 'Food & Spices', primaryColor: '#A63820', accentColor: '#fab29c', itemsText: 'Chicken, Mutton, Fish Curry, Biryani Masala' },
  { id: 'deeppam', brand: 'Deeppam Aarti', tagline: 'Pure Lighting Oil for Daily Divine Prayer', category: 'Pooja Essentials', primaryColor: '#9c6819', accentColor: '#fad072', itemsText: 'Aarti Pooja Oil 450 ml' },
]

// Write products
for (const p of products) {
  const filePath = path.join(productsDir, `${p.id}.svg`)
  fs.writeFileSync(filePath, p.fn(), 'utf8')
  console.log('Generated product:', filePath)
}

// Write brands
for (const b of brands) {
  const filePath = path.join(brandsDir, `${b.id}.svg`)
  fs.writeFileSync(filePath, generateBrandBanner(b), 'utf8')
  console.log('Generated brand:', filePath)
}

console.log('Done! Generated all 33 products and 6 brand SVG packaging images.')

