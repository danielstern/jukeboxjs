var SINE = 'sine';
var SAW = 'sawtooth';
var TRIANGLE = 'triangle';
var SQUARE = 'square';

var JBSCHEMA = {

}

var tones = {
    "kickdrum1": {
        name: "kickdrum1",
        processor: function(Modulator, tone, timer) {

            var kickdrum = new Modulator({
                oscillators: [SQUARE, TRIANGLE],
                frequency: 40
            });
            // var freq = 40;
            // modulator.setFrequency(freq);
            kickdrum.play();
            timer.setTimeout(kickdrum.stop, 100);
        }
    },
    "snare1": {
        name: "snare1",
        processor: function(Modulator, tone, timer) {
            var snare = new Modulator({
                oscillators: [SQUARE, SAW],
                envelope: {
                    timeIn: 10,
                    timeOut: 300,
                },
                frequency: 70
            });
            // var freq = 40;
            // modulator.setFrequency(freq);
            snare.play();
            timer.setTimeout(snare.stop, 100);
        }
    },
    "keyboard1": {
        name: 'keyboard1',
        processor: function(modulator, tone, timer) {
            var duration = 300;
            var baseFrequency = 220; // Low A

            var freq = baseFrequency + (baseFrequency * tone / 12)
            modulator.setFrequency(freq);
            modulator.play();
            timer.setTimeout(function() {
                modulator.stop();
            }, duration);
        }
    }
}

var toneMaps = {
    "Drums": {
        name: "Drums",
        type: "custom",
        tones: [
            tones['kickdrum1'],
            tones['snare1'],
        ]
    },
    "Keyboard": {
        name: "Keyboard",
        type: "linear",
        tones: [tones['keyboard1']]
    }
}

var modulators = {
    "Grigsby 2260": {
        name: "Grigsby 2260",
        oscillators: [SINE, SAW],
        envelope: {
            timeIn: 200,
            timeOut: 500,
        }
        // oscillators:[SQUARE,SAW,SINE]
    }
};

var synthesizers = {
    "Omaha DS6": {
        name: "Omaha DS6",
        modulators: [modulators['Grigsby 2260']],
        toneMap: toneMaps["Keyboard"]
    },
    "Phoster P52 Drum Unit": {
        name: "Phoster P52 Drum Unit",
        modulators: [modulators['Grigsby 2260']],
        toneMap: toneMaps["Drums"]
    }
}

JBSCHEMA.modulators = modulators;
JBSCHEMA.synthesizers = synthesizers;
