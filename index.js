/*
  index.js
  muffy entry point
  copyright (c) 2021 sporeball
  MIT license
*/

// dependencies
require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const TAG = "Muffy#8727";

const Conf = require("conf");
const conf = new Conf({
  configName: "db",
  cwd: "."
});

const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const commands = {
  "ping": (args, _msg) => {
    _msg.channel.send("pong!")
  },
  "time": (args, _msg) => {
    let date = dayjs.utc();
    _msg.channel.send(`it is ${date.format("h:mma")} on ${date.format("MMMM D, YYYY")} right now (UTC time)`);
  },
  "whitelist": (args, _msg) => {
    let whitelist = `users.${_msg.author.id}.${_msg.guild.id}.whitelist`;
    // @Muffy whitelist
    if (args.length == 0) {
      _msg.channel.send(`your whitelist is ${(conf.get(whitelist) === undefined || conf.get(whitelist).length == 0) ? "empty!" : conf.get(whitelist).map(x => `<#${x}>`).join(", ")}`);
    } else {
      // @Muffy whitelist reset
      if (args[0] == "reset") {
        conf.set(whitelist, []);
        _msg.channel.send("reset your whitelist!");
      // @Muffy whitelist [#channel]
      } else if (args[0].match(/^<#\d+>$/)) {
        // assert every argument is a channel
        if (args.every(x => x.match(/^<#\d+>$/))) {
          conf.set(whitelist, _msg.mentions.channels.array().map(x => x.id));
          _msg.channel.send(`updated your whitelist!`);
        } else {
          raise(_msg, "i can't do that! (make sure you only reference channels!)");
        }
      // @Muffy whitelist [@user]
      } else if (args[0].match(/^<@!?\d+>$/)) {
        let w = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.whitelist`;
        _msg.channel.send(`this user's whitelist is ${(conf.get(w) === undefined || conf.get(w).length == 0) ? "empty!" : conf.get(w).map(x => `<#${x}>`).join(", ")}`);
      // anything else
      } else {
        raise(_msg, "that isn't a valid argument!");
      }
    }
  },
  "offset": (args, _msg) => {
    let offset = `users.${_msg.author.id}.offset`;
    // @Muffy offset
    if (args.length == 0) {
      _msg.channel.send(`${conf.get(offset) === undefined ? "you haven't set your offset!" : `your offset is UTC${conf.get(offset)}`}`);
    // @Muffy offset [valid offset]
    } else if (args[0].match(offsets)) {
      conf.set(offset, args[0]);
      _msg.channel.send("set your UTC offset!");
    // anything else
    } else {
      raise(_msg, "that isn't a valid UTC offset!");
    }
  }
};

const offsets = /^(-?[39]|[456]|10):30$|^([58]|12):45$|^-?([2-9]|1[0-2]?)$|^13$|^14$|^0$/;

// emitted when muffy is ready to start
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// emitted on message
client.on('message', msg => {
  console.log(msg.content);
  if (msg.guild && msg.mentions.members.first() && msg.mentions.members.first().user.tag == TAG) {
    call(msg);
  }
});

call = _msg => {
  // remove the mention part
  // uses split to get around potential problems with !
  let m = _msg.content.split(" ").filter((x, i) => i != 0);
  let cmd = m[0];
  let args = m.filter((x, i) => i != 0);

  if (Object.keys(commands).includes(cmd)) {
    commands[cmd](args, _msg);
  }
}

raise = (_msg, err) => {
  _msg.channel.send(err);
}

client.login(process.env.TOKEN);
