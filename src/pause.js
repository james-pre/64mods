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
module.exports = class Pause extends Mod
{
    label = 'Pause';
    description = 'Lets you pause the game (but still build/delete/move structures) by pressing "P".';
    version = '1.0.0';

    paused = false;

    getMethodReplacements() {
        const self = this;
        return [
            {
                class: Game,
                method: 'updateLoop',
                replacement: function() {
                    if (self.paused) {
                        return;
                    }
                    self.originalMethods.Game.updateLoop.call(this);
                }
            },
            {
                class: Game,
                method: 'createResourceTransfer',
                replacement: function(r,p,d,f,v) {
                    if (self.paused) {
                        // Make VFX not visible in main game plane.
                        v = [0];
                        if (typeof f === 'function') {
                            // The resource transfer has an oncomplete event, but due to having stopped the game loop,
                            // that event will never fire. So we fire it immediately instead (and just for good measure
                            // we convert it to a NOOP).
                            f();
                            f = _ => {};
                        }
                    }
                    self.originalMethods.Game.createResourceTransfer.call(this, r,p,d,f,v);
                }
            }
        ];
    };

    pause() {
        this.paused = true;
    };

    resume() {
        this.paused = false;
        (game ?? window.game).time.lt = performance.now();
        (game ?? window.game).clock.postMessage(true);
    };

    init() {
        const self = this;
        addEventListener('keydown', function (event) {
            if (event.key !== 'p') {
                return;
            }

            if (self.paused) {
                self.resume();
            } else {
                self.pause();
            }
        });
    };
};
