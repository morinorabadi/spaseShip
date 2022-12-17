import io from 'socket.io-client'
import WebRTCSocket from './WebRTCSocket'

export default class ClinetSocket
{
    constructor(){
        // events
        this.onUsername = null
        this.onAvailableRoom = null
        this.onLoadInformation = null
        this.onStartGame = null
        this.onUpdateData = null

        // properti
        this.gameId = null

        // create connection
        const socket = io("http://localhost:5500")
        let peerConnection = null

        this.emit = (event,payload) => {
            socket.emit(event,payload)
        }

        // handele events
        socket.on('connect', () => {
            console.log("socket connected");

            // user name event
            socket.on("clinet-set-username", response => {
                if (this.responseChech(response)){
                   this.onUsername(response.username)
                }
            })

            // available room
            socket.on("server-available-room", response => {
                if (this.responseChech(response)){
                    this.onAvailableRoom(response.rooms)
                }
            })

            // server load information
            socket.on("room-load-information", response => {
                if (this.responseChech(response)){
                    this.onLoadInformation(response.information)
                    this.emit("load-over")
                }
            })

            // room create webrtc peer connection
            socket.on("room-create-webrtc", option => {
                peerConnection = new WebRTCSocket()
                peerConnection.createConnection({
                    onMessege :  this.onUpdateData,
                    emit : this.emit,
                    ...option
                })
            })

            // room create webrtc peer connection
            socket.on("room-start-game", response => {
                if (this.responseChech(response)){
                    this.gameId = response.gameId
                    this.onStartGame()
                }
            })
        })
    }

    // response Chech
    responseChech(response){
        if (response.status >= 200 && response.status < 300) {
            return true
        } else {
            console.log("erro");
            return false
        }
    }

    /**
     * emit events 
     */
    // setUsername
    setUsername(username){
        this.emit("set-username", username)
    }
    // createRoom
    createRoom(roomname){
        this.emit("create-room", roomname)
    }
    // join room
    joinRoom(roomId){
        this.emit("join-room", roomId)
    }
}
