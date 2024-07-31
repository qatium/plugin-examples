const http = require("http");
const fs = require("fs");

const host = 'localhost';
const port = 1234;

const data = JSON.parse(fs.readFileSync("./data.json"))
let currentData = 0;

setInterval(() => {
  if (currentData + 1 < data.length) {
    currentData++;
  } else {
    currentData = 0;
  }
}, 8000)

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Max-Age': 2592000
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  res.writeHead(200, headers);
  res.end(JSON.stringify(data[currentData]));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});