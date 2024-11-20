import { Server } from 'socket.io'

const io = new Server(3000, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

io.on('connection', (socket) => {
  // Checks what pages are currently in flight
  socket.on('checkPublishStatus', () => {
    socket.emit('checkPublishStatus', [6, 9])
    setTimeout(() => {
      socket.emit('checkPublishStatus', [6])
    }, 4000)
  })

  socket.on('pagePublish', (data) => {
    console.log(data)
    setTimeout(() => {
      socket.emit('pagePublish', data)
    }, 4000)
  })
})
