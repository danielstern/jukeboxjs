var jukeboxTimer = function(){
  var targetFramerate = 1;
  var lasttime = new Date().getTime();
  var framebuffer = 0;
  var framespassed = 0;
  var timer = this;

  setInterval(function(){
    var frametime = new Date().getTime();
    var timeElapsed = frametime - lasttime;
    framebuffer += timeElapsed;
    lasttime = frametime;

    if (framebuffer > targetFramerate) {
      framebuffer-=targetFramerate;
      trigger();
    }
  },1);

  this.setInterval = function(callback,timeout,arguments) {
    var startframe = framespassed;
    var interval = setInterval(function(){
      var totaltimepassed = framespassed - startframe;
      if (totaltimepassed >= timeout) {
        callback(arguments);
        startframe = framespassed;
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
    var startframe = framespassed;
    var interval = setInterval(function(){
      var totaltimepassed = framespassed - startframe;
      if (totaltimepassed >= timeout) {
        callback(arguments);
        clearInterval(interval);
      }
    },1);
    
    return interval;
  }

  function trigger() {
    framespassed+=5;
  }
}
