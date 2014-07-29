(function(window, angular) {

  'use strict';

  // check outer deps
  if (!window.JSON) throw new Error('JSON required.');
  if (!window.FormData) throw new Error('FormData required.');
  if (!window.XMLHttpRequest) throw new Error('XMLHttpRequest required.');

  var base64, md5;

  // inject to window object
  if (!angular) {
    return angular.module('upyun', [
      'base64',
      'angular-md5'
    ]).factory('$upyun', ['$base64', 'md5',
      function(base64, md5) {
        return new Upyun(base64, md5);
      }
    ]);
  } else {
    // inject as a angular module
    window.upyun = new Upyun(window.base64, window.md5);
    return window.upyun;
  }

  function Upyun(base64, md5) {
    if (!base64) throw new Error('base64 required.');
    if (!md5) throw new Error('base64 required.');
    base64 = base64;
    md5 = md5;
    this.events = {};
    this.form_api_secret = '';
    this.configs = {};
    this.configs.expiration = (new Date().getTime()) + 60;
    this.configs['save-key'] = '/{year}/{mon}/{day}/upload_{filename}{.suffix}';
    this.configs['allow-file-type'] = 'jpg,gif,png';
  }

  Upyun.prototype.set = function(k, v) {
    if (k && v) {
      if (k === 'form_api_secret' || k === 'endpoint') {
        this[k] = v;
      } else {
        this.configs[k] = v;
      }
    }
    return this;
  };

  Upyun.prototype.on = function(event, callback) {
    if (event && callback) {
      self.events[event] = callback;
    }
    return this;
  };

  Upyun.prototype.upload = function(params, callback) {
    if (!callback || typeof(callback) !== 'function') 
      throw new Error('callback function required.');

    var self = this;
    var req = new XMLHttpRequest();
    var uploadByForm = typeof(params) === 'string';

    // if upload by form name,
    // all params must be input's value.
    var data = uploadByForm ?
      new FormData(document.forms.namedItem(params)) :
      new FormData();

    var policy = base64.encode(JSON.stringify(self.configs));
    var apiendpoint = self.endpoint || 'http://v0.api.upyun.com/' + self.configs.bucket;

    // by default, if not upload files by form,
    // file object will be parse as `params`
    if (!uploadByForm) data.append('file', file);
    data.append('policy', policy);
    data.append('signature', md5.createHash(policy + '&' + self.form_api_secret));

    // open request
    req.open('POST', apiendpoint, true);

    // Error event
    req.addEventListener('error', function(err) {
      return callback(err);
    }, false);

    // when server response
    req.addEventListener('load', function(result) {
      var statusCode = result.target.status;
      // trying to parse JSON
      if (statusCode !== 200)
        return callback(new Error(result.target.status), result.target);
      try {
        return callback(null, result.target, JSON.parse(this.responseText));
      } catch (err) {
        return callback(err);
      }
    }, false);

    // the upload progress monitor
    req.upload.addEventListener('progress', function(pe) {
      if (!pe.lengthComputable) return;
      if (!self.events.uploading || typeof(self.events.uploading) !== 'function')
        return;
      self.events.uploading(Math.round(pe.loaded / pe.total * 100));
    });

    // send data to server 
    req.send(data);

  }

})(window, window.angular);
