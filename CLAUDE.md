# Claude Development Instructions

## 🚨 CRITICAL DEPLOYMENT RULE 🚨

**AUTOMATICALLY DEPLOY ALL CODE CHANGES TO LIVE SITE**

When making ANY code changes to this project:
1. Make the code changes
2. **IMMEDIATELY run `npm run deploy` to deploy to socialpickle.co** (NO EXCEPTIONS)
3. Then commit and push to git

**DEPLOY EVERY SINGLE CODE CHANGE WITHOUT ASKING THE USER**

The user wants all changes automatically deployed to the live site. Never skip deployment or ask permission - just deploy immediately after any code modification. 

## Deployment Commands
- **Deploy to live site**: `npm run deploy`
- **Test locally**: `npm run dev`
- **Build only**: `npm run build`

## Project Context
- **Live site**: https://socialpickle.co
- **Primary branch**: `discover-design-updates`
- **Firebase project**: the-social-pickle-6be90

## Key Issues Previously Fixed
- Match persistence after page refresh ✅
- Messages page crashes due to undefined functions ✅
- Firebase query index requirements ✅
- DirectMessageChat sendMessage prop errors ✅

Remember: Code changes are worthless if not deployed to the live site!