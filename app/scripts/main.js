var jukebox = Jukebox;
var timer = jukebox.timer;

var modulator1 = jukebox.getModulator(JBSCHEMA.modulators['Tabernackle T4']);
modulator1.volume = 0.2;
var modulator2 = jukebox.getModulator(JBSCHEMA.modulators['Grigsby 2260']);
modulator2.volume = 0.2;

modulator1.frequency = 440;

var keys = new jukebox.getSynth(JBSCHEMA.synthesizers["Borg Assimilator"]);
var drums = new jukebox.getSynth(JBSCHEMA.synthesizers['Phoster P52 Drum Unit']);

angular.module("Demo", ['ui.router','ngTouch'])
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
            .state('keyboard', {
                url: '/keyboard',
                templateUrl: "partials/fullscreen-keys.html",
                controller:function($scope){

                    var notes = [];
                    for (var i = 0; i < 36; i++) {
                        notes.push(i);
                    }

                    $scope.notes = notes;

                    var sets = [];
                    while(notes[0] !== undefined) {
                         sets.push(notes.splice(notes.length-12,12));
                    }

                    var synthesizers = [];
                    for (key in JBSCHEMA.synthesizers) {
                        var schema = JBSCHEMA.synthesizers[key];
                        console.log("Schema?",schema);
                        if (schema.toneMap.name === "Keyboard") {
                            synthesizers.push(Jukebox.getSynth(schema));
                        }
                    }

                    $scope.synthesizers = synthesizers;
                    $scope.sets = sets;

                    $scope.config = {
                        synthesizer:synthesizers[3]
                    };
                }
            })
            .state('jukebox', {
                url: '/jukebox',
                templateUrl: "partials/jukebox.html",
            })
            .state('tuner', {
                url: '/tuner',
                templateUrl: "partials/tuner.html",
                controller:function($scope){
                    $scope.modulator = new jukebox.getModulator(JBSCHEMA.modulators["Dookus Basic Square"]);
                    $scope.base = 12;
                    $scope.tone = 12;
                    var baseFrequency = 30.8677; // Low Low Low B
                    var letters = ["B","C","Db",'D','Eb','E','F','Gb','G','Ab',"A","Bb"];
                    var ratio = Math.pow(2, 1 / 12);
                    
                    $scope.config = {

                    };

                    var scale = [];
                    for (var i = 0; i < 70; i++) {
                        scale.push({
                            name:letters[i % letters.length],
                            index:i,
                            frequency: baseFrequency * Math.pow(ratio, i)
                        })
                    }

                   
                    console.log("scale",scale);


                    $scope.chromatic = scale;
                    var guitarBase = 17;
                    $scope.guitar = [scale[guitarBase],scale[guitarBase+5],scale[guitarBase+10],scale[guitarBase+15],scale[guitarBase+19],scale[guitarBase+24]];

                    var bassBase = 0;
                    $scope.bass = [scale[bassBase],scale[bassBase+5],scale[bassBase+10],scale[bassBase+15],scale[bassBase+20]];

                    $scope.config.selected = scale[0];

                    $scope.$watch("config.selected",function(newval,oldval){
                        $scope.modulator.frequency = newval.frequency;
                    })

                    $scope.$watch("scale",function(scale){
                        $scope.config.selected = scale[0];
                    })

                    $scope.config.playing = false;

                    $scope.play = function() {
                        $scope.config.playing = true;
                        $scope.modulator.play();
                    }

                    $scope.stop = function() {
                        $scope.config.playing = false;
                        $scope.modulator.stop();
                    }


                    $scope.scale = $scope.guitar;

                    $scope.tunerKind = "chromatic";
                }
            })
        $urlRouterProvider.otherwise('/');

    })
    // .filter("onlyGuitar",function(){
    //     return function(s){
    //         if ( s === "A" ||
    //          s === "E" ||
    //           s === "D" ) {
    //             return s;
    //         }
    //     }
    // })
    .run(function($rootScope) {
        $rootScope.$on('$viewContentLoaded', function(event, toState, toParams, fromState, fromParams){
        // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            console.log("success");
            setTimeout(function(){

            Prism.highlightAll();
            },50)
         });
        $rootScope.playNote = function(modulator, tone, duration) {
            modulator1.setFrequency(tone);
            modulator1.play();
            timer.setTimeout(modulator.stop, duration);
        };

        var modulator1Settings = {
            volume: 0.2,
            frequency: 440
        };

        $rootScope.modulator1Settings = modulator1Settings;

        $rootScope.modulator1 = modulator1;
        $rootScope.modulator2 = modulator2;
        $rootScope.keys = Jukebox.getSynth(JBSCHEMA.synthesizers['Omaha DS6']);
        $rootScope.harmonica = Jukebox.getSynth(JBSCHEMA.synthesizers['Harmoniks Vibraphone']);
        $rootScope.harmonica.volume = 0.1;
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

        var config = {

        };


        var modulators = [];
        for (key in JBSCHEMA.modulators) {
            modulators.push(Jukebox.getModulator(JBSCHEMA.modulators[key]));
        }

        modulators.forEach(function(mod) {
            mod.volume = 0.15;
        })

        $scope.$watch('config.modulator', function() {
            modulators.forEach(function(mod) {
                mod.stop();
            })
        });

        config.modulator = modulators[5];

        $scope.config = config;
        $scope.modulators = modulators;
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
            var schema = JBSCHEMA.synthesizers[key];
            console.log("Schema?",schema);
            if (schema.toneMap.name === "Keyboard") {
                synthesizers.push(Jukebox.getSynth(schema));
            }
        }

        $scope.synthesizers = synthesizers;

        $scope.config = {
            synthesizer:synthesizers[1]
        };

    })
    .directive("key", function() {
        return {
            restrict: "EA",
            scope: {
                note: "=",
                synth: "=",
            },
            link: function(scope, elem, attr) {

                var playing = false;

                function play() {
                    scope.synth.play(scope.note);
                    elem.addClass('active');
                }

                function stop() {
                    scope.synth.stop(scope.note);
                    elem.removeClass('active');

                }

                elem.on("touchstart mousedown",function(event){
                    play();
                    event.preventDefault();
                })

                elem.on('touchend mouseup touchleave mouseleave',function(){
                    stop();
                })

                elem.on("touchmove",function(event){
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
                for (var i = 0; i < 17; i++) {
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
