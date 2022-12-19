import React, { useState } from 'react'

export default function Rooms({rooms, onCreateRoom, onJoinRoom}) {   
    const [ roomName, setRoomName ] = useState('')

    function createRoom() {
        onCreateRoom(roomName)
        setRoomName('')
    }

    function joinRoom(roomId) {
        onJoinRoom(roomId)
    }
    
    return (
        <div className='rooms' >

            <h2>
                join or create room
            </h2>

            <ul>
            {rooms.map(room => (
                <li key={room.id} >
                <p>name : {room.name}</p>
                <p>playerCount : {room.playerCount}</p>
                {/* add owner name */}
                <button onClick={()=> {joinRoom(room.id)}} > join </button>
                </li>
            ))}
            </ul>

            <div className='create-room' >
                <input
                type="text" 
                placeholder='enter room name'
                onChange={(e) => setRoomName(e.target.value)}
                value={roomName}
                />
                <button onClick={() => (createRoom())} > create </button>
            </div>

        </div>
    )
}