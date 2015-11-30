(function() {
    var app = angular.module('digitalWaveform', []);

    app.controller('WaveformViewController', function() {
        // initialize
        var wfb = new WaveformBrain();
        this.clockOffsetValue = wfb.channels.clk.offset * 100;

        this.addLogicHigh = function() {
            wfb.addDigit(1);
        }

        this.addLogicLow = function() {
            wfb.addDigit(0);
        }

        this.clearAllLogic = function() {
            wfb.clearAllDigit();
        }

        this.updateClockOffset = function() {
            wfb.addClkOffset(this.clockOffsetValue / 100);
        }

        this.waveform = wfb;
    });

    app.directive('waveformDraw', function() {
        return {
            restrict: 'A',
            scope: {
                waveformData: '=',
                waveformOffset: '='
            },
            link: function(scope, element, attrs) {
                var ctx = element[0].getContext('2d');
                var offset = scope.waveformOffset;
                var box = {
                    'h': Number(attrs.height),
                    'w': Number(attrs.width)
                };

                scope.$watchCollection('waveformData', function(newValue) {
                    var dataBits = newValue;
                    if (dataBits.length > 0)
                        canvasWaveformDraw(ctx, dataBits, box, offset);
                    else
                        clearCanvasWaveformDraw(ctx, box);
                });

                function canvasWaveformDraw(ctxObj, data, boxSize, offset) {
                    var h = boxSize.h;
                    var w = h * 1.2;
                    var offsetW = offset * w;

                    function initial(logic) {
                        this.x = 0;
                        this.y = logic ? 0 : h;
                        ctxObj.beginPath();
                        ctxObj.moveTo(this.x, this.y);
                    }

                    function drawOffset(value) {
                        var newX = this.x += value;
                        ctxObj.lineTo(newX, this.y);;
                    }

                    function getLogic() {
                        return (this.y > h / 2) ? 0 : 1;
                    }

                    function drawLevel() {
                        var newX = this.x += w;
                        ctxObj.lineTo(newX, this.y);;
                    }

                    function drawEdge() {
                        var edge = (this.y > h / 2) ? -1 : 1;
                        var newY = this.y += edge * h;
                        ctxObj.lineTo(this.x, newY);
                    }

                    initial(data[0]);
                    drawOffset(offsetW);
                    drawLevel();
                    for (var i = 1; i < data.length; i++) {
                        if (getLogic() != data[i]) drawEdge();

                        drawLevel();
                    }

                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                function clearCanvasWaveformDraw(ctxObj, boxSize) {
                    ctxObj.clearRect(0, 0, boxSize.w, boxSize.h);
                }
            }
        };
    });

    // model of digital waveform
    function WaveformBrain() {
        // initialize
        this.channels = {
            'dat': {
                'bits': [1, 0],
                'offset': 0,
                'name': 'DATA'
            },
            'clk': {
                'bits': [0, 1],
                'offset': 0.5,
                'name': 'CLOCK'
            }
        };

        this.addDigit = function(logic) {
            this.channels.dat.bits.push(logic);
            this.channels.clk.bits = updateClock(this.channels.dat.bits);
        };
        this.addClkOffset = function(offset) {
            this.channels.clk.offset = offset;
        }
        this.clearAllDigit = function() {
            this.channels.dat.bits = [];
            this.channels.clk.bits = [];
        }

        function updateClock(dat) {
            var clk = [];
            for (var i = 0; i < dat.length; i++) {
                clk[i] = i % 2;
            }
            return clk;
        };
    }
})();
