import fs from 'fs'
import path from 'path'

const brands = [
  {
    id: 'swastik',
    name: 'Swastik Pickles & Masalas',
    shortName: 'SWASTIK',
    tagline: 'Authentic South Indian Pickles & Culinary Powders',
    category: 'FOOD & SPICES',
    color: '#B94B35',
    sublines: ['Sealed Jar Pickles (Mango, Lime)', 'Aromatic Sambar & Rasam Powders', 'Instant Idli, Badam & Jamun Mixes', 'Roasted Vermicelli Packs'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  },
  {
    id: 'rala',
    name: 'Rala Food Specialists',
    shortName: 'RALA',
    tagline: 'High-Potency Spices & Signature Blends',
    category: 'PURE SPICES & BLENDS',
    color: '#C98A2C',
    sublines: ['Single-Origin Chilli, Turmeric, Coriander', 'Specialist Chicken & Meat Blends', 'Aromatic Garam Masala Pouches', 'Premium Sun-Dried Kasuri Methi'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  },
  {
    id: 'monkey-555',
    name: 'Monkey 555',
    shortName: 'MONKEY 555',
    tagline: 'Durable Sanitation & Household Hygiene Tools',
    category: 'HOME CARE & SANITATION',
    color: '#174D35',
    sublines: ['Durable Natural Grass Brooms', 'Heavy-Duty Cotton Floor Mops', 'Disinfectant Floor Phenyl (1 L)', 'Sanitation Bleaching Powder'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  },
  {
    id: 'monkey-vvv',
    name: 'Monkey VVV',
    shortName: 'MONKEY VVV',
    tagline: 'Everyday Laundry & Kitchen Hygiene',
    category: 'LAUNDRY & DISH CARE',
    color: '#1F5A6D',
    sublines: ['Active Detergent Washing Powder', 'Grease-Cutting Dishwash Bars', 'Concentrated Lemon Dishwash Gel', 'Household Restock Packs'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  },
  {
    id: 'aruna',
    name: 'Aruna Masala',
    shortName: 'ARUNA',
    tagline: 'Coastal Flavour & Signature Masalas',
    category: 'COASTAL & REGIONAL SPICES',
    color: '#9C341F',
    sublines: ['Signature Chicken & Mutton Masalas', 'Traditional Coastal Fish Curry Mix', 'Egg Masala & Biryani Spice Pouches', 'Roasted Vermicelli & Dessert Mixes'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  },
  {
    id: 'deeppam',
    name: 'Deeppam Aarti',
    shortName: 'DEEPPAM',
    tagline: 'Sacred Lighting & Pooja Essentials',
    category: 'SACRED POOJA ESSENTIALS',
    color: '#B87B22',
    sublines: ['Formulated Sacred Aarti Oil (450 ml)', 'Long-Lasting, Soot-Free Flame', 'Temple & Auspicious Home Rituals', 'Sealed Retail PET Packaging'],
    coverage: 'Authorized Carrying & Forwarding Partner · Karnataka & South Zone'
  }
]

function generateBrandSvg(b) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <!-- Card Background -->
  <rect width="800" height="480" fill="#ffffff" rx="10"/>
  <rect x="2" y="2" width="796" height="476" fill="none" stroke="#e6e1d5" stroke-width="2" rx="8"/>

  <!-- Left Accent Color Border -->
  <rect x="2" y="2" width="12" height="476" fill="${b.color}" rx="4"/>

  <!-- Top Agency Header -->
  <g transform="translate(42, 44)">
    <rect x="0" y="0" width="160" height="26" rx="4" fill="${b.color}15"/>
    <text x="12" y="17" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="${b.color}" letter-spacing="1">${b.category}</text>
    <text x="716" y="17" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#757064" text-anchor="end">AUTHENTIC FMCG PARTNER</text>
  </g>

  <!-- Brand Typography & Heritage Hallmark -->
  <g transform="translate(42, 116)">
    <text x="0" y="0" font-family="'Poppins', 'Inter', sans-serif" font-size="36" font-weight="700" fill="#14261c">${b.name}</text>
    <text x="0" y="32" font-family="'Inter', sans-serif" font-size="15" font-weight="500" fill="#525d56">${b.tagline}</text>
  </g>

  <!-- Horizontal Divider -->
  <line x1="42" y1="184" x2="758" y2="184" stroke="#ebe6dc" stroke-width="1.5"/>

  <!-- Genuine Product Portfolio Scope Block -->
  <g transform="translate(42, 216)">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#38443e" letter-spacing="0.8">CONFIRMED PRODUCT LINES DISTRIBUTED BY SREE ANNAPURNA AGENCY:</text>
    
    <g transform="translate(0, 24)">
      ${b.sublines.map((line, idx) => `
        <g transform="translate(${idx % 2 === 0 ? 0 : 360}, ${Math.floor(idx / 2) * 44})">
          <rect x="0" y="0" width="340" height="34" rx="4" fill="#faf8f3" stroke="#e8e2d5" stroke-width="1"/>
          <circle cx="16" cy="17" r="4" fill="${b.color}"/>
          <text x="30" y="21" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#243029">${line}</text>
        </g>
      `).join('')}
    </g>
  </g>

  <!-- Bottom Authorized Distributor Badge -->
  <g transform="translate(42, 420)">
    <rect x="0" y="-14" width="716" height="42" rx="6" fill="#f4f8f5" stroke="#d7e5dc" stroke-width="1"/>
    <circle cx="24" cy="7" r="8" fill="#174d35"/>
    <text x="24" y="11" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">✓</text>
    <text x="44" y="11" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#174d35">
      ${b.coverage}
    </text>
    <text x="700" y="11" font-family="'Inter', sans-serif" font-size="10.5" font-weight="600" fill="#58695f" text-anchor="end">
      Genuine Manufacturer Dispatch
    </text>
  </g>
</svg>`
}

const outDir = path.resolve('public/images/brands')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

for (const b of brands) {
  const filePath = path.join(outDir, `${b.id}.svg`)
  fs.writeFileSync(filePath, generateBrandSvg(b), 'utf-8')
  console.log(`Generated authentic brand showcase asset: ${b.id}.svg`)
}

// Also generate the professional corporate hero image
const heroSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 600" width="100%" height="100%">
  <!-- Corporate FMCG Distribution Blueprint Panel -->
  <rect width="700" height="600" fill="#0f2e21" rx="14"/>
  <rect x="16" y="16" width="668" height="568" fill="none" stroke="#255440" stroke-width="1.5" rx="10"/>

  <!-- Subtle Blueprint Grid Lines -->
  <g stroke="#1d4d38" stroke-width="0.75" opacity="0.6">
    <line x1="16" y1="120" x2="684" y2="120"/>
    <line x1="16" y1="240" x2="684" y2="240"/>
    <line x1="16" y1="360" x2="684" y2="360"/>
    <line x1="16" y1="480" x2="684" y2="480"/>
    <line x1="240" y1="16" x2="240" y2="584"/>
    <line x1="460" y1="16" x2="460" y2="584"/>
  </g>

  <!-- Header Card: Distribution Network Credentials -->
  <g transform="translate(40, 48)">
    <rect x="0" y="0" width="620" height="88" rx="8" fill="#153c2c" stroke="#2c694e" stroke-width="1.5"/>
    <circle cx="36" cy="44" r="18" fill="#d9a441"/>
    <text x="36" y="50" font-family="'Poppins', sans-serif" font-size="13" font-weight="800" fill="#0f2e21" text-anchor="middle">SA</text>
    <text x="68" y="38" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#d9a441" letter-spacing="1.5">SREE ANNAPURNA AGENCY</text>
    <text x="68" y="58" font-family="'Poppins', sans-serif" font-size="16" font-weight="600" fill="#ffffff">Authorized Carrying &amp; Forwarding Distribution Network</text>
    <text x="600" y="48" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#a3cfb8" text-anchor="end">ESTD. AGENCY</text>
  </g>

  <!-- Middle 6 Brands Matrix -->
  <g transform="translate(40, 160)">
    <!-- Swastik -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#B94B35"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#e8baa7" letter-spacing="0.5">FOOD &amp; SPICES</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Swastik</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Pickles &amp; Masalas</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">9 Catalogue Items</text>
    </g>

    <!-- Rala -->
    <g transform="translate(212, 0)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#D9A441"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#f2d79d" letter-spacing="0.5">SPICES &amp; BLENDS</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Rala</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Food Specialists</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">7 Catalogue Items</text>
    </g>

    <!-- Monkey 555 -->
    <g transform="translate(425, 0)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#2d8558"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#b0e0c5" letter-spacing="0.5">HOME CARE</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Monkey 555</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Sanitation &amp; Tools</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">5 Catalogue Items</text>
    </g>

    <!-- Monkey VVV -->
    <g transform="translate(0, 126)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#3a8a9e"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#b6dfee" letter-spacing="0.5">LAUNDRY &amp; DISH</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Monkey VVV</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Detergent &amp; Care</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">3 Catalogue Items</text>
    </g>

    <!-- Aruna Masala -->
    <g transform="translate(212, 126)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#c04e35"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#f2b3a2" letter-spacing="0.5">COASTAL MASALAS</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Aruna Masala</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Curry &amp; Non-Veg Mix</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">8 Catalogue Items</text>
    </g>

    <!-- Deeppam Aarti -->
    <g transform="translate(425, 126)">
      <rect x="0" y="0" width="195" height="110" rx="8" fill="#143628" stroke="#285640" stroke-width="1"/>
      <rect x="12" y="12" width="8" height="24" rx="2" fill="#e0a03c"/>
      <text x="28" y="24" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#f7e1b5" letter-spacing="0.5">POOJA ESSENTIALS</text>
      <text x="12" y="58" font-family="'Poppins', sans-serif" font-size="14" font-weight="700" fill="#ffffff">Deeppam Aarti</text>
      <text x="12" y="74" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#a7c2b4">Sacred Pooja Oil</text>
      <text x="12" y="94" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#d9a441">450 ml Pack Size</text>
    </g>
  </g>

  <!-- Bottom Fulfillment & Logistics Guarantee Bar -->
  <g transform="translate(40, 424)">
    <rect x="0" y="0" width="620" height="116" rx="8" fill="#153c2c" stroke="#2c694e" stroke-width="1.5"/>
    <text x="24" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#d9a441" letter-spacing="1">AGENCY DISTRIBUTION PILLARS</text>
    
    <g transform="translate(24, 46)">
      <circle cx="6" cy="6" r="4" fill="#58c48e"/>
      <text x="16" y="9" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#ffffff">Direct Manufacturer Sealed Supply</text>
      <text x="16" y="24" font-family="'Inter', sans-serif" font-size="9.5" font-weight="400" fill="#a0bfaf">Zero loose stock · Factory sealed packaging</text>
    </g>

    <g transform="translate(320, 46)">
      <circle cx="6" cy="6" r="4" fill="#58c48e"/>
      <text x="16" y="9" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#ffffff">Dual Wholesale &amp; Retail Fulfilment</text>
      <text x="16" y="24" font-family="'Inter', sans-serif" font-size="9.5" font-weight="400" fill="#a0bfaf">Supermarkets, stores &amp; households</text>
    </g>

    <g transform="translate(24, 88)">
      <circle cx="6" cy="6" r="4" fill="#58c48e"/>
      <text x="16" y="9" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#d8e8de">Hygienic Warehousing</text>
    </g>

    <g transform="translate(210, 88)">
      <circle cx="6" cy="6" r="4" fill="#58c48e"/>
      <text x="16" y="9" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#d8e8de">Prompt Regional Dispatch</text>
    </g>

    <g transform="translate(400, 88)">
      <circle cx="6" cy="6" r="4" fill="#58c48e"/>
      <text x="16" y="9" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#d8e8de">Wholesale B2B Agency Terms</text>
    </g>
  </g>
</svg>`

fs.writeFileSync(path.resolve('public/images/hero-fmcg-packaging.svg'), heroSvg, 'utf-8')
console.log('Generated authentic hero graphic: hero-fmcg-packaging.svg')

