/*
 * Sixty-Four Mod: Mod Autoloader
 *
 * https://sixtyfour.game-vault.net/wiki/Modding:Index
 *
 * Temporary implementation of proposed feature for game. Rather than
 * require each individual mod to be included in the "index.html" file,
 * this mod can be the only included mod and automatically load all
 * other mods.
 *
 * The autoloader also adds a new menu item called "MODS" which contains
 * an interface to edit all settings and enabled/disabled state of mods.
 *
 * A fully annotated example of how to write a mod can be found at:
 *
 * https://gist.github.com/NamelessCoder/26be6b5db7480de09f9dfb9e80dee3fe#file-demo-js
 */
class Mod {
	version = '0.0.0';
	settings = {};
	styles = '';
	label = '';
	description = '';
	dependencies = {};
	conflicts = {};
	originalMethods = {};

	constructor(configuredOptions, mods) {
		this.configuredOptions = configuredOptions;
		this.mods = mods;
		this.label = this.label.length > 0 ? this.label : this.getName();
	}

	initializeOptions() {
		const settings = this.getSettings();
		for (const settingName in settings) {
			this.configuredOptions[settingName] = this.configuredOptions[settingName] ?? settings[settingName]?.default ?? null;
		}
	}

	getOptions() {
		return this.configuredOptions ?? {};
	}

	getSettings() {
		return this.settings ?? {};
	}

	getName() {
		return this.constructor.name;
	}

	getLabel() {
		return this.label ?? this.getName();
	}

	getDescription() {
		return this.description ?? this.getDescription();
	}

	getVersion() {
		return this.version ?? '0.0.0';
	}

	getStyles() {
		return this.styles ?? '';
	}

	getDependencies() {
		return this.dependencies ?? {};
	}

	getConflicts() {
		return this.conflicts ?? {};
	}

	getMethodReplacements() {
		return [];
	}

	setOriginalMethod(prototypeName, methodName, method) {
		this.originalMethods[prototypeName] = this.originalMethods[prototypeName] ?? {};
		this.originalMethods[prototypeName][methodName] = method;
	}

	isEnabled() {
		return this.enabled;
	}

	init() {}
}

class LoadedMod {
	settings = {};
	settingTemplates = {};
	label = '';
	enabled = false;
	description = '';
	version = '0.0.0';
	legacy = false;
	error = null;
	constructor(modInstance, savedSettings) {
		if (!modInstance) {
			return;
		}
		this.settings = modInstance.getOptions();
		this.settingTemplates = modInstance.getSettings();
		this.label = modInstance.getLabel();
		this.enabled = savedSettings.enabled ?? false;
		this.description = modInstance.getDescription();
	}
}

class LoadedLegacyMod extends LoadedMod {
	constructor(modName) {
		super();
		this.label = modName;
		this.legacy = true;
	}
}

class LoadedModWithError extends LoadedMod {
	constructor(modName, error) {
		super();
		this.label = modName + ' (error while loading)';
		this.legacy = true;
		this.error = error;
		this.description = error.message;
	}
}

class Loader {
	constructor() {}

	loadModules() {
		const fs = require('fs');

		let date = new Date();
		let timestamp = date.getTime().toString();

		const fromStorage = window.localStorage.getItem('mods');
		const saved = JSON.parse(fromStorage ? fromStorage : '{}');
		const mods = {};
		const modObjects = {};

		fs.readdirSync(`${__dirname}/mods`)
			.filter(e => e.substr(-3) === '.js' && e !== 'autoloader.js')
			.forEach(entry => {
				let modName = entry.substr(0, entry.length - 3);
				let hasSavedSetting = typeof saved !== 'undefined' && typeof saved[modName] !== 'undefined';

				(function () {
					const configuration = saved[modName] ?? {};
					try {
						const mod = require(`${__dirname}/mods/` + entry);
						if (typeof mod === 'function') {
							const classNames = {};
							classNames[modName] = mod;
							const instance = new classNames[modName](configuration.settings ?? {}, mods);

							modObjects[modName] = instance;
							modObjects[modName].initializeOptions();

							mods[modName] = new LoadedMod(instance, configuration);
						} else {
							mods[modName] = new LoadedLegacyMod(modName);
						}
					} catch (error) {
						mods[modName] = new LoadedModWithError(modName, error);
					}
				})();
			});

		for (const modName in mods) {
			if (!mods[modName].enabled) {
				continue;
			}
			const mod = modObjects[modName];
			if (typeof mod !== 'undefined') {
				const style = mod.getStyles();
				if (style.length > 0) {
					document.head.appendChild(document.createElement('style')).innerHTML = style;
				}

				const methodOverrides = mod.getMethodReplacements();
				methodOverrides.forEach(reg => {
					mod.setOriginalMethod(reg.class.name, reg.method, reg.class['prototype'][reg.method]);
					reg.class['prototype'][reg.method] = reg.replacement;
				});
				mod.init();
			}
		}

		return mods;
	}
}

const loader = new Loader();
const mods = loader.loadModules();

let _game_init = Game.prototype.init;
let _splash_init = Splash.prototype.init;
let _splash_show = Splash.prototype.show;
let _splash_close = Splash.prototype.close;

Game.prototype.init = function () {
	_game_init.call(this);

	// Fill the global reference to this current instance to allow mods to access it as they are loaded.
	if (typeof game !== 'object') {
		window.game = this;
	}

	this.mods = mods;
};

Splash.prototype.init = function () {
	_splash_init.call(this);
	this.modScreen = document.createElement('div');
	this.modScreen.classList.add('achievementSplash');
	this.modScreen.id = 'mod-editor';
	this.modScreen.innerHTML = '<h1>MOD SETTINGS</h1><p class="warning">Save your game and take a backup before proceeding! Change at your own risk!</p>';

	const menu = this.element.getElementsByClassName('menu')[0];
	const quit = menu.removeChild(menu.lastChild);
	const reset = menu.removeChild(menu.lastChild);

	const modShowButton = document.createElement('div');
	modShowButton.classList.add('menuItem');
	modShowButton.innerHTML = 'MODS';
	modShowButton.onclick = _ => {
		this.modScreen.style.display = 'block';
	};
	menu.append(modShowButton);

	menu.append(reset);
	menu.append(quit);

	this.deModButton = document.createElement(`div`);
	this.deModButton.classList.add(`gloryButton`);
	this.deModButton.innerHTML = this.texts.deglory;
	this.deModButton.style.display = `none`;
	this.modScreen.append(this.deModButton);

	modShowButton.onclick = _ => {
		console.log('Showing mods');
		this.modScreen.style.left = 0;
		this.deModButton.style.display = `block`;
	};

	this.deModButton.onclick = _ => {
		this.modScreen.style.left = `100%`;
		this.deModButton.style.display = `none`;
	};

	this.applyButton = document.createElement('button');
	this.applyButton.innerHTML = 'APPLY SETTINGS';
	this.applyButton.onclick = _ => {
		window.localStorage.setItem('mods', JSON.stringify(mods));
		document.location.reload();
	};

	this.settings = document.createElement('div');
	this.settings.classList.add('settings');

	for (const modName in mods) {
		const table = document.createElement('table');
		//console.log(mods[vendorName][modName]);
		const tr = document.createElement('tr');
		tr.innerHTML = '<td class="header" colspan="3">' + mods[modName].label + '</td>';
		table.append(tr);

		if (mods[modName].description.length > 0) {
			const descriptionTr = document.createElement('tr');
			descriptionTr.innerHTML = '<td class="mod-description" colspan="3">' + mods[modName].description + '</td>';
			table.append(descriptionTr);
		}

		const fieldId = 'f_' + modName + '___enabled';

		if (!mods[modName].error) {
			const enabled = document.createElement('tr');
			enabled.innerHTML = '<td class="label"><label for="' + fieldId + '">Enabled?</td><td class="setting"></td>';
			const enabledCheckbox = document.createElement('input');
			enabledCheckbox.type = 'checkbox';
			enabledCheckbox.value = 1;
			enabledCheckbox.id = fieldId;
			enabledCheckbox.checked = mods[modName].enabled;
			enabledCheckbox.onchange = e => {
				if (mods[modName].legacy) {
					enabledCheckbox.checked = true;
					return true;
				} else {
					mods[modName].enabled = enabledCheckbox.checked;
				}
			};

			if (mods[modName].legacy) {
				enabledCheckbox.checked = true;
				enabledCheckbox.disabled = true;
			}

			enabled.lastChild.append(enabledCheckbox);

			if (mods[modName].legacy) {
				const description = document.createElement('td');
				description.classList.add('description');
				description.innerHTML = 'Legacy mod - cannot disable. Delete from mods folder to disable.';
				enabled.append(description);
			}

			table.append(enabled);
		}

		for (const settingName in mods[modName].settingTemplates ?? {}) {
			const setting = mods[modName].settingTemplates[settingName];
			const currentValue = mods[modName].settings[settingName] ?? setting.default ?? null;
			//console.log(setting, mods[modName].settings, currentValue);
			const fieldId = 'f_' + modName + '_' + settingName;

			const tr = document.createElement('tr');
			table.append(tr);

			const settingLabel = document.createElement('td');
			settingLabel.classList.add('label');
			settingLabel.innerHTML = '<label for="' + fieldId + '">' + setting.label + '</label>';

			tr.append(settingLabel);

			const settingValue = document.createElement('td');
			settingValue.classList.add('setting');

			let input;

			//console.log('Current value of ' + settingName + ' = ' + currentValue);
			//console.log(settingName, typeof currentValue);
			if (typeof setting.options === 'object') {
				input = document.createElement('select');
				input.onchange = _ => {
					console.log(input.children[input.selectedIndex].value);
					mods[modName].settings[settingName] = input.children[input.selectedIndex].value;
				};
				for (option in setting.options) {
					const item = document.createElement('option');
					let itemValue = null;
					if (typeof setting.options[option] === 'object') {
						item.innerHTML = typeof setting.options[option][1] !== 'undefined' ? setting.options[option][1] : setting.options[option][0];
						itemValue = setting.options[option][0];
					} else {
						item.innerHTML = setting.options[option];
						itemValue = setting.options[option];
					}

					if (itemValue === currentValue) {
						item.selected = true;
					}

					item.value = itemValue;

					input.appendChild(item);
				}
			} else {
				switch (typeof currentValue) {
					case 'boolean':
						input = document.createElement('input');
						input.type = 'checkbox';
						input.value = 1;
						input.checked = currentValue;
						input.onchange = _ => {
							mods[modName].settings[settingName] = input.checked;
						};
						break;
					case 'number':
					default:
						input = document.createElement('input');
						input.classList.add(typeof currentValue);
						input.value = currentValue;
						input.onchange = e => {
							let value = e.srcElement.value;
							if (typeof value === 'string') {
								if (parseInt(value).toString() === value.toString()) {
									value = parseInt(value);
								} else if (parseFloat(value).toString() === value.toString()) {
									value = parseFloat(value);
								}
							}
							mods[modName].settings[settingName] = value;
						};
						break;
				}
			}

			input.id = fieldId;

			settingValue.append(input);
			tr.append(settingValue);

			if (typeof setting.description !== 'undefined') {
				const description = document.createElement('td');
				description.classList.add('description');
				description.innerHTML = setting.description;
				tr.append(description);
			}
		}

		const space = document.createElement('tr');
		space.innerHTML = '<td class="space" colspan="2"></td>';

		table.append(space);

		this.settings.append(table);
	}

	this.warningText = document.createElement('p');
	this.warningText.classList.add('warning');
	this.warningText.innerText = 'Applying settings will force-reload the game without saving. Any progress since last save is lost!';

	this.modScreen.append(this.settings);
	this.modScreen.append(this.applyButton);
	this.modScreen.append(this.warningText);

	document.body.appendChild(this.modScreen);
};

Splash.prototype.show = function () {
	_splash_show.call(this);
	document.body.appendChild(this.modScreen);
};

Splash.prototype.close = function () {
	_splash_close.call(this);
	document.body.removeChild(this.modScreen);
	this.modScreen.style.left = '100%';
	this.deModButton.style.display = 'none';
};

document.head.appendChild(document.createElement('style')).innerText = `
        #mod-editor {
            color: white;
            font: 24px 'Montserrat';
            display: block;
            text-align: center;
        }
        #mod-editor h1 {
            letter-spacing: 6px;
        }
        #mod-editor .settings {
            width: 50%;
            margin: 0px auto 0px auto;
        }
        #mod-editor input,
        #mod-editor select {
            font: 24px 'Montserrat';
        }
        #mod-editor select {
            width: 80px;
        }
        #mod-editor input.number {
            width: 40px;
        }
        #mod-editor input.string,
        #mod-editor select {
            width: 80px;
        }
        #mod-editor input[type="checkbox"] {
            height: 24px;
            width: 24px;
            accent-color: #333;
        }
        #mod-editor table {
            width: 100%;
            margin-bottom: 2em;
            margin: 0px auto 0px auto;
        }
        #mod-editor table td {
            padding: 0.25em;
            vertical-align: top;
        }
        #mod-editor table td.header {
            text-align: center;
            font-size: 40px;
        }
        #mod-editor table td.space {
            height: 16px;
        }
        #mod-editor table td.label {
            text-align: right;
            width: 50%;
        }
        #mod-editor td.description,
        #mod-editor td.mod-description {
            color: #666;
            font-style: italic;
            text-align: left;
        }
        #mod-editor td.mod-description {
            text-align: center;
        }
        #mod-editor table td.setting {
            text-align: left;
            width: 24px;
        }
        #mod-editor button {
            color: white;
            display: 'block';
            width: 250px;
            font-size: 24px;
            border: none;
            background-color: black;
            padding: 0.5em;
        }
        #mod-editor button:hover {
            color: silver;
        }
        #mod-editor .warning {
            color: #cc6666;
        }
    `;
