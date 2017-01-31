const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const parse = require("irc-message").parse;
const EventEmitter = require("events");

const rwspace = new RegExp('\\s');

class Bot {
  constructor(config) {
    const netSocket = new NetSocket();
    const opt = {
      socket: netSocket,
      port: 6667
    };
    Object.assign(opt, config);

    this.ircSocket = IrcSocket(opt);
    this.channels = config.channels;
    this.config = config;
    this.channel_callbacks = [];
    this.private_callbacks = [];
    this.ctcp_callbacks = [];
    this.isupport = {};
    this.prefix = {};
    this.names_buffer = {};
    this.whois_account = {};
    this.names_emitter = new EventEmitter();
    this.account_emitter = new EventEmitter();
  }
  
  connect() {
    this.ircSocket.connect();
    this.ircSocket.once('ready', () => {
      console.log('BOT: Connected to,', this.config.server);
      this.join(this.channels);
      console.log('BOT: Joined channels,', this.channels);
    })
    this._register_callbacks();
  }

  _register_callbacks() {
    this.ircSocket.on('data', (raw) => {
      let message = new Message(raw);
      if (message.is_privmsg()) {
        if (message.ctcp) {
            this._handle_ctcp_message(message);
        } else if (message.params[0][0] === '#') {
            this._handle_channel_message(message);
        } else {
            this._handle_private_message(message);
        }
      } else if (message.command === '005') { // RPL_ISUPORT
        this._save_isupport(message);
      } else if (message.command === '353') { // RPL_NAMREPLY
        this._handle_names_reply(message);
      } else if (message.command === '366') { // RPL_ENDOFNAMES
        this._handle_end_of_names(message);
      } else if (message.command === '330') { // RPL_WHOISACCOUNT http://defs.ircdocs.horse/defs/numerics.html#rpl-whoisaccount-330
        this._handle_whois_account(message);        
      } else if (message.command === '318') { // RPL_ENDOFWHOIS
        this._handle_end_of_whois(message);
      }
    });
  }
  
  _handle_whois_account(message) {
    const nick = message.params[1];
    const authname = message.params[2];
    this.whois_account[nick] = authname;
  }
  
  _handle_end_of_whois(message) {
    const nick = message.params[1];
    this.account_emitter.emit(nick, this.whois_account[nick]);
    this.whois_account[nick] = null;
  }
  
  _handle_names_reply(message) {
    const raw_names = message.params[message.params.length - 1].split(' ');
    const channel = message.params[message.params.length - 2];
    let names = {};
    
    // strip prefix
    for (let i = 0; i < raw_names.length; i++) {
      names[this._strip_prefix(raw_names[i])] = raw_names[i];
    }

    const prev_names = this.names_buffer[channel] || {};
    Object.assign(prev_names, names);
    this.names_buffer[channel] = prev_names;
  }
  
  _strip_prefix(name) {
    let idx = 0;
    while (this.prefix[name[idx]] && idx < name.length) {
      idx++;
    }
    if (idx < name.length) {
      return name.slice(idx);
    } else {
      return null;
    }
  }

  _handle_end_of_names(message) {
    const channel = message.params[1];
    let names = {};
    Object.assign(names, this.names_buffer[channel]);
    this.names_emitter.emit(channel, names);
    this.names_buffer[channel] = {};
  }
  
  _save_isupport(message) {
    // i = 0 (nick)
    // i = length-1 (:are supported by this server)
    let match;
    for (let i = 1; i < (message.params.length - 1); i++) {
      let param = message.params[i];
      if (/^[a-zA-Z0-9]+$/.test(param)) {
        this.isupport[param] = true;
      } else if (match = /^([a-zA-Z0-9]+)=(.*)$/.exec(param)) {
        let key = match[1];
        let val = match[2];
        this.isupport[key] = val;
        if (key === 'PREFIX') {
          this._save_prefix(val);
        }
      }
    }
  }
  
  _save_prefix(val) {
    let match = /\((.+)\)(.+)/.exec(val);
    if (match) {
      let modes = match[1];
      let prefixes = match[2];
      for (let i = 0; i < Math.min(modes.length, prefixes.length); i++) {
        this.prefix[prefixes[i]] = modes[i];
      }
    }
  }
  
  _handle_ctcp_message(message) {
    let user = message.source.nick;
    let target = new Target(this, user, message);
    
    for (let i = 0; i < this.ctcp_callbacks.length; i++) {
      let re = this.ctcp_callbacks[i].re;
      let callback = this.ctcp_callbacks[i].callback;
      for (let j = 0; j < re.length; j++) {
        if (message.ctcp.command.toUpperCase() === re[j]) {
          callback.call(undefined, target);
          break; // break this callback, try next callback.
        }
      }
    }
  }
  
  _handle_channel_message(message) {
    let channel = message.params[0];
    let target = new Target(this, channel, message);
    
    for (let i = 0; i < this.channel_callbacks.length; i++) {
      let re = this.channel_callbacks[i].re;
      let callback = this.channel_callbacks[i].callback;
      for (let j = 0; j < re.length; j++) {
        let match = re[j].exec(message.content);
        if (match) {
          let args = Array.prototype.slice.call(match);
          args[0] = target;
          callback.apply(undefined, args);
          break;
        }
      }
    }
  }
  
  _handle_private_message(message) {
    let user = message.source.nick;
    let target = new Target(this, user, message);

    for (let i = 0; i < this.private_callbacks.length; i++) {
      let re = this.private_callbacks[i].re;
      let callback = this.private_callbacks[i].callback;
      for (let j = 0; j < re.length; j++) {
        let match = re[j].exec(message.content);
        if (match) {
          let args = Array.prototype.slice.call(match);
          args[0] = target;
          callback.apply(undefined, args);
          break;
        }
      }
    }
  }

  privmsg(target, message) {
    this._send('PRIVMSG', target, message);
  }
  
  notice(target, message) {
    this._send('NOTICE', target, message);
  }
  
  nctcp(target, message) {
    this._send('NOTICE', target, `\u{1}${message}\u{1}`);
  }
  
  join(args) {
    if (!Array.isArray(args)) {
      args = [args];
    }
  
    this._send.call(this, 'JOIN', args.join(','));
  }
  
  quit(reason) {
    if (reason) {
      this._send('QUIT', reason);
    } else {
      this._send('QUIT');
    }
  }
  
  names(channel, callback) {
    this._send('NAMES', channel);
    this.names_emitter.once(channel, callback);
  }
  
  whois(nick, callback) {
    this._send('WHOIS', nick);
    this.account_emitter.once(nick, callback);
  }
  
  respond(type, re, callback) {
    if (!Array.isArray(re)) {
      re = [re];
    }

    switch (type) {
      case "channel":
        this.channel_callbacks.push({ re: re, callback: callback });
        break;
      case "private":
        this.private_callbacks.push({ re: re, callback: callback });
        break;
      case "ctcp":
        this.ctcp_callbacks.push({ re: re, callback: callback });
        break;
    }
  }
  
 
  _send() {
    let args = Array.prototype.slice.call(arguments);
    if (this._is_malformed(args)) {
      console.log('BOT: MALFORMED MESSAGE, ', args);
      return;
    }
    if ((args.length > 1) && rwspace.test(args[args.length - 1])) {
      args[args.length - 1] = ':' + args[args.length - 1];
    }
    this.ircSocket.raw(args);
  }
  
  _is_malformed(args) {
    if (args.length === 0) {
      return true;
    }

    if ((args.length === 1) && rwspace.test(args[0])) {
      return true;
    }

    for (var i = 0; i < (args.length - 1); i++) {
      if (rwspace.test(args[i])) {
        return true;
      }
    }
    return false;
  }
}

class Target {
  constructor(bot, name, message) {
    this.bot = bot;
    this.name = name;
    this.message = message;
  }

  privmsg(message) {
    this.bot.privmsg(this.name, message);
  }

  notice(message) {
    this.bot.notice(this.name, message);
  }
  
  nctcp(message) {
    this.bot.nctcp(this.name, message);
  }
  
  names(callback) {
    this.bot.names(this.name, callback);
  }
}

class Message {
  constructor(raw) {
    let msg = parse(raw);
    Object.assign(this, msg);
    this.command = this.command.toUpperCase();

    this.parse_prefix();

    if (this.is_conversation()) {
      this.content = this.params[1];
      this.parse_ctcp();
    }
  }

  is_conversation() {
    return this.command === "PRIVMSG" || this.command === "NOTICE";
  }

  is_privmsg() {
    return this.command === "PRIVMSG";
  }

  parse_prefix() {
    this.source = {};
    let match = /^([^\s!]+)((!([^\s@]+))?@(\S+))?/.exec(this.prefix);
    if (match) {
      this.source = { nick: match[1], username: match[4], host: match[5] };
    }
  }

  parse_ctcp() {
    let match = /^\x01(([\w-]+)( +([^\x01]+))?)\x01?$/.exec(this.content);
    if (match) {
      this.ctcp = { command: match[2], params: match[4], raw: match[1] };
    }
  }
}

module.exports = Bot;
