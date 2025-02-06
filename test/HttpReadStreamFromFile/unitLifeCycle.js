(async () => {
    const testHttpReadStreamFromTextFile = require("./unitHttpReadStreamFromTextFile");
    const testHttpReadStreamFromVideoFile = require("./unitHttpReadStreamFromVideoFile");
    await testHttpReadStreamFromTextFile(5000,"127.0.0.1");
    await testHttpReadStreamFromVideoFile(5001,"127.0.0.1"); 
    console.log("All Tests Completed.");
})();
