//TODO: prevent red xhr error in console when no connection.
//TODO: add grunt lint.
//TODO: strict checking of incoming params.
//TODO: make cachebuster more unique, and ensure it won't break any url (hashes etc).
//TOOD: make http status code checking tighter.

var Checknet = (function(){

	var 
	/* internal settings */
	aCheckUrls 	= [window.location.href], 	 //array of urls to check against by default. Any one of them being ok means connection is ok. These servers must allow CORS requests from your domain, and handle cachebsuters.
	nCheckInt 	= 3000, 					 //enter number of ms between each check poll (default 3sec).
	bConActive	= true, 					 //is set to true/false to match current state of connection. True by default as page has just loaded!
	nTicker,

	/* _funcs to be exposed on namespace */
	_setSomething = function(sName, setting){
		switch(sName){
			case 'checkUrls':
				if(typeof setting !== 'object' || !setting.length) return false;
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

	_checkConnection = function (nUrlIndex){
		nUrlIndex = nUrlIndex || 0;

		var theUrl = aCheckUrls[nUrlIndex] || window.location.href;
		theUrl = getUrlReadyToUse(theUrl);

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

		if(typeof _evtHandlers[sName] === 'function') _evtHandlers[sName] = fnHandler;
	},

	_getStatus = function(){
		return {
			conActive: bConActive,
			checkUrls: aCheckUrls,
			checkInterval: nCheckInt
		}
	},

	/* internal funcs */
	init = function(){
		document.addEventListener("visibilitychange", onVisChange);
	},

	_evtHandlers = {
		dropped: function(){
			console.log('Connection dropped but no handler set yet. Use Checknet.addEventListener("eventName", "eventHandler") to add. ');
		},
		restored: function(){
			console.log('Connection restored but no handler set yet. Use Checknet.addEventListener("eventName", "eventHandler") to add. ');
		}
	},

	onVisChange = function(){
		if (document.hidden) {
			// console.log('Vis changed, stopped checking.');
			clearTimeout(nTicker);
		}else{
			// console.log('Vis changed, resumed checking.');
			resetChecking();
		}
	},

	resetChecking = function(){
		clearTimeout(nTicker);
		nTicker = setTimeout(function(){
			_checkConnection();
		}, nCheckInt);
	},

	handleCheckResult = function(bResult){
		if(bResult===false && bConActive){
			_evtHandlers.dropped();
		}else if(bResult===true && !bConActive){
			_evtHandlers.restored();
		}
		bConActive = bResult;
		resetChecking();
	},

	getUrlReadyToUse = function(sUrl){
		//add a cachebuster
		var sQueryString = /^[^#?]*(\?[^#]+|)/.exec(sUrl)[1],
			sQsChar,
			sNewUrl;

		sQsChar = (sQueryString) ? '&' : '?';
		sNewUrl = sUrl + sQsChar + '_=' + Math.round( Math.random()*100000000 );

		//make the url protocol-less
		sNewUrl = sNewUrl.replace(/^https?:/, '');

		//add slashes if they are not present
		if( !sNewUrl.match(/^\/\//) ){
			sNewUrl = '//' + sNewUrl;
		}

		return sNewUrl;
	};

	/* code to run straight away */
	init();

	/* return props & funcs to be exposed on namespace */
	return {
		start: 				_checkConnection,
		addEventListener: 	_addEventListener,
		getStatus: 			_getStatus,
		set: 				_setSomething
	};
})();
