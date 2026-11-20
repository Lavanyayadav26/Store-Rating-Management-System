import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('==============================================');
  console.log('STARTING FULL SYSTEM VERIFICATION TESTS');
  console.log('==============================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return async () => {
      try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passed++;
      } catch (err) {
        console.error(`  [FAIL] ${name}:`, err.message);
        failed++;
      }
    };
  }

  const tests = [];

  let adminToken = '';
  let ownerToken = '';
  let userToken = '';
  let createdStoreId = '';
  let createdUserId = '';
  let createdRatingId = '';

  // 1. Normal user registration (min 7 chars, address omitted)
  const testUserEmail = `testuser.${Date.now()}@example.com`;
  tests.push(test('1. Normal user registration with >= 7 chars and no address', async () => {
    const res = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Lavanya User', // 12 chars (>= 7 chars)
        email: testUserEmail,
        password: 'Password@1', // 10 chars: >=8, <=16, uppercase, special
      },
    });

    assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert.strictEqual(res.data.data.user.role, 'NORMAL_USER', 'Role must be NORMAL_USER');
  }));

  // 2. Login for all three roles
  tests.push(test('2. Login for all three roles through common login', async () => {
    // Admin login
    const adminRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@storerating.com', password: 'Password@123' },
    });
    assert.strictEqual(adminRes.status, 200);
    assert.strictEqual(adminRes.data.data.user.role, 'SYSTEM_ADMIN');
    adminToken = adminRes.data.data.token;

    // Store Owner login
    const ownerRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'alice.owner@store.com', password: 'Password@123' },
    });
    assert.strictEqual(ownerRes.status, 200);
    assert.strictEqual(ownerRes.data.data.user.role, 'STORE_OWNER');
    ownerToken = ownerRes.data.data.token;

    // Normal User login
    const userRes = await req('/auth/login', {
      method: 'POST',
      body: { email: testUserEmail, password: 'Password@1' },
    });
    assert.strictEqual(userRes.status, 200);
    assert.strictEqual(userRes.data.data.user.role, 'NORMAL_USER');
    userToken = userRes.data.data.token;
  }));

  // 3. Role-based dashboard stats
  tests.push(test('3. Admin Dashboard statistics from MySQL', async () => {
    const res = await req('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.totalUsers >= 10, 'Expected at least 10 users');
    assert(res.data.data.totalStores >= 5, 'Expected at least 5 stores');
    assert(res.data.data.totalRatings >= 10, 'Expected at least 10 ratings');
  }));

  // 4. Admin creating users
  tests.push(test('4. Admin creating a new user account', async () => {
    const newEmail = `admincreated.${Date.now()}@example.com`;
    const res = await req('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Admin Created Test Owner User',
        email: newEmail,
        password: 'Password@123',
        address: '999 Administrative Blvd, Metropolis',
        role: 'STORE_OWNER',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.user.role, 'STORE_OWNER');
    createdUserId = res.data.data.user.id;
  }));

  // 5. Admin creating stores
  tests.push(test('5. Admin creating a new store with owner link', async () => {
    const res = await req('/admin/stores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Brand New Test Superstore',
        email: `contact.store.${Date.now()}@test.com`,
        address: '500 Commerce Way, Business District, NY 10001',
        ownerId: createdUserId,
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.store.name, 'Brand New Test Superstore');
    createdStoreId = res.data.data.store.id;
  }));

  // 6. Admin viewing users and stores
  tests.push(test('6. Admin viewing users and stores tables', async () => {
    const usersRes = await req('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(usersRes.status, 200);
    assert(usersRes.data.data.users.length > 0);

    const storesRes = await req('/admin/stores', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(storesRes.status, 200);
    assert(storesRes.data.data.stores.length > 0);
  }));

  // 7. Search and filtering
  tests.push(test('7. Search and filtering by name, email, role', async () => {
    const roleFiltered = await req('/admin/users?role=STORE_OWNER', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(roleFiltered.status, 200);
    assert(roleFiltered.data.data.users.every((u) => u.role === 'STORE_OWNER'));

    const searchRes = await req('/stores?search=Apex', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(searchRes.status, 200);
    assert(searchRes.data.data.stores.some((s) => s.name.includes('Apex')));
  }));

  // 8. Ascending and descending sorting
  tests.push(test('8. Ascending and descending sorting on backend data', async () => {
    const ascRes = await req('/admin/stores?sortBy=name&sortOrder=asc', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const descRes = await req('/admin/stores?sortBy=name&sortOrder=desc', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(ascRes.status, 200);
    assert.strictEqual(descRes.status, 200);

    const ascNames = ascRes.data.data.stores.map((s) => s.name);
    const descNames = descRes.data.data.stores.map((s) => s.name);
    assert.notDeepStrictEqual(ascNames, descNames, 'Ascending and descending sort should produce different orders');
  }));

  // 9. Normal user submitting ratings
  tests.push(test('9. Normal user submitting a rating (1 to 5 stars)', async () => {
    const res = await req('/ratings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        storeId: createdStoreId,
        rating: 5,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.rating.rating, 5);
    createdRatingId = res.data.data.rating.id;
  }));

  // 10. Normal user updating ratings & 11. Duplicate rating prevention
  tests.push(test('10 & 11. Modify rating & duplicate rating prevention (Upsert rule)', async () => {
    // Submitting rating again for same store should update, not duplicate
    const res = await req('/ratings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        storeId: createdStoreId,
        rating: 4,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.rating.id, createdRatingId, 'Should update existing rating record');
    assert.strictEqual(res.data.data.rating.rating, 4, 'Rating should be updated to 4');
  }));

  // 12. Correct average rating calculation
  tests.push(test('12. Dynamic average rating calculation', async () => {
    const storeRes = await req(`/stores/${createdStoreId}`);
    assert.strictEqual(storeRes.status, 200);
    assert.strictEqual(storeRes.data.data.store.overallRating, 4.0);
    assert.strictEqual(storeRes.data.data.store.totalRatings, 1);
  }));

  // 13. Store owner viewing ratings
  tests.push(test('13. Store owner viewing ratings submitted for their store', async () => {
    const res = await req('/owner/ratings', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.data.ratings));
  }));

  // 14. Store owner data restrictions & security
  tests.push(test('14. Security: Store owner blocked from Admin endpoints', async () => {
    const res = await req('/admin/dashboard', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(res.status, 403, 'Store owner must get 403 Forbidden on admin dashboard');
  }));

  // 15. Password change functionality
  tests.push(test('15. Password change with old password verification', async () => {
    const res = await req('/auth/change-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        currentPassword: 'Password@1',
        newPassword: 'NewPass@99',
        confirmNewPassword: 'NewPass@99',
      },
    });
    assert.strictEqual(res.status, 200, `Change password failed: ${JSON.stringify(res.data)}`);

    // Verify login with new password
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: { email: testUserEmail, password: 'NewPass@99' },
    });
    assert.strictEqual(loginRes.status, 200, 'Login with new password should succeed');
  }));

  // 16. Form validation errors
  tests.push(test('16. Form validation error handling (short name < 7 chars, weak password)', async () => {
    const res = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Short', // 5 chars (< 7 chars)
        email: 'invalid-email-format',
        password: 'weak',
      },
    });
    assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for invalid registration data');
  }));

  // 17. Logout / Unauthorized access prevention
  tests.push(test('17. Unauthorized access prevention without JWT', async () => {
    const res = await req('/ratings/my-ratings');
    assert.strictEqual(res.status, 401, 'Request without token must be rejected with 401');
  }));

  // Execute all tests sequentially
  for (const t of tests) {
    await t();
  }

  console.log('\n==============================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==============================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
