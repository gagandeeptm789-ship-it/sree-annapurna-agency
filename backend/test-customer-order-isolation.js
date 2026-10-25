/**
 * Test Customer Order Separation and Security Verification Suite
 * Verifies strict data isolation between customer accounts for SREE ANNAPURNA AGENCY
 */

const { register, login, ownerLogin } = require('./src/controllers/authController');
const { getOrders, getOrderById, createOrder, memoryOrders } = require('./src/controllers/orderController');
const { getInvoicePdf } = require('./src/controllers/invoiceController');
const { createPaymentOrder, submitUpiPayment, verifyPayment } = require('./src/controllers/paymentController');

// Helper to simulate Express req/res
function createMockReqRes(options = {}) {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
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

async function runTests() {
  console.log('================================================================');
  console.log(' SREE ANNAPURNA AGENCY: CUSTOMER ORDER SEPARATION TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${message}`);
      process.exitCode = 1;
    }
  }

  // --- Step 1: Register Customer A ---
  console.log('--- Step 1: Account Creation ---');
  const userAReqRes = createMockReqRes({
    body: {
      name: 'Ramesh Kumar (Customer A)',
      email: `ramesh.a.${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
      address: 'Shop #12, Market Road',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(userAReqRes.req, userAReqRes.res, (err) => { throw err; });
  const userA = userAReqRes.res.data.user;
  const tokenA = userAReqRes.res.data.token;
  assert(userA && userA.id && tokenA, `Customer A registered with unique ID: ${userA?.id}`);

  // --- Step 2: Register Customer B ---
  const userBReqRes = createMockReqRes({
    body: {
      name: 'Suresh Patil (Customer B)',
      email: `suresh.b.${Date.now()}@example.com`,
      password: 'password123',
      phone: '9123456780',
      address: 'Shop #45, Gandhi Bazaar',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(userBReqRes.req, userBReqRes.res, (err) => { throw err; });
  const userB = userBReqRes.res.data.user;
  const tokenB = userBReqRes.res.data.token;
  assert(userB && userB.id && tokenB, `Customer B registered with unique ID: ${userB?.id}`);
  assert(userA.id !== userB.id, `Customer A ID (${userA.id}) != Customer B ID (${userB.id})`);

  // --- Step 3: Customer A places Order for Product A ---
  console.log('\n--- Step 2: Order Placement ---');
  const orderAReqRes = createMockReqRes({
    user: { id: userA.id, role: 'customer', email: userA.email, name: userA.name },
    body: {
      customerName: userA.name,
      phone: '9876543210',
      email: userA.email,
      address: 'Shop #12, Market Road',
      city: 'Shimoga',
      pincode: '577201',
      items: [
        {
          productId: 'swastik-mango-pickle',
          name: 'Swastik Mango Pickle',
          quantity: 2,
          unitPrice: 135,
          pack: '300 g',
        },
      ],
      paymentMethod: 'COD',
    },
  });
  await createOrder(orderAReqRes.req, orderAReqRes.res, (err) => { throw err; });
  if (orderAReqRes.res.statusCode !== 201) {
    console.error('Order A placement failed:', orderAReqRes.res.statusCode, orderAReqRes.res.data);
  }
  const orderA = orderAReqRes.res.data.data;
  assert(orderA && orderA.orderId, `Order A placed successfully: ${orderA?.orderId} for ${orderA?.items[0]?.name}`);
  assert(orderA.user === userA.id, `Order A strictly associated with Customer A User ID (${orderA.user})`);

  // --- Step 4: Customer B places Order for Product B ---
  const orderBReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email, name: userB.name },
    body: {
      customerName: userB.name,
      phone: '9123456780',
      email: userB.email,
      address: 'Shop #45, Gandhi Bazaar',
      city: 'Shimoga',
      pincode: '577201',
      items: [
        {
          productId: 'swastik-lime-pickle',
          name: 'Swastik Lime Pickle',
          quantity: 3,
          unitPrice: 125,
          pack: '300 g',
        },
      ],
      paymentMethod: 'UPI',
      utrNumber: '123456789012',
    },
  });
  await createOrder(orderBReqRes.req, orderBReqRes.res, (err) => { throw err; });
  if (orderBReqRes.res.statusCode !== 201) {
    console.error('Order B placement failed:', orderBReqRes.res.statusCode, orderBReqRes.res.data);
  }
  const orderB = orderBReqRes.res.data.data;
  assert(orderB && orderB.orderId, `Order B placed successfully: ${orderB?.orderId} for ${orderB?.items[0]?.name}`);
  assert(orderB.user === userB.id, `Order B strictly associated with Customer B User ID (${orderB.user})`);

  // --- Step 5: Query Orders as Customer A ---
  console.log('\n--- Step 3: Customer Isolation Verification ---');
  const getOrdersAReqRes = createMockReqRes({
    user: { id: userA.id, role: 'customer', email: userA.email },
  });
  await getOrders(getOrdersAReqRes.req, getOrdersAReqRes.res, (err) => { throw err; });
  const ordersForCustomerA = getOrdersAReqRes.res.data.data || [];
  const orderAInAList = ordersForCustomerA.some((o) => o.orderId === orderA.orderId);
  const orderBInAList = ordersForCustomerA.some((o) => o.orderId === orderB.orderId);
  assert(orderAInAList, `Customer A CAN see their own order (${orderA.orderId})`);
  assert(!orderBInAList, `Customer A CANNOT see Customer B's order (${orderB.orderId})`);

  // --- Step 6: Query Orders as Customer B ---
  const getOrdersBReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
  });
  await getOrders(getOrdersBReqRes.req, getOrdersBReqRes.res, (err) => { throw err; });
  const ordersForCustomerB = getOrdersBReqRes.res.data.data || [];
  const orderBInBList = ordersForCustomerB.some((o) => o.orderId === orderB.orderId);
  const orderAInBList = ordersForCustomerB.some((o) => o.orderId === orderA.orderId);
  assert(orderBInBList, `Customer B CAN see their own order (${orderB.orderId})`);
  assert(!orderAInBList, `Customer B CANNOT see Customer A's order (${orderA.orderId})`);

  // --- Step 7: Attempt cross-access to Order Details via URL/API ---
  console.log('\n--- Step 4: Cross-Access & Authorization Denial ---');
  const crossAccessReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
    params: { id: orderA.orderId },
  });
  await getOrderById(crossAccessReqRes.req, crossAccessReqRes.res, (err) => { throw err; });
  assert(
    crossAccessReqRes.res.statusCode === 403,
    `Customer B accessing Customer A's order (${orderA.orderId}) receives HTTP 403 Forbidden`
  );

  // Reverse cross-access: Customer A requesting Customer B's order
  const crossAccessReverseReqRes = createMockReqRes({
    user: { id: userA.id, role: 'customer', email: userA.email },
    params: { id: orderB.orderId },
  });
  await getOrderById(crossAccessReverseReqRes.req, crossAccessReverseReqRes.res, (err) => { throw err; });
  assert(
    crossAccessReverseReqRes.res.statusCode === 403,
    `Customer A accessing Customer B's order (${orderB.orderId}) receives HTTP 403 Forbidden`
  );

  // --- Step 8: Cross-access to Invoice PDF ---
  console.log('\n--- Step 5: Invoice Security Verification ---');
  const crossInvoiceReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
    params: { id: orderA.orderId },
  });
  await getInvoicePdf(crossInvoiceReqRes.req, crossInvoiceReqRes.res, (err) => { throw err; });
  assert(
    crossInvoiceReqRes.res.statusCode === 403,
    `Customer B attempting to download Customer A's invoice receives HTTP 403 Forbidden`
  );

  // Unauthenticated invoice download without token
  const unauthInvoiceReqRes = createMockReqRes({
    params: { id: orderA.orderId },
  });
  await getInvoicePdf(unauthInvoiceReqRes.req, unauthInvoiceReqRes.res, (err) => { throw err; });
  assert(
    unauthInvoiceReqRes.res.statusCode === 401 || unauthInvoiceReqRes.res.statusCode === 403,
    `Unauthenticated user accessing invoice receives HTTP ${unauthInvoiceReqRes.res.statusCode} (401/403)`
  );

  // Email / Phone query spoofing attempt (e.g. ?email=ramesh@example.com)
  const spoofingInvoiceReqRes = createMockReqRes({
    params: { id: orderA.orderId },
    query: { email: userA.email, phone: '9876543210' },
  });
  await getInvoicePdf(spoofingInvoiceReqRes.req, spoofingInvoiceReqRes.res, (err) => { throw err; });
  assert(
    spoofingInvoiceReqRes.res.statusCode === 401 || spoofingInvoiceReqRes.res.statusCode === 403,
    `Spoofing query params ?email=${userA.email} fails with HTTP ${spoofingInvoiceReqRes.res.statusCode} (401/403)`
  );

  // Authorized Customer A downloading their own invoice
  const ownInvoiceReqRes = createMockReqRes({
    user: { id: userA.id, role: 'customer', email: userA.email },
    params: { id: orderA.orderId },
  });
  await getInvoicePdf(ownInvoiceReqRes.req, ownInvoiceReqRes.res, (err) => { throw err; });
  assert(
    ownInvoiceReqRes.res.statusCode === 200 && ownInvoiceReqRes.res.data && Buffer.isBuffer(ownInvoiceReqRes.res.data),
    `Customer A successfully downloads their own valid PDF invoice (${ownInvoiceReqRes.res.data?.length} bytes)`
  );

  // --- Step 6: Payment Security & Cross-Access Verification ---
  console.log('\n--- Step 6: Payment Security Verification ---');
  // Customer B attempting to initiate payment for Customer A's order
  const crossPaymentCreateReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
    body: { orderId: orderA.orderId },
  });
  await createPaymentOrder(crossPaymentCreateReqRes.req, crossPaymentCreateReqRes.res, (err) => { throw err; });
  assert(
    crossPaymentCreateReqRes.res.statusCode === 403,
    `Customer B initiating payment for Customer A's order (${orderA.orderId}) receives HTTP 403 Forbidden`
  );

  // Customer B attempting to submit UPI UTR for Customer A's order
  const crossPaymentUtrReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
    body: { orderId: orderA.orderId, utrNumber: '999888777666' },
  });
  await submitUpiPayment(crossPaymentUtrReqRes.req, crossPaymentUtrReqRes.res, (err) => { throw err; });
  assert(
    crossPaymentUtrReqRes.res.statusCode === 403,
    `Customer B submitting UPI reference for Customer A's order (${orderA.orderId}) receives HTTP 403 Forbidden`
  );

  // Customer B attempting to verify payment for Customer A's order
  const crossPaymentVerifyReqRes = createMockReqRes({
    user: { id: userB.id, role: 'customer', email: userB.email },
    body: { orderId: orderA.orderId, sandboxTransactionId: 'test_tx_fake', testSignature: 'fake_sig' },
  });
  await verifyPayment(crossPaymentVerifyReqRes.req, crossPaymentVerifyReqRes.res, (err) => { throw err; });
  assert(
    crossPaymentVerifyReqRes.res.statusCode === 403,
    `Customer B verifying payment for Customer A's order (${orderA.orderId}) receives HTTP 403 Forbidden`
  );

  // --- Step 7: Owner Access Verification ---
  console.log('\n--- Step 7: Owner Access Verification ---');
  const ownerOrdersReqRes = createMockReqRes({
    user: { id: 'owner-primary', role: 'owner', email: 'owner@sreeannapurnaagency.com' },
  });
  await getOrders(ownerOrdersReqRes.req, ownerOrdersReqRes.res, (err) => { throw err; });
  const allOwnerOrders = ownerOrdersReqRes.res.data.data || [];
  const hasOrderA = allOwnerOrders.some((o) => o.orderId === orderA.orderId);
  const hasOrderB = allOwnerOrders.some((o) => o.orderId === orderB.orderId);
  assert(
    hasOrderA && hasOrderB,
    `Owner is authorized to view all orders (Both ${orderA.orderId} and ${orderB.orderId} present in owner view)`
  );

  console.log('\n================================================================');
  console.log(` TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
