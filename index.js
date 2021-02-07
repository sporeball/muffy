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
    if (args.length == 0) {
      _msg.channel.send(`your whitelist is ${(conf.get(whitelist) === undefined || conf.get(whitelist).length == 0) ? "empty!" : conf.get(whitelist).map(x => `<#${x}>`).join(", ")}`);
    } else {
      if (args[0] == "reset") {
        conf.set(whitelist, []);
        _msg.channel.send("reset your whitelist!");
      } else {
        conf.set(whitelist, _msg.mentions.channels.array().map(x => x.id));
        _msg.channel.send(`updated your whitelist!`);
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

client.login(process.env.TOKEN);
