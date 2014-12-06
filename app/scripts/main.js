var jukebox = new Jukebox();
var timer = jukebox.timer;

var modulator1 = jukebox.getModulator(JBSCHEMA.modulators['Tabernackle T4']);

var keys = new jukebox.getSynth({schema:JBSCHEMA.synthesizers['Omaha DS6']});
var drums = new jukebox.getSynth({schema:JBSCHEMA.synthesizers['Phoster P52 Drum Unit']});

angular.module("Demo",[])
.run(function($rootScope){
  $rootScope.playNote = function(modulator,tone,duration) {
    modulator1.setFrequency(tone);
    modulator1.play();
    timer.setTimeout(modulator.stop,duration);
  };

  var modulator1Settings = {};

  $rootScope.modulator1Settings = modulator1Settings;


  $rootScope.modulator1 = modulator1;
  $rootScope.keys = keys;

  $rootScope.synthNotes = [];
  for (var i = 0; i < 22; i++) {
     $rootScope.synthNotes.push(i);
  }

  $rootScope.$watch('modulator1Settings',function(modulator1Settings){
    modulator1.setFrequency(modulator1Settings.frequency);
    modulator1.setVolume(modulator1Settings.volume === 0 ? 0 : modulator1Settings.volume || 1);
  },true);

})

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
}

function playNote (tone,duration) {
  modulator1.setFrequency(tone);
  modulator1.play();
  timer.setTimeout(modulator1.stop,duration);
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
