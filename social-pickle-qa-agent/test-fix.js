import { chromium } from 'playwright';

async function testFix() {
  console.log('🧪 TESTING THE FIX: Two Account Test');
  console.log('📋 This test will:');
  console.log('   1. Open two browser contexts (like two different users)');
  console.log('   2. Account A: Create a game');
  console.log('   3. Account B: Apply to join that game');
  console.log('   4. Verify Account B sees the request in "My Requests"');
  console.log('   5. Verify Account A does NOT see it in "My Requests"');
  console.log('\n🚀 Starting test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  // Create two separate browser contexts (like incognito windows)
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  
  try {
    // ACCOUNT A: Login and create a game
    console.log('👤 ACCOUNT A: Opening app...');
    await pageA.goto('https://thesocialpickle.web.app');
    await pageA.waitForTimeout(3000);
    
    console.log('⏸️  ACCOUNT A: Please log in manually (you have 60 seconds)');
    await pageA.waitForTimeout(60000);
    
    console.log('🎮 ACCOUNT A: Creating a test game...');
    await pageA.goto('https://thesocialpickle.web.app/games');
    await pageA.waitForTimeout(3000);
    
    // Click Post a Game
    const postGameBtn = pageA.locator('text=Post a Game').first();
    if (await postGameBtn.isVisible({ timeout: 5000 })) {
      await postGameBtn.click();
      console.log('✅ Opened game creation form');
      
      console.log('⏸️  ACCOUNT A: Please fill out the game form and submit (30 seconds)');
      await pageA.waitForTimeout(30000);
      
      // Take screenshot
      await pageA.screenshot({ path: 'account-a-after-posting.png' });
      console.log('📸 Screenshot: account-a-after-posting.png');
    }
    
    // ACCOUNT B: Login and apply to the game
    console.log('\n👤 ACCOUNT B: Opening app in separate context...');
    await pageB.goto('https://thesocialpickle.web.app');
    await pageB.waitForTimeout(3000);
    
    console.log('⏸️  ACCOUNT B: Please log in with a DIFFERENT account (60 seconds)');
    await pageB.waitForTimeout(60000);
    
    console.log('🏓 ACCOUNT B: Going to Games page...');
    await pageB.goto('https://thesocialpickle.web.app/games');
    await pageB.waitForTimeout(5000);
    
    // Look for Request to Join buttons
    const joinButtons = await pageB.locator('text=Request to Join').count();
    console.log(`🔍 ACCOUNT B: Found ${joinButtons} "Request to Join" buttons`);
    
    if (joinButtons > 0) {
      console.log('👆 ACCOUNT B: Clicking first Request to Join...');
      await pageB.locator('text=Request to Join').first().click();
      await pageB.waitForTimeout(3000);
      
      // Fill message
      const messageField = pageB.locator('textarea').first();
      if (await messageField.isVisible({ timeout: 3000 })) {
        await messageField.fill('Test from Account B - checking if fix works');
        console.log('✅ Message filled');
      }
      
      // Submit
      const submitBtn = pageB.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();
        console.log('✅ Request submitted');
        await pageB.waitForTimeout(5000);
      }
      
      // CHECK 1: Account B should see the request in My Requests
      console.log('\n🔍 TEST 1: Checking Account B "My Requests" tab...');
      const myRequestsB = pageB.locator('text=My Requests').first();
      if (await myRequestsB.isVisible({ timeout: 3000 })) {
        await myRequestsB.click();
        await pageB.waitForTimeout(3000);
        
        await pageB.screenshot({ path: 'account-b-my-requests.png' });
        
        const requestsCountB = await pageB.locator('.games-card').count();
        console.log(`📊 Account B sees ${requestsCountB} requests in "My Requests"`);
        
        if (requestsCountB > 0) {
          console.log('✅ TEST 1 PASSED: Account B correctly sees their request');
        } else {
          console.log('❌ TEST 1 FAILED: Account B should see their request but doesn\'t');
        }
      }
      
      // CHECK 2: Account A should NOT see the request in My Requests
      console.log('\n🔍 TEST 2: Checking Account A "My Requests" tab...');
      await pageA.bringToFront();
      await pageA.reload();
      await pageA.waitForTimeout(3000);
      
      const myRequestsA = pageA.locator('text=My Requests').first();
      if (await myRequestsA.isVisible({ timeout: 3000 })) {
        await myRequestsA.click();
        await pageA.waitForTimeout(3000);
        
        await pageA.screenshot({ path: 'account-a-my-requests.png' });
        
        const requestsCountA = await pageA.locator('.games-card').count();
        console.log(`📊 Account A sees ${requestsCountA} requests in "My Requests"`);
        
        if (requestsCountA === 0) {
          console.log('✅ TEST 2 PASSED: Account A correctly does NOT see Account B\'s request');
        } else {
          console.log('❌ TEST 2 FAILED: Account A should NOT see Account B\'s request but does');
        }
      }
      
      // FINAL RESULTS
      console.log('\n📋 FINAL RESULTS:');
      console.log('If both tests passed, the fix is working correctly!');
      console.log('If either test failed, the bug still exists.');
      
    } else {
      console.log('❌ No games to join - make sure Account A created a game');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - account-a-after-posting.png');
    console.log('   - account-b-my-requests.png'); 
    console.log('   - account-a-my-requests.png');
    
    console.log('\n⏸️  Keeping browsers open for 30 seconds for inspection...');
    await pageA.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
  
  await browser.close();
  console.log('✅ Test completed');
}

testFix().catch(console.error);