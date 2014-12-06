var transforms = {

    easeGainNodeLinear: function(options) {
        var node = options.node;
        var duration = options.duration || 1;
        var start = options.start;
        var end = options.end;
        var context = options.context;

        if (!options.duration) {
            console.error("no duration");
            return;
        }

        var startGain = node.gain.value;
        var endGain = end;
        var steps = 50;
        var timePerStep = duration / steps;
        var difference = startGain - endGain;

        if (difference === 0) {
            return;
        }

        for (var currentStep = 1; currentStep <= steps; currentStep++) {
            var volumeAtStep = startGain - difference / steps * currentStep;
            var timeAtStep = context.currentTime + timePerStep * currentStep / 10000;
            node.gain.setValueAtTime(volumeAtStep, timeAtStep);
        }
    }
}