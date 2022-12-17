// this class dont use directly in other calsses
// usefull information store in socket data object

/**
 * list of client Object Events
 * 1. clinet-set-username
 * 
 * list of events call from socket (clients)
 * 1. set-username
 */

class Client
{
    constructor(socket, emit){
        console.log(`new socket connected with "${socket.id}" ID`);
        
        // information
        this.username = null
        this.id = socket.id

        // set username
        socket.on("set-username", username => {
            const response = {}
            if (username.length > 0 ){
                // save username
                this.username = username
                socket.data.username = username

                // create response
                response.status = 201
                response.username = username
                console.log(`client ${socket.id} pick ${ username } as username`);
            } else {
                response.status = 400
            }
            emit(socket.id,"clinet-set-username", response)
        })    
    }
}

module.exports = Client