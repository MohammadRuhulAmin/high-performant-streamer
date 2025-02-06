const http = require('node:http');
const { log } = require('node:console');
const path = require('path');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');

const filePath = path.join(__dirname, '212mb.mp4');

(async () => {
    let fileHandleRead;
    try {
        fileHandleRead = await fsPromises.open(filePath, 'r');
        const stats = await fileHandleRead.stat();
        
        const options = {
            hostname: '192.168.96.1',
            port: 3000,
            path: '/api/test/v1/read-stream-from-file',
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': stats.size,
                'filePath':filePath
            }
        };

        
        const request = http.request(options, (response) => {
            let responseData = '';
            response.on('data', (chunk) => responseData += chunk);
            response.on('end', () => {
                request.end()
                log('Server response:', responseData);
            });
        });

        request.on('error', (err) => console.error('Request Error:', err.message));
        const fileReadStream = fileHandleRead.createReadStream();
        fileReadStream.on("data",(chunk)=>{
            log("reading chunk: ",chunk)
            if(request.write(chunk) === false)fileReadStream.pause();
        })
        request.on("drain",()=>fileReadStream.resume())


        fileReadStream.on("end", () => {
            request.end();
            log("Finished uploading");
        });

        fileReadStream.on("error", (err) => {
            log("File Stream Error:", err.message);
            request.destroy();
        });

    } catch (error) {
        console.error("Error:", error);
    }
})();
