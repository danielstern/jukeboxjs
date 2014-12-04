angular.module("sequencer",[])
.run(function($rootScope,jukebox){

	var state = {
		numMeasures:4,
		beatsPerMeasure:4,
		currentMeasure:0,
		currentBeat:0,
		measures:[],
		tempo: 120
	};

	function rollMeasures() {

		state.measures = [];

		for (var i = 0; i < state.numMeasures; i++) {

			var measure = [];
			state.measures.push(measure);
			for (var j = 0; j < state.beatsPerMeasure; j++) { 
				var beat = [];
				var numTones = 4;
				for (var k = 0; k < numTones; k++) { 
					beat.push({
						value:k
					})
				}
				
				measure.push(beat);
			}
		}
	}

	rollMeasures();

	$rootScope.state = state;

	var interval;

	var drums = new jukebox.getSynth({schema:JBSCHEMA.synthesizers['Phoster P52 Drum Unit']});

	$rootScope.start = function() {
		// console.log("Starting timer. BPM:",state.tempo);
		$rootScope.stop();
		interval = jukebox.timer.setInterval(function(){
			state.currentBeat++;

			if (state.currentBeat >= state.beatsPerMeasure) {
				state.currentBeat = 0;
				state.currentMeasure++;
			};

			if (state.currentMeasure >= state.numMeasures) {
				state.currentMeasure = 0;
			}

			var tones = state.measures[state.currentMeasure][state.currentBeat];
			tones.forEach(function(tone){
				if (tone.active) {
					drums.play(tone.value);
				}
			})
			$rootScope.$apply();



		},60 * 1000 / state.tempo );
	}

	$rootScope.stop = function() {
		clearInterval(interval);
	}


	$rootScope.$watch("state.numMeasures",rollMeasures);
	$rootScope.$watch("state.beatsPerMeasure",rollMeasures);
	$rootScope.$watch("state.tempo",$rootScope.start);

})
.service("jukebox",function(){
	var jukebox = new Jukebox();
	return jukebox;
})