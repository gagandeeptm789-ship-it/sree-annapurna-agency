/**
 * Standalone PDF 1.4 Invoice Generator for Sree Annapurna Agency
 * Generates standards-compliant, print-ready PDF binary buffers with zero external dependencies.
 */

function escapePdfText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatCurrency(num) {
  const val = Number(num) || 0;
  return 'Rs. ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateVal) {
  const d = new Date(dateVal || Date.now());
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Builds a valid PDF 1.4 Buffer for an order invoice
 * @param {object} order - Mongoose Order object or plain object
 * @returns {Buffer}
 */
function generateInvoicePdf(order) {
  const orderId = order.orderId || order.id || 'N/A';
  const invoiceNumber = `INV-${orderId}`;
  const orderDate = formatDate(order.date || order.createdAt);
  const del = order.deliveryDetails || {};
  const customerName = del.name || order.customer || 'Valued Customer';
  const phone = del.phone || order.phone || 'N/A';
  const email = del.email || order.customerEmail || 'N/A';
  const address = del.address || 'N/A';
  const city = del.city || 'Shimoga';
  const pincode = del.pincode || '';
  const items = order.items || [];
  const total = Number(order.total) || 0;
  const rawPaymentMethod = order.paymentMethod || 'Cash on Delivery / Agency Terms';
  const utr = order.paymentDetails?.utrNumber ? ` (Ref: ${order.paymentDetails.utrNumber})` : '';
  const paymentMethod = `${rawPaymentMethod}${utr}`.substring(0, 32);
  const paymentStatus = order.payment || 'Pending';
  const orderStatus = order.status || 'Pending';

  // Construct PDF drawing commands
  let stream = '';

  // Helper drawing functions
  const setFillColor = (r, g, b) => `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
  const setStrokeColor = (r, g, b) => `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
  const drawRect = (x, y, w, h, fill = true, stroke = false) => {
    let cmd = `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
    if (fill && stroke) cmd += 'B\n';
    else if (fill) cmd += 'f\n';
    else if (stroke) cmd += 'S\n';
    return cmd;
  };
  const drawLine = (x1, y1, x2, y2, lineWidth = 1) => {
    return `${lineWidth.toFixed(2)} w\n${x1.toFixed(2)} ${y1.toFixed(2)} m\n${x2.toFixed(2)} ${y2.toFixed(2)} l\nS\n`;
  };
  const drawText = (font, size, x, y, text, r = 0.12, g = 0.15, b = 0.14) => {
    return (
      `BT\n` +
      `/${font} ${size} Tf\n` +
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n` +
      `${x.toFixed(2)} ${y.toFixed(2)} Td\n` +
      `(${escapePdfText(text)}) Tj\n` +
      `ET\n`
    );
  };

  // Top header banner (Deep Forest Green: #173F35 -> 0.090, 0.247, 0.208)
  stream += setFillColor(0.09, 0.247, 0.208);
  stream += drawRect(36, 746, 523, 62, true, false);

  // Agency branding in banner
  stream += drawText('F2', 20, 50, 782, 'SREE ANNAPURNA AGENCY', 1, 1, 1);
  stream += drawText('F1', 9.5, 50, 767, 'Authorized FMCG Wholesale & Regional Distribution', 0.95, 0.88, 0.72);
  stream += drawText('F1', 8.5, 50, 755, 'APMC Market Yard, Shivamogga, Karnataka 577201 | Phone: +91 94481 23456', 0.85, 0.9, 0.88);

  // INVOICE title in banner
  stream += drawText('F2', 22, 430, 775, 'TAX INVOICE', 1, 1, 1);
  stream += drawText('F1', 9, 430, 757, 'Official Order Receipt', 0.9, 0.9, 0.9);

  // Invoice & Order Metadata Box
  stream += setFillColor(0.97, 0.965, 0.95);
  stream += drawRect(36, 680, 523, 54, true, false);
  stream += setStrokeColor(0.88, 0.89, 0.87);
  stream += drawLine(36, 680, 559, 680, 1);

  stream += drawText('F2', 9, 50, 718, 'INVOICE NUMBER:', 0.4, 0.45, 0.42);
  stream += drawText('F2', 10, 145, 718, invoiceNumber, 0.09, 0.25, 0.21);

  stream += drawText('F2', 9, 50, 698, 'ORDER DATE:', 0.4, 0.45, 0.42);
  stream += drawText('F1', 9.5, 145, 698, orderDate, 0.12, 0.15, 0.14);

  stream += drawText('F2', 9, 330, 718, 'PAYMENT METHOD:', 0.4, 0.45, 0.42);
  stream += drawText('F1', 9.5, 435, 718, paymentMethod, 0.12, 0.15, 0.14);

  stream += drawText('F2', 9, 330, 698, 'PAYMENT STATUS:', 0.4, 0.45, 0.42);
  let payColor = [0.75, 0.4, 0.05];
  if (paymentStatus.toLowerCase() === 'paid') {
    payColor = [0.08, 0.5, 0.2];
  } else if (paymentStatus.toLowerCase().includes('fail')) {
    payColor = [0.75, 0.1, 0.1];
  }
  stream += drawText('F2', 9.5, 435, 698, paymentStatus.toUpperCase(), payColor[0], payColor[1], payColor[2]);

  // Customer Delivery Details Box
  stream += setStrokeColor(0.88, 0.89, 0.87);
  stream += drawLine(36, 665, 559, 665, 1);
  stream += drawText('F2', 10.5, 50, 650, 'DELIVERED & BILLED TO:', 0.09, 0.25, 0.21);

  stream += drawText('F2', 10, 50, 633, customerName, 0.12, 0.15, 0.14);
  const fullAddress = `${address}, ${city} - ${pincode}`;
  stream += drawText('F1', 9, 50, 619, fullAddress.substring(0, 75), 0.35, 0.38, 0.36);
  if (fullAddress.length > 75) {
    stream += drawText('F1', 9, 50, 607, fullAddress.substring(75, 150), 0.35, 0.38, 0.36);
  }

  stream += drawText('F1', 9, 330, 633, `Phone: ${phone}`, 0.35, 0.38, 0.36);
  stream += drawText('F1', 9, 330, 619, `Email: ${email}`, 0.35, 0.38, 0.36);
  stream += drawText('F1', 9, 330, 607, `Order Status: ${orderStatus}`, 0.35, 0.38, 0.36);

  // Product Line Items Table Header
  const tableTop = 585;
  stream += setFillColor(0.92, 0.94, 0.93);
  stream += drawRect(36, tableTop - 18, 523, 20, true, false);

  stream += drawText('F2', 9, 44, tableTop - 13, '#', 0.2, 0.25, 0.22);
  stream += drawText('F2', 9, 70, tableTop - 13, 'PRODUCT DESCRIPTION & PACK', 0.2, 0.25, 0.22);
  stream += drawText('F2', 9, 350, tableTop - 13, 'QTY', 0.2, 0.25, 0.22);
  stream += drawText('F2', 9, 410, tableTop - 13, 'UNIT PRICE', 0.2, 0.25, 0.22);
  stream += drawText('F2', 9, 495, tableTop - 13, 'TOTAL', 0.2, 0.25, 0.22);

  // Line Items
  let curY = tableTop - 34;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const qty = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const lineTotal = qty * unitPrice;
    const packText = item.pack ? ` (${item.pack})` : '';
    const descText = `${item.name}${packText}`;

    stream += drawText('F1', 9, 44, curY, String(i + 1), 0.4, 0.4, 0.4);
    stream += drawText('F2', 9, 70, curY, descText.substring(0, 52), 0.12, 0.15, 0.14);
    stream += drawText('F1', 9, 355, curY, String(qty), 0.12, 0.15, 0.14);
    stream += drawText('F1', 9, 410, curY, formatCurrency(unitPrice), 0.12, 0.15, 0.14);
    stream += drawText('F2', 9, 490, curY, formatCurrency(lineTotal), 0.12, 0.15, 0.14);

    stream += setStrokeColor(0.92, 0.93, 0.91);
    stream += drawLine(36, curY - 5, 559, curY - 5, 0.5);

    curY -= 20;
    if (curY < 180) break; // Keep within single page boundaries
  }

  // Totals Section
  const totalsY = Math.min(curY - 10, 360);
  stream += setStrokeColor(0.85, 0.86, 0.84);
  stream += drawLine(320, totalsY + 35, 559, totalsY + 35, 1);

  stream += drawText('F1', 9.5, 340, totalsY + 20, 'Subtotal:', 0.4, 0.4, 0.4);
  stream += drawText('F1', 9.5, 490, totalsY + 20, formatCurrency(total), 0.12, 0.15, 0.14);

  stream += drawText('F1', 9.5, 340, totalsY + 5, 'Delivery & Handling:', 0.4, 0.4, 0.4);
  stream += drawText('F2', 9.5, 490, totalsY + 5, 'FREE', 0.08, 0.5, 0.2);

  // Grand Total Highlight Box
  stream += setFillColor(0.95, 0.965, 0.95);
  stream += drawRect(320, totalsY - 26, 239, 24, true, false);
  stream += setStrokeColor(0.09, 0.25, 0.21);
  stream += drawLine(320, totalsY - 2, 559, totalsY - 2, 1.5);
  stream += drawLine(320, totalsY - 26, 559, totalsY - 26, 1.5);

  stream += drawText('F2', 11, 335, totalsY - 18, 'TOTAL PAYABLE:', 0.09, 0.25, 0.21);
  stream += drawText('F2', 12, 470, totalsY - 18, formatCurrency(total), 0.09, 0.25, 0.21);

  // Legal & Agency Declaration Footer
  const footerY = 90;
  stream += setStrokeColor(0.88, 0.89, 0.87);
  stream += drawLine(36, footerY + 30, 559, footerY + 30, 1);

  stream += drawText('F2', 8.5, 50, footerY + 16, 'DECLARATION & TERMS:', 0.35, 0.4, 0.37);
  stream += drawText('F1', 8, 50, footerY + 5, '1. This is a computer generated invoice issued by Sree Annapurna Agency, Shivamogga.', 0.45, 0.48, 0.46);
  stream += drawText('F1', 8, 50, footerY - 6, '2. All genuine branded products distributed under authorized FMCG regional representation.', 0.45, 0.48, 0.46);
  stream += drawText('F1', 8, 50, footerY - 17, '3. For billing or delivery inquiries, contact agency support at contact@sreeannapurnaagency.com', 0.45, 0.48, 0.46);

  stream += drawText('F2', 8.5, 430, footerY + 16, 'FOR SREE ANNAPURNA AGENCY', 0.09, 0.25, 0.21);
  stream += drawText('F1', 8, 445, footerY - 17, 'Authorized Distributor', 0.45, 0.48, 0.46);

  // Build standard PDF 1.4 document structure
  const catalogId = 1;
  const pagesId = 2;
  const pageId = 3;
  const contentId = 4;
  const fontRegularId = 5;
  const fontBoldId = 6;

  const contentStream = Buffer.from(stream, 'utf8');

  const objs = [
    `<< /Type /Catalog /Pages ${pagesId} 0 R >>`,
    `<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`,
    `<< /Length ${contentStream.length} >>\nstream\n${stream}endstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
  ];

  let body = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objs.length; i++) {
    offsets.push(Buffer.byteLength(body, 'utf8'));
    body += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
  }

  const startXref = Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return Buffer.from(body + xref + trailer, 'utf8');
}

module.exports = {
  generateInvoicePdf,
};

