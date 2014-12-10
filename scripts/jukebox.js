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
        "hihatclosed": function(modulators, tone, timer) {
            var freq = 920,
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
                timeIn = 0,
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
        // var baseFrequency = 146.832; // Low D
        var baseFrequency = 130.813; // Low Low C
        // var baseFrequency = 146.832; // Low D
        var tonesPerOctave = 12;
        var ratio = Math.pow(2, 1 / 12);

        // console.log("playing key...",baseFrequency+ baseFrequency * tone / tonesPerOctave)
        modulators.forEach(function(modulator) {
            var freq = baseFrequency * Math.pow(ratio, tone);
            // var freq = baseFrequency + (baseFrequency * tone / tonesPerOctave);
            modulator.frequency = freq;
            modulator.play();
        })
    },
    "Bass": function(modulators, tone, timer) {

        var released = false;
        var duration = 300;
        // var baseFrequency = 146.832; // Low D
        // var baseFrequency = 130.813; // Low Low C
        var baseFrequency = 41.2034; // Low Low Low E
        // var baseFrequency = 30.8677; // Low Low Low B
        // var baseFrequency = 130.813; // Low Low C
        // var baseFrequency = 146.832; // Low D
        var tonesPerOctave = 12;
        var ratio = Math.pow(2, 1 / 12);

        // console.log("playing key...",baseFrequency+ baseFrequency * tone / tonesPerOctave)
        modulators.forEach(function(modulator) {
            var freq = baseFrequency * Math.pow(ratio, tone);
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
        var ratio = Math.pow(2, 1 / 12);
        var toneBank = [];
        for (var i = 0; i < 1024; i++) {
            var toneForBank = baseFrequency * Math.pow(ratio, i);
            toneBank[i] = toneForBank;
        }
        var filterTones = toneBank.filter(function(tone, index) {
            var intervals = [4, 9, 13];
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
            tones["Thomson Ninja DK1500"]['hihatclosed'],
        ]
    },
    "Keyboard": {
        name: "Keyboard",
        type: "linear",
        processor: tones['keyboard1']
    },
    "Bass": {
        name: "Bass",
        type: "linear",
        processor: tones['Bass']
    },
    "Harmonica": {
        name: "Harmonica",
        type: "linear",
        processor: tones['harmonica']
    }
}

function getPhaseAdjustor(phaseShift, frequency, amplitude, shift) {
    return function(modulator, phase) {

        modulator.bend = Math.sin((phase + shift + phaseShift) * frequency) * amplitude - amplitude * 0.5;
    }
};

var grigsby = {
    name: "Grigsby 2260",
    oscillators: [SINE, SAW],
    phase: 25,
    adjustor: getPhaseAdjustor(4, 13, 1, 0),
    envelope: {
        timeIn: 10,
        timeOut: 10,
    }
}

var tabernackle = {
    name: "Tabernackle T4",
    oscillators: [SAW, SAW, TRIANGLE],
    modulators: [],
    adjustor: getPhaseAdjustor(4, 50, 5, 0),
    envelope: {
        timeIn: 10,
        timeOut: 50,
    },
    adjustor: getPhaseAdjustor(10, 1 / 25, 50, 0)
}



var modulators = {
    "Grigsby 2260": grigsby,
    "Tabernackle T4": tabernackle,
    "Sylvester Triple Series": {
        name: "Sylvester Triple Series",
        submodulators: [{
            oscillators: [SAW],
            adjustor: getPhaseAdjustor(10, 1 / 25, 50, 0),
            envelope: {
                timeIn: 10,
                timeOut: 50,
            }
        }, {
            oscillators: [SAW],
            adjustor: getPhaseAdjustor(10, 1 / 25, 50, 60),
            envelope: {
                timeIn: 10,
                timeOut: 50,
            }
        }]
    },
    "Angel 36-B": {
        name: "Angel 36-B",
        adjustor: getPhaseAdjustor(10, 1 / 25, 5, 60),
        oscillators: [SINE],
        envelope: {
            timeIn: 10,
            timeOut: 200,
        }
    },
    "Roofhausen Classic Sine": {
        name: "Roofhausen Classic Sine",
        adjustor: getPhaseAdjustor(10, 1 / 32, 10, 0),
        oscillators: [SINE],
    },
    "Roofhausen Classic Sawtooth": {
        name: "Roofhausen Classic Sawtooth",
        adjustor: getPhaseAdjustor(10, 1 / 32, 10, 5),
        oscillators: [SAW],
    },
    "Roofhausen Classic Square": {
        name: "Roofhausen Classic Square",
        adjustor: getPhaseAdjustor(10, 1 / 32, 10, 4),
        oscillators: [SQUARE],
    },
    "Roofhausen Classic Triangle": {
        name: "Roofhausen Classic Triangle",
        adjustor: getPhaseAdjustor(10, 1 / 28, 10, 10),
        oscillators: [TRIANGLE],
    },
    "Dookus Basic Square": {
        name: "Dookus Basic Square",
        oscillators: [SQUARE],
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
        modulators: [modulators['Grigsby 2260'], modulators['Angel 36-B']],
        toneMap: toneMaps["Keyboard"]
    },
    "Quincy 275": {
        name: "Quincy 275",
        modulators: [modulators['Roofhausen Classic Sine'], modulators['Roofhausen Classic Sine']],
        toneMap: toneMaps["Keyboard"]
    },
    "Duke Straight Up": {
        name: "Duke Straight Up",
        modulators: [{
            name: "Dookus Basic Square`",
            oscillators: [SQUARE],
        }],
        toneMap: toneMaps["Keyboard"]
    },
    "Blenderbart Bass Unit": {
        name: "Blenderbart Bass Unit",
        modulators: [{
            name: "Dookus Basic Square",
            oscillators: [SQUARE],
        }],
        toneMap: toneMaps["Bass"]
    },
    "Phoster P52 Drum Unit": {
        name: "Phoster P52 Drum Unit",
        modulators: [modulators['Oberon 650-SSS']],
        toneMap: toneMaps["Drums"]
    }
}

JBSCHEMA.modulators = modulators;
JBSCHEMA.synthesizers = synthesizers;

(function (global, exports, perf) {
  'use strict';

  function fixSetTarget(param) {
    if (!param)	// if NYI, just return
      return;
    if (!param.setTargetValueAtTime)
      param.setTargetValueAtTime = param.setTargetAtTime; 
  }

  if (window.hasOwnProperty('AudioContext') /*&& !window.hasOwnProperty('webkitAudioContext') */) {
    window.webkitAudioContext = AudioContext;

    if (!AudioContext.prototype.hasOwnProperty('internal_createGain')){
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function() { 
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
    }

    if (!window.webkitAudioContext) {
      window.webkitAudioContext = {

      }
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDelay')){
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function() { 
        var node = this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBufferSource')){
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function() { 
        var node = this.internal_createBufferSource();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteGrainOn)
          node.noteGrainOn = node.start;
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.playbackRate);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDynamicsCompressor')){
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function() { 
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBiquadFilter')){
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function() { 
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        var enumValues = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF', 'PEAKING', 'NOTCH', 'ALLPASS'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createOscillator') &&
         AudioContext.prototype.hasOwnProperty('createOscillator')) {
      AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() { 
        var node = this.internal_createOscillator();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        var enumValues = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE', 'CUSTOM'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        if (!node.hasOwnProperty('setWaveTable')) {
          node.setWaveTable = node.setPeriodicTable;
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createPanner')) {
      AudioContext.prototype.internal_createPanner = AudioContext.prototype.createPanner;
      AudioContext.prototype.createPanner = function() {
        var node = this.internal_createPanner();
        var enumValues = {
          'EQUALPOWER': 'equalpower',
          'HRTF': 'HRTF',
          'LINEAR_DISTANCE': 'linear',
          'INVERSE_DISTANCE': 'inverse',
          'EXPONENTIAL_DISTANCE': 'exponential',
        };
        for (var enumValue in enumValues) {
          var newEnumValue = enumValues[enumValue];
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('createGainNode'))
      AudioContext.prototype.createGainNode = AudioContext.prototype.createGain;
    if (!AudioContext.prototype.hasOwnProperty('createDelayNode'))
      AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay;
    if (!AudioContext.prototype.hasOwnProperty('createJavaScriptNode'))
      AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor;
    if (!AudioContext.prototype.hasOwnProperty('createWaveTable'))
      AudioContext.prototype.createWaveTable = AudioContext.prototype.createPeriodicWave;
  }
}(window));


   var MusicTimer = function(context) {
        var framebuffer = 0,
            msSinceInitialized = 0,
            timer = this;

        var timeAtLastInterval = new Date().getTime();

        setInterval(function() {
            var frametime = new Date().getTime();
            var timeElapsed = frametime - timeAtLastInterval;
            msSinceInitialized += timeElapsed;
            timeAtLastInterval = frametime;
        }, 1);

        this.setInterval = function(callback, timeout, args) {
            var timeStarted = msSinceInitialized;
            var interval = setInterval(function() {
                var totaltimepassed = msSinceInitialized - timeStarted;
                if (totaltimepassed >= timeout) {
                    callback(args);
                    timeStarted = msSinceInitialized;
                }
            }, 1);

            return interval;
        }

        this.getTimeNow = function() {
            return context.currentTime;
        }

        this.setSequence = function(actions) {

            var sequenceQueuedActions = [];
            var timeSoFar = 0;
            actions.forEach(function(action) {
                sequenceQueuedActions.push(timer.setTimeout(function() {
                    action.callback()
                }, timeSoFar));
                timeSoFar += action.timeout;
            });

            return sequenceQueuedActions;
        }

        this.clearSequence = function(sequenceQueuedActions) {
            sequenceQueuedActions.forEach(function(action, index) {
                clearTimeout(action);
            });
        }

        this.setTimeout = function(callback, timeout, args) {
            var interval = this.setInterval(function() {
                callback(args);
                clearInterval(interval);
            }, timeout);

            return interval;
        }
    }
    "use strict";

    var JukeboxConstructor = function() {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        var timer = new MusicTimer(audioContext);

        window.addEventListener("touchstart", function twiddle() { // to unlock the audio context on mobile devices
            var _oscillator = audioContext.createOscillator().noteOn(0.1);
            window.removeEventListener("touchstart", twiddle);
        });


        var Modulator = function(schema) {

            var volume = schema.volume || 1,
                envelope = schema.envelope || {
                    timeIn: 100,
                    timeOut: 100
                },
                frequency = schema.frequency || 440,
                context = audioContext,
                submodulators = [],
                playing = false,
                oscillators = [],
                phase = 0,
                bend = 0,
                modulator = this;

            if (schema.submodulators) {
                schema.submodulators.forEach(function(schema) {
                    var submodulator = new Modulator(schema);
                    submodulators.push(submodulator);
                })
            }


            function refreshOscillatorFrequencies() {
                oscillators.forEach(function(oscillator) {
                    oscillator.frequency.value = +frequency + +bend;
                })
            }

            function play() {
                handleStateUpdate();
                submodulators.forEach(function(submod) {
                    submod.play();
                })
                if (schema.oscillators) { // in case a modulator has only submodulators                        
                    schema.oscillators.forEach(function(oscillatorDefinition) {
                        var oscillator = context.createOscillator();
                        oscillator.type = oscillatorDefinition;

                        var gain = audioContext.createGain();

                        gain.connect(audioContext.destination);
                        gain.gain.value = 0;
                        gain.gain.setValueAtTime(volume, context.currentTime);

                        oscillator.frequency.value = frequency;
                        oscillator.noteOn(0);
                        oscillator.gain = gain;
                        oscillator.connect(gain);

                        oscillators.push(oscillator);
                    });
                }
                handleStateUpdate();
            }

            function stop() {
                handleStateUpdate();
                submodulators.forEach(function(submod) {
                    submod.stop();
                });
                oscillators.forEach(function(oscillator) {
                    oscillator.noteOff(1);
                    oscillator.disconnect(oscillator.gain);
                });

                oscillators.length = 0;

            }

            function handleStateUpdate() {

                phase++;
                modulator.frequency = +modulator.frequency;
                modulator.volume = +modulator.volume;
                modulator.bend = +modulator.bend;

                if (schema.adjustor) {
                    schema.adjustor(modulator, phase);
                };

                if (bend !== modulator.bend) {
                    bend = modulator.bend;
                    refreshOscillatorFrequencies();
                }


                if (frequency !== modulator.frequency) {
                    frequency = modulator.frequency;
                    refreshOscillatorFrequencies();
                }

                if (volume !== modulator.volume) {
                    oscillators.forEach(function(oscillator) {
                        oscillator.gain.gain.setValueAtTime(modulator.volume, context.currentTime);
                    })
                    volume = modulator.volume;
                }


                if (modulator.envelope) {
                    envelope = modulator.envelope;
                }

                submodulators.forEach(function(submod) {
                    submod.volume = volume;
                    submod.frequency = frequency;
                    submod.bend = bend;
                })
            }

            timer.setInterval(handleStateUpdate, 1);

            this.play = play;
            this.stop = stop;
            this.envelope = envelope;
            this.volume = volume;
            this.bend = bend;
            this.frequency = frequency;
            this.name = schema.name;
        };

        var Synthesizer = function(schema) {

            var modulatorSets = [],
                map = schema.toneMap,
                synthesizer = this,
                volume = 1,
                polyphony = schema.polyphony || [0, 0, 0, 0];


            function getAllModulators() {
                var allModulators = [];
                modulatorSets.forEach(function(set) {
                    allModulators = allModulators.concat(set.modulators);
                });

                return allModulators;
            }

            function releaseModulatorSet() {
                var oldestSet = modulatorSets.sort(function(a, b) {
                    return a.timePressed - b.timePressed;
                })[0];
                stopModulatorSet(oldestSet);
            }


            function getFreeModulatorSet() {
                var freeSets = modulatorSets.filter(function(set) {
                    return !set.playing;
                })

                if (!freeSets[0]) {
                    releaseModulatorSet();
                    return getFreeModulatorSet();
                }
                return freeSets[0];
            }

            function play(tone, duration) {

                stop(tone);

                var processor;
                if (typeof map.processor === "function") {
                    processor = map.processor;
                } else {
                    processor = map.processor[tone % map.processor.length];
                }

                var modulatorSet = getFreeModulatorSet();
                if (modulatorSet) {
                    processor(modulatorSet.modulators, tone, timer);
                }

                modulatorSet.playing = true;
                modulatorSet.currentTone = tone;
                modulatorSet.timePressed = timer.getTimeNow();

                if (duration) {
                    timer.setTimeout(function() {
                        stop(tone);
                    }, duration);
                }
            }

            function stop(tone) {
                modulatorSets.filter(function(set) {
                    if (tone === undefined) {
                        return true;
                    } else {
                        return set.currentTone === tone;
                    }
                })
                .forEach(stopModulatorSet);
            }

            function stopModulatorSet(set) {
                set.modulators.forEach(function(modulator) {
                    modulator.stop();
                })
                set.playing = false;
                set.currentTone = undefined;
            }

            polyphony.forEach(function() {
                var modulatorSet = {};
                modulatorSet.modulators = schema.modulators.map(function(schema) {
                    return new Modulator(schema);
                });
                modulatorSets.push(modulatorSet);
            });


            timer.setInterval(function() {
                if (synthesizer.volume != volume) {
                    volume = synthesizer.volume;
                    console.log("volume?",volume);
                    getAllModulators().forEach(function(modulator) {
                        modulator.volume = volume;
                    })
                }
            }, 1);

            this.volume = volume;
            this.play = play;
            this.stop = stop;
            this.name = schema.name;

        };

        return {
            getSynth: function(schema) {
                return new Synthesizer(schema);
            },
            getModulator: function(schema) {
                return new Modulator(schema);
            },
            getContext: function() {
                return audioContext;
            },
            timer: timer,
        }
    }

    window.Jukebox = new JukeboxConstructor();
