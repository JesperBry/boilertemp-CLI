import arg from "arg";
import inquirer from "inquirer";
//const arg = require("arg");
//const inquirer = require("inquirer");
import { createProject } from "./main.js";
import { helpMenu } from "./printMenus.js";
//const { createProject } = require("./main");
//const { helpMenu } = require("./printMenus");

function parseArgsToOptions(rawArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "--help": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    template: args._[0],
    runInstall: args["--install"] || false,
    help: args["--help"] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "MERN";
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];
  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose which project stack to use",
      choices: ["MERN", "ERN + MySQL"],
      default: defaultTemplate,
    });
  }

  questions.push({
    type: "confirm",
    name: "redux",
    message: "Do you want to add Redux to the selected template?",
    default: false,
  });

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Do you want to initialize git for this template?",
      default: false,
    });
  }

  const ans = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || ans.template,
    redux: ans.redux,
    git: options.git || ans.git,
  };
}

async function cli(args) {
  let options = parseArgsToOptions(args);
  if (!options.help) {
    options = await promptForMissingOptions(options);
    await createProject(options);
  } else {
    helpMenu();
  }
}

//module.exports.cli = cli;
export default cli;
