#!/usr/bin/env node

function getLocalPackages(projectPath = process.cwd()) {

	let pkgPath = require("path").join(projectPath, "package.json");

	return !require("fs").existsSync(pkgPath) ?
		[] :
		Object.keys(
			JSON.parse(
				require("fs").readFileSync(pkgPath, "utf-8")
			).dependencies
		);
}

if(!getLocalPackages().includes("telos-origin"))
	require("child_process").execSync("npm install telos-origin");

require("telos-use-js");

var apint = use("apint");
var busNet = use("bus-net");
var fs = use("fs");
var path = use("path");
var virtualSystem = use("virtual-system");

function apintFolderInfo(name, folder) {

	name = name.includes(path.sep) ?
		name.substring(name.indexOf(path.sep) + 1) : name;

	let chunks = name.split(".");

	let value = {
		name,
		properties: chunks.length > 1 ?
			chunks.slice(1, chunks.length - (folder ? 0 : 1)).reduce(
				(value, chunk) => {

					value[chunk.includes("-") ? chunk.split("-")[0] : chunk] =
						chunk.includes("-") ?
							chunk.substring(chunk.indexOf("-") + 1) : true;

					return value;
				},
				{ }
			) :
			{ }
	};

	if(!folder && chunks.length > 1) {

		value.properties.id = [chunks[0]].concat(
			chunks.length > 2 ?
				[`${chunks[0]}.${chunks[chunks.length - 1]}`] : []
		);
	}

	return value;
}

function folderToAPInt(location, properties) {

	location = location.split(":\\").join("://").split("\\").join("/");
	properties = properties != null ? properties : { };

	let folder = virtualSystem.getResource(location);

	return {
		packages: Array.isArray(folder) ? folder[0].reduce((value, item) => {

			let info = apintFolderInfo(item, true);

			value[info.name] = folderToAPInt(
				location + "/" + item,
				Object.assign(
					JSON.parse(JSON.stringify(properties)), info.properties
				)
			);

			return value;
		}, { }) : { },
		utilities: Array.isArray(folder) ? folder[1].reduce((value, item) => {

			let info = apintFolderInfo(item);

			value[info.name] = {
				source: location + "/" + item,
				properties: Object.assign(properties, info.properties)
			};

			return value;
		}, { }) : { }
	};
}

function getByType(package, type) {

	return apint.queryUtilities(
		package,
		null,
		utility => Array.isArray(utility.properties?.tags) ?
			utility.properties?.tags?.indexOf(type) == 0 :
			utility.properties?.tags?.toLowerCase() == type.toLowerCase()
	);
}

virtualSystem.initiateVirtualSystemDefault();

let args = [
	"telos-origin/telosOrigin.json"
].concat(process.argv.slice(2));

let package = { packages: { }, utilities: { } };

try {

	package = Object.assign(
		package,
		JSON.parse(fs.readFileSync(
			`${process.cwd()}${path.sep}APInt.json`, "utf-8"
		))
	);
}

catch(error) {

}
	
args.slice(
	0, args.includes("-e") ? args.indexOf("-e") : args.length
).forEach(arg => {

	package.packages[
		arg.includes("/") ?
			arg.substring(arg.lastIndexOf("/") + 1).replace(
				/\.[^/.]+$/, ""
			) :
			arg
	] = arg;
});

package = apint.buildAPInt(package);

getByType(package, "telos-folder").forEach(item => {

	item = folderToAPInt(item.content);

	Object.assign(package.packages, item.packages);
	Object.assign(package.utilities, item.utilities);
});

let telosExports = getByType(package, "telos-export").map(
	item => use(Array.isArray(item.source) ? item.source[0] : item.source)
);

module.exports = telosExports.length == 1 ? telosExports[0] : telosExports;

if(require.main !== module)
	return;

let options = {
	arguments: args.slice(
		args.includes("-e") ? args.indexOf("-e") + 1 : 0
	),
	options: { }
};

options.arguments.forEach((item, index) => {

	if(item.startsWith("-") && index < options.arguments.length - 1)
		options.options[item.substring(1)] = options.arguments[index + 1];
});

getByType(package, "telos-argument").forEach(item => {
	Object.assign(options.options, item.properties.options);
});

package.utilities["telos-arguments"] = {
	properties: {
		tags: ["telos-arguments"],
		options
	}
};

getByType(package, "telos-module").forEach(item => {

	let busModules = item.content != null ?
		use(item.content, { dynamic: true }) :
		use(
			Array.isArray(item.source) ? item.source[0] : item.source
		);

	(Array.isArray(busModules) ? busModules : [busModules]).forEach(
		busModule => busNet.connect(busNet.anchor, busModule, null, true)
	);
});

busNet.call(JSON.stringify({
	content: package,
	tags: ["telos-origin", "initialize"]
}));