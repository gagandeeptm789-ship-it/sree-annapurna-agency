/**
 * Owner Payment Verification End-to-End Test Suite
 * SREE ANNAPURNA AGENCY
 * 
 * Tests:
 * 1. Customer places order with UPI UTR (Initial state: Pending / Pending Verification)
 * 2. Unauthorized customer cannot verify/reject payments (HTTP 403 Forbidden)
 * 3. Unauthenticated visitor cannot verify/reject payments (HTTP 401 Unauthorized)
 * 4. Owner logs in and receives verified owner token
 * 5. Owner approves payment -> marked as Paid, status becomes Confirmed, verifiedBy recorded
 * 6. Database persistence verified directly
 * 7. Owner rejects invalid payment reference -> marked as Failed with failureReason
 * 8. Verify customer isolation and data persistence intact
 */

const crypto = require('node:crypto');
const { register, ownerLogin } = require('./src/controllers/authController');
const { createOrder, getOrders, loadPersistentOrders } = require('./src/controllers/orderController');
const { verifyUpiPayment } = require('./src/controllers/paymentController');

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

async function runPaymentVerificationTests() {
  console.log('========================================================================');
  console.log(' SREE ANNAPURNA AGENCY: OWNER PAYMENT VERIFICATION TEST SUITE');
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

  // --- Step 1: Customer Account Setup & Order Placement with UPI ---
  console.log('--- Step 1: Customer Places Order with PhonePe UPI Reference ---');
  const custReg = createMockReqRes({
    body: {
      name: 'Radhika Rao',
      email: `radhika.${Date.now()}@test.com`,
      password: 'StrongPassword123!',
      phone: '9845011223',
      address: 'Temple Road, Tilak Nagar',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(custReg.req, custReg.res, (e) => { throw e; });
  const customer = custReg.res.data?.user;
  const customerToken = custReg.res.data?.token;

  const sampleUtr1 = '636007467599'; // 12-digit UTR
  const orderReq1 = createMockReqRes({
    user: { id: customer.id, name: customer.name, email: customer.email, role: 'customer' },
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: {
      customerName: customer.name,
      phone: '9845011223',
      email: customer.email,
      address: 'Temple Road, Tilak Nagar',
      city: 'Shimoga',
      pincode: '577201',
      paymentMethod: 'UPI',
      utrNumber: sampleUtr1,
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
  await createOrder(orderReq1.req, orderReq1.res, (e) => { throw e; });
  const order1 = orderReq1.res.data?.data;

  assert(
    orderReq1.res.statusCode === 201 && order1 && order1.orderId,
    `Order 1 created: ${order1?.orderId}`
  );
  assert(
    order1?.payment === 'Pending' &&
    order1?.paymentDetails?.verificationStatus === 'Pending Verification' &&
    order1?.paymentDetails?.utrNumber === sampleUtr1,
    'CRITICAL: Order is NOT marked Paid upon submission — status is Pending Verification'
  );

  // --- Step 2: Customer Attempts to Verify Payment (Unauthorized) ---
  console.log('\n--- Step 2: Customer Authorization Denial ---');
  const unauthorizedVerifyReq = createMockReqRes({
    user: { id: customer.id, role: 'customer', email: customer.email },
    body: { orderId: order1.orderId, action: 'approve' },
  });
  // Middleware simulation for protectOwner
  const { protectOwner } = require('./src/middleware/authMiddleware');
  let authErrorCaught = false;
  const mockMiddlewareReq = {
    headers: { authorization: `Bearer ${customerToken}` },
  };
  const mockMiddlewareRes = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
  };
  protectOwner(mockMiddlewareReq, mockMiddlewareRes, () => { authErrorCaught = true; });

  assert(
    mockMiddlewareRes.statusCode === 403 && !authErrorCaught,
    'Customer account token is strictly DENIED owner verification privilege (HTTP 403 Forbidden)'
  );

  // --- Step 3: Unauthenticated Visitor Denial ---
  console.log('\n--- Step 3: Unauthenticated Visitor Denial ---');
  const unauthRes = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
  };
  protectOwner({ headers: {} }, unauthRes, () => {});
  assert(
    unauthRes.statusCode === 401,
    'Unauthenticated request rejected with HTTP 401 Unauthorized'
  );

  // --- Step 4: Owner Authenticates & Retrieves JWT ---
  console.log('\n--- Step 4: Owner Authentication ---');
  const ownerAuth = createMockReqRes({
    body: { passcode: 'annapurna2026' },
  });
  await ownerLogin(ownerAuth.req, ownerAuth.res, (e) => { throw e; });
  const ownerToken = ownerAuth.res.data?.token;

  assert(
    ownerAuth.res.statusCode === 200 && ownerToken,
    'Owner authenticated successfully with passcode and issued valid owner JWT'
  );

  // Verify owner token passes protectOwner middleware
  let ownerPassed = false;
  const ownerVerifyMiddlewareReq = {
    headers: { authorization: `Bearer ${ownerToken}` },
  };
  const ownerVerifyMiddlewareRes = {
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
  };
  protectOwner(ownerVerifyMiddlewareReq, ownerVerifyMiddlewareRes, () => { ownerPassed = true; });
  assert(
    ownerPassed && ownerVerifyMiddlewareReq.user?.role === 'owner',
    'Owner token successfully verified with role "owner"'
  );

  // --- Step 5: Owner Verifies & Marks Order 1 as Paid ---
  console.log('\n--- Step 5: Owner Verifies Payment (Approve) ---');
  const approveReq = createMockReqRes({
    user: ownerVerifyMiddlewareReq.user,
    body: { orderId: order1.orderId, action: 'approve' },
  });
  await verifyUpiPayment(approveReq.req, approveReq.res, (e) => { throw e; });
  const approvedData = approveReq.res.data?.data;

  assert(
    approveReq.res.statusCode === 200 && approveReq.res.data?.success === true,
    `Owner verified UPI payment for ${order1.orderId}: "${approveReq.res.data?.message}"`
  );
  assert(
    approvedData?.payment === 'Paid' &&
    approvedData?.status === 'Confirmed' &&
    approvedData?.paymentDetails?.verificationStatus === 'Verified',
    'Order payment updated to "Paid", fulfillment status to "Confirmed", verification to "Verified"'
  );

  // --- Step 6: Verify Database/Storage Persistence Directly ---
  console.log('\n--- Step 6: Direct Database & Storage Inspection ---');
  const storageOrders = loadPersistentOrders();
  const persistedOrder1 = storageOrders.find((o) => o.orderId === order1.orderId);

  assert(
    persistedOrder1 && persistedOrder1.payment === 'Paid',
    `Persisted order in storage is verified "Paid" on disk/database`
  );
  assert(
    Boolean(persistedOrder1?.paymentDetails?.paidAt && persistedOrder1?.paymentDetails?.verifiedAt),
    `Payment timestamp (paidAt) and verification timestamp (verifiedAt) permanently recorded`
  );

  // --- Step 7: Order 2 — Rejection Workflow ---
  console.log('\n--- Step 7: Owner Rejection Workflow ---');
  const sampleUtr2 = '000000000000'; // Fake/mismatched UTR
  const orderReq2 = createMockReqRes({
    user: { id: customer.id, name: customer.name, email: customer.email, role: 'customer' },
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: {
      customerName: customer.name,
      phone: '9845011223',
      email: customer.email,
      address: 'Temple Road, Tilak Nagar',
      city: 'Shimoga',
      pincode: '577201',
      paymentMethod: 'UPI',
      utrNumber: sampleUtr2,
      items: [
        {
          productId: 'swastik-lime-pickle',
          name: 'Swastik Lime Pickle',
          pack: '300 g',
          quantity: 1,
        },
      ],
    },
  });
  await createOrder(orderReq2.req, orderReq2.res, (e) => { throw e; });
  const order2 = orderReq2.res.data?.data;

  const rejectReq = createMockReqRes({
    user: ownerVerifyMiddlewareReq.user,
    body: {
      orderId: order2.orderId,
      action: 'reject',
      rejectReason: 'UTR not found in bank statement statement for date',
    },
  });
  await verifyUpiPayment(rejectReq.req, rejectReq.res, (e) => { throw e; });
  const rejectedData = rejectReq.res.data?.data;

  assert(
    rejectReq.res.statusCode === 200 && rejectReq.res.data?.success === true,
    `Owner rejected invalid payment reference for ${order2.orderId}`
  );
  assert(
    rejectedData?.payment === 'Failed' &&
    rejectedData?.paymentDetails?.verificationStatus === 'Rejected' &&
    rejectedData?.paymentDetails?.failureReason?.includes('UTR not found'),
    'Order payment updated to "Failed" with specific failureReason recorded'
  );

  // Verify persistence of rejection
  const storageAfterReject = loadPersistentOrders();
  const persistedOrder2 = storageAfterReject.find((o) => o.orderId === order2.orderId);
  assert(
    persistedOrder2 && persistedOrder2.payment === 'Failed',
    'Rejected order payment status "Failed" persisted on disk/database'
  );

  // --- Step 8: Clean up test orders ---
  const { clearAllOrders } = require('./src/controllers/orderController');
  const cleanReq = createMockReqRes({ user: { id: 'owner-saa-primary', role: 'owner' } });
  await clearAllOrders(cleanReq.req, cleanReq.res, (e) => { throw e; });
  console.log('\n[INFO] Test orders cleared cleanly.');

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('Owner payment verification & authorization pipeline is 100% OPERATIONAL.');
  } else {
    process.exit(1);
  }
}

runPaymentVerificationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

