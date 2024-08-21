import type { Mod, ThisFor } from '../mod';

/*
 * Sixty-Four Mod: Demo Mod Class
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
 * Demonstration of class-based mod compatible with the Mod Autoloader.
 */
export default {
	// Standard metadata. All of these are optional but a minimum of "label" and "version" should be specified.
	id: 'demo_mod',
	label: 'Demo Mod',
	description: 'Demonstrates how to write a mod class',
	version: '1.0.0',
	settings: [
		{
			id: 'demoOption',
			default: true,
			label: 'Demo option',
			description: 'Demonstrates a boolean (checkbox) option',
		},
	],

	// If this mod had a dependency on another mod and version:
	// dependencies {
	//     SomeOtherMod: '1.2.0'
	// }

	// If it has conflicts with other mods ("*" for any version, or put a specific version):
	// conflicts {
	//     ConflictMod: '*'
	// }
	styles: 'body { background-color: #ddd; }',

	preinit(configuredOptions, mods) {
		// configuredOptions: an object with all settings for this mod, as configured by the player.
		// mods: an object with metadata of all mods, may be incomplete at this point but is complete when the "init"
		// method of this mod class is called.
		// THIS METHOD IS OPTIONAL AND SHOULD ONLY BE IMPLEMENTED IF YOU REQUIRE DYNAMIC PRE-INITIALIZATION, SUCH AS
		// SETTING METADATA ATTRIBUTES BASED ON SELECTED OPTIONS OR PRESENCE OF OTHER MODS.
		console.log('DemoModClass was constructed');
	},

	// Mods which need to replace methods on various game objects will need to implement this method. Will only be
	// called if the mod is enabled.
	methodReplacements: [
		{
			class: Game, // The class, NOT surrounded by quotes
			method: 'init', // The method on the class, WITH quotes
			replacement(this: ThisFor<Game, 'init'>) {
				// The function that will replace the original function.
				console.log('Calling "init" on "Game"');
				// Call the original function. Depending on your needs there are three approaches:
				// - call the original BEFORE (your method can use/replace things changed in the original method).
				//   To call the original method BEFORE your method place this call at the start of your method.
				// - call the original AFTER (your method prepares things that the original method will use).
				//   To call it AFTER your method place this call at the end of your method.
				// - don't call the original method (your method completely replaces the original).
				//   To NOT call the original method don't add this call anywhere.
				this.__initial();
			},
		},
	],
} satisfies Mod;
