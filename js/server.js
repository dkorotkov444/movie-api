/*  server.js
* This module runs web server for REEL application
* Uses ESM syntax
*/
// Import Node modules
import http from "http";
import fs from "fs";
import path from "path"; // Import the path module
import url, { fileURLToPath } from "url"; // Import fileURLToPath from the url module

// Get the directory name for the current module in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Async function creats web server at port /localhost:8080
http.createServer((request,response) => {

    // Gets URL from user request
    let addr = request.url,
        q = new URL(addr, 'http://' + request.headers.host),
        filePath = '';

        // Log URL from user request and the time of request
        fs.appendFile('./files/log.txt', `URL: ${addr}
            Timestamp: ${new Date()}
                                  
            `, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Server request added to log');
            }
        });

        // Construct file path according to user request
        if (q.pathname.includes('documentation')) {
            filePath = (path.join(__dirname, '..', 'documentation.html'));
        } else {
            filePath = 'index.html'
        }

        // Read requested file and return it to user
        fs.readFile(filePath, (err,data) => {
            if (err) {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('404 Not Found');
                return; // Stop execution
            }
            // Return documentation file to user
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });

}).listen(8080);    // Web server listens on port 8080

console.log('My first Node test server is running on Port 8080.');