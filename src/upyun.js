;(function(window, angular, NProgress) {
  'use strict';
  var NProgressExist = NProgress && NProgress.start && NProgress.done;
  var toplevelList = ['signature', 'form_api_secret', 'endpoint', 'host'];

  // Inject as a angular module
  if (angular) {
    angular
      .module('upyun', ['base64','angular-md5'])
      .constant('UPYUN_CONFIGS', initDefaultConfigs())
      .provider('upyun', ['UPYUN_CONFIGS', UpyunProvider]);
  } else {
    // Inject to window object
    window.upyun = new Upyun(window.Base64, window.md5);
  }

  function Upyun(base64, md5, self) {
    var isAngularModule = self && self.configs;
    this.base64 = base64;
    this.md5 = md5;
    this.events = {};
    this.configs = isAngularModule ? self.configs : initDefaultConfigs();
  }

  Upyun.prototype.set = function(k, v) {
    if (k && v) {
      if (toplevelList.indexOf(k) > -1)
        this.configs[k] = v;
      else
        this.configs.params[k] = v;
    }
    return this;
  };

  Upyun.prototype.on = function(event, callback) {
    if (event && callback)
      this.events[event] = callback;
    return this;
  };

  Upyun.prototype.upload = function(params, callback) {
    // Check dependencies when `upload` method are trigged.
    if (!this.base64) 
      throw new Error('base64 required.');
    if (!this.md5) 
      throw new Error('md5 required.');
    if (!window.JSON) 
      throw new Error('JSON required.');
    if (!window.FormData) 
      throw new Error('FormData required.');
    if (!window.XMLHttpRequest) 
      throw new Error('XMLHttpRequest required.');
    if (!callback || typeof(callback) !== 'function') 
      throw new Error('callback function required.');

    var self = this;
    var req = new XMLHttpRequest();
    var uploadByForm = typeof(params) === 'string';
    var md5hash = self.md5.createHash || self.md5;

    // if upload by form name,
    // all params must be input's value.
    var data = uploadByForm ?
      new FormData(document.forms.namedItem(params)) :
      new FormData();

    var policy = self.configs.policy || self.base64.encode(JSON.stringify(self.configs.params));
    var apiendpoint = self.configs.endpoint || 'http://v0.api.upyun.com/' + self.configs.params.bucket;
    var imageHost = self.configs.host || 'http://' + self.configs.params.bucket + '.b0.upaiyun.com';

    // by default, if not upload files by form,
    // file object will be parse as `params`
    if (!uploadByForm) data.append('file', params);
    data.append('policy', policy);
    data.append('signature', self.configs.signature || md5hash(policy + '&' + self.configs.form_api_secret));

    // open request
    req.open('POST', apiendpoint, true);

    // Error event
    req.addEventListener('error', function(err) {
      return callback(err);
    }, false);

    // when server response
    req.addEventListener('load', function(result) {
      if (NProgressExist) NProgress.done();
      var statusCode = result.target.status;
      // trying to parse JSON
      if (statusCode !== 200)
        return callback(new Error(result.target.status), result.target);
      try {
        var image = JSON.parse(this.responseText);
        image.absUrl = imageHost + image.url;
        image.absUri = image.absUrl;
        return callback(null, result.target, image);
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

    // ui trigger
    if (NProgressExist) NProgress.start();
  };

  function UpyunProvider(defautConfigs) {
    var self = this;
    this.configs = defautConfigs;
    this.config = function(configs) {
      if (!configs || !angular.isObject(configs))
        return;
      angular.forEach(configs, function(v, k) {
        if (toplevelList.indexOf(k) > -1) 
          self.configs[k] = v;
        else
          self.configs.params[k] = v;
      });
      return this.configs;
    };
    this.$get = ['$base64', 'md5', function(base64, md5){
      return new Upyun(base64, md5, self);
    }];
  }

  function initDefaultConfigs() {
    return {
      form_api_secret: '',
      params: {
        expiration: (new Date().getTime()) + 60,
        'save-key': '/{year}/{mon}/{day}/upload_{filemd5}{.suffix}',
        'allow-file-type': 'jpg,jpeg,gif,png'
      }
    };
  }

})(window, window.angular, window.NProgress);
