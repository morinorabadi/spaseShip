const WebRtcConnection = require('../webRTC/WebRtcConnection')
/**
 * list of room Object Events
 * 
 * ---events send directly to player
 * 1. room-create-webrtc 
 * 2. room-start-game
 * 3. room-load-information
 * 
 * --- events send to all player
 * 4. room-new-player
 * 6. room-player-left
 * 5. room-force-leave
 * 
 * list of events call from socket (clients)
 * 
 * 1. load-over
 * 2. peer-connection-answer
 */


class Room
{
    constructor({id, roomName, socket, emit}){
        this.id = id
        this.emit = emit

        this.info = {
            name : roomName,
            ownerId : socket.id,
            ownerName : socket.username,
        }

        const socketsMap = new Map()
        const gameInfo = new Map()


        let lastplayerGameId = 0
        function createGameId(){
            lastplayerGameId++
            gameInfo.set(lastplayerGameId, {i : lastplayerGameId, r : Math.random(), t : Date.now()})
            return lastplayerGameId
        }

        /**
         * WebRTC
         */
        const peerConnections = new Map()

        // create connection
        this.createRTCConnection = async (socketId) => {
            // create WebRtcConnection
            const connection = new WebRtcConnection("players-info", updateGameInfo)
            await connection.doOffer()

            // add the Connection to the Map.
            peerConnections.set(socketId, connection)

            // send out RTCPeerConnection info to socket
            this.emit(socketId, "room-create-webrtc", {
                localDescription : connection.localDescription,
                chanelLabel : connection.chanelLabel
            })
        }

        /**
         * game
         */

        // start game
        const loopID = setInterval(() => {
            const data = JSON.stringify(Array.from(gameInfo.values()))
            peerConnections.forEach( (peer , _ ) => {
                peer.sendData(data)
            });
        }, 1000)

        const updateGameInfo = ({data}) => {
            const newInfo = JSON.parse(data)
            const lastInfo = gameInfo.get(newInfo.i)
            if (newInfo.t > lastInfo.t) { gameInfo.set(newInfo.i,newInfo) }
        }


        /**
         * handele socket join
         */
        this.socketJoin = (socket) => {
            // add socket to room
            socket.join(this.id)
            socket.data.room = this.id

            // create gameId for this socket
            const gameId = createGameId()
            socket.data.gameId = gameId

            // add socket to map
            socketsMap.set(socket.id,socket)

            /**
             * listen to socket events
             */
            socket.on("load-over",() => {
                this.createRTCConnection(socket.id)
            })

            socket.on("peer-connection-answer", async ({answer}) => {
                const connection = peerConnections.get(socket.id)
                if ( connection ){
                    try {
                        await connection.applyAnswer(answer);
                        this.emit(socket.id,"room-start-game", {status : 200, gameId : gameId } )
                        this.emit()
                    } catch (error) {
                        console.log("error  from peer-connection-answer ");
                    }
                }
            })

            // Fix this on disconnect
            socket.on("peer-connection-delete", id => {
                console.log("fix on peer connection delete");
            })

            // send some information to this socket
            // and wait until socket emit "load-over" emit
            const response = { status : 200 , information : { roomName : this.info.name, foor : Math.random()} }
            this.emit(socket.id,"room-load-information",response)

            // send new player login to others is this room
            const roomRespone = { status : 200, player: { username : socket.data.username, playerId : socket.id, playerGameId : gameId } }
            this.emit(this.id, "room-new-player", )
        }
        // call socketJoin for owner socket 
        this.socketJoin(socket)

        // fix socket Disconnect   
        this.socketDisconnect = (socketId) => {
            this.emit(this.id,"room-player-left", { status : 200, playerId : socketId} )
        }

        this.kill = () => {
            // send room destroyed to all player in room
            this.emit(this.id,"room-force-leave", { status : 200 } )
            
            // close all RTCPeerConnections
            peerConnections.forEach(( peer, id) => { peer.close() })
        }
    }
}

module.exports = Room