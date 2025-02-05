const assert = require('node:assert');
const fs = require('node:fs');
const { Writable } = require('node:stream');
const HttpReadStreamFromFile = require('../../lib/http-stream/httpStream');

// Create a mock writable stream to simulate an HTTP response
class MockResponse extends Writable {
    constructor() {
        super();
        this.chunks = []; // Store received chunks
        this.headers = {}; // Simulate HTTP headers
    }

    write(chunk) {
        this.chunks.push(chunk); // Collect chunks
        return true; // Simulate backpressure handling
    }

    setHeader(name, value) {
        this.headers[name] = value; // Mock HTTP headers
    }

    end(chunk) {
        if (chunk) this.chunks.push(chunk);
        this.finished = true; // Simulate HTTP response completion
    }
}

//  Create a sample test file
const TEST_FILE = 'testfile.txt';
fs.writeFileSync(TEST_FILE, 'Hello, this is a test file for streaming.');

//  Test the HttpReadStreamFromFile class
async function testHttpReadStreamFromFile() {
    console.log('Running unit test...');

    const response = new MockResponse(); // Mock HTTP response

    const readStream = new HttpReadStreamFromFile({
        sourceFilePath: TEST_FILE,
        sourceFileOperation: 'r',
        contentType: 'text/plain',
        highWaterMark: 16, // Small chunks to test streaming
        readStreamIndex: { start: 0, end: 15 } // Read first 16 bytes
    });

    await readStream.httpReadStream(response);

    //  Assertions
    assert.strictEqual(response.headers['Content-Type'], 'text/plain', 'Content-Type header mismatch');
    assert.strictEqual(Buffer.concat(response.chunks).toString(), 'Hello, this is ', 'Streamed content mismatch');
    assert.strictEqual(response.finished, true, 'Response should be finished');

    console.log(' Test passed: File streamed correctly.');
}

// Run the test
testHttpReadStreamFromFile()
    .catch(err => console.error(' Test failed:', err))
    .finally(() => fs.unlinkSync(TEST_FILE)); // Cleanup test file
