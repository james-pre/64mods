import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Pause
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
 * Adds the ability to pause time in the game while still being able
 * to build and destroy buildings.
 *
 * Press "P" to pause and resume.
 *
 * Note: this mod requires the "autoloader" mod unless you're on the
 * "destabilized" beta branch.
 */
let paused = false;

function pause() {
	paused = true;
}

function resume() {
	paused = false;
	(game ?? globalThis.game).time.lt = performance.now();
	(game ?? globalThis.game).clock.postMessage(true);
}

export default {
	id: 'Pause',
	label: 'Pause',
	description: 'Lets you pause the game (but still build/delete/move structures) by pressing "P".',
	version: '1.0.0',
	settings: [],

	methodReplacements: [
		{
			class: Game,
			method: 'updateLoop',
			replacement(this: ThisFor<Game, 'updateLoop'>) {
				if (paused) {
					return;
				}
				this.__initial();
			},
		},
		{
			class: Game,
			method: 'createResourceTransfer',
			replacement(this: ThisFor<Game, 'createResourceTransfer'>, r: unknown, p: unknown, d: unknown, f: (...args: any) => any, v: [0 | 1]) {
				if (!paused) {
					this.__initial(r, p, d, f, v);
					return;
				}

				// Make VFX not visible in main game plane.
				v = [0];
				if (typeof f === 'function') {
					// The resource transfer has an oncomplete event, but due to having stopped the game loop,
					// that event will never fire. So we fire it immediately instead (and just for good measure
					// we convert it to a NOOP).
					f();
					f = () => {};
				}

				this.__initial(r, p, d, f, v);
			},
		},
	],

	init() {
		addEventListener('keydown', ({ key }) => {
			if (key != 'p') {
				return;
			}

			paused ? resume() : pause();
		});
	},
} satisfies Mod;
