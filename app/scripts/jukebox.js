var Jukebox = function() {

    if (window.jukeboxAudioContext) {
        audioContext = jukeboxAudioContext;
    } else {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        window.jukeboxAudioContext = audioContext;
    }
    var timer = new jukeboxTimer();

    var Modulator = function(options) {

      console.log("Modulator init:", options);

      var volume = options.volume || 1;
      var modulator = this;
      var envelope = options.envelope,
          context = audioContext,
          targetAudioNode,
          playing = false,
          gain,
          pitchbend = 0;
          playingOscillators = [],
          frequency = options.frequency || 440;

      var setVolume = function(_volume) {
          playingOscillators.forEach(function(oscillator) {
              easeGainNodeLinear({
                  node: oscillator.gain,
                  start: volume,
                  end: _volume,
                  duration: 100
              })
          });
          volume = 1;
          // volume = _volume;

      }

      var phase = 0;
      timer.setInterval(function() {
          phase++;
          if (options.adjustor) {
              options.adjustor(exports, phase);
              playingOscillators.forEach(function(oscillator){
                console.log("Bending pitch...",pitchbend, frequency,frequency+pitchbend);
                oscillator.frequency.value = +frequency + +pitchbend;
              })
          }
      },1);

      function bendPitch(bend) {
        pitchbend = bend;
      }





      function easeGainNodeLinear(options) {
          var node = options.node;
          var duration = options.duration || 1;
          var start = options.start;
          var end = options.end;

          if (!options.duration) {
              console.error("no duration");
              return;
          }

          var startGain = node.gain.value;
          var endGain = end;
          var steps = 50;
          var timePerStep = duration / steps;
          var difference = startGain - endGain;

          if (difference === 0) {
              return;
          }

          for (var currentStep = 1; currentStep <= steps; currentStep++) {
              var volumeAtStep = startGain - difference / steps * currentStep;
              var timeAtStep = context.currentTime + timePerStep * currentStep / 10000;
              node.gain.setValueAtTime(volumeAtStep, timeAtStep);
          }
      }

      var play = function() {
          console.log("play note. Options?", options);
          if (playing) {
              stop();
          };
          if (frequency < 0) {
              return;
          }
          playing = true;

          options.oscillators.forEach(function(oscillatorDefinition) {
              var oscillator = context.createOscillator();
              oscillator.type = oscillatorDefinition;

              var gain = audioContext.createGain();
              gain.connect(audioContext.destination);
              
              oscillator.frequency.value = frequency;


              easeGainNodeLinear({
                  node: gain,
                  end: volume,
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
                  start: volume,
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
        console.log("Set frequency...",_frequency,typeof _frequency);
        if (!parseFloat(_frequency)) {
          return
        };

        frequency = _frequency;
        playingOscillators.forEach(function(oscillator) {
            oscillator.frequency.value = frequency;
        });
      }

      var exports = {
          play: play,
          stop: stop,
          setFrequency: setFrequency,
          setEnvelope: setEnvelope,
          setVolume: setVolume,
          bendPitch: bendPitch,
      };

      return exports;
    };

    var Synthesizer = function(options) {
        options = options || {};
        // options.schema = options.schema;

        var modulators = [],
            currentSequence;



        modulators = options.schema.modulators.map(function(schema) {
            return new Modulator(schema);
        });

        var setVolume = function(volume) {
            modulators.forEach(function(oscillator) {
                // oscillator.gain.value = volume;
            })
        }

        var play = function(tone) {
            var map = options.schema.toneMap;
            var processor;
            console.log("Play tone. Options?", options, map, typeof map.processor);
            if (typeof map.processor === "function") {
                // modulators.forEach(function(modulator) {

                // })
                processor = map.processor;
            } else {
                processor = map.processor[tone];
                // toneSchema = map.tones[tone];
                // processor(Modulator, tone, timer);
                // toneSchema = map.tones[0];
                // toneSchema.processor(Modulator, tone, timer);
            }
            processor(modulators, tone, timer);
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
