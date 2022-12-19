import React from 'react'

export default function UserName({ userName }) {
    return (
        <div className='username' >
            <p> your username is : 
                <span> { userName }</span>
            </p>
        </div>
    )
}
