##Tracking iphone accelerometer reading, stream to server via websocket.

Iphone web example from: http://www.youtube.com/watch?v=iXXiZTyNA8E
http://bit.ly/Mr6N2p
gvalkov.homeip.net
Server: http://einaros.github.com/ws/

some good resources:
https://github.com/9elements/joystique (iphone app to node.js to browser)
http://wavefrontlabs.com/Wavefront_Labs/Sensor_Data.html
https://github.com/infil00p/phonegap-iphone/blob/master/PhoneGapTutorial/www/accelerometer.html
http://stackoverflow.com/questions/2529422/enable-iphone-accelerometer-while-screen-is-locked
http://www.mobilexweb.com/blog/safari-ios-accelerometer-websockets-html5


Install: on mac, put under [your user name]/site

npm install ws
node server.js


<del>change index.html:
g.msg.address = "ws://192.168.1.156:8080/"; to the true web address</del>
JS use window.location.origin to identify source IP.

from iphone, access the website, data should stream

On any other PC, open a browser, point to the same web page, it will follow the iphone.

