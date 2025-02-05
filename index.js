const http = require('node:http')
const fsPromises = require('node:fs/promises')
const {log} = require('node:console')
const httpFileStream =  require("./lib/http-stream/HttpReadStreamFromFile.js")

const server = http.createServer();

server.on("request", async(request,response)=>{
    //sourcePath,operation,contentType
    if(request.url === "/api/test/v1/read-stream-from-file" && request.method === "GET"){
        const readStreamSettings = {
            sourceFilePath :"./storage/big-io/index.html",
            sourceFileOperation :"r",
            contentType :"text/html",
            highWaterMark : 4 , /** buffer size of each chunk */
            /**optional */
            readStreamIndex:{}
        }
        const hfs = new httpFileStream(readStreamSettings);
        await hfs.httpReadStream(response)
    }

    if(request.url === "/api/test/v1/read-stream-from-file-video" && request.method === "GET"){
        const readStreamSettings = {
            sourceFilePath :"./storage/video/212mb.mp4",
            sourceFileOperation :"r",
            contentType :"video/mp4",
            highWaterMark : 64* 1024 , /** buffer size of each chunk */
            /**optional */
            readStreamIndex:{}
        }
        const hfs = new httpFileStream(readStreamSettings);
        await hfs.httpReadStream(response)
    }
    if(request.url === "/api/test/v1/read-stream-from-file-audio" && request.method === "GET"){
        const readStreamSettings = {
            sourceFilePath :"./storage/audio/3mb.m4a",
            sourceFileOperation :"r",
            contentType :"audio/MPEG",
            highWaterMark : 64* 1024 , /** buffer size of each chunk */
            /**optional */
            readStreamIndex:{}
        }
        const hfs = new httpFileStream(readStreamSettings);
        await hfs.httpReadStream(response)
    }

})

server.listen(process.argv[2],()=>log(`Stage Server is running at ${process.argv[2]}`))