angular.module("Demo")
    .controller("SequencerController", function($scope) {

        var maxMeasures = 512;
        var maxTracks = 16;
        var maxBeatsPerMeasure = 8;
        var timer;
        var letters = ['E', 'F', 'Gb', 'G', 'Ab', "A", "Bb", "B", "C", "Db", 'D', 'Eb'];
        var tracks = [];
        var scale;
        var position = 0;



        scale = [];
        for (var i = 0; i < 70; i++) {
            scale.push({
                name: letters[i % letters.length],
                index: i,
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
            numMeasures: 2,
            numTracks: 3,
        };

        // synthesizers.forEach(function(synth){

        // })

		var activeTones = [];


        config.tones = scale.slice(0, 12);

        function toggleTone(trackIndex, measureIndex, beatIndex, tone) {
        	console.log("Toggle tone");
        	activeTones.push({
        		tone:tone,
        		trackIndex:trackIndex,
        		measureIndex:measureIndex,
        		beatIndex:beatIndex,
        	});
            // var track = tracks[trackIndex];
            // var measure = track.measures[measureIndex];
            // var beat = measure.beats[beatIndex];

            // if ($scope.isEnabled(trackIndex, measureIndex, beatIndex, tone)) {
            //     beat.tones.splice(beat.tones.indexOf(tone), 1);
            // } else {
            // 	var ref = {
            // 		tone:tone,
            // 		trackIndex:trackIndex,
            // 		measureIndex:measureIndex,
            // 		beatIndex:beatIndex,
            // 	}
            //     beat.tones.push(ref);
            //     track.instrument.play(tone.index, 100);
            // }
        }

        function disableTone(trackIndex, measureIndex, beatIndex, tone) {
        	beat.tones.splice(beat.tones.indexOf(tone), 1);
        }

        function getTone(trackIndex, measureIndex, beatIndex, tone) {
        	var object = {
        		tone:tone,
        		trackIndex:trackIndex,
        		measureIndex:measureIndex,
        		beatIndex:beatIndex,
        	};
        	return activeTones.filter(function(ref){
        	// console.log("get tone",activeTones);
        		// debugger;
        		return angular.equals(ref,object);
        	})[0];
            // var track = tracks[trackIndex];
            // var measure = track.measures[measureIndex]
            // var beat = measure.beats[beatIndex];
            // var map = beat.tones.map(function(tone){
            // 	return tone.ref;
            // })
            // return (map.indexOf(tone) !== -1);
        };


        function handleEnterBeat(intervalLength) {

            var currentBeat = position % config.beatsPerMeasure;
            var currentMeasure = Math.floor(position / config.beatsPerMeasure);

            tracks.forEach(function(track) {
                var measure;
                if (track.repeat) {
                    var repeatIndex = currentMeasure % track.numMeasures;
                    measure = track.measures[repeatIndex];
                } else {
                    measure = track.measures[currentMeasure];
                }

                measure.playing = true;

                var beat = measure.beats[currentBeat];
                Jukebox.timer.setTimeout(function() {
                    beat.playing = false;
                }, intervalLength - 1);
                beat.playing = true;
                beat.tones.forEach(function(tone) {
                    track.instrument.play(tone.ref.index);
                    Jukebox.timer.setTimeout(function() {
                        track.instrument.stop(tone.ref.index);
                    }, intervalLength - 5);
                });
            })

            position += 1;
        }

        function playSequence() {

            position = 0;
            if (timer) {
                clearInterval(timer);
                timer = undefined;
                return;
            }

            var intervalLength = 1 / config.bpm * 60 * 1000;

            timer = Jukebox.timer.setInterval(handleEnterBeat, intervalLength, intervalLength);
            handleEnterBeat(intervalLength);

        }


        function exportTracks() {
        	var tones = [];
        	tracks.forEach(function(track){
        		track.measures.forEach(function(measure){
        			measure.beats.forEach(function(beat){
        				beat.tones.forEach(function(tone){
        					// if (tone.active) {
        						console.log("An ative tone...",tone);
        					// }
        				})

        			})
        		})
        	})
            // var exportJSON = {
            //     config: config,
            //     tracks: tracks,
            //     meta: {
            //     	date: new Date().getTime()
            //     }
            // }

            // console.log("export?",exportJSON);
            // $scope.exportJSON = exportJSON;
            // $("#modal").modal();
        }

        function changeInstrument(track,instrument) {
            this.instrument.stop();
            this.instrument = instrument;
            this.instrumentName = instrument.name;
        }





        for (var j = 0; j < maxTracks; j++) {
            var track = {
                measures: [],
                index: j,
                numMeasures: config.numMeasures,
                instrumentName: "Duke Straight Up",
            };
            // $scope.$watch()
            tracks.push(track);
            for (var i = 0; i < maxMeasures; i++) {
                var measure = {
                    index: i,
                    trackIndex: j,
                    beats: []
                };
                track.measures.push(measure);

                for (var k = 0; k < maxBeatsPerMeasure; k++) {
                    measure.beats.push({
                        index: k,
                        measureIndex: k,
                        trackIndex: j,
                        tones: []
                    });
                };
            };
        }

        tracks.forEach(function(track){
        	track.instrument = Jukebox.getSynth(JBSCHEMA.synthesizers[track.instrumentName]);
        });





        $scope.tracks = tracks;
        $scope.tones = tones;
        $scope.getTone = getTone;
        $scope.toggleTone = toggleTone;
        $scope.playSequence = playSequence;
        $scope.config = config;
        $scope.synthesizers = synthesizers;
        $scope.changeInstrument = changeInstrument;
        $scope.exportTracks = exportTracks;
    })
