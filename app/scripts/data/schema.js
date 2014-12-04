var SINE = 'sine';
var SAW = 'sawtooth';
var TRIANGLE = 'triangle';
var SQUARE = 'square';

var JBSCHEMA = {

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
    }
}

JBSCHEMA.modulators = modulators;
JBSCHEMA.synthesizers = synthesizers;