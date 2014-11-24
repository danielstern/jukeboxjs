var Jukebox = function() {
  var jukebox = this;
	this.audioContext =  new webkitAudioContext();
  this.timer = new jukeboxTimer();
  this.filter = new webAudioFilterPack(this.audioContext);

  this.gainNode = function(options) {
      var gain = jukebox.audioContext.createGain();
      gain.connect(jukebox.audioContext.destination);
      gain.gain.value = 0.5;
      return gain;
  };

  this.oscillator = function(options) {
        var context = jukebox.audioContext;
        var oscillator = this;
        var target = undefined;
        var _oscillator = context.createOscillator();

        this.gain = new jukebox.gainNode();
        this.frequency = options.frequency;

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
	this.Synth = function() {
		var synth = this;		

		var oscillators = [];
		var osc = new jukebox.oscillator({wave:"SINE"});
		var osc2 = new jukebox.oscillator({wave:"SQUARE"});
    oscillators.push(osc);
		oscillators.push(osc2);

    var currentSequence = undefined;

		this.sequence = function(notes) {
      if (currentSequence) {
        jukebox.timer.clearSequence(currentSequence);
      }
      currentSequence = jukebox.timer.setSequence(notes.map(function(note){
        return {
          timeout: note.duration,
          callback: function() {
            synth.tone(note.frequency,note.duration-10);  
          }
        }
      }))
		}

		this.tone = function(freq,duration) {
			oscillators.forEach(function(osc){
				osc.frequency = freq;
				if (freq < 0) {
					return;
				}
				osc.start();
				jukebox.timer.setTimeout(function(){
					osc.stop();
				},duration);
			})
		};
	},
  this.Drums = function() {
    
    var drums = this;
    var context = jukebox.audioContext;


    // oscillators[0].connect(effect);
    // oscillators[1].connect(effect);

    this.kickdrum = function(){

      var oscillators = [];
      oscillators.push(new jukebox.oscillator({wave:"SINE"}));
      oscillators.push(new jukebox.oscillator({wave:"SINE"}));

      oscillators.forEach(function(osc){
        var freq = 30;
        osc.frequency = freq;
        osc.start();

        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5); // envelope  

      })
    }

    this.cymbal = function () {
      var oscillators = [];
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:550}));
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:630}));
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:720}));


      oscillators.forEach(function(osc){

        osc.start();
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.03); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5); // envelope  
      })
    }

    this.hihat = function () {
      var oscillators = [];
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:700}));
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:720}));
      oscillators.push(new jukebox.oscillator({wave:"SQUARE",frequency:740}));
      oscillators.push(new jukebox.oscillator({wave:"SQUARE",frequency:780}));
      oscillators.push(new jukebox.oscillator({wave:"TRIANGLE",frequency:800}));
      oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:850}));
      // oscillators.push(new jukebox.oscillator({wave:"SINE",frequency:720}));

      oscillators.forEach(function(osc){

        osc.start();
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.03); // envelope  
      })
    }




    this.snare = function(){

      var oscillators = [];

      oscillators.push(new jukebox.oscillator({wave:"SINE"}));
      oscillators.push(new jukebox.oscillator({wave:"SINE"}));

      oscillators[0].frequency = 220;
      oscillators[1].frequency = 270;

      oscillators.forEach(function(osc){
        osc.start();

        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.10); // envelope  
      })

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
