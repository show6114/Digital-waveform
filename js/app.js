(function() {
	/**
	* digitalWaveform Module
	*
	* Description
	*/
	var app = angular.module('digitalWaveform', []);

	app.controller('WaveformViewController', function () {
		var wfb = new WaveformBrain([1, 0, 1, 1]);
		
		this.addLogic = function (logic) {
			wfb.addDigit(logic);
		}
		this.clearAllLogic = function () {
			wfb.clearAllDigit();
		}

		this.digits = wfb;
	});

	app.directive('waveformDraw', function(){	
		return {
			restrict: 'A',
			scope: {
				data: '='
			}, 
			link: function (scope, element, attrs) {
				var ctx = element[0].getContext('2d');
				var h = attrs.height;
				// for (var i = 0; i < attrs.waveformDraw.length; i++) {
				// 	console.log();
				// }

	            ctx.moveTo(0, 0);
	            ctx.lineTo(30, 0);
	            ctx.lineTo(30, 30);
	            ctx.lineTo(720, 30);

	            ctx.lineWidth=5;
	            ctx.stroke();
	            console.log(scope.data);
			}
		};
	});

	// model of digital waveform
	function WaveformBrain (initDdata) {
		// initialize
		this.ddata = initDdata || [];
		this.clock = updateClock(initDdata);

		this.addDigit = function (logic) {
			this.ddata.push(logic);
			this.clock = updateClock(this.ddata);
		};

		this.clearAllDigit = function () {
			this.ddata = [];
			this.clock = [];
		}

		function updateClock (ddata) {
			var clock = [];
			for (var i = 0; i < ddata.length; i++) {
				clock[i] = i % 2;
			}
			return clock;
		};
	}
})();