const http = require('node:http')
const fsPromises = require('node:fs/promises')
const {log} = require('node:console')
const httpFileStream =  require("./lib/http-stream/httpStream.js")

const server = http.createServer();

server.on("request", async(request,response)=>{
    //sourcePath,operation,contentType
    if(request.url === "/read-stream-from-file" && request.method === "GET"){
        const readStreamSettings = {
            sourceFilePath :"./storage/big-io/index.html",
            sourceFileOperation :"r",
            contentType :"text/html",
            highWaterMark : 64 * 1024,
            /**optional */
            readStreamIndex:{
                
                
            }
        }
        const hfs = new httpFileStream(readStreamSettings);
        hfs.httpReadStream(response)
    }
})


server.listen(3000,()=>log('running'))