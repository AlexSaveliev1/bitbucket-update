# Update package.json script
###  Available arguments:
---
```Language
--workspace - Bitbucket Workspace
--reposlug - Bitbucket Repository Slug
--package - NPM package name
--pversion - Desired NPM package version
```

### Installation
----
1. Pull the script repository
```Language
git clone <this repo>
```
2. Install dependencies
```Language
npm install
```
3. Run via NPM or Node with parameters:
```Language
npm start -- --pversion "2.0.1"

or

node index.js --pversion "2.0.1"
```
