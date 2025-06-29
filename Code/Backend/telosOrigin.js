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

	try {
		fs.writeFileSync(packagePath, JSON.stringify(package, null, "\t"));
	}

	catch(error) {

	}
}

let args = [].concat(process.argv);

if(!args.includes("-m") && !args.includes("-e"))
	args.push("-e");

if(args[2] == "-m") {

	if(package.packages == null)
		package.packages = { };

	let operation = args[3];
	let items = args.slice(4);

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

	if(operation == "install" || operation == "uninstall") {

		try {
			fs.writeFileSync(packagePath, JSON.stringify(package, null, "\t"));
		}

		catch(error) {
			
		}
	}

	if(operation == "list")
		console.log(Object.keys(package.packages).join("\n"));

	if(operation == "wrap") {

		try {

			let packagePath = `${process.cwd()}${path.sep}package.json`;
			let ignorePath = `${process.cwd()}${path.sep}.gitignore`;
			let telosPath = `${process.cwd()}${path.sep}telosOrigin.js`;

			let packageJSON = { };

			if(fs.existsSync(packagePath)) {

				packageJSON = JSON.parse(
					fs.readFileSync(packagePath, "utf-8")
				);
			}

			packageJSON.scripts =
				packageJSON.scripts != null ? packageJSON.scripts : { };

			packageJSON.scripts.start = "npm telosOrigin.js";

			if(!fs.existsSync(ignorePath)) {

				fs.writeFileSync(
					ignorePath, "node_modules/\npackage-lock.json"
				);
			}

			fs.writeFileSync(
				packagePath, JSON.stringify(packageJSON, null, "\t")
			);

			if(!fs.existsSync(telosPath)) {

				fs.writeFileSync(
					telosPath, fs.readFileSync(__filename, 'utf8')
				);
			}
		}

		catch(error) {
			
		}
	}
}

else if(args.includes("-e")) {

	let i = 2;
	 
	for(; i < args.length; i++) {
		
		if(args[i] == "-e")
			break;

		let alias = args[i];

		if(alias.includes("/")) {

			alias = alias.substring(alias.lastIndexOf("/") + 1);

			if(alias.indexOf(".") != -1)
				alias = alias.substring(0, alias.lastIndexOf("."));
		}

		package.packages[alias] = args[i];
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

	let options = {
		args: args.slice(i + 1),
		options: { },
	}

	apint.queryUtilities(
		package, null, { type: "telos-config" }
	).forEach(item => Object.assign(options.options, item.properties));

	options.args.forEach((item, index) => {

		if(item.startsWith("-") && index < options.args.length - 1)
			options.options[item.substring(1)] = options.args[index + 1];
	});

	busNet.call(JSON.stringify({
		content: { APInt: package, options: options },
		tags: ["telos-origin", "initialize"]
	}));
}

let telosExports = [];

apint.queryUtilities(
	package, null, { type: "telos-export" }
).forEach(item => {

	telosExports.push(use(
		Array.isArray(item.source) ? item.source[0] : item.source
	));
});

module.exports = telosExports.length == 1 ? telosExports[0] : telosExports;