(function(window){
"use strict";
var JukeboxConstructor = function(ActionTimer, transforms) {
    var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
    var timer = new ActionTimer();

    window.addEventListener("touchstart",function twiddle(){
      var _oscillator = audioContext.createOscillator().noteOn(0.1);
      window.removeEventListener("touchstart",twiddle);
    });


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
            willPlay = false,
            willStop = false,
            frequency = options.frequency || 440;

        function refreshOscillatorFrequencies() {

          playingOscillators.forEach(function(oscillator) {
              oscillator.frequency.value = +frequency + +bend;
          })
        }


        function play() {
           willPlay = true;
        }

        function stop() {
          willStop = true;
        }

        function handleStateUpdate() {
            phase++;
            modulator.frequency = +modulator.frequency;
            modulator.volume = +modulator.volume;
            modulator.bend = +modulator.bend;

            if (options.adjustor) {
                options.adjustor(modulator, phase);
            };

            if (bend !== modulator.bend) {
              bend = modulator.bend;
              refreshOscillatorFrequencies();
            }


            if (frequency !== modulator.frequency && !willStop) {
              frequency = modulator.frequency;
              refreshOscillatorFrequencies();
            }

            if (volume !== modulator.volume && !willStop) {
              playingOscillators.forEach(function(oscillator){
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
              // console.log("Updating envelope...",modulator.e)
              envelope = modulator.envelope;
            }

            if (willPlay && !playing) {
              willPlay = false;
              playing = true;

              options.oscillators.forEach(function(oscillatorDefinition) {
                  var oscillator = context.createOscillator();
                  oscillator.type = oscillatorDefinition;

                  var gain = audioContext.createGain();
                  gain.connect(audioContext.destination);

                  oscillator.frequency.value = +frequency +bend;

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
              });

              // willStop = false;

            } else if (willStop && playing) {
              willStop = false;
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
        }

        timer.setInterval(handleStateUpdate, 1);

        this.play = play;
        this.stop = stop;
        this.envelope = envelope;
        this.volume = volume;
        this.bend = bend;
        this.frequency = frequency;
    };

    var Synthesizer = function(schema) {

        var modulatorSets = [],
            keyModulatorMap = [],
            map = schema.toneMap,
            synthesizer = this,
            volume = 1,
            polyphony = schema.polyphony || [0,0,0,0];


        function getAllModulators() {
          var allModulators = [];
          modulatorSets.forEach(function(set){
            allModulators = allModulators.concat(set.modulators);
          });

          return allModulators;
        }

        // function releaseModulator() {
        //   var set = modulatorSets.sort(function(a,b){
        //     return a.timePressed - b.timePressed;
        //   })[0];
        //   set.modulators.forEach(function(modulator){
        //     modulator.stop();
        //   });
        //   set.playing = false;
        //   return set;
        // }

        function getFreeModulatorSet() {
            var freeSets = modulatorSets.filter(function(set) {
                return !set.playing;
            })

            if (!freeSets[0]) {
              // return releaseModulator();
              return;
            }
            return freeSets[0];
        }

        function play (tone) {

            if (keyModulatorMap[tone]) {
              keyModulatorMap[tone].release();
            }
        
            var processor;
            if (typeof map.processor === "function") {
                processor = map.processor;
            } else {
                processor = map.processor[tone];
            }

            var modulatorSet = getFreeModulatorSet();
            if (modulatorSet) {
              processor(modulatorSet.modulators, tone, timer);
            }

            modulatorSet.playing = true;
            modulatorSet.currentTone = tone;
            modulatorSet.timePressed= timer.getTimeNow();

        }

        function stop(tone) {
          modulatorSets.filter(function(set){
            return set.currentTone === tone;
          })
          .forEach(function(set){
            set.modulators.forEach(function(modulator){
              modulator.stop();
            })
            set.playing = false;
            set.currentTone = undefined;
          })
        }

        polyphony.forEach(function(){
            var modulatorSet = {};
            modulatorSet.modulators = schema.modulators.map(function(schema) {
                return new Modulator(schema);
            });
            modulatorSets.push(modulatorSet);
        });

        timer.setInterval(function() { 
          if (synthesizer.volume != volume) {
            volume = synthesizer.volume;
            getAllModulators().forEach(function(modulator){
              modulator.volume = volume;
            })
          }
        },1);

        this.volume = volume;
        this.play = play;
        this.stop = stop;

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