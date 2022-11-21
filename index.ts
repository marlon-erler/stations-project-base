#! /usr/bin/env node

//IMPORTS
import Cp from "child_process";
import Fs from "fs/promises";
import Path from "path";
import Readline from "readline/promises";

//DATA
let configuration: { [field: string]: any }

//MAIN
async function startup() {
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
	configuration = {};
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

	startCLI();
}

async function spawn(pointer: Cp.ChildProcess | undefined, command: string, write: (output: string) => void): Promise<void> {
	return new Promise(res => {
		try {
			let words = command.split(" ");
			let command_name = words.splice(0, 1)[0];
			let shell_command_name = configuration.commands[command_name];
			let command_content = words.join(" ");

			if (shell_command_name == null) {
				write("e1\n");
				return res();
			} 

			command = shell_command_name + " " + command_content;

			let cwd = "Modules"; 
			pointer = Cp.spawn(command, [], { shell: true, cwd: cwd});
			pointer.stdout?.setEncoding("utf8");
			pointer.stderr?.setEncoding("utf8");

			pointer.stdout?.on("data", data => {
				//capture @-flags
				switch (data[0]) {
					case "@": {
						parseFlaggedOutput(data, pointer!);
						break;
					}
					default: {
						write(data);
					}
				}
			});
			pointer.stderr?.on("data", data => {
				write(data);
			});
			pointer.on("exit", () => {
				return res();
			});
		} catch {
			write("e2\n");
			return res();
		}
	});
}

function parseFlaggedOutput(command: string, old_process: Cp.ChildProcess) {
	let words = command.split(" ");
	let flag = words.splice(0, 1)[0];
	let message = words.join(" ");

	switch (flag) {
		case "@exec": {
			//spawn new process and forward stdout
			let new_process: Cp.ChildProcess | undefined;
			spawn(new_process, message, output => {
				old_process.stdin?.write(output);
			});
		}
	}
} 

async function startCLI() {
	let CLI = Readline.createInterface(process.stdin, process.stdout);
	let current_process: Cp.ChildProcess | undefined;

	while (true) {
		let command = await CLI.question("> ");
		await spawn(current_process, command, output => {
			process.stdout.write(output);
		});
		current_process = undefined;
	}
}

//STARTUP
await startup();
