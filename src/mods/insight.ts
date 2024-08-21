/*
 * Sixty-Four Mod: Insight
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
 * Shows various useful information about entities. Press "V" to toggle on/off.
 */

import type { Cell } from '../game';
import type { Mod, ThisFor } from '../mod';

let calculatedFontSize = fontSize;
let calculatedPadding = padding;

let shown = false;

function getEntropicInfo(entity: Entropic): string[] {
	const info = [entity.constructor.name, `Power: ${entity.power}`];
	if (entity.constructor.name === 'Entropic' || entity.constructor.name === 'Entropic2') {
		info.push(`Speed: ${(1000 / entity.interval).toPrecision(2)}/s`);
	}
	return info;
}

function getRefineryInfo(entity: Refinery): string[] {
	const info = [
		entity.constructor.name,
		`Performance: ${Math.ceil((entity.multiplicator / entity.maxMultiplicator) * 100)}%`,
		`Fill: ${Math.ceil((entity.resourceCount / entity.maxResourceCount) * 100)}%`,
	];

	if (entity.timer > 0) {
		info.push(`Resets in: ${Math.ceil(entity.timer / 1000)}s`);
	}
	return info;
}

function getFruitInfo(entity): string[] {
	if (!entity.conversion) return [];
	return [entity.constructor.name, `Conversion: ${Math.ceil(entity.conversion * 100)}%`];
}

function getPumpInfo(entity): string[] {
	// Taken from Pump.prototype.update since speed calculation isn't stored as property.
	let totalspeed = entity.active ? entity.pumpSpeed : 0;
	let auxSpeed = 0;
	let activeAuxes = [];
	if (entity.auxes?.length) {
		for (let i = 0; i < entity.auxes.length; i++) {
			const ping = entity.auxes[i].tap(0);
			if (ping) {
				activeAuxes.push(entity.auxes[i]);
				if (!entity.active) auxSpeed = Math.max(ping, auxSpeed);
			}
		}
	}
	totalspeed += auxSpeed * entity.pumpSpeed;

	return [entity.constructor.name, `Depth: ${Math.ceil(entity.depth * 10)}m`, `Speed: ${totalspeed}`];
}

function getCubeInfo(entity): string[] {
	return [entity.constructor.name, `Breaking: ${entity.breakPower}`, `Broken: ${Math.ceil(entity.broken * 100)}%`];
}

function getDestabilizerInfo(entity): string[] {
	return [entity.constructor.name, `Power: ${entity.breakPower}`];
}

function getPreheaterInfo(entity): string[] {
	return [entity.constructor.name, entity.multiplicator + 'x', `Silo: ${entity.isNextToSilo ? 'yes' : 'no'}`];
}

function getConversionInfo(entity): string[] {
	let multiplicator = 1;
	for (let i = 0; i < entity.preheaters.length; i++) {
		multiplicator += entity.preheaters[i].multiplicator;
	}
	const texts = [entity.constructor.name, `Done: ${Math.floor(entity.conversion * 100)}%`, `Silo: ${entity.isNextToSilo ? 'yes' : 'no'}`];
	if (entity.preheaters.length > 0) {
		texts.push(`Pre-Heaters: ${entity.preheaters.length}`);
	}
	if (entity.constructor.name === 'Converter64') {
		if (entity.reflectorCount > 0) {
			texts.push(`Reflectors: ${entity.reflectorCount}`);
		}
		texts.push(`Output: ${(32768 + entity.reflectorCount * 8192) * 4}`);
	} else {
		texts.push(`${multiplicator}x`);
	}
	return texts;
}

function drawBox(position: Cell, text: string[], color?: string): void {
	const ctx = game.ctx;

	let width = 0;
	let height = 0;
	const heights = [];
	for (const line of text) {
		const m = ctx.measureText(line);
		const lineHeight = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
		width = Math.max(width, m.width);
		height += lineHeight;
		heights.push(lineHeight);
	}

	const boxWidth = width + calculatedPadding * 2;
	const boxHeight = height + calculatedFontSize / 2;

	const xy = game.uvToXY(position);
	const dx = xy[0] - boxWidth / 2;
	const dy = xy[1] - boxHeight / 2 - calculatedFontSize * 2;

	ctx.fillStyle = color ?? configuredOptions.defaultColor;
	ctx.fillRect(dx, dy, boxWidth, boxHeight);
	ctx.fillStyle = configuredOptions.fontColor ?? '#FFF';

	let oy = dy + calculatedFontSize / 2 + calculatedPadding;
	for (const i in text) {
		ctx.fillText(text[i], xy[0], oy);
		oy += heights[i];
	}
}

export default {
	id: 'Insight',
	label: 'Insight',
	version: '1.0.0',
	description: 'Shows various useful information about entities when holding down the CTRL button',

	settings: [
		{
			id: 'fontSize',
			default: 18,
			label: 'Font size',
		},
		{
			id: 'fontColor',
			default: '#FFF',
			label: 'Font color',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'padding',
			default: 5,
			label: 'Info box padding',
		},
		{
			id: 'defaultColor',
			default: '#333D',
			label: 'Box color, default',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'converterColor',
			default: '#33CD',
			label: 'Box color, converters',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'preheaterColor',
			default: '#C33D',
			label: 'Box color, pre-heaters',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'destabilizerColor',
			default: '#3C3D',
			label: 'Box color, destabilizers',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'pumpColor',
			default: '#CC3D',
			label: 'Box color, channels',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
		{
			id: 'entropicColor',
			default: '#3CCD',
			label: 'Box color, channels',
			description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.',
		},
	],

	init() {
		addEventListener('keyup', e => {
			// Show the insight boxes, but only if the "v" key wasn't pressed while the "Console" mod's input is shown.
			if (e.key === 'v' && !(e.srcElement && e.srcElement.id === 'console')) shown = !shown;
		});
	},

	methodReplacements: [
		{
			class: Game,
			method: 'renderEntities',
			replacement(this: ThisFor<Game, 'renderEntities'>, dt: number) {
				this.__initial(dt);
				if (!shown) {
					return;
				}

				const zoom = Math.max(this.zoom, 0.5);
				calculatedFontSize = configuredOptions.fontSize * zoom;
				calculatedPadding = configuredOptions.padding * zoom;

				this.ctx.font = calculatedFontSize + 'px Montserrat';
				for (const entity of this.stuff) {
					const pos = entity.position;
					if (this.isVisible(entity)) {
						if (!this.plane) {
							switch (entity.constructor.name) {
								case 'Entropic':
								case 'Entropic2':
								case 'Entropic2a':
								case 'Entropic3':
									drawBox(pos, getEntropicInfo(entity), configuredOptions.entropicColor);
									break;
								case 'Consumer':
									drawBox(pos, getRefineryInfo(entity));
									break;
								case 'Fruit':
									drawBox(pos, getFruitInfo(entity));
									break;
								case 'Pump':
								case 'Pump2':
									drawBox(pos, getPumpInfo(entity), configuredOptions.pumpColor);
									break;
								case 'Cube':
									drawBox(pos, getCubeInfo(entity));
									break;
								case 'Destabilizer':
									drawBox(pos, [entity.constructor.name, 'Power: 1'], configuredOptions.destabilizerColor);
									break;
								case 'Destabilizer2':
									drawBox(pos, [entity.constructor.name, 'Power: 2'], configuredOptions.destabilizerColor);
									break;
								case 'Destabilizer2a':
									drawBox(pos, [entity.constructor.name, 'Power: 625 (0)'], configuredOptions.destabilizerColor);
									break;
								case 'Preheater':
									drawBox(pos, getPreheaterInfo(entity), configuredOptions.preheaterColor);
									break;
								case 'Converter13':
								case 'Converter32':
								case 'Converter41':
								case 'Converter64':
								case 'Converter76':
									drawBox(pos, getConversionInfo(entity), configuredOptions.converterColor);
									break;
							}
						} else if (entity.soulPower > 0) {
							drawBox(pos, [`Reality: ${entity.soulPower}`]);
						}
					}
				}
			},
		},
	],
} satisfies Mod;
