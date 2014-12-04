var Drums = function() {

  var jukebox = new Jukebox;

    var drums = this;
    var context = jukebox.getContext();;

    var kickoscillators = [
      jukebox.getModulator({wave:"SINE"}),
      jukebox.getModulator({wave:"SINE"}),
      jukebox.getModulator({wave:"SINE"})
    ];

    this.kickdrum = function(){
      kickoscillators.forEach(function(osc){
        var freq = 40;
        osc.setFrequency(freq);
        osc.play();

        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5); // envelope  

      })
    }

    var cymbalOscillators = [jukebox.getModulator({wave:"SINE",frequency:550}),jukebox.getModulator({wave:"SINE",frequency:630}),jukebox.getModulator({wave:"SINE",frequency:720})];
    this.cymbal = function () {

      cymbalOscillators.forEach(function(osc){
        osc.play();
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.03); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5); // envelope  
      })
    }

    var hihatoscillators = [
      jukebox.getModulator({wave:"SINE",frequency:700}),
      jukebox.getModulator({wave:"SINE",frequency:720}),
      jukebox.getModulator({wave:"SQUARE",frequency:740})
    ];
    this.hihat = function () {

      hihatoscillators.forEach(function(osc){

        osc.play();
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.03); // envelope  
      })
    }

    var snareOscillators = [
      jukebox.getModulator({wave:"SINE",frequency:220}),
      jukebox.getModulator({wave:"SINE",frequency:270}),
      jukebox.getModulator({wave:"TRIANGLE",frequency:300})
    ];
    this.snare = function(){

      snareOscillators.forEach(function(osc){
        osc.play();

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
        case 2:
        this.hihat();
        break;
        case 3:
        this.cymbal();
        break;
      }

    };

  }