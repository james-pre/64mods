import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Improved Silos
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
 * Doubles the charges held by each type of silo, by artificially increasing the
 * "fill" of the silo by 50% of what it consumes for every neighbor filled.
 *
 * The mod has a couple of settings:
 *
 * - silo1_ratio: sets the ratio of fill reduction when a silo refills a neighbor.
 *   A value of 0.0 means the mod is essentially disabled (no improvement to silo).
 *   A value of 1.0 means that fill reduction is disabled, which causes the silo to
 *   never need to be refilled.
 *   A value of 0.5 means that the fill reduction is halved, which causes the silo
 *   to only need to be refilled half as frequently.
 * - silo2_ratio: same as silo1_ratio, but applies to the industrial silo instead.
 * - cost_multipler: can increase or decrease the cost of filling the silo. A value
 *   of zero removes all costs. A value of 1.0 uses the original cost. And a value
 *   of for example 10 increases the cost 10x. If you're setting the two "ratio"
 *   settings to 0.0 for no-refill silos, you may want to increase this value of
 *   100 or more, to at least keep a hint of game difficulty balance.
 *
 * To define the settings, either edit this file and change the values right after
 * the "??" in the first lines of the script, or use the "autoloader" mod and put
 * the settings in the "mods.json" file.
 */
export default {
	id: 'ImprovedSilos',
	label: 'Improved Silos',
	description: 'Makes it possible to change how long a silo can run unattended (infinite is possible) and allows you to change the cost required to fill/refill the silo.',
	version: '1.0.0',
	settings: [
		{
			id: 'silo1_ratio',
			default: 0.5,
			label: 'Ratio, Underground Silo',
			description:
				'Drain reduction. A value of 0.0 means no reduction (no improvement to silo). <br />A value of 1.0 means the silo to never need to be refilled. A value of 0.5 causes <br />the silo to only need to be refilled half as frequently.',
		},
		{
			id: 'silo2_ratio',
			default: 0.5,
			label: 'Ratio, Industrial Silo',
			description: 'Same as above, but applies to the industrial silo instead.',
		},
		{
			id: 'cost_multiplier',
			default: 1,
			label: 'Fill cost multipler',
			description:
				'Silo refill cost multiplier. A value of zero removes all costs. A value of 1.0 uses the <br>original cost. And a value of 10 increases the cost 10x. If you\'re setting the two "ratio" <br>settings to 0.0 for no-refill silos, you may want to increase this value of 100 or more, to at <br>least keep a hint of game difficulty balance.',
		},
	],

	methodReplacements: [
		{
			class: Silo,
			method: 'init',
			replacement(this: ThisFor<Silo, 'init'>) {
				this.__initial();
				const original_fuel = [0, 256, 0, 0, 2];
				for (const i in original_fuel) {
					this.fuel[i] = original_fuel[i] * configuredOptions.cost_multiplier;
				}
				this.initHint();
			},
		},
		{
			class: Silo,
			method: 'tap',
			replacement(this: ThisFor<Silo, 'tap'>) {
				const original_value = 0.0625;
				this.fill += configuredOptions.silo1_ratio * original_value;
				this.__initial();
			},
		},
		{
			class: Silo2,
			method: 'init',
			replacement(this: ThisFor<Silo2, 'init'>) {
				this.__initial();
				const original_fuel = [0, 1024, 0, 0, 8, 16];
				for (const i in original_fuel) {
					this.fuel[i] = original_fuel[i] * configuredOptions.cost_multiplier;
				}
				this.initHint();
			},
		},
		{
			class: Silo2,
			method: 'tap',
			replacement(this: ThisFor<Silo2, 'tap'>) {
				const original_value = 0.015625;
				this.fill += configuredOptions.silo2_ratio * original_value;
				this.__initial();
			},
		},
	],
} satisfies Mod;
