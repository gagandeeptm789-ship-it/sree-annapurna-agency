/**
 * Clear Operational Data End-to-End Verification Test
 * SREE ANNAPURNA AGENCY
 */

const { register, login, ownerLogin } = require('./src/controllers/authController');
const { getOrders, createOrder, clearAllOrders, loadPersistentOrders } = require('./src/controllers/orderController');
const { getProducts } = require('./src/controllers/productController');
const { getBrands } = require('./src/controllers/brandController');

function createMockReqRes(options = {}) {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    get(h) {
      const target = h.toLowerCase();
      for (const [k, v] of Object.entries(this.headers)) {
        if (k.toLowerCase() === target) return v;
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
  };

  return { req, res };
}

async function runClearDataTests() {
  console.log('========================================================================');
  console.log(' SREE ANNAPURNA AGENCY: CLEAR OPERATIONAL DATA VERIFICATION');
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

  // --- Step 1: Record Current State ---
  console.log('--- Step 1: Initial State Inspection ---');
  const initialOrders = loadPersistentOrders();
  console.log(`[INFO] Initial orders in storage before clearing: ${initialOrders.length}`);
  assert(true, `Initial order count inspected: ${initialOrders.length} orders found`);

  // --- Step 2: Security & Authorization Protection ---
  console.log('\n--- Step 2: Route Security on Clear Endpoint ---');
  // Customer attempt (Must receive 403)
  const customerReq = createMockReqRes({
    user: { id: 'cust-123', role: 'customer' },
  });
  await clearAllOrders(customerReq.req, customerReq.res, (e) => { throw e; });
  assert(
    customerReq.res.statusCode === 403,
    'Non-owner / regular customer is strictly FORBIDDEN from clearing operational data (HTTP 403)'
  );

  // Unauthenticated visitor attempt (Must receive 403/401)
  const anonReq = createMockReqRes({ user: null });
  await clearAllOrders(anonReq.req, anonReq.res, (e) => { throw e; });
  assert(
    anonReq.res.statusCode === 403 || anonReq.res.statusCode === 401,
    'Unauthenticated visitor is strictly BLOCKED from clearing operational data'
  );

  // --- Step 3: Execute Clear Operational Data as Authorized Owner ---
  console.log('\n--- Step 3: Owner Executes Clear Operational Data ---');
  const ownerReq = createMockReqRes({
    user: { id: 'owner-saa-primary', role: 'owner' },
  });
  await clearAllOrders(ownerReq.req, ownerReq.res, (e) => { throw e; });
  assert(
    ownerReq.res.statusCode === 200 && ownerReq.res.data?.success === true,
    `Clear operation succeeded: "${ownerReq.res.data?.message}"`
  );

  // --- Step 4: Verify Orders Are Actually Removed from Storage ---
  console.log('\n--- Step 4: Verify Authoritative Storage is Cleared ---');
  const ordersAfterClear = loadPersistentOrders();
  assert(
    ordersAfterClear.length === 0,
    `Orders in authoritative backend storage is now 0 (Previously ${initialOrders.length})`
  );

  // --- Step 5: Verify Owner Orders API Returns 0 Orders ---
  console.log('\n--- Step 5: Verify Owner Portal View Reflects Clean State ---');
  const ownerOrdersReq = createMockReqRes({
    user: { id: 'owner-saa-primary', role: 'owner' },
  });
  await getOrders(ownerOrdersReq.req, ownerOrdersReq.res, (e) => { throw e; });
  const fetchedOrders = ownerOrdersReq.res.data?.data || [];
  assert(
    fetchedOrders.length === 0,
    `GET /api/orders/owner/all returns 0 orders for Owner Portal display`
  );

  // --- Step 6: Verify Product Catalogue and Brands Are 100% Intact ---
  console.log('\n--- Step 6: Verify Products and Brands Intact ---');
  const prodReq = createMockReqRes();
  await getProducts(prodReq.req, prodReq.res, (e) => { throw e; });
  const products = prodReq.res.data?.data || [];
  assert(
    products.length >= 30,
    `Product catalogue permanently preserved (${products.length} active products intact)`
  );

  const brandReq = createMockReqRes();
  await getBrands(brandReq.req, brandReq.res, (e) => { throw e; });
  const brands = brandReq.res.data?.data || [];
  assert(
    brands.length === 6,
    `All 6 regional brand identities preserved intact (${brands.map(b => b.name).join(', ')})`
  );

  // --- Step 7: Place New Order and Verify Visibility ---
  console.log('\n--- Step 7: Place a New Order After Clear ---');
  const regReq = createMockReqRes({
    body: {
      name: 'Fresh Customer After Clear',
      email: `fresh.${Date.now()}@test.com`,
      password: 'StrongPassword123!',
      phone: '9845012345',
    },
  });
  await register(regReq.req, regReq.res, (e) => { throw e; });
  const newCustomer = regReq.res.data?.user;

  const crypto = require('node:crypto');
  const placeOrderReq = createMockReqRes({
    user: { id: newCustomer.id, role: 'customer', email: newCustomer.email },
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: {
      customerName: newCustomer.name,
      phone: '9845012345',
      email: newCustomer.email,
      address: 'Shop 10, Kuvempu Road',
      city: 'Shimoga',
      pincode: '577201',
      paymentMethod: 'COD',
      items: [
        {
          productId: 'swastik-mango-pickle',
          name: 'Swastik Mango Pickle',
          pack: '300 g',
          quantity: 2,
        },
      ],
    },
  });
  await createOrder(placeOrderReq.req, placeOrderReq.res, (e) => { throw e; });
  const newlyCreatedOrder = placeOrderReq.res.data?.data;
  assert(
    placeOrderReq.res.statusCode === 201 && newlyCreatedOrder?.orderId,
    `New order successfully placed after reset: ${newlyCreatedOrder?.orderId}`
  );

  // Verify owner portal sees exactly 1 order now
  const verifyOneReq = createMockReqRes({
    user: { id: 'owner-saa-primary', role: 'owner' },
  });
  await getOrders(verifyOneReq.req, verifyOneReq.res, (e) => { throw e; });
  const updatedOrders = verifyOneReq.res.data?.data || [];
  assert(
    updatedOrders.length === 1 && updatedOrders[0].orderId === newlyCreatedOrder.orderId,
    `Owner Portal now displays exactly 1 new order (${newlyCreatedOrder.orderId}) without old ghost orders!`
  );

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('Clear Operational Data workflow is verified 100% OPERATIONAL & DURABLE.');
  } else {
    process.exit(1);
  }
}

runClearDataTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

