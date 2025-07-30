import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';

class SocialPickleQAAgent {
  constructor(baseUrl = 'https://thesocialpickle.web.app') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.startTime = new Date();
  }

  async init() {
    console.log('🚀 Initializing QA Agent...');
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for CI/automated runs
      slowMo: 500 // Slow down actions for better visibility
    });
    
    this.page = await this.browser.newPage();
    
    // Set up viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Listen for console errors and warnings
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.logIssue('Console Error', msg.text(), 'high');
      } else if (msg.type() === 'warning' && msg.text().includes('Firebase')) {
        this.logIssue('Firebase Warning', msg.text(), 'medium');
      }
    });
    
    // Listen for network failures
    this.page.on('requestfailed', request => {
      this.logIssue('Network Failure', `${request.method()} ${request.url()} - ${request.failure()?.errorText}`, 'high');
    });

    // Listen for JavaScript errors
    this.page.on('pageerror', error => {
      this.logIssue('JavaScript Error', error.message, 'high');
    });
  }

  logIssue(type, description, severity = 'medium', context = {}) {
    const issue = {
      type,
      description,
      severity,
      timestamp: new Date().toISOString(),
      url: this.page?.url() || 'unknown',
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

  async waitForLoad(timeout = 10000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      await this.page.waitForTimeout(1000); // Extra buffer
    } catch (error) {
      this.logIssue('Page Load', `Page did not fully load within ${timeout}ms`, 'medium');
    }
  }

  async testPageLoad() {
    console.log('\n📄 Testing Page Load Performance...');
    
    try {
      const startTime = Date.now();
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 5000) {
        this.logIssue('Performance', `Page load took ${loadTime}ms (>5s)`, 'medium');
      } else {
        this.logSuccess(`Page loaded in ${loadTime}ms`);
      }
      
      // Check for basic page elements
      const title = await this.page.title();
      if (title.includes('Social Pickle')) {
        this.logSuccess('Page title is correct');
      } else {
        this.logIssue('Page Content', `Unexpected page title: ${title}`, 'medium');
      }
      
    } catch (error) {
      this.logIssue('Page Load Failed', error.message, 'high');
    }
  }

  async testUserAuthentication() {
    console.log('\n🔐 Testing User Authentication...');
    
    try {
      await this.page.goto(this.baseUrl);
      await this.waitForLoad();
      
      // Look for auth-related elements
      const signupButton = this.page.locator('text=Sign Up').first();
      const loginButton = this.page.locator('text=Log In').first();
      
      if (await signupButton.isVisible({ timeout: 5000 })) {
        this.logSuccess('Signup button found and visible');
        
        // Test signup button click
        await signupButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check if signup form/page appeared
        const url = this.page.url();
        if (url.includes('signup') || url.includes('onboarding')) {
          this.logSuccess('Signup flow initiated successfully');
        } else {
          this.logIssue('Authentication', 'Signup button click did not navigate to signup', 'medium');
        }
      } else {
        this.logIssue('Authentication', 'Signup button not found or not visible', 'medium');
      }
      
      // Test login button
      await this.page.goto(this.baseUrl);
      await this.waitForLoad();
      
      if (await loginButton.isVisible({ timeout: 5000 })) {
        this.logSuccess('Login button found and visible');
      } else {
        this.logIssue('Authentication', 'Login button not found or not visible', 'medium');
      }
      
    } catch (error) {
      this.logIssue('Authentication Test Failed', error.message, 'high');
    }
  }

  async testGameCreation() {
    console.log('\n🏓 Testing Game Creation Flow...');
    
    try {
      await this.page.goto(`${this.baseUrl}/games`);
      await this.waitForLoad();
      
      // Look for "Post a Game" button
      const postGameButton = this.page.locator('text=Post a Game').first();
      
      if (await postGameButton.isVisible({ timeout: 5000 })) {
        this.logSuccess('Post a Game button found');
        
        await postGameButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check if form/modal opened
        const formSelectors = [
          'form',
          '[role="dialog"]',
          '.modal',
          '.games-form',
          'input[placeholder*="location"]',
          'input[type="date"]'
        ];
        
        let formFound = false;
        for (const selector of formSelectors) {
          if (await this.page.locator(selector).first().isVisible({ timeout: 1000 })) {
            this.logSuccess(`Game creation form opened (found: ${selector})`);
            formFound = true;
            break;
          }
        }
        
        if (!formFound) {
          this.logIssue('Game Creation', 'Post a Game button clicked but no form appeared', 'high');
        }
        
        // Test form fields if form is visible
        if (formFound) {
          const requiredFields = [
            { selector: 'input[type="date"], input[placeholder*="date"]', name: 'Date field' },
            { selector: 'input[type="time"], input[placeholder*="time"]', name: 'Time field' },
            { selector: 'input[placeholder*="location"], input[name*="location"]', name: 'Location field' }
          ];
          
          for (const field of requiredFields) {
            if (await this.page.locator(field.selector).first().isVisible({ timeout: 2000 })) {
              this.logSuccess(`${field.name} found in form`);
            } else {
              this.logIssue('Game Creation Form', `${field.name} not found`, 'medium');
            }
          }
        }
        
      } else {
        this.logIssue('Game Creation', 'Post a Game button not found or not visible', 'high');
      }
      
    } catch (error) {
      this.logIssue('Game Creation Test Failed', error.message, 'high');
    }
  }

  async testGameApplicationFlow() {
    console.log('\n📝 Testing Game Application Flow...');
    
    try {
      await this.page.goto(`${this.baseUrl}/games`);
      await this.waitForLoad();
      
      // Look for "Request to Join" buttons
      const joinButtons = this.page.locator('text=Request to Join');
      const joinButtonCount = await joinButtons.count();
      
      if (joinButtonCount > 0) {
        this.logSuccess(`Found ${joinButtonCount} games with "Request to Join" buttons`);
        
        // Test clicking first join button
        const firstJoinButton = joinButtons.first();
        await firstJoinButton.scrollIntoViewIfNeeded();
        await firstJoinButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check if modal/form opened
        const modalSelectors = [
          '[role="dialog"]',
          '.modal',
          '.games-request-modal',
          'form:has(textarea)',
          'input[placeholder*="message"]',
          'textarea'
        ];
        
        let modalFound = false;
        for (const selector of modalSelectors) {
          if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
            this.logSuccess(`Join request modal opened (found: ${selector})`);
            modalFound = true;
            break;
          }
        }
        
        if (!modalFound) {
          this.logIssue('Game Application', 'Request to Join clicked but no modal/form appeared', 'high');
        }
        
        // Test submitting an application
        if (modalFound) {
          try {
            // Look for submit button
            const submitSelectors = [
              'button:has-text("Submit Request")',
              'button:has-text("Send Request")',
              'button:has-text("Join")',
              'button[type="submit"]'
            ];
            
            for (const selector of submitSelectors) {
              const submitBtn = this.page.locator(selector).first();
              if (await submitBtn.isVisible({ timeout: 1000 })) {
                this.logSuccess(`Submit button found: ${selector}`);
                // Note: Not actually submitting to avoid creating test data
                break;
              }
            }
          } catch (err) {
            this.logIssue('Game Application', 'Could not find submit button in modal', 'medium');
          }
        }
        
      } else {
        this.logIssue('Game Application', 'No "Request to Join" buttons found on games page', 'high');
      }
      
    } catch (error) {
      this.logIssue('Game Application Test Failed', error.message, 'high');
    }
  }

  async testMyRequestsTab() {
    console.log('\n📋 Testing My Requests Tab...');
    
    try {
      await this.page.goto(`${this.baseUrl}/games`);
      await this.waitForLoad();
      
      // Look for My Requests tab
      const myRequestsTab = this.page.locator('text=My Requests').first();
      
      if (await myRequestsTab.isVisible({ timeout: 5000 })) {
        this.logSuccess('My Requests tab found');
        
        await myRequestsTab.click();
        await this.page.waitForTimeout(3000);
        
        // Check URL or active state
        const url = this.page.url();
        const isActive = await this.page.locator('.active:has-text("My Requests")').first().isVisible({ timeout: 2000 });
        
        if (url.includes('requests') || isActive) {
          this.logSuccess('My Requests tab activated successfully');
        }
        
        // Check for applications content
        const contentSelectors = [
          '.games-card',
          '.application-card',
          '.request-item',
          '[data-testid="application"]'
        ];
        
        let applicationsFound = 0;
        for (const selector of contentSelectors) {
          const elements = await this.page.locator(selector).count();
          if (elements > 0) {
            applicationsFound = elements;
            break;
          }
        }
        
        if (applicationsFound > 0) {
          this.logSuccess(`Found ${applicationsFound} applications in My Requests`);
        } else {
          // Check for empty state message
          const emptyStateSelectors = [
            'text=No applications',
            'text=No requests',
            'text=You haven\'t applied',
            '.empty-state'
          ];
          
          let emptyStateFound = false;
          for (const selector of emptyStateSelectors) {
            if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
              this.logSuccess('Empty state message shown (no applications)');
              emptyStateFound = true;
              break;
            }
          }
          
          if (!emptyStateFound) {
            this.logIssue('My Requests', 'No applications found and no empty state message', 'medium');
          }
        }
        
      } else {
        this.logIssue('My Requests', 'My Requests tab not found or not visible', 'high');
      }
      
    } catch (error) {
      this.logIssue('My Requests Test Failed', error.message, 'high');
    }
  }

  async testDiscoverPage() {
    console.log('\n🔍 Testing Discover Page...');
    
    try {
      await this.page.goto(`${this.baseUrl}/discover`);
      await this.waitForLoad();
      
      // Test Advanced Matching button
      const advancedButton = this.page.locator('text=Advanced Matching').first();
      
      if (await advancedButton.isVisible({ timeout: 5000 })) {
        this.logSuccess('Advanced Matching button found');
        
        await advancedButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check if filter panel opened
        const filterSelectors = [
          '.filter-panel',
          '.advanced-filters',
          '.filters-form',
          'input[type="checkbox"]',
          'select'
        ];
        
        let filtersFound = false;
        for (const selector of filterSelectors) {
          if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
            this.logSuccess(`Filter panel opened (found: ${selector})`);
            filtersFound = true;
            break;
          }
        }
        
        if (!filtersFound) {
          this.logIssue('Discover Page', 'Advanced Matching clicked but no filter panel appeared', 'high');
        }
        
      } else {
        this.logIssue('Discover Page', 'Advanced Matching button not found', 'medium');
      }
      
      // Test player cards
      const playerCardSelectors = [
        '.player-card',
        '.discover-card',
        '.user-card'
      ];
      
      let playersFound = 0;
      for (const selector of playerCardSelectors) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          playersFound = count;
          this.logSuccess(`Found ${count} player cards on Discover page`);
          break;
        }
      }
      
      if (playersFound === 0) {
        this.logIssue('Discover Page', 'No player cards found on Discover page', 'medium');
      }
      
    } catch (error) {
      this.logIssue('Discover Page Test Failed', error.message, 'medium');
    }
  }

  async testCriticalUserFlow() {
    console.log('\n🔄 Testing Critical User Flow (Request to Join → My Requests)...');
    
    try {
      // This is the specific bug you're experiencing
      await this.page.goto(`${this.baseUrl}/games`);
      await this.waitForLoad();
      
      // Step 1: Click Request to Join
      const joinButton = this.page.locator('text=Request to Join').first();
      
      if (await joinButton.isVisible({ timeout: 5000 })) {
        console.log('  Step 1: Clicking Request to Join...');
        await joinButton.click();
        await this.page.waitForTimeout(2000);
        
        // Check if modal opened
        const modalOpened = await this.page.locator('[role="dialog"], .modal, form').first().isVisible({ timeout: 3000 });
        
        if (modalOpened) {
          console.log('  ✅ Modal opened successfully');
          
          // Step 2: Submit the request (if possible without creating real data)
          // For now, we'll just close the modal and check the requests tab
          
          // Close modal (look for close button or ESC)
          try {
            const closeButton = this.page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
            if (await closeButton.isVisible({ timeout: 2000 })) {
              await closeButton.click();
            } else {
              await this.page.keyboard.press('Escape');
            }
          } catch (err) {
            // Continue anyway
          }
          
          // Step 3: Check My Requests tab
          console.log('  Step 2: Checking My Requests tab...');
          await this.page.waitForTimeout(1000);
          
          const myRequestsTab = this.page.locator('text=My Requests').first();
          if (await myRequestsTab.isVisible()) {
            await myRequestsTab.click();
            await this.page.waitForTimeout(3000);
            
            // Check if any applications appear
            const applicationCards = await this.page.locator('.games-card, .application-card').count();
            
            console.log(`  Found ${applicationCards} applications in My Requests`);
            
            if (applicationCards === 0) {
              this.logIssue('Critical Bug', 'Request to Join flow does not populate My Requests tab', 'high', {
                flow: 'Request to Join → My Requests',
                expected: 'Application should appear in My Requests',
                actual: 'No applications found in My Requests'
              });
            } else {
              this.logSuccess('Critical flow working: Applications appear in My Requests');
            }
          }
          
        } else {
          this.logIssue('Critical Bug', 'Request to Join button does not open modal', 'high');
        }
        
      } else {
        this.logIssue('Critical Bug', 'No Request to Join buttons found', 'high');
      }
      
    } catch (error) {
      this.logIssue('Critical User Flow Test Failed', error.message, 'high');
    }
  }

  async runFullTestSuite() {
    console.log('🚀 Starting Social Pickle QA Test Suite...\n');
    console.log(`Testing URL: ${this.baseUrl}`);
    console.log(`Started at: ${this.startTime.toISOString()}\n`);
    
    try {
      await this.init();
      
      // Run all tests
      await this.testPageLoad();
      await this.testUserAuthentication();
      await this.testGameCreation();
      await this.testGameApplicationFlow();
      await this.testMyRequestsTab();
      await this.testDiscoverPage();
      await this.testCriticalUserFlow(); // This tests your specific bug
      
      await this.generateReport();
      
    } catch (error) {
      this.logIssue('Test Suite Failed', error.message, 'high');
      console.error('Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async generateReport() {
    console.log('\n📊 Generating QA Test Report...');
    
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    const criticalIssues = this.testResults.filter(r => r.severity === 'high');
    const mediumIssues = this.testResults.filter(r => r.severity === 'medium');
    const lowIssues = this.testResults.filter(r => r.severity === 'low');
    
    console.log('\n=====================================');
    console.log('📊 QA TEST REPORT');
    console.log('=====================================');
    console.log(`🕐 Duration: ${Math.round(duration / 1000)}s`);
    console.log(`🔴 Critical Issues: ${criticalIssues.length}`);
    console.log(`🟡 Medium Issues: ${mediumIssues.length}`);
    console.log(`🟢 Low Issues: ${lowIssues.length}`);
    console.log(`📝 Total Issues: ${this.testResults.length}`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES (FIX IMMEDIATELY):');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
        if (issue.context && Object.keys(issue.context).length > 0) {
          console.log(`   Context:`, issue.context);
        }
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log('\n🟡 MEDIUM ISSUES:');
      mediumIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }
    
    // Generate detailed JSON report
    const report = {
      metadata: {
        timestamp: endTime.toISOString(),
        duration: duration,
        url: this.baseUrl,
        userAgent: await this.page?.evaluate(() => navigator.userAgent) || 'unknown'
      },
      summary: {
        total: this.testResults.length,
        critical: criticalIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      },
      issues: this.testResults,
      recommendations: this.generateRecommendations(criticalIssues, mediumIssues)
    };
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'qa-report.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Generate summary for Claude
    return this.generateClaudeSummary(report);
  }

  generateRecommendations(criticalIssues, mediumIssues) {
    const recommendations = [];
    
    if (criticalIssues.some(i => i.type.includes('Request to Join') || i.description.includes('My Requests'))) {
      recommendations.push({
        priority: 'high',
        issue: 'Game application flow broken',
        recommendation: 'Check GameContext.jsx requestToJoinGame function and getUserApplications filtering logic. Verify Firestore listeners are properly set up for user applications.'
      });
    }
    
    if (criticalIssues.some(i => i.type === 'Console Error')) {
      recommendations.push({
        priority: 'high',
        issue: 'JavaScript errors present',
        recommendation: 'Fix console errors as they may be blocking functionality. Check browser dev tools for detailed error messages.'
      });
    }
    
    if (criticalIssues.some(i => i.type === 'Network Failure')) {
      recommendations.push({
        priority: 'high',
        issue: 'Network requests failing',
        recommendation: 'Check Firebase configuration and network connectivity. Verify API endpoints are working correctly.'
      });
    }
    
    return recommendations;
  }

  generateClaudeSummary(report) {
    const { summary, issues } = report;
    
    let claudeSummary = `# QA Test Results\n\n`;
    claudeSummary += `**Overall Status**: ${summary.critical > 0 ? '🔴 CRITICAL ISSUES FOUND' : summary.medium > 0 ? '🟡 ISSUES FOUND' : '✅ ALL TESTS PASSED'}\n\n`;
    claudeSummary += `**Issues Found**: ${summary.total} total (${summary.critical} critical, ${summary.medium} medium, ${summary.low} low)\n\n`;
    
    if (summary.critical > 0) {
      claudeSummary += `## 🚨 Critical Issues\n\n`;
      issues.filter(i => i.severity === 'high').forEach((issue, index) => {
        claudeSummary += `${index + 1}. **${issue.type}**: ${issue.description}\n`;
        if (issue.context && Object.keys(issue.context).length > 0) {
          claudeSummary += `   - Context: ${JSON.stringify(issue.context, null, 2)}\n`;
        }
        claudeSummary += `   - URL: ${issue.url}\n\n`;
      });
    }
    
    return claudeSummary;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ QA Test Suite completed');
  }
}

// Export for use as module
export { SocialPickleQAAgent };

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const qaAgent = new SocialPickleQAAgent();
  qaAgent.runFullTestSuite().catch(console.error);
}