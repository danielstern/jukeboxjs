angular.module("Demo")
    .controller("SequencerController", function($scope, localStorageService) {

        var maxMeasures = 512;
        var maxTracks = 8;
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

        var data = localStorageService.get("data");

        // if (localStorageService.get("data")) {
        // var data = localStorageService.get("data")
        console.log("Load:", data);
        if (data) {

        if (data.activeTones) activeTones = data.activeTones;
        if (data.config) config = data.config;
        if (data.tracks) {
            tracks = data.tracks
            } 
        } else {

            for (var j = 0; j < maxTracks; j++) {
                var track = {
                    measures: [],
                    index: j,
                    numMeasures: config.numMeasures,
                    instrumentName: "Duke Straight Up",
                };
                tracks.push(track);
            }

        }
        populateTracks();
        // }


        // if (localStorageService.get("config")) {
        // 	config = localStorageService.get("config");
        // }

        function populateTracks() {
            tracks.forEach(function(track, j) {
                track.instrument = Jukebox.getSynth(JBSCHEMA.synthesizers[track.instrumentName]);
                track.measures = [];
                for (var i = 0; i < maxMeasures; i++) {
                    // console.log("pop track",track);
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
            });

            console.log("Populated tracks...", tracks);


        }




        populateTracks();

        function save() {
            var data = exportTracks();
            localStorageService.set('data', data);
            // localStorageService.set("activeTones",tones);
            // localStorageService.set("config",config);
        }



        $scope.$watch('activeTones', function(tones) {
            save();
        }, true);

        $scope.$watch('config', function(config) {
            save();
        }, true);

        // $scope.$watch('tracks',function(tracks){
        // 	console.log("tracks changed");
        // },true)

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
                if (measureObject.index % currentMeasure === trackCurrentMeasure || measureObject.index === trackCurrentMeasure) {
                    return true;
                }
            } else {
                if (measureObject.index === currentMeasure) {
                    return true;
                }
            }
        }

        function isBeatActive(beatObject, measureObject) {

            var measureActive = isMeasureActive(measureObject);
            var beatActive = beatObject.index === getCurrentBeat();
            return beatActive && measureActive;

        }


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

            position += 1;

            tracks.forEach(function(track, index) {


                var currentBeat = getCurrentBeat(position, config.beatsPerMeasure);
                var currentTrackMeasure = getCurrentMeasureForTrack(track, index);

                var currentTones = activeTones.filter(function(tone) {
                    return tone.trackIndex === index && tone.measureIndex === currentTrackMeasure && tone.beatIndex === currentBeat;
                });

                currentTones.forEach(function(tone) {
                    track.instrument.play(tone.tone.index);
                    Jukebox.timer.setTimeout(function() {
                        track.instrument.stop(tone.tone.index);
                    }, intervalLength - 5);

                })
            });

        }

        function playSequence() {

            position = -1;
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
                tracks: [],
                activeTones: activeTones
            }

            tracks.forEach(function(track) {
                exportJSON.tracks.push({
                    instrumentName: track.instrumentName,
                    index: track.index,
                    numMeasures: track.numMeasures,
                })
            })

            console.log("export?", exportJSON);

            $('#export').modal();
            return exportJSON;
        }

        function changeInstrument(track, instrument) {
            track.instrument.stop();
            track.instrument = instrument;
            track.instrumentName = instrument.name;
            save();
        }


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
        $scope.activeTones = activeTones;
        $scope.save = save;
    })
