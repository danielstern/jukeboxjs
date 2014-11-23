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
	_oscillator: function() {
        var _oscillator = Jukebox.NativeOscillatorFactory();

        var factory = this;
        var _oscillatorRunning = false;

        factory.wave = "SINE";

        this.start = function() {
            factory.playing = true;
        }

        this.stop = function() {
            factory.playing = false;
        }

        setInterval(adjustvalues, 10);

        function adjustvalues() {
            if (_oscillator.frequency.value !== factory.frequency) {
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
		var osc = new Jukebox._oscillator();
		osc.wave = "TRIANGLE";
		var osc2 = new Jukebox._oscillator();
		osc.wave = "SQUARE";
		oscillators.push(osc,osc2);

		this.sequence = function(notes) {
			var durationSoFar = 0;
			notes.forEach(function(element){
				setTimeout(function(){
					synth.tone(element.frequency,element.duration-10);
				},durationSoFar);
				durationSoFar += element.duration;
			})
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
	}
}

var synth = new Jukebox.Synth();
var synth2 = new Jukebox.Synth();
// synth(440);
// synth(690);
var _dur = 500;
var beep = function(){
	// cpmsp;e/
	console.log("Beep");
	// synth.tone(550);
	// synth2(550 * 1.5);
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