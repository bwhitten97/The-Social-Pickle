import { chromium } from 'playwright';

async function simpleTest() {
  console.log('🎯 SIMPLE TEST: Just wait and test what you show me');
  console.log('📋 Instructions:');
  console.log('   1. The browser will open');
  console.log('   2. You manually log in AND navigate to the Games page');
  console.log('   3. Tell me when you\'re ready');
  console.log('   4. I\'ll test whatever is on screen');
  console.log('\n🚀 Starting...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Opening Social Pickle app...');
    await page.goto('https://thesocialpickle.web.app');
    
    console.log('\n⏸️  WAITING FOR YOU TO:');
    console.log('   1. Log in manually');
    console.log('   2. Navigate to the Games page');
    console.log('   3. Make sure you can see game cards with "Request to Join" buttons');
    console.log('\n⏳ I\'ll wait 2 minutes for you to get everything ready...\n');
    
    // Just wait 2 minutes for manual setup
    await page.waitForTimeout(120000);
    
    console.log('✅ OK! Now let me check what\'s on screen...');
    
    // Take screenshot of current state
    await page.screenshot({ path: 'current-page.png', fullPage: true });
    console.log('📸 Screenshot saved: current-page.png');
    
    // Get current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Count Request to Join buttons
    const joinButtonCount = await page.locator('text=Request to Join').count();
    console.log(`🔍 Found ${joinButtonCount} "Request to Join" buttons`);
    
    if (joinButtonCount > 0) {
      console.log('🎉 Great! Found Request to Join buttons. Testing the bug...');
      
      // Click first Request to Join
      console.log('👆 Clicking first Request to Join...');
      await page.locator('text=Request to Join').first().click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'after-clicking-join.png', fullPage: true });
      console.log('📸 Screenshot after clicking: after-clicking-join.png');
      
      // Try to fill and submit
      const messageField = page.locator('textarea').first();
      if (await messageField.isVisible({ timeout: 3000 })) {
        await messageField.fill('Testing the Request to Join bug');
        console.log('✅ Message filled');
        
        // Submit
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 3000 })) {
          await submitBtn.click();
          console.log('✅ Request submitted!');
          await page.waitForTimeout(5000);
          
          // Check My Requests
          console.log('\n🔄 Now checking My Requests tab...');
          const myRequestsTab = page.locator('text=My Requests').first();
          if (await myRequestsTab.isVisible({ timeout: 3000 })) {
            await myRequestsTab.click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ path: 'my-requests-check.png', fullPage: true });
            console.log('📸 My Requests screenshot: my-requests-check.png');
            
            // Look for any game cards in My Requests
            const gameCards = await page.locator('.games-card').count();
            console.log(`📊 Found ${gameCards} game cards in My Requests`);
            
            if (gameCards === 0) {
              console.log('\n🚨 BUG CONFIRMED!');
              console.log('The request was submitted but does NOT appear in My Requests!');
            } else {
              console.log('\n✅ No bug - request appears in My Requests');
            }
          }
        }
      }
    } else {
      console.log('❌ No Request to Join buttons found on current page');
      console.log('💡 Make sure you\'re on the Games page with available games to join');
    }
    
    console.log('\n⏸️  Test complete - keeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  await browser.close();
  console.log('✅ Test finished');
}

simpleTest().catch(console.error);