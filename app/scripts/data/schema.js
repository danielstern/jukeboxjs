var SINE = 'sine';
var SAW = 'sawtooth';
var TRIANGLE = 'triangle';
var SQUARE = 'square';

var JBSCHEMA = {

}

var tones = {
    "Thomson Ninja DK1500": {
        "kickdrum": function(modulators, tone, timer) {

                var freq = 40,
                timeIn = 5,
                timeOut = 5,
                duration = 30;

                modulators.forEach(function(modulator){
                  modulator.setFrequency(freq);
                  modulator.setEnvelope({
                        timeIn: timeIn,
                        timeOut: timeOut,
                    })
                  modulator.play();
                  timer.setTimeout(modulator.stop, 30);
                })

                // var kickdrum = new Modulator({
                //     oscillators: [SQUARE, TRIANGLE],
                //     frequency: 40,
                //     envelope: {
                //         timeIn: 5,
                //         timeOut: 5,
                //     },
                // });

            },
        "snare": function(Modulator, tone, timer) {
                var snare = new Modulator({
                    oscillators: [SAW, TRIANGLE],
                    envelope: {
                        timeIn: 10,
                        timeOut: 35,
                    },
                    frequency: 170
                });
                snare.play();
                timer.setTimeout(snare.stop, 30);
            },
        "hihat": function(Modulator, tone, timer) {
                var snare = new Modulator({
                    oscillators: [SINE, SINE, SINE],
                    envelope: {
                        timeIn: 10,
                        timeOut: 70,
                    },
                    frequency: 700
                });
                snare.play();
                timer.setTimeout(snare.stop, 25);
            },
        "crash": function(Modulator, tone, timer) {
                var crash = new Modulator({
                    oscillators: [SINE, SINE, TRIANGLE],
                    envelope: {
                        timeIn: 10,
                        timeOut: 70,
                    },
                    frequency: 620
                });
                crash.play();
                timer.setTimeout(crash.stop, 75);
            },
    },

    "keyboard1": function(modulators, tone, timer) {
        modulators.forEach(function(modulator) {

                var duration = 300;
                var baseFrequency = 220; // Low A

                var freq = baseFrequency + (baseFrequency * tone / 12)
                modulator.setFrequency(freq);
                modulator.play();
                timer.setTimeout(function() {
                    modulator.stop();
                }, duration);
            })
      }
}

var toneMaps = {
    "Drums": {
        name: "Drums",
        type: "custom",
        processor: [
            tones["Thomson Ninja DK1500"]['kickdrum'],
            tones["Thomson Ninja DK1500"]['snare'],
            tones["Thomson Ninja DK1500"]['hihat'],
            tones["Thomson Ninja DK1500"]['crash'],
        ]
    },
    "Keyboard": {
        name: "Keyboard",
        type: "linear",
        processor: tones['keyboard1']
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
    },
    "Tabernackle T4": {
        name: "Tabernackle T4",
        oscillators: [SAW, SAW, TRIANGLE],
        envelope: {
            timeIn: 10,
            timeOut: 50,
        }
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
