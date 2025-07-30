import { chromium } from 'playwright';
import { config } from './config.js';

async function quickBugTest() {
  console.log('🚀 Quick Bug Test - Testing Your Actual Issue');
  console.log(`Using account: ${config.testAccount.email}\n`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to your app with longer timeout and more lenient loading
    console.log('📱 Loading Social Pickle app...');
    await page.goto('https://thesocialpickle.web.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait a bit for the page to load
    await page.waitForTimeout(5000);
    console.log('✅ Page loaded');
    
    // Look for login button
    console.log('🔍 Looking for login button...');
    const loginButton = await page.locator('text=Log In, text=Login, text=Sign In').first();
    
    if (await loginButton.isVisible({ timeout: 10000 })) {
      console.log('✅ Found login button, clicking...');
      await loginButton.click();
      await page.waitForTimeout(3000);
      
      // Fill in email
      console.log('📧 Filling email...');
      const emailField = await page.locator('input[type="email"], input[name="email"]').first();
      if (await emailField.isVisible({ timeout: 10000 })) {
        await emailField.fill(config.testAccount.email);
        console.log('✅ Email filled');
        
        // Fill in password
        console.log('🔑 Filling password...');
        const passwordField = await page.locator('input[type="password"]').first();
        if (await passwordField.isVisible({ timeout: 5000 })) {
          await passwordField.fill(config.testAccount.password);
          console.log('✅ Password filled');
          
          // Submit form
          console.log('🚀 Submitting login...');
          const submitButton = await page.locator('button[type="submit"], button:has-text("Log"), button:has-text("Sign In")').first();
          if (await submitButton.isVisible({ timeout: 5000 })) {
            await submitButton.click();
            console.log('✅ Login submitted');
            
            // Wait for login to complete (longer timeout)
            await page.waitForTimeout(8000);
            
            // Check if we're logged in by looking for different indicators
            const loggedIn = await page.locator('text=Games, text=Profile, text=Dashboard, button:has-text("Sign Out")').first().isVisible({ timeout: 10000 });
            
            if (loggedIn) {
              console.log('🎉 Successfully logged in!');
              
              // Navigate to games page
              console.log('🏓 Going to Games page...');
              await page.goto('https://thesocialpickle.web.app/games', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
              });
              await page.waitForTimeout(5000);
              
              // Look for Request to Join buttons
              console.log('🔍 Looking for Request to Join buttons...');
              const joinButtons = await page.locator('text=Request to Join').count();
              
              if (joinButtons > 0) {
                console.log(`✅ Found ${joinButtons} Request to Join buttons!`);
                console.log('👆 Clicking first Request to Join button...');
                
                await page.locator('text=Request to Join').first().click();
                await page.waitForTimeout(3000);
                
                // Check if modal opened
                const modalOpen = await page.locator('form, [role="dialog"], .modal, textarea').first().isVisible({ timeout: 5000 });
                
                if (modalOpen) {
                  console.log('✅ Join request modal opened!');
                  
                  // Fill in message if there's a text field
                  const messageField = page.locator('textarea, input[placeholder*="message"]').first();
                  if (await messageField.isVisible({ timeout: 3000 })) {
                    await messageField.fill('QA Test - automated bug test');
                    console.log('✅ Message filled');
                  }
                  
                  // Submit the request
                  console.log('📤 Submitting join request...');
                  const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Send"), button[type="submit"]').first();
                  if (await submitBtn.isVisible({ timeout: 3000 })) {
                    await submitBtn.click();
                    console.log('✅ Request submitted!');
                    
                    // Wait for submission to process
                    await page.waitForTimeout(5000);
                    
                    // NOW THE CRITICAL TEST - Check My Requests tab
                    console.log('🔄 CRITICAL TEST: Checking My Requests tab...');
                    const myRequestsTab = page.locator('text=My Requests').first();
                    
                    if (await myRequestsTab.isVisible({ timeout: 5000 })) {
                      console.log('✅ Found My Requests tab, clicking...');
                      await myRequestsTab.click();
                      await page.waitForTimeout(5000);
                      
                      // Check for applications
                      const applicationCount = await page.locator('.games-card, .application-card, .request-item').count();
                      
                      console.log(`📊 Found ${applicationCount} applications in My Requests`);
                      
                      if (applicationCount === 0) {
                        console.log('🚨 BUG CONFIRMED: Request was submitted but does NOT appear in My Requests!');
                        console.log('🎯 THIS IS YOUR EXACT BUG - the Request to Join → My Requests flow is broken!');
                      } else {
                        console.log('✅ Applications found in My Requests - flow appears to be working');
                      }
                      
                    } else {
                      console.log('❌ My Requests tab not found');
                    }
                    
                  } else {
                    console.log('❌ Submit button not found in modal');
                  }
                  
                } else {
                  console.log('❌ Join request modal did not open');
                }
                
              } else {
                console.log('❌ No Request to Join buttons found');
              }
              
            } else {
              console.log('❌ Login appeared to fail - no logged in indicators found');
            }
            
          } else {
            console.log('❌ Submit button not found');
          }
          
        } else {
          console.log('❌ Password field not found');
        }
        
      } else {
        console.log('❌ Email field not found');
      }
      
    } else {
      console.log('❌ Login button not found');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n⏸️  Test complete - browser will stay open for 10 seconds for inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('✅ Test finished');
}

quickBugTest().catch(console.error);