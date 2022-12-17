// thread library packages
import React from 'react'

// styles
import './style.sass'

// Component
import ControllerComponent from './react/Controller';

// other section
import RedLib from "./redlibCore/core";
import ClinetSocket from "./connections/ClinetSocket";
import Controller from './controller/Controller';
import Scene from './three/Scene';


// create redlib core instance
const redlibCore = new RedLib({ fps : 60 })

const socket = new ClinetSocket()

const controller = new Controller(redlibCore)

const scene = new Scene(redlibCore)

export default function App() {
  return (
    <div>App</div>
  )
}
