#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { SocialPickleQAAgent } from './qa-agent.js';

const execAsync = promisify(exec);

class SocialPickleQAServer {
  constructor() {
    this.server = new Server(
      {
        name: 'social-pickle-qa',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'run_qa_tests',
          description: 'Run comprehensive QA tests on Social Pickle app to identify bugs and issues',
          inputSchema: {
            type: 'object',
            properties: {
              testSuite: {
                type: 'string',
                enum: ['full', 'critical', 'auth', 'games', 'discover'],
                description: 'Which test suite to run',
                default: 'full'
              },
              environment: {
                type: 'string',
                enum: ['production', 'staging', 'local'],
                description: 'Environment to test',
                default: 'production'
              },
              headless: {
                type: 'boolean',
                description: 'Run tests without browser UI (faster)',
                default: false
              }
            }
          }
        },
        {
          name: 'get_qa_report',
          description: 'Get the latest QA test report with detailed issue analysis',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['summary', 'detailed', 'json'],
                description: 'Report format',
                default: 'summary'
              }
            }
          }
        },
        {
          name: 'test_specific_flow',
          description: 'Test a specific user flow or feature (like the current Request to Join bug)',
          inputSchema: {
            type: 'object',
            properties: {
              flow: {
                type: 'string',
                enum: ['request-to-join', 'game-creation', 'authentication', 'discover-filters'],
                description: 'Specific flow to test'
              },
              url: {
                type: 'string',
                description: 'Override base URL if needed',
                default: 'https://thesocialpickle.web.app'
              }
            },
            required: ['flow']
          }
        },
        {
          name: 'analyze_console_errors',
          description: 'Specifically check for JavaScript console errors and network failures',
          inputSchema: {
            type: 'object',
            properties: {
              pages: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific pages to check',
                default: ['/games', '/discover', '/']
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_qa_tests':
            return await this.runQATests(args || {});
          case 'get_qa_report':
            return await this.getQAReport(args || {});
          case 'test_specific_flow':
            return await this.testSpecificFlow(args);
          case 'analyze_console_errors':
            return await this.analyzeConsoleErrors(args || {});
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async runQATests(args) {
    const { testSuite = 'full', environment = 'production', headless = false } = args;
    
    try {
      console.log(`Running ${testSuite} QA tests on ${environment}...`);
      
      const baseUrl = this.getBaseUrl(environment);
      const qaAgent = new SocialPickleQAAgent(baseUrl);
      
      // Override headless setting
      if (headless) {
        const originalInit = qaAgent.init.bind(qaAgent);
        qaAgent.init = async function() {
          this.browser = await (await import('playwright')).chromium.launch({ headless: true });
          this.page = await this.browser.newPage();
          // Copy the rest of the init logic...
        };
      }
      
      let results;
      
      switch (testSuite) {
        case 'critical':
          await qaAgent.init();
          await qaAgent.testCriticalUserFlow();
          await qaAgent.testGameApplicationFlow();
          results = await qaAgent.generateReport();
          await qaAgent.cleanup();
          break;
          
        case 'auth':
          await qaAgent.init();
          await qaAgent.testUserAuthentication();
          results = await qaAgent.generateReport();
          await qaAgent.cleanup();
          break;
          
        case 'games':
          await qaAgent.init();
          await qaAgent.testGameCreation();
          await qaAgent.testGameApplicationFlow();
          await qaAgent.testMyRequestsTab();
          results = await qaAgent.generateReport();
          await qaAgent.cleanup();
          break;
          
        case 'discover':
          await qaAgent.init();
          await qaAgent.testDiscoverPage();
          results = await qaAgent.generateReport();
          await qaAgent.cleanup();
          break;
          
        default: // 'full'
          await qaAgent.runFullTestSuite();
          results = qaAgent.generateClaudeSummary(await this.getLatestReport());
          break;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `# QA Tests Completed (${testSuite} suite)\n\n${results || 'Tests completed successfully. Check qa-report.json for details.'}`
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ QA Tests Failed: ${error.message}\n\nStack trace:\n${error.stack}`
          }
        ],
        isError: true
      };
    }
  }

  async testSpecificFlow(args) {
    const { flow, url = 'https://thesocialpickle.web.app' } = args;
    
    try {
      const qaAgent = new SocialPickleQAAgent(url);
      await qaAgent.init();
      
      let testResult;
      
      switch (flow) {
        case 'request-to-join':
          console.log('Testing Request to Join flow...');
          await qaAgent.testCriticalUserFlow();
          await qaAgent.testGameApplicationFlow();
          await qaAgent.testMyRequestsTab();
          break;
          
        case 'game-creation':
          await qaAgent.testGameCreation();
          break;
          
        case 'authentication':
          await qaAgent.testUserAuthentication();
          break;
          
        case 'discover-filters':
          await qaAgent.testDiscoverPage();
          break;
          
        default:
          throw new Error(`Unknown flow: ${flow}`);
      }
      
      const results = await qaAgent.generateReport();
      await qaAgent.cleanup();
      
      // Focus on critical issues for this specific flow
      const report = await this.getLatestReport();
      const flowIssues = report.issues.filter(issue => 
        issue.description.toLowerCase().includes(flow.replace('-', ' ')) ||
        issue.type.toLowerCase().includes(flow.replace('-', ' '))
      );
      
      let flowSummary = `# ${flow.toUpperCase()} Flow Test Results\n\n`;
      
      if (flowIssues.length > 0) {
        flowSummary += `**Status**: 🔴 Issues Found\n\n`;
        flowSummary += `**Issues in this flow**: ${flowIssues.length}\n\n`;
        
        flowIssues.forEach((issue, index) => {
          flowSummary += `${index + 1}. **${issue.type}** (${issue.severity}): ${issue.description}\n`;
          if (issue.context && Object.keys(issue.context).length > 0) {
            flowSummary += `   - Context: ${JSON.stringify(issue.context)}\n`;
          }
          flowSummary += `\n`;
        });
      } else {
        flowSummary += `**Status**: ✅ No Issues Found\n\n`;
        flowSummary += `The ${flow} flow is working correctly.\n\n`;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: flowSummary
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Flow Test Failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async analyzeConsoleErrors(args) {
    const { pages = ['/games', '/discover', '/'] } = args;
    
    try {
      const qaAgent = new SocialPickleQAAgent();
      await qaAgent.init();
      
      const errors = [];
      
      for (const page of pages) {
        const url = `${qaAgent.baseUrl}${page}`;
        console.log(`Checking console errors on ${url}...`);
        
        // Set up error collection
        const pageErrors = [];
        qaAgent.page.on('console', msg => {
          if (msg.type() === 'error') {
            pageErrors.push({
              page: url,
              message: msg.text(),
              timestamp: new Date().toISOString()
            });
          }
        });
        
        qaAgent.page.on('pageerror', error => {
          pageErrors.push({
            page: url,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
        });
        
        await qaAgent.page.goto(url);
        await qaAgent.waitForLoad();
        
        // Wait a bit for any async errors
        await qaAgent.page.waitForTimeout(3000);
        
        errors.push(...pageErrors);
      }
      
      await qaAgent.cleanup();
      
      let errorReport = `# Console Error Analysis\n\n`;
      
      if (errors.length > 0) {
        errorReport += `**Status**: 🔴 ${errors.length} Errors Found\n\n`;
        
        errors.forEach((error, index) => {
          errorReport += `${index + 1}. **Page**: ${error.page}\n`;
          errorReport += `   **Error**: ${error.message}\n`;
          if (error.stack) {
            errorReport += `   **Stack**: ${error.stack.split('\\n')[0]}\n`;
          }
          errorReport += `   **Time**: ${error.timestamp}\n\n`;
        });
        
        // Provide suggestions
        errorReport += `## 💡 Suggestions\n\n`;
        if (errors.some(e => e.message.includes('Firebase'))) {
          errorReport += `- ⚠️ Firebase-related errors detected. Check Firebase configuration and authentication.\n`;
        }
        if (errors.some(e => e.message.includes('undefined'))) {
          errorReport += `- ⚠️ Undefined variable errors detected. Check for typos and missing imports.\n`;
        }
        if (errors.some(e => e.message.includes('network') || e.message.includes('fetch'))) {
          errorReport += `- ⚠️ Network errors detected. Check API endpoints and connectivity.\n`;
        }
        
      } else {
        errorReport += `**Status**: ✅ No Console Errors Found\n\n`;
        errorReport += `All pages are free of JavaScript console errors.\n`;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: errorReport
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Console Error Analysis Failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async getQAReport(args) {
    const { format = 'summary' } = args;
    
    try {
      const reportPath = path.join(process.cwd(), 'qa-report.json');
      
      if (!await fs.pathExists(reportPath)) {
        return {
          content: [
            {
              type: 'text',
              text: '📄 No QA report found. Run `run_qa_tests` first to generate a report.'
            }
          ]
        };
      }
      
      const report = await fs.readJson(reportPath);
      
      if (format === 'json') {
        return {
          content: [
            {
              type: 'text',
              text: `# QA Report (JSON Format)\n\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\``
            }
          ]
        };
      }
      
      if (format === 'detailed') {
        let detailed = `# Detailed QA Report\n\n`;
        detailed += `**Generated**: ${report.metadata.timestamp}\n`;
        detailed += `**Duration**: ${Math.round(report.metadata.duration / 1000)}s\n`;
        detailed += `**URL Tested**: ${report.metadata.url}\n\n`;
        
        detailed += `## Summary\n`;
        detailed += `- Total Issues: ${report.summary.total}\n`;
        detailed += `- Critical: ${report.summary.critical}\n`;
        detailed += `- Medium: ${report.summary.medium}\n`;
        detailed += `- Low: ${report.summary.low}\n\n`;
        
        if (report.issues.length > 0) {
          detailed += `## All Issues\n\n`;
          report.issues.forEach((issue, index) => {
            detailed += `### ${index + 1}. ${issue.type} (${issue.severity})\n`;
            detailed += `**Description**: ${issue.description}\n`;
            detailed += `**URL**: ${issue.url}\n`;
            detailed += `**Time**: ${issue.timestamp}\n`;
            if (issue.context && Object.keys(issue.context).length > 0) {
              detailed += `**Context**: ${JSON.stringify(issue.context, null, 2)}\n`;
            }
            detailed += `\n`;
          });
        }
        
        if (report.recommendations && report.recommendations.length > 0) {
          detailed += `## Recommendations\n\n`;
          report.recommendations.forEach((rec, index) => {
            detailed += `${index + 1}. **${rec.issue}** (${rec.priority})\n`;
            detailed += `   ${rec.recommendation}\n\n`;
          });
        }
        
        return {
          content: [
            {
              type: 'text',
              text: detailed
            }
          ]
        };
      }
      
      // Default: summary format
      let summary = `# Latest QA Report Summary\n\n`;
      summary += `**Generated**: ${new Date(report.metadata.timestamp).toLocaleString()}\n`;
      summary += `**Status**: ${report.summary.critical > 0 ? '🔴 CRITICAL ISSUES' : report.summary.medium > 0 ? '🟡 ISSUES FOUND' : '✅ ALL GOOD'}\n\n`;
      
      summary += `**Issue Count**:\n`;
      summary += `- 🔴 Critical: ${report.summary.critical}\n`;
      summary += `- 🟡 Medium: ${report.summary.medium}\n`;
      summary += `- 🟢 Low: ${report.summary.low}\n\n`;
      
      if (report.summary.critical > 0) {
        summary += `## 🚨 Critical Issues (Fix Immediately)\n\n`;
        const criticalIssues = report.issues.filter(i => i.severity === 'high');
        criticalIssues.forEach((issue, index) => {
          summary += `${index + 1}. **${issue.type}**: ${issue.description}\n`;
        });
        summary += `\n`;
      }
      
      if (report.recommendations && report.recommendations.length > 0) {
        summary += `## 💡 Top Recommendations\n\n`;
        report.recommendations.slice(0, 3).forEach((rec, index) => {
          summary += `${index + 1}. ${rec.recommendation}\n`;
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: summary
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to read QA report: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async getLatestReport() {
    const reportPath = path.join(process.cwd(), 'qa-report.json');
    if (await fs.pathExists(reportPath)) {
      return await fs.readJson(reportPath);
    }
    return null;
  }

  getBaseUrl(environment) {
    switch (environment) {
      case 'production':
        return 'https://thesocialpickle.web.app';
      case 'staging':
        return 'https://staging.thesocialpickle.web.app'; // Update if you have staging
      case 'local':
        return 'http://localhost:5173';
      default:
        return 'https://thesocialpickle.web.app';
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Social Pickle QA MCP server started');
  }
}

const server = new SocialPickleQAServer();
server.run().catch(console.error);