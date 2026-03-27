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

### 2.1 - Conventions

#### 2.1.1 - Tags

APInt utilities relevant to Telos Origin shall use the tags property protocol, and shall derive
their primary type from their first tag.

##### 2.1.1.1 - Bus Modules

Telos Origin shall, for any origin utility with the primary type "telos-module", import the
associated utility as a bus module or array of bus modules, and shall, on execution, mutually
connect them to the anchor bus module.

##### 2.1.1.2 - Telos Export

Telos Origin shall, for a APInt utility with the primary type "telos-export", import the associated
utility and assign it as the export value of the telos origin module if said module is imported
elsewhere.

If multiple telos export utilities are specified, they shall be exported together as a list.

##### 2.1.1.3 - Scripts

Telos Origin shall, for any APInt utility with the primary type "telos-install" or
"telos-uninstall", read an array of strings from its property field "script", and execute them in
the command line synchronously and in order upon installation or uninstallation of the utility
respectively.

##### 2.1.1.4 - APInt Folders

Telos Origin shall, for any APInt utility with the primary type "telos-folder", treat its content
as the path to a folder, called an APInt folder, the contents of which are to be interpreted as an
APInt, the top-level contents of which are to be added to the parent package of said telos folder
utility.

The APInt which overrides said utility is to be derived from the contents of said folder in the 
following manner:

A folder shall be interpreted as a package, with each of its sub-folders treated as a sub-package
of said package, and each of its files treated as a utility of said package. The sources of said
utilities shall be the global paths to the files they are derived from, and the aliases of both the
file-derived utilities and the folder-derived packages shall be the names of the items they are
derived from within the parent folders of said items.

The derived packages and utilities shall have properties derived from their aliases in the
following manner:

The aliases of both utilities and packages may be split by periods into subsections known as
chunks. The first and last chunks of utility aliases, and the first chunk of package aliases, shall
be alias chunks, with all other chunks being property chunks.

Said APInt elements shall derive alternate aliases from their first alias chunks, and for
utilities with two alias chunks, from the two joined by a period. Said alternate aliases shall be
encoded into said elements where applicable via the ID property protocol.

Each property chunk shall denote a property in the properties object of the element to which it is
attached. If the property chunk does not contain any hyphens, the property shall have the chunk's
content as its alias and a value of true. If the property chunk does contain hyphens, the property
shall have the chunk's content prior to the first hyphen as its alias, and shall have the chunk's
content following the first hyphen as its value. 

When reading the contents of such folders as described above, Telos Origin shall take [VSOs](https://github.com/Telos-Project/Virtual-System?tab=readme-ov-file#213---overlays)
into account.
    
###### 2.1.1.4.1 - Example

If you have the following file path:

    a/b.c/d.e.f-g.h

The APInt contents derived from it shall be:

    {
    	"packages": {
    		"a": {
    			"packages": {
    				"b.c": {
    					"utilities": {
    						"d.e.f-g.h": {
    							"source": "a/b.c/d.e.f-g.h",
    							"properties": {
    								"id": ["d", "d.h"],
    								"e": true,
    								"f": "g"
    							}
    						}
    					}
    				},
    				"properties": {
    					"c": true
    				}
    			}
    		}
    	}
    }

#### 2.1.2 - Initialization

On execution, an initialization call shall be made to the bus net using the stringified form of the
following object:

    {
    	content: { ... },
    	tags: ["telos-origin", "initialize"]
    }

The content object shall contain the content of the APInt used by the process.

If any arguments were passed to the process, a utility shall be added to the top level of the APInt
with the primary type "telos-arguments", along with the property "arguments" containing the
arguments as an ordered list, called the arguments list, of strings, in addition to the property
"options", containing an object, called the options object, of strings specifying any key-value
pairs present in the arguments.

If the APInt has utilities with the primary type "telos-argument", the contents of their own
options object, if present, shall be appended onto the options object generated for the current
process.

### 2.2 - Usage

#### 2.2.1 - Execution

#### 2.2.1.1 - CLI

The CLI implementation of Telos Origin is available on npm, and by extension on npx, under the
alias "telos-origin".

In the directory in which it runs, Telos Origin shall maintain an "APInt.json" file containing the
APInt it uses.

##### 2.2.1.1.1 - Execution

Telos Origin shall execute as a bus net application.

Every argument preceding the flag "-e" if said flag is present, and all arguments otherwise, shall
be interpreted as the alias or path to another APInt, which shall be temporarily loaded alongside
the local APInt for the duration of the process.

Every argument following the -e flag shall be counted as a command line argument, which shall be
appended in order to the arguments list. For each such argument beginning with a hyphen, the
argument sans said hyphen shall be assigned as a key to the options object, with the following
argument as the value mapped to said key. The first argument following the -e flag shall be called
the operation argument, and each successive argument shall be called a configuration argument.

#### 2.2.1.2 - Frontend

The frontend implementation of Telos Origin is available at the following link via
[GhostHost](https://github.com/Telos-Project/GhostHost):

    https://Telos-Project.github.io/GhostHost/?html=https://raw.githubusercontent.com/Telos-Project/Telos-Origin/refs/heads/main/Code/Frontend/telosOrigin.html

It shall have the path or alias of the APInt it is to load from specified via the URL argument
"apint".

All URL arguments shall be assigned to the options object.

#### 2.2.2 - Default APInt

By default, Telos Origin shall include its default APInt into the APInt specified the user.

##### 2.2.2.1 - Telos Folder

The folder "telos", if present in the directory in which Telos Origin is running, shall be marked
as an APInt folder.

##### 2.2.2.2 - Telos Engine

The Telos engine is a background process embedded in an associated bus module, which, by default,
is integrated into, but may be used independently of, Telos Origin.

One it has received the following stringified object via its query function:

    { tags: ["telos-engine-initiate"] }

Then the Telos engine, at regular intervals, shall call the bus net of Telos Origin with the
following stringified object:

    { tags: ["telos-engine"] }

The Telos engine also stores a reference to the APInt used by the process, which shall be returned
from the Telos engine bus module query function if the following object is passed to it:

    { tags: ["telos-configuration"] }

The default interval for the Telos engine is 60 times per second. This may be altered using a
number assigned to the "engine-interval" field in the options object.

##### 2.2.2.3 - Default Commands

###### 2.2.2.3.1 - Install

If the operation is specified as "install", Telos Origin shall interpret every following argument
as the path or alias to an APInt, shall load said APInt and integrate it with the local APInt file,
and shall run any installation scripts as specified by the "script-install" utilities in the loaded
APInts.

For a path rather than an alias, the alias in the resulting APInt shall trim everything prior to
and including the last slash, and then shall shall trim everything following and including the
first period, if slashes and periods are present in the path respectively.

###### 2.2.2.3.2 - Uninstall

If the operation is specified as "uninstall", Telos Origin shall interpret every following argument
as the alias of an APInt currently installed in the local APInt file, shall remove the
corresponding packages from said file, and shall run any uninstallation scripts as specified by the
"script-uninstall" utilities in the removed packages.

###### 2.2.2.3.3 - List

If the operation is specified as "list", Telos Origin shall log the alias of every installed APInt
package in the local APInt file to the console.

###### 2.2.2.3.4 - Set

If the operation is specified as "set", Telos Origin shall add a field to the options object with
the first configuration argument as the key and the second configuration argument as the value.