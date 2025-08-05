# Claude Development Instructions

## 🚨 CRITICAL DEPLOYMENT RULE 🚨

**ALWAYS DEPLOY TO LIVE SITE AFTER ANY CODE CHANGES**

When making ANY code changes to this project:
1. Make the code changes
2. **IMMEDIATELY run `./deploy.sh` to deploy to socialpickle.co**
3. Then commit and push to git

**This is especially critical after conversation compacting or context loss!**

The user has wasted hours debugging issues that were already fixed but not deployed. 

## Deployment Commands
- **Deploy to live site**: `./deploy.sh`
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