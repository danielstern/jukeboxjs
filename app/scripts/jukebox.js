(function(window) {
    "use strict";

    var JukeboxConstructor = function() {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        var timer = new MusicTimer(audioContext);

        window.addEventListener("touchstart", function twiddle() { // to unlock the audio context on mobile devices
            var _oscillator = audioContext.createOscillator().noteOn(0.1);
            window.removeEventListener("touchstart", twiddle);
        });


        var Modulator = function(schema) {

            var volume = schema.volume || 1,
                envelope = schema.envelope || {
                    timeIn: 100,
                    timeOut: 100
                },
                frequency = schema.frequency || 440,
                context = audioContext,
                submodulators = [],
                playing = false,
                oscillators = [],
                phase = 0,
                bend = 0,
                modulator = this;

            if (schema.submodulators) {
                schema.submodulators.forEach(function(schema) {
                    var submodulator = new Modulator(schema);
                    submodulators.push(submodulator);
                })
            }


            function refreshOscillatorFrequencies() {
                oscillators.forEach(function(oscillator) {
                    oscillator.frequency.value = +frequency + +bend;
                })
            }

            function play() {
                handleStateUpdate();
                submodulators.forEach(function(submod) {
                    submod.play();
                })
                if (schema.oscillators) { // in case a modulator has only submodulators                        
                    schema.oscillators.forEach(function(oscillatorDefinition) {
                        var oscillator = context.createOscillator();
                        oscillator.type = oscillatorDefinition;

                        var gain = audioContext.createGain();

                        gain.connect(audioContext.destination);
                        gain.gain.value = 0;
                        gain.gain.setValueAtTime(volume, context.currentTime);

                        oscillator.frequency.value = frequency;
                        oscillator.noteOn(0);
                        oscillator.gain = gain;
                        oscillator.connect(gain);

                        oscillators.push(oscillator);
                    });
                }
                handleStateUpdate();
            }

            function stop() {
                handleStateUpdate();
                submodulators.forEach(function(submod) {
                    submod.stop();
                });
                oscillators.forEach(function(oscillator) {
                    oscillator.noteOff(1);
                    oscillator.disconnect(oscillator.gain);
                });

                oscillators.length = 0;

            }

            function handleStateUpdate() {

                phase++;
                modulator.frequency = +modulator.frequency;
                modulator.volume = +modulator.volume;
                modulator.bend = +modulator.bend;

                if (schema.adjustor) {
                    schema.adjustor(modulator, phase);
                };

                if (bend !== modulator.bend) {
                    bend = modulator.bend;
                    refreshOscillatorFrequencies();
                }


                if (frequency !== modulator.frequency) {
                    frequency = modulator.frequency;
                    refreshOscillatorFrequencies();
                }

                if (volume !== modulator.volume) {
                    oscillators.forEach(function(oscillator) {
                        oscillator.gain.gain.setValueAtTime(modulator.volume, context.currentTime);
                    })
                    volume = modulator.volume;
                }


                if (modulator.envelope) {
                    envelope = modulator.envelope;
                }

                submodulators.forEach(function(submod) {
                    submod.volume = volume;
                    submod.frequency = frequency;
                    submod.bend = bend;
                })
            }

            timer.setInterval(handleStateUpdate, 1);

            this.play = play;
            this.stop = stop;
            this.envelope = envelope;
            this.volume = volume;
            this.bend = bend;
            this.frequency = frequency;
            this.name = schema.name;
        };

        var Synthesizer = function(schema) {

            var modulatorSets = [],
                map = schema.toneMap,
                synthesizer = this,
                volume = 1,
                polyphony = schema.polyphony || [0, 0, 0, 0];


            function getAllModulators() {
                var allModulators = [];
                modulatorSets.forEach(function(set) {
                    allModulators = allModulators.concat(set.modulators);
                });

                return allModulators;
            }

            function releaseModulatorSet() {
                var oldestSet = modulatorSets.sort(function(a, b) {
                    return a.timePressed - b.timePressed;
                })[0];
                stopModulatorSet(oldestSet);
            }


            function getFreeModulatorSet() {
                var freeSets = modulatorSets.filter(function(set) {
                    return !set.playing;
                })

                if (!freeSets[0]) {
                    releaseModulatorSet();
                    return getFreeModulatorSet();
                }
                return freeSets[0];
            }

            function play(tone, duration) {

                stop(tone);

                var processor;
                if (typeof map.processor === "function") {
                    processor = map.processor;
                } else {
                    processor = map.processor[tone % map.processor.length];
                }

                var modulatorSet = getFreeModulatorSet();
                if (modulatorSet) {
                    processor(modulatorSet.modulators, tone, timer);
                }

                modulatorSet.playing = true;
                modulatorSet.currentTone = tone;
                modulatorSet.timePressed = timer.getTimeNow();

                if (duration) {
                    timer.setTimeout(function() {
                        stop(tone);
                    }, duration);
                }
            }

            function stop(tone) {
                modulatorSets.filter(function(set) {
                        return set.currentTone === tone;
                    })
                    .forEach(stopModulatorSet);
            }

            function stopModulatorSet(set) {
                set.modulators.forEach(function(modulator) {
                    modulator.stop();
                })
                set.playing = false;
                set.currentTone = undefined;
            }

            polyphony.forEach(function() {
                var modulatorSet = {};
                modulatorSet.modulators = schema.modulators.map(function(schema) {
                    return new Modulator(schema);
                });
                modulatorSets.push(modulatorSet);
            });


            timer.setInterval(function() {
                if (synthesizer.volume != volume) {
                    volume = synthesizer.volume;
                    console.log("volume?",volume);
                    getAllModulators().forEach(function(modulator) {
                        modulator.volume = volume;
                    })
                }
            }, 1);

            this.volume = volume;
            this.play = play;
            this.stop = stop;
            this.name = schema.name;

        };

        return {
            getSynth: function(schema) {
                return new Synthesizer(schema);
            },
            getModulator: function(schema) {
                return new Modulator(schema);
            },
            getContext: function() {
                return audioContext;
            },
            timer: timer,
        }
    }

    window.Jukebox = new JukeboxConstructor();
})(window);
