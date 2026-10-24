# Sree Annapurna Agency

A responsive React, Vite, and TypeScript platform for the Sree Annapurna Agency catalogue and owner workspace.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The owner workspace is available at `/admin`.

For a production build:

```bash
npm run build
npm run preview
```

## Current state and data

- **Authentic FMCG Packaged Product Catalogue:** 33 packaged products across six partner brand families (Swastik Pickles & Masalas, Rala Food Specialists, Monkey 555, Monkey VVV, Aruna Masala, and Deeppam Aarti). Every product displays packaged retail packaging (sealed foil pouches, pickle jars, retail bottles, hardware packs), with zero restaurant food photography or plated meals.
- **Brand Cards & Packaging Visuals:** All six brands feature dedicated master packaging visuals highlighting their sealed retail line.
- **Operational Data:** Starts clean with empty operational queues for orders, customer directory, invoices, and transactions. Metrics update dynamically as genuine orders are placed.
- **Packaging Display:** Uses `object-fit: contain` with balanced padding and container dimensions, ensuring labels, pack weights, and brand identifiers remain fully legible.
- **Safety & Persistence:** The catalogue and brand data are preserved across sessions and data resets. Resetting operational data in the Owner Panel clears only transaction queues while retaining the catalogue.
