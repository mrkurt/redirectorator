var assert = require('assert'),
    redirector = require('./redirectorator'),
    util = require('util'),
    callbacksFired = 0;

logs = [];
redirector.logger = function(msg){ logs.push(msg); }; //don't want to munge up the console

assert.equal('test.com', redirector.extractTxtHost('v=redirect test.com'));
assert.equal(undefined, redirector.extractTxtHost('gibberish'));
assert.equal(undefined, redirector.extractTxtHost('gibberish test.com'));

redirector.resolveRedirect('mubble.com', function(host){
  callbacksFired ++;
  assert.equal('www.credibl.es', host);
});


process.addListener('exit', function(){
  assert.equal(callbacksFired, 2);
  console.log("Logged: ");
  console.log(util.inspect(logs));
});

var mockResponse = function(){};
mockResponse.prototype = {
  writeHead : function(s, headers){
    this.status = s;
    this.headers = headers;
  },
  end : function(data){
    this.data = data;
  },
};

redirector.doRedirect("test.com", "/this/is/a/path?asdf", new mockResponse, function(res){
  callbacksFired ++;
  assert.equal(301, res.status);
  assert.ok(res.headers.Location);
  assert.ok(res.data);
});

