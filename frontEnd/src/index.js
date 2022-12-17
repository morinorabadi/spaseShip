// packeges
import React from "react";
import ReactDOM from "react-dom/client";

// codes
import App from './react/App'
import RedLib from "./redlibCore/core";

// create redlib core instance
const redlibCore = new RedLib({ fps : 60 })



ReactDOM.createRoot(document.querySelector('#root')).render(<App/>)
