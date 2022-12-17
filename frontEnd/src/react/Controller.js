import React from 'react'

export default function Controller() {
  return (
    <div id="contoroller">
        
        <svg id="joy" viewBox="0 0 400 400">
            <circle class="big" cx="200" cy="200" r="100" />
            <circle class="small" cx="200" cy="200" r="70" />
        </svg>
        
        <svg id="speed" viewBox="0 0 120 200">
            <rect x="50" y="50" width="40" height="100" rx="20" ry="20" />
            <circle cx="70" cy="110" r="19" />
        </svg>
    </div>
  )
}
