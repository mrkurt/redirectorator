var http = require('http'),
    dns = require('dns');

exports.logger = console.log;
exports.server = http.createServer(function(req, res){
  var host = req.headers.host;
  if(host && host != 'www.redirectorator.com'){
    module.exports.doRedirect(host, url, res);
  }else{
    res.writeHead(400, {'Content-Type' : 'text/plain'});
    res.end('Error: this service can only handle requests with a host header');
    console.log('Sending error, no host');
  }
});

exports.doRedirect = function(host, url, res, cb){
  module.exports.resolveRedirect(host, function(newHost){
    if(!newHost){
      newHost = host.indexOf('www.') == 0 ? host.substring(4) : 'www.' + host;
    }
    url = 'http://' + newHost + url;
    res.writeHead(301, {'Location' : url, 'Content-Type' : 'text/plain'});
    res.end('Redirecting to ' + url + '\n');
    module.exports.logger('Redirecting ' + host + ' to ' + url);

    if(cb){
      cb(res);
    }
  });
};

exports.resolveRedirect = function(host, cb){
  dns.resolveTxt(host, function(err, addresses){
    var resolved, i;
    for(i = 0; i < addresses.length; i++){
      resolved = module.exports.extractTxtHost(addresses[i]);
      if(resolved){
        break;
      }
    }

    cb(resolved);
  });
};

exports.extractTxtHost = function(raw){
  var parts = raw.split(' ', 2);
  if(parts[0] == 'v=redirect'){
    return parts[1];
  }
};
