(function() {
    /**
     * digitalWaveform Module
     *
     * Description
     */
    var app = angular.module('digitalWaveform', []);

    app.controller('WaveformViewController', function() {
        var wfb = new WaveformBrain();
        wfb.addClkOffset(1);
        this.waveform = wfb;

        this.addLogic = function(logic) {
            wfb.addDigit(logic);
        }

        this.clearAllLogic = function() {
            wfb.clearAllDigit();
        }
    });

    app.directive('waveformDraw', function() {
        return {
            restrict: 'A',
            scope: {
                waveformDraw: '=', 
                waveformOffset: '='
            },
            link: function(scope, element, attrs) {
                var ctx = element[0].getContext('2d');
                var bitHeight = Number(attrs.height);
                var bitWidth = Number(attrs.width);

                console.log(scope.waveformOffset);
                scope.$watchCollection('waveformDraw', function(channelBits) {
                    if (channelBits.length > 0)
                        canvasWaveformDraw(ctx, channelBits, bitHeight);
                    else
                        clearCanvasWaveformDraw(ctx, bitWidth, bitHeight);
                });

                function canvasWaveformDraw(ctx, data, h) {
                    var w = h * 1.2;

                    function initial(logic) {
                        this.x = 0;
                        this.y = logic ? 0 : h;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                    }

                    function getLogic() {
                        return (this.y > h / 2) ? 0 : 1;
                    }

                    function drawLevel() {
                        var newX = this.x += w;
                        ctx.lineTo(newX, this.y);;
                    }

                    function drawEdge() {
                        var edge = (this.y > h / 2) ? -1 : 1;
                        var newY = this.y += edge * h;
                        ctx.lineTo(this.x, newY);
                    }


                    initial(data[0]);
                    drawLevel();
                    for (var i = 1; i < data.length; i++) {
                        if (getLogic() != data[i]) drawEdge();

                        drawLevel();
                    }

                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                function clearCanvasWaveformDraw(ctx, w, h) {
                    ctx.clearRect(0, 0, w, h);
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
                'name': 'DATA'}, 
            'clk': {
                'bits': [0, 1], 
                'offset': 0, 
                'name': 'CLOCK'}
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
