# checknet
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
### Building locally
If you want to modify the files locally, clone or download the repo, navigate inside the 'checknet' folder and use npm to install:
```
sudo npm install
```

...and then just type 'grunt' to build:
```
grunt
```