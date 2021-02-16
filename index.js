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

const commands = {
  "ping": (args, _msg) => {
    _msg.channel.send("pong!")
  },
  "whitelist": (args, _msg) => {
    let whitelist = `users.${_msg.author.id}.${_msg.guild.id}.whitelist`;
    // "@Muffy whitelist"
    if (args.length == 0) {
      _msg.channel.send(`your whitelist is ${(conf.get(whitelist) === undefined || conf.get(whitelist).length == 0) ? "empty!" : conf.get(whitelist).map(x => `<#${x}>`).join(", ")}`);
    } else {
      // "@Muffy whitelist reset"
      if (args[0] == "reset") {
        conf.set(whitelist, []);
        _msg.channel.send("reset your whitelist!");
      // "@Muffy whitelist [#channel]"
      } else if (args[0].match(/^<#\d+>$/)) {
        // assert every argument is a channel
        if (args.every(x => x.match(/^<#\d+>$/))) {
          conf.set(whitelist, _msg.mentions.channels.array().map(x => x.id));
          _msg.channel.send(`updated your whitelist!`);
        } else {
          raise(_msg, "i can't do that! (make sure you only reference channels!)");
        }
      // "@Muffy whitelist [@user]"
      } else if (args[0].match(/^<@!?\d+>$/)) {
        let w = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.whitelist`;
        _msg.channel.send(`this user's whitelist is ${(conf.get(w) === undefined || conf.get(w).length == 0) ? "empty!" : conf.get(w).map(x => `<#${x}>`).join(", ")}`);
      // anything else
      } else {
        raise(_msg, "that isn't a valid argument!");
      }
    }
  }
};

// emitted when muffy is ready to start
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// emitted on message
client.on('message', msg => {
  console.log(msg.content);
  if (msg.mentions.members.first() && msg.mentions.members.first().user.tag == TAG) {
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
