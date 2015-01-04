;(function(window, angular, NProgress) {
  'use strict';

  var NProgressExist = NProgress && NProgress.start && NProgress.done;
  var toplevelList = ['signature', 'policy', 'form_api_secret', 'endpoint', 'host'];

  // Inject as a Angular module
  if (angular) {
    angular
      .module('upyun', [])
      .constant('UPYUN_CONFIGS', initDefaultConfigs())
      .provider('upyun', ['UPYUN_CONFIGS', UpyunProvider]);
  } else {
    // Inject to window object
    window.upyun = new Upyun();
  }

  function Upyun(self) {
    this.events = {};
    this.configs = (self && self.configs) ? 
      self.configs : 
      initDefaultConfigs();
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
    if (!window.JSON) 
      throw new Error('JSON is required.');
    if (!window.FormData) 
      throw new Error('FormData is required.');
    if (!window.XMLHttpRequest) 
      throw new Error('XMLHttpRequest is required.');
    if (!callback || typeof(callback) !== 'function') 
      throw new Error('Callback function is required.');

    var self = this;
    var req = new XMLHttpRequest();
    var uploadByForm = typeof(params) === 'string';

    // If upload by form name,
    // All params must be input's value.
    var data = uploadByForm ?
      new FormData(document.forms.namedItem(params)) :
      new FormData();

    if (!self.configs.policy && !window.Base64)
      throw new Error('lib Base64 is required');
    if (!self.configs.signature && !window.md5)
      throw new Error('lib Md5 is required');

    var policy = self.configs.policy || window.Base64.encode(JSON.stringify(self.configs.params));
    var apiendpoint = self.configs.endpoint || 'http://v0.api.upyun.com/' + self.configs.params.bucket;
    var imageHost = self.configs.host || 'http://' + self.configs.params.bucket + '.b0.upaiyun.com';

    // By default, if not upload files by form,
    // File object will be parse as `params`
    if (!uploadByForm) 
      data.append('file', params);

    // Append `policy` and create `signature`
    data.append('policy', policy);
    data.append('signature', self.configs.signature || window.md5(policy + '&' + self.configs.form_api_secret));

    // Open a request
    req.open('POST', apiendpoint, true);

    // Error event
    req.addEventListener('error', function(err) {
      return callback(err);
    }, false);

    // When server response
    req.addEventListener('load', function(result) {
      if (NProgressExist) NProgress.done();
      var statusCode = result.target.status;

      // Try to parse JSON
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

    // Upload progress monitor
    req.upload.addEventListener('progress', function(pe) {
      if (!pe.lengthComputable) return;
      if (!self.events.uploading || typeof(self.events.uploading) !== 'function')
        return;
      self.events.uploading(Math.round(pe.loaded / pe.total * 100));
    });

    // Send data to server 
    req.send(data);

    // UI trigger
    if (NProgressExist) 
      NProgress.start();
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

    this.$get = [function(){
      return new Upyun(self);
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
