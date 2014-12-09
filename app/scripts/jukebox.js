(function(window) {
    "use strict";

    var JukeboxConstructor = function(ActionTimer, transforms) {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        var timer = new ActionTimer();

        window.addEventListener("touchstart", function twiddle() {
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
                willPlay = false,
                willStop = false,
                modulator = this;

            function refreshOscillatorFrequencies() {
                oscillators.forEach(function(oscillator) {
                    oscillator.frequency.value = +frequency + +bend;
                })
            }

            function play() {
                if (playing) return;
                submodulators.forEach(function(submod) {
                    submod.play();
                })
                schema.oscillators.forEach(function(oscillatorDefinition) {
                    var oscillator = context.createOscillator();
                    oscillator.type = oscillatorDefinition;

                    var gain = audioContext.createGain();
                    gain.connect(audioContext.destination);

                    // gain.gain.value = 0;
                    // gain.gain.setValueAtTime(volume, timer.getTimeNow() + envelope.timeIn / 1000, true);

                    gain.gain.linearRampToValueAtTime(volume, timer.getTimeNow() + envelope.timeIn / 1000, true);

                    oscillator.frequency.value = frequency;
                    oscillator.noteOn(0);
                    oscillator.gain = gain;
                    oscillator.connect(gain);

                    oscillators.push(oscillator);
                });
                // handleStateUpdate();
            }

            function stop() {
                submodulators.forEach(function(submod) {
                    submod.stop();
                });
                var fadingOscillators = [];
                oscillators.forEach(function(oscillator) {
                    oscillator.gain.gain.linearRampToValueAtTime(0, context.currentTime + envelope.timeOut / 1000);
                });

                while (oscillators[0]) {
                    var oscillator = oscillators[oscillators.length - 1];
                    oscillator.gain.gain.setValueAtTime(0, context.currentTime);
                    fadingOscillators.push(oscillators.pop());
                };

                timer.setTimeout(function(fadingOscillators) {
                    fadingOscillators.forEach(function(oscillator, index) {
                        oscillator.noteOff(1);
                        oscillator.disconnect(oscillator.gain);
                    });

                    while (fadingOscillators[0]) {
                        fadingOscillators.pop();
                    }
                }, 1000, fadingOscillators);
            }

            function handleStateUpdate() {
                if (willPlay && willStop) {
                    throw new Error("Cant play and stop at same time");
                    // willPlay = false;
                    // willStop = false;
                }
                phase++;
                modulator.frequency = +modulator.frequency;
                modulator.volume = +modulator.volume;
                modulator.bend = +modulator.bend;
                var now = context.currentTime;

                if (schema.adjustor) {
                    schema.adjustor(modulator, phase);
                };

                if (bend !== modulator.bend) {
                    bend = modulator.bend;
                    refreshOscillatorFrequencies();
                }


                if (frequency !== modulator.frequency && !willStop) {
                    frequency = modulator.frequency;
                    refreshOscillatorFrequencies();
                }

                if (volume !== modulator.volume && !willStop) {
                    oscillators.forEach(function(oscillator) {
                        // oscillator.gain.gain.cancelScheduledValues(now);;
                        oscillator.gain.gain.setValueAtTime(modulator.volume, now + 0.001);
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


            if (schema.submodulators) {
                schema.submodulators.forEach(function(schema) {
                    var submodulator = new Modulator(schema);
                    submodulators.push(submodulator);
                })
            }

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
                keyModulatorMap = [],
                map = schema.toneMap,
                synthesizer = this,
                volume = 1,
                // polyphony = schema.polyphony || [0, 0, 0, 0, 0, 0, 0, 0];
            polyphony = schema.polyphony || [0,0];


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
                // console.log("stop")
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

    window.Jukebox = new JukeboxConstructor(ActionTimer);
})(window);
