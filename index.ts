#! /usr/bin/env node

//IMPORTS
import Fs from "fs/promises";
import Path from "path";

//UTILITY
async function ask(question: string): Promise<string> {
	return new Promise(res => {
		console.log(question);
		process.stdin.once("data", data => {
			res(data.toString());
		});
	});
}

//FILE SYSTEM
//create nessecary folders
let folders_to_create = [
	"../Modules",

	"Base",

	"Frontend",
	"Frontend/Applications",
	"Frontend/Start",
	"Frontend/Themes",
];

let i = 0;
while (i < folders_to_create.length) {
	console.log("Checking folder %i of %i...", i + 1, folders_to_create.length);
	let path = Path.join("Modules", folders_to_create[i]);

	try {
		await Fs.mkdir(path);
		console.log("OK:\tCreated folder '%s'.", path);
	}
	catch {
		console.log("WARN:\tDid not create '%s'.", path);
	}

	try {
		await Fs.stat(path);
		console.log("OK:\t'%s' exists.", path);
	} catch {
		console.error("ERR:\t'%s' does not exist.", path);
		process.exit();
	}

	i++;
}
console.log("");

//CONFIGURATION
let configuration_path = "Modules/Base/config.json";
let configuration: { [field: string]: any } = {};
let configuration_default: typeof configuration = {
	name: {
		en: "Untitled Station",
	},
	greeting: {
		en: "Welcome!",
	},
	number: 1,

	commands: {},
	groups: {},
	entry_permits: [],
};

//get configuration
try {
	let configuration_text = await Fs.readFile(configuration_path, {encoding: "utf8"});

	try {
		configuration = JSON.parse(configuration_text);

		//make sure number does not contain a zero
		if (configuration.number.toString().split("").includes("0")) {;
			console.error("ERR:\tStation number cannot contain a zero.");
			process.exit()
		}
	} catch {
		console.log("ERR:\tFailed to parse configuration file.");
		process.exit();
	}
} catch {
	await Fs.writeFile(configuration_path, JSON.stringify(configuration_default, null, 4));
	console.log("Created configuration file at '%s'. \nWARN\tPlease edit the configuration file before using this station.", configuration_path);
	process.exit();
}

console.log(configuration.greeting.en);
