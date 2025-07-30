import { chromium } from 'playwright';

async function createGameAndTest() {
  console.log('🎮 Complete Test: Create Game + Test Join Request Bug');
  console.log('📋 This test will:');
  console.log('   1. Help you create a test game');
  console.log('   2. Then you can test joining it from another account');
  console.log('\n🚀 Starting...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Opening Social Pickle app...');
    await page.goto('https://thesocialpickle.web.app/games');
    await page.waitForTimeout(5000);
    
    // Check if Post a Game button exists
    const postGameBtn = page.locator('text=Post a Game').first();
    
    if (await postGameBtn.isVisible({ timeout: 5000 })) {
      console.log('✅ Found Post a Game button, clicking...');
      await postGameBtn.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of the form
      await page.screenshot({ path: 'game-creation-form.png', fullPage: true });
      console.log('📸 Screenshot saved: game-creation-form.png');
      
      console.log('\n📝 MANUAL STEP REQUIRED:');
      console.log('   Please fill out the game creation form:');
      console.log('   - Location: Any location (e.g., "Test Court")');
      console.log('   - Date: Tomorrow or later'); 
      console.log('   - Time: Any time');
      console.log('   - Players needed: 1-4');
      console.log('   - Then click Submit/Post');
      console.log('\n⏳ Waiting for you to create the game (60 seconds)...');
      
      await page.waitForTimeout(60000);
      
      console.log('✅ Game should be created. Now refresh and check...');
      await page.reload();
      await page.waitForTimeout(3000);
      
      const joinButtonCount = await page.locator('text=Request to Join').count();
      console.log(`🔍 Found ${joinButtonCount} "Request to Join" buttons after game creation`);
      
      if (joinButtonCount > 0) {
        console.log('🎉 Perfect! Now you have games to test with.');
        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Log out of this account');
        console.log('   2. Log in with a DIFFERENT account'); 
        console.log('   3. Run this command: node final-test.js');
        console.log('   4. The QA agent will test the Request to Join → My Requests bug');
      } else {
        console.log('❌ Game creation might not have worked');
        console.log('💡 Try manually creating a game through the UI');
      }
      
    } else {
      console.log('❌ Post a Game button not found');
      console.log('💡 Make sure you\'re logged in and on the Games page');
    }
    
    console.log('\n⏸️  Browser will stay open for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  await browser.close();
  console.log('✅ Test completed');
}

createGameAndTest().catch(console.error);