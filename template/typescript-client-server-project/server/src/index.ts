import * as http from "http"

http.createServer((req, res) => {
  res.end("here")
}).listen(5001)

console.log("hello")