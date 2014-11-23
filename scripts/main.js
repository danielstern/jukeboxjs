console.log('\'Allo \'Allo!');

(function (global, exports, perf) {
  'use strict';

  function fixSetTarget(param) {
    if (!param)	// if NYI, just return
      return;
    if (!param.setTargetValueAtTime)
      param.setTargetValueAtTime = param.setTargetAtTime; 
  }

  if (window.hasOwnProperty('AudioContext') /*&& !window.hasOwnProperty('webkitAudioContext') */) {
    window.webkitAudioContext = AudioContext;

    if (!AudioContext.prototype.hasOwnProperty('internal_createGain')){
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function() { 
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDelay')){
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function() { 
        var node = this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBufferSource')){
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function() { 
        var node = this.internal_createBufferSource();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteGrainOn)
          node.noteGrainOn = node.start;
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.playbackRate);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDynamicsCompressor')){
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function() { 
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBiquadFilter')){
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function() { 
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        var enumValues = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF', 'PEAKING', 'NOTCH', 'ALLPASS'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createOscillator') &&
         AudioContext.prototype.hasOwnProperty('createOscillator')) {
      AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() { 
        var node = this.internal_createOscillator();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        var enumValues = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE', 'CUSTOM'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        if (!node.hasOwnProperty('setWaveTable')) {
          node.setWaveTable = node.setPeriodicTable;
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createPanner')) {
      AudioContext.prototype.internal_createPanner = AudioContext.prototype.createPanner;
      AudioContext.prototype.createPanner = function() {
        var node = this.internal_createPanner();
        var enumValues = {
          'EQUALPOWER': 'equalpower',
          'HRTF': 'HRTF',
          'LINEAR_DISTANCE': 'linear',
          'INVERSE_DISTANCE': 'inverse',
          'EXPONENTIAL_DISTANCE': 'exponential',
        };
        for (var enumValue in enumValues) {
          var newEnumValue = enumValues[enumValue];
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('createGainNode'))
      AudioContext.prototype.createGainNode = AudioContext.prototype.createGain;
    if (!AudioContext.prototype.hasOwnProperty('createDelayNode'))
      AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay;
    if (!AudioContext.prototype.hasOwnProperty('createJavaScriptNode'))
      AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor;
    if (!AudioContext.prototype.hasOwnProperty('createWaveTable'))
      AudioContext.prototype.createWaveTable = AudioContext.prototype.createPeriodicWave;
  }
}(window));


var Jukebox = {
	audioContext:  new webkitAudioContext(),
	NativeOscillatorFactory: function() {
        	var audioContext = Jukebox.audioContext;
            var _oscillator = audioContext.createOscillator(); // Create sound source
            _oscillator.connect(audioContext.destination); // Connect sound to output
            return _oscillator;
    },
	_oscillator: function(options) {
        var _oscillator = Jukebox.NativeOscillatorFactory();

        var factory = this;
        var _oscillatorRunning = false;

        factory.wave = options.wave || "SINE";

        this.start = function() {
            factory.playing = true;
        }

        this.stop = function() {
            factory.playing = false;
        }

        setInterval(adjustvalues, 10);

        function adjustvalues() {
        	// console.log("Frequency?",factory.frequency);
            if (_oscillator.frequency.value !== factory.frequency && factory.frequency) {
                _oscillator.frequency.value = factory.frequency;
            }

            if (factory.playing) {
                factory._startTone();
            } else {
                factory._stopTone();
            }

            _oscillator.type = _oscillator[factory.wave];
        };


        this._startTone = function() {
            if (_oscillatorRunning) return;
            _oscillator = Jukebox.NativeOscillatorFactory()
            _oscillator.frequency.value = factory.frequency;
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
		var osc = new Jukebox._oscillator({wave:"SINE"});
		var osc2 = new Jukebox._oscillator({wave:"SQUARE"});
    oscillators.push(osc);
		oscillators.push(osc2);

    var sequenceQueuedActions = [];

		this.sequence = function(notes) {
      sequenceQueuedActions.forEach(function(action,index){
        console.log("Clearing note...",action);
        clearTimeout(action);
        // sequenceQueuedActions.splice(index,action);
      });
			var durationSoFar = 0;
			notes.forEach(function(element){
				sequenceQueuedActions.push(setTimeout(function(){
					synth.tone(element.frequency,element.duration-10);
				},durationSoFar));
				durationSoFar += element.duration;
			});
		}

		this.tone = function(freq,dur) {
			oscillators.forEach(function(osc){
				osc.frequency = freq;
				if (freq < 0) {
					return;
				}
				osc.start();
				setTimeout(function(){
					osc.stop();
				},dur);
			})
		};
	},
  Drums: function() {
    var drums = this;

    var oscillators = [];
    var triangle = new Jukebox._oscillator({wave:"TRIANGLE"});
    var square = new Jukebox._oscillator({wave:"SQUARE"});
    oscillators.push(triangle);
    oscillators.push(square);

    this.kickdrum = function(){
      console.log("BOOM");
      oscillators.forEach(function(osc){
        var freq = 70;
        osc.frequency = freq;
        osc.start();
        setTimeout(function(){
          osc.stop();
          clearInterval(adjust);
        },60);
        var adjust = setInterval(function(){
          console.log("lower tone");
          freq -= 10;
          osc.freq = freq;
        },10)
      })
    }

    this.snare = function(){
      console.log("KSH");
      oscillators[0].frequency = 178;
      oscillators[1].frequency = 155;

      oscillators[0].start();
      oscillators[1].start();

      setTimeout(function(){
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

var synth = new Jukebox.Synth();
var synth2 = new Jukebox.Synth();

var drums = new Jukebox.Drums();
// drums.tone(0);

// synth(440);
// synth(690);
var _dur = 500;
var theme = function() {
	synth.sequence([{
		frequency:294,
		duration:_dur,
	},{
		frequency:330,
		duration:_dur,
	},{
		frequency:262,
		duration:_dur,
	},{
		frequency:131,
		duration:_dur,
	},{
		frequency:196,
		duration:_dur,
	}]);

	_dur *= 0.9;
	
}
var beep = function(){
	// cpmsp;e/

	// console.log("Beep");
	// synth.tone(550);
	// synth2(550 * 1.5);
}

var playMario = function(){
  synth.sequence(mario);
}

var mario = [{frequency:660 , duration:100},
{ frequency:-1 , duration : 150},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:510 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:770 , duration:100},
{frequency:-1 , duration : 550},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 575},
{ frequency:510 , duration:100},
{frequency:-1 , duration : 450},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 400},
{ frequency:320 , duration:100},
{frequency:-1 , duration : 500},
{ frequency:440 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:480 , duration:80},
{frequency:-1 , duration : 330},
{ frequency:450 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 200},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 200},
{ frequency:760 , duration:50},
{frequency:-1 , duration : 150},
{ frequency:860 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:700 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:760 , duration:50},
{frequency:-1 , duration : 350},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:520 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:580 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:480 , duration:80},
{frequency:-1 , duration : 500},
{ frequency:510 , duration:100},
{frequency:-1 , duration : 450},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 400},
{ frequency:320 , duration:100},
{frequency:-1 , duration : 500},
{ frequency:440 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:480 , duration:80},
{frequency:-1 , duration : 330},
{ frequency:450 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 200},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 200},
{ frequency:760 , duration:50},
{frequency:-1 , duration : 150},
{ frequency:860 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:700 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:760 , duration:50},
{frequency:-1 , duration : 350},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:520 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:580 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:480 , duration:80},
{frequency:-1 , duration : 500},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:570 , duration:100},
{frequency:-1 , duration : 220},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:200},
{frequency:-1 , duration : 300},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:570 , duration:100},
{frequency:-1 , duration : 420},
{ frequency:585 , duration:100},
{frequency:-1 , duration : 450},
{ frequency:550 , duration:100},
{frequency:-1 , duration : 420},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 360},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:570 , duration:100},
{frequency:-1 , duration : 220},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:200},
{frequency:-1 , duration : 300},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:1020 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:760 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:720 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:680 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:620 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:650 , duration:150},
{frequency:-1 , duration : 300},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:570 , duration:100},
{frequency:-1 , duration : 420},
{ frequency:585 , duration:100},
{frequency:-1 , duration : 450},
{ frequency:550 , duration:100},
{frequency:-1 , duration : 420},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 360},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 350},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:580 , duration:80},
{frequency:-1 , duration : 350},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:380 , duration:80},
{frequency:-1 , duration : 600},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 350},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:580 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 550},
{ frequency:870 , duration:80},
{frequency:-1 , duration : 325},
{ frequency:760 , duration:80},
{frequency:-1 , duration : 600},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:500 , duration:60},
{frequency:-1 , duration : 350},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:580 , duration:80},
{frequency:-1 , duration : 350},
{ frequency:660 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:500 , duration:80},
{frequency:-1 , duration : 300},
{ frequency:430 , duration:80},
{frequency:-1 , duration : 150},
{ frequency:380 , duration:80},
{frequency:-1 , duration : 600},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 150},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:510 , duration:100},
{frequency:-1 , duration : 100},
{ frequency:660 , duration:100},
{frequency:-1 , duration : 300},
{ frequency:770 , duration:100},
{frequency:-1 , duration : 550},
{ frequency:380 , duration:100},
{frequency:-1 , duration : 575}]