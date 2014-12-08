(function(window) {
    "use strict";
    var ActionTimer = function() {
        var framebuffer = 0,
            msSinceInitialized = 0,
            timer = this;

        var timeAtLastInterval = new Date().getTime();

        setInterval(function() {
            var frametime = new Date().getTime();
            var timeElapsed = frametime - timeAtLastInterval;
            msSinceInitialized += timeElapsed;
            timeAtLastInterval = frametime;
        }, 1);

        this.setInterval = function(callback, timeout, args) {
            var timeStarted = msSinceInitialized;
            var interval = setInterval(function() {
                var totaltimepassed = msSinceInitialized - timeStarted;
                if (totaltimepassed >= timeout) {
                    callback(args);
                    timeStarted = msSinceInitialized;
                }
            }, 1);

            return interval;
        }

        this.getTimeNow = function() {
            return new Date().getTime();
        }

        this.setSequence = function(actions) {

            var sequenceQueuedActions = [];
            var timeSoFar = 0;
            actions.forEach(function(action) {
                sequenceQueuedActions.push(timer.setTimeout(function() {
                    action.callback()
                }, timeSoFar));
                timeSoFar += action.timeout;
            });

            return sequenceQueuedActions;
        }

        this.clearSequence = function(sequenceQueuedActions) {
            sequenceQueuedActions.forEach(function(action, index) {
                clearTimeout(action);
            });
        }

        this.setTimeout = function(callback, timeout, args) {
            var interval = this.setInterval(function() {
                callback(args);
                clearInterval(interval);
            }, timeout);

            return interval;
        }
    }

    var JukeboxConstructor = function(ActionTimer, transforms) {
        var audioContext = webkitAudioContext ? new webkitAudioContext() : null;
        var timer = new ActionTimer();

        window.addEventListener("touchstart", function twiddle() {
            var _oscillator = audioContext.createOscillator().noteOn(0.1);
            window.removeEventListener("touchstart", twiddle);
        });


        var Modulator = function(schema) {

            var volume = schema.volume || 1,
                modulator = this,
                envelope = schema.envelope || {},
                context = audioContext,
                playing = false,
                playingOscillators = [],
                phase = 0,
                bend = 0,
                submodulators = [],
                willPlay = false,
                willStop = false,
                frequency = schema.frequency || 440;

            envelope = schema.envelope || {
                timeIn: 100,
                timeOut: 100
            }

            function refreshOscillatorFrequencies() {

                playingOscillators.forEach(function(oscillator) {
                    oscillator.frequency.value = +frequency + +bend;
                })
            }


            function play() {
                if (playing) return;
                willPlay = true;
                submodulators.forEach(function(submod) {
                    submod.play();
                })
            }

            function stop() {
                // if (!playing) return;
                willStop = true;
                submodulators.forEach(function(submod) {
                    submod.stop();
                })
            }

            function handleStateUpdate() {
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
                    playingOscillators.forEach(function(oscillator) {
                        oscillator.gain.gain.cancelScheduledValues(now);;
                        oscillator.gain.gain.linearRampToValueAtTime(modulator.volume, context.currentTime + 0.001);
                    })
                    volume = modulator.volume;
                }


                if (modulator.envelope.timeIn !== envelope.timeIn || modulator.envelope.timeOut != envelope.timeOut) {
                    envelope = modulator.envelope;
                }

                submodulators.forEach(function(submod) {
                    submod.volume = volume;
                    submod.frequency = frequency;
                    submod.bend = bend;
                })

                if (willPlay && !playing) {
                    willPlay = false;
                    playing = true;

                    if (schema.oscillators) {
                        schema.oscillators.forEach(function(oscillatorDefinition) {
                            var oscillator = context.createOscillator();
                            oscillator.type = oscillatorDefinition;

                            var gain = audioContext.createGain();
                            gain.connect(audioContext.destination);

                            gain.gain.value = 0;
                            gain.gain.linearRampToValueAtTime(volume, now + envelope.timeIn / 1000, true);

                            oscillator.frequency.value = +frequency + bend;
                            oscillator.noteOn(1);
                            oscillator.gain = gain;
                            oscillator.connect(gain);
                            playingOscillators.push(oscillator);
                        });
                    }
                } else if (willStop) {
                    willStop = false;
                    willPlay = false;
                    playing = false;
                    var fadingOscillators = [];
                    playingOscillators.forEach(function(oscillator) {
                        oscillator.gain.gain.linearRampToValueAtTime(0, context.currentTime + envelope.timeOut / 1000);
                    });
                    while (playingOscillators[0]) {
                        fadingOscillators.push(playingOscillators.pop());
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
                polyphony = schema.polyphony || [0, 0, 0, 0, 0, 0, 0, 0];


            function getAllModulators() {
                var allModulators = [];
                modulatorSets.forEach(function(set) {
                    allModulators = allModulators.concat(set.modulators);
                });

                return allModulators;
            }


            function getFreeModulatorSet() {
                var freeSets = modulatorSets.filter(function(set) {
                    return !set.playing;
                })

                if (!freeSets[0]) {
                    // return releaseModulator();
                    return;
                }
                return freeSets[0];
            }

            function play(tone,duration) {

                if (keyModulatorMap[tone]) {
                    keyModulatorMap[tone].release();
                }

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
                  timer.setTimeout(function(){
                    stop(tone);
                  },duration);
                }
            }

            function stop(tone) {
                modulatorSets.filter(function(set) {
                        return set.currentTone === tone;
                    })
                    .forEach(function(set) {
                        set.modulators.forEach(function(modulator) {
                            modulator.stop();
                        })
                        set.playing = false;
                        set.currentTone = undefined;
                    })
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
