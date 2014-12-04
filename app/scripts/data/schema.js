var SINE = 'sine';
var SAW = 'sawtooth';
var TRIANGLE = 'triangle';
var SQUARE = 'square';

var JBSCHEMA = {

}

var tones = {
  "kickdrum1":{
    name:"kickdrum1",
    effect:function(modulator,tone,timer){

        var freq = 40;
        osc.setFrequency(freq);
        osc.play();

        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime); // envelope  
        osc.gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.01); // envelope  
        osc.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5); // envelope  

      }
    },
    "keyboard1":{
      name:'keyboard1',
      processor:function(modulator,tone,timer) {
        var duration = 300;
        var baseFrequency = 220; // Low A

        var freq = baseFrequency + (baseFrequency * tone / 12)
        console.log("Processor...",freq);
        modulator.setFrequency(freq);
        modulator.play();
        timer.setTimeout(function() {
          modulator.stop();
        }, duration);
      }
    }
  }

var toneMaps = {
  "Drums":{
      name:"Drums",
      type:"custom",
      tones:[tones['kickdrum1']]
    },
  "Keyboard":{
    name:"Keyboard",
    type:"linear",
    tones:[tones['keyboard1']]
  }
}

var modulators = {
    "Grigsby 2260":{
      name:"Grigsby 2260",
      oscillators:[SINE,SAW],
      envelope: {
        timeIn: 200,
        timeOut: 500,
      }
      // oscillators:[SQUARE,SAW,SINE]
    }
  };

var synthesizers = {
  "Omaha DS6": {
      name: "Omaha DS6",
      modulators: [modulators['Grigsby 2260']],
      toneMap:toneMaps["Keyboard"]
    },
  "Phoster P52 Drum Unit": {
    name: "Phoster P52 Drum Unit",
    modulators: [modulators['Grigsby 2260']],
    toneMap: toneMaps["Drums"]
  }
}

JBSCHEMA.modulators = modulators;
JBSCHEMA.synthesizers = synthesizers;