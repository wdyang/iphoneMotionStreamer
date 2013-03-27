// <script type="text/javascript" id="scr_web_socket">
var g = new Object();
g.msg = new Object();
// g.msg.address = "ws://gvalkov.homeip.net:81/";
var origin = window.location.origin;
var ip = origin.split('//')[1];
g.msg.address = "ws://"+ip + ":8080";
console.log('connect to ' + g.msg.address);
// g.msg.address = "ws://10.0.1.4:8080/";  //at kunst-stoff
// g.msg.address = "ws://192.168.2.19:8080/";
//g.msg.address = "ws://192.168.1.7:81/";
g.msg.is_on_air = false;
g.msg.ws = null;
g.msg.dp = null;
g.msg.ds = "";
g.msg.dr = "";
g.msg.eh = new Object();
with(g.msg){
	eh.on_message = function(event){
		if(!event) event = window.event;
		with(g.msg){
			dp = dr.concat(event.data).split("\r\n");
			if(dp.length == 0) return; else dr = dp.pop();
			if(dp.length == 0) return;
			for(var i=0; i<dp.length; i++){
				ds = dp[i].split(",");
				if(ds.length != 3){
					document.title = "".concat("Expected 3 (x,y,z) but received ", ds.length, " parameters.");
					return;
				}
				g.events.devicemotion_set(parseFloat(ds[0]), parseFloat(ds[1]), parseFloat(ds[2]));
			}
		}
	};
	eh.onopen = function(event){
		if(!event) event = window.event;
		document.body[hasTouch? "ontouchstart": "ondblclick"] = g.msg.eh.WebSocket_close;
		document.title = "".concat(hasAccelerometer? "[server] ": "[client] ", default_title);
		console.log("eh.onopen: "+document.title);
		g.msg.is_on_air = true;
		g.msg.ws.send(hasAccelerometer? "server\r\n": "reset\r\n");
	};
	eh.onclose = function(event){
		if(!event) event = window.event;
		document.body[hasTouch? "ontouchstart": "ondblclick"] = g.msg.eh.WebSocket_init;
		document.title = default_title;
		console.log("en.onclose: "+document.title);
		g.msg.is_on_air = false;
	};
	eh.onerror = function(event){
		if(!event) event = window.event;
		console.log("en.onerror: ");
		g.msg.is_on_air = false;
	};
	eh.WebSocket_init = function(event){
		console.log("en.WebSocket_init: ");
		if(!window.WebSocket) return;
		if(!event) event = window.event;
		if(event && event.touches && (event.touches.length <= 1)) return;
		console.log("en.WebSocket_init: "+document.title);
		
		document.body[hasTouch? "ontouchstart": "ondblclick"] = g.msg.eh.WebSocket_close;
		with(g.msg){
			ws = new WebSocket(g.msg.address, "dumb-increment-protocol");
			ws.onopen = eh.onopen;
			ws.onclose = eh.onclose;
			ws.onerror = eh.onerror;
			ws.onmessage = eh.on_message;
		}
	};
	eh.WebSocket_close = function(event){
		console.log("eh.WebSocket_close: ");
		if(!event) event = window.event;
		if(event && event.touches && (event.touches.length <= 1)) return;
		if(!g.msg.ws) return;
		g.msg.ws.close(1000);
	};
}
// </script>

// <script type="text/javascript" id="scr_events">
var init=true;
var gax, gay, gaz; //global for smoothing
var z =0; //nevVal = oldVal* z + newVal * (1-z)
var nz= 1-z;

function clip(x, Min, Max){
	return Math.min(Math.max(x, Min), Max);
}
//var g = new Object();
g.events = new Object;
var el_cube;
var angle_x = 0, angle_y = 0, angle_z = 0;
g.events.keydown = function(event){
	if(!event) event = window.event;
	switch(event.keyCode){
		case 33: // PageUp
			angle_z += 30;
			break;		
		case 34: // PageDown
			angle_z -= 30;				
			break;
		case 37: // Left
			angle_y -= 30;
			break;		
		case 38: // Up
			angle_x += 30;				
			break;
		case 39: // Right
			angle_y += 30;
			break;
		case 40: // Down
			angle_x -= 30;
			break;
		default:
			return;
	};
	el_cube.style.WebkitTransitionDuration = "";
	el_cube.style.WebkitTransform = "".concat("rotateX(", angle_x, "deg) rotateY(", angle_y, "deg) rotateZ(", angle_z, "deg)");
	return false;
};
g.events.mousewheel = function(event){
	if(!event) event = window.event;
	var wheelDelta = event.wheelDelta? event.wheelDelta: -30*event.detail;
	angle_z += (wheelDelta > 0)? 30: -30;
	el_cube.style.WebkitTransitionDuration = "";
	el_cube.style.WebkitTransform = "".concat("rotateX(", angle_x, "deg) rotateY(", angle_y, "deg) rotateZ(", angle_z, "deg)");
	return false;
};
g.events.mousemove = function(event){
	if(!event) event = window.event;
	angle_y = (2*(isFirefox? event.clientX: event.x)/(window.innerWidth - 1) - 1)*360;
	angle_x = -(2*(isFirefox? event.clientY: event.y)/(window.innerHeight - 1) - 1)*360;
	el_cube.style.WebkitTransitionDuration = "0s";
	el_cube.style.WebkitTransform = "".concat("rotateX(", angle_x, "deg) rotateY(", angle_y, "deg) rotateZ(", angle_z, "deg)");
	if(g.msg.is_on_air){
		g.msg.ws.send("mouse moved");
	};
};
g.events.devicemotion = function(event){
	if(!event) event = window.event;
	var ACC = event.accelerationIncludingGravity;
	var ori = window.orientation;
	var ax = ((ori ==  0)? ACC.x: (ori == 90)? -ACC.y: (ori == -90)? ACC.y: -ACC.x);
	var ay = ((ori ==  0)? ACC.y: (ori == 90)? ACC.x: (ori == -90)? -ACC.x: -ACC.y);

	if (init){
		gax=ax;
		gay=ay;
		gaz=ACC.z;
		init = false;
	}else{
		gax=gax*z+ax*nz;
		gay=gay*z+ay*nz;
		gaz=gaz*z+ACC.z;
	}

	if(g.msg.is_on_air){
		// g.msg.ws.send("".concat(ax, ",", ay, ",", ACC.z, "\r\n"));
		g.msg.ws.send("".concat(gax, ",", gay, ",", gaz, "\r\n"));
	//	return;
	}
	g.events.devicemotion_set(gax, gay, gaz);
};
g.history = new Object();
g.history.motion = new Object();
g.history.motion.overflow = {ox:0, oy:0};
g.history.motion.rotation = {rx:0, ry:0};
g.history.motion.time = {last:0, delta:0.5}
g.events.devicemotion_set = function(x, y, z){
	var overflow_x, overflow_y;
	with(g.history.motion){
		if(z < 0){
			overflow_x = 0;
			overflow_y = 0;
		} else {
			if(overflow.ox){
				overflow_x = true;
				overflow_y = false;
			} else if(overflow.oy || (Math.abs(y) > Math.abs(x))){
				overflow_x = false;
				overflow_y = true;
			} else {
				overflow_x = true;
				overflow_y = false;
			}
		}
		overflow.ox = overflow_x;
		overflow.oy = overflow_y;
		var rx = 0, ry = 0, rz = 0;
		ry = (-90 - Math.asin( clip(y/9.81, -1, 1) )*180/Math.PI) * (overflow_y? -1: 1);
		rx = (Math.asin( clip(-x/9.81, -1, 1) )*180/Math.PI);
		rx = (overflow_x? 180 - rx: rx);
		// correct angles
		var _correction = ry + ((rotation.ry > ry)? 360: -360);
		if(Math.abs(rotation.ry - ry) > Math.abs(rotation.ry - _correction)) ry = _correction;
		rotation.ry = ry;
		_correction = rx + ((rotation.rx > rx)? 360: -360);
		if(Math.abs(rotation.rx - rx) > Math.abs(rotation.rx - _correction)) rx = _correction;
		rotation.rx = rx;
		// smooth animation
		if(!isMobile){
			var time_now = new Date();
			var time_delta = time_now - time.last;
			if(time_delta > 500) time_delta = 500;
			time.delta = Math.round(time.delta*0.8 + time_delta*0.2);
			time.last = time_now;
			// document.title = time.delta;
			el_cube.style.WebkitTransitionDuration = "".concat(Math.round(time.delta*1.5), "ms");
		}
	}
	el_cube.style.WebkitTransform = "".concat("rotateX(", ry, "deg) rotateZ(", rx, "deg) rotateY(", rz, "deg)");
//	document.title = "".concat(overflow_x, ", ", overflow_y, ", ", x);
//	document.title = "".concat(rx, ", ", ry, ", ", ACC.z);
//	document.title = "".concat(ACC.x/9.946);
};
g.events.copyright_dblclick = function(event){
	if(!event) event = window.event;
	if(event.touches && (event.touches.length <= 1)) return;
	this.style.display = "none";
};

function touchHandler(event)
{
    var touches = event.changedTouches,
    first = touches[0],
    type = "";
     switch(event.type)
    {
        case "touchstart": type = "mousedown"; g.msg.ws.send("touch start"); break;
        case "touchmove":  type="mousemove"; g.msg.ws.send("touch move"); break;        
        case "touchend":   type="mouseup"; g.msg.ws.send("touch end"); break;
        default: return;
    }
	event.preventDefault();
}

function load(event){
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true); 

	el_cube = document.getElementById('cube');
	var el_g_copyright = document.getElementById("g_copyright");
	st_ua_patch_interface(g.events);
	if(isiPhone) el_g_copyright.style.top = "400px";
	el_g_copyright[hasTouch? "ontouchstart": "ondblclick"] = g.events.copyright_dblclick;
	if(isARM) el_g_copyright.style.display = "none";
	with(g.events){
		window.onkeydown = keydown;
		window.onmousemove = mousemove;
		window.ondevicemotion = devicemotion;
		if(isFirefox) addEventListener('DOMMouseScroll', mousewheel, false); else window.onmousewheel = mousewheel;
	}
	g.msg.eh.WebSocket_init();
}
window.onload = load;
// </script>