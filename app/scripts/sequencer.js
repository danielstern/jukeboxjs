angular.module("sequencer",[])
.run(function($rootScope,jukebox){

	var state = {
		numMeasures:4,
		beatsPerMeasure:4,
		currentMeasure:0,
		currentBeat:0,
		measures:[],
	};

	for (var i = 0; i < state.numMeasures; i++) {
		var measure = [];
		state.measures.push(measure);
		for (var j = 0; j < state.numMeasures; j++) { 
			var beat = {

			};
			measure.push(beat);
		}
	}

	console.log("Initial State:",state);

	$rootScope.state = state;

	var interval;


	$rootScope.start = function() {
		console.log("Starting timer");
		var timer = jukebox.timer.setInterval(function(){
			state.currentBeat++;


			if (state.currentBeat >= state.beatsPerMeasure) {
				state.currentBeat = 0;
				state.currentMeasure++;
			};

			if (state.currentMeasure >= state.numMeasures) {
				state.currentMeasure = 0;
			}

			console.log(state.currentBeat,state.currentMeasure)

			$rootScope.$apply();

		},100);
	}

})
.service("jukebox",function(){
	var jukebox = new Jukebox();
	return jukebox;
})