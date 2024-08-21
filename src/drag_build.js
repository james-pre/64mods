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
module.exports = class DragBuild extends Mod
{
    label = 'Drag-to-build';
    description = 'Allows you to drag to create / delete / upgrade multiple buildings.';
    version = '1.0.0';
    settings = {
        dragToBuild: {
            default: true,
            label: 'Drag to build',
            description: 'If enabled, allows you to drag the mouse to build multiple buildings'
        },
        dragToDelete: {
            default: true,
            label: 'Drag to delete'
        },
        dragToUpgrade: {
            default: true,
            label: 'Drag to upgrade'
        },
        keepItemInHand: {
            default: true,
            label: 'Keep selected item',
            description: 'After building, keep selected item in hand'
        }
    };

    down = false;
    recursed = false;
    itemToPlace = null;
    forceDeselectHeldItem = false;

    getMethodReplacements() {
        const self = this;
        const methods = [
            {
                class: Game,
                method: 'processMousedown',
                replacement: function(e) {
                    self.originalMethods.Game.processMousedown.call(this, e);
                    if (!e || e.button === 0) {
                        self.down = true;
                    }

                    if (self.configuredOptions.keepItemInHand && this.transportedEntity) {
                        // We have to register the need to deselect the held item here, since the "transportedEntity"
                        // property will be empty when we hit the "processMouseup" method. We instead set this property
                        // and read that in the "processMouseup" method to determine if we must deselect the item.
                        self.forceDeselectHeldItem = true;
                    }
                }
            },
            {
                class: Game,
                method: 'processMouseup',
                replacement: function(e) {
                    self.originalMethods.Game.processMouseup.call(this);
                    if (!e || e.button === 0) {
                        self.down = false;
                    }

                    if (self.configuredOptions.keepItemInHand) {
                        if ((e && e.button === 2 && !this.mouse.positionChanged) || self.forceDeselectHeldItem) {
                            self.itemToPlace = null;
                            self.forceDeselectHeldItem = false;
                            delete this.itemInHand;
                        } else {
                            self.itemToPlace = this.itemInHand;
                        }
                    }
                }
            },
            {
                class: Game,
                method: 'processMousemove',
                replacement: function(e, dxy) {
                    self.originalMethods.Game.processMousemove.call(this, e, dxy);

                    if (self.recursed || !self.down) {
                        return;
                    }

                    const dragToBuild = self.configuredOptions.dragToBuild;
                    const dragToDelete = self.configuredOptions.dragToDelete;
                    const dragToUpgrade = self.configuredOptions.dragToUpgrade;
                    const keepItemInHand = self.configuredOptions.keepItemInHand;

                    const upgradeForItem = this.codex.entities[this.itemInHand?.name]?.isUpgradeTo;
                    const isErasing = this.hoveredEntity && this.itemInHand?.eraser;
                    const isPlacing = !this.hoveredEntity && this.itemInHand;
                    const isUpgradeForHeldItem = upgradeForItem === this.hoveredEntity?.name;
                    const isUpgrading = this.hoveredEntity && this.itemInHand && isUpgradeForHeldItem;
                    if ((dragToBuild && isPlacing) || (dragToDelete && isErasing) || (dragToUpgrade && isUpgrading)) {
                        const item = this.itemInHand;
                        self.recursed = true;

                        this.processClick();

                        if (!this.itemInHand) {
                            // Keep the held item, ready to place another, whether affordable or not.
                            this.itemInHand = item;
                        }

                        self.recursed = false;
                    }
                }
            }
        ];

        if (this.configuredOptions.keepItemInHand) {
            methods.push(
                {
                    class: Game,
                    method: 'processClick',
                    replacement: function(e) {
                        self.originalMethods.Game.processClick.call(this, e);
                        if (!self.down && self.itemToPlace) {
                            // Mouse up and an item was held and not cleared with right mouse button. Restore held item.
                            this.itemInHand = self.itemToPlace;
                        }
                    }
                }
            )
        }

        return methods;
    };
};
