var Jukebox = function() {
    if (window.jukeboxAudioContext) {
        audioContext = jukeboxAudioContext;
    } else {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        window.jukeboxAudioContext = audioContext;
    }
    var timer = new jukeboxTimer();
    var filter = new webAudioFilterPack(this.audioContext);

    var Modulator = function(options) {
        options = options || {};

        options.oscillators = ["SINE", "SQUARE"];
        options.effects = [];
        options.frequency = 440;
        options.noteLength = 300;

        var context = audioContext,
            targetAudioNode,
            oscillators = [],
            playing = false,
            gain,
            frequency = options.frequency,
            type = options.type || "SINE";
        gain = audioContext.createGain();
        gain.connect(audioContext.destination);

        oscillators = options.oscillators.map(function(oscillatorDefinition) {
            var oscillator = context.createOscillator();
            oscillator.type = oscillatorDefinition;
            oscillator.connect(gain);
            oscillator.noteOn(1);
            oscillator.frequency.value = 0;
            return oscillator;
        })

        var play = function() {
            playing = true;
            updateOscillators();
        }

        var stop = function() {
            playing = false;
            updateOscillators();
        }

        var updateOscillators = function() {
            oscillators.forEach(function(oscillator) {
                // var oscillator = context.createOscillator();
                // oscillator.type = oscillatorDefinition;

                if (targetAudioNode) {
                    oscillator.connect(targetAudioNode); // Connect sound to output
                    targetAudioNode.connect(gain); // Connect sound to output
                } else {
                    oscillator.connect(gain); // Connect sound to output 
                }

                oscillator.type = type;
                if (playing) {
                    oscillator.frequency.value = frequency;
                } else {
                    oscillator.frequency.value = 0;
                }
            });
        }

        var setFrequency = function(_frequency) {
            frequency = _frequency;
            updateOscillators();
        }

        // var setType = function(type) {
        //   type = wave;
        //   _oscillator.type = _oscillator[wave];
        // }

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
        var oscillators,
            currentSequence;

        if (options.oscillators) {
            oscillators = options.oscillators.map(function(schema) {
                return new Modulator({
                    oscillators: ["SINE", "SQUARE"]
                });
            });
        } else {
            oscillators = [new Modulator({
                oscillators: ["SINE", "SQUARE"]
            })];
        }

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
            oscillators.forEach(function(osc) {
                osc.setFrequency(freq);
                if (freq < 0) {
                    return;
                }
                osc.play();
                timer.setTimeout(function() {
                    osc.stop();
                }, duration);
            })
        };

        return {
            setVolume: setVolume,
            tone: tone,
            sequence: sequence,
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
