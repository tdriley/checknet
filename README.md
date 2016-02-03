# Checknet
Simple JavaScript library which periodically checks internet connection and calls functions of your choice when the connection is dropped or restored.

### Setup
Include the checknet.min.js (found in the src/ folder) on each page you want to be able to detect internet connection on:
```html
<script src="checknet.min.js"></script>
```


### Usage
Somewhere after including the script, add your event listeners for 'dropped' and 'restored' to the Checknet object, passing in a function you want to call in each case:
```js
Checknet.addEventListener('dropped', function(){
	//what should happen when the connection drops.
	console.log('dropped');
});

Checknet.addEventListener('restored', function(){
	//what should happpen when a dropped connection resumes.
	console.log('restored');
});
```
...and then set the check running by calling the start() method:
```js
Checknet.start();
```
Note: The page you are running the code on must be served from the internet (running it locally will not detect dropped internet connection).


### Methods for further usage
#### .set(name, value)
Takes two required params 'name' (string) and value (mixed types):
```js
Checknet.set('checkInterval', 5000); 											//sets the interval in milliseconds between each check (default 3000, minimum 1000).
Checknet.set('checkUrls', ['http://asite.com', 'https://anothersite.co.uk']); 	//sets the array of URLs to check connection with.
```
Note on 'checkUrls': By default Checknet will use the current page URL. Any other servers you add must be able to accept CORS requests (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) from the domain you are running the code on. Adding a new array will overwrite the existing one. The array can contain only one URL if you wish.

#### .getStatus()
Returns a JS object containing useful info:
```js
{
	conActive: true, 											//true if connection is active on last check, false if not.
	checkUrls: ['http://someurl.com', 'https:anotherurl.com'], 	//the current array of URLs which is being used to check there is a connection.
	checkInterval: 3000 										//the current interval in milliseconds between each check (default 3000).
}
```


### Building locally
If you want to modify the src/ files locally, clone or download the repo, navigate inside the 'checknet' folder and use npm to install:
```
sudo npm install
```

...and then just type 'grunt' to build:
```
grunt
```