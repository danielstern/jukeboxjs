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

        var activeTones = [];


        config.tones = scale.slice(0, 12);

        function toggleTone(trackIndex, measureIndex, beatIndex, tone) {
            var object = {
                tone: tone,
                trackIndex: trackIndex,
                measureIndex: measureIndex,
                beatIndex: beatIndex,
            };
            if (getTone(trackIndex, measureIndex, beatIndex, tone)) {
                activeTones.splice(activeTones.indexOf(getTone(trackIndex, measureIndex, beatIndex, tone)), 1);
            } else {
                activeTones.push(object);
                tracks[trackIndex].instrument.play(tone.index, 100);
            }
        }

        function getTone(trackIndex, measureIndex, beatIndex, tone) {
            var object = {
                tone: tone,
                trackIndex: trackIndex,
                measureIndex: measureIndex,
                beatIndex: beatIndex,
            };
            return activeTones.filter(function(ref) {
                return angular.equals(ref, object);
            })[0];
        };

        function getCurrentBeat() {
            return position % config.beatsPerMeasure;
        }

        function getCurrentMeasure() {
            return Math.floor(position / config.beatsPerMeasure);
        }


        function getCurrentMeasureForTrack(track) {
            var currentMeasure = getCurrentMeasure();

            if (track.repeat) {
                return currentMeasure % track.numMeasures;
            } else {
                return currentMeasure;
            }

        }

        function isMeasureActive(measureObject) {

            var track = tracks[measureObject.trackIndex];
            var currentMeasure = getCurrentMeasure();
            var trackCurrentMeasure = getCurrentMeasureForTrack(track);
            var cyclical = tracks[measureObject.trackIndex].repeat;

            if (cyclical) {
            	if (measureObject.index % currentMeasure === trackCurrentMeasure
            		|| measureObject.index === trackCurrentMeasure      		) {
            		return true;
            	}
            } else {
            	if (measureObject.index === currentMeasure) {
            		return true;
            	}
            }
        }

        function isBeatActive(beatObject,measureObject) {

            // var track = tracks[beatObject.trackIndex];
            var measureActive = isMeasureActive(measureObject);
            var beatActive = beatObject.index === getCurrentBeat();
            return beatActive && measureActive;
          
        }



        // function getElementsAtPosition(position, measureIndex, beatIndex, tone) {
        //     var currentBeat = position % config.beatsPerMeasure;
        //     var currentMeasure = Math.floor(position / config.beatsPerMeasure);
        //     var elements = [];
        //     tracks.forEach(function(track,index) {
        //     	var currentTrackMeasure;
        //      if (track.repeat) {
        //          currentTrackMeasure = currentMeasure % track.numMeasures;
        //      } else {
        //      	currentTrackMeasure = currentMeasure;
        //      }

        //      track.measures.forEach(function(measure,index){
        //      	if (index === measureIndex) {

        //      	}
        //      })
        //     });
        // };

        function getCurrentMeasureForTrack(track, index) {
            var currentTrackMeasure;
            var currentMeasure = Math.floor(position / config.beatsPerMeasure);

            if (track.repeat) {
                currentTrackMeasure = currentMeasure % track.numMeasures;
            } else {
                currentTrackMeasure = currentMeasure;
            }

            return currentTrackMeasure;
        }


        function handleEnterBeat(intervalLength) {

            var currentBeat = getCurrentBeat(position, config.beatsPerMeasure);

            tracks.forEach(function(track, index) {

                var currentTrackMeasure = getCurrentMeasureForTrack(track, index);

                var currentTones = activeTones.filter(function(tone) {
                    return tone.trackIndex === index && tone.measureIndex === currentTrackMeasure && tone.beatIndex === currentBeat + 1;
                });

                currentTones.forEach(function(tone) {
                    track.instrument.play(tone.tone.index);
                    Jukebox.timer.setTimeout(function() {
                        track.instrument.stop(tone.tone.index);
                    }, intervalLength - 5);

                })
            });

            // activeTones.forEach(function(tone){

            // })

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

            var exportJSON = {
                config: config,
                tracks: tracks,
                activeTones: activeTones
            }

            console.log("export?", exportJSON);
            // $("#modal").modal();
        }

        function changeInstrument(track, instrument) {
            track.instrument.stop();
            track.instrument = instrument;
            track.instrumentName = instrument.name;
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

        tracks.forEach(function(track) {
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
        $scope.isMeasureActive = isMeasureActive;
        $scope.isBeatActive = isBeatActive;
        // $scope.getMeasureRepeat = getMeasureRepeat;
    })
