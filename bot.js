var botkit = require('botkit');
var fs = require('fs');
var path = require('path');

controller = botkit.slackbot({
  debug: false
});

controller.spawn({
  token: process.env.token
}).startRTM();

var load = function (p, file) {
  var ext = path.extname(file);
  var full = path.join(p, path.basename(file, ext));

  try {
    var script = require(full);
    if (typeof script === 'function') {
      script(this);
    }
  } catch(error) {
    console.log(error);
    process.exit(1);
  }
};

var paths = path.resolve('.', 'scripts')

fs.readdirSync(paths).sort().forEach(function(file) {
  load(paths, file);
});