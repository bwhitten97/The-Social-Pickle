# Social Pickle QA Agent

An automated QA testing agent for the Social Pickle app using Model Context Protocol (MCP) and Playwright.

## Features

- 🤖 **Automated Testing**: Comprehensive testing of all app features
- 🔍 **Bug Detection**: Automatically identifies critical issues like the current "Request to Join" bug
- 📊 **Detailed Reports**: Generates detailed JSON reports with actionable recommendations
- 🔧 **MCP Integration**: Works seamlessly with Claude Code
- 🎯 **Targeted Testing**: Can test specific flows or run comprehensive test suites

## Current Test Coverage

### Critical Flows
- ✅ Request to Join → My Requests flow (detects current bug)
- ✅ Game creation and posting
- ✅ Authentication flows
- ✅ Advanced Matching filters
- ✅ Console error detection

### Page Testing
- ✅ Landing page performance
- ✅ Games page functionality
- ✅ Discover page features
- ✅ Tab navigation and state management

## Installation

The QA agent is already set up in this directory. To use it:

1. **Standalone Testing**:
   ```bash
   npm test                    # Run full test suite
   npm run test:critical      # Test only critical flows
   ```

2. **MCP Integration** (for use with Claude Code):
   ```bash
   npm start                  # Start MCP server
   ```

## Usage

### Quick Test (Current Bug)

To immediately test the Request to Join bug you're experiencing:

```bash
npm run test:critical
```

This will specifically test the flow that's broken and generate a report.

### Full Test Suite

```bash
npm test
```

Runs all tests and generates a comprehensive report in `qa-report.json`.

### MCP Tools (for Claude Code)

Once the MCP server is running, you can use these commands in Claude Code:

- `run_qa_tests` - Run comprehensive QA tests
- `test_specific_flow request-to-join` - Test the specific broken flow
- `get_qa_report` - Get the latest test results
- `analyze_console_errors` - Check for JavaScript errors

## Test Results

The QA agent will:

1. **Open your app** in a real browser
2. **Interact with UI elements** like a real user would
3. **Detect issues** such as:
   - Buttons that don't work
   - Modals that don't open
   - Data not appearing where expected
   - Console errors and network failures
4. **Generate reports** with specific issue descriptions and recommendations

## Example Output

```
🚨 CRITICAL ISSUES FOUND:

1. Game Application: Request to Join clicked but no modal/form appeared
   - Context: {"flow": "Request to Join → My Requests", "expected": "Application should appear in My Requests", "actual": "No applications found in My Requests"}
   - URL: https://thesocialpickle.web.app/games

2. Console Error: GameContext: Cannot request to join game - user not authenticated
   - URL: https://thesocialpickle.web.app/games
```

## Configuration

### Environment Testing

```bash
# Test production (default)
npm test

# Test local development
node qa-agent.js --env local

# Test staging
node qa-agent.js --env staging
```

### Headless Mode

For faster testing without browser UI:

```javascript
const qaAgent = new SocialPickleQAAgent();
qaAgent.headless = true;
await qaAgent.runFullTestSuite();
```

## Integration with Claude Code

To use this QA agent with Claude Code:

1. The MCP server is automatically configured
2. In Claude Code, you can now say things like:
   - "Run QA tests on my app"
   - "Test the Request to Join flow specifically"
   - "Check for console errors on the games page"
   - "Get the latest QA report"

The QA agent will run tests and provide detailed feedback about what's broken and how to fix it.

## Customization

### Adding New Tests

To add tests for new features, edit `qa-agent.js` and add new test methods:

```javascript
async testNewFeature() {
  console.log('🆕 Testing New Feature...');
  
  try {
    await this.page.goto(`${this.baseUrl}/new-feature`);
    // Your test logic here
    
    if (/* condition */) {
      this.logSuccess('New feature works correctly');
    } else {
      this.logIssue('New Feature', 'Description of issue', 'high');
    }
  } catch (error) {
    this.logIssue('New Feature Test Failed', error.message, 'high');
  }
}
```

### Custom Selectors

Update selectors in the test methods to match your app's DOM structure:

```javascript
// Example: Finding game cards
const gameCards = this.page.locator('.games-card, .game-item, [data-testid="game"]');
```

## Troubleshooting

### Browser Not Opening

If Playwright browser doesn't open:
```bash
npx playwright install
```

### Permission Issues

Make sure the script is executable:
```bash
chmod +x mcp-server.js
```

### MCP Integration Issues

Ensure Claude Code can find the MCP server:
```bash
which node
echo $PATH
```

## Output Files

- `qa-report.json` - Detailed test results in JSON format
- Console output - Real-time test progress and results

## Next Steps

1. **Run the agent** to detect the current Request to Join bug
2. **Fix issues** based on the detailed recommendations
3. **Re-run tests** to verify fixes
4. **Integrate** with your CI/CD pipeline for continuous testing

This QA agent will catch bugs like the one you're experiencing before they reach production!