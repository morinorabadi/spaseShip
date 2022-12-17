/**
 * order in addCallBack function
 * 3 : "always to begin",
 * 2 : "push to begin",
 * 1 : "always to last",
 * 0 : "push to last",
 */

 export default class Events{
    constructor()
    {
        this.events = []
        this.callBacks = {}
    }

    // create new event
    addEvent(eventName)
    {
        this.events[eventName] = {last: 0,begin: 0}
        this.callBacks[eventName] = []
    }

    // add functions to added events
    addCallBack(eventName,callBack,order = 0)
    {   
        if (order == 3 || order == 2){
            this.callBacks[eventName].splice(this.events[eventName].begin ,0,callBack);
            if (order == 3){
                this.events[eventName].begin++;
            }
        } else {
            this.callBacks[eventName].splice(this.callBacks[eventName].length - this.events[eventName].last, 0, callBack)
            if (order == 1){
                this.events[eventName].last++;
            }
        }
    }

    // call event with name and with or without paramiters
    callEvent(eventName,paramiters = null)
    {   
        if (paramiters){
            for (let event of this.callBacks[eventName])
            {
                event(paramiters)
            } 
        } else {
            for (let event of this.callBacks[eventName])
            {
                event()
            }
        }
    }
}