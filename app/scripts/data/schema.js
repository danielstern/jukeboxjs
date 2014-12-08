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
        var duration = 300;
        var baseFrequency = 146.832; // Low D
        var tonesPerOctave = 12;
        var ratio = Math.pow(2,1/12);

        // console.log("playing key...",baseFrequency+ baseFrequency * tone / tonesPerOctave)
        modulators.forEach(function(modulator) {
            var freq = baseFrequency * Math.pow(ratio,tone);
            // var freq = baseFrequency + (baseFrequency * tone / tonesPerOctave);
            modulator.frequency = freq;
            modulator.play();
        })
    },
    "harmonica": function(modulators, tone, timer) {

        var released = false;
        var duration = 300;
        var baseFrequency = 146.832; // Low D
        var tonesPerOctave = 12;
        var ratio = Math.pow(2,1/12);
        var toneBank = [];
        for (var i = 0; i < 1024; i++) {
            var toneForBank = baseFrequency * Math.pow(ratio,i);
            toneBank[i] = toneForBank;
        }
        var filterTones = toneBank.filter(function(tone,index){
            var intervals = [4,9,13];
            var position = index % 12;
            return (intervals.indexOf(position) > -1);
        })

        modulators.forEach(function(modulator) {
            var freq = filterTones[tone];
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
    },
    "Harmonica": {
        name: "Keyboard",
        type: "linear",
        processor: tones['harmonica']
    }
}

function getPhaseAdjustor(phaseShift,frequency,amplitude,shift) {
    return function(modulator,phase){

         modulator.bend = Math.sin((phase + shift + phaseShift) * frequency) * amplitude - amplitude * 0.5;
    }
};

var grigsby = {
    name: "Grigsby 2260",
    oscillators: [SINE, SAW],
    phase: 25,
    adjustor: getPhaseAdjustor(4,13,1,0),
    envelope: {
        timeIn: 10,
        timeOut: 10,
    }
}

var tabernackle = {
    name: "Tabernackle T4",
    oscillators: [SAW, SAW, TRIANGLE],
    modulators: [],
    adjustor: getPhaseAdjustor(4,50,5,0),
    envelope: {
        timeIn: 10,
        timeOut: 50,
    },
    adjustor: getPhaseAdjustor(10,1/25,50,0)
}



var modulators = {
    "Grigsby 2260": grigsby,
    "Tabernackle T4": tabernackle,
    "Sylvester Triple Series": {
        name: "Sylvester Triple Series",
        submodulators:[{
            oscillators:[SAW],
            adjustor: getPhaseAdjustor(10,1/25,50,0),
            envelope:{
                timeIn:10,
                timeOut:50,
            }
        },{
            oscillators:[SAW],
            adjustor: getPhaseAdjustor(10,1/25,50,60),
            envelope:{
                timeIn:10,
                timeOut:50,
            }
        }]
    },
    "Angel 36-B": {
        name: "Angel 36-B",
        adjustor: getPhaseAdjustor(10,1/25,5,60),
        oscillators: [SINE],
        envelope: {
            timeIn: 10,
            timeOut: 200,
        }
    },
    "Roofhausen Classic Sine": {
        name: "Roofhausen Classic Sine",
        adjustor: getPhaseAdjustor(10,1/32,10,0),
        oscillators: [SINE],
    },
    "Roofhausen Classic Sawtooth": {
        name: "Roofhausen Classic Sawtooth",
        adjustor: getPhaseAdjustor(10,1/32,10,5),
        oscillators: [SAW],
    },
    "Roofhausen Classic Square": {
        name: "Roofhausen Classic Square",
        adjustor: getPhaseAdjustor(10,1/32,10,4),
        oscillators: [SQUARE],
    },
    "Roofhausen Classic Triangle": {
        name: "Roofhausen Classic Triangle",
        adjustor: getPhaseAdjustor(10,1/28,10,10),
        oscillators: [TRIANGLE],
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
        modulators: [modulators['Grigsby 2260'], modulators['Oberon 650-SSS']],
        toneMap: toneMaps["Keyboard"]
    },
    "Harmoniks Vibraphone": {
        name: "Harmoniks Vibraphone",
        modulators: [modulators['Oberon 650-SSS']],
        toneMap: toneMaps["Harmonica"]
    },
    "Borg Assimilator": {
        name: "Borg Assimilator",
        modulators: [modulators['Sylvester Triple Series']],
        toneMap: toneMaps["Keyboard"]
    },
    "Bellator 7575": {
        name: "Bellator 7575",
        modulators: [modulators['Grigsby 2260'],modulators['Angel 36-B']],
        toneMap: toneMaps["Keyboard"]
    },
    "Quincy 275": {
        name: "Quincy 275",
        modulators: [modulators['Roofhausen Classic Sine'],modulators['Roofhausen Classic Sine']],
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
