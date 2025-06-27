#!/usr/bin/env node

require("telos-use-js");

var apint = use("apint");
var busNet = use("bus-net");
var child_process = use("child_process");
var fs = use("fs");
var path = use("path");

let packagePath = `${process.cwd()}${path.sep}APInt.json`;
let package = null;

try {
	package = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
}

catch(error) {

	package = { packages: { } };

	fs.writeFileSync(packagePath, JSON.stringify(package, null, "\t"));
}

if(process.argv[2] == "-m") {

	if(package.packages == null)
		package.packages = { };

	let operation = process.argv[3];
	let items = process.argv.slice(4);

	if(operation == "install") {

		items.forEach(item => {

			let alias = item;

			if(alias.includes("/")) {

				alias = alias.substring(alias.lastIndexOf("/") + 1);

				if(alias.indexOf(".") != -1)
					alias = alias.substring(0, alias.lastIndexOf("."));
			}

			package.packages[alias] = item;
			package = apint.buildAPInt(package);

			apint.queryUtilities(
				package, alias, { type: "script-install" }
			).forEach(script => {

				script.properties.script.forEach(
					command => child_process.execSync(command)
				);
			});
		});
	}

	if(operation == "uninstall") {

		items.forEach(item => {

			apint.queryUtilities(
				package, item, { type: "script-uninstall" }
			).forEach(script => {

				script.properties.script.forEach(
					command => child_process.execSync(command)
				);
			});

			delete package.packages[item];
		});
	}

	if(operation == "install" || operation == "uninstall")
		fs.writeFileSync(packagePath, JSON.stringify(package, null, "\t"));

	if(operation == "list")
		console.log(Object.keys(package.packages).join("\n"));
}

if(process.argv.includes("-e")) {

	let i = 2;
	 
	for(; i < process.argv.length; i++) {
		
		if(process.argv[i] == "-e")
			break;

		let alias = process.argv[i];

		if(alias.includes("/")) {

			alias = alias.substring(alias.lastIndexOf("/") + 1);

			if(alias.indexOf(".") != -1)
				alias = alias.substring(0, alias.lastIndexOf("."));
		}

		package.packages[alias] = process.argv[i];
	}
	
	if(i > 2)
		package = apint.buildAPInt(package);

	apint.queryUtilities(
		package, null, { type: "bus-module" }
	).forEach(item => {

		let busModules = use(
			Array.isArray(item.source) ? item.source[0] : item.source
		);

		(Array.isArray(busModules) ? busModules : [busModules]).forEach(
			busModule => busNet.connect(busNet.anchor, busModule, null, true)
		);
	});

	busNet.call(JSON.stringify({
		content: {
			APInt: package,
			arguments: process.argv.slice(i + 1)
		},
		tags: ["telos-origin", "initialize"]
	}));
}