// const chalk = require("chalk");
// const fs = require("fs");
// const ncp = require("ncp");
// const path = require("path");
// const { promisify } = require("util");
// const shell = require("shelljs");
// const Listr = require("listr");
// const { projectInstall } = require("pkg-install");
// const execa = require("execa");

// const { cmdPrints } = require("./printMenus.js");

import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import Listr from "listr";
import { projectInstall } from "pkg-install";
import execa from "execa";
import { fileURLToPath } from "url";

import { cmdPrints } from "./printMenus.js";

const access = promisify(fs.access);
const copy = promisify(ncp);
const __filename = fileURLToPath(import.meta.url);

async function copyTemplateFiles(options) {
  const templateFiles = copy(options.clientDir, options.targetDir, {
    clobber: false,
  }).then(
    copy(options.templateDir, options.targetDir, {
      clobber: false,
    })
  );
  return templateFiles;
}

async function copyReduxFiles(options) {
  const reduxFiles = copy(
    path.join(options.reduxDir, "pkg"),
    path.join(options.targetDir, "client"),
    { clobber: true }
  ).then(
    copy(
      path.join(options.reduxDir, "structure"),
      path.join(options.targetDir, "client", "src"),
      { clobber: true }
    )
  );
  return reduxFiles;
}

// init git for project
async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDir,
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
}

// Creates the project
export const createProject = async function (options) {
  options = {
    ...options,
    targetDir: options.targetDir || process.cwd(),
  };

  const currentFileUrl = path.dirname(__filename);

  const clientDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    "./templates/cra"
  );

  const templateDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    "./templates",
    options.template.toLowerCase()
  );

  const reduxDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    "./templates/redux"
  );

  options.templateDir = templateDirectory;
  options.clientDir = clientDirectory;
  options.reduxDir = reduxDirectory;

  try {
    await access(templateDirectory, fs.constants.R_OK); // Check if the specified template is available
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  // Task list in the cli
  const installSubTasks = new Listr([
    {
      title: "Installing server dependencies",
      task: () => projectInstall({ cwd: options.targetDir, prefer: "npm" }),
    },
    {
      title: "Installing client dependencies",
      task: () =>
        projectInstall({
          cwd: path.join(options.targetDir, "/client"),
          prefer: "npm",
        }),
    },
  ]);

  console.log("\n");
  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Adding Redux to client",
      task: () => copyReduxFiles(options),
      enabled: () => options.redux,
    },
    {
      title: "Initialized git for project",
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: "Installing dependencies",
      task: () => installSubTasks,
      skip: () =>
        !options.runInstall
          ? "Pass --install to automatically install dependencies"
          : undefined,
    },
  ]);

  await tasks.run();
  console.log("\n %s Project ready \n", chalk.green.bold("DONE"));
  cmdPrints();
  return true;
};
