<div align="center">

# screeps-bot

My personal screeps bot, written from scratch. Use at your own risk!

</div>

<br><br>

## Build and Deploy

The project setup is simple: A bit of TypeScript here (type safety yay!), an automatic deploy script there - otherwise following the
standard Screeps setup. So keep in mind that files within `src` must remain in a flat hierarchy, no subfolders allowed. The deployment
destination path must be defined in the environment in order to prevent leaks of usernames or private server IPs / ports.

<br>

### Setup

Pre-requisites:

- The project is cloned to your local computer
- Node.js (incl. npm) is installed and available (tested with `14.x`)

First, install all dependencies by running:

```bash
npm run ci
```

Then, create a `.env` file within the project root folder (will be ignored by Git) and add the following contents (replacing variable values):

```bash
SCREEPS_DEPLOY_PATH=<PATH_TO_SCREEPS_SCRIPTS_SUBFOLDER>
```

For example:

```bash
SCREEPS_DEPLOY_PATH=C:/Users/<USERNAME>/AppData/Local/Screeps/scripts/<SERVER>/screeps-bot
```

<br>

### Build

Build the code (simple TypeScript -> JavaScript transpilation) by running:

```bash
npm run build
```

> Note: Build destination is the `dist` folder

<br>

### Deploy

Push the built code over to Screeps by running:

```bash
npm run deploy
```

Within Screeps, the new code will be active immediately. Make sure that "screeps-bot" is selected as the branch.
