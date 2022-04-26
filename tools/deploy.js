require('dotenv').config();

const del = require('del');
const copyfiles = require('copyfiles');

console.log('Deploying screeps bot ...');

// Check pre-requisites
if (!process.env.SCREEPS_DEPLOY_PATH) {
  console.error('[ERROR] Environment variable "SCREEPS_DEPLOY_PATH" must be set (e.g. within a ".env" file).');
  process.exit(1);
}

// Run
Promise.resolve()
  // Cleanup deploy destination
  .then(() => {
    return del([process.env.SCREEPS_DEPLOY_PATH], { force: true });
  })
  // Copy build files to deploy destination
  .then(() => {
    return new Promise((resolve, reject) => {
      copyfiles(['./dist/*.js', process.env.SCREEPS_DEPLOY_PATH], { up: 1 }, (error) => {
        if (error) {
          reject(error.message);
        }
        resolve();
      });
    });
  })
  .then(() => {
    console.log('[SUCCESS] Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('[ERROR] An error occured:', error.message);
    process.exit(1);
  });
