(function(window){
"use strict";
var JukeboxConstructor = function(ActionTimer, transforms) {
    var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
    var timer = new ActionTimer();

    var Modulator = function(options) {

        var volume = options.volume || 1,
            modulator = this,
            envelope = options.envelope,
            context = audioContext,
            playing = false,
            pitchbend = 0,
            playingOscillators = [],
            phase = 0,
            bend = 0,
            frequency = options.frequency || 440;

        function refreshOscillatorFrequencies() {
          if (frequency < 0) {
              return;
          }

          playingOscillators.forEach(function(oscillator) {
              oscillator.frequency.value = +frequency + +bend;
          })
        }


        function play() {

          console.log("Play...",frequency);

            if (playing) {
                stop();
            };
            if (frequency <= 0) {
                return;
            }

            if (frequency !== modulator.frequency) {
              frequency = modulator.frequency;
              refreshOscillatorFrequencies();
            }

            playing = true;

            options.oscillators.forEach(function(oscillatorDefinition) {
                var oscillator = context.createOscillator();
                oscillator.type = oscillatorDefinition;

                var gain = audioContext.createGain();
                gain.connect(audioContext.destination);

                oscillator.frequency.value = frequency;

                transforms.easeGainNodeLinear({
                    node: gain,
                    end: volume,
                    start: 0,
                    duration: envelope.timeIn,
                    context: context
                });

                oscillator.noteOn(0);
                oscillator.gain = gain;
                oscillator.connect(gain);
                playingOscillators.push(oscillator);

                return oscillator;
            });

            refreshOscillatorFrequencies();
        }

        function stop() {
            if (!playing) {
                return;
            }
            playing = false;
            var fadingOscillators = [];
            playingOscillators.forEach(function(oscillator) {
                transforms.easeGainNodeLinear({
                    node: oscillator.gain,
                    end: 0,
                    start: volume,
                    duration: envelope.timeIn,
                    context: context
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

        // function setEnvelope(_envelope) {
        //     envelope = _envelope;
        // }

        timer.setInterval(function() {
            phase++;

            modulator.frequency = +modulator.frequency;
            if (modulator.frequency <= 0) {
              console.log("Frequency is too little. stopping")
              stop();
              return;
            }

            if (options.adjustor) {
                options.adjustor(modulator, phase);
            };

            if (bend !== modulator.bend) {
              bend = modulator.bend;
              refreshOscillatorFrequencies();
            }

            frequency = +frequency;

            if (frequency !== modulator.frequency) {
              frequency = modulator.frequency;
              refreshOscillatorFrequencies();
            }
            // if (frequency < 0) {
            // }
            if (volume !== modulator.volume) {
              playingOscillators.forEach(function(){
                transforms.easeGainNodeLinear({
                    node: oscillator.gain,
                    start: volume,
                    end: modulator.volume,
                    duration: 1,
                    context: context
                })
              })
              volume = modulator.volume;
            }

            if (modulator.envelope.timeIn !== envelope.timeIn || modulator.envelope.timeOut != envelope.timeOut) {
              envelope = modulator.envolope;
            }


        }, 1);

        this.play = play;
        this.stop = stop;
        // this.setFrequency = setFrequency;
        // this.setEnvelope = setEnvelope;
        this.envelope = envelope;
        // this.setVolume = setVolume;
        this.volume = volume;
        this.bend = bend;
        // this.bendPitch = bendPitch;
        this.frequency = frequency;
    };

    var Synthesizer = function(schema) {

        var modulatorSets = [],
            keyModulatorMap = [],
            map = schema.toneMap,
            polyphony = schema.polyphony || [0,0,0,0];


        polyphony.forEach(function(){
            var modulatorSet = {};
            modulatorSet.modulators = schema.modulators.map(function(schema) {
                return new Modulator(schema);
            });
            modulatorSets.push(modulatorSet);
        });

        var setVolume = function(volume) {
            // modulators.forEach(function(oscillator) {
            //     oscillator.gain.value = volume;
            // })
        }

        function releaseModulator() {
          var set = modulatorSets.sort(function(a,b){
            return a.timePressed - b.timePressed;
          })[0];
          // set.modulators.forEach(function(modulator){
          //   modulator.stop();
          // });
          set.release();
          set.playing = false;
          return set;
        }

        function getFreeModulatorSet() {
            var freeSets = modulatorSets.filter(function(set) {
                return !set.playing;
            })

            if (!freeSets[0]) {
              return releaseModulator();
            }
            return freeSets[0];
        }

        var play = function(tone) {
      
            var processor;
            if (typeof map.processor === "function") {
                processor = map.processor;
            } else {
                processor = map.processor[tone];
            }

            var modulatorSet = getFreeModulatorSet();
            var release = processor(modulatorSet.modulators, tone, timer);

            modulatorSet.playing = true;
            modulatorSet.release = release,
            modulatorSet.timePressed= timer.getTimeNow();

        }

        return {
            setVolume: setVolume,
            play: play,
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
        timer: timer,
    }
}

window.Jukebox = new JukeboxConstructor(ActionTimer,transforms);
})(window);