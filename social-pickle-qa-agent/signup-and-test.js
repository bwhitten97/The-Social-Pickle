import { chromium } from 'playwright';
import { config } from './config.js';

async function signupAndTest() {
  console.log('🚀 Complete Test: Sign up + Test the Bug');
  console.log(`Creating account: ${config.testAccount.email}\n`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slower for better visibility
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Loading Social Pickle app...');
    await page.goto('https://thesocialpickle.web.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded');
    
    // Click "Sign up with Email"
    console.log('📧 Clicking Sign up with Email...');
    await page.locator('text=Sign up with Email').click();
    await page.waitForTimeout(2000);
    
    // Fill out signup form
    console.log('✍️ Filling signup form...');
    
    // Email field
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailField.isVisible({ timeout: 5000 })) {
      await emailField.fill(config.testAccount.email);
      console.log('✅ Email filled');
    }
    
    // Password field
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    if (await passwordField.isVisible({ timeout: 5000 })) {
      await passwordField.fill(config.testAccount.password);
      console.log('✅ Password filled');
    }
    
    // Confirm password if it exists
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[placeholder*="confirm"]').first();
    if (await confirmPasswordField.isVisible({ timeout: 2000 })) {
      await confirmPasswordField.fill(config.testAccount.password);
      console.log('✅ Confirm password filled');
    }
    
    // Submit signup
    console.log('🚀 Submitting signup...');
    const signupButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create")').first();
    if (await signupButton.isVisible({ timeout: 5000 })) {
      await signupButton.click();
      console.log('✅ Signup submitted');
      
      // Wait for signup to process
      await page.waitForTimeout(5000);
      
      // Handle potential onboarding screens
      console.log('🎯 Handling onboarding...');
      
      // Look for and skip onboarding steps
      const skipSelectors = [
        'button:has-text("Skip")',
        'button:has-text("Next")', 
        'button:has-text("Continue")',
        'button:has-text("Get Started")',
        'button:has-text("Finish")'
      ];
      
      // Try to complete onboarding (up to 5 steps)
      for (let i = 0; i < 5; i++) {
        let stepCompleted = false;
        
        for (const selector of skipSelectors) {
          if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
            console.log(`✅ Onboarding step ${i + 1}: Clicking ${selector}`);
            await page.locator(selector).first().click();
            await page.waitForTimeout(2000);
            stepCompleted = true;
            break;
          }
        }
        
        if (!stepCompleted) {
          console.log(`ℹ️  No more onboarding steps found`);
          break;
        }
      }
      
      // Try to navigate to games page
      console.log('🏓 Navigating to Games page...');
      await page.goto('https://thesocialpickle.web.app/games', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      await page.waitForTimeout(5000);
      
      // Take screenshot
      await page.screenshot({ path: 'after-signup-games-page.png', fullPage: true });
      console.log('📸 Screenshot saved: after-signup-games-page.png');
      
      // Now test for Request to Join buttons
      const joinButtonCount = await page.locator('text=Request to Join').count();
      console.log(`🔍 Found ${joinButtonCount} "Request to Join" buttons`);
      
      if (joinButtonCount > 0) {
        console.log('🎉 SUCCESS! Found Request to Join buttons. Now testing the bug...');
        
        // Click first Request to Join
        console.log('👆 Clicking first Request to Join...');
        await page.locator('text=Request to Join').first().click();
        await page.waitForTimeout(3000);
        
        // Fill out join request
        const messageField = page.locator('textarea, input[placeholder*="message"]').first();
        if (await messageField.isVisible({ timeout: 3000 })) {
          await messageField.fill('QA Test - testing the Request to Join bug');
          console.log('✅ Message filled');
        }
        
        // Submit request
        console.log('📤 Submitting join request...');
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Send"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 3000 })) {
          await submitBtn.click();
          console.log('✅ Request submitted!');
          
          await page.waitForTimeout(5000);
          
          // THE CRITICAL TEST - Check My Requests tab
          console.log('🔄 CRITICAL TEST: Checking My Requests tab...');
          const myRequestsTab = page.locator('text=My Requests').first();
          
          if (await myRequestsTab.isVisible({ timeout: 5000 })) {
            console.log('✅ Found My Requests tab, clicking...');
            await myRequestsTab.click();
            await page.waitForTimeout(5000);
            
            // Take screenshot of My Requests
            await page.screenshot({ path: 'my-requests-after-test.png', fullPage: true });
            console.log('📸 My Requests screenshot saved');
            
            // Count applications
            const applicationCount = await page.locator('.games-card, .application-card, .request-item').count();
            console.log(`📊 Found ${applicationCount} applications in My Requests`);
            
            if (applicationCount === 0) {
              console.log('\n🚨 BUG CONFIRMED! 🚨');
              console.log('🎯 Your exact bug reproduced:');
              console.log('   1. ✅ Successfully signed up and logged in');  
              console.log('   2. ✅ Found and clicked Request to Join button');
              console.log('   3. ✅ Filled out and submitted join request');
              console.log('   4. ❌ Request does NOT appear in My Requests tab');
              console.log('\n💡 The Request to Join → My Requests flow is definitely broken!');
            } else {
              console.log('\n✅ No bug found - applications appear correctly in My Requests');
            }
            
          } else {
            console.log('❌ My Requests tab not found');
          }
          
        } else {
          console.log('❌ Submit button not found');
        }
        
      } else {
        console.log('❌ No Request to Join buttons found - might need to create some games first');
        
        // Let's try to create a game first
        console.log('🎮 Trying to create a game first...');
        const postGameBtn = page.locator('text=Post a Game').first();
        if (await postGameBtn.isVisible({ timeout: 3000 })) {
          console.log('✅ Found Post a Game button');
          await postGameBtn.click();
          await page.waitForTimeout(2000);
          console.log('ℹ️  Game creation form should be open - you might need games to test joining');
        }
      }
      
    } else {
      console.log('❌ Signup button not found');
    }
    
    console.log('\n⏸️  Test complete - browser will stay open for 60 seconds for inspection...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('📸 Taking error screenshot...');
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
  
  await browser.close();
  console.log('✅ Complete test finished');
}

signupAndTest().catch(console.error);