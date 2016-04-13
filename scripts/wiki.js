var request = require('superagent');
var WIKIPEDIA_URL = 'https://ja.wikipedia.org/wiki/';

controller.hears('(.*)を[教えて|おしえて]|wiki (.*)', ['direct_message','direct_mention','mention'], function(bot, msg) {
  var word = msg.match[1] || msg.match[2];
  
  request
    .get('https://ja.wikipedia.org/w/api.php')
    .query({
      format : 'json',
      action : 'query',
      prop   : 'extracts',
      exintro: '',
      explaintext: '',
      titles : word
    })
    .end(function (err, res) {
      var query = res.body.query;
      if (query && query.pages) {
        for (var p in query.pages) {
          var content = query.pages[p].extract;
          if (content) {
            content = '> ' + content.replace(/\n/g, '\n> ');
          }
          else {
            content = 'ｸﾜｯ...';
          }
          bot.reply(msg, [
              content,
              WIKIPEDIA_URL + word
          ].join('\r\n'));
          return;
        }
      }
    });
});