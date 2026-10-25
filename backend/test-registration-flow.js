/**
 * Customer Registration & Authentication Diagnostic Test
 * SREE ANNAPURNA AGENCY
 */

const { register, login, getMe, loadPersistentUsers } = require('./src/controllers/authController');
const { verifyToken } = require('./src/utils/security');

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
  };

  return { req, res };
}

async function runRegistrationDiagnostics() {
  console.log('========================================================================');
  console.log(' SREE ANNAPURNA AGENCY: CUSTOMER REGISTRATION VERIFICATION TEST');
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

  // --- Test 1: Missing Name ---
  const t1 = createMockReqRes({
    body: { name: '', email: 'valid@example.com', password: 'password123', phone: '9845012345' },
  });
  await register(t1.req, t1.res, (e) => { throw e; });
  assert(t1.res.statusCode === 400, 'Rejects registration when name is missing (HTTP 400)');

  // --- Test 2: Invalid Email ---
  const t2 = createMockReqRes({
    body: { name: 'Customer One', email: 'not-an-email', password: 'password123', phone: '9845012345' },
  });
  await register(t2.req, t2.res, (e) => { throw e; });
  assert(t2.res.statusCode === 400, 'Rejects registration when email is invalid (HTTP 400)');

  // --- Test 3: Short Password (< 6 chars) ---
  const t3 = createMockReqRes({
    body: { name: 'Customer One', email: 'c1@example.com', password: '123', phone: '9845012345' },
  });
  await register(t3.req, t3.res, (e) => { throw e; });
  assert(t3.res.statusCode === 400, 'Rejects registration when password < 6 chars (HTTP 400)');

  // --- Test 4: Short Phone (< 10 digits) ---
  const t4 = createMockReqRes({
    body: { name: 'Customer One', email: 'c1@example.com', password: 'password123', phone: '12345' },
  });
  await register(t4.req, t4.res, (e) => { throw e; });
  assert(t4.res.statusCode === 400, 'Rejects registration when phone < 10 digits (HTTP 400)');

  // --- Test 5: Successful Customer Registration ---
  const testEmail = `newcustomer.${Date.now()}@example.com`;
  const t5 = createMockReqRes({
    body: {
      name: 'Kavitha Hegde',
      email: testEmail,
      password: 'StrongPassword2026!',
      phone: '+91 94481 99999',
      address: 'Near Gandhi Circle, Durgigudi',
      city: 'Shimoga',
      pincode: '577201',
    },
  });
  await register(t5.req, t5.res, (e) => { throw e; });
  const registeredUser = t5.res.data?.user;
  const registrationToken = t5.res.data?.token;

  assert(
    t5.res.statusCode === 201 && registeredUser && registeredUser.id && registrationToken,
    `Customer registered successfully (HTTP 201, User ID: ${registeredUser?.id})`
  );
  assert(!registeredUser?.password, 'Customer password hash NEVER exposed in registration response');

  // --- Test 6: Verify User Record Persisted to Storage ---
  const diskUsers = loadPersistentUsers();
  const savedUser = diskUsers.find((u) => u.email === testEmail);
  assert(
    Boolean(savedUser && savedUser.id === registeredUser.id && savedUser.name === 'Kavitha Hegde'),
    `Real customer record verified in persistent storage (User ID: ${savedUser?.id})`
  );

  // --- Test 7: Duplicate Email Registration Prevention ---
  const t7 = createMockReqRes({
    body: {
      name: 'Kavitha Duplicate',
      email: testEmail,
      password: 'DifferentPassword123!',
      phone: '9845099999',
    },
  });
  await register(t7.req, t7.res, (e) => { throw e; });
  assert(
    t7.res.statusCode === 409,
    `Duplicate registration blocked with HTTP 409 Conflict: "${t7.res.data?.message}"`
  );

  // --- Test 8: Customer Login with Correct Credentials ---
  const t8 = createMockReqRes({
    body: {
      email: testEmail,
      password: 'StrongPassword2026!',
    },
  });
  await login(t8.req, t8.res, (e) => { throw e; });
  const loginUser = t8.res.data?.user;
  const loginToken = t8.res.data?.token;

  assert(
    t8.res.statusCode === 200 && loginUser && loginToken,
    `Customer logged in successfully (HTTP 200, Token issued)`
  );
  assert(
    loginUser?.email === testEmail && loginUser?.id === registeredUser.id,
    `Signed-in user identity matches registered account: ${loginUser?.name} (${loginUser?.email})`
  );

  // --- Test 9: Verify JWT Token Claims ---
  const decoded = verifyToken(loginToken);
  assert(
    decoded && decoded.id === registeredUser.id && decoded.role === 'customer',
    `JWT token decoded and verified (Subject ID: ${decoded?.id}, Role: ${decoded?.role})`
  );

  // --- Test 10: Profile Resolution via /api/auth/me ---
  const t10 = createMockReqRes({
    user: decoded,
  });
  await getMe(t10.req, t10.res, (e) => { throw e; });
  assert(
    t10.res.statusCode === 200 && t10.res.data?.user?.email === testEmail,
    `/api/auth/me resolves authenticated customer profile for ${t10.res.data?.user?.name}`
  );

  // --- Test 11: Login Rejects Wrong Password ---
  const t11 = createMockReqRes({
    body: {
      email: testEmail,
      password: 'IncorrectPassword!',
    },
  });
  await login(t11.req, t11.res, (e) => { throw e; });
  assert(
    t11.res.statusCode === 401,
    'Login rejects incorrect password with HTTP 401 Unauthorized'
  );

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('Customer registration and login pipeline verified 100% OPERATIONAL.');
  } else {
    process.exit(1);
  }
}

runRegistrationDiagnostics().catch((err) => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});

