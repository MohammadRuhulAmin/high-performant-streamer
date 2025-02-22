const http = require('node:http')
const fsPromises = require('node:fs/promises')
const {log} = require('node:console')


class HttpReadStreamFromFile{
    constructor(readStreamSettings){
        this.sourcePath = readStreamSettings.sourceFilePath;
        this.operation = readStreamSettings.sourceFileOperation;
        this.contentType = readStreamSettings.contentType;
        this.customHighWaterMarkValue = readStreamSettings.highWaterMark;
        this.startIndex = readStreamSettings?.readStreamIndex?.start;
        this.endIndex = readStreamSettings?.readStreamIndex?.end;
    }


    async  httpReadStream(response){
        try{
            response.setHeader("Content-Type",this.contentType);
            response.setHeader("Connection", "keep-alive");
            const fileHandleRead = await fsPromises.open(this.sourcePath,this.operation);
             /** default highWatermark =  64 * 1024 is the buffer / chunk size*/
            const fileReadStream = fileHandleRead.createReadStream({
                    highWaterMark:this.customHighWaterMarkValue,
                    start: this?.startIndex,
                    end: this?.endIndex
                }
            );
            fileReadStream.on("data",(chunk)=>{
                // log(chunk)
                if(response.write(chunk) === false)fileReadStream.pause();
            })
            response.on("drain",()=>fileReadStream.resume())
            response.on("finish",()=>{
                response.statusCode = 200;
                // log('response successfully streamed')
            })
            response.on("error",(err)=>{
                response.statusCode = 500;
                response.end("Internal Server Error")
            })
            response.on("close",async()=>{
                // await fileReadStream.close()
            })

            fileReadStream.on("end", async()=>{
                response.end();
                await fileReadStream.close()
                // log("File read Closed")
            })

        }catch(err){
            log(err.message)
            response.statusCode = 500;
            response.end("Internal Server Error")
        }
    }
}
module.exports = HttpReadStreamFromFile;