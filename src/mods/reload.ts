import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Reload
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
 * Adds a "RELOAD" link to the main menu. Useful for mod authors; a reload is significantly
 * faster than restarting the game.
 */
export default {
	id: 'Reload',
	label: 'Reload',
	description: 'Lets you reload the game from the main menu. Useful for mod authors; a reload is significantly faster than restarting the game.',
	version: '1.0.0',
	settings: [],

	methodReplacements: [
		{
			class: Splash,
			method: 'init',
			replacement(this: ThisFor<Splash, 'init'>) {
				console.log('Applying reload link');
				this.__initial();
				const menu = this.element.getElementsByClassName('menu')[0];
				const quit = menu.removeChild(menu.lastChild!);
				const reset = menu.removeChild(menu.lastChild!);

				const reload = document.createElement('div');
				reload.classList.add('menuItem');
				reload.innerHTML = 'RELOAD';
				reload.onclick = () => document.location.reload();

				menu.append(reload);
				menu.append(reset);
				menu.append(quit);
			},
		},
	],
} satisfies Mod;
