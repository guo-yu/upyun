## upyun 

a pure front-end upyun form upload service, supports both native js and angular.js

### Installation
````
$ bower install upyun --save
````

### Example
Use as a angular module:
```javascript
var app = angular.module('myApp',['upyun']);

// bind from form
// required params must be defined in the form
app.controller('upload', function($scope, $upyun) {
  // config upyun instance the very first
  $upyun.set('bucket','mybucket');
  $upyun.set('form_api_secret', 'xxxxxxxxxxx');

  // uploadForm is the form's name `form(name="uploadForm")`
  $upyun.upload('uploadForm', function(err, response){
    if (err) return console.error(err);
    console.log(response);
  });
});

// custom bind file
app.controller('uploadByFile', function($scope, $upyun) {
  $upyun.upload(fileInstance, function(err, response){
    if (err) return console.error(err);
    console.log(response);
  });
});
```

Use as `window.upyun`, make sure `window.md5` and `window.base64` exist.
```javascript
upyun('uploadForm', function(err, response){
    if (err) return console.error(err);
    console.log(response);
  });
});
```

### Development
install all deps:
```
$ git clone https://github.com/turingou/upyun.git
$ cd upyun
$ bower install 
$ npm install
$ npm run dev
```

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

### MIT license
Copyright (c) 2014 turing &lt;o.u.turing@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
![docor](https://cdn1.iconfinder.com/data/icons/windows8_icons_iconpharm/26/doctor.png)
built upon love by [docor](https://github.com/turingou/docor.git) v0.1.3