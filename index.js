const http = require('node:http');
const fsPromises = require('node:fs/promises');
const fs = require('node:fs')
const { log } = require('node:console');
const httpFileWriteStream = require("./lib/HttpReadStreamFromFile/HttpReadStreamFromFile.js");
const cluster = require('node:cluster');
const os = require('node:os');

const HOST = "192.168.60.186";
const PORT = 3000;

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    log(`Primary process ${process.pid} is running`);
    
    // Fork worker processes
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart a worker if it crashes
    cluster.on("exit", (worker, code, signal) => {
        log(`Worker ${worker.process.pid} exited. Restarting...`);
        cluster.fork();
    });

} else {
    // Each worker runs this HTTP server
    const server = http.createServer();

    server.on("request", async (request, response) => {
        if (request.url === "/api/test/v1/read-stream-from-file" && request.method === "GET") {
            const readStreamSettings = {
                sourceFilePath: "./storage/stage/big-io/index.html",
                sourceFileOperation: "r",
                contentType: "text/html",
                highWaterMark: 1024, // Buffer size
                readStreamIndex: {}
            };
            const hfs = new httpFileWriteStream(readStreamSettings);
            await hfs.httpReadStream(response);
        }

        if (request.url === "/api/test/v1/read-stream-from-file-video" && request.method === "GET") {
            const readStreamSettings = {
                sourceFilePath: "./storage/stage/video/212mb.mp4",
                sourceFileOperation: "r",
                contentType: "video/mp4",
                highWaterMark: 64 * 1024, // Buffer size
                readStreamIndex: {}
            };
            const hfs = new httpFileWriteStream(readStreamSettings);
            await hfs.httpReadStream(response);
        }

        if (request.url === "/api/test/v1/read-stream-from-file-audio" && request.method === "GET") {
            const readStreamSettings = {
                sourceFilePath: "./storage/stage/audio/3mb.m4a",
                sourceFileOperation: "r",
                contentType: "audio/MPEG",
                highWaterMark: 64 * 1024,
                readStreamIndex: {}
            };
            const hfs = new httpFileWriteStream(readStreamSettings);
            await hfs.httpReadStream(response);
        }

        if(request.url === "/api/test/v1/download-file/video_212_mb.mp4"){
            const readStreamSettings = {
                sourceFilePath: "./storage/stage/video/video_212_mb.mp4",
                sourceFileOperation: "r",
                contentType: "application/octet-stream",
                highWaterMark: 64 * 1024, // Buffer size
                readStreamIndex: {}
            };
            const hfs = new httpFileWriteStream(readStreamSettings);
            response.writeHead(200,{
                "Content-Type":"application/octet-stream"
            })
            await hfs.httpReadStream(response);
        }
        if(request.url === '/upload/file/stream/index.html'){
            response.writeHead(200,{'Content-Type':'text/html'})
            const fileStream = fs.createReadStream("./frontend/index.html")
            fileStream.pipe(response)
            fileStream.on('error', (err) => {
                response.writeHead(500);
                response.end('Internal Server Error');
            });
            
        }
        else{
            response.writeHead(404)
            response.end('Not Found')
        }
        
    });

    server.listen(PORT, HOST, () => log(`Worker ${process.pid} listening on http://${HOST}:${PORT}`));
}