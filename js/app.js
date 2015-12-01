(function() {
    var app = angular.module('digitalWaveform', []);

    app.controller('WaveformViewController', function() {
        // initialize
        this.waveform = new WaveformBrain();
        this.clockOffsetValue = this.waveform.channels.clk.offset * 100;

        this.addLogicHigh = function() {
            this.waveform.addDigit(1);
        }

        this.addLogicLow = function() {
            this.waveform.addDigit(0);
        }

        this.clearAllLogic = function() {
            this.waveform.clearAllDigit();
        }

        this.updateClockOffset = function() {
            this.waveform.addClkOffset(this.clockOffsetValue / 100);
        }
    });

    app.directive('waveformDraw', function() {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                waveformDraw: '='
            },
            link: function(scope, element, attrs) {
                var ctx = element[0].getContext('2d');
                var box = {
                    'h': Number(attrs.height),
                    'w': Number(attrs.width)
                };
                scope.$watch('waveformDraw', function(newValue, oldValue) {
                    var newOffset = newValue.offset || 0;
                    var oldOffset = oldValue.offset || 0;
                    var newData = newValue.bits;
                    if (newData.length > 0) {
                        if (newOffset !== oldOffset) clearCanvasWaveformDraw(ctx, box);
                        canvasWaveformDraw(ctx, newData, newOffset, box);
                    } else {
                        clearCanvasWaveformDraw(ctx, box);
                    }
                }, true);

                function canvasWaveformDraw(ctxObj, data, offset, boxSize) {
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

                    ctxObj.lineWidth = 3;
                    ctxObj.stroke();
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
