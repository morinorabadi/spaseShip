// thread library packages
import React, { useState, useEffect } from 'react'

// styles
import './style.sass'

// Component
import ControllerComponent from './react/Controller';
import UserName from './react/UserName';
import SetUserName from './react/UserNameSet';
import MyRoom from './react/MyRoom';
import Rooms from './react/Rooms';


// other section
import RedLib from "./redlibCore/core";
import ClinetSocket from "./connections/ClinetSocket";
import Controller from './controller/Controller';
import Scene from './three/Scene';


// create redlib core instance
// const redlibCore = new RedLib({ fps : 60 })

const socket = new ClinetSocket()

// const controller = new Controller(redlibCore)

// const scene = new Scene(redlibCore)


export default function App() {
  // username
  const [isUsername, setIsUsername] = useState(false)
  const [username, setUsername] = useState("")

  // room
  const [isRoomSet, setIsRoomSet] = useState(false)
  const [myRoom, setMyRoom] = useState({})
  const [rooms, setRooms] = useState([])

  // game
  const [isGameStart, setIsGameStart] = useState(false)
  const [players, setPlayers] = useState([])

  // fire socket events
  const onSetUsername = (username) => {
      socket.setUsername(username)
  }

  const onRoomCreate = (roomName) => {
      socket.createRoom(roomName)
  }

  const onJoinRoom = (id) => {
      socket.joinRoom(id)
  }


  // handele socket event
  useEffect(() => {
    // when username set
    socket.onUsername = (username) => {
        setIsUsername(true)
        setUsername(username)
    }

    // when player has no room
    socket.onAvailableRoom = (rooms) => {
    setRooms(rooms)
    }

    // when player create or join a room
    socket.onLoadInformation = (information) => {
    setMyRoom(information.room)
    setIsRoomSet(true)
    }

    socket.onPlayerJoinLeft = ({ isJoin, room, player }) => {
        setMyRoom(room)
        if ( isJoin ){
            console.log("join",player);
        } else {
            console.log("left",player);
        }
    }

    socket.roomForceLeave = () => {
        setIsRoomSet(false)
    }

    /**
     * game events
     */
    socket.onStartGame = () => {
    console.log("onStartGame")
    setIsGameStart(true)
    }

    socket.onUpdateData = (data) => {
    console.log("onUpdateData")
    setPlayers(data)
    }
    
    return () => {
        socket.onUsername = null
        // room
        socket.onAvailableRoom = null
        socket.onLoadInformation = null
        socket.onPlayerJoinLeft = null
        socket.roomForceLeave = null
        // game
        socket.onStartGame = null
        socket.onUpdateData = null
    }
  }, [])
  
  return (
      <div>
          { !isUsername ? 
           <SetUserName onSetUsername={onSetUsername} />
          :
              <>  
                  <UserName userName={username} />
                  { !isRoomSet ?
                    <Rooms rooms={rooms} onCreateRoom={onRoomCreate} onJoinRoom={onJoinRoom} />
                  :
                    <MyRoom room={myRoom}/>
                  }
              </>
          }
          {   isGameStart ? 
          <div>
              <ul>
                  { players.map( player => {
                      return ( <li key={player.i} > playerId {player.i} random is : { player.r } updated at : { player.t } </li> )
                  }) }
              </ul>
          </div>
          :
          <></>
          }
      </div>
  )
}