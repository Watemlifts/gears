import * as express   from "express"
import * as http      from "http"
import * as socket_io from "socket.io"
import * as path      from "path"

const app    = express()
const server = http.createServer(app)
const io     = socket_io(server)

app.use(express.static(path.join(__dirname, "public")))

io.on('connection', socket => {
  setInterval(() => socket.emit("message", "hello world"), 1000)
})

server.listen(5000)