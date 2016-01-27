//TODO: pause polling when window/tab hidden/inactive.
//TODO: implement accepting array of urls to test.
//TODO: prevent red xhr error in console when no connection.
//TODO: method on main object for setting settings.

var Checknet = Checknet || (function(){

	var 
	//internal settings
	sCheckUrl = '', //enter a url you want to specify for checking. Server must allow CORS requests!
	nCheckInt = 2000, //enter number of ms between each check poll (default 5sec).
	bConActive = true, //is set to true/false to match current state of connection.
	nTicker,

	//_funcs to be exposed on namespace
	_checkConnection = function (){
		var theUrl = sCheckUrl || window.location.href;
		theUrl = getUrlWithCb(theUrl);

		var xhr = new XMLHttpxhr();
		xhr.open('HEAD', theUrl, true);

		xhr.onload = function() {
			handleCheckResult(true);
			// var resultEvt;
			// if (xhr.status >= 200 && xhr.status <=400) {
			// 	// success!
			// } else {
			// 	// reached our target server, but it returned an error
			// }
		};

		xhr.onerror = function() {
			// There was a connection error of some sort
			handleCheckResult(false);
		};

		xhr.send();

		//check again after a timeout 
		nTicker = setTimeout(function(){
			_checkConnection();
		}, nCheckInt);
	},

	_addEventListener = function(sName, fnHandler){
		if(!sName || !fnHandler) return false;

		Checknet['on'+sName] = fnHandler;
	},

	_getStatus = function(){
		return bConActive;
	},

	//internal funcs
	handleCheckResult = function(bResult){
		if(bResult===false && bConActive && typeof Checknet.ondropped==='function'){
			Checknet.ondropped();
		}else if(bResult===true && !bConActive && typeof Checknet.onrestored==='function'){
			Checknet.onrestored();
		}
		bConActive = bResult;
	},

	getUrlWithCb = function(sUrl){
		//TODO: make this more unique, and ensure it won't break any url
		var sQueryString = /^[^#?]*(\?[^#]+|)/.exec(sUrl)[1],
			sQsChar,
			sUrlWithCb;

		sQsChar = (sQueryString) ? '&' : '?';

		sUrlWithCb = sUrl + sQsChar + new Date().getTime();
		return sUrlWithCb;
	};

	//return props & funcs to be exposed on namespace
	return {
		start: _checkConnection,
		addEventListener: _addEventListener,
		getStatus: _getStatus
	}
}());

Checknet.addEventListener('dropped', function(){
	//what should happen when the connection drops.
	console.log('dropped');
});
Checknet.addEventListener('restored', function(){
	//what should happpen when a dropped connection resumes.
	console.log('restored');
});

//set it going!
Checknet.start();