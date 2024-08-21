import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Faster Resonators
 *
 * https://sixtyfour.game-vault.net/wiki/Modding:Index
 *
 * Allows you to change how fast the Entropy Resonator I and II will hit
 * adjecent blocks. By default, doubles the speed of the Resonators.
 *
 * Also allows you to change the power to make the Resonators hit harder.
 * A value of "2" will make the Resonator hit twice as hard. By default
 * the mod will NOT increase the power of the Resonators.
 *
 * Both variables support decimals, e.g. "1.5" makes the speed/power one
 * and a half times faster. Values below zero, e.g. "0.5" will make the
 * speed/power increase instead of decrease.
 *
 * To define the settings, either edit this file and change the values right after
 * the "??" in the first lines of the script, or use the "autoloader" mod and put
 * the settings in the "mods.json" file.
 */
export default {
	id: 'FasterResonators',
	label: 'Faster Resonators',
	description: 'Modify the performance (speed and power) of the lower tiers of Resonators',
	version: '1.0.0',
	settings: [
		{
			id: 'speed',
			default: 2,
			label: 'Speed',
			description: 'How quickly the Resonators attack adjacent blocks.',
		},
		{
			id: 'power',
			default: 1,
			label: 'Power',
			description: 'How hard each Resonator attack hits the adjacent block(s).',
		},
	],

	methodReplacements: [
		{
			class: Entropic,
			method: 'init',
			replacement(this: ThisFor<Entropic, 'init'>) {
				this.__initial();
				const original_speed = 1000;
				const original_power = 0.33;
				this.interval = original_speed / configuredOptions.speed;
				this.power = original_power * configuredOptions.power;
			},
		},
		{
			class: Entropic2,
			method: 'init',
			replacement(this: ThisFor<Entropic2, 'init'>) {
				this.__initial();
				const original_speed = 300;
				const original_power = 0.66;
				this.interval = original_speed / configuredOptions.speed;
				this.power = original_power * configuredOptions.power;
			},
		},
		{
			class: Entropic2a,
			method: 'init',
			replacement(this: ThisFor<Entropic2a, 'init'>) {
				this.__initial();
				const original_power = 2;
				this.power = original_power * configuredOptions.power;
			},
		},
		{
			class: Entropic3,
			method: 'init',
			replacement(this: ThisFor<Entropic3, 'init'>) {
				this.__initial();
				const original_power = 256;
				this.power = original_power * configuredOptions.power;
			},
		},
	],
} satisfies Mod;
