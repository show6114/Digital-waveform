(function() {
    /**
     * digitalWaveform Module
     *
     * Description
     */
    var app = angular.module('digitalWaveform', []);

    app.controller('WaveformViewController', function() {
        var wfb = new WaveformBrain([0, 1]);

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
                waveformDraw: '='
            },
            link: function(scope, element, attrs) {
                var ctx = element[0].getContext('2d');
                var h = Number(attrs.height);

                scope.$watchCollection('waveformDraw', function(newValue) {
                    if (newValue.length > 0)
                        canvasWaveformDraw(ctx, newValue, h);
                    else
                        clearCanvasWaveformDraw(ctx, attrs.width, h);
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
    function WaveformBrain(initDdata) {
        // initialize
        this.channels = {
            'dat': initDdata, 
            'clk': updateClock(initDdata)
        };

        this.addDigit = function(logic) {
            this.channels.dat.push(logic);
            this.channels.clk = updateClock(this.channels.dat);
        };

        this.clearAllDigit = function() {
            this.channels.dat = [];
            this.channels.clk = [];
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
