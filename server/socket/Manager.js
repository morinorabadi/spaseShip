const { v4: uuidv4 } = require('uuid');
const Room = require('./Room')
const Client = require('./Client');
/**
 * list of manager Object Events
 * 1. server-available-room
 * 
 * list of events call from socket (clients)
 * 
 * 1. disconnect
 * 2. create-room
 * 3. join-room
 */

class SocketManager
{
    constructor(io){
        const rooms = new Map()
        const clients = new Map()
        const clientsWithOutRoom = []

        function generateId() {
            do {
                const id = uuidv4(); 
                if (!rooms.has(id)) {return id;}
            } while (true); 
        }

        // global emit events
        this.emit = (to,event,response) => {
            console.log(`server fire ${ event } to ${ to }`);
            io.to(to).emit(event, response)
            
            if ( event == 'clinet-set-username' ){ 
                clientsWithOutRoom.push(to)
                sendAvailableRoom()
            }
        }
        
        // global new user connected
        this.newSocket = (socket) => {
            const client = new Client(socket, this.emit)
            clients.set(socket.id, client)

            // disconnect event
            socket.on("disconnect", () => {
                console.log(`socket disconnect with "${socket.id}" ID`);
                // delete this socket from clients
                clients.delete(socket.id)

                // handele socket room
                if (!socket.data.room){
                    removeClientsWithOutRoom(socket.id)
                } else {
                    const room = rooms.get(socket.data.room) 
                    if (room.info.ownerId == socket.id){
                        // if disconnected socket is owner we will delete room
                        room.kill()
                        rooms.delete(room.id)
                    } else {
                        // else we just say to room halndele this socket left 
                        room.socketDisconnect(socket.id)
                    }
                }
            })

            /**
             * global room events here
             */

            // create
            socket.on("create-room", roomName => {
                // create new room
                const roomId = generateId()
                const room = new Room({id : roomId, roomName, socket, emit: this.emit})
                // save room
                rooms.set(roomId, room)
                // send out
                removeClientsWithOutRoom(socket.id)
                sendAvailableRoom()
            })

            // join
            socket.on("join-room", roomId => {
                // find room
                const room = rooms.get(roomId)
                room.socketJoin(socket)
                // send out
                removeClientsWithOutRoom(socket.id)
                sendAvailableRoom()
            })
        }

        // send out room informations
        const sendAvailableRoom = () => {
            const response = { status : 200, rooms : [] }
            rooms.forEach((room, id) => { response.rooms.push({id, name : room.info.name}) })
            this.emit(clientsWithOutRoom,"server-available-room",response)
        }

        const removeClientsWithOutRoom = (socketId) => {
            const index = clientsWithOutRoom.indexOf(socketId)
            if ( index !== -1 ) { clientsWithOutRoom.splice(index,1) }
        }
        
    }
}

module.exports = SocketManager