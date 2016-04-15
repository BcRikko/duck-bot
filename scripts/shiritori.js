var database = require('../module/db.js'),
    db = database.init('./db/shiritori.db');

var init = (function() {
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
})();

var learnWord = function (word) {
    db.serialize(function() {
        db.run('insert or ignore into shiritori (word, first) values (?, ?)', [word, word.substr(0, 1)]);
    });
};

var getReplyWords = function (word) { 
    return new Promise(function (resolve, reject) {
        var words = [];
        db.serialize(function () {
            db.all('select word, first from shiritori where first = $first', { $first: word.slice(-1) }, function (err, rows) {
                if (err) {
                    reject(err);
                }
                
                rows.forEach(function (row) {
                    words.push(row.word);
                });
                resolve(words);
            });
        });
    });
};

controller.hears('(.*)', ['ambient'], function(bot, msg) {
    switch (msg.text.slice(-1)) {
        case 'ん':
            bot.reply(msg, 'やったーかったー :laughing:');
            return;
        case 'ー':
            bot.reply(msg, 'それまだ対応してない :face_with_rolling_eyes:');
            return;
    }
    
    learnWord(msg.text);
    getReplyWords(msg.text).then(function (results) {
        if (0 < results.length) {
            var index = Math.floor(Math.random() * results.length);
            var word = results[index];
            
            bot.reply(msg, word);
        }
        else {
            bot.reply(msg, 'わかんない。おしえて :cry:');
        }
    });
});

controller.hears('おしえて', ['direct_mention', 'mention'], function(bot, msg) {
    db.serialize(function() {
        var words = [];
        db.all('select * from shiritori', function(err, rows) {
            if (err) {
                console.log(err);
                return;
            }
            rows.forEach(function (row) {
                words.push(row.word);
            });
            
            bot.reply(msg, words.join(','));
        });
    });
});