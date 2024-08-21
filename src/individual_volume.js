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
module.exports = class IndividualVolume extends Mod
{
    label = 'Individual Volume';
    description = 'Allows you to set a volume scale for each individual sound in the game. Settings accept ' +
        'decimal values, "0.1" means "10%".';
    version = '1.0.0';
    settings = {
        tap1: {
            default: 1.0,
            label: 'Tap (1)'
        },
        tap2: {
            default: 1.0,
            label: 'Tap (2)'
        },
        tap3: {
            default: 1.0,
            label: 'Tap (3)'
        },
        tap4: {
            default: 1.0,
            label: 'Tap (4)'
        },
        tap5: {
            default: 1.0,
            label: 'Tap (5)'
        },
        tap6: {
            default: 1.0,
            label: 'Tap (6)'
        },
        tap7: {
            default: 1.0,
            label: 'Tap (7)'
        },
        break: {
            default: 1.0,
            label: 'Block breaking'
        },
        rumble: {
            default: 1.0,
            label: 'Channel working'
        },
        bubble: {
            default: 1.0,
            label: 'Charonite vat working'
        },
        geiger: {
            default: 1.0,
            label: 'Chromalit decay'
        },
        release: {
            default: 1.0,
            label: 'BP Oxidizer working'
        },
        hellbreak: {
            default: 1.0,
            label: 'Hell Gem annihilation'
        },
        horn: {
            default: 1.0,
            label: 'Hollow Rock clicked'
        },
        hollow: {
            default: 1.0,
            label: 'Hollow Stone tapped'
        },
        teleport: {
            default: 1.0,
            label: 'Waypoint clicked'
        },
        exhaust: {
            default: 1.0
        },
        void: {
            default: 1.0,
        },
        soul: {
            default: 1.0,
            label: 'Reality collected'
        },
        lightning: {
            default: 1.0,
            label: ''
        },
        silo: {
            default: 1.0,
            label: ''
        },
        silo2: {
            default: 1.0,
            label: ''
        },
        endingMusic: {
            default: 1.0,
            label: 'Music during credits'
        },
        collect: {
            default: 1.0,
            label: 'Collect "free" resource (surge)'
        }
    };

    getMethodReplacements() {
        const self = this;
        return [
            {
                class: Game,
                method: 'playSound',
                replacement: function (id, panning, loudness, dark, forced) {
                    //console.log('Playing: ' + id);
                    if (typeof self.configuredOptions[id] !== "undefined") {
                        loudness *= self.configuredOptions[id];
                    } else {
                        console.log("Asked to play sound " + id + " but no individual volume was found");
                    }
                    return self.originalMethods.Game.playSound.call(this, id, panning, loudness, dark, forced);
                }
            },
            {
                class: Game,
                method: 'startSound',
                replacement: function (id, panning, loudness) {
                    //console.log('Playing: ' + id);
                    if (typeof self.configuredOptions[id] !== "undefined") {
                        loudness *= self.configuredOptions[id];
                    } else {
                        console.log("Asked to play sound " + id + " but no individual volume was found");
                    }
                    return self.originalMethods.Game.startSound.call(this, id, panning, loudness);
                }
            }
        ];
    };
};
