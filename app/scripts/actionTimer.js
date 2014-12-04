var jukeboxTimer = function(){
  var framebuffer = 0,
  msSinceInitialized = 0,
  timer = this;

  var timeAtLastInterval = new Date().getTime();

  setInterval(function(){
    var frametime = new Date().getTime();
    var timeElapsed = frametime - timeAtLastInterval;
    msSinceInitialized += timeElapsed;
    timeAtLastInterval = frametime;
  },1);

  this.setInterval = function(callback,timeout,arguments) {
    var timeStarted = msSinceInitialized;
    var interval = setInterval(function(){
      var totaltimepassed = msSinceInitialized - timeStarted;
      if (totaltimepassed >= timeout) {
        callback(arguments);
        timeStarted = msSinceInitialized;
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
