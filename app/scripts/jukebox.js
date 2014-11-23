var jukeboxTimer = function(){
  var targetFramerate = 1;
  var lasttime = new Date().getTime();
  var framebuffer = 0;
  var framespassed = 0;

  setInterval(function(){
    var frametime = new Date().getTime();
    var timeElapsed = frametime - lasttime;
    framebuffer += timeElapsed;
    lasttime = frametime;

    if (framebuffer > targetFramerate) {
      framebuffer-=targetFramerate;
      trigger();
    }
  },1);

  this.setInterval = function(callback,timeout,arguments) {
    var startframe = framespassed;
    var interval = setInterval(function(){
      var totaltimepassed = framespassed - startframe;
      if (totaltimepassed >= timeout) {
        callback(arguments);
      }
      startframe = framespassed;
    },1);

    return interval;
  }

  this.setTimeout = function(callback,timeout,arguments) {
    var startframe = framespassed;
    var interval = setInterval(function(){
      var totaltimepassed = framespassed - startframe;
      // console.log("Total time passed?",totaltimepassed);
      if (totaltimepassed >= timeout) {
        console.log("Interval cleared");
        callback(arguments);
        clearInterval(interval);
      }
      // startframe = framespassed;
    },1);
    
    return interval;
  }

  function trigger() {
    // console.log("A frame has passed");
    framespassed+=5;
  }
}

var Jukebox = {
	audioContext:  new webkitAudioContext(),
  timer: new jukeboxTimer(),
  // filter: {
  //   fade: function(node,volume,time) {
  //     node.linearRampToValueAtTime(volume, Jukebox.audioContext.currentTime + time / 100); // envelope
  //   }
  // },
  gainNode: function(options) {
      var gain = Jukebox.audioContext.createGain();
      gain.connect(Jukebox.audioContext.destination);
      gain.gain.value = 0.5;
      return gain;

    },

  oscillator: function(options) {
        var context = Jukebox.audioContext;
        var oscillator = this;
        var target = undefined;
        var _oscillator = context.createOscillator();

        this.gain = new Jukebox.gainNode();

        window.addEventListener("click",function twiddle(){
          _oscillator.noteOn(0.1);
          window.removeEventListener("click",twiddle);
        })
      
        var _oscillatorRunning = false;

        this.wave = options.wave || "SINE";

        this.start = function() {
            this.playing = true;
        }

        this.stop = function() {
            this.playing = false;
        }

        this.connect = function(node) {
          target = node;
        }

        setInterval(adjustvalues, 10);

        function adjustvalues() {

            if (_oscillator.frequency.value !== oscillator.frequency && oscillator.frequency) {
                _oscillator.frequency.value = oscillator.frequency;
            }

            if (oscillator.playing) {
                oscillator._startTone();
            } else {
                oscillator._stopTone();
            }

            _oscillator.type = _oscillator[oscillator.wave];
        };


        this._startTone = function() {
           if (_oscillatorRunning) return;
           _oscillator = context.createOscillator(); // Create sound source
           if (target) {
            _oscillator.connect(target); // Connect sound to output
            target.connect(oscillator.gain); // Connect sound to output
           } else {
            _oscillator.connect(oscillator.gain); // Connect sound to output 
           }
           _oscillator.connect(oscillator.gain); // Connect sound to output
           _oscillator.frequency.value = oscillator.frequency;
           _oscillator.noteOn(1);
           _oscillatorRunning = true;
        };

        this._stopTone = function() {
            if (!_oscillatorRunning) return;
            _oscillator.noteOff(1);
            _oscillatorRunning = false;
        }

        adjustvalues();
    },
	Synth : function() {
		var synth = this;		

		var oscillators = [];
		var osc = new Jukebox.oscillator({wave:"SINE"});
		var osc2 = new Jukebox.oscillator({wave:"SQUARE"});
    oscillators.push(osc);
		oscillators.push(osc2);

    var sequenceQueuedActions = [];

		this.sequence = function(notes) {
      sequenceQueuedActions.forEach(function(action,index){
        clearTimeout(action);
      });

			var durationSoFar = 0;
			notes.forEach(function(element){
				sequenceQueuedActions.push(Jukebox.timer.setTimeout(function(){
					synth.tone(element.frequency,element.duration-10);
				},durationSoFar));
				durationSoFar += element.duration;
			});
		}

		this.tone = function(freq,duration) {
			oscillators.forEach(function(osc){
				osc.frequency = freq;
				if (freq < 0) {
					return;
				}
				osc.start();
				Jukebox.timer.setTimeout(function(){
					osc.stop();
				},duration);
			})
		};
	},
  Drums: function() {
    
    var drums = this;
    var context = Jukebox.audioContext;

    var oscillators = [];

    oscillators.push(new Jukebox.oscillator({wave:"SINE"}));
    oscillators.push(new Jukebox.oscillator({wave:"SINE"}));

    var bufferSize = 4096;
    var effect = (function() {
        var b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        var node = Jukebox.audioContext.createScriptProcessor(bufferSize, 1, 1);
        node.onaudioprocess = function(e) {
            var input = e.inputBuffer.getChannelData(0);
            var output = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                b0 = 0.99886 * b0 + input[i] * 0.0555179;
                b1 = 0.99332 * b1 + input[i] * 0.0750759;
                b2 = 0.96900 * b2 + input[i] * 0.1538520;
                b3 = 0.86650 * b3 + input[i] * 0.3104856;
                b4 = 0.55000 * b4 + input[i] * 0.5329522;
                b5 = -0.7616 * b5 - input[i] * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + input[i] * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = input[i] * 0.115926;
            }
        }
        return node;
    })();

    oscillators[0].connect(effect);
    oscillators[1].connect(effect);

    this.kickdrum = function(){
      oscillators.forEach(function(osc){
        var freq = 30;
        var vol = 1;
        osc.frequency = freq;
        osc.start();
        osc.gain.gain.value = 0;
        // Jukebox.filter  
        osc.gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.05); // envelope  

        Jukebox.timer.setTimeout(function(){
          osc.stop();
        },60);
      })
    }

    this.snare = function(){
      oscillators[0].gain.gain.linearRampToValueAtTime(1,context.currentTime);
      oscillators[1].gain.gain.linearRampToValueAtTime(1,context.currentTime);

      oscillators[0].frequency = 220;
      oscillators[1].frequency = 270;

      oscillators[0].start();
      oscillators[1].start();

      Jukebox.timer.setTimeout(function(){
        oscillators[0].stop();
        oscillators[1].stop();
      },120);
    }


    this.tone = function(freq) {
      switch(freq) {
        case 0:
        this.kickdrum();
        break;
        case 1:
        this.snare();
        break;
      }

    };

  }
}
