/*
 * Sixty-Four Mod: Console
 *
 * https://sixtyfour.game-vault.net/wiki/Modding:Index
 *
 * ----------------------------------------------
 *
 * REQUIRES THE MOD AUTOLOADER
 * See https://gist.github.com/NamelessCoder/26be6b5db7480de09f9dfb9e80dee3fe#file-_readme-md
 *
 * ----------------------------------------------
 *
 * Adds a console feature to the game. Pressing "C" while in the game
 * opens the console. Type "help" to get a list of supported commands.
 * Type "help command" (for example: "help give") to get a description
 * of what a given command can do.
 */

import type { Cell, EntityCodexEntry } from '../game';
import type { Mod } from '../mod';

class GameConsole {
	protected toggleTrigger = 'keyup';
	protected submitTrigger = 'keydown';
	protected element = document.createElement('input');
	protected help = document.createElement('div');
	protected historyIndex = 0;
	protected history = [];
	constructor(public game: Game) {
		this.element.id = 'console';

		this.help.id = 'console-help';
	}

	show(e) {
		if (game.splash.isShown) {
			return;
		}
		e.stopImmediatePropagation();
		//e.preventDefault();
		if (e.key !== 'c' && e.key !== 'Enter') {
			return;
		}

		globalThis.game_console.element.style.display = 'initial';
		globalThis.game_console.element.focus();
	}

	showHelp(which: string, data?: string[]) {
		this.help.innerHTML = `
            <h2>Console Help</h2>
            <em>Click anywhere inside me to close</em>
        `;

		if (typeof this.helpTexts[which] === 'undefined') {
			this.help.innerHTML += '<h4>Unknown command: <code>' + which + '</code></h4>';
		} else {
			let text = this.helpTexts[which];
			if (typeof data === 'object' && data.length > 0) {
				for (const index in data) {
					text = text.replace('%' + index, data[index]);
				}
			}
			this.help.innerHTML += text;
		}

		this.help.style.display = 'block';
	}

	hide() {
		this.element.blur();
		this.element.style.display = 'none';
	}

	hideHelp() {
		globalThis.game_console.help.style.display = 'none';
	}

	submit(e) {
		e.stopImmediatePropagation();
		//e.preventDefault();

		if (e.key == 'Escape') {
			globalThis.game_console.hide();
		} else if (e.key == 'ArrowUp') {
			--globalThis.game_console.historyIndex;
			if (globalThis.game_console.historyIndex < 0) {
				globalThis.game_console.historyIndex = 0;
			}
			globalThis.game_console.recall();
		} else if (e.key == 'ArrowDown') {
			++globalThis.game_console.historyIndex;
			if (globalThis.game_console.historyIndex <= globalThis.game_console.history.length - 1) {
				globalThis.game_console.recall();
			} else if (globalThis.game_console.historyIndex == globalThis.game_console.history.length) {
				globalThis.game_console.element.value = '';
			} else if (globalThis.game_console.historyIndex > globalThis.game_console.history.length) {
				globalThis.game_console.historyIndex = globalThis.game_console.history.length;
			}
		} else if (e.key == 'Enter') {
			//console.log("console submitted");
			let value = globalThis.game_console.element.value;
			if (value !== globalThis.game_console.history[globalThis.game_console.history.length - 1]) {
				globalThis.game_console.history.push(value);
				globalThis.game_console.historyIndex = globalThis.game_console.history.length;
			}
			globalThis.game_console.commands.perform(value);
		}
	}

	recall() {
		if (typeof this.history[this.historyIndex] !== 'undefined') {
			this.element.value = this.history[this.historyIndex];
		} else {
			this.element.value = '';
		}
	}

	attach() {
		document.body.appendChild(this.help);
		document.body.appendChild(this.element);
		addEventListener(this.toggleTrigger, this.show);
		this.element.addEventListener(this.submitTrigger, this.submit);
		this.help.addEventListener('click', this.hideHelp);

		globalThis.game_console = this;

		if (typeof game !== 'undefined') {
			game.game_console = this;
		}

		game_console.log('Console attached');
	}

	helpTexts = {
		unknown: `
            <h4>Unknown command: <code>%0</code></h4>
        `,
		error: `
            <h4>Command error: <code>%0</code></h4>
        `,
		global: `
            <h4>Usage</h4>
            <ul>
                <li>Press <code>c</code> or <code>Enter</code> to open or focus the console field.</li>
                <li>Press <code>Enter</code> in console field to execute the command.</li>
                <li>Press <code>Escape</code> in console field to close without running command.</li>
                <li>Press <code>ArrowUp</code> to select the previously entered command(s).</li>
                <li>
                    Press <code>ArrowDown</code> to select the next command when browsing through
                    previously entered commands.
                </li>
            </ul>
            <h4>Commands</h4>
            <ul>
                <li>
                    <code>help</code>
                    <p>Shows this help text.</p>
                </li>
                <li>
                    <code>help $command</code>
                    <p>Shows help for specific command, e.g. <code>help give</code>.</p>
                </li>
                <li>
                    <code>give $resource $amount</code>
                    <p>
                        Adds amount of resources. Resource type $resource (1-10) and $amount either
                        a whole number or a shortened number like <code>100K</code> or <code>1M</code> etc.
                    </p>
                </li>
                <li>
                    <code>take $resource $amount</code>
                    <p>
                        Adds amount of resources. Resource type $resource (1-10) and $amount either
                        a whole number or a shortened number like <code>100K</code> or <code>1M</code> etc.
                    </p>
                </li>
                <li>
                    <code>zoom $level</code>
                    <p>
                        Zooms in or out, not constrained by usual limits. Level must be more than zero,
                        lower values means zoomed further out. Decimal values between <code>1</code> and
                        <code>0</code> zoom out from default level (lower = more zoomed out). E.g.
                        <code>0.5</code> is zoomed out twice as much as default view.
                    </p>
                </li>
                <li>
                    <code>coords</code>
                    <p>Copies the grid position X,Y coordinates to clipboard.</p>
                </li>
                <li>
                    <code>export</code>
                    <p>
                        Exports the current game data as encoded data to clipboard (same as using "export" 
                        from the main menu).
                    </p>
                </li>
                <li>
                    <code>import</code>
                    <p>
                        Imports the current game data from clipboard (same as using "import" from the main menu).
                    </p>
                </li>
                <li>
                    <code>place $building [$coordinates]</code>
                    <p>
                        Places a building of type <code>$building</code> at coordinates <code>$coordinates</code>.
                        If <code>$coordinates</code> is omitted, places the building at the tile hovered with mouse.
                    </p>
                </li>
                <li>
                    <code>blank</code>
                    <p>
                        Removes all GUI elements. Repeat the command to show the elements again.
                    </p>
                </li>
                <li>
                    <code>reload</code>
                    <p>
                        Reloads the game, returning you to the main menu and resetting pan/zoom positions.
                    </p>
                </li>
                <li>
                    <code>tp</code>
                    <p>
                        Teleports you to the desired location, either coordinates or entity name. If entity name,
                        teleports you to the last built building with that name.
                    </p>
                </li>
                <li>
                    <code>depth</code>
                    <p>
                        Sets the depth of the currently hovered channel. Example: <code>depth 1000</code> to set
                        depth to 1000 meters, or <code>depth 10k</code> to set the depth to 10,000 meters.
                    </p>
                </li>
            </ul>
        `,
		give: `
            <h4>Command: <code>give $resource amount</code>
            <p>
                Adds resources of the specified type in the specified amount. Resource type is
                a number <code>1-10</code> or <code>all</code> and amount can be either whole numbers
                or shortened numbers, e.g. <code>100000</code> and <code>100K</code> both mean
                "one hundred thousand".
            </p>
            <p>
                Valid shortened suffixes are: K, M, B and T.
            </p>
        `,
		take: `
            <h4>Command: <code>take $resource $amount</code>
            <p>
                Subtracts resources of the specified type in the specified amount. Resource type is
                a number <code>1-10</code> or <code>all</code> and amount can be either whole numbers
                or shortened numbers, e.g. <code>100000</code> and <code>100K</code> both mean
                "one hundred thousand".
            </p>
            <p>
                Valid shortened suffixes are: K, M, B and T.
            </p>
        `,
		zoom: `
            <h4>Command: <code>zoom $level</code>
            <p>
                Unconstrained zoom. Capable of zooming in or out further than is possible with the
                mouse wheel. <code>$level</code> must be greater than zero, lower values means zoomed
                further out.
            </p>
        `,
		coords: `
            <h4>Command: <code>coords</code>
            <p>
                Copies the grid position X,Y coordinates to clipboard.
            </p>
        `,
		export: `
            <h4>Command: <code>export</code>
            <p>
                Exports the current game data as encoded data to clipboard (same as using "export" from
                the main menu).
            </p>
        `,
		import: `
            <h4>Command: <code>import</code>
            <p>
                Imports the current game data from clipboard (same as using "import" from the main menu).
            </p>
        `,
		place: `
            <h4>Command: <code>place $building [$coordinates]</code>
            <p>
                Places a structure of the given type and the given coordinates, without subtracting the
                resource cost. Example: <cpde>place gradient 10,2</code> places a Gradient Well at
                coordinates x=10, y=2. Tip: coordinates of mouse pointer can be copied to clipboard with
                the <code>coords</code> command and pasted as <code>$coordinates</code> of this command.
                If coordinates are not provided the building is placed in the currently hovered tile.
            </p>
            <ul>
                <li>Can only place structures which can be bought.</li>
                <li>Cannot place structures that are one-only and which already exists on the game field.</li>
                <li>
                    Can place structures that are upgrades for lower tier structures without the lower tier
                    structure being present.
                </li>
            </ul>
            <p>
                Valid building names:
            </p>
            <ol>
                %0
            </ol>
        `,
		blank: `
            <h4>Command: <code>blank</code>
            <p>
                Removes all GUI elements. Repeat the command to show the elements again.
            </p>
        `,
		reload: `
            <h4>Command: <code>reload</code>
            <p>
                Reloads the game, returning you to the main menu and resetting pan/zoom positions.
            </p>
        `,
		tp: `
            <h4>Command: <code>tp $location</code>
            <p>
                Teleports you to the specified location. The location can be either an <code>x,y</code>
                coordinate or the name of an entity. If there is more than one entity with the given name,
                you will be teleported to the last-built entity of that type.
            </p>
            <p>
                Valid entity names:
            </p>
            <ol>
                %0
            </ol>
        `,
		depth: `
            <h4>Command: <code>depth</code>
            <p>
                Sets the depth of the currently hovered channel. Example: <code>depth 1000</code> to set
                depth to 1000 meters, or <code>depth 10k</code> to set the depth to 10,000 meters.
            </p>
        `,
	};
}

const commands = {
	perform(value: string) {
		//console.log("asked to perform: " + value);
		let parts = value.split(' ');

		if (!parts.length) {
			return;
		}

		switch (parts[0]) {
			default:
				if (typeof [parts[0]] !== 'function') {
					game_console.showHelp('unknown', parts);
				} else {
					[parts[0]].call(this, ...parts.slice(1));
				}
				break;
			case 'help':
				if (typeof parts[1] === 'undefined') {
					// Show global help
					game_console.showHelp('global');
				} else {
					// Show help for specific command
					let html = '';
					let data = [];
					switch (parts[1]) {
						case 'place':
							let buildables = this.collectEntities(true);
							for (const entityName in buildables) {
								let entity = buildables[entityName];
								if (entity.onlyone && game.onlyones[entityName]) {
									continue;
								}
								html += '<li>' + entityName + '</li>';
							}
							break;
						case 'tp':
							let entities = this.collectEntities(false);
							for (const entityName in entities) {
								html += '<li>' + entityName + '</li>';
							}
							break;
					}
					data.push(html);
					game_console.showHelp(parts[1], data);
				}
				break;
		}
	},

	give(resourceIndex: string | number, amount: number | string) {
		if (typeof resourceIndex === 'undefined') {
			game_console.showHelp('error', 'Command requires a resource index');
			return;
		}
		if (typeof amount === 'undefined') {
			game_console.showHelp('error', 'Command requires an amount');
			return;
		}
		if (resourceIndex !== 'all' && typeof game.resources[parseInt(resourceIndex.toString()) - 1] === 'undefined') {
			game_console.showHelp('error', 'Command requires a valid resource index (1-10)');
			return;
		}

		let newAmount = 0;
		let storage = typeof game.quantities !== 'undefined' ? game.quantities : game.resources;
		amount = this.expandNumber(amount);
		if (resourceIndex === 'all') {
			for (const i in storage) {
				storage[i] += amount;
				if (storage[i] < 0) {
					storage[i] = 0;
				}
			}
		} else {
			resourceIndex = parseInt(resourceIndex.toString()) - 1;
			storage[resourceIndex] += amount;
			if (storage[resourceIndex] < 0) {
				storage[resourceIndex] = 0;
			}
		}
	},

	take(resourceIndex: string | number, amount: number) {
		this.give(resourceIndex, '-' + amount);
	},

	zoom(newZoom: string) {
		if (+newZoom < 0.00001) {
			// Ignore ridiculous values
			return;
		}
		game.zoom = parseFloat(newZoom);
	},

	coords() {
		game_console.log(game.hoveredCell.toString());
		navigator.clipboard.writeText(game.hoveredCell.toString());
	},

	async export(): Promise<void> {
		await game.exportSave();
	},

	async import(): Promise<void> {
		await game.loadSaveFromClipboard();
	},

	blank() {
		let shop = document.querySelector<HTMLElement>('.shop')!;
		let chatIcon = document.querySelector<HTMLElement>('.chatIcon')!;
		let messenger = document.querySelector<HTMLElement>('.messenger')!;
		if (shop.style.display !== 'none') {
			// hide all
			shop.style.display = 'none';
			chatIcon.style.display = 'none';
			messenger.style.display = 'none';
		} else {
			// show all
			shop.style.display = 'initial';
			chatIcon.style.display = 'initial';
			messenger.style.display = 'initial';
		}
	},

	place(entityName: string, coordinates: string) {
		if (typeof coordinates === 'undefined') {
			coordinates = game.hoveredCell.toString();
		}
		if (typeof game.codex.entities[entityName] == 'undefined') {
			game_console.showHelp('error', 'Unknown entity type: ' + entityName);
			return;
		}
		let [x, y] = coordinates.split(',').map(c => parseInt(c));
		game.addEntity(entityName, [x, y]);
	},

	tp(position: string) {
		const delta = game.uvToXY(this.expandPosition(position));
		game.translation[0] += delta[0] / game.zoom;
		game.translation[1] += delta[1] / game.zoom;
	},

	reload() {
		document.location.reload();
	},

	depth(depth: string) {
		if (game.hoveredEntity?.name !== 'pump' && game.hoveredEntity?.name !== 'pump2') {
			return;
		}
		game.hoveredEntity.depth = this.expandNumber(depth) / 10;
		//console.log(game.hoveredEntity.depth);
	},

	expandPosition(coordinatesOrEntityName: string): Cell {
		let position = coordinatesOrEntityName.split(',');
		if (coordinatesOrEntityName.indexOf(',') < 0) {
			// Given position was an entity name. Scan the stuff list, use the first match for position.
			for (const i in game.stuff) {
				if (game.stuff[i].name === coordinatesOrEntityName) {
					return game.stuff[i].position;
				}
			}
		}

		return [parseInt(position[0]), parseInt(position[1])];
	},

	expandNumber(rawValue: string | number): number {
		const string = rawValue.toString();
		const suffix = string.substring(string.length - 1).toUpperCase();
		const suffixes = ['K', 'M', 'B', 'T'];
		const hasSuffix = suffixes.indexOf(suffix) != -1;

		let value = !hasSuffix ? parseInt(string) : parseInt(string.substring(0, string.length - 1));
		if (hasSuffix) {
			switch (suffix) {
				case 'K':
					value *= 1000;
					break;
				case 'M':
					value *= 1000000;
					break;
				case 'B':
					value *= 1000000000;
					break;
				case 'T':
					value *= 1000000000000;
					break;
			}
		}

		return value;
	},

	collectEntities(onlyBuildable: boolean) {
		let entities: Record<string, EntityCodexEntry> = {};
		for (const entityName in game.codex.entities) {
			let entity = game.codex.entities[entityName];
			if (onlyBuildable && !entity.canPurchase) {
				continue;
			}
			entities[entityName] = entity;
		}
		return entities;
	},
};

export default {
	id: 'Console',
	version: '1.0.0',
	label: 'In-game Console',
	description: 'Adds a console that lets you execute various commands. Press "C" or "Enter" to open.',
	styles: `
        #console, #console-help {
            display: none;
            background-color: black;
            border-color: silver;
            color: white;
            font-family: monospace;
            border-radius: 0;
            font-size: 16px;

            width: 700px;
            padding: 10px;
            position: absolute;
            margin-left: -340px;
            left: 50%;
            z-index: 100;
        }

        #console {
            height: 25px;
            bottom: 10%;
        }

        #console-help {
            top: 10%;
            height: 60%;
            overflow-y: auto;
            overflow-x: auto;
        }

        #console-help code {
            font-weight: bold;
            background-color: #666;
            color: white;
            padding: 2px 6px;
        }
    `,

	init() {
		if (typeof globalThis.game === 'object') {
			// We're using the mod autoloader on a game version without the global "game" variable:
			globalThis.game.game_console = new GameConsole(globalThis.game);
			globalThis.game.game_console.attach();
			//console.log('Console registered via globalThis.game');
		} else if (typeof game === 'object') {
			// We're using a game version that has the global "game" variable
			game.game_console = new GameConsole(game);
			game.game_console.attach();
			//console.log('Console registered via game (global variable)');
		} else {
			// We're using a method override to set the references
			let _game_setListeners = Game.prototype.setListeners;
			Game.prototype.setListeners = function () {
				_game_setListeners.call(this);
				this.game_console = new GameConsole(this);
				this.game_console.attach();
			};
			//console.log('Console registered via Game.prototype.setListeners override');
		}
	},
	methodReplacements: [],
	settings: [],
} satisfies Mod;
