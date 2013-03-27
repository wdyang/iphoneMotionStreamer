// scr_version
var isARM		= (window.navigator.userAgent.toUpperCase().indexOf("ARM")			!= -1);
var isChrome	= (window.navigator.userAgent.toUpperCase().indexOf("CHROME")		!= -1);
var isChrome_ARM= isARM && isChrome;
var isIE		= (window.navigator.userAgent.toUpperCase().indexOf("MSIE")			!= -1);
var isOpera		= (window.navigator.userAgent.toUpperCase().indexOf("OPERA")		!= -1);
var isWebKit	= (window.navigator.userAgent.toUpperCase().indexOf("WEBKIT")		!= -1);
var isiPad		= (window.navigator.userAgent.toUpperCase().indexOf("IPAD")			!= -1);
var isiPhone	= (window.navigator.userAgent.toUpperCase().indexOf("IPHONE")		!= -1) || isiPad;
var isLinux		= (window.navigator.userAgent.toUpperCase().indexOf("LINUX")		!= -1);
var isMobile	= (window.navigator.userAgent.toUpperCase().indexOf("MOBILE")		!= -1) || isChrome_ARM || 0;
var isFirefox	= (window.navigator.userAgent.toUpperCase().indexOf("FIREFOX")		!= -1);
var hasTouch	= (typeof(window.ontouchstart) != "undefined");//isMobile && !isChrome_ARM;
var hasAccelerometer = (window.orientation == undefined)? false: true;
var isDebug		= true;


// scr_style
var default_title = document.title;
var st_ua_specific = isWebKit? ["-webkit", ".Webkit", "Webkit", "webkit"]: isFirefox? ["-moz", ".Moz", "Moz", "moz"]: isOpera? ["-o", ".O", "O", "o"]: isIE? ["-ms", ".ms", "ms", "ms"]: ["", ".", "", ""];
function st_ua_patch_style(_st_name){
	var el_style = document.getElementById(_st_name);
	if(!el_style.childNodes.length) return;
	if(isiPhone) el_style.childNodes[0].data = el_style.childNodes[0].data.replace(/box-shadow:/g, "-webkit-box-shadow:");
	if(isWebKit) return;
	el_style.childNodes[0].data = el_style.childNodes[0].data.replace(/-webkit/g, st_ua_specific[0]);
}

st_ua_patch_style("gStyles");
function st_ua_patch_interface(_obj) { // browser compatibility patch for transitions and animations
	if(isiPhone) for(ff in _obj) eval(''.concat('_obj["', ff, '"] = ', _obj[ff].toString().replace(/box-shadow:/g, "-webkit-box-shadow:").replace(/.boxShadow/g, ".WebkitBoxShadow"), ';'));
	if(isWebKit) return;
	for (ff in _obj) {
		if (_obj[ff].toString().indexOf("st_ua_patch_interface:false") >= 0) continue;
		eval( ''.concat('_obj["', ff, '"] = ', _obj[ff].toString().replace(/-webkit/g, st_ua_specific[0]).replace(/.Webkit/g, st_ua_specific[1]), ';') );
	}
}

function st_addRule(_selector, _style, _index){
	if(!isWebKit) _style = _style.replace(/-webkit/g, st_ua_specific[0]);
	var style_sheet = document.styleSheets[0];
	if(style_sheet.insertRule) style_sheet.insertRule( "".concat(_selector, " { ", _style, " } "), _index );
	else if(style_sheet.addRule) style_sheet.addRule(_selector, _style, _index);
}

function st_getRule_style(_selectorText){
	var style_sheet = document.styleSheets[0];
	var cssRules = style_sheet.cssRules? style_sheet.cssRules: style_sheet.rules;
	for(var i = cssRules.length - 1; i >= 0; i--) if(cssRules.item(i).selectorText == _selectorText) return cssRules.item(i).style;
	if((_selectorText.indexOf(" ::") < 0) && (_selectorText.indexOf("::") >= 0)) return st_getRule_style(_selectorText.replace(/::/g, " ::"));
	return null;
}

function st_setRule_item(_selectorText, _name, _value){
	var cssRule = st_getRule_style(_selectorText);
	if(!cssRule) return null;
	cssRule[_name] = _value;
}

st_addRule(".st_perspective", isARM? "-webkit-transform:scale(0.3) translateY(-600px);": isMobile? "-webkit-transform:scale(0.4) translateX(-50px) translateY(-300px);": "-webkit-transform:translateY(100px);", 0);
if(!isMobile) st_addRule(".st_cube",	"-webkit-transition:-webkit-transform 2s ease-out;", 0);
if(isARM) st_addRule("BODY",	"cursor: none; overflow:hidden;", 0);
