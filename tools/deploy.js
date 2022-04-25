require('dotenv').config();

const del = require('del');
const copy = require('copy');

// Check pre-requisites
if (!process.env.SCREEPS_DEPLOY_PATH) {
  console.error('Environment variable "SCREEPS_DEPLOY_PATH" must be set.');
  process.exit;
}

// Run
const main = async () => {
  await del([process.env.SCREEPS_DEPLOY_PATH], { force: true });
  await new Promise((resolve, reject) => {
    copy('./src/*.js', process.env.SCREEPS_DEPLOY_PATH, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  console.log('Done!');
};
main();
