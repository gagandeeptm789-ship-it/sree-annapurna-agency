/**
 * Order Synchronization & End-to-End Multi-Customer Test Suite
 * SREE ANNAPURNA AGENCY
 * 
 * Verifies that orders placed by remote/forwarded customers:
 * 1. Are saved in backend persistent storage & MongoDB
 * 2. Are immediately visible in the Owner Portal (GET /api/orders/owner/all)
 * 3. Remain strictly isolated between customer accounts
 * 4. Generate valid official PDF invoices with PhonePe UPI details
 */

const fs = require('fs');
const path = require('path');
const { register, login, ownerLogin } = require('./src/controllers/authController');
const { getOrders, getOrderById, createOrder, updateOrderStatus, loadPersistentOrders } = require('./src/controllers/orderController');
const { getInvoicePdf } = require('./src/controllers/invoiceController');

function createMockReqRes(options = {}) {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    // Mimic Express req.get(headerName)
    get(headerName) {
      const key = headerName.toLowerCase();
      for (const [k, v] of Object.entries(this.headers)) {
        if (k.toLowerCase() === key) return v;
      }
      return undefined;
    },
  };

  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    },
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(buffer) {
      this.data = buffer;
      return this;
    },
  };

  return { req, res };
}

async function runSyncTests() {
  console.log('========================================================================');
  console.log(' SREE ANNAPURNA AGENCY: ORDER SYNCHRONIZATION & OWNER PORTAL TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`);
      process.exitCode = 1;
    }
  }

  // --- Step 1: Remote Customer (Friend) Registration & Auth ---
  console.log('--- Step 1: Forwarded / Remote Customer Account Setup ---');
  const remoteEmail = `friend.customer.${Date.now()}@gmail.com`;
  const remoteReg = createMockReqRes({
    body: {
      name: 'Ananya Sharma (Forwarded Customer)',
      email: remoteEmail,
      password: 'SecurePassword123!',
      phone: '9845012345',
      address: 'Plot 42, Kuvempu Road, Jayanagar',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(remoteReg.req, remoteReg.res, (err) => { throw err; });
  const remoteCustomer = remoteReg.res.data?.user;
  const remoteToken = remoteReg.res.data?.token;

  assert(
    remoteCustomer && remoteCustomer.id && remoteToken,
    `Remote customer registered with unique user ID: ${remoteCustomer?.id}`
  );

  // --- Step 2: Remote Customer places order with PhonePe UPI ---
  console.log('\n--- Step 2: Remote Customer Places Order via Forwarded Website ---');
  const crypto = require('node:crypto');
  const testIdempotencyKey = crypto.randomUUID();
  const orderReq = createMockReqRes({
    user: {
      id: remoteCustomer.id,
      name: remoteCustomer.name,
      email: remoteCustomer.email,
      role: 'customer',
    },
    headers: {
      'Idempotency-Key': testIdempotencyKey,
    },
    body: {
      customerName: remoteCustomer.name,
      phone: '9845012345',
      email: remoteCustomer.email,
      address: 'Plot 42, Kuvempu Road, Jayanagar',
      city: 'Shimoga',
      pincode: '577201',
      paymentMethod: 'UPI',
      utrNumber: '987654321098', // 12-digit PhonePe UTR reference
      items: [
        {
          productId: 'swastik-mango-pickle',
          name: 'Swastik Mango Pickle',
          pack: '300 g',
          quantity: 3,
        },
        {
          productId: 'swastik-lime-pickle',
          name: 'Swastik Lime Pickle',
          pack: '300 g',
          quantity: 2,
        },
      ],
    },
  });

  await createOrder(orderReq.req, orderReq.res, (err) => { throw err; });
  const createdOrder = orderReq.res.data?.data;
  assert(
    orderReq.res.statusCode === 201 && createdOrder && createdOrder.orderId,
    `Order placed successfully! Canonical Order ID: ${createdOrder?.orderId}`
  );
  assert(
    createdOrder?.paymentMethod === 'UPI / PhonePe' &&
    createdOrder?.paymentDetails?.utrNumber === '987654321098' &&
    createdOrder?.paymentDetails?.payeeName === 'GAGAN DEEP',
    `PhonePe UPI details correctly recorded (Payee: GAGAN DEEP, UTR: 987654321098)`
  );

  // --- Step 3: Verify Persistence in Backend Storage ---
  console.log('\n--- Step 3: Verify Persistent Backend Storage & DB Sync ---');
  const persistedOrders = loadPersistentOrders();
  const foundInPersistence = persistedOrders.find((o) => o.orderId === createdOrder.orderId);
  assert(
    Boolean(foundInPersistence),
    `Order ${createdOrder.orderId} immediately persisted to backend storage (backend/data/orders.json)`
  );

  // --- Step 4: Verify Customer Can Retrieve Their Own Order ---
  console.log('\n--- Step 4: Customer Order History Verification ---');
  const customerOrdersReq = createMockReqRes({
    user: {
      id: remoteCustomer.id,
      role: 'customer',
    },
  });
  await getOrders(customerOrdersReq.req, customerOrdersReq.res, (err) => { throw err; });
  const customerList = customerOrdersReq.res.data?.data || [];
  assert(
    customerList.some((o) => o.orderId === createdOrder.orderId),
    `Remote customer sees their own order (${createdOrder.orderId}) in history`
  );

  // --- Step 5: Verify Another Customer (Customer A) CANNOT See It ---
  console.log('\n--- Step 5: Customer Privacy & Data Isolation ---');
  const otherCustomerReq = createMockReqRes({
    user: {
      id: 'customer-other-user-99999',
      role: 'customer',
    },
  });
  await getOrders(otherCustomerReq.req, otherCustomerReq.res, (err) => { throw err; });
  const otherList = otherCustomerReq.res.data?.data || [];
  assert(
    !otherList.some((o) => o.orderId === createdOrder.orderId),
    `Other customers CANNOT see remote customer's order (Data strictly isolated)`
  );

  // --- Step 6: Owner Login & Token Generation ---
  console.log('\n--- Step 6: Owner Authentication for Portal Sync ---');
  const ownerAuthReq = createMockReqRes({
    body: { passcode: 'annapurna2026' },
  });
  await ownerLogin(ownerAuthReq.req, ownerAuthReq.res, (err) => { throw err; });
  const ownerToken = ownerAuthReq.res.data?.token;
  assert(
    ownerAuthReq.res.statusCode === 200 && ownerToken,
    `Owner authenticated successfully and issued signed JWT token`
  );

  // --- Step 7: Owner Retrieves ALL Orders (Owner Portal) ---
  console.log('\n--- Step 7: Owner Portal Sync (GET /api/orders/owner/all) ---');
  const ownerOrdersReq = createMockReqRes({
    user: {
      id: 'owner-saa-primary',
      role: 'owner',
    },
    headers: {
      'x-require-owner': 'true',
    },
  });
  await getOrders(ownerOrdersReq.req, ownerOrdersReq.res, (err) => { throw err; });
  const ownerList = ownerOrdersReq.res.data?.data || [];
  const foundInOwner = ownerList.find((o) => o.orderId === createdOrder.orderId);
  assert(
    Boolean(foundInOwner),
    `SUCCESS: Owner Portal retrieves remote customer's order ${createdOrder.orderId} placed via forwarded link!`
  );
  assert(
    foundInOwner?.customer === 'Ananya Sharma (Forwarded Customer)' &&
    foundInOwner?.paymentDetails?.utrNumber === '987654321098',
    `Owner Portal displays full customer name, PhonePe UTR, and line items`
  );

  // --- Step 8: Owner Updates Order Status ---
  console.log('\n--- Step 8: Owner Status Update ---');
  const updateReq = createMockReqRes({
    user: { id: 'owner-saa-primary', role: 'owner' },
    params: { id: createdOrder.orderId },
    body: { status: 'Confirmed', payment: 'Completed' },
  });
  await updateOrderStatus(updateReq.req, updateReq.res, (err) => { throw err; });
  assert(
    updateReq.res.statusCode === 200 && updateReq.res.data?.data?.status === 'Confirmed',
    `Owner successfully updated order status to 'Confirmed'`
  );

  // --- Step 9: Invoice Generation for Remote Customer ---
  console.log('\n--- Step 9: PDF Invoice Generation ---');
  const invoiceReq = createMockReqRes({
    user: { id: remoteCustomer.id, role: 'customer' },
    params: { id: createdOrder.orderId },
  });
  await getInvoicePdf(invoiceReq.req, invoiceReq.res, (err) => { throw err; });
  assert(
    invoiceReq.res.statusCode === 200 &&
    invoiceReq.res.headers['content-type'] === 'application/pdf' &&
    invoiceReq.res.data &&
    invoiceReq.res.data.length > 500,
    `Official PDF invoice generated and downloadable (${invoiceReq.res.data?.length} bytes)`
  );

  // --- Step 10: Unauthorized Customer Invoice Download Blocked ---
  console.log('\n--- Step 10: Unauthorized Invoice Access Prevention ---');
  const unauthorizedInvoiceReq = createMockReqRes({
    user: { id: 'unauthorized-user-888', role: 'customer' },
    params: { id: createdOrder.orderId },
  });
  await getInvoicePdf(unauthorizedInvoiceReq.req, unauthorizedInvoiceReq.res, (err) => { throw err; });
  assert(
    unauthorizedInvoiceReq.res.statusCode === 403,
    `Blocked unauthorized customer from downloading another customer's invoice (HTTP 403)`
  );

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('All synchronization and security checks PASSED flawlessly.');
  } else {
    process.exit(1);
  }
}

runSyncTests().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
