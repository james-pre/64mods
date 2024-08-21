import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Individual Sounds Volume Control
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
 * Allows changing the volume for every sound in the game, individually.
 * For example to lower the volume of the "block breaking" sound or
 * increase the volume of the "silo empty" sound.
 */
export default {
	id: 'IndividualVolume',
	label: 'Individual Volume',
	description: 'Allows you to set a volume scale for each individual sound in the game. Settings accept decimal values, "0.1" means "10%".',
	version: '1.0.0',
	settings: [
		{
			id: 'tap1',
			default: 1.0,
			label: 'Tap (1)',
		},
		{
			id: 'tap2',
			default: 1.0,
			label: 'Tap (2)',
		},
		{
			id: 'tap3',
			default: 1.0,
			label: 'Tap (3)',
		},
		{
			id: 'tap4',
			default: 1.0,
			label: 'Tap (4)',
		},
		{
			id: 'tap5',
			default: 1.0,
			label: 'Tap (5)',
		},
		{
			id: 'tap6',
			default: 1.0,
			label: 'Tap (6)',
		},
		{
			id: 'tap7',
			default: 1.0,
			label: 'Tap (7)',
		},
		{
			id: 'break',
			default: 1.0,
			label: 'Block breaking',
		},
		{
			id: 'rumble',
			default: 1.0,
			label: 'Channel working',
		},
		{
			id: 'bubble',
			default: 1.0,
			label: 'Charonite vat working',
		},
		{
			id: 'geiger',
			default: 1.0,
			label: 'Chromalit decay',
		},
		{
			id: 'release',
			default: 1.0,
			label: 'BP Oxidizer working',
		},
		{
			id: 'hellbreak',
			default: 1.0,
			label: 'Hell Gem annihilation',
		},
		{
			id: 'horn',
			default: 1.0,
			label: 'Hollow Rock clicked',
		},
		{
			id: 'hollow',
			default: 1.0,
			label: 'Hollow Stone tapped',
		},
		{
			id: 'teleport',
			default: 1.0,
			label: 'Waypoint clicked',
		},
		{
			id: 'exhaust',
			default: 1.0,
		},
		{
			id: 'void',
			default: 1.0,
		},
		{
			id: 'soul',
			default: 1.0,
			label: 'Reality collected',
		},
		{
			id: 'lightning',
			default: 1.0,
			label: '',
		},
		{
			id: 'silo',
			default: 1.0,
			label: '',
		},
		{
			id: 'silo2',
			default: 1.0,
			label: '',
		},
		{
			id: 'endingMusic',
			default: 1.0,
			label: 'Music during credits',
		},
		{
			id: 'collect',
			default: 1.0,
			label: 'Collect "free" resource (surge)',
		},
	],

	methodReplacements: [
		{
			class: Game,
			method: 'playSound',
			replacement(this: ThisFor<Game, 'playSound'>, id: string, panning: number, loudness: number, dark: boolean, forced: boolean) {
				//console.log('Playing: ' + id);
				if (typeof configuredOptions[id] !== 'undefined') {
					loudness *= configuredOptions[id];
				} else {
					console.log('Asked to play sound ' + id + ' but no individual volume was found');
				}
				return this.__initial(id, panning, loudness, dark, forced);
			},
		},
		{
			class: Game,
			method: 'startSound',
			replacement(this: ThisFor<Game, 'startSound'>, id: string, panning: number, loudness: number) {
				//console.log('Playing: ' + id);
				if (typeof configuredOptions[id] !== 'undefined') {
					loudness *= configuredOptions[id];
				} else {
					console.log('Asked to play sound ' + id + ' but no individual volume was found');
				}
				return this.__initial(id, panning, loudness);
			},
		},
	],
} satisfies Mod;
