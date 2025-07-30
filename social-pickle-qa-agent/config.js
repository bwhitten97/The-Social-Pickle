// QA Agent Configuration
export const config = {
  // Test account credentials (create a dedicated test account)
  testAccount: {
    email: 'claude-qa-test@example.com',
    password: 'claude101',
    // Or use environment variables for security:
    // email: process.env.QA_TEST_EMAIL,
    // password: process.env.QA_TEST_PASSWORD,
  },
  
  // Test settings
  settings: {
    headless: false, // Set to true for faster testing
    slowMo: 200,     // Faster actions
    timeout: 60000,  // Longer page load timeout
  },
  
  // URLs to test
  urls: {
    production: 'https://thesocialpickle.web.app',
    staging: 'https://staging.thesocialpickle.web.app', // if you have staging
    local: 'http://localhost:5173'
  }
};

// Alternative: Use environment variables for security
// Create a .env file with:
// QA_TEST_EMAIL=qa-test@example.com  
// QA_TEST_PASSWORD=your-test-password