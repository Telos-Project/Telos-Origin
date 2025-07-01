# Telos Origin

## 1 - Abstract

***Locked and Loaded.***

Telos Origin is an [APInt](https://github.com/Telos-Project/APInt) portal which loads plugins
listed in an environmental APInt into a [bus net](https://github.com/Telos-Project/Bus-Net) based
application.

If using a CLI, the application shall allow the user to install and uninstall APInts as
sub-packages of the common APInt.

In this manner, it acts as a bootstrapping platform for an innumerable variety of highly complex
and modular applications.

## 2 - Contents

### 2.1 - APInt Property Protocols

The properties of all APInt utilities relavent to Telos Origin shall have the field "type",
containing a string.

#### 2.1.1 - Bus Modules

Telos Origin shall, for any APInt utility with the type "bus-module", import the associated utility
as a bus module or array or bus modules, and shall, on execution, mutually connect them to the
anchor bus module.

#### 2.1.2 - Telos Config

On execution, an initialization call shall be made to the bus net using the stringified form of the
following object:

    {
    	content: { APInt: { ... }, options: { args: [ ... ], options: { ... } } },
    	tags: ["telos-origin", "initialize"]
    }

The content.APInt object shall contain the content of the APInt used by the process.

Telos Origin shall, for any APInt utility with the type "telos-config", assign its properties to
the content.options.options object.

#### 2.1.3 - Telos Export

Telos Origin shall, for a APInt utility with the type "telos-export", import the associated utility
and assign it as the export value of the telos origin module if said module is imported elsewhere.
If multiple telos export utilities are specified, they shall be exported together as a list.

#### 2.1.4 - Scripts

Telos Origin shall, for any APInt utility with the type "script-install" or "script-uninstall",
read an array of strings from its property field "script", and execute them in the command line
synchronously and in order upon installation or uninstallation of the utility respectively.

### 2.2 - Usage

#### 2.2.1 - CLI

The CLI implementation of Telos Origin is available on npm, and by extension on npx, under the
alias "telos-origin".

In the directory in which it runs, Telos Origin shall maintain an "APInt.json" file containing the
APInt it uses.

##### 2.2.1.1 - Execution

Telos Origin shall execute as a bus net application if executed with the flag "-e" in its command
line arguments.

Every argument before the -e flag shall be interpreted as the alias or path to another APInt, which
shall be temporarily loaded alongside the local APInt for the duration of the process.

Every argument following the -e flag shall be counted as a command line argument, which shall be
appended in order to the content.options.args list in the initialization call object. For each such
argument beginning with a hyphen, the argument sans said hyphen shall be assigned as a key to the
content.options.options field of said initialization object, with the following argument as the
value mapped to said key.

Alternatively, if run with no command line arguments, Telos Origin shall execute as though it were
run solely with the -e flag.

##### 2.2.1.2 - Management

If executed with the flag "-m", Telos Origin shall execute a management operation based on the
argument following said flag, with each argument after that being passed to the operation.

###### 2.2.1.2.1 - Install

If the operation is specified as "install", it shall interpret every following argument as the path
or alias to an APInt, and shall load said APInt and integrate it with the local APInt file, and
shall run any installation scripts as specified by the "script-install" utilities in the loaded
APInts.

For a path rather than an alias, the alias in the resulting APInt shall trim everything prior to
and including the last slash, and then shall shall trim everything following and including the
first period, if slashes and periods are present in the path respectively.

###### 2.2.1.2.2 - Uninstall

If the operation is specified as "uninstall", it shall interpret every following argument as the
alias of an APInt currently installed in the local APInt file, and shall remove the corresponding
packages from said file, and shall run any uninstallation scripts as specified by the
"script-uninstall" utilities in the removed packages.

###### 2.2.1.2.3 - List

If the operation is specified as "list", it shall log the alias of every installed APInt package in
the local APInt file to the console.

###### 2.2.1.2.4 - Wrap

If the operation is specified as "wrap", it shall load into the current directory the telosOrigin
script if it is not already present, along with a gitignore file for the node modules folder and
the package lock file, and shall make modifications to the package.json file, such that the folder
is rendered suitable for deployment on cloud hosting platforms.

#### 2.2.2 - Frontend

The frontend implementation of Telos Origin is available at the following link via
[GhostHost](https://github.com/Telos-Project/GhostHost):

    https://Telos-Project.github.io/GhostHost/?html=https://raw.githubusercontent.com/Telos-Project/Telos-Origin/refs/heads/main/Code/Frontend/telosOrigin.html

It shall have the path or alias of the APInt it is to load from specified via the URL argument
"apint".

All URL arguments shall be assigned to the content.options.options field of the initialization call
object.