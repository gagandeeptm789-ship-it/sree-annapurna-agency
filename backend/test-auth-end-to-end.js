/**
 * Comprehensive End-to-End Authentication Verification Suite
 * SREE ANNAPURNA AGENCY
 * 
 * Verifies:
 * - Customer registration (validation, secure scrypt hashing, no password leaks)
 * - Customer login & session tokens
 * - Stored user persistence (MongoDB + persistent fallback)
 * - /api/auth/me for customer and owner
 * - Owner login with valid credentials ('annapurna2026', 'admin123')
 * - Invalid owner credentials rejection (401)
 * - Strict role separation (Customers cannot access owner endpoints)
 * - Protected routes authorization checks
 */

const { register, login, ownerLogin, getMe, loadPersistentUsers } = require('./src/controllers/authController');
const { getOrders } = require('./src/controllers/orderController');
const { protectCustomer, protectOwner } = require('./src/middleware/authMiddleware');

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

async function runAuthTests() {
  console.log('========================================================================');
  console.log(' SREE ANNAPURNA AGENCY: COMPREHENSIVE AUTHENTICATION TEST SUITE');
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

  // --- Step 1: Customer Registration Validation ---
  console.log('--- Step 1: Customer Input Validation ---');
  
  // 1. Missing name
  const missingNameReq = createMockReqRes({
    body: { name: '', email: 'valid@example.com', password: 'password123' },
  });
  await register(missingNameReq.req, missingNameReq.res, () => {});
  assert(missingNameReq.res.statusCode === 400, 'Registration rejects missing customer name (HTTP 400)');

  // 2. Invalid email format
  const badEmailReq = createMockReqRes({
    body: { name: 'Customer Test', email: 'not-an-email', password: 'password123' },
  });
  await register(badEmailReq.req, badEmailReq.res, () => {});
  assert(badEmailReq.res.statusCode === 400, 'Registration rejects invalid email format (HTTP 400)');

  // 3. Short password (< 6 chars)
  const shortPassReq = createMockReqRes({
    body: { name: 'Customer Test', email: 'valid@example.com', password: '123' },
  });
  await register(shortPassReq.req, shortPassReq.res, () => {});
  assert(shortPassReq.res.statusCode === 400, 'Registration rejects password shorter than 6 chars (HTTP 400)');

  // 4. Invalid phone (< 10 digits)
  const badPhoneReq = createMockReqRes({
    body: { name: 'Customer Test', email: 'valid@example.com', password: 'password123', phone: '12345' },
  });
  await register(badPhoneReq.req, badPhoneReq.res, () => {});
  assert(badPhoneReq.res.statusCode === 400, 'Registration rejects phone shorter than 10 digits (HTTP 400)');

  // --- Step 2: Valid Customer Registration ---
  console.log('\n--- Step 2: Valid Customer Registration & Password Security ---');
  const testEmail = `test.user.${Date.now()}@example.com`;
  const regReq = createMockReqRes({
    body: {
      name: 'Pooja Hegde',
      email: testEmail,
      password: 'SecurePassword2026!',
      phone: '9845112233',
      address: 'Shop #5, Market Road',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(regReq.req, regReq.res, (err) => { throw err; });
  const registeredUser = regReq.res.data?.user;
  const customerToken = regReq.res.data?.token;

  assert(
    regReq.res.statusCode === 201 && registeredUser && customerToken,
    `Customer account registered successfully (User ID: ${registeredUser?.id})`
  );
  assert(
    regReq.res.data?.user?.password === undefined,
    'Password is NOT returned in registration response payload (Zero leaks)'
  );

  // Check persistent storage on disk
  const diskUsers = loadPersistentUsers();
  const diskUser = diskUsers.find((u) => u.email === testEmail.toLowerCase());
  assert(
    diskUser && diskUser.password && diskUser.password.includes(':') && diskUser.password !== 'SecurePassword2026!',
    'Password is salt-hashed with scrypt on disk (Never stored in plain text)'
  );

  // --- Step 3: Duplicate Registration Prevention ---
  console.log('\n--- Step 3: Duplicate Registration Prevention ---');
  const dupReq = createMockReqRes({
    body: {
      name: 'Pooja Hegde Duplicate',
      email: testEmail,
      password: 'AnotherPassword123!',
    },
  });
  await register(dupReq.req, dupReq.res, () => {});
  assert(dupReq.res.statusCode === 409, 'Duplicate email registration prevented with HTTP 409 Conflict');

  // --- Step 4: Customer Login ---
  console.log('\n--- Step 4: Customer Login Verification ---');
  
  // Login with correct password
  const loginReq = createMockReqRes({
    body: { email: testEmail, password: 'SecurePassword2026!' },
  });
  await login(loginReq.req, loginReq.res, (err) => { throw err; });
  assert(
    loginReq.res.statusCode === 200 && loginReq.res.data?.token,
    'Customer signs in successfully with correct credentials'
  );
  assert(
    loginReq.res.data?.user?.password === undefined,
    'Password is NOT returned in sign-in response payload'
  );

  // Login with wrong password
  const wrongPassReq = createMockReqRes({
    body: { email: testEmail, password: 'WrongPassword999' },
  });
  await login(wrongPassReq.req, wrongPassReq.res, () => {});
  assert(wrongPassReq.res.statusCode === 401, 'Login fails with wrong password (HTTP 401)');

  // Login with non-existent email
  const wrongEmailReq = createMockReqRes({
    body: { email: 'nonexistent@example.com', password: 'SomePassword123' },
  });
  await login(wrongEmailReq.req, wrongEmailReq.res, () => {});
  assert(wrongEmailReq.res.statusCode === 401, 'Login fails with non-existent email (HTTP 401)');

  // --- Step 5: /api/auth/me Verification ---
  console.log('\n--- Step 5: Customer Profile Session (/api/auth/me) ---');
  const meReq = createMockReqRes({
    headers: { authorization: `Bearer ${customerToken}` },
  });
  protectCustomer(meReq.req, meReq.res, async () => {
    await getMe(meReq.req, meReq.res, () => {});
  });
  assert(
    meReq.res.statusCode === 200 && meReq.res.data?.user?.id === registeredUser.id,
    `/api/auth/me correctly identifies authenticated customer: ${meReq.res.data?.user?.name}`
  );

  // Unauthenticated /api/auth/me
  const unauthMeReq = createMockReqRes({});
  protectCustomer(unauthMeReq.req, unauthMeReq.res, () => {});
  assert(unauthMeReq.res.statusCode === 401, 'Unauthenticated /api/auth/me rejected with HTTP 401');

  // --- Step 6: Owner Authentication ---
  console.log('\n--- Step 6: Owner Authentication ---');

  // Owner login with configured passcode
  const ownerConfigReq = createMockReqRes({
    body: { passcode: 'annapurna2026' },
  });
  await ownerLogin(ownerConfigReq.req, ownerConfigReq.res, (err) => { throw err; });
  const ownerToken = ownerConfigReq.res.data?.token;
  assert(
    ownerConfigReq.res.statusCode === 200 && ownerToken && ownerConfigReq.res.data?.owner?.role === 'owner',
    'Owner signs in successfully with configured passcode "annapurna2026"'
  );

  // Owner login with prototype passcode
  const ownerProtoReq = createMockReqRes({
    body: { passcode: 'admin123' },
  });
  await ownerLogin(ownerProtoReq.req, ownerProtoReq.res, (err) => { throw err; });
  assert(
    ownerProtoReq.res.statusCode === 200 && ownerProtoReq.res.data?.token,
    'Owner signs in successfully with standard passcode "admin123"'
  );

  // Owner login with invalid passcode
  const ownerBadReq = createMockReqRes({
    body: { passcode: 'incorrect_passcode_999' },
  });
  await ownerLogin(ownerBadReq.req, ownerBadReq.res, () => {});
  assert(ownerBadReq.res.statusCode === 401, 'Owner sign-in rejects invalid passcode (HTTP 401)');

  // Empty owner passcode
  const ownerEmptyReq = createMockReqRes({
    body: { passcode: '' },
  });
  await ownerLogin(ownerEmptyReq.req, ownerEmptyReq.res, () => {});
  assert(ownerEmptyReq.res.statusCode === 400, 'Owner sign-in rejects empty passcode (HTTP 400)');

  // --- Step 7: Owner Profile via /api/auth/me ---
  console.log('\n--- Step 7: Owner Profile Session (/api/auth/me) ---');
  const ownerMeReq = createMockReqRes({
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  protectCustomer(ownerMeReq.req, ownerMeReq.res, async () => {
    await getMe(ownerMeReq.req, ownerMeReq.res, () => {});
  });
  assert(
    ownerMeReq.res.statusCode === 200 && ownerMeReq.res.data?.user?.role === 'owner',
    `/api/auth/me identifies authenticated owner with role "owner"`
  );

  // --- Step 8: Strict Role Separation ---
  console.log('\n--- Step 8: Strict Authorization & Route Protection ---');
  
  // Customer attempting to access owner operations endpoint
  const customerOwnerAttempt = createMockReqRes({
    headers: { authorization: `Bearer ${customerToken}` },
  });
  protectOwner(customerOwnerAttempt.req, customerOwnerAttempt.res, async () => {
    await getOrders(customerOwnerAttempt.req, customerOwnerAttempt.res, () => {});
  });
  assert(
    customerOwnerAttempt.res.statusCode === 403,
    'Customer is strictly DENIED access to Owner Operations Portal (HTTP 403 Forbidden)'
  );

  // Unauthenticated user attempting to access owner endpoint
  const unauthOwnerAttempt = createMockReqRes({});
  protectOwner(unauthOwnerAttempt.req, unauthOwnerAttempt.res, () => {});
  assert(
    unauthOwnerAttempt.res.statusCode === 401,
    'Unauthenticated visitor denied access to Owner Operations Portal (HTTP 401)'
  );

  // Owner accessing owner operations endpoint
  const ownerOrderAttempt = createMockReqRes({
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  let ownerRoutePassed = false;
  protectOwner(ownerOrderAttempt.req, ownerOrderAttempt.res, () => {
    ownerRoutePassed = true;
  });
  assert(
    ownerRoutePassed && ownerOrderAttempt.res.statusCode === 200,
    'Authorized Owner passes protectOwner middleware successfully (Role: owner verified)'
  );

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('All customer and owner authentication workflows PASSED completely.');
  } else {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
