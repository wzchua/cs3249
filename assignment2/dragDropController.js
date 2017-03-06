var DragDropController =  function (bounds) {
    var self = this;
    this.initialLeft;
    this.initialTop;
    this.offsetX = 0;
    this.offsetY = 0;
    this.width = bounds.width;
    this.height = bounds.height;
    this.dragObject = null;

    this.setAsDraggable = function(item) {            
        if(!item) return;
            item.mouseDownContext = self.startMouseDrag.bind(item);
            item.DOM.addEventListener("mousedown", item.mouseDownContext);
    };
    this.removeAsDraggable = function(item) {            
        if(!item) return;
            item.DOM.removeEventListener("mousedown", item.mouseDownContext);
    };
    this.startMouseDrag = function(ev) {
        self.dragObject  = this;
        ev.preventDefault();

        ev = ev || window.event;
        var mousePos  = self.getMouseCoords(ev);
        self.initialLeft = self.dragObject.DOM.style.left;
        self.initialTop = self.dragObject.DOM.style.top;
        self.offsetX = mousePos.x - self.dragObject.DOM.offsetLeft;
        self.offsetY = mousePos.y - self.dragObject.DOM.offsetTop;
        document.addEventListener("mousemove", self.dragMove);
        document.addEventListener("mouseup", self.dragRelease);
    };
    this.getMouseCoords = function(ev) {            
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }
        return {
            x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y:ev.clientY + document.body.scrollTop  - document.body.clientTop
        };
    };
    this.dragMove = function(ev) {
        ev  = ev || window.event;
        var mousePos  = self.getMouseCoords(ev);
        if(self.dragObject){
            ev.preventDefault();
            var newTop = mousePos.y - self.offsetY;
            var newLeft = mousePos.x - self.offsetX;
            if(newTop + self.dragObject.DOM.height >= self.height ||
                newLeft + self.dragObject.DOM.width >= self.width ||
                newTop < 0 || newLeft < 0) {
                var parentOffset = self.getGlobalOffset(self.dragObject.DOM.offsetParent);
                var parentMousePosX = mousePos.x - parentOffset.x;
                var parentMousePosY = mousePos.y - parentOffset.y;
                if(parentMousePosY > self.height || parentMousePosY < 0 ||
                    parentMousePosX > self.width || parentMousePosX < 0) {    
                    var details = {mouseX: parentMousePosX, mouseY: parentMousePosY};                
                    self.dispatchEvent("outofbounds", details);
                }

            } else {
                self.dragObject.DOM.style.top = newTop + "px";
                self.dragObject.DOM.style.left = newLeft + "px";                   
            }
        }
    };
    this.dragRelease = function(ev) {
        ev  = ev || window.event;
        var mousePos  = self.getMouseCoords(ev);
        var newTop = mousePos.y - self.offsetY;
        var newLeft = mousePos.x - self.offsetX;
        var parentOffset = self.getGlobalOffset(self.dragObject.DOM.offsetParent);
        var parentMousePosX = mousePos.x - parentOffset.x;
        var parentMousePosY = mousePos.y - parentOffset.y; 
        var details = { newTop: newTop, newLeft: newLeft, mouseX: parentMousePosX, mouseY: parentMousePosY };  

        details.checker = self.dragObject;
        self.dispatchEvent("dragrelease", details);
        
        self.dragObject = null;
        document.removeEventListener("mousemove", self.dragMove);
        document.removeEventListener("mouseup", self.dragRelease);
    };
    this.dragDisable = function() {
        if(self.dragObject == null) {
            return;
        }
        self.dragReset();
        self.dragObject = null;
        document.removeEventListener("mousemove", self.dragMove);
        document.removeEventListener("mouseup", self.dragRelease);

    }
    this.dragReset = function() {
            self.dragObject.DOM.style.top = self.initialTop;
            self.dragObject.DOM.style.left = self.initialLeft;        
    }
    this.getGlobalOffset = function(item) {
        var left = 0;
        var top  = 0;
        while (item.offsetParent){
            left += item.offsetLeft;
            top  += item.offsetTop;
            item     = item.offsetParent;
        }
        left += item.offsetLeft;
        top  += item.offsetTop;
        return {x:left, y:top};

    }

    ////////////////////////////////////////////////
    // Events listening interface
    //

    this.allHandlers = new Array();
    
    /**
     * Dispatch a new event to all the event listeners of a given event type
     */
    this.dispatchEvent = function(type, details){
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
    this.addEventListener = function(eventType, handler){
        if (!this.allHandlers[eventType])
            this.allHandlers[eventType] = [];
        this.allHandlers[eventType].push(handler);
    }
}