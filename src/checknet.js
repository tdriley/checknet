//TODO: pause polling when window/tab hidden/inactive.
//TODO: prevent red xhr error in console when no connection.
//TODO: add simpler methods of checking network before polling starts. navigator.connection or whatver it is.
//TODO: add grunt lint.
//TODO: strict checking of incoming settings.

var Checknet = Checknet || (function(){

	var 
	//internal settings
	aCheckUrls = [window.location.href], //enter an array of urls you want to specify for checking. Any one of them being ok means connection is ok. These servers must allow CORS requests from your domain!
	nCheckInt = 3000, //enter number of ms between each check poll (default 3sec).
	bConActive = true, //is set to true/false to match current state of connection. True by default as page has just loaded!
	nTicker,

	_setSomething = function(sName, setting){
		switch(sName){
			case 'checkUrls':
				if(typeof setting !== 'object') return false;
				aCheckUrls = setting;
				return true;
			case 'checkInterval':
				if(typeof setting !== 'number') return false;
				if(setting < 1000) return false; //min 1000 (1 sec)
				nCheckInt = setting;
				return true;
			default:
				return false;
		}
	},

	//_funcs to be exposed on namespace
	_checkConnection = function (nUrlIndex){
		nUrlIndex = nUrlIndex || 0;

		var theUrl = aCheckUrls[nUrlIndex] || window.location.href;
		theUrl = getUrlWithCb(theUrl);

		var xhr = new XMLHttpRequest();
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
			//if there's more urls to check, check next one now.
			if(aCheckUrls.length-1 > nUrlIndex){
				_checkConnection(nUrlIndex+1);
				return;
			}

			// There was a connection error of some sort, and we've checked all urls available.
			handleCheckResult(false);
		};

		xhr.send();
	},

	_addEventListener = function(sName, fnHandler){
		if(!sName || !fnHandler) return false;

		Checknet['on'+sName] = fnHandler;
	},

	_getStatus = function(){
		return {
			conActive: bConActive,
			checkUrls: aCheckUrls,
			checkInterval: nCheckInt
		}
	},

	//internal funcs
	handleCheckResult = function(bResult){
		if(bResult===false && bConActive && typeof Checknet.ondropped==='function'){
			Checknet.ondropped();
		}else if(bResult===true && !bConActive && typeof Checknet.onrestored==='function'){
			Checknet.onrestored();
		}
		bConActive = bResult;

		//check again after a timeout 
		nTicker = setTimeout(function(){
			_checkConnection();
		}, nCheckInt);
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
		start: 				_checkConnection,
		addEventListener: 	_addEventListener,
		getStatus: 			_getStatus,
		set: 				_setSomething
	}
}());
