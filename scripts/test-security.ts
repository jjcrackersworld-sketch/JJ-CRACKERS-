/**
 * Automated Security Test Suite for JJ Crackers
 * Tests all 16 security failure and recovery scenarios from Phase 10
 */

import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Import security modules directly from TypeScript source
import {
  createAdminToken,
  verifyAdminToken,
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
} from '../src/lib/security/auth';
import {
  createApprovalChallenge,
  verifyApprovalToken,
} from '../src/lib/security/approvals';
import { writeAuditRecord, getRecentAuditLogs } from '../src/lib/security/audit';
import { verifyCatalogIntegrity, dispatchSecurityAlert } from '../src/lib/security/alerts';
import { createPreOperationSnapshot } from '../src/lib/security/recovery';

// Route Handlers
import { GET as getProducts, POST as postProduct, DELETE as deleteProducts } from '../src/app/api/products/route';
import { PATCH as patchProduct, DELETE as deleteProductById } from '../src/app/api/products/[id]/route';
import { POST as postSeedProducts } from '../src/app/api/admin/seed-products/route';
import { POST as postSeedCombos } from '../src/app/api/admin/seed-combos/route';
import { POST as postCleanup } from '../src/app/api/admin/cleanup/route';
import { POST as postSettings } from '../src/app/api/settings/route';
import { POST as postApproval } from '../src/app/api/admin/approvals/route';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n🔒 =========================================================');
  console.log('   JJ CRACKERS PRODUCTION PROTECTION - SECURITY TEST SUITE');
  console.log('=========================================================\n');

  // Test 1: Unauthenticated user cannot add a product
  console.log('--- TEST 1: Unauthenticated product creation rejection ---');
  {
    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name_en: 'Unauthorized Firework', price: 100, mrp: 200 })
    });
    const res = await postProduct(req);
    assert(res.status === 401, 'Unauthenticated POST /api/products returns 401 Unauthorized', `Status: ${res.status}`);
  }

  // Test 2: Forged or invalid token rejected
  console.log('\n--- TEST 2: Forged token rejection ---');
  {
    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer jjsec.fake_payload.fake_signature'
      },
      body: JSON.stringify({ name_en: 'Unauthorized Firework', price: 100, mrp: 200 })
    });
    const res = await postProduct(req);
    assert(res.status === 401, 'Tampered token rejected with 401', `Status: ${res.status}`);
  }

  // Test 3: Authenticated admin WITHOUT approval token cannot add product
  console.log('\n--- TEST 3: Product-writing API rejects requests without approval token ---');
  const validAdminToken = createAdminToken('super_admin', '127.0.0.1');
  {
    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({ name_en: 'Test Cracker Without Approval', price: 100, mrp: 200 })
    });
    const res = await postProduct(req);
    const body = await res.json();
    assert(res.status === 403, 'POST /api/products without approval token returns 403 Forbidden', `Status: ${res.status}`);
    assert(body.code === 'APPROVAL_REQUIRED', 'Returns APPROVAL_REQUIRED error code', `Code: ${body.code}`);
  }

  // Test 4: Seed endpoints cannot be triggered without required permission and approval
  console.log('\n--- TEST 4: Seed endpoints rejection without approval token ---');
  {
    const req = new Request('http://localhost:3000/api/admin/seed-products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const res = await postSeedProducts(req);
    assert(res.status === 403, 'POST /api/admin/seed-products without approval returns 403', `Status: ${res.status}`);

    const reqCombos = new Request('http://localhost:3000/api/admin/seed-combos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const resCombos = await postSeedCombos(reqCombos);
    assert(resCombos.status === 403, 'POST /api/admin/seed-combos without approval returns 403', `Status: ${resCombos.status}`);

    const reqCleanup = new Request('http://localhost:3000/api/admin/cleanup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const resCleanup = await postCleanup(reqCleanup);
    assert(resCleanup.status === 403, 'POST /api/admin/cleanup without approval returns 403', `Status: ${resCleanup.status}`);
  }

  // Test 5: Replay Attack Protection
  console.log('\n--- TEST 5: Replay Protection - Old approval cannot be re-executed ---');
  {
    const payload = { action: 'test_single_use', timestamp: Date.now() };
    const challenge = createApprovalChallenge({
      action: 'PRODUCT_CREATE',
      riskLevel: 'MEDIUM',
      targetIds: [],
      payload,
      previewSummary: 'Test single use challenge',
      requestedBy: 'test_runner',
      ip: '127.0.0.1'
    });

    // First consumption: should succeed
    const firstVerify = verifyApprovalToken(challenge.challengeToken, 'PRODUCT_CREATE', [], payload, true);
    assert(firstVerify.valid === true, 'First verification of approval token succeeds');

    // Second consumption (Replay): MUST fail
    const replayVerify = verifyApprovalToken(challenge.challengeToken, 'PRODUCT_CREATE', [], payload, true);
    assert(replayVerify.valid === false, 'Replaying consumed approval token is rejected');
    assert(replayVerify.code === 'REPLAY', 'Replay attempt returns code: REPLAY');
  }

  // Test 6: Payload Tampering Protection
  console.log('\n--- TEST 6: Changing approved payload invalidates approval ---');
  {
    const originalPayload = { name_en: 'Approved Cracker Name', price: 250, mrp: 500 };
    const tamperedPayload = { name_en: 'Approved Cracker Name', price: 10, mrp: 500 }; // price altered!

    const challenge = createApprovalChallenge({
      action: 'PRODUCT_CREATE',
      riskLevel: 'MEDIUM',
      targetIds: [],
      payload: originalPayload,
      previewSummary: 'Test tamper detection',
      requestedBy: 'test_runner',
      ip: '127.0.0.1'
    });

    const tamperVerify = verifyApprovalToken(challenge.challengeToken, 'PRODUCT_CREATE', [], tamperedPayload, true);
    assert(tamperVerify.valid === false, 'Tampered payload rejected by approval verification');
    assert(tamperVerify.code === 'HASH_MISMATCH', 'Returns code: HASH_MISMATCH');
  }

  // Test 7: Scope / Target ID redirection protection
  console.log('\n--- TEST 7: Approved operation cannot be redirected to different product IDs ---');
  {
    const targetA = ['uuid-product-approved-aaa'];
    const targetB = ['uuid-product-unauthorized-bbb'];
    const payload = { id: targetA[0] };

    const challenge = createApprovalChallenge({
      action: 'PRODUCT_DELETE_SINGLE',
      riskLevel: 'HIGH',
      targetIds: targetA,
      payload,
      previewSummary: 'Delete product A',
      requestedBy: 'test_runner',
      ip: '127.0.0.1'
    });

    const redirectVerify = verifyApprovalToken(challenge.challengeToken, 'PRODUCT_DELETE_SINGLE', targetB, payload, true);
    assert(redirectVerify.valid === false, 'Redirected target ID rejected');
  }

  // Test 8: Bulk deletion safeguards
  console.log('\n--- TEST 8: Bulk deletion cannot proceed without safeguards ---');
  {
    const req = new Request('http://localhost:3000/api/products?ids=id1,id2', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const res = await deleteProducts(req);
    assert(res.status === 403, 'Bulk delete without approval challenge returns 403 Forbidden');
  }

  // Test 9: Brute-force Login Rate Limiting
  console.log('\n--- TEST 9: Brute-force rate limiting on authentication ---');
  {
    const testIp = '192.168.100.99';
    recordAuthSuccess(testIp); // reset
    for (let i = 0; i < 5; i++) {
      recordAuthFailure(testIp);
    }
    const check = checkAuthRateLimit(testIp);
    assert(check.allowed === false, 'Rate limit locks out IP after 5 failed attempts');
    assert(typeof check.waitSec === 'number' && check.waitSec > 0, `Lockout duration returned: ${check.waitSec}s`);
    recordAuthSuccess(testIp); // clean up
  }

  // Test 10: Legitimate Storefront Read-Only Access
  console.log('\n--- TEST 10: Legitimate read-only storefront access works fast & uninterrupted ---');
  {
    const startTime = Date.now();
    const req = new Request('http://localhost:3000/api/products?limit=10');
    const res = await getProducts(req);
    const durationMs = Date.now() - startTime;
    const data = await res.json();

    assert(res.status === 200, 'GET /api/products returns 200 OK');
    assert(Array.isArray(data.products) && data.products.length > 0, `Storefront returned ${data.products?.length} products`);
    assert(durationMs < 4000, `Product fetch completed fast (${durationMs}ms)`);
  }

  // Test 11: Official Catalog Count Invariant (150 Items)
  console.log('\n--- TEST 11: Official catalog count verified (150 approved products) ---');
  {
    const integrity = await verifyCatalogIntegrity();
    assert(integrity.valid === true, `Catalog contains exact approved count: ${integrity.currentCount} items`);
  }

  // Test 12: Pre-Operation Snapshot Creation
  console.log('\n--- TEST 12: Safe pre-operation recovery snapshot creation ---');
  {
    const snapshotId = await createPreOperationSnapshot('Security Test Automated Snapshot');
    assert(snapshotId !== null && snapshotId.startsWith('snap_'), `Snapshot created successfully: ${snapshotId}`);
  }

  // Test 13: Tamper-Resistant Audit Trail Logging
  console.log('\n--- TEST 13: Tamper-resistant audit record creation ---');
  {
    const auditOk = await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: 'security_test_suite',
      action: 'SECURITY_CONFIG_UPDATE',
      riskLevel: 'LOW',
      targetIds: ['test-record'],
      ip: '127.0.0.1',
      status: 'SUCCESS',
      details: 'Audit logging automated test verification'
    });
    assert(auditOk === true, 'Audit record persisted successfully');

    const recentLogs = await getRecentAuditLogs(5);
    assert(recentLogs.length > 0, `Retrieved ${recentLogs.length} audit logs`);
  }

  // Test 14: Settings Bulk Price Change Protection
  console.log('\n--- TEST 14: Bulk price modification (global_discount) requires approval ---');
  {
    const req = new Request('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({ global_discount: '75' })
    });
    const res = await postSettings(req);
    const body = await res.json();
    assert(res.status === 403, 'Modifying global discount without approval token returns 403');
    assert(body.code === 'APPROVAL_REQUIRED', 'Returns APPROVAL_REQUIRED for bulk price change');
  }

  // Test 15: Security Alert Dispatch
  console.log('\n--- TEST 15: Security alert dispatch on anomaly ---');
  {
    let alertDispatched = false;
    try {
      await dispatchSecurityAlert({
        alertType: 'UNAUTHORIZED_CATALOG_MODIFICATION',
        severity: 'HIGH',
        message: 'Security test alert verification',
        ip: '127.0.0.1',
        actor: 'automated_tester'
      });
      alertDispatched = true;
    } catch {}
    assert(alertDispatched, 'Security alert dispatched without unhandled exceptions');
  }

  // Test 16: Full Authorized Product Change Workflow (End-to-End)
  console.log('\n--- TEST 16: Authorized product change workflow succeeds end-to-end ---');
  {
    const testProductPayload = {
      name_en: 'Auth Test Cracker Safe',
      name_ta: 'ஆத்த் டெஸ்ட் பட்டாசு',
      price: 150,
      mrp: 300,
      category: 'single-sound'
    };

    // Step 1: Request approval challenge via API
    const approvalReq = new Request('http://localhost:3000/api/admin/approvals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        action: 'PRODUCT_CREATE',
        riskLevel: 'MEDIUM',
        targetIds: [],
        payload: testProductPayload,
        previewSummary: 'Create authorized test product'
      })
    });
    const approvalRes = await postApproval(approvalReq);
    const approvalData = await approvalRes.json();
    assert(approvalRes.status === 200, 'Approval challenge created with 200 OK');
    const challengeToken = approvalData.challenge?.challengeToken;
    assert(challengeToken && challengeToken.startsWith('jjappr.'), 'Valid challenge token received');

    // Step 2: Create product using the approval token
    const createReq = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`,
        'x-approval-token': challengeToken
      },
      body: JSON.stringify({
        ...testProductPayload,
        approval_token: challengeToken
      })
    });
    const createRes = await postProduct(createReq);
    const createdProduct = await createRes.json();
    assert(createRes.status === 201, `Authorized product created successfully with 201 Created (ID: ${createdProduct.id})`);

    // Step 3: Clean up test product
    if (createdProduct.id) {
      const delApproval = createApprovalChallenge({
        action: 'PRODUCT_DELETE_SINGLE',
        riskLevel: 'HIGH',
        targetIds: [createdProduct.id],
        payload: { id: createdProduct.id },
        previewSummary: 'Clean up test product',
        requestedBy: 'test_runner',
        ip: '127.0.0.1'
      });
      const delReq = new Request(`http://localhost:3000/api/products/${createdProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${validAdminToken}`,
          'x-approval-token': delApproval.challengeToken
        }
      });
      const delRes = await deleteProductById(delReq, { params: Promise.resolve({ id: createdProduct.id }) });
      assert(delRes.status === 200, 'Test product safely cleaned up with snapshot and audit log');
    }
  }

  console.log('\n=========================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
