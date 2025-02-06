const http = require("http");
const fs = require("fs");
const assert = require("assert");
const HttpReadStreamFromFile = require("../../lib/HttpReadStreamFromFile/HttpReadStreamFromFile.js");

const TEST_VIDEO_PATH = "../../storage/test/video/212mb.mp4";

const testHttpReadStreamFromVideoFile = async (port,host) => {
    return new Promise((resolve,reject)=>{
        if (!fs.existsSync(TEST_VIDEO_PATH)) {
            console.error("❌ Test video file not found. Please add the video in .", TEST_VIDEO_PATH, " location");
            return;
        }
    
        // Start a basic HTTP server
        const server = http.createServer(async (req, res) => {
            const streamHandler = new HttpReadStreamFromFile({
                sourceFilePath: TEST_VIDEO_PATH,
                sourceFileOperation: "r",
                contentType: "video/mp4",
                highWaterMark: 1024 * 1024, // 1MB chunk size for video
            });
    
            await streamHandler.httpReadStream(res);
        });
    
        server.listen(port, async () => {
            // console.log(`Test server started on port ${process.argv[3]}`);
    
            // Perform an HTTP request to the server
            const options = {
                hostname: host,
                port: port,
                path: "/read-stream-from-file-video",
                method: "GET",
            };
    
            const req = http.request(options, (res) => {
                let receivedChunks = [];
    
                res.on("data", (chunk) => {
                    receivedChunks.push(chunk);
                });
    
                res.on("end", () => {
                    try {
                        // Combine received chunks into a single buffer
                        const receivedBuffer = Buffer.concat(receivedChunks);
    
                        // Compare the first few bytes (signature) of the video file
                        const expectedBuffer = fs.readFileSync(TEST_VIDEO_PATH);
                        assert.strictEqual(
                            res.statusCode,
                            200,
                            "Expected HTTP 200 status"
                        );
                        assert.strictEqual(
                            res.headers["content-type"],
                            "video/mp4",
                            "Incorrect Content-Type"
                        );
                        assert.strictEqual(
                            receivedBuffer.slice(0, 20).toString("hex"),
                            expectedBuffer.slice(0, 20).toString("hex"),
                            "Video content mismatch (first 20 bytes)"
                        );
    
                        console.log("✅ Test Case: 2, Status: Test passed, Message: Streaming works correctly for reading a stream from Video file");
                        resolve()
                    } catch (err) {
                        console.error("❌ Test Case: 2, Status: Test failed, Message: ", err.message)
                        reject()
                    } finally {
                        server.close(() => {
                            // console.log("Test video Server Closed");
                        });
                    }
                });
            });
            req.on("error", (err) => {
                console.error("❌ Request error:", err.message);
            });
            req.end();
        });
    })
};


module.exports = testHttpReadStreamFromVideoFile;
