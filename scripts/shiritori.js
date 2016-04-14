var database = require('../module/db.js'),
  db = database.init('shiritori.db');

var dbInit = function() {
  db.serialize(function() {
    var exists = false;

    var create = new Promise(function(resolve, reject) {
      db.get('select count(*) from sqlite_master where type="table" and name="shiritori"', function(err, res) {
        if (0 < res['count(*)']) { exists = true }
        resolve();
      });
    });

    create.then(function() {
      if (!exists) {
        db.run('create table shiritori (word text unique, first text)');
      }
    });
  });
};

// initialize database
dbInit();

controller.hears('おしえて', ['direct_mention', 'mention'], function(bot, msg) {
  db.serialize(function() {
    db.each('select * from shiritori', function(err, res) {
      bot.reply(msg, res.word);
    });
  });
});

controller.hears('(.*)', ['ambient'], function(bot, msg) {
  var word = msg.text;
  db.serialize(function() {
    db.run('insert or ignore into shiritori (word, first) values (?, ?)', [word, word.substr(0, 1)]);

    bot.reply(msg, word);
  });
});
