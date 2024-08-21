/*
 * Sixty-Four Mod: Fast & Furious Rock
 *
 * https://sixtyfour.game-vault.net/wiki/Modding:Index
 *
 * Decreases the time between Hollow Stone spawning from the Hollow Rock.
 * Adjust the "speed" variable to your liking. By default, makes the Rock x4 faster.
 * The "speed" variable supports decimals, e.g. "1.5" makes it one and a half times
 * faster. Values above 4 will make it hard to keep up with collecting.
 *
 * Also capable of increasing the limit on how many Hollow Stone can exist at the
 * same time. By default, this number isn't changed but you can increase it by
 * changing the "maximum" variable. The first tier of Hollow Rock which spawns
 * Hollow Stone will use the "maximum" variable as maximum number of stones.
 * Tiers above that will use the "maximum" multiplied by 2. The default value is 8,
 * same as the value used by the base game.
 *
 * Please note that this mod does NOT increase the speed of the Hollow Fruit, they
 * still take as long as before to process a single Hollow Stone. But, increasing
 * the speed means you can keep many more Hollow Fruits active at the same time.
 */
module.exports = class FastAndFuriousRock extends Mod
{
    label = 'Fast & Furious Rock';
    description = 'Allows you to modify the speed and Hollow Stone cap of the Hollow Rock';
    version = '1.0.0';
    settings = {
        speed: {
            default: 2,
            label: 'Speed',
            description: 'How quickly the Hollow Rock spawns Hollow Stones, multiplies default speed. Higher means faster.'
        },
        maximum: {
            default: 8,
            label: 'Maximum',
            description: 'Maximum number of Hollow Stones that can exist before Hollow Rock stops spawning more.'
        }
    };

    getMethodReplacements() {
        const self = this;
        return [
            {
                class: Strange1,
                method: 'init',
                replacement: function () {
                    const original_value = 80000;
                    self.originalMethods.Strange1.init.call(this);
                    this.spawnTimerBase = original_value / self.configuredOptions.speed;
                    this.maxSpawnedHollows = self.configuredOptions.maximum;
                }
            },
            {
                class: Strange2,
                method: 'init',
                replacement: function () {
                    let original_value = 40000;
                    self.originalMethods.Strange2.init.call(this);
                    this.spawnTimerBase = original_value / self.configuredOptions.speed;
                    this.maxSpawnedHollows = self.configuredOptions.maximum * 2;
                }
            },
            {
                class: Strange3,
                method: 'init',
                replacement: function () {
                    let original_value = 6000;
                    self.originalMethods.Strange3.init.call(this);
                    this.spawnTimerBase = original_value / self.configuredOptions.speed;
                    this.maxSpawnedHollows = self.configuredOptions.maximum * 2;
                }
            },
        ];
    };
};
