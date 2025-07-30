import { chromium } from 'playwright';

async function fixedTest() {
  console.log('🔧 FIXED QA TEST - More Robust Authentication Detection');
  console.log('📋 This version will:');
  console.log('   1. Properly verify you\'re actually logged in');
  console.log('   2. Ensure we\'re on the real Games page');
  console.log('   3. Only proceed if authentication is definitely working');
  console.log('\n🚀 Starting...\n');
  
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
    console.log('🔍 I\'ll wait and verify you\'re ACTUALLY logged in (not just detect false positives)');
    console.log('⏳ Checking every 5 seconds...');
    
    let actuallyLoggedIn = false;
    let attempts = 0;
    const maxAttempts = 36; // 3 minutes
    
    while (!actuallyLoggedIn && attempts < maxAttempts) {
      attempts++;
      console.log(`⏳ Verification attempt ${attempts}/${maxAttempts}`);
      
      // Take a screenshot to see current state
      await page.screenshot({ path: `login-attempt-${attempts}.png` });
      
      // Check current URL - if we're on games page, that's a good sign
      const currentUrl = page.url();
      console.log(`   📍 Current URL: ${currentUrl}`);
      
      // Try to navigate to games page
      console.log('   🏓 Attempting to access Games page...');
      try {
        await page.goto('https://thesocialpickle.web.app/games', { timeout: 10000 });
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log(`   📍 After navigation URL: ${finalUrl}`);
        
        // STRICT CHECK: Are we actually on the games page?
        if (finalUrl.includes('/games') && !finalUrl.includes('/login') && !finalUrl.includes('/signup')) {
          
          // DOUBLE CHECK: Look for Games page specific elements
          const gamesPageElements = await page.locator('text=Post a Game, text=Find, text=My Games, text=My Requests').count();
          console.log(`   🔍 Found ${gamesPageElements} Games page elements`);
          
          if (gamesPageElements >= 2) {
            // TRIPLE CHECK: Make sure we're not seeing signup forms
            const signupElements = await page.locator('text=Sign up, text=Continue with Google, text=Get Started').count();
            console.log(`   🔍 Found ${signupElements} signup elements (should be 0)`);
            
            if (signupElements === 0) {
              actuallyLoggedIn = true;
              console.log('✅ REAL LOGIN CONFIRMED!');
              console.log('   ✓ Correct URL');
              console.log('   ✓ Games page elements present');  
              console.log('   ✓ No signup elements');
              break;
            } else {
              console.log('   ❌ Still seeing signup elements - not actually logged in');
            }
          } else {
            console.log('   ❌ Not enough Games page elements found');
          }
        } else {
          console.log('   ❌ URL indicates not on games page or redirected to auth');
        }
        
      } catch (error) {
        console.log(`   ❌ Navigation failed: ${error.message}`);
      }
      
      if (!actuallyLoggedIn) {
        console.log('   ⏳ Not logged in yet, waiting 5 seconds...');
        await page.waitForTimeout(5000);
      }
    }
    
    if (!actuallyLoggedIn) {
      console.log('\n❌ AUTHENTICATION FAILED');
      console.log('🚨 The QA agent could not verify that you\'re actually logged in');
      console.log('💡 This explains why the previous tests failed');
      console.log('📸 Check the login-attempt-*.png screenshots to see what went wrong');
      return;
    }
    
    console.log('\n🎉 AUTHENTICATION VERIFIED! Now testing for real...');
    
    // NOW we can trust our testing
    await page.screenshot({ path: 'verified-games-page.png', fullPage: true });
    console.log('📸 Screenshot saved: verified-games-page.png');
    
    // Look for games and Request to Join buttons
    console.log('🔍 Looking for actual games and Request to Join buttons...');
    
    // Check for game cards first
    const gameCardSelectors = [
      '.games-card',
      '.game-card', 
      '[data-testid="game"]',
      '.game-item'
    ];
    
    let totalGames = 0;
    for (const selector of gameCardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   📊 Found ${count} games using selector: ${selector}`);
        totalGames += count;
      }
    }
    
    console.log(`📊 TOTAL GAMES FOUND: ${totalGames}`);
    
    // Now look for Request to Join buttons
    const joinButtonCount = await page.locator('text=Request to Join').count();
    console.log(`🔍 REQUEST TO JOIN BUTTONS: ${joinButtonCount}`);
    
    if (joinButtonCount === 0 && totalGames === 0) {
      console.log('\n💡 NO GAMES OR JOIN BUTTONS FOUND');
      console.log('This could mean:');
      console.log('   1. No games are posted yet');
      console.log('   2. Games are filtered out (you own them all)');
      console.log('   3. Games exist but UI isn\'t showing them (potential bug)');
      
      // Check what's actually on the page
      console.log('\n🔍 Analyzing page content...');
      const pageText = await page.locator('body').textContent();
      
      if (pageText.includes('Available Games')) {
        console.log('   ✅ "Available Games" text found');
      }
      if (pageText.includes('No games')) {
        console.log('   ℹ️  "No games" message found');
      }
      if (pageText.includes('Post a Game')) {
        console.log('   ✅ "Post a Game" option available');
      }
      
    } else if (joinButtonCount > 0) {
      console.log(`\n🎯 PERFECT! Found ${joinButtonCount} Request to Join buttons`);
      console.log('🧪 Now testing the actual bug...');
      
      // Test the Request to Join → My Requests flow
      console.log('👆 Clicking first Request to Join button...');
      await page.locator('text=Request to Join').first().click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'join-modal-opened.png', fullPage: true });
      console.log('📸 Join modal screenshot saved');
      
      // Check if modal opened
      const modalVisible = await page.locator('form, [role="dialog"], .modal, textarea').first().isVisible({ timeout: 3000 });
      
      if (modalVisible) {
        console.log('✅ Join request modal opened');
        
        // Fill message
        const messageField = page.locator('textarea, input[placeholder*="message"]').first();
        if (await messageField.isVisible({ timeout: 2000 })) {
          await messageField.fill('QA Test - Fixed agent testing the bug');
          console.log('✅ Message filled');
        }
        
        // Submit request
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Send"), button[type="submit"]').first();
        if (await submitButton.isVisible({ timeout: 3000 })) {
          console.log('📤 Submitting request...');
          await submitButton.click();
          await page.waitForTimeout(5000);
          
          console.log('✅ Request submitted! Now checking My Requests...');
          
          // Navigate to My Requests tab
          const myRequestsTab = page.locator('text=My Requests').first();
          if (await myRequestsTab.isVisible({ timeout: 5000 })) {
            await myRequestsTab.click();
            await page.waitForTimeout(5000);
            
            await page.screenshot({ path: 'my-requests-verified.png', fullPage: true });
            console.log('📸 My Requests screenshot saved');
            
            // Check for applications
            const applicationCount = await page.locator('.games-card, .application-card, .request-item').count();
            console.log(`📊 Applications in My Requests: ${applicationCount}`);
            
            if (applicationCount === 0) {
              console.log('\n🚨 BUG CONFIRMED WITH PROPER TESTING!');
              console.log('🎯 The Request to Join → My Requests flow is definitely broken');
              console.log('✅ This test is now trustworthy because authentication was verified');
            } else {
              console.log('\n✅ No bug found - applications appear correctly');
            }
            
          } else {
            console.log('❌ My Requests tab not found');
          }
          
        } else {
          console.log('❌ Submit button not found');
        }
        
      } else {
        console.log('❌ Join request modal did not open');
      }
      
    } else {
      console.log(`\n🤔 MIXED RESULTS: ${totalGames} games found but ${joinButtonCount} join buttons`);
      console.log('This suggests games exist but they might be:');
      console.log('   - Your own games (can\'t join your own)');
      console.log('   - Games you\'ve already applied to');
      console.log('   - Games with different button text');
    }
    
    console.log('\n⏸️  Browser staying open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    await page.screenshot({ path: 'fixed-test-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('✅ Fixed test completed');
}

fixedTest().catch(console.error);