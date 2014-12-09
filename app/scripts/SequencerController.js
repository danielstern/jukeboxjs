angular.module("Demo")
    .controller("SequencerController", function($scope) {

        var maxMeasures = 512;
        var maxTracks = 16;
        var maxBeatsPerMeasure = 8;
        var timer;
        var letters = ['E','F','Gb','G','Ab',"A","Bb","B","C","Db",'D','Eb'];
        var tracks = [];
        var scale;
        var position = 0;
        


        scale = [];
        for (var i = 0; i < 70; i++) {
            scale.push({
                name:letters[i % letters.length],
                index:i,
            })
        }

        var synthesizers = [];
        for (key in JBSCHEMA.synthesizers) {
            var schema = JBSCHEMA.synthesizers[key];
            synthesizers.push(Jukebox.getSynth(schema));
        }

        var config = {
            bpm: 120,
            beatsPerMeasure: 4,
            numMeasures:2,
            synthesizer:synthesizers[1]
        };




        config.tones = scale.slice(0,12);

        function enable(trackIndex,measureIndex,beatIndex,tone) {
        	var track = tracks[trackIndex];
        	var measure = track.measures[measureIndex];
        	var beat = measure.beats[beatIndex];

        	if ($scope.isEnabled(trackIndex,measureIndex,beatIndex,tone)) {
        		beat.tones.splice(beat.tones.indexOf(tone),1);	
        	} else {
        		beat.tones.push(tone);
        		track.instrument.play(tone.index,100);		
        	}
        }

        function handleEnterBeat(intervalLength){

        	var currentBeat = position % config.beatsPerMeasure;
        	var currentMeasure = Math.floor(position / config.beatsPerMeasure);

        	tracks.forEach(function(track){
        		var measure;
        		if (track.repeat) {
        			var repeatIndex = currentMeasure % track.numMeasures;
        			measure = track.measures[repeatIndex];
        		} else {
        			measure = track.measures[currentMeasure];
        		}

        		measure.playing = true;
        		Jukebox.timer.setTimeout(function(){
        			measure.playing = false;
        		}, intervalLength*4-1);
        		
        		var beat = measure.beats[currentBeat]; 
        		beat.tones.forEach(function(tone){
        			track.instrument.play(tone.index);
        			Jukebox.timer.setTimeout(function(){
        				// measure.playing = false;
        				track.instrument.stop(tone.index);
        			}, intervalLength-1);
        		});
        	})

        	position += 1;
        }

        function playSequence (){
        	
        	position = 0;
        	if (timer) {
        		clearInterval(timer);
        		timer = undefined;
        		return;
        	}

        	var intervalLength = 1 / config.bpm * 60 * 1000;

        	timer = Jukebox.timer.setInterval(handleEnterBeat,intervalLength,intervalLength); 
        	handleEnterBeat(intervalLength);

        }

        function isEnabled(trackIndex,measureIndex,beatIndex,tone) {
        	var track = tracks[trackIndex];
        	var measure = track.measures[measureIndex]
        	var beat = measure.beats[beatIndex];
        	return (beat.tones.indexOf(tone) !== -1);
        };



        for (var j = 0; j < maxTracks; j++) {
        	var track = {
        		measures:[],
        		index:j,
        		numMeasures:config.numMeasures,
        		instrument:Jukebox.getSynth(JBSCHEMA.synthesizers['Duke Straight Up']),
        	};
        	tracks.push(track);
            for (var i = 0; i < maxMeasures; i++) {
            	var measure = {
                	index:i,
                	trackIndex:j,
                    beats: []
                };
                track.measures.push(measure);

                for (var k = 0; k < maxBeatsPerMeasure; k++) {
                    measure.beats.push({
                    	index:k,
                    	measureIndex:k,
                    	trackIndex:j,
                        tones: []
                    });
                };
            };
        }

        $scope.tracks = tracks;
        $scope.tones = tones;
        $scope.isEnabled = isEnabled;
        $scope.enable = enable;
        $scope.playSequence = playSequence;
        $scope.config = config;
        $scope.synthesizers = synthesizers;        
    })
