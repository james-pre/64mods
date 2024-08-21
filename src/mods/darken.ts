import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Darken
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
 * Darkens the playing field from bright white to darker by applying an overlay shade with configurable intensity.
 */
export default {
	id: 'darken',
	label: 'Darken',
	description: 'Darkens the playing field from bright white to darker by applying an overlay shade with configurable intensity.',
	version: '1.0.1',
	settings: [
		{
			id: 'intensity',
			default: 0.1,
			label: 'Shade intensity',
			description: 'Use a value from 0.01 to 1.0 - lower value means shade effect is less intense.',
		},
		{
			id: 'shadeColor',
			default: '#000',
			label: 'Shading color',
			description: 'The color of the shade. Will be made semi-transparent based on intensity. Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'blendMode',
			default: 'darken',
			label: 'Blending mode',
			description: 'Which Canvas blending mode to use when applying the shade.',
			options: [
				'multiply',
				'screen',
				'overlay',
				'darken',
				'lighten',
				'color-dodge',
				'color-burn',
				'hard-light',
				'soft-light',
				'difference',
				'exclusion',
				'hue',
				'saturation',
				'color',
				'luminosity',
			],
		},
	],

	methodReplacements: [
		{
			class: Game,
			method: 'renderloop',
			replacement(this: ThisFor<Game, 'renderloop'>, dt: number) {
				this.__initial(dt);

				this.ctx.save();
				this.ctx.globalCompositeOperation = configuredOptions.blendMode;
				this.ctx.globalAlpha = parseFloat(configuredOptions.intensity);
				this.ctx.fillStyle = configuredOptions.shadeColor;
				this.ctx.fillRect(0, 0, this.w, this.h);
				this.ctx.restore();
			},
		},
	],
} satisfies Mod;
