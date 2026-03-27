var apint = use("apint");
var fs = require("fs");
var path = require("path");
var telosUtils = require("./telosUtils.js");

function createUtility(command, write, callback) {

	return telosUtils.createCommand(command, (package, args) => {

		try {

			package = JSON.parse(fs.readFileSync(
				`${process.cwd()}${path.sep}APInt.json`, "utf-8"
			));
		}

		catch(error) {
			package = { };
		}

		package = Object.assign({ packages: { }, utilities: { } }, package);

		package = callback(package, args);

		if(!write)
			return;
		
		try {

			fs.writeFileSync(
				`${process.cwd()}${path.sep}APInt.json`,
				JSON.stringify(package, null, "\t")
			);
		}

		catch(error) {
			
		}
	});
}

module.exports = [
	telosUtils.createEngine(),
	createUtility("install", true, (package, args) => {

		args.forEach(item => {

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

		return package;
	}),
	createUtility("uninstall", true, (package, args) => {

		args.forEach(item => {

			apint.queryUtilities(
				package, item, { type: "script-uninstall" }
			).forEach(script => {

				script.properties.script.forEach(
					command => child_process.execSync(command)
				);
			});

			delete package.packages[item];
		});

		return package;
	}),
	createUtility("list", false, (package, args) => {

		console.log(Object.keys(package.packages).filter(
			item => item != "telos-origin"
		).join("\n"));
	}),
	createUtility("set", true, (package, args) => {

		let property = {
			properties: {
				options: { },
				tags: ["telos-argument"]
			}
		};

		property.properties.options[args[0]] = args[1];

		package.utilities[`telos-property-${args[0]}`] = property;

		return package;
	})
];