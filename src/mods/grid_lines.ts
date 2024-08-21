/*
 * Sixty-Four Mod: Grid Lines
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
 * Toggle visual grid lines on/off by pressing "G".
 */

import type { Mod, ThisFor } from '../mod';

let shown = false;

export default {
	id: 'GridLines',
	label: 'Grid Lines',
	description: 'Toggle visual grid lines on/off by pressing "G"',
	version: '1.0.0',
	settings: [
		{
			id: 'lineColor',
			default: '#CCC',
			label: 'Grid Line Color',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'lineWidth',
			default: '1',
			label: 'Grid Line Width',
			description: 'Width of each grid line, in number of pixels.',
		},
		{
			id: 'alternate',
			default: false,
			label: 'Alternate Backgrounds',
			description: 'When grid lines are shown, render every other cell with a different background color.',
		},
		{
			id: 'alternateColor',
			default: '#EEE',
			label: 'Alternate Background Color',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'tenths',
			default: false,
			label: 'Alternate Backgrounds, every 10th',
			description: 'When grid lines are shown, render every other cell with a different background color.',
		},
		{
			id: 'tenthColor',
			default: '#AAA',
			label: 'Alternate Background Color for every 10th cell',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
	],

	init() {
		addEventListener('keyup', e => {
			// Show the grid lines, but only if the "g" key wasn't pressed while the "Console" mod's input is shown.
			if (e.key === 'g' && !(e.target instanceof Element && e.target.id == 'console')) shown = !shown;
		});
	},

	methodReplacements: [
		{
			class: Game,
			method: 'renderEntities',
			replacement(this: ThisFor<Game, 'renderEntities'>, dt: number) {
				if (!shown) {
					this.__initial(dt);
					return;
				}
				const size = 70;
				let uv = [...(this.hoveredEntity?.position || this.hoveredCell)];
				uv[0] -= uv[0] % 2;
				uv[1] -= uv[1] % 2;

				const range = { x: [uv[0] - size, uv[0] + size], y: [uv[1] - size, uv[1] + size] };

				this.ctx.save();
				this.ctx.globalAlpha = 1;
				this.ctx.strokeStyle = configuredOptions.lineColor;
				this.ctx.lineWidth = configuredOptions.lineWidth * this.pixelRatio;
				this.ctx.strokeWidth = configuredOptions.lineWidth * this.pixelRatio;
				this.ctx.lineCap = 'square';
				this.ctx.beginPath();

				for (let y = range.y[0]; y <= range.y[1]; y++) {
					const xy0 = this.uvToXY([range.x[0] + 0.5, y + 0.5]);
					const xy1 = this.uvToXY([range.x[1] + 0.5, y + 0.5]);
					this.ctx.moveTo(...xy0);
					this.ctx.lineTo(...xy1);
				}

				for (let x = range.x[0]; x <= range.x[1]; x++) {
					const xy0 = this.uvToXY([x + 0.5, range.y[0] + 0.5]);
					const xy1 = this.uvToXY([x + 0.5, range.y[1] + 0.5]);
					this.ctx.moveTo(...xy0);
					this.ctx.lineTo(...xy1);
				}

				this.ctx.fill();
				this.ctx.stroke();
				this.ctx.restore();

				if (!configuredOptions.alternate) {
					this.__initial(dt);
					return;
				}

				this.ctx.save();

				for (let x = range.x[0]; x <= range.x[1]; x += 2) {
					for (let y = range.y[0]; y <= range.y[1]; y += 2) {
						if (configuredOptions.tenths && x % 10 === 0 && y % 10 === 0) {
							this.ctx.fillStyle = configuredOptions.tenthColor;
						} else {
							this.ctx.fillStyle = configuredOptions.alternateColor;
						}

						const xy0 = this.uvToXY([x + 0.5, y + 0.5]);
						const xy1 = this.uvToXY([x + 0.5, y - 0.5]);
						const xy2 = this.uvToXY([x - 0.5, y - 0.5]);
						const xy3 = this.uvToXY([x - 0.5, y + 0.5]);
						this.ctx.beginPath();
						this.ctx.moveTo(...xy0);
						this.ctx.lineTo(...xy1);
						this.ctx.lineTo(...xy2);
						this.ctx.lineTo(...xy3);
						this.ctx.fill();
					}
				}

				this.ctx.fillStyle = configuredOptions.alternateColor;
				for (let x = range.x[0] - 1; x <= range.x[1]; x += 2) {
					for (let y = range.y[0] - 1; y <= range.y[1]; y += 2) {
						const xy0 = this.uvToXY([x + 0.5, y + 0.5]);
						const xy1 = this.uvToXY([x + 0.5, y - 0.5]);
						const xy2 = this.uvToXY([x - 0.5, y - 0.5]);
						const xy3 = this.uvToXY([x - 0.5, y + 0.5]);
						this.ctx.beginPath();
						this.ctx.moveTo(...xy0);
						this.ctx.lineTo(...xy1);
						this.ctx.lineTo(...xy2);
						this.ctx.lineTo(...xy3);
						this.ctx.fill();
					}
				}

				this.ctx.restore();

				this.__initial(dt);
			},
		},
	],
} satisfies Mod;
