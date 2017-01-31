const Bot = require('./bot');
const env = require('./env');
const pdb = require('./db');
const time = require('./time');
const request = require('request');

const tracked_channels = env.TRACKED.split(' ');

const sub = new RegExp('^s\/([^/]+)\/([^/]*)\/(g|i|gi|ig)? *$');

function escape_re(str) {
  return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"); // http://stackoverflow.com/a/2593661
}

let facts, stars, last_message, db;
pdb.then(function({ db: db_db, facts: db_facts, stars: db_stars, last_message: db_last_message }) {
  facts = db_facts;
  stars = db_stars;
  last_message = db_last_message;
  db = db_db;
});

const config = {
  server: env.SERVER,
  nicknames: alt(env.NICK),
  username: env.USERNAME,
  realname: env.REALNAME,
  password: env.PASSWORD,
  channels: env.CHANNELS.split(' ')
};

const botan = new Bot(config);

botan.respond('channel', /^\.(help|bantuan)$/, function(channel) {
  channel.privmsg('Bantuan ada di: https://botan.gomix.me/');
});

botan.respond('channel', /^\.ingat +([\w-]+) *= *(\S.+)$/, function(channel, name, content) {
  const fact = facts.findOne({ name: name });
  if (fact) {
    fact.content = content;
    facts.update(fact);
  } else {
    facts.insert({ name: name, content: content });
  }
  db.saveDatabase();
  channel.privmsg(`'${name}' diingat`);
});

botan.respond('channel', /^\.lupakan +([\w-]+)$/, function(channel, name) {
  const fact = facts.findOne({ name: name });
  if (fact) {
    facts.remove(fact);
    db.saveDatabase();
    channel.privmsg(`'${name}' dilupakan`);
  }
});

botan.respond('channel', /^!([\w-]+)( +@ *(\S+))?/, function(channel, name, opt, nick) {
  const fact = facts.findOne({ name: name });
  if (fact) {
    if (opt) {
      channel.privmsg(`${nick}: ${fact.content}`);
    } else {
      channel.privmsg(fact.content);
    }
  }
});

botan.respond('channel', [ /^\.bintang +(\S+)/, /^([^\s+]+)\+\+( +|$)/ ], function(channel, nick) {
  let sender = channel.message.source.nick;
  channel.names(function(names) {
    if (names[nick] && (nick !== sender)) {
      const star = stars.findOne({ nick: nick });
      let number;
      if (star) {
        star.number += 1;
        number = star.number;
        stars.update(star);
      } else {
        stars.insert({ nick: nick, number: 1 });
        number = 1;
      }
      db.saveDatabase();
      channel.privmsg(`+1 ${nick}, total = ${'★'.repeat(number)}`);
    } else if (nick === sender) {
      channel.privmsg(`${sender}: narsis?`);
    } else {
      channel.privmsg(`siapa ${nick}?`);
    }
  });
});

botan.respond('channel', /^\.kelih?atan +(\S+)/, function(channel, nick) {
  const current = last_message.findOne({ nick: nick });
  let sender = channel.message.source.nick;
  if (nick === sender) {
    channel.privmsg(`${nick}: coba cek di cermin`)
  } else if (current) {
    channel.privmsg(`kelihatan: [${time.format(current.time)}] <${nick}> ${current.message}`);
  } else {
    channel.privmsg('gak kelihatan');
  }
});

botan.respond('channel', /^\.ping/, function(channel) {
  const sender = channel.message.source.nick;
  channel.privmsg(`${sender}: pong`);
});

botan.respond('channel', [ /youtu\.be\/([\w-]+)/, /youtube\.com\/watch\?v=([\w-]+)/ ], function(channel, id) {
  const yt = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${env.APIKEY}`;
  request(yt, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      try {
        const result = JSON.parse(body);
        const title = result.items[0].snippet.title;
        channel.privmsg(`Video http://youtu.be/${id}, Judul: ${title}`);
      } catch (err) {
        console.log(err);
      }
    }
  });
});

botan.respond('channel', sub, function(channel, pat, subt, opt) {
  const pattern = escape_re(pat || '');
  const replacement = subt || '';
  const flags = opt || '';
  
  const regex = new RegExp(pattern, flags);
  const nick = channel.message.source.nick;

  const current = last_message.findOne({ nick: nick });
  if (current) {
    const result = current.message.replace(regex, replacement);
    channel.privmsg(`${nick} bermaksud mengatakan: ${result}`);
  }
});

botan.respond('channel', /^(.*)$/, function(channel, message) {
  if ((tracked_channels.indexOf(channel.name) >= 0) && !sub.test(message)) {
    const time = Date.now();
    const nick = channel.message.source.nick;
    const current = last_message.findOne({ nick: nick });
    if (current) {
      current.time = time;
      current.message = message;
      last_message.update(current);
    } else {
      last_message.insert({ nick: nick, time: time, message: message });
    }
    db.saveDatabase();
  }
});

botan.respond('private', /^\.raw +(.+)$/, function(user, raw) {
  const sender = user.name;
  botan.whois(sender, function(authname) {
    if (authname === env.ADMIN) {
      console.log('BOTAN: admin,', sender, ', executing,', raw)
      botan.ircSocket.raw(raw);
    }
  });
});

botan.respond('private', /^\.quit( +(.+))?$/, function(user, opt, reason) {
  const sender = user.name
  botan.whois(sender, function(authname) {
    if (authname === env.ADMIN) {
      console.log('BOTAN: admin,', sender, ', executing quit');
      const quit_message = opt ? reason : `perintah ${sender}`;
      botan.quit(quit_message);
    }
  });
});

function alt(nick) {
  return [`${nick}`, `${nick}_`, `${nick}__`];
}


function start() {
  if (env.ON) {
    botan.connect();
  }
}

exports.start = start;