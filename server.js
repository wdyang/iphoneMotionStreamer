var fs = require('fs');

var WebSocketServer = require('ws').Server;
 
var wss = new WebSocketServer({port: 8080});

var wslist=[];
var motion_data = [];
var t0 = Date.now();
var log_idx = 0;
var Logging = true;

if(Logging) console.log('server started');

var save_to_log=function(){ //stop logging, save existing data to a file
	Logging = false;
	var fname = 'data/datalog-'+log_idx+'.csv';
	console.log("stop logging and save to" + fname);
	var stream = fs.createWriteStream(fname);
	stream.once('open', function(fd){
		stream.write('ms,x,y,z');
		motion_data.forEach(function(d){
			stream.write(d);
		});
		stream.end();
	});
	log_idx +=1;
};

var start_logging = function(){
	console.log('start logging');
	motion_data = [];
	t0=Date.now();
	Logging = true;
};

wss.on('connection', function(ws) {
	console.log('incoming message');
	wslist.push(ws);
    ws.on('message', function(message) {
    	if(message.indexOf('touch')>-1){ //a touch on iphone triggers a saving event
    		console.log('received: %s', message);
			if(message.indexOf('end')>-1){ //touch up, toggle logging
				if(Logging){ //logging in progress, save and stop
					save_to_log();
				}else{
					start_logging();
				}
    		}
    	}else{
    		if (Logging) motion_data.push(''+Date.now()-t0+','+message);
    		wslist.forEach(function(w){ // movement information received, save to data
		    	if(w!=ws) w.send(message, function(error){
		    		// console.log("client detached, removing from the list");
		    		var idx = wslist.indexOf(w);
		    		// wslist.splice(idx, 1);
		    	});
		    });
		}
    });
    // ws.send('something');
});