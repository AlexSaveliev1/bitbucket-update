// TODO: Add TypeScript

const { Bitbucket } = require('bitbucket');
const FormData = require('form-data');
const minimist = require('minimist');

/*
  Possible CLI arguments:
  --workspace - Bitbucket Workspace
  --reposlug - Bitbucket Repository Slug
  --package - NPM package name
  --pversion - Desired NPM package version
*/

// TODO: Validate CLI input, throw an error in case of invalid parameters
const argv = minimist(process.argv.slice(2));

const BITBUCKET_WORKSPACE = argv.workspace || 'trialupd';
const BITBUCKET_REPO_SLUG = argv.reposlug || 'sync-1'

const PACKAGE_NAME = argv.package || 'moment';
const PACKAGE_VERSION = argv.pversion|| '2';

// TODO: Make it ENV or CLI input arguments variable
const AUTH_USERNAME = 'alexsavelievtrial';
const AUTH_PASSWORD = 'TLDEgcppESdePaV2Cywg';
// LOCATION: https://bitbucket.org/account/settings/app-passwords/

const defaultClientOptions = {
  workspace: BITBUCKET_WORKSPACE,
  repo_slug: BITBUCKET_REPO_SLUG
};

function initBitbucketClient() {
  const clientOptions = {
    auth: {
      username: AUTH_USERNAME,
      password: AUTH_PASSWORD
    }
  }
  
  return new Bitbucket(clientOptions);
}

function updatePackageJson(srcPackageJson) {
  const updatedPackageJson = {
    ...srcPackageJson
  };

  // TODO: Handle major minor patch versioning
  updatedPackageJson.dependencies[PACKAGE_NAME] = PACKAGE_VERSION;

  return updatedPackageJson;
}

(async function() {
  // TODO: Add more logs regarding the progress of modifying package.json
  console.info(`Initiating Bitbucket client for ${AUTH_USERNAME}...`);
  const client = initBitbucketClient();

  console.info(`Fetching root directory of "${BITBUCKET_REPO_SLUG}" repository...`)
  // TODO: Handle HTTP error
  const rootDir = await client.source.readRoot({ ...defaultClientOptions });

  const files = rootDir.data.values;

  // TODO: Handle if file not exist
  const packageJsonFile = files.find(file => file.path === 'package.json');

  console.info('Fetching package.json file...')
  // TODO: Handle HTTP error
  const srcPackageJsonResponse = await client.repositories.readSrc({
    ...defaultClientOptions,
    commit: packageJsonFile.commit.hash,
    path: packageJsonFile.path
  });

  // TODO: Handle parse error
  const updatedPackageJson = updatePackageJson(JSON.parse(srcPackageJsonResponse.data));

  const branchName = `feature/package-json-upd-${new Date().getTime()}`;

  console.info(`Creating branch with name ${branchName}`);
  // TODO: Handle HTTP error
  const createdBranchResponse = await client.refs.createBranch({
    ...defaultClientOptions,
    _body: {
      name: branchName,
      target : {
        hash : 'master',
      }
    }
  });

  const fileFormData = new FormData();
  fileFormData.append('package.json', JSON.stringify(updatedPackageJson, null, 2));

  const fileCommitMessage = `feat: Modify package.json "${PACKAGE_NAME}" version to be "${PACKAGE_VERSION}"`;
  const fileCommitPayload = {
    ...defaultClientOptions,
    files: 'package.json',
    _body: fileFormData,
    branch: branchName,
    message: fileCommitMessage
  };

  console.info(`Creating file commit`)
  // TODO: Handle HTTP error
  await client.repositories.createSrcFileCommit(fileCommitPayload);

  console.info(`Creating pull request for branch ${createdBranchResponse.data.name} into master`);
  // TODO: Handle HTTP error
  await client.repositories.createPullRequest({
    ...defaultClientOptions,
    _body: {
      title: fileCommitMessage,
      source: {
        branch: {
          name: branchName
        }
      },
      destination: {
        branch: {
          name: 'master'
        }
      }
    }
  })

})();
