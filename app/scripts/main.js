var jukebox = new Jukebox();

var synth = jukebox.getSynth();
var synth2 = jukebox.getSynth();

var drums = jukebox.getDrums();

// window.on('click',function(){

// })
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

var bpm = 80;
var bps = bpm / 60;

var drumsPlaying = false;
var drumsInterval;
var playDrums = function(){
  console.info("Thank you for playing drums. They are not available at this time.")
  // if (drumsPlaying) {
  //   drumsInterval.forEach(function(drum){
  //     clearInterval(drum)
  //   });
  //   drumsPlaying = false;
  //   return;
  // }

  // drumsPlaying = true;
  // drumsInterval=[jukebox.timer.setInterval(function(){
  //   drums.kickdrum();
  // }, 1000 / bps),
  // jukebox.timer.setInterval(function(){
  //   drums.snare();
  // }, 2000 / bps),
  // jukebox.timer.setInterval(function(){
  //   drums.cymbal();
  // }, 8000 / bps),
  // jukebox.timer.setInterval(function(){
  //   drums.hihat();
  // }, 500 / bps)]
  
}

var marioPlaying = false;
var playMario = function(){
  if (marioPlaying) {
    synth.endSequence();
    marioPlaying = false;
    return;
  }
  var seq = synth.sequence(mario);
  marioPlaying = true;
}
