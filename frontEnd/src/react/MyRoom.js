import React from 'react'

export default function MyRoom({room}) {
  return (
        <div className='room-info' >
            <p> room name is <span> { room.name }</span></p>
            <p> room owener is <span> { room.ownerName }</span></p>
            <ul>
                <li> active players count : {room.playerCount} </li>
                {
                    room.players.map(player => {
                        return <li key={player.id} > {player.name} </li>
                    })
                }
            </ul>
        </div>
  )
}