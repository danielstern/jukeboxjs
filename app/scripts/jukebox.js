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



        var play = function() {
            if (playing) {
              stop();
            }
            playing = true;

            oscillators = options.oscillators.map(function(oscillatorDefinition) {
                var oscillator = context.createOscillator();
                return oscillator;
            });

            oscillators.forEach(function(oscillator) {

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

                oscillator.noteOn(1)
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
