import { Server } from 'socket.io'

const io = new Server(3000, { cors: { origin: 'http://localhost:5173' } })

io.on('connection', (socket) => {
  // Checks what pages are currently in flight
  socket.on('checkPublishStatus', () => {
    socket.emit('checkPublishStatus', [6, 9, 10])

    setTimeout(() => {
      socket.emit('checkPublishStatus', [6, 9])
    }, 2000)

    setTimeout(() => {
      socket.emit('checkPublishStatus', [6])
    }, 3000)

    setTimeout(() => {
      socket.emit('checkPublishStatus', [])
    }, 4000)
  })

  socket.on('pagePublish', (data) => {
    console.log(data)

    // POST https://api.github.com/repos/sami616/builder/actions/workflows/deploy.yml/dispatches

    // {
    //   "Authorization": "Bearer <your_personal_access_token>",
    //   "Accept": "application/vnd.github+json"
    // }

    // {
    //   "ref": "main"
    // }

    setTimeout(() => {
      socket.emit('pagePublish', data)
    }, 4000)
  })
})
