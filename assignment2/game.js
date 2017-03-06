var Timer = function() {
    this.startTime = 0;
    this.secondaryStartTime = 0,
    this.isEnabled = false
};
Timer.prototype.start = function(){
    this.isEnabled = true;
    this.startTime = Math.floor(Date.now()/1000);
    this.secondaryStartTime = this.startTime;
    var self = this;
    this.id = setInterval(function() {
        self.tick() }, 500); 
};
Timer.prototype.stop = function() {
    this.isEnabled = false;
    clearInterval(this.id);
};
Timer.prototype.reset = function() {
    this.stop();
};
Timer.prototype.resetSecondaryTimer = function() {
    var currTime = Math.floor(Date.now()/1000);
    this.secondaryStartTime = currTime;
};
Timer.prototype.onTick = function(funcAction) {
    this.tickAction = funcAction;
}
Timer.prototype.tick = function(){
    if(!this.isEnabled) {
        return;
    }
    var currTime = Math.floor(Date.now()/1000);
    var timeDiff = currTime - this.startTime;
    var min = Math.floor(timeDiff / 60);
    var sec = timeDiff - min * 60;
    var hour = Math.floor(min/60);
    min = min - hour * 60;

    this.tickAction({h: hour, m: min, s: sec, 
        secondaryTimeCount: currTime - this.secondaryStartTime});
}

var Game = function(size){
    var self = this;
    this.size = size;
    this.blackCheckerList = [];
    this.redCheckerList = [];
	this.board = new Board(size);
	this.rules = new Rules(this.board);
    this.whoseTurn = "black";	
    this.redoStack = [];
    this.undoStack = [];
    this.timer = new Timer();
    this.timer.onTick(function(e) {
        self.tick(e); });
    //events
    this.allHandlers = [];

    this.board.addEventListener('add',function (e) {
        self.dispatch('add', e.details);
        var color = e.details.checker.color;
        if(color == 'black') {    
            self.blackCheckerList.push(e.details.checker);
        } else if (color == 'red') {
            self.redCheckerList.push(e.details.checker);
        }
    },true);
    this.board.addEventListener('move',function (e) {
        self.dispatch('move', e.details);
    },true);
    this.board.addEventListener('remove', function(e) {
        self.dispatch('remove', e.details);

        if(e.details.checker.color == 'red') {                
            var index = self.redCheckerList.indexOf(e.details.checker);
            self.redCheckerList.splice(index, 1);
        } else {
            var index = self.blackCheckerList.indexOf(e.details.checker);
            self.blackCheckerList.splice(index, 1);
        }
    }, true);
    this.board.addEventListener('promote',function (e) {
        self.dispatch('promote', e.details);
    },true);
};

Game.prototype.directionOf = function(color) {
  if (color == "black") {
    return -1;
  }
  return 1;
}
Game.prototype.makeMove = function(from, to) {
    var checker = this.board.getCheckerAt(from.row, from.col);
    var result = this.rules.makeMove(checker, this.directionOf(this.whoseTurn),
        this.directionOf(this.whoseTurn), to.row, to.col);
    if(result == null) {
        return false;
    } else {
        this.undoStack.push(result);  
        this.redoStack = []; 
        this.turnEnd();
        return true;  
    }
};
Game.prototype.startGame = function(){
    this.timer.start();
};

Game.prototype.resetGame = function() {
    this.blackCheckerList = [];
    this.redCheckerList = [];
    this.undoStack = [];  
    this.redoStack = [];  
    this.board.prepareNewGame();
    this.whoseTurn = "black";
    this.timer.reset();
};
Game.prototype.autoMove = function() {
    var playerColor = this.whoseTurn;
    var playerDirection = this.directionOf(playerColor);
    var result = this.rules.makeRandomMove(playerColor, playerDirection);
    if(result == null) {
        this.gameEnd();
    } else {
        this.undoStack.push(result);  
        this.redoStack = [];   
        this.turnEnd();
    }
};
Game.prototype.undo = function() {
    var data = this.undoStack.pop();
    var checker = this.board.getCheckerAt(data.to_row, data.to_col);
    this.board.moveTo(checker, data.from_row, data.from_col);
    //demote
    if(data.made_king) {
        this.dispatch('demote', {checker: checker});
        checker.isKing = false;
    }

    for(var i = 0; i < data.remove.length; i++) {
        var piece = data.remove[i];
        var checker = new Checker(piece.color, piece.isKing);
        this.board.add(checker, piece.row, piece.col);
        if(piece.isKing) {
            this.board.promote(checker);
        }
    }
    this.redoStack.push(data);
    this.turnEnd();
};
Game.prototype.redo = function() {
    var data = this.redoStack.pop();
    this.rules.makeMove(this.board.getCheckerAt(data.from_row, data.from_col), this.directionOf(this.whoseTurn),
                this.directionOf(this.whoseTurn), data.to_row, data.to_col);
    this.undoStack.push(data);
    this.turnEnd();
}
Game.prototype.tick = function(e) {
    if(e.secondaryTimeCount >= 10) {
        this.autoMove();
    }
    this.dispatch('tick', e);
}
Game.prototype.turnEnd = function() {
    if((this.whoseTurn == 'red' && this.blackCheckerList.length == 0) ||
        (this.whoseTurn == 'black' && this.redCheckerList.length == 0)) {
        this.gameEnd();
        return;
    }
    this.dispatch('turn_end', {whoseTurn: this.whoseTurn});
    this.timer.resetSecondaryTimer();
    if(this.whoseTurn == "black") {
        this.whoseTurn = "red";
    } else {
        this.whoseTurn = "black";
    }
};
Game.prototype.gameEnd = function() {
    this.dispatch('game_end', {});
    this.timer.stop();
};

/**
 * Dispatch a new event to all the event listeners of a given event type
 */
Game.prototype.dispatch = function(type, details){
    var newEvent = {type: type, details: details};

    if (this.allHandlers[type]){
        for (var i in this.allHandlers[type]){
            this.allHandlers[type][i](newEvent);
        }
    }
}

/**
 * Add a new event listener for a given event type
 * the parameter 'handler' has to be a function with one parameter which is an event object
 */
Game.prototype.addEventListener = function(eventType, handler){
    if (!this.allHandlers[eventType])
        this.allHandlers[eventType] = [];
    this.allHandlers[eventType].push(handler);
}

