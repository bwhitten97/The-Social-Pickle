import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { config } from './config.js';

class SocialPickleQAAgentWithAuth {
  constructor(baseUrl = config.urls.production) {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.startTime = new Date();
    this.isAuthenticated = false;
  }

  async init() {
    console.log('🚀 Initializing QA Agent with Authentication...');
    this.browser = await chromium.launch({ 
      headless: config.settings.headless,
      slowMo: config.settings.slowMo
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Set up error listeners
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.logIssue('Console Error', msg.text(), 'high');
      }
    });
    
    this.page.on('requestfailed', request => {
      this.logIssue('Network Failure', `${request.method()} ${request.url()} - ${request.failure()?.errorText}`, 'medium');
    });
  }

  logIssue(type, description, severity = 'medium', context = {}) {
    const issue = {
      type,
      description,
      severity,
      timestamp: new Date().toISOString(),
      url: this.page?.url() || 'unknown',
      authenticated: this.isAuthenticated,
      context
    };
    
    this.testResults.push(issue);
    
    const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
    console.log(`${emoji} ${type}: ${description}`);
  }

  logSuccess(action, details = {}) {
    console.log(`✅ ${action}`);
    if (Object.keys(details).length > 0) {
      console.log(`   Details:`, details);
    }
  }

  async performLogin() {
    console.log('\n🔐 Performing Test Account Login...');
    
    try {
      await this.page.goto(this.baseUrl);
      await this.page.waitForLoadState('networkidle');
      
      // Look for login button
      const loginSelectors = [
        'text=Log In',
        'text=Login', 
        'text=Sign In',
        'button:has-text("Log")',
        'a:has-text("Log")',
        '[data-testid="login"]'
      ];
      
      let loginButton = null;
      for (const selector of loginSelectors) {
        loginButton = this.page.locator(selector).first();
        if (await loginButton.isVisible({ timeout: 2000 })) {
          console.log(`Found login button: ${selector}`);
          break;
        }
      }
      
      if (!loginButton || !await loginButton.isVisible()) {
        this.logIssue('Authentication', 'Login button not found', 'high');
        return false;
      }
      
      await loginButton.click();
      await this.page.waitForTimeout(2000);
      
      // Fill in credentials
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email"]',
        '#email'
      ];
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password"]',
        '#password'
      ];
      
      // Find and fill email
      let emailField = null;
      for (const selector of emailSelectors) {
        emailField = this.page.locator(selector).first();
        if (await emailField.isVisible({ timeout: 2000 })) {
          await emailField.fill(config.testAccount.email);
          console.log('✅ Email field filled');
          break;
        }
      }
      
      if (!emailField || !await emailField.isVisible()) {
        this.logIssue('Authentication', 'Email field not found', 'high');
        return false;
      }
      
      // Find and fill password
      let passwordField = null;
      for (const selector of passwordSelectors) {
        passwordField = this.page.locator(selector).first();
        if (await passwordField.isVisible({ timeout: 2000 })) {
          await passwordField.fill(config.testAccount.password);
          console.log('✅ Password field filled');
          break;
        }
      }
      
      if (!passwordField || !await passwordField.isVisible()) {
        this.logIssue('Authentication', 'Password field not found', 'high');
        return false;
      }
      
      // Submit login form
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Login")', 
        'button:has-text("Sign In")',
        'input[type="submit"]'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = this.page.locator(selector).first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          await submitButton.click();
          console.log('✅ Login form submitted');
          break;
        }
      }
      
      // Wait for login to complete
      await this.page.waitForTimeout(5000);
      
      // Check if login was successful
      const currentUrl = this.page.url();
      const loggedInIndicators = [
        'text=Dashboard',
        'text=Profile',
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        '.user-menu',
        '.profile-dropdown'
      ];
      
      let loginSuccess = false;
      for (const indicator of loggedInIndicators) {
        if (await this.page.locator(indicator).first().isVisible({ timeout: 3000 })) {
          loginSuccess = true;
          break;
        }
      }
      
      // Also check URL change
      if (!loginSuccess && (currentUrl.includes('dashboard') || currentUrl.includes('games') || !currentUrl.includes('login'))) {
        loginSuccess = true;
      }
      
      if (loginSuccess) {
        this.isAuthenticated = true;
        this.logSuccess('Successfully logged in with test account');
        console.log(`Current URL after login: ${currentUrl}`);
        return true;
      } else {
        this.logIssue('Authentication', 'Login appeared to fail - no success indicators found', 'high');
        return false;
      }
      
    } catch (error) {
      this.logIssue('Authentication Failed', error.message, 'high');
      return false;
    }
  }

  async testAuthenticatedGameFlow() {
    console.log('\n🏓 Testing Authenticated Game Flow...');
    
    if (!this.isAuthenticated) {
      console.log('⚠️ Not authenticated, attempting login first...');
      const loginSuccess = await this.performLogin();
      if (!loginSuccess) {
        this.logIssue('Critical Bug', 'Cannot test game flow - authentication failed', 'high');
        return;
      }
    }
    
    try {
      // Navigate to games page
      await this.page.goto(`${this.baseUrl}/games`);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      
      console.log('📍 Testing on Games page as authenticated user...');
      
      // Test Post a Game button
      const postGameButton = this.page.locator('text=Post a Game').first();
      if (await postGameButton.isVisible({ timeout: 5000 })) {
        this.logSuccess('✅ Post a Game button found (authenticated)');
        
        // Test clicking it
        await postGameButton.click();
        await this.page.waitForTimeout(2000);
        
        const formVisible = await this.page.locator('form, [role="dialog"], .modal').first().isVisible({ timeout: 3000 });
        if (formVisible) {
          this.logSuccess('✅ Game creation form opens (authenticated)');
          // Close the form
          await this.page.keyboard.press('Escape');
        } else {
          this.logIssue('Game Creation', 'Post a Game clicked but form did not open', 'high');
        }
      } else {
        this.logIssue('Game Creation', 'Post a Game button not found even when authenticated', 'high');
      }
      
      // Test Request to Join buttons
      const joinButtons = this.page.locator('text=Request to Join');
      const joinButtonCount = await joinButtons.count();
      
      if (joinButtonCount > 0) {
        this.logSuccess(`✅ Found ${joinButtonCount} "Request to Join" buttons (authenticated)`);
        
        // Test clicking first one
        const firstJoinButton = joinButtons.first();
        await firstJoinButton.scrollIntoViewIfNeeded();
        await firstJoinButton.click();
        await this.page.waitForTimeout(2000);
        
        const modalVisible = await this.page.locator('[role="dialog"], .modal, form').first().isVisible({ timeout: 3000 });
        if (modalVisible) {
          this.logSuccess('✅ Join request modal opens (authenticated)');
          
          // Test the critical flow - submit a request
          const submitButtons = this.page.locator('button:has-text("Submit"), button:has-text("Send"), button[type="submit"]');
          const submitCount = await submitButtons.count();
          
          if (submitCount > 0) {
            this.logSuccess('✅ Submit button found in join modal');
            
            // Add a test message
            const messageField = this.page.locator('textarea, input[placeholder*="message"]').first();
            if (await messageField.isVisible({ timeout: 2000 })) {
              await messageField.fill('QA Test - automated test request');
              this.logSuccess('✅ Message field filled');
            }
            
            // Click submit (this will create a real test application)
            await submitButtons.first().click();
            await this.page.waitForTimeout(3000);
            
            // Check if request was submitted successfully
            const successIndicators = [
              'text=Request sent',
              'text=Application submitted',
              'text=Successfully',
              '.success',
              '.notification'
            ];
            
            let requestSubmitted = false;
            for (const indicator of successIndicators) {
              if (await this.page.locator(indicator).first().isVisible({ timeout: 3000 })) {
                requestSubmitted = true;
                break;
              }
            }
            
            if (requestSubmitted) {
              this.logSuccess('✅ Join request submitted successfully');
              
              // NOW TEST THE CRITICAL FLOW - check My Requests tab
              console.log('🔄 Testing critical flow: My Requests tab...');
              
              const myRequestsTab = this.page.locator('text=My Requests').first();
              if (await myRequestsTab.isVisible({ timeout: 5000 })) {
                await myRequestsTab.click();
                await this.page.waitForTimeout(3000);
                
                // Check if the application shows up
                const applicationCards = await this.page.locator('.games-card, .application-card, .request-item').count();
                
                if (applicationCards > 0) {
                  this.logSuccess(`✅ CRITICAL FLOW WORKING: Found ${applicationCards} applications in My Requests`);
                } else {
                  this.logIssue('Critical Bug', 'Request to Join submitted but does NOT appear in My Requests tab - THIS IS YOUR BUG!', 'high', {
                    flow: 'Request to Join → My Requests',
                    expected: 'Application should appear in My Requests after submission',
                    actual: 'No applications found in My Requests tab',
                    authenticated: true
                  });
                }
              } else {
                this.logIssue('Critical Bug', 'My Requests tab not found', 'high');
              }
              
            } else {
              this.logIssue('Game Application', 'Join request submission may have failed - no success message', 'medium');
            }
            
          } else {
            this.logIssue('Game Application', 'No submit button found in join modal', 'high');
          }
          
        } else {
          this.logIssue('Game Application', 'Request to Join clicked but modal did not open', 'high');
        }
        
      } else {
        this.logIssue('Critical Bug', 'No Request to Join buttons found even when authenticated', 'high');
      }
      
    } catch (error) {
      this.logIssue('Authenticated Game Flow Test Failed', error.message, 'high');
    }
  }

  async runAuthenticatedTestSuite() {
    console.log('🚀 Starting Authenticated QA Test Suite...\n');
    console.log(`Testing URL: ${this.baseUrl}`);
    console.log(`Using test account: ${config.testAccount.email}\n`);
    
    try {
      await this.init();
      
      // First, perform login
      const loginSuccess = await this.performLogin();
      
      if (loginSuccess) {
        // Run authenticated tests
        await this.testAuthenticatedGameFlow();
      } else {
        console.log('❌ Cannot run authenticated tests - login failed');
        console.log('📝 Make sure you have:');
        console.log('   1. Created a test account');
        console.log('   2. Updated config.js with correct credentials');
        console.log('   3. Test account has completed onboarding');
      }
      
      await this.generateReport();
      
    } catch (error) {
      this.logIssue('Test Suite Failed', error.message, 'high');
      console.error('Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Authenticated QA Test Report...');
    
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    const criticalIssues = this.testResults.filter(r => r.severity === 'high');
    const mediumIssues = this.testResults.filter(r => r.severity === 'medium');
    
    console.log('\n=====================================');
    console.log('📊 AUTHENTICATED QA TEST REPORT');
    console.log('=====================================');
    console.log(`🔐 Authentication Status: ${this.isAuthenticated ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🕐 Duration: ${Math.round(duration / 1000)}s`);
    console.log(`🔴 Critical Issues: ${criticalIssues.length}`);
    console.log(`🟡 Medium Issues: ${mediumIssues.length}`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
        if (issue.context && Object.keys(issue.context).length > 0) {
          console.log(`   Context:`, issue.context);
        }
      });
    }
    
    // Save detailed report
    const report = {
      metadata: {
        timestamp: endTime.toISOString(),
        duration: duration,
        url: this.baseUrl,
        authenticated: this.isAuthenticated,
        testAccount: config.testAccount.email
      },
      summary: {
        total: this.testResults.length,
        critical: criticalIssues.length,
        medium: mediumIssues.length,
        authenticated: this.isAuthenticated
      },
      issues: this.testResults
    };
    
    const reportPath = path.join(process.cwd(), 'qa-report-authenticated.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Authenticated QA Test Suite completed');
  }
}

// Export for use as module
export { SocialPickleQAAgentWithAuth };

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const qaAgent = new SocialPickleQAAgentWithAuth();
  qaAgent.runAuthenticatedTestSuite().catch(console.error);
}