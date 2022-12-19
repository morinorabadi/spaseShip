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
            ownerName : socket.data.username,
            playerCount : 0
        }

        const socketsMap = new Map()
        const gameInfo = new Map()
        const peerConnections = new Map()


        let lastplayerGameId = 0
        function createGameId(){
            lastplayerGameId++
            gameInfo.set(lastplayerGameId, {i : lastplayerGameId, r : Math.random(), t : Date.now()})
            return lastplayerGameId
        }

        /**
         * WebRTC
         */
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
         * socket events
         */

        // socket join
        this.socketJoin = (socket) => {
            // add socket to room
            socket.join(this.id)
            socket.data.room = this.id
            this.info.playerCount++;
            // create gameId for this socket
            const gameId = createGameId()
            socket.data.gameId = gameId
            socket.data.serialize = () => { return { 
                username : socket.data.username,
                id : socket.id
            }}
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
            const response = { status : 200 , information : { room : serialize() } }
            this.emit(socket.id,"room-load-information",response)

            // send new player login to others is this room
            sendPlayerJoinOrLeft(true,socket)
        }

        // socket disconnect
        this.socketDisconnect = (socketId) => {
            if ( socketsMap.has(socketId) ){                
                this.info.playerCount--;
                // find socket gameId
                const socket = socketsMap.get(socketId)
                const gameId = socket.data.gameId
                // clean up
                socketsMap.delete(socketId)
                if (gameInfo.has(gameId)){ gameInfo.delete(gameId) }
                if (peerConnections.has(socketId)){ gameInfo.delete(gameId) }
                // send out
                sendPlayerJoinOrLeft(false,socket)
            } else {
                console.log("404 not founded in socket disconnect");
            }
        }

        const sendPlayerJoinOrLeft = (isJoin,socket) => {
            const response = { status : 200 }
            response.information = {}
            response.information.isJoin = isJoin
            response.information.player = socket.data.serialize()
            response.information.room = serialize()
            this.emit(this.id,"room-player-changes", response )
        }
        /**
         * global room functions
         */

        // delete entire room
        this.kill = () => {
            // send room destroyed to all player in room
            this.emit(this.id,"room-force-leave", { status : 200 } )
            
            // close all RTCPeerConnections
            peerConnections.forEach(( peer, _) => { peer.close() })
        }

        // return information about this room
        const serialize = () => {
            const players = []
            socketsMap.forEach((socket, id ) => { 
                players.push({name : socket.data.username,id : id})
            })
            return {
                ...this.info,
                players
            }
        }

        // call socketJoin for owner socket 
        this.socketJoin(socket)
    }
}

module.exports = Room