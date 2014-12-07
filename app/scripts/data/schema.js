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
                duration = 150;

            modulators.forEach(function(modulator) {
                modulator.frequency = freq;
                modulator.envelope = {
                    timeIn: timeIn,
                    timeOut: timeOut,
                };
                modulator.play();
                timer.setTimeout(modulator.stop, duration);
            })

        },
        "snare": function(modulators, tone, timer) {

            var freq = 120,
                timeIn = 10,
                timeOut = 35,
                duration = 100;

            modulators.forEach(function(modulator) {
                modulator.frequency = freq;
                modulator.envelope = {
                    timeIn: timeIn,
                    timeOut: timeOut,
                };
                modulator.play();
                timer.setTimeout(modulator.stop, duration);
            })

        },
        "hihat": function(modulators, tone, timer) {
            var freq = 700,
                timeIn = 10,
                timeOut = 70,
                duration = 40;

            modulators.forEach(function(modulator) {
                modulator.frequency = freq;
                modulator.envelope = {
                    timeIn: timeIn,
                    timeOut: timeOut,
                };
                modulator.play();
                timer.setTimeout(modulator.stop, duration);
            })

        },
        "crash": function(modulators, tone, timer) {
            var freq = 620,
                timeIn = 10,
                timeOut = 70,
                duration = 150;

            modulators.forEach(function(modulator) {
                modulator.frequency = freq;
                modulator.envelope = {
                    timeIn: timeIn,
                    timeOut: timeOut,
                };
                modulator.play();
                timer.setTimeout(modulator.stop, duration);
            })
        },
    },

    "keyboard1": function(modulators, tone, timer) {

        var released = false;
        modulators.forEach(function(modulator) {

            var duration = 300;
            var baseFrequency = 220; // Low A

            var freq = baseFrequency + (baseFrequency * tone / 8)
            modulator.frequency = freq;
            modulator.play();
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

var grigsby = {
    name: "Grigsby 2260",
    oscillators: [SINE, SAW],
    phase: 25,
    envelope: {
        timeIn: 200,
        timeOut: 500,
    }
}

function getAdjustor(phaseShift,frequency,amplitude,shift) {
    return function(modulator,phase){
         modulator.bend = Math.sin((phase + shift + phaseShift) * frequency) * amplitude - amplitude * 0.5;
    }
};

var tabernackle = {
    name: "Tabernackle T4",
    oscillators: [SAW, SAW, TRIANGLE],
    modulators: [],
    envelope: {
        timeIn: 10,
        timeOut: 50,
    },
    adjustor: getAdjustor(10,1/25,50)
    // adjustor: function(modulator, phase) {
    //     var phaseShift = 10;
    //     var frequency = 1 / 25;
    //     var amplitude = 50;
       
    // }
}

var modulators = {
    "Grigsby 2260": grigsby,
    "Tabernackle T4": tabernackle,
    "Sylvester Triple Series": {
        name: "Sylvester Triple Series",
        submodulators:[{
            oscillators:[SAW],
            adjustor: getAdjustor(10,1/25,50,0),
            envelope:{
                timeIn:10,
                timeOut:111,
            }
        },{
            oscillators:[SAW],
            adjustor: getAdjustor(10,1/25,50,60),
            envelope:{
                timeIn:10,
                timeOut:111,
            }
        }]
    },
    "Oberon 650-SSS": {
        name: "Oberon 650-SSS",
        oscillators: [SINE, SINE, SAW],
        envelope: {
            timeIn: 10,
            timeOut: 10,
        }
    }
};

var synthesizers = {
    "Omaha DS6": {
        name: "Omaha DS6",
        // modulators: [modulators['Oberon 650-SSS']],
        modulators: [modulators['Grigsby 2260'], modulators['Oberon 650-SSS']],
        // modulators: [modulators['Grigsby 2260'],modulators['Tabernackle T4']],
        toneMap: toneMaps["Keyboard"]
    },
    "Borg Assimilator": {
        name: "Omaha DS6",
        modulators: [modulators['Sylvester Triple Series']],
        toneMap: toneMaps["Keyboard"]
    },
    "Phoster P52 Drum Unit": {
        name: "Phoster P52 Drum Unit",
        modulators: [modulators['Oberon 650-SSS']],
        toneMap: toneMaps["Drums"]
    }
}

JBSCHEMA.modulators = modulators;
JBSCHEMA.synthesizers = synthesizers;
