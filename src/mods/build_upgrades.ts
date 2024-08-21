/*
 * Sixty-Four Mod: Build Upgrades
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
 * Allows building buildings which are upgrades to other buildings, without
 * first building the lower-tier building - with the exception of "one-off"
 * buildings like the recycling tower, streaming tower, etc.
 *
 * Also does not allow building Hollow Flower or Hollow Fruit without a Hollow
 * Stone present, but does allow Hollow Fruit directly on top of Hollow Stone.
 */

import type { ThisFor } from '../mod';

function placeItem(game: Game) {
	const price = game.getRealPrice(game.itemInHand!.name);
	game.requestResources(price, game.hoveredCell, false, true);

	game.addEntity(game.itemInHand!.name, game.hoveredCell);
	game.stats.machinesBuild++;
	game.processMousemove();

	if (!game.canAfford(game.itemInHand!.name)) {
		delete game.itemInHand;
	} else {
		game.pickupItem(game.itemInHand!.name);
	}
}

export default {
	id: 'BuildUpgrades',
	label: 'Build Upgrades',
	name: 'BuildUpgrades',
	description:
		'Allows building upgrade buildings without first building the lower-tier building, with the \nexception of "one-off" buildings like the fill director, streaming tower, etc.',
	version: '1.0.0',

	methodReplacements: [
		{
			class: Game,
			method: 'processClick',
			replacement(this: ThisFor<Game, 'processClick'>, e: MouseEvent) {
				if (this.transportedEntity) {
					return this.__initial(e);
				}

				if (
					!this.itemInHand ||
					!this.hoveredCell ||
					!this.canAfford(this.itemInHand.name) ||
					this.itemInHand.eraser ||
					this.hoveredEntity instanceof Pump ||
					this.hoveredEntity instanceof Gradient ||
					(this.entitiesInGame['pump'] || 0) + (this.entitiesInGame['pump2'] || 0) + (this.entitiesInGame['gradient'] || 0) < 2
				) {
					return this.__initial(e);
				}

				// Special case: allow building a Hollow Fruit directly on top of a Hollow Stone withou first
				// building the Hollow Flower that is normally required.
				const isPlacingFruitOrFlower = this.itemInHand.name === 'flower' || this.itemInHand.name === 'fruit';
				const isPlacingFruitOrFlowerOnStone = this.hoveredEntity?.name === 'hollow' && isPlacingFruitOrFlower;

				// Alternative allowance before letting the original method attempt to place a building.
				// If we are placing an upgrade and it isn't an upgrade for a one-off building, allow the
				// building to be constructed and DO NOT call the original click handling method.
				const isPlacingUpgradeOnBlank =
					!this.hoveredEntity && !this.itemInHand.eraser && !this.codex.entities[this.itemInHand.name].onlyone && this.codex.entities[this.itemInHand.name].isUpgradeTo;

				if (isPlacingFruitOrFlowerOnStone || (isPlacingUpgradeOnBlank && !isPlacingFruitOrFlower)) {
					if (isPlacingFruitOrFlowerOnStone) {
						this.clearCell(this.hoveredCell);
					}
					placeItem(this);
				} else {
					return this.__initial(e);
				}
			},
		},
		{
			class: Game,
			method: 'processMousemove',
			replacement(this: ThisFor<Game, 'processMousemove'>, e: MouseEvent, dxy: number) {
				this.__initial(e, dxy);

				const isHoveringFruitOnStone = this.hoveredEntity?.name === 'hollow' && this.itemInHand?.name === 'fruit';
				const isPlacingUpgradeOnBlank =
					!this.hoveredEntity &&
					!this.itemInHand?.eraser &&
					!this.codex.entities[this.itemInHand?.name!]?.onlyone &&
					this.codex.entities[this.itemInHand?.name!]?.isUpgradeTo;

				if ((isHoveringFruitOnStone || isPlacingUpgradeOnBlank) && this.canAfford(this.itemInHand!.name)) {
					this.canPlace = true;
				}
			},
		},
	],
};
