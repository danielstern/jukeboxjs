var jukebox = new Jukebox();

var modulator1 = jukebox.getModulator(JBSCHEMA.synthesizers['Omaha DS6']);
var modulator2 = jukebox.getModulator(JBSCHEMA.synthesizers['Omaha DS6']);

var drums = new Drums();

var timer = jukebox.timer;
// window.on('click',function(){

var keys = new jukebox.getSynth({schema:JBSCHEMA.synthesizers['Omaha DS6']});
var drums = new jukebox.getSynth({schema:JBSCHEMA.synthesizers['Phoster P52 Drum Unit']});

// })
// drums.tone(0);

angular.module("Demo",[])
.run(function($rootScope){
  $rootScope.playNote = function(modulator,tone,duration) {
    console.log("playing tone",tone);
    modulator.setFrequency(tone);
    modulator.play();
    timer.setTimeout(modulator.stop,duration);
  };

  $rootScope.modulator1 = modulator1;

  $rootScope.$watch('frequency',function(freq){
    console.log("freq change",freq);
    modulator1.setFrequency(freq);
  })



})

// synth(440);
// synth(690);
var _dur = 500;
var theme = function() {
  var notes = [{
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
  }]
  timer.setSequence(notes.map(function(note) {
      return {
          timeout: note.duration,
          callback: function() {
              playNote(note.frequency, note.duration - 10);
          }
      }
  }))
	// synth.sequence();

	// _dur *= 0.9;
	
}

function playNote (tone,duration) {
  console.log("playing tone",tone);
  modulator.setFrequency(tone);
  modulator.play();
  timer.setTimeout(modulator.stop,duration);
};


var bpm = 80;
var bps = bpm / 60;

var drumsPlaying = false;
var drumsInterval;

var marioPlaying = false;
var playMario = function(){

  if (marioPlaying) {
    synth.endSequence();
    marioPlaying = false;
    return;
  }
  var seq =  timer.setSequence(mario.map(function(note) {
      return {
          timeout: note.duration,
          callback: function() {
              playNote(note.frequency, note.duration - 10);
          }
      }
  }))
  marioPlaying = true;
}
