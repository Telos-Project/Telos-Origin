var apint = use("apint");
var busNet = use("bus-net");

function create(onStart, onUpdate) {

	return {
		query: (packet) => {

			try {

				if(!validatePacket(packet))
					return;

				packet = JSON.parse(packet);

				if(validatePacket(packet, ["telos-origin", "initialize"])) {

					if(onStart != null)
						onStart(packet.content);
				}

				else if(onUpdate != null)
					onUpdate(packet);
			}
			
			catch(error) {

			}
		}
	};
}

function createCommand(command, callback) {

	return create((package) => {

		let args = getArguments(package);

		if(args.operation == null)
			return;

		if(args.operation.toLowerCase() == command.toLowerCase())
			callback(package, args.arguments);
	});
}

function createEngine() {

	let argsRecord = null;
	let packetRecord = null;

	return {
		query: (packet) => {

			try {

				if(!validatePacket(packet))
					return;

				packet = JSON.parse(packet);

				if(validatePacket(packet, ["telos-origin", "initialize"])) {

					packetRecord = packet.content;

					argsRecord = getArguments(packet.content);
				}

				else if(validatePacket(packet, ["telos-engine-initiate"])) {

					setInterval(
						() => {

							busNet.call(
								JSON.stringify({ tags: ["telos-engine"] })
							);
						},
						1000 / (
							argsRecord?.options["engine-interval"] != null ?
								argsRecord.options["engine-interval"] : 60
						)
					);
				}

				else if(validatePacket(packet, ["telos-configuration"]))
					return packetRecord;
			}

			catch(error) {
				
			}
		}
	}
}

function createTask(rate, auto, callback) {

	let packageRecord = null;
	let delta = null;

	return create(
		(package) => {

			packageRecord = package;

			if(auto)
				initiateEngine();
		},
		(packet) => {

			if(!validatePacket(packet, ["telos-engine"]))
				return;

			let time = (new Date().getTime());
			
			delta = delta != null ? delta : time - (rate * 1000);

			if(time - delta >= rate * 1000) {

				delta = time;

				callback(packageRecord);
			}
		}
	);
}

function getAPInt() {

	return busNet.call(
		JSON.stringify({ tags: ["telos-configuration"] })
	)[0];
}

function getArguments(package) {

	package = package != null ? package : getAPInt();

	let options = apint.queryUtilities(
		package,
		null,
		utility =>  Array.isArray(utility.properties?.tags) ?
			utility.properties?.tags?.indexOf("telos-arguments") == 0 :
			utility.properties?.tags?.toLowerCase() == "telos-arguments"
	)[0]?.properties?.options;

	return {
		operation: options.arguments[0],
		arguments: options.arguments.slice(1),
		options: options.options
	};
}

function initiateEngine() {

	busNet.call(
		JSON.stringify({ tags: ["telos-engine-initiate"] })
	);
}

function validatePacket(packet, tags) {

	try {

		packet = typeof packet == "string" ? JSON.parse(packet) : packet;

		return tags == null ?
			true :
			tags[0] == packet.tags[0] &&
			JSON.stringify([].concat(packet.tags).sort()) ==
				JSON.stringify(tags.sort());
	}

	catch(error) {

	}

	return false;
}

module.exports = {
	create,
	createCommand,
	createEngine,
	createTask,
	getAPInt,
	getArguments,
	initiateEngine,
	validatePacket
};