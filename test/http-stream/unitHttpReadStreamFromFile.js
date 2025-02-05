const http = require('http');
const fs = require('fs')
const assert = require('assert')



const HttpReadStreamFromFile = require('../../lib/http-stream/HttpReadStreamFromFile.js');
const { log } = require('console');
const TEST_FILE_PATH = '../../storage/test_file.txt';
const TEST_FILE_CONTENT = 'This is a test file content for streaming';

/**Utility Function to create a test file */
const createTestFile = () =>{
    fs.writeFileSync(TEST_FILE_PATH,TEST_FILE_CONTENT)
}
/**Utility Function to delete the test file */
const deleteTestFile = ()=>{
    if(fs.existsSync(TEST_FILE_PATH))fs.unlinkSync(TEST_FILE_PATH)
}

const testHttpReadStreamFromTextFile = async() =>{
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
    unitTestServer.listen(process.argv[2],async()=>{
        log(`Test Server started on port ${process.argv[2]}`)
        const options = {
            hostName:'localhost',
            port:process.argv[2],
            path:'/read-stream-from-file',
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
                    console.log("✅ Test Case: 1, Status: Test passed, Message: Streaming works correctly for reading a stream from txt file");
                }catch(err){
                    console.error("❌ Test Case: 1, Status: Test failed, Message: ", err.message)
                }finally{
                    unitTestServer.close(()=>{
                        log("Test Server Closed");
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
    
}

testHttpReadStreamFromTextFile();