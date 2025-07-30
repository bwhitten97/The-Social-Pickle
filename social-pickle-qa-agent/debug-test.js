import { chromium } from 'playwright';
import { config } from './config.js';

async function debugTest() {
  console.log('🔍 Debug Test - Let\'s see what\'s actually on your page');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
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
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-homepage.png');
    
    // List all visible buttons on the page
    console.log('\n🔍 All visible buttons on the page:');
    const buttons = await page.locator('button, a').all();
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      if (text && text.trim()) {
        console.log(`   ${i + 1}. "${text.trim()}"`);
      }
    }
    
    // Check if we're already logged in by looking for Games page elements
    console.log('\n🔍 Checking if already logged in...');
    const gamesPageElements = [
      'text=Games',
      'text=Post a Game', 
      'text=Request to Join',
      'text=My Requests',
      'text=Profile',
      'text=Dashboard'
    ];
    
    let alreadyLoggedIn = false;
    for (const element of gamesPageElements) {
      if (await page.locator(element).first().isVisible({ timeout: 2000 })) {
        console.log(`✅ Found: ${element} - seems like we might be logged in already`);
        alreadyLoggedIn = true;
        break;
      }
    }
    
    if (alreadyLoggedIn) {
      console.log('🎉 Appears we\'re already logged in! Let\'s test the Games functionality...');
      
      // Try to go to games page
      await page.goto('https://thesocialpickle.web.app/games', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      await page.waitForTimeout(3000);
      
      // Take screenshot of games page
      await page.screenshot({ path: 'debug-games-page.png', fullPage: true });
      console.log('📸 Games page screenshot saved as debug-games-page.png');
      
      // Check for Request to Join buttons
      const joinButtonCount = await page.locator('text=Request to Join').count();
      console.log(`🔍 Found ${joinButtonCount} "Request to Join" buttons`);
      
      if (joinButtonCount > 0) {
        console.log('✅ Perfect! Found Request to Join buttons. Testing the bug...');
        
        // Click first Request to Join
        console.log('👆 Clicking first Request to Join...');
        await page.locator('text=Request to Join').first().click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of modal
        await page.screenshot({ path: 'debug-modal.png', fullPage: true });
        console.log('📸 Modal screenshot saved as debug-modal.png');
        
        // Check if modal is open
        const modalElements = await page.locator('form, [role="dialog"], .modal, textarea, input[placeholder*="message"]').count();
        console.log(`🔍 Found ${modalElements} modal-related elements`);
        
        if (modalElements > 0) {
          console.log('✅ Modal appears to be open');
          
          // Try to submit (look for various submit button types)
          const submitSelectors = [
            'button:has-text("Submit")',
            'button:has-text("Send")', 
            'button:has-text("Join")',
            'button[type="submit"]',
            'button:has-text("Request")'
          ];
          
          let submitted = false;
          for (const selector of submitSelectors) {
            if (await page.locator(selector).first().isVisible({ timeout: 1000 })) {
              console.log(`✅ Found submit button: ${selector}`);
              
              // Fill message field if it exists
              const messageField = page.locator('textarea, input[placeholder*="message"]').first();
              if (await messageField.isVisible({ timeout: 1000 })) {
                await messageField.fill('QA Debug Test');
                console.log('✅ Message filled');
              }
              
              console.log('📤 Submitting request...');
              await page.locator(selector).first().click();
              await page.waitForTimeout(3000);
              submitted = true;
              break;
            }
          }
          
          if (submitted) {
            console.log('✅ Request submitted! Now testing My Requests tab...');
            
            // Take screenshot after submission
            await page.screenshot({ path: 'debug-after-submit.png', fullPage: true });
            console.log('📸 After-submit screenshot saved');
            
            // Click My Requests tab
            const myRequestsTab = page.locator('text=My Requests').first();
            if (await myRequestsTab.isVisible({ timeout: 5000 })) {
              console.log('✅ Found My Requests tab, clicking...');
              await myRequestsTab.click();
              await page.waitForTimeout(3000);
              
              // Take screenshot of My Requests
              await page.screenshot({ path: 'debug-my-requests.png', fullPage: true });
              console.log('📸 My Requests screenshot saved');
              
              // Count applications
              const applicationSelectors = [
                '.games-card',
                '.application-card', 
                '.request-item',
                '[data-testid="application"]'
              ];
              
              let totalApplications = 0;
              for (const selector of applicationSelectors) {
                const count = await page.locator(selector).count();
                totalApplications += count;
                if (count > 0) {
                  console.log(`📊 Found ${count} applications using selector: ${selector}`);
                }
              }
              
              console.log(`\n📋 TOTAL APPLICATIONS IN MY REQUESTS: ${totalApplications}`);
              
              if (totalApplications === 0) {
                console.log('🚨 BUG CONFIRMED! ');
                console.log('🎯 The request was submitted but does NOT appear in My Requests tab!');
                console.log('🔍 This is your exact bug - the Request to Join → My Requests flow is broken!');
              } else {
                console.log('✅ Applications found - the flow appears to be working');
              }
              
            } else {
              console.log('❌ My Requests tab not found');
            }
            
          } else {
            console.log('❌ Could not find submit button');
          }
          
        } else {
          console.log('❌ Modal did not open');
        }
        
      } else {
        console.log('❌ No Request to Join buttons found on games page');
      }
      
    } else {
      console.log('❌ Not logged in and couldn\'t find login button');
      console.log('🔍 Try manually logging in with your test account and then run this test');
    }
    
    console.log('\n⏸️  Test complete - browser will stay open for 30 seconds for inspection...');
    console.log('📁 Check the debug-*.png screenshots to see what happened');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  await browser.close();
  console.log('✅ Debug test finished');
}

debugTest().catch(console.error);