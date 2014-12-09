angular.module("Demo")
    .controller("SequencerController", function($scope) {
        var config = {
            bpm: 120,
            beatsPerMeasure: 4,
            tones: ["A","B","C"],
        };
        var maxMeasures = 1024;
        var maxTracks = 128;
        var maxBeatsPerMeasure = 16;

        var baseFrequency = 30.8677; // Low Low Low B
        var letters = ["B","C","Db",'D','Eb','E','F','Gb','G','Ab',"A","Bb"];
        var ratio = Math.pow(2, 1 / 12);
        
        $scope.config = {

        };

        var scale = [];
        for (var i = 0; i < 70; i++) {
            scale.push({
                name:letters[i % letters.length],
                index:i,
                frequency: baseFrequency * Math.pow(ratio, i)
            })
        }


        var chromatic = scale;
        var guitarBase = 17;
        var guitar = [scale[guitarBase],scale[guitarBase+5],scale[guitarBase+10],scale[guitarBase+15],scale[guitarBase+19],scale[guitarBase+24]];

        var bassBase = 0;
        var bass = [scale[bassBase],scale[bassBase+5],scale[bassBase+10],scale[bassBase+15],scale[bassBase+20]];


        // var 
        $scope.enable = function(trackIndex,measureIndex,beatIndex,tone) {
        	var track = tracks[trackIndex];
        	var measure = track.measures[measureIndex];
        	measure.beats[beatIndex].tones.push(tone);
        	track.instrument.play(tone.index,100);
        }

        $scope.isEnabled = function(trackIndex,measureIndex,beatIndex,tone) {
        	var track = tracks[trackIndex];
        	var measure = track.measures[measureIndex]
        	var beat = measure.beats[beatIndex];
        	return (beat.tones.indexOf(tone) !== -1);
        }

        // config.tones = guitar;
        config.tones = scale.slice(25,40);

        $scope.config = config;

        var tracks = [];

        for (var j = 0; j < maxTracks; j++) {
        	var track = {
        		measures:[],
        		index:j,
        		// instrument:Jukebox.getModulator(JBSCHEMA.modulators["Dookus Basic Square"]),
        		instrument:Jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6']),
        		// instrument:Jukebox.getModulator(JBSCHEMA.modulators["Dookus Basic Square"]),
        		enable:function(tone) {
        			this.instrument.frequency = tone;
        			this.instrument.play();
        			Jukebox.timer.setTimeout(this.instrument.stop, 100);
        		}

        		// instrument:Jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6'])
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
    })
