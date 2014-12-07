var jukebox = Jukebox;
var timer = jukebox.timer;

var modulator1 = jukebox.getModulator(JBSCHEMA.modulators['Tabernackle T4']);
var modulator2 = jukebox.getModulator(JBSCHEMA.modulators['Grigsby 2260']);

modulator1.frequency = 440;

var keys = new jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6']);
// var keys = new jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6']);
var drums = new jukebox.getSynth(JBSCHEMA.synthesizers['Phoster P52 Drum Unit']);

// document.body.addEventListener("touchstart",function(event){
//   console.log("started touching",event);
// })
// document.body.addEventListener('touchmove',function(event){
//   console.log("moved starting",event.changedTouches);
//   console.log("moved starting",event.touches);
//   console.log("moved starting",event.targetTouches);
// })
angular.module("Demo", [])
    .run(function($rootScope) {
        $rootScope.playNote = function(modulator, tone, duration) {
            modulator1.setFrequency(tone);
            modulator1.play();
            timer.setTimeout(modulator.stop, duration);
        };

        var modulator1Settings = {
            volume: 0.5,
            frequency: 440
        };

        $rootScope.modulator1Settings = modulator1Settings;

        $rootScope.modulator1 = modulator1;
        $rootScope.modulator2 = modulator2;
        $rootScope.keys = keys;
        $rootScope.drums = drums;

        $rootScope.parseFloat = parseFloat;

        $rootScope.synthNotes = [];
        for (var i = 0; i < 22; i++) {
            $rootScope.synthNotes.push(i);
        }

        $rootScope.drumNotes = [0,1,2,3]
        // $rootScope.drumNotes = ["kick","snare","hi","crash"]

        $rootScope.$watch('modulator1Settings', function(modulator1Settings) {
            if (modulator1Settings.frequency) modulator1.frequency = modulator1Settings.frequency;
            if (modulator1Settings.volume) modulator1.volume = modulator1Settings.volume === 0 ? 0 : modulator1Settings.volume || 1;
        }, true);

        timer.setInterval(function() {
            $rootScope.$apply();
        }, 10);

    })
    .directive("key", function() {
        return {
            restrict: "EA",
            scope: {
                note: "=",
                synth: "=",
            },
            link: function(scope, elem, attr) {
                var keys = scope.synth;
                // console.log("Key",elem);
                elem.on("touchstart touchenter mousedown", function(event) {
                    event.preventDefault();
                    keys.play(scope.note);
                })
                elem.on("mouseup", function(event) {
                    keys.stop(scope.note);
                })
                elem.on("touchend touchcancel mouseup mouseout", function() {
                    keys.stop(scope.note);
                })
                elem.on('touchcancel', function() {
                    alert("touchcancel");
                })
                elem.on('touchmove mousemove mouseout', function(event) {
                    // console.log("moved starting",event.changedTouches[0].target);
                    if (event.changedTouches) {
                        var currentHover = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                        if (currentHover != elem[0]) {
                            keys.stop(scope.note);
                            // console.log("Moved off.",currentHover,elem[0],event.changedTouches[0]);
                        } else {
                            // keys.play(scope.note);
                            event.preventDefault();
                        }
                    }

                })
            }
        }
    })

var _dur = 500;
var theme = function() {
    var notes = [{
        frequency: 294,
        duration: _dur,
    }, {
        frequency: 330,
        duration: _dur,
    }, {
        frequency: 262,
        duration: _dur,
    }, {
        frequency: 131,
        duration: _dur,
    }, {
        frequency: 196,
        duration: _dur,
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

function playNote(modulator, tone, duration) {
    if (tone < 1) return;
    modulator.frequency = tone;
    modulator.play();
    timer.setTimeout(modulator.stop, duration);
};


var bpm = 80;
var bps = bpm / 60;

var drumsPlaying = false;
var drumsInterval;

var marioPlaying = false;
var playMario = function() {

    if (marioPlaying) {
        synth.endSequence();
        marioPlaying = false;
        return;
    }
    var seq = timer.setSequence(mario.map(function(note) {
        return {
            timeout: note.duration,
            callback: function() {
                playNote(modulator2, note.frequency, note.duration + 10);
            }
        }
    }))
    marioPlaying = true;
}
