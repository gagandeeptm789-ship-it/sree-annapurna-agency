const fs = require('fs')
const path = require('path')

const heroSvgPath = path.join(__dirname, '..', 'public', 'images', 'hero-fmcg-packaging.svg')

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" width="100%" height="100%">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b4d36"/>
      <stop offset="60%" stop-color="#143a29"/>
      <stop offset="100%" stop-color="#0d241a"/>
    </linearGradient>
    <filter id="packDrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="1000" height="800" fill="url(#heroBg)"/>

  <!-- Geometric aura circles -->
  <circle cx="650" cy="400" r="300" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.08"/>
  <circle cx="650" cy="400" r="220" fill="none" stroke="#D9A441" stroke-width="1.5" opacity="0.12"/>
  <circle cx="650" cy="400" r="140" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.06"/>

  <!-- Base platform shadow -->
  <ellipse cx="600" cy="680" rx="340" ry="40" fill="#05120c" opacity="0.45"/>

  <!-- Packaging Group Showcase -->
  <g filter="url(#packDrop)">
    <!-- 1. Background Package: Monkey 555 Phenyl Bottle (left-back) -->
    <g transform="translate(320, 240)">
      <rect x="35" y="0" width="30" height="20" rx="3" fill="#174D35"/>
      <rect x="42" y="20" width="16" height="15" fill="#f5f7f5"/>
      <path d="M 42 35 C 25 45, 0 65, 0 95 L 0 350 C 0 365, 10 370, 25 370 L 75 370 C 90 370, 100 365, 100 350 L 100 95 C 100 65, 75 45, 58 35 Z" fill="#ffffff" stroke="#e0e5e2" stroke-width="1.5"/>
      <rect x="10" y="110" width="80" height="180" rx="6" fill="#f8faf8"/>
      <rect x="10" y="110" width="80" height="8" fill="#174D35" rx="3 3 0 0"/>
      <text x="50" y="132" font-family="'Inter', sans-serif" font-size="7.5" font-weight="800" fill="#174D35" text-anchor="middle">MONKEY 555</text>
      <text x="50" y="152" font-family="'Poppins', sans-serif" font-size="9" font-weight="700" fill="#1f2d23" text-anchor="middle">PHENYL</text>
      <circle cx="50" cy="180" r="12" fill="#174D35" opacity="0.2"/>
      <circle cx="50" cy="180" r="9" fill="#174D35"/>
      <text x="50" y="184" font-family="'Inter', sans-serif" font-size="7" font-weight="800" fill="#ffffff" text-anchor="middle">1L</text>
      <rect x="20" y="240" width="60" height="16" rx="8" fill="#174D35"/>
      <text x="50" y="252" font-family="'Inter', sans-serif" font-size="7" font-weight="700" fill="#ffffff" text-anchor="middle">1 Litre Pack</text>
    </g>

    <!-- 2. Midground Package: Swastik Pickle Jar (left-center) -->
    <g transform="translate(420, 270)">
      <rect x="25" y="0" width="130" height="30" rx="5" fill="#B94B35"/>
      <rect x="30" y="30" width="120" height="14" fill="#f3df9b"/>
      <text x="90" y="40" font-family="'Inter', sans-serif" font-size="7" font-weight="700" fill="#4d3809" text-anchor="middle">SEALED FOR FRESHNESS</text>
      <path d="M 15 50 C 15 44, 25 44, 35 44 L 145 44 C 155 44, 165 44, 165 50 L 170 330 C 170 345, 158 350, 145 350 L 35 350 C 22 350, 10 345, 10 330 Z" fill="#882813"/>
      <!-- Jar Label -->
      <rect x="20" y="100" width="140" height="180" rx="6" fill="#ffffff" stroke="#d4af37" stroke-width="1.5"/>
      <text x="90" y="128" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#B94B35" letter-spacing="1.5" text-anchor="middle">SWASTIK</text>
      <text x="90" y="152" font-family="'Poppins', sans-serif" font-size="13" font-weight="700" fill="#1f2420" text-anchor="middle">MANGO PICKLE</text>
      <circle cx="90" cy="190" r="22" fill="#B94B35" opacity="0.15"/>
      <circle cx="90" cy="190" r="17" fill="#B94B35"/>
      <text x="90" y="196" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">M</text>
      <text x="90" y="235" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#606d63" text-anchor="middle">In Cold-Pressed Oil</text>
      <rect x="50" y="248" width="80" height="18" rx="9" fill="#B94B35"/>
      <text x="90" y="261" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">Net Wt. 300 g</text>
    </g>

    <!-- 3. Foreground Package: Aruna Chicken Masala Sealed Pouch (center) -->
    <g transform="translate(560, 200)">
      <path d="M 12 15 C 12 8, 18 0, 28 0 L 222 0 C 232 0, 238 8, 238 15 L 255 420 C 256 432, 248 440, 234 440 L 16 440 C 2 440, -6 432, -5 420 Z" fill="#A63820"/>
      <!-- Top seal crimp -->
      <rect x="10" y="0" width="230" height="25" rx="3" fill="#c94f34"/>
      <path d="M 15 6 L 235 6 M 15 12 L 235 12 M 15 18 L 235 18" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.6"/>
      <!-- Tear notch -->
      <polygon points="10,12 16,9 16,15" fill="#1b4d36"/>
      <polygon points="240,12 234,9 234,15" fill="#1b4d36"/>
      <!-- Pouch Label -->
      <rect x="30" y="55" width="190" height="340" rx="10" fill="#ffffff"/>
      <rect x="30" y="55" width="190" height="12" fill="#D9A441" rx="5 5 0 0"/>
      <text x="125" y="92" font-family="'Inter', sans-serif" font-size="13" font-weight="800" fill="#A63820" letter-spacing="1.5" text-anchor="middle">ARUNA MASALA</text>
      <line x1="60" y1="102" x2="190" y2="102" stroke="#A63820" stroke-width="1" opacity="0.3"/>
      <!-- Icon badge -->
      <circle cx="125" cy="148" r="32" fill="#A63820" opacity="0.15"/>
      <polygon points="125,124 130,138 145,138 133,148 138,162 125,152 112,162 117,148 105,138 120,138" fill="#A63820"/>
      <text x="125" y="222" font-family="'Poppins', sans-serif" font-size="17" font-weight="700" fill="#1c241e" text-anchor="middle">CHICKEN MASALA</text>
      <text x="125" y="244" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#67736a" text-anchor="middle">Coastal Recipe Curry Blend</text>
      <rect x="65" y="272" width="120" height="32" rx="16" fill="#f4f0e6"/>
      <text x="125" y="293" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#174D35" text-anchor="middle">Net Wt. 100 g</text>
      <rect x="55" y="325" width="140" height="24" rx="6" fill="#A63820" opacity="0.12"/>
      <text x="125" y="341" font-family="'Inter', sans-serif" font-size="9.5" font-weight="700" fill="#A63820" text-anchor="middle" letter-spacing="1">SEALED RETAIL POUCH</text>
    </g>

    <!-- 4. Front-Right Package: Deeppam Aarti 450 ml Pooja Oil Bottle -->
    <g transform="translate(760, 260)">
      <rect x="40" y="0" width="40" height="25" rx="4" fill="#C98A2C"/>
      <rect x="48" y="25" width="24" height="15" fill="#fffdfa"/>
      <path d="M 48 40 C 35 50, 15 70, 15 100 L 15 360 C 15 375, 25 380, 40 380 L 80 380 C 95 380, 105 375, 105 360 L 105 100 C 105 70, 85 50, 72 40 Z" fill="#fffdf5" stroke="#ded8c8" stroke-width="1.5"/>
      <path d="M 18 180 L 102 180 L 102 360 C 102 372, 95 377, 80 377 L 40 377 C 25 377, 18 372, 18 360 Z" fill="#f59e0b" opacity="0.3"/>
      <!-- Label -->
      <rect x="22" y="110" width="76" height="180" rx="6" fill="#ffffff" stroke="#C98A2C" stroke-width="1.2"/>
      <text x="60" y="132" font-family="'Inter', sans-serif" font-size="7.5" font-weight="800" fill="#C98A2C" letter-spacing="0.8" text-anchor="middle">DEEPPAM</text>
      <text x="60" y="148" font-family="'Poppins', sans-serif" font-size="9" font-weight="700" fill="#241e12" text-anchor="middle">AARTI OIL</text>
      <!-- Diya flame -->
      <path d="M 60 162 C 60 162, 66 172, 66 178 C 66 182, 63 185, 60 185 C 57 185, 54 182, 54 178 C 54 172, 60 162, 60 162 Z" fill="#f59e0b"/>
      <path d="M 50 185 C 50 185, 53 190, 60 190 C 67 190, 70 185, 70 185 Z" fill="#b45309"/>
      <rect x="30" y="240" width="60" height="18" rx="9" fill="#C98A2C"/>
      <text x="60" y="253" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle">450 ml</text>
    </g>
  </g>
</svg>`

fs.writeFileSync(heroSvgPath, heroSvg, 'utf8')
console.log('Generated hero SVG at:', heroSvgPath)

