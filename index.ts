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
console.log("\n");
