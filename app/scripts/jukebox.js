var Jukebox = function() {
    if (window.jukeboxAudioContext) {
        audioContext = jukeboxAudioContext;
    } else {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        window.jukeboxAudioContext = audioContext;
    }
    var timer = new jukeboxTimer();
    var filter = new webAudioFilterPack(this.audioContext);

    var SINE = 'sine';
    var SAW = 'sawtooth';
    var TRIANGLE = 'triangle';
    var SQUARE = 'square';

    var Modulator = function(options) {
        options = options || {};

        options.oscillators = options.oscillators || ["square",'triangle','sawtooth','sine'];
        options.effects = options.effects || [];
        options.frequency = options.frequency || 440;
        options.noteLength = options.noteLength || 300;

        var context = audioContext,
            targetAudioNode,
            oscillators = [],
            playing = false,
            gain,
            frequency = options.frequency,
        gain = audioContext.createGain();
        gain.connect(audioContext.destination);

        var play = function() {
            if (playing) {
              stop();
            }
            playing = true;

            oscillators = options.oscillators.map(function(oscillatorDefinition) {
                var oscillator = context.createOscillator();
                console.log("Type?",oscillatorDefinition);
                oscillator.type = oscillatorDefinition;
                // oscillator.type = oscillatorDefinition;
                if (targetAudioNode) {
                    oscillator.connect(targetAudioNode);
                    targetAudioNode.connect(gain);
                } else {
                    oscillator.connect(gain); 
                }

                if (playing) {
                    oscillator.frequency.value = frequency;
                } else {
                    oscillator.frequency.value = 0;
                }

                oscillator.noteOn(1)
                return oscillator;
            });

            oscillators.forEach(function(oscillator) {

         
            });
        }

        var stop = function() {
            if (!playing) {
              return;
            }
            playing = false;
            oscillators.forEach(function(oscillator) {
              oscillator.noteOff(0);
            });
        }

        var setFrequency = function(_frequency) {
            frequency = _frequency;
             oscillators.forEach(function(oscillator) {
              oscillator.frequency.value = frequency;
            });
        }

        this.connect = function(node) {
            targetAudioNode = node;
        }

        return {
            play: play,
            stop: stop,
            setFrequency: setFrequency,
            gain: gain
        }
    };

    var Synthesizer = function(options) {
        options = options || {};
        options.schema = options.schema || {
          name: "Omaha DS6ix Specifications",
          modulators: [{
            name:"Grigsby 2260",
            oscillators:[SQUARE,SAW,SINE]
          }],
        }

        var modulators = [],
            currentSequence;

        modulators = options.schema.modulators.map(function(schema) {
            return new Modulator({
                oscillators: schema.oscillators
            });
        });

        var sequence = function(notes) {
            endSequence();
            currentSequence = timer.setSequence(notes.map(function(note) {
                return {
                    timeout: note.duration,
                    callback: function() {
                        synth.tone(note.frequency, note.duration - 10);
                    }
                }
            }))
        };

        var setVolume = function(volume) {
            oscillators.forEach(function(oscillator) {
                oscillator.gain.value = volume;
            })
        }

        var endSequence = function() {
            if (currentSequence) {
                timer.clearSequence(currentSequence);
            }
        }

        var tone = function(freq, duration) {
            modulators.forEach(function(modulator) {
                modulator.setFrequency(freq);
                if (freq < 0) {
                    return;
                }
                modulator.play();
                timer.setTimeout(function() {
                    modulator.stop();
                }, duration);
            })
        };

        return {
            setVolume: setVolume,
            tone: tone,
            sequence: sequence,
            endSequence: endSequence,
        }
    };

    var Patterns = {

    }



    return {
        getSynth: function(options) {
            return new Synthesizer(options);
        },
        getModulator: function(options) {
            return new Modulator(options);
        },
        getContext: function() {
            return audioContext;
        }
    }
}
