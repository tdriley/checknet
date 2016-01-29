//TODO: prevent red xhr error in console when no connection.
//TODO: add simpler methods of checking network before polling starts. navigator.connection or whatver it is (though this only checks for network, not internet).
//TODO: add grunt lint.
//TODO: strict checking of incoming params.
//TODO: make cachebuster more unique, and ensure it won't break any url (hashes etc)
//TODO: remove protocol before check request set.

var Checknet = (function(){

	var 
	/* _internal settings */
	_aCheckUrls = [window.location.href], //enter an array of urls you want to specify for checking. Any one of them being ok means connection is ok. These servers must allow CORS requests from your domain!
	_nCheckInt = 3000, //enter number of ms between each check poll (default 3sec).
	_bConActive = true, //is set to true/false to match current state of connection. True by default as page has just loaded!
	_nTicker,

	/* _funcs to be exposed on namespace */
	_setSomething = function(sName, setting){
		switch(sName){
			case 'checkUrls':
				if(typeof setting !== 'object') return false;
				_aCheckUrls = setting;
				return true;
			case 'checkInterval':
				if(typeof setting !== 'number') return false;
				if(setting < 1000) return false; //min 1000 (1 sec)
				_nCheckInt = setting;
				return true;
			default:
				return false;
		}
	},

	_checkConnection = function (nUrlIndex){
		nUrlIndex = nUrlIndex || 0;

		var theUrl = _aCheckUrls[nUrlIndex] || window.location.href;
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
			if(_aCheckUrls.length-1 > nUrlIndex){
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
			conActive: _bConActive,
			checkUrls: _aCheckUrls,
			checkInterval: _nCheckInt
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
			clearTimeout(_nTicker);
		}else{
			// console.log('Vis changed, resumed checking.');
			resetChecking();
		}
	},

	resetChecking = function(){
		clearTimeout(_nTicker);
		_nTicker = setTimeout(function(){
			_checkConnection();
		}, _nCheckInt);
	},

	handleCheckResult = function(bResult){
		if(bResult===false && _bConActive){
			_evtHandlers.dropped();
		}else if(bResult===true && !_bConActive){
			_evtHandlers.restored();
		}
		_bConActive = bResult;
		resetChecking();
	},

	getUrlWithCb = function(sUrl){
		var sQueryString = /^[^#?]*(\?[^#]+|)/.exec(sUrl)[1],
			sQsChar,
			sUrlWithCb;

		sQsChar = (sQueryString) ? '&' : '?';

		sUrlWithCb = sUrl + sQsChar + new Date().getTime();
		return sUrlWithCb;
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
