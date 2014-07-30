## upyun 

a pure front-end upyun form upload service, supports both native js and angular.js

### Installation
```
$ bower install upyun --save
```
if you want to use NPM instead of bower, just
```
$ npm install upyun-form --save
```

### Example

See more exmaples in `./examples` dir, or `$ npm run example` instead.

#### Use as angular module

html parts:
```html
<form name="uploadForm" role="form" ng-controller="uploader">
  <input type="file" name="file">
  <a ng-click="upload()">Upload</a>
</form>
```

javascript parts:
```javascript
var app = angular.module('myApp',['upyun']);

// bind from form
// required params must be defined in the form
app.controller('upload', function($scope, $upyun) {
  // config upyun instance the very first
  $upyun.set('bucket','mybucket');
  $upyun.set('form_api_secret', 'xxxxxxxxxxx');
  
  // uploadForm is the form's name `form(name="uploadForm")`
  $scope.upload = function() {
    $upyun.upload('uploadForm', function(err, response, image){
      if (err) return console.error(err);
      console.log(response);
      console.log(image);
    });
  }
});
```

#### Use as `window.upyun`

make sure `window.md5` and `window.Base64` exist.

html parts:
```html
<form name="uploadForm" role="form">
  <input type="file" name="file">
  <a class="submit" onclick="upload();">Upload</a>
</form>
```
javascript parts:
```javascript
function upload() {
  upyun('uploadForm', function(err, response, image){
      if (err) return console.error(err);
      console.log(response);
      console.log(image);
    });
  });
}
```

### Development

install all devDependencies and run a static file serve server:
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