/**************************************************************
*  CasperJS Test Node Server
*  Authors: Weston Clark, Ryan Walker
*
*  This is a node web server that will relay information from
*  the html interface and the Javascripts that will check each
*  website.
*
*  The node server uses the socket.io module to create a socket
*  connection between the web page and the server. When the
*  server is running and the web page is opened, a connection will
*  initiated and start the automatic call of the scripts to check
*  the sites every 10 minutes.
*  A manual check button on the web page will also cause an
*  immediate call of the checks.
*
**************************************************************/

var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var util = require('util');
var exec = require('child_process').exec;

var puts = function(error, stdout, stderr){
  util.print(stdout);
};

const PORT = 8080;

var server = http.createServer();
server.listen(PORT);

//Define our main function to call the scripts, 'runChecks'
var runChecks = function(){

  //create a timestamp to put with each script run
  var date = new Date();
  var timestamp = (date.getMonth() + 1) + "/"  + date.getDate()  + "/" +
                   date.getFullYear()   +  " " + date.getHours() + ":" +
                   date.getMinutes()    + ":"  + date.getSeconds();

  //log that we are running the scripts
  console.log("Scripts are running -  " + timestamp);

  //Run each script
  exec("casperjs casperTest.js", puts);
};

//have the server listen for a connection with the web page
io.listen(server).on('connection', function(socket){

  //Log that we have a connection
  console.log("The server and HTML page are connected!");

  var autoRun = function(){
    socket.emit("reload");
    runChecks();
  };

  //we'll set a timer here to run the scripts every 10 min (60000ms)
  var timer = setInterval(autoRun, 600000);

  //Web page button press allows a manual running of the scripts
  socket.on("runChecks", function(){
    //reset the timer
    clearInterval(timer);
    timer = setInterval(autoRun, 600000);

    //tell the webpage to reset it's data
    socket.emit("reload");
    runChecks();
  });

  /**********************************************
  * Now we set listeners to each file the scrips
  * will update. When a file has been updated, the
  * server notifies the web page and the status,
  * good or bad, can be displayed
  **********************************************/

  fs.watchFile("check.txt", function() {
      var text = fs.readFileSync("check.txt").toString();
      var check = {status: text, id: "YouTube"};
      socket.emit("check", check);
  });
});