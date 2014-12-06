var Jukebox = function() {

    if (window.jukeboxAudioContext) {
        audioContext = jukeboxAudioContext;
    } else {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        window.jukeboxAudioContext = audioContext;
    }
    var timer = new jukeboxTimer();

    var Modulator = function(options) {

      var volume = options.volume || 1,
          modulator = this,
          envelope = options.envelope,
          context = audioContext,
          playing = false,
          pitchbend = 0;
          playingOscillators = [],
          frequency = options.frequency || 440;

      var setVolume = function(_volume) {
          playingOscillators.forEach(function(oscillator) {
             transforms. easeGainNodeLinear({
                  node: oscillator.gain,
                  start: volume,
                  end: _volume,
                  duration: 100,
                  context:context
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
              refreshOscillatorFrequencies();
          };
      },1);

      function bendPitch(bend) {
        pitchbend = bend;
      }

      function refreshOscillatorFrequencies() {
        playingOscillators.forEach(function(oscillator){
          oscillator.frequency.value = +frequency + +pitchbend;
        })
      }



      var play = function() {

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

              transforms.easeGainNodeLinear({
                  node: gain,
                  end: volume,
                  start: 0,
                  duration: envelope.timeIn,
                  context:context
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
              transforms.easeGainNodeLinear({
                  node: oscillator.gain,
                  end: 0,
                  start: volume,
                  duration: envelope.timeIn,
                  context:context
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
