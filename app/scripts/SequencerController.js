angular.module("Demo")
    .controller("SequencerController", function($scope) {
        var config = {
            bpm: 120,
            beatsPerMeasure: [0,0,0,0],
            tones: ["A","B","C"],
        };
        var maxMeasures = 1024;
        var maxTracks = 128;

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

        // config.tones = guitar;
        config.tones = scale.slice(25,35);

        $scope.config = config;

        var tracks = [];

        for (var j = 0; j < maxTracks; j++) {
        	var track = {
        		measures:[],
        		instrument:Jukebox.getModulator(JBSCHEMA.modulators["Dookus Basic Square"]),
        		play:function(tone,duration) {
        			this.instrument.frequency = tone;
        			this.instrument.play();
        			Jukebox.timer.setTimeout(this.instrument.stop,duration || 100);
        		}

        		// instrument:Jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6'])
        	};
        	tracks.push(track);
            for (var i = 0; i < maxMeasures; i++) {
                track.measures.push({
                    tones: []
                });
            };
        }

        $scope.tracks = tracks;
        $scope.tones = tones;
    })
