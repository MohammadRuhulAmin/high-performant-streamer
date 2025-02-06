const http = require('http');
const fs = require('fs')
const assert = require('assert')
const { log } = require('console');

const HttpReadStreamFromFile = require('../../lib/HttpReadStreamFromFile/HttpReadStreamFromFile.js');
const TEST_FILE_PATH = '../../storage/test/big-io/index.html';
const TEST_FILE_CONTENT = 'This is a test file content for streaming';


/**Utility Function to create a test file */
const createTestFile = () =>{
    fs.writeFileSync(TEST_FILE_PATH,TEST_FILE_CONTENT)
}
/**Utility Function to delete the test file */
const deleteTestFile = ()=>{
    if(fs.existsSync(TEST_FILE_PATH))fs.unlinkSync(TEST_FILE_PATH)
}

const testHttpReadStreamFromTextFile = async(port,host) =>{
    return new Promise((resolve,reject)=>{
        createTestFile();
        /**Start a basic HTTP server */
        const unitTestServer = http.createServer(async(req , res)=>{
            const streamHandler = new HttpReadStreamFromFile({
                sourceFilePath: TEST_FILE_PATH,
                sourceFileOperation: "r",
                contentType: "text/plain",
                highWaterMark: 10, // Small chunk size for testing
            })
            await streamHandler.httpReadStream(res);
        });
        unitTestServer.listen(port,host,async()=>{
            // log(`Test File Server started on port ${process.argv[3]}`)
            const options = {
                hostName:host,
                port:port,
                path:'/read-stream-from-file-text',
                method:'GET'
            };
    
            const req = http.request(options,(res)=>{
                let data = "";
                res.on("data",(chunk)=>{
                    data += chunk.toString();
                })
                res.on("end",()=>{
                    try{
                        assert.strictEqual(res.statusCode, 200, "Expected HTTP 200 status");
                        assert.strictEqual(
                            data,
                            TEST_FILE_CONTENT,
                            "Streamed content mismatch"
                        );
                        assert.strictEqual(
                            res.headers["content-type"],
                            "text/plain",
                            "Incorrect Content-Type"
                        );
                        console.log("✅Test Case: 1, Status: Test passed, Message: Streaming works correctly for reading a stream from txt file");
                        resolve()
                    }catch(err){
                        console.error("❌Test Case: 1, Status: Test failed, Message: ", err.message)
                        reject()
                    }finally{
                        unitTestServer.close(()=>{
                            // log("Test File Server Closed");
                            deleteTestFile()
                        })
                    }
                })
            })
            req.on("error",(err)=>{
                console.error("Request Error", err.message);
            })
            req.end();
        })
    })
    
    
}


module.exports =  testHttpReadStreamFromTextFile;