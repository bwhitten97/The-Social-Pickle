import { chromium } from 'playwright';

async function finalTest() {
  console.log('🎯 FINAL TEST: Manual Login + Bug Testing');
  console.log('📋 Instructions:');
  console.log('   1. The browser will open');
  console.log('   2. Manually log in with ANY account that has access to Games');
  console.log('   3. The test will automatically detect when you\'re logged in');
  console.log('   4. Then it will test the Request to Join → My Requests bug');
  console.log('\n🚀 Starting in 3 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Opening Social Pickle app...');
    await page.goto('https://thesocialpickle.web.app');
    await page.waitForTimeout(3000);
    
    console.log('⏸️  Please manually log in now...');
    console.log('🔍 Waiting for you to complete login (checking every 5 seconds)...');
    
    // Wait for manual login - check every 5 seconds for up to 2 minutes
    let loggedIn = false;
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes
    
    while (!loggedIn && attempts < maxAttempts) {
      attempts++;
      console.log(`⏳ Checking login status... (attempt ${attempts}/${maxAttempts})`);
      
      // Check multiple ways to detect if logged in
      const loginIndicators = [
        'text=Post a Game',
        'text=My Games', 
        'text=My Requests',
        'text=Profile',
        'text=Dashboard',
        'button:has-text("Sign Out")',
        'button:has-text("Logout")'
      ];
      
      for (const indicator of loginIndicators) {
        if (await page.locator(indicator).first().isVisible({ timeout: 1000 })) {
          loggedIn = true;
          console.log(`✅ Login detected! Found: ${indicator}`);
          break;
        }
      }
      
      if (!loggedIn) {
        await page.waitForTimeout(5000); // Wait 5 seconds before checking again
      }
    }
    
    if (!loggedIn) {
      console.log('❌ Login timeout - please make sure you log in within 2 minutes');
      return;
    }
    
    console.log('🎉 Great! You\'re logged in. Now testing the bug...');
    
    // Navigate to games page to be sure
    console.log('🏓 Going to Games page...');
    await page.goto('https://thesocialpickle.web.app/games');
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'logged-in-games-page.png', fullPage: true });
    console.log('📸 Screenshot saved: logged-in-games-page.png');
    
    // Check for Request to Join buttons
    const joinButtonCount = await page.locator('text=Request to Join').count();
    console.log(`🔍 Found ${joinButtonCount} "Request to Join" buttons`);
    
    if (joinButtonCount === 0) {
      console.log('⚠️  No Request to Join buttons found. This could mean:');
      console.log('   1. No games are posted to join');
      console.log('   2. You\'ve already applied to all available games');
      console.log('   3. Only your own games are visible');
      console.log('\n💡 Try posting a game from another account first, then run this test');
      
      // Check if we can at least post a game
      const postGameBtn = page.locator('text=Post a Game').first();
      if (await postGameBtn.isVisible({ timeout: 3000 })) {
        console.log('✅ Post a Game button is available');
        console.log('💡 Suggestion: Post a game from this account, then test with another account');
      }
      
      return;
    }
    
    console.log('🎯 Perfect! Testing the Request to Join → My Requests bug...');
    
    // Click first Request to Join button
    console.log('👆 Clicking first Request to Join button...');
    await page.locator('text=Request to Join').first().click();
    await page.waitForTimeout(3000);
    
    // Take screenshot of modal
    await page.screenshot({ path: 'join-request-modal.png', fullPage: true });
    console.log('📸 Modal screenshot saved');
    
    // Check if modal opened
    const modalElements = await page.locator('form, [role="dialog"], .modal, textarea').count();
    
    if (modalElements === 0) {
      console.log('❌ Request to Join modal did not open');
      console.log('🚨 This itself might be the bug!');
      return;
    }
    
    console.log('✅ Join request modal opened');
    
    // Fill message if field exists
    const messageField = page.locator('textarea, input[placeholder*="message"]').first();
    if (await messageField.isVisible({ timeout: 2000 })) {
      await messageField.fill('QA Test - automated testing of the Request to Join bug');
      console.log('✅ Message filled');
    }
    
    // Submit the request
    console.log('📤 Submitting join request...');
    const submitSelectors = [
      'button:has-text("Submit Request")',
      'button:has-text("Submit")',
      'button:has-text("Send Request")', 
      'button:has-text("Send")',
      'button:has-text("Join")',
      'button[type="submit"]'
    ];
    
    let requestSubmitted = false;
    for (const selector of submitSelectors) {
      if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
        console.log(`✅ Found submit button: ${selector}`);
        await page.locator(selector).first().click();
        requestSubmitted = true;
        console.log('📤 Request submitted!');
        break;
      }
    }
    
    if (!requestSubmitted) {
      console.log('❌ Could not find submit button');
      return;
    }
    
    // Wait for submission to process
    await page.waitForTimeout(5000);
    
    // Take screenshot after submission
    await page.screenshot({ path: 'after-request-submitted.png', fullPage: true });
    console.log('📸 After-submission screenshot saved');
    
    // THE CRITICAL TEST - Navigate to My Requests tab
    console.log('\n🔄 CRITICAL TEST: Checking My Requests tab...');
    
    const myRequestsTab = page.locator('text=My Requests').first();
    if (await myRequestsTab.isVisible({ timeout: 5000 })) {
      console.log('✅ Found My Requests tab, clicking...');
      await myRequestsTab.click();
      await page.waitForTimeout(5000);
      
      // Take screenshot of My Requests tab
      await page.screenshot({ path: 'my-requests-final-test.png', fullPage: true });
      console.log('📸 My Requests screenshot saved');
      
      // Count applications in My Requests
      const applicationSelectors = [
        '.games-card',
        '.application-card',
        '.request-item', 
        '[data-testid="application"]',
        '.application',
        '.my-application'
      ];
      
      let totalApplications = 0;
      console.log('🔍 Checking for applications using multiple selectors...');
      
      for (const selector of applicationSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`   📊 Found ${count} items with selector: ${selector}`);
          totalApplications += count;
        }
      }
      
      // Also check for any visible text that might indicate applications
      const applicationTexts = [
        'Application', 
        'Request', 
        'Pending',
        'Applied',
        'Submitted'
      ];
      
      console.log('🔍 Checking for application-related text...');
      for (const text of applicationTexts) {
        const count = await page.locator(`text=${text}`).count();
        if (count > 0) {
          console.log(`   📝 Found "${text}" text ${count} times`);
        }
      }
      
      console.log(`\n📋 TOTAL APPLICATIONS FOUND: ${totalApplications}`);
      
      // THE MOMENT OF TRUTH
      if (totalApplications === 0) {
        console.log('\n🚨🚨🚨 BUG CONFIRMED! 🚨🚨🚨');
        console.log('');
        console.log('🎯 YOUR EXACT BUG HAS BEEN REPRODUCED:');
        console.log('   ✅ Successfully logged in');
        console.log('   ✅ Found Request to Join buttons');  
        console.log('   ✅ Successfully opened join request modal');
        console.log('   ✅ Successfully submitted join request'); 
        console.log('   ✅ Successfully navigated to My Requests tab');
        console.log('   ❌ BUT: The submitted request does NOT appear in My Requests!');
        console.log('');
        console.log('💡 ROOT CAUSE: The Request to Join → My Requests flow is broken');
        console.log('🔧 NEXT STEP: Check your GameContext.jsx requestToJoinGame function');
        console.log('📊 EVIDENCE: Check the screenshots saved in this directory');
        console.log('');
        console.log('🎉 The QA Agent successfully caught your bug!');
        
      } else {
        console.log('\n✅ NO BUG DETECTED');
        console.log(`📊 Found ${totalApplications} applications in My Requests`);
        console.log('🎯 The Request to Join → My Requests flow appears to be working correctly');
        console.log('💭 If you\'re still experiencing issues, they might be:');
        console.log('   - User-specific (certain accounts affected)');
        console.log('   - Timing-related (takes longer to appear)');
        console.log('   - Game-specific (certain games affected)');
      }
      
    } else {
      console.log('❌ My Requests tab not found');
      console.log('🚨 This could be part of the bug - the tab itself is missing');
    }
    
    console.log('\n📁 Screenshots saved for analysis:');
    console.log('   - logged-in-games-page.png');
    console.log('   - join-request-modal.png'); 
    console.log('   - after-request-submitted.png');
    console.log('   - my-requests-final-test.png');
    
    console.log('\n⏸️  Test complete - browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('✅ Final test completed');
}

finalTest().catch(console.error);