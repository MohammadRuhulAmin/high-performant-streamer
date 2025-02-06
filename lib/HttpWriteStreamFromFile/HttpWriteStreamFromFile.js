const http = require('node:http');
const { log } = require('node:console');
const path = require('path');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');

const filePath = path.join(__dirname, './test.txt');

(async () => {
    let fileHandle;
    try {
        fileHandle = await fsPromises.open(filePath, 'r'); // Open the file
        const stats = await fileHandle.stat(); // Get file stats
        fileHandle.close(); // Close file handle as we only needed stats

        const options = {
            hostname: '192.168.60.186',
            port: 3000,
            path: '/api/test/v1/read-stream-from-file',
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': stats.size // Correct way to get file size
            }
        };

        log("Options:", options);

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                log('Server response:', responseData);
            });
        });

        req.on('error', (err) => {
            console.error('Request error:', err);
        });

        // Create a read stream and pipe it to the request
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(req);

        fileStream.on('end', () => {
            log('File upload complete');
        });

    } catch (error) {
        console.error("Error:", error);
    }
})();
