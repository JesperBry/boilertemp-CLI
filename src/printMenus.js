//const chalk = require("chalk");
import chalk from "chalk";

export const cmdPrints = function () {
  console.log("\n Inside this directory, you can run several commands: \n");
  console.log(
    "\t %s \t\t Run the dev environment (server + client) \n",
    chalk.cyan("npm run dev")
  );
  console.log("\t %s \t Start the server \n", chalk.cyan("npm run server"));
  console.log("\t %s \t Start the client \n", chalk.cyan("npm run client"));
  console.log(
    "\t %s \t Updates all dependencies for client and server \n",
    chalk.cyan("npm run update-all")
  );
  console.log(
    "\t %s \t Install dependencies for both client and server \n",
    chalk.cyan("npm run install-both")
  );
};

export const helpMenu = function () {
  console.log("\n Available arguments: \n");
  console.log(
    "\t %s \t\t Use default and accepting all questions \n",
    chalk.cyan("--yes")
  );
  console.log(
    "\t %s \t\t Initialize git for selected template \n",
    chalk.cyan("--git")
  );
  console.log(
    "\t %s \t Automatically install dependencies, prefer using npm \n",
    chalk.cyan("--install")
  );
};
