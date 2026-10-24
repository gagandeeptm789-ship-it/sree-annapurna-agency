import fs from 'fs'
import path from 'path'

const products = [
  { id: 'swastik-mango-pickle', name: 'Swastik Mango Pickle', brand: 'Swastik', category: 'Pickles', pack: '300 g', format: 'Glass Jar' },
  { id: 'swastik-lime-pickle', name: 'Swastik Lime Pickle', brand: 'Swastik', category: 'Pickles', pack: '300 g', format: 'Glass Jar' },
  { id: 'swastik-sambar-powder', name: 'Swastik Sambar Powder', brand: 'Swastik', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'swastik-rasam-powder', name: 'Swastik Rasam Powder', brand: 'Swastik', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'swastik-badam-powder', name: 'Swastik Badam Powder', brand: 'Swastik', category: 'Instant mixes', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'swastik-rava-idli-mix', name: 'Swastik Rava Idli Mix', brand: 'Swastik', category: 'Instant mixes', pack: '500 g', format: 'Sealed Pouch' },
  { id: 'swastik-puliyogare-powder', name: 'Swastik Puliyogare Powder', brand: 'Swastik', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'swastik-gulab-jamun-mix', name: 'Swastik Gulab Jamun Mix', brand: 'Swastik', category: 'Instant mixes', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'swastik-roasted-vermicelli', name: 'Swastik Roasted Vermicelli', brand: 'Swastik', category: 'Pantry staples', pack: '400 g', format: 'Sealed Retail Pack' },
  { id: 'rala-chilli-powder', name: 'Rala Chilli Powder', brand: 'Rala', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'rala-turmeric-powder', name: 'Rala Turmeric Powder', brand: 'Rala', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'rala-coriander-powder', name: 'Rala Coriander Powder', brand: 'Rala', category: 'Spice powders', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'rala-chicken-masala', name: 'Rala Chicken Masala', brand: 'Rala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'rala-meat-masala', name: 'Rala Meat Masala', brand: 'Rala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'rala-garam-masala', name: 'Rala Garam Masala', brand: 'Rala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'rala-kasuri-methi', name: 'Rala Kasuri Methi', brand: 'Rala', category: 'Herbs', pack: '50 g', format: 'Sealed Pouch' },
  { id: 'monkey-555-grass-broom', name: 'Monkey 555 Natural Grass Broom', brand: 'Monkey 555', category: 'Cleaning tools', pack: '1 unit', format: 'Broom Packaging' },
  { id: 'monkey-555-cotton-mop', name: 'Monkey 555 Cotton Floor Mop', brand: 'Monkey 555', category: 'Cleaning tools', pack: '1 unit', format: 'Floor Mop Packaging' },
  { id: 'monkey-555-phenyl', name: 'Monkey 555 Floor Phenyl Disinfectant', brand: 'Monkey 555', category: 'Cleaning liquids', pack: '1 L', format: 'PET Bottle' },
  { id: 'monkey-555-ozone-cleaner', name: 'Monkey 555 Ozone Multi-Surface Cleaner', brand: 'Monkey 555', category: 'Cleaning liquids', pack: '500 ml', format: 'Trigger Spray Bottle' },
  { id: 'monkey-555-bleaching-powder', name: 'Monkey 555 Bleaching Powder', brand: 'Monkey 555', category: 'Cleaning powders', pack: '1 kg', format: 'Sealed Sanitation Pack' },
  { id: 'monkey-vvv-detergent-powder', name: 'Monkey VVV Active Detergent Powder', brand: 'Monkey VVV', category: 'Laundry care', pack: '1 kg', format: 'Detergent Poly Pack' },
  { id: 'monkey-vvv-dishwash-bar', name: 'Monkey VVV Dishwash Bar', brand: 'Monkey VVV', category: 'Dish care', pack: '250 g', format: 'Sealed Dishwash Bar' },
  { id: 'monkey-vvv-dishwash-gel', name: 'Monkey VVV Lemon Dishwash Gel', brand: 'Monkey VVV', category: 'Dish care', pack: '500 ml', format: 'Squeeze Bottle' },
  { id: 'aruna-roasted-vermicelli', name: 'Aruna Roasted Vermicelli', brand: 'Aruna Masala', category: 'Pantry staples', pack: '400 g', format: 'Sealed Retail Pack' },
  { id: 'aruna-gulab-jamun-mix', name: 'Aruna Gulab Jamun Mix', brand: 'Aruna Masala', category: 'Instant mixes', pack: '200 g', format: 'Sealed Pouch' },
  { id: 'aruna-chicken-masala', name: 'Aruna Chicken Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'aruna-mutton-masala', name: 'Aruna Mutton Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'aruna-fish-curry-masala', name: 'Aruna Fish Curry Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'aruna-egg-masala', name: 'Aruna Egg Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'aruna-garam-masala', name: 'Aruna Garam Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'aruna-biryani-masala', name: 'Aruna Biryani Masala', brand: 'Aruna Masala', category: 'Blended masalas', pack: '100 g', format: 'Sealed Pouch' },
  { id: 'deeppam-aarti-oil-450ml', name: 'Deeppam Aarti Pooja Oil 450 ml', brand: 'Deeppam Aarti', category: 'Pooja essentials', pack: '450 ml', format: 'PET Bottle' },
]

function getSilhouette(format) {
  if (format === 'Glass Jar') {
    return `
      <!-- Jar Cap -->
      <rect x="180" y="95" width="140" height="30" rx="4" fill="#d9d5cb" stroke="#9e988c" stroke-width="2"/>
      <line x1="190" y1="95" x2="190" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="210" y1="95" x2="210" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="230" y1="95" x2="230" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="250" y1="95" x2="250" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="270" y1="95" x2="270" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="290" y1="95" x2="290" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <line x1="310" y1="95" x2="310" y2="125" stroke="#b8b2a5" stroke-width="2"/>
      <!-- Jar Body -->
      <path d="M 170 145 C 170 132, 185 125, 200 125 L 300 125 C 315 125, 330 132, 330 145 L 335 340 C 335 355, 322 365, 305 365 L 195 365 C 178 365, 165 355, 165 340 Z" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
      <!-- Label outline placeholder -->
      <rect x="180" y="180" width="140" height="135" rx="6" fill="#fcfbf9" stroke="#c4beaf" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="250" y="240" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#756f63" text-anchor="middle" letter-spacing="0.5">FOOD-GRADE GLASS JAR</text>
      <text x="250" y="260" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#9e988c" text-anchor="middle">Official Label Area</text>
    `
  }

  if (format === 'PET Bottle' || format === 'Squeeze Bottle' || format === 'Trigger Spray Bottle') {
    return `
      <!-- Bottle Cap -->
      <rect x="225" y="85" width="50" height="25" rx="3" fill="#d9d5cb" stroke="#9e988c" stroke-width="2"/>
      <!-- Bottle Neck -->
      <rect x="235" y="110" width="30" height="35" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
      <!-- Bottle Body -->
      <path d="M 235 145 C 210 160, 180 185, 180 220 L 180 345 C 180 358, 192 365, 208 365 L 292 365 C 308 365, 320 358, 320 345 L 320 220 C 320 185, 290 160, 265 145 Z" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
      <!-- Label outline placeholder -->
      <rect x="195" y="225" width="110" height="105" rx="4" fill="#fcfbf9" stroke="#c4beaf" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="250" y="270" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#756f63" text-anchor="middle" letter-spacing="0.5">SEALED BOTTLE</text>
      <text x="250" y="288" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#9e988c" text-anchor="middle">Official Label Area</text>
    `
  }

  if (format === 'Broom Packaging' || format === 'Floor Mop Packaging') {
    return `
      <!-- Tool Handle -->
      <rect x="244" y="80" width="12" height="170" rx="3" fill="#d9d5cb" stroke="#9e988c" stroke-width="2"/>
      <!-- Handle Grip -->
      <rect x="241" y="85" width="18" height="35" rx="4" fill="#beb8ab" stroke="#9e988c" stroke-width="1.5"/>
      <!-- Head / Binding -->
      <path d="M 220 250 L 280 250 L 310 350 L 190 350 Z" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
      <!-- Binding Bands -->
      <line x1="210" y1="280" x2="290" y2="280" stroke="#9e988c" stroke-width="2"/>
      <line x1="200" y1="310" x2="300" y2="310" stroke="#9e988c" stroke-width="2"/>
      <!-- Sleeve Tag -->
      <rect x="210" y="270" width="80" height="50" rx="4" fill="#fcfbf9" stroke="#c4beaf" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="250" y="295" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#756f63" text-anchor="middle">CLEANING TOOL</text>
      <text x="250" y="310" font-family="'Inter', sans-serif" font-size="8" font-weight="500" fill="#9e988c" text-anchor="middle">Product Sleeve</text>
    `
  }

  if (format === 'Sealed Dishwash Bar') {
    return `
      <!-- Wrapped Bar -->
      <rect x="160" y="170" width="180" height="110" rx="8" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
      <!-- Wrapper Folds -->
      <path d="M 160 170 L 190 200 L 190 250 L 160 280" fill="none" stroke="#beb8ab" stroke-width="1.5"/>
      <path d="M 340 170 L 310 200 L 310 250 L 340 280" fill="none" stroke="#beb8ab" stroke-width="1.5"/>
      <!-- Center Label Area -->
      <rect x="195" y="185" width="110" height="80" rx="4" fill="#fcfbf9" stroke="#c4beaf" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="250" y="225" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#756f63" text-anchor="middle">RETAIL BAR PACK</text>
      <text x="250" y="243" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#9e988c" text-anchor="middle">Official Wrapper</text>
    `
  }

  // Default: Sealed retail pouch / poly pack
  return `
    <!-- Top Seal Crimping -->
    <path d="M 165 95 L 335 95 L 335 115 L 165 115 Z" fill="#d9d5cb" stroke="#9e988c" stroke-width="2"/>
    <line x1="175" y1="95" x2="175" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="195" y1="95" x2="195" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="215" y1="95" x2="215" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="235" y1="95" x2="235" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="255" y1="95" x2="255" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="275" y1="95" x2="275" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="295" y1="95" x2="295" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>
    <line x1="315" y1="95" x2="315" y2="115" stroke="#b8b2a5" stroke-width="1.5"/>

    <!-- Pouch Body (Stand-up Gusset) -->
    <path d="M 165 115 L 335 115 L 345 345 C 345 358, 335 365, 320 365 L 180 365 C 165 365, 155 358, 155 345 Z" fill="#eae6dc" stroke="#9e988c" stroke-width="2"/>
    <!-- Bottom Gusset Fold -->
    <path d="M 165 345 C 200 355, 300 355, 335 345" fill="none" stroke="#beb8ab" stroke-width="1.5"/>

    <!-- Label outline placeholder -->
    <rect x="180" y="145" width="140" height="165" rx="6" fill="#fcfbf9" stroke="#c4beaf" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="250" y="215" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#756f63" text-anchor="middle" letter-spacing="0.5">SEALED POUCH</text>
    <text x="250" y="235" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#9e988c" text-anchor="middle">Official Packaging Area</text>
  `
}

function generateProductSvg(product) {
  const silhouette = getSilhouette(product.format)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- Neutral Studio Background -->
  <rect width="500" height="500" fill="#faf8f4" rx="8"/>
  <rect x="12" y="12" width="476" height="476" fill="none" stroke="#eee8dd" stroke-width="1.5" rx="6"/>

  <!-- Top Header Metadata: Honest Specification Banner -->
  <g transform="translate(24, 32)">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#8c8577" letter-spacing="1">PACKAGING SPECIFICATION</text>
    <text x="452" y="0" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#696256" text-anchor="end">${product.category.toUpperCase()}</text>
  </g>

  <!-- Technical Pack Silhouette -->
  <g id="pack-silhouette">
    ${silhouette}
  </g>

  <!-- Pack Size & Specification Plate -->
  <g transform="translate(150, 395)">
    <rect x="0" y="0" width="200" height="32" rx="4" fill="#ffffff" stroke="#d5cebe" stroke-width="1"/>
    <text x="100" y="15" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#143e2b" text-anchor="middle">STANDARD PACK · ${product.pack}</text>
    <text x="100" y="26" font-family="'Inter', sans-serif" font-size="7.5" font-weight="500" fill="#877f72" text-anchor="middle">FORMAT: ${product.format.toUpperCase()}</text>
  </g>

  <!-- Bottom Honest Status Badge -->
  <g transform="translate(24, 468)">
    <rect x="0" y="-14" width="452" height="20" rx="3" fill="#f2ede4"/>
    <text x="226" y="0" font-family="'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#6b6456" text-anchor="middle" letter-spacing="0.3">
      AUTHENTIC BRAND PHOTOGRAPHY AWAITING UPLOAD · SREE ANNAPURNA AGENCY
    </text>
  </g>
</svg>`
}

const outDir = path.resolve('public/images/products')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

for (const p of products) {
  const filePath = path.join(outDir, `${p.id}.svg`)
  fs.writeFileSync(filePath, generateProductSvg(p), 'utf-8')
  console.log(`Generated neutral placeholder: ${p.id}.svg`)
}

console.log('All 33 neutral product placeholders generated successfully.')

