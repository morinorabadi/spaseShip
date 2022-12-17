// therd package
const cors = require('cors')
const express = require('express')
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')
const bodyParser = require('body-parser')

// managers
const SocketManager = require("./socket/Manager")

// set up express
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')))

// create server
const server = http.createServer(app)

// setup socket io
const io = new Server(server,{ cors : { origin : '*' } })
const socketManager = new SocketManager(io)
io.on('connection', (socket) => { socketManager.newSocket(socket) })

// index url
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../dist/index.html') )})

// setup server
server.listen(5500, () => { console.log("server is active") })