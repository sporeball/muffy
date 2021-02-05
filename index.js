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

const commands = {
  "ping": _msg => {
    _msg.channel.send("pong!")
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
  let cmd = _msg.content.split(" ").filter((x, i) => i != 0).join(" ");
  if (Object.keys(commands).includes(cmd)) {
    commands[cmd](_msg);
  }
}

client.login(process.env.TOKEN);
