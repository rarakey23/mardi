import chalk from "chalk";
import { exec } from "child_process";

const color = (text, color) => {
	return !color ? chalk.green(text) : color.startsWith("#") ? chalk.hex(color)(text) : chalk.keyword(color)(text);
};

const sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

const openBrowser = (url) => {
	exec(`start ${url}`);
}

export default { color, sleep, openBrowser };
