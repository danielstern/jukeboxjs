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

        options.oscillators = options.oscillators || ["square", 'triangle', 'sawtooth', 'sine'];
        options.effects = options.effects || [];
        options.frequency = options.frequency || 440;
        options.noteLength = options.noteLength || 300;
        options.envelope = {
            timeIn: 300,
            timeOut: 300,
        };

        var envelope = options.envelope;

        var context = audioContext,
            targetAudioNode,
            oscillators = [],
            playing = false,
            gain,
            playingOscillators = [],
            frequency = options.frequency;

        function easeGainNodeLinear(options) {
            var node = options.node;
            var duration = options.duration;
            var start = options.start;
            var end = options.end;

            var startGain = node.gain.value;
            var endGain = end;
            var steps = 50;
            var timePerStep = duration / steps;
            var difference = startGain - endGain;

            for (var currentStep = 1; currentStep <= steps; currentStep++) {
                var volumeAtStep = startGain - difference / steps * currentStep;
                var timeAtStep = context.currentTime + timePerStep * currentStep / 10000;
                node.gain.setValueAtTime(volumeAtStep, timeAtStep);
            }
        }

        var play = function() {
            if (playing) {
                stop();
            }
            playing = true;

            options.oscillators.forEach(function(oscillatorDefinition) {
                var oscillator = context.createOscillator();
                oscillator.type = oscillatorDefinition;

                var gain = audioContext.createGain();
                gain.connect(audioContext.destination);

                if (playing) {
                    oscillator.frequency.value = frequency;
                } else {
                    oscillator.frequency.value = 0;
                }

                easeGainNodeLinear({
                    node: gain,
                    end: 1,
                    start: 0,
                    duration: envelope.timeIn
                });

                oscillator.noteOn(0);
                oscillator.gain = gain;
                oscillator.connect(gain);
                playingOscillators.push(oscillator);

                return oscillator;
            });
        }

        var stop = function() {
            if (!playing) {
                return;
            }
            playing = false;
            var fadingOscillators = [];
            playingOscillators.forEach(function(oscillator) {
                easeGainNodeLinear({
                    node: oscillator.gain,
                    end: 0,
                    start: 1,
                    duration: envelope.timeIn
                });
            });
            while (playingOscillators[0]) {
                fadingOscillators.push(playingOscillators.pop());
            };

            timer.setTimeout(function() {
                fadingOscillators.forEach(function(oscillator) {
                    oscillator.noteOff(0);
                    fadingOscillators.splice(fadingOscillators.indexOf(oscillator), 1);
                });
            }, 1000)
        }

        var setEnvelope = function(_envelope) {
          envelope = _envelope;
        }

        var setFrequency = function(_frequency) {
            frequency = _frequency;
            oscillators.forEach(function(oscillator) {
                oscillator.frequency.value = frequency;
            });
        }

        return {
            play: play,
            stop: stop,
            setFrequency: setFrequency,
            setEnvelope: setEnvelope,
        }
    };

    var Synthesizer = function(options) {
        options = options || {};
        options.schema = options.schema || JBSCHEMA.synthesizers['Omaha DS6'];

        var modulators = [],
            currentSequence;



        modulators = options.schema.modulators.map(function(schema) {
            return new Modulator({
                oscillators: schema.oscillators
            });
        });

        var setVolume = function(volume) {
            oscillators.forEach(function(oscillator) {
                // oscillator.gain.value = volume;
            })
        }

        var endSequence = function() {
            if (currentSequence) {
                timer.clearSequence(currentSequence);
            }
        }

        var play = function(tone) {
          console.log("playing tone...",tone);
          var map = options.schema.toneMap;
          var toneSchema;
          var processor; 
          if (map.type == "custom") {
             toneSchema = map.tones[tone];
             toneSchema.processor(Modulator,tone,timer);
          } else {
            toneSchema = map.tones[0];
            modulators.forEach(function(modulator){
              toneSchema.processor(modulator,tone,timer);
            })
          }          
        }

        // var tone = function(freq, duration) {
        //     modulators.forEach(function(modulator) {
        //         modulator.setFrequency(freq);
        //         if (freq < 0) {
        //             return;
        //         }
        //         modulator.play();
        //         timer.setTimeout(function() {
        //             modulator.stop();
        //         }, duration);
        //     })
        // };

        return {
            setVolume: setVolume,
            // tone: tone,
            play:play,
            // sequence: sequence,
            endSequence: endSequence,
        }
    };

    return {
        getSynth: function(options) {
            return new Synthesizer(options);
        },
        getModulator: function(options) {
            return new Modulator(options);
        },
        getContext: function() {
            return audioContext;
        },
        timer:timer,
    }
}
