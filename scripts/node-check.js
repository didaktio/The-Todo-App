#! /usr/bin/env node

'use strict'

const fs = require('fs'),
    path = require('path'),
    chalk = require('chalk');


fs.readFile(path.join(__dirname, '../.nvmrc'), 'utf8', (error, data) => {

    if (error) throw error;

    const expectedVersion = data.trim(),
        currentVersion = process.version.replace('v', ''),
        versionMatchesExactly = expectedVersion === currentVersion,
        versionMatchesMajor = expectedVersion.split('.')[0] === currentVersion.split('.')[0];

    if (versionMatchesExactly) process.exit();

    const nvmInstallText = chalk.white.bold.bgRed('Node Version Manager (nvm) is a great tool for this. Visit (https://github.com/nvm-sh/nvm) for further instructions.');

    // If partial match, post a warning
    if (versionMatchesMajor) {
        console.error(chalk.yellow(`You are using Node ${currentVersion}, which is not recommended. You may encounter issues. To avoid this, install and use Node ${expectedVersion}.`));
        process.exit();
    }

    // Else log error and instructions, and exit with failure code
    console.error(chalk.white.bold.bgRed(`Node ${currentVersion} is not supported. Please install and use Node ${expectedVersion}.`));
    console.error(nvmInstallText);
    process.exit(1);
});