var jukeboxTimer = function(framerate){
  var targetFramesPerSecond = framerate || 30;
  console.log("Timer:: ",framerate);
  var lasttime = new Date().getTime();
  var framebuffer = 0;
  var framesSinceInitialized = 0;
  var timer = this;

  setInterval(function(){
    var frametime = new Date().getTime();
    var timeElapsed = frametime - lasttime;
    framebuffer += timeElapsed;
    lasttime = frametime;

    if (framebuffer > targetFramesPerSecond) {
      framebuffer-= targetFramesPerSecond;
      framesSinceInitialized += 1;
    }
  },1);

  this.setInterval = function(callback,timeout,arguments) {
    var frameOnTimeoutSet = framesSinceInitialized;
    var interval = setInterval(function(){
      var totaltimepassed = framesSinceInitialized - frameOnTimeoutSet;
      if (totaltimepassed >= timeout / targetFramesPerSecond) {
        callback(arguments);
        frameOnTimeoutSet = framesSinceInitialized;
      }
    },1);

    return interval;
  }

  this.setSequence = function(actions) {
    
    var sequenceQueuedActions = [];
    var timeSoFar = 0;
    actions.forEach(function(action){
      sequenceQueuedActions.push(timer.setTimeout(function(){
        action.callback()
      },timeSoFar));
      timeSoFar += action.timeout;
    });

    return sequenceQueuedActions;
  }

  this.clearSequence = function(sequenceQueuedActions) {
    sequenceQueuedActions.forEach(function(action,index){
      clearTimeout(action);
    });
  }

  this.setTimeout = function(callback,timeout,arguments) {
    var interval = this.setInterval(function(){
        callback(arguments);
        clearInterval(interval);
    },timeout);
    
    return interval;
  }
}
