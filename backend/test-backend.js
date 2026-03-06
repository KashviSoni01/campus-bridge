import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let adminToken = '';

console.log('🚀 Testing CampusBridge Backend...\n');

async function testServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.text();
    console.log('✅ Server Health:', data);
    return true;
  } catch (error) {
    console.log('❌ Server Health Failed:', error.message);
    return false;
  }
}

async function testAdminLogin() {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@admin.edu.in',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (response.ok && data.token) {
      adminToken = data.token;
      console.log('✅ Admin Login: Success');
      console.log('   Token:', data.token.substring(0, 50) + '...');
      return true;
    } else {
      console.log('❌ Admin Login Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin Login Error:', error.message);
    return false;
  }
}

// Test 3: Dashboard Stats
async function testDashboardStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Dashboard Stats: Success');
      console.log('   Total Users:', data.totalUsers);
      console.log('   Total Opportunities:', data.totalOpportunities);
      console.log('   Total Applications:', data.totalApplications);
      return true;
    } else {
      console.log('❌ Dashboard Stats Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard Stats Error:', error.message);
    return false;
  }
}

// Test 4: Create Opportunity
async function testCreateOpportunity() {
  try {
    const opportunityData = {
      title: 'Test Internship from Script',
      description: 'This is a test opportunity',
      organization: 'Test Company',
      category: 'Internship',
      domain: 'Computer Science',
      mode: 'Online',
      duration: '2 months',
      deadline: '2024-12-31T23:59:59.000Z',
      skills: ['JavaScript', 'React'],
      eligibility: {
        minYear: 2,
        maxYear: 4,
        branches: ['Computer Science'],
        minCGPA: 7.0
      }
    };

    const response = await fetch(`${BASE_URL}/api/admin/opportunities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opportunityData)
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Create Opportunity: Success');
      console.log('   Opportunity ID:', data._id);
      console.log('   Title:', data.title);
      return true;
    } else {
      console.log('❌ Create Opportunity Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Create Opportunity Error:', error.message);
    return false;
  }
}

// Test 5: Get Opportunities
async function testGetOpportunities() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/opportunities`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Get Opportunities: Success');
      console.log('   Total Opportunities:', data.opportunities.length);
      data.opportunities.forEach(opp => {
        console.log(`   - ${opp.title} (${opp.organization})`);
      });
      return true;
    } else {
      console.log('❌ Get Opportunities Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get Opportunities Error:', error.message);
    return false;
  }
}

// Test 6: Real-time Stats
async function testRealTimeStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/dashboard/realtime`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Real-time Stats: Success');
      console.log('   Active Opportunities:', data.activeOpportunities);
      console.log('   Pending Applications:', data.pendingApplications);
      return true;
    } else {
      console.log('❌ Real-time Stats Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Real-time Stats Error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Running Backend Tests...\n');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Dashboard Stats', fn: testDashboardStats },
    { name: 'Create Opportunity', fn: testCreateOpportunity },
    { name: 'Get Opportunities', fn: testGetOpportunities },
    { name: 'Real-time Stats', fn: testRealTimeStats }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.name}`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n🎉 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🚀 Your backend is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);
