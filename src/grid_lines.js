/*
 * Sixty-Four Mod: Grid Lines
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
 * Toggle visual grid lines on/off by pressing "G".
 */
module.exports = class GridLines extends Mod {
    label = 'Grid Lines';
    description = 'Toggle visual grid lines on/off by pressing "G"';
    version = '1.0.0';
    settings = {
        lineColor: {
            default: '#CCC',
            label: 'Grid Line Color',
            description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.'
        },
        lineWidth: {
            default: '1',
            label: 'Grid Line Width',
            description: 'Width of each grid line, in number of pixels.'
        },
        alternate: {
            default: false,
            label: 'Alternate Backgrounds',
            description: 'When grid lines are shown, render every other cell with a different background color.'
        },
        alternateColor: {
            default: '#EEE',
            label: 'Alternate Background Color',
            description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.'
        },
        tenths: {
            default: false,
            label: 'Alternate Backgrounds, every 10th',
            description: 'When grid lines are shown, render every other cell with a different background color.'
        },
        tenthColor: {
            default: '#AAA',
            label: 'Alternate Background Color for every 10th cell',
            description: 'Use 3 or 6 hex digits + 1 optional hex digit for transparency value.'
        },
    };

    shown = false;

    init() {
        addEventListener('keyup', e => {
            // Show the grid lines, but only if the "g" key wasn't pressed while the "Console" mod's input is shown.
            if (e.key === 'g' && !(e.srcElement && e.srcElement.id === 'console')) this.shown = !this.shown;
        })
    };

    getMethodReplacements() {
        const self = this;
        return [
            {
                class: Game,
                method: 'renderEntities',
                replacement: function (dt) {
                    if (self.shown) {
                        const size = 70;
                        const ctx = this.ctx;
                        let uv = this.hoveredEntity?.position || this.hoveredCell;
                        uv = [].slice.call(uv);
                        uv[0] -= uv[0] % 2;
                        uv[1] -= uv[1] % 2;

                        const range = {x: [uv[0] - size, uv[0] + size], y: [uv[1] - size, uv[1] + size]};

                        ctx.save();
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = self.configuredOptions.lineColor;
                        ctx.lineWidth = self.configuredOptions.lineWidth * this.pixelRatio;
                        ctx.strokeWidth = self.configuredOptions.lineWidth * this.pixelRatio;
                        ctx.lineCap = 'square';
                        ctx.beginPath();

                        for (let y = range.y[0]; y <= range.y[1]; y++) {
                            const xy0 = this.uvToXY([range.x[0] + .5, y + .5]);
                            const xy1 = this.uvToXY([range.x[1] + .5, y + .5]);
                            ctx.moveTo(...xy0);
                            ctx.lineTo(...xy1);
                        }

                        for (let x = range.x[0]; x <= range.x[1]; x++) {
                            const xy0 = this.uvToXY([x + .5, range.y[0] + .5]);
                            const xy1 = this.uvToXY([x + .5, range.y[1] + .5]);
                            ctx.moveTo(...xy0);
                            ctx.lineTo(...xy1);
                        }

                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();

                        if (self.configuredOptions.alternate) {
                            ctx.save();

                            for (let x = range.x[0]; x <= range.x[1]; x += 2) {
                                for (let y = range.y[0]; y <= range.y[1]; y += 2) {

                                    if (self.configuredOptions.tenths && x % 10 === 0 && y % 10 === 0) {
                                        ctx.fillStyle = self.configuredOptions.tenthColor;
                                    } else {
                                        ctx.fillStyle = self.configuredOptions.alternateColor;
                                    }

                                    const xy0 = this.uvToXY([x + .5, y + .5])
                                    const xy1 = this.uvToXY([x + .5, y - .5])
                                    const xy2 = this.uvToXY([x - .5, y - .5])
                                    const xy3 = this.uvToXY([x - .5, y + .5])
                                    ctx.beginPath();
                                    ctx.moveTo(...xy0);
                                    ctx.lineTo(...xy1);
                                    ctx.lineTo(...xy2);
                                    ctx.lineTo(...xy3);
                                    ctx.fill();
                                }
                            }

                            ctx.fillStyle = self.configuredOptions.alternateColor;
                            for (let x = range.x[0] -1; x <= range.x[1]; x += 2) {
                                for (let y = range.y[0] - 1; y <= range.y[1]; y += 2) {
                                    const xy0 = this.uvToXY([x + .5, y + .5])
                                    const xy1 = this.uvToXY([x + .5, y - .5])
                                    const xy2 = this.uvToXY([x - .5, y - .5])
                                    const xy3 = this.uvToXY([x - .5, y + .5])
                                    ctx.beginPath();
                                    ctx.moveTo(...xy0);
                                    ctx.lineTo(...xy1);
                                    ctx.lineTo(...xy2);
                                    ctx.lineTo(...xy3);
                                    ctx.fill();
                                }
                            }

                            ctx.restore();
                        }
                    }

                    self.originalMethods.Game.renderEntities.call(this, dt);
                }
            }
        ];
    };
}
