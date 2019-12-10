const chalk = require("chalk");
const fs = require("fs");
const ncp = require("ncp");
const path = require("path");
const { promisify } = require("util");
const shell = require("shelljs");
const Listr = require("listr");
const { projectInstall } = require("pkg-install");
const execa = require("execa");

const { cmdPrints } = require("./printMenus.js");
const templateFiles = require("./templates/reduxTemplateFiles.js");

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(options.templateDir, options.targetDir, {
    clobber: false
  });
}

async function CreateClient() {
  let success = await createReactApp();
  if (!success) {
    console.error(
      "%s Something went wrong while trying to create a new React app using create-react-app",
      chalk.red.bold("ERROR")
    );
    process.exit(1);
    return false;
  }
}

// Creates client from create-react-app
function createReactApp() {
  return new Promise(resolve => {
    shell.exec("npx create-react-app client --use-npm", () => {
      console.log("%s created client", chalk.green.bold("DONE"));
      resolve(true);
    });
  });
}

// Installing Redux dependencies
async function installReduxPkg(dir) {
  return new Promise(resolve => {
    shell
      .cd(path.join(dir, "/client"))
      .exec(`npm install --save redux react-redux redux-thunk`, () => {
        console.log(
          "%s installed Redux dependencies",
          chalk.green.bold("DONE")
        );
        resolve();
      });
  });
}

async function updateReduxFiles(dir) {
  return new Promise(resolve => {
    let promises = [];
    Object.keys(templateFiles).forEach((fileName, i) => {
      promises[i] = new Promise(res => {
        fs.writeFile(
          path.join(dir, `/client/src/${fileName}`),
          templateFiles[fileName],
          function(err) {
            if (err) {
              return console.log(err);
            }
            res();
          }
        );
      });
    });
    Promise.all(promises).then(() => {
      resolve();
    });
  });
}

async function setUpRedux(options) {
  await installReduxPkg(options);
  await updateReduxFiles(options);
}

// init git for project
async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDir
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
}

// Creates the project
exports.createProject = async function(options) {
  options = {
    ...options,
    targetDir: options.targetDir || process.cwd()
  };

  const currentFileUrl = path.dirname(__filename);
  const templateDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    "./templates",
    options.template.toLowerCase()
  );
  options.templateDir = templateDirectory;

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
      task: () => projectInstall({ cwd: options.targetDir, prefer: "npm" })
    },
    {
      title: "Installing client dependencies",
      task: () =>
        projectInstall({
          cwd: path.join(options.targetDir, "/client"),
          prefer: "npm"
        })
    }
  ]);

  console.log("\n");
  const tasks = new Listr([
    // {
    //   title: "Created react-app",
    //   task: () => CreateClient()
    // },
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options)
    },
    // {
    //   title: "Adding Redux to project",
    //   task: () => setUpRedux(options.targetDir),
    //   enabled: () => options.template.includes("Redux")
    // },
    {
      title: "Initialized git for project",
      task: () => initGit(options),
      enabled: () => options.git
    },
    {
      title: "Installing dependencies",
      task: () => installSubTasks,
      skip: () =>
        !options.runInstall
          ? "Pass --install to automatically install dependencies"
          : undefined
    }
  ]);

  await tasks.run();
  console.log("\n %s Project ready \n", chalk.green.bold("DONE"));
  cmdPrints();
  return true;
};
