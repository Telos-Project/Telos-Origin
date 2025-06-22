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

			if(alias.startsWith("http://") || alias.startsWith("http://")) {

				alias = alias.substring(alias.lastIndexOf("/") + 1);

				if(alias.indexOf(".") != -1)
					alias = alias.substring(0, alias.lastIndexOf("."));
			}

			package[alias] = item;
			package = apint.buildAPInt(package);

			apint.queryUtilities(
				package, alias, { type: "script-install" }
			).forEach(script => {
				script.forEach(command => child_process.execSync(command));
			});
		});
	}

	if(operation == "uninstall") {

		items.forEach(item => {

			apint.queryUtilities(
				package, item, { type: "script-uninstall" }
			).forEach(script => {
				script.forEach(command => child_process.execSync(command));
			});

			delete package[item];
		});
	}

	if(operation == "install" || operation == "uninstall")
		fs.writeFileSync(packagePath, JSON.stringify(package, null, "\t"));

	if(operation == "list")
		console.log(Object.keys(package.packages).join("\n"));
}

if(process.argv[2] == "-e") {

	apint.queryUtilities(
		package, alias, { type: "bus-module" }
	).forEach(item => {
		busNet.connect(busNet.anchor, item, null, true);
	});

	busNet.call(JSON.stringify({
		tags: ["telos-origin", "initialize"], content: process.argv.slice(3)
	}));
}