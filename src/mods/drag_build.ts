/*
 * Sixty-Four Mod: Drag to build/delete/upgrade multiple
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
 * Allows you to build or delete multiple buildings by holding the
 * mouse button down and dragging the mouse. Also adds a setting you
 * can enable which will keep the held item after placing it, allowing
 * you to build another without picking it from the menu. Click the
 * right mouse button or ESC to clear the held item.
 */

import type { Mod, ThisFor } from '../mod';

let down = false;
let recursed = false;
let itemToPlace: Item | null | undefined = null;
let forceDeselectHeldItem = false;

export default {
	id: 'drag-to-build',
	label: 'Drag-to-build',
	description: 'Allows you to drag to create / delete / upgrade multiple buildings.',
	version: '1.0.0',
	settings: [
		{
			id: 'dragToBuild',
			default: true,
			label: 'Drag to build',
			description: 'If enabled, allows you to drag the mouse to build multiple buildings',
		},
		{
			id: 'dragToDelete',
			default: true,
			label: 'Drag to delete',
		},
		{
			id: 'dragToUpgrade',
			default: true,
			label: 'Drag to upgrade',
		},
		{
			id: 'keepItemInHand',
			default: true,
			label: 'Keep selected item',
			description: 'After building, keep selected item in hand',
		},
	],

	methodReplacements: [
		{
			class: Game,
			method: 'processMousedown',
			replacement(this: ThisFor<Game, 'processMousedown'>, e: MouseEvent) {
				this.__initial(e);
				if (!e || e.button === 0) {
					down = true;
				}

				if (configuredOptions.keepItemInHand && this.transportedEntity) {
					// We have to register the need to deselect the held item here, since the "transportedEntity"
					// property will be empty when we hit the "processMouseup" method. We instead set this property
					// and read that in the "processMouseup" method to determine if we must deselect the item.
					forceDeselectHeldItem = true;
				}
			},
		},
		{
			class: Game,
			method: 'processMouseup',
			replacement(this: ThisFor<Game, 'processMouseup'>, e: MouseEvent) {
				this.__initial(e);
				if (!e || e.button === 0) {
					down = false;
				}

				if (configuredOptions.keepItemInHand) {
					if ((e && e.button === 2 && !this.mouse.positionChanged) || forceDeselectHeldItem) {
						itemToPlace = null;
						forceDeselectHeldItem = false;
						delete this.itemInHand;
					} else {
						itemToPlace = this.itemInHand;
					}
				}
			},
		},
		{
			class: Game,
			method: 'processMousemove',
			replacement(this: ThisFor<Game, 'processMousemove'>, e: MouseEvent, dxy: number) {
				this.__initial(e, dxy);

				if (recursed || !down) {
					return;
				}

				const dragToBuild = configuredOptions.dragToBuild;
				const dragToDelete = configuredOptions.dragToDelete;
				const dragToUpgrade = configuredOptions.dragToUpgrade;
				const keepItemInHand = configuredOptions.keepItemInHand;

				const upgradeForItem = this.codex.entities[this.itemInHand?.name!]?.isUpgradeTo;
				const isErasing = this.hoveredEntity && this.itemInHand?.eraser;
				const isPlacing = !this.hoveredEntity && this.itemInHand;
				const isUpgradeForHeldItem = upgradeForItem == this.hoveredEntity?.name;
				const isUpgrading = this.hoveredEntity && this.itemInHand && isUpgradeForHeldItem;
				if ((dragToBuild && isPlacing) || (dragToDelete && isErasing) || (dragToUpgrade && isUpgrading)) {
					const item = this.itemInHand;
					recursed = true;

					this.processClick(e);

					if (!this.itemInHand) {
						// Keep the held item, ready to place another, whether affordable or not.
						this.itemInHand = item;
					}

					recursed = false;
				}
			},
		},
		{
			enableIf: configuredOptions.keepItemInHand,
			class: Game,
			method: 'processClick',
			replacement(this: ThisFor<Game, 'processClick'>, e: MouseEvent) {
				this.__initial(e);
				if (!down && itemToPlace) {
					// Mouse up and an item was held and not cleared with right mouse button. Restore held item.
					this.itemInHand = itemToPlace;
				}
			},
		},
	],
} as const satisfies Mod;
