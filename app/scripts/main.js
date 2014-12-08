var jukebox = Jukebox;
var timer = jukebox.timer;

var modulator1 = jukebox.getModulator(JBSCHEMA.modulators['Tabernackle T4']);
modulator1.volume = 0.2;
var modulator2 = jukebox.getModulator(JBSCHEMA.modulators['Grigsby 2260']);
modulator2.volume = 0.2;

modulator1.frequency = 440;

var keys = new jukebox.getSynth(JBSCHEMA.synthesizers["Borg Assimilator"]);
var drums = new jukebox.getSynth(JBSCHEMA.synthesizers['Phoster P52 Drum Unit']);

angular.module("Demo", ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('docs', {
                url: '/documentation',
                templateUrl: "partials/documentation.html"
            })
            .state('examples', {
                url: '/examples',
                templateUrl: "partials/examples.html"
            })
            .state('all', {
                url: '/all',
                templateUrl: "partials/all.html"
            })
            .state('home', {
                url: '/',
                templateUrl: "partials/home.html",
            })
            .state('about', {
                url: '/about',
                templateUrl: "partials/about.html",
            })
            .state('demo', {
                url: '/demo',
                templateUrl: "partials/demos.html",
            })
            .state('modulator', {
                url: '/modulator',
                templateUrl: "partials/modulator.html",
            })
            .state('synthesizer', {
                url: '/synthesizer',
                templateUrl: "partials/synthesizer.html",
            })
            .state('oscillator', {
                url: '/oscillator',
                templateUrl: "partials/oscillators.html",
            })
            .state('jukebox', {
                url: '/jukebox',
                templateUrl: "partials/jukebox.html",
            })
        $urlRouterProvider.otherwise('/');

    })
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
        $rootScope.keys = Jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6']);
        $rootScope.harmonica = Jukebox.getSynth(JBSCHEMA.synthesizers['Harmoniks Vibraphone']);
        $rootScope.drums = drums;

        $rootScope.keys.volume = 0.1;





        $rootScope.drumNotes = [0, 1, 2, 3]

        $rootScope.$watch('modulator1Settings', function(modulator1Settings) {
            console.log("Setting change", modulator1);
            if (modulator1Settings.frequency) modulator1.frequency = modulator1Settings.frequency;
            if (modulator1Settings.volume) modulator1.volume = modulator1Settings.volume === 0 ? 0 : modulator1Settings.volume || 1;
        }, true);

        timer.setInterval(function() {
            $rootScope.$apply();
        }, 10);

    })
    .controller("ModulatorDemo", function($scope) {

        var modulators = [];
        for (key in JBSCHEMA.modulators) {
            modulators.push(Jukebox.getModulator(JBSCHEMA.modulators[key]));
        }
        $scope.modulators = modulators;

        $scope.$watch('modulator', function() {
            modulators.forEach(function(mod) {
                mod.stop();
            })
        })

        $scope.modulator = $scope.modulators[0];

    })
    .controller("OscillatorDemo", function($scope) {

        $scope.sine = Jukebox.getModulator(JBSCHEMA.modulators["Roofhausen Classic Sine"]);
        $scope.sawtooth = Jukebox.getModulator(JBSCHEMA.modulators["Roofhausen Classic Sawtooth"]);
        $scope.square = Jukebox.getModulator(JBSCHEMA.modulators["Roofhausen Classic Square"]);
        $scope.triangle = Jukebox.getModulator(JBSCHEMA.modulators["Roofhausen Classic Triangle"]);

        $scope.sine.volume = 0.2;
        $scope.sine.frequency = 554.365;
        $scope.sawtooth.volume = 0.1;
        $scope.sawtooth.frequency = 659.255;
        $scope.square.volume = 0.1;
        $scope.triangle.volume = 0.2;
        $scope.triangle.frequency = 830.609;

    })
    .controller("SynthDemo", function($scope) {

        var synthesizers = [];
        for (key in JBSCHEMA.synthesizers) {
            synthesizers.push(Jukebox.getSynth(JBSCHEMA.synthesizers[key]));
        }

        $scope.synthesizers = synthesizers;

        $scope.synthesizer = synthesizers[1];

    })
    .directive("key", function() {
        return {
            restrict: "EA",
            scope: {
                note: "=",
                synth: "=",
            },
            link: function(scope, elem, attr) {

                elem.on("touchstart touchenter mousedown", function(event) {
                    event.preventDefault();
                    scope.synth.play(scope.note);
                })
                elem.on("mouseup", function(event) {
                    scope.synth.stop(scope.note);
                })
                elem.on("touchend touchcancel mouseup mouseout", function() {
                    scope.synth.stop(scope.note);
                })
                elem.on('touchcancel', function() {
                    alert("touchcancel");
                })
                elem.on('touchmove mousemove mouseout', function(event) {
                    if (event.changedTouches) {
                        var currentHover = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                        if (currentHover != elem[0]) {
                            scope.synth.stop(scope.note);
                        } else {
                            event.preventDefault();
                        }
                    }

                })
            }
        }
    })
    .directive('modulatorBasicView', function() {
        return {
            restrict: "AE",
            scope: {
                modulator: "=",
            },
            link: function(scope) {

            },
            templateUrl: "templates/modulator-basic-view.html"
        }
    })
    .directive('modulatorVisualizer', function() {
        return {
            restrict: "AE",
            scope: {
                modulator: "=",
            },
            link: function(scope) {


                scope.parseFloat = parseFloat;

                scope.getModulatorTotalFrequency = function() {
                    return (parseFloat(scope.modulator.frequency) + parseFloat(scope.modulator.bend)) / 10;
                }
            },
            templateUrl: "templates/modulator-visualizer.html"
        }
    })
    .directive('synthesizerKeyboardVisualizer', function() {
        return {
            restrict: "AE",
            scope: {
                synth: "=",
            },
            link: function(scope) {

                scope.notes = [];
                for (var i = 0; i < 22; i++) {
                    scope.notes.push(i);
                }
            },
            templateUrl: "templates/synthesizer-keyboard-visualizer.html"
        }
    })
    .directive('synthesizerPadVisualizer', function() {
        return {
            restrict: "AE",
            scope: {
                synth: "=",
            },
            link: function(scope) {

                scope.notes = [];
                for (var i = 0; i < 6; i++) {
                    scope.notes.push(i);
                }
            },
            templateUrl: "templates/synthesizer-pad-visualizer.html"
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
var seq;

var marioPlaying = false;
var playMario = function() {

    if (marioPlaying) {
        timer.clearSequence(seq);
        marioPlaying = false;
        return;
    }
    seq = timer.setSequence(mario.map(function(note) {
        return {
            timeout: note.duration,
            callback: function() {
                playNote(modulator2, note.frequency, note.duration + 10);
            }
        }
    }))
    marioPlaying = true;
}
