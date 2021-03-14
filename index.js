/*
  index.js
  muffy entry point
  copyright (c) 2021 sporeball
  MIT license
*/

// dependencies
require("dotenv").config();

// Discord.js
const Discord = require("discord.js");
const client = new Discord.Client();

// database
const Conf = require("conf");
const conf = new Conf({
  configName: "db",
  cwd: "."
});

// dayjs
const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
var isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

// regex helpers
const offsets = /^(-?[39]|[456]|10):30$|^([58]|12):45$|^-?([2-9]|1[0-2]?)$|^13$|^14$|^0$/;

const H = "([2-9]|1[0-2]?)";
const MM = "(:[0-5][0-9])";
const a = "(am|pm)";
const times = `${H}${MM}${a}`;
const ranges = new RegExp(`${times}-${times}`, "gm");

// log symbols
const symbols = require("log-symbols");

const commands = {
  "ping": (args, _msg) => {
    _msg.channel.send("pong!")
  },

  "time": (args, _msg) => {
    let date = dayjs.utc();
    // @Muffy time
    if (args.length == 0) {
      let offset = +(conf.get(`users.${_msg.author.id}.offset`).replace(":30", ".5").replace(":45", ".75")) * 60;
      // TODO: handle empty offset
      _msg.channel.send(`it is ${date.utcOffset(offset).format("h:mma")} on ${date.format("MMMM D, YYYY")} for you right now`);
    // TODO: other cases
    } else {
    }
  },

  "whitelist": (args, _msg) => {
    let whitelist = `users.${_msg.author.id}.${_msg.guild.id}.whitelist`;
    // @Muffy whitelist
    if (args.length == 0) {
      _msg.channel.send(`your whitelist is ${exists(whitelist) ? conf.get(whitelist).map(x => `<#${x}>`).join(", ") : "empty!"}`);
    // @Muffy whitelist reset
    } else if (args[0] == "reset") {
      set(whitelist, [], _msg);
    // @Muffy whitelist [#channel]
    } else if (args[0].match(/^<#\d+>$/)) {
      // assert every argument is a channel
      if (args.every(x => x.match(/^<#\d+>$/))) {
        set(whitelist, _msg.mentions.channels.array().map(x => x.id), _msg);
      } else {
        raise(_msg, "i can't do that! (make sure you only reference channels!)");
      }
    // @Muffy whitelist [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let w = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.whitelist`;
      _msg.channel.send(`this user's whitelist is ${exists(w) ? conf.get(w).map(x => `<#${x}>`).join(", ") : "empty!"}`);
    // anything else
    } else {
      raise(_msg, "that isn't a valid argument!");
    }
  },

  "offset": (args, _msg) => {
    let offset = `users.${_msg.author.id}.offset`;
    // @Muffy offset
    if (args.length == 0) {
      _msg.channel.send(`${exists(offset) ? `your offset is UTC${conf.get(offset)}` : "you haven't set your offset!"}`);
    // @Muffy offset reset
    } else if (args[0] == "reset") {
      set(offset, "", _msg);
    // @Muffy offset [valid offset]
    } else if (args[0].match(offsets)) {
      set(offset, args[0], _msg);
    // @Muffy offset [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let o = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.offset`;
      _msg.channel.send(`${exists(o) ? `this user's offset is ${conf.get(o)}` : `this user hasn't set their offset!`}`);
    // anything else
    } else {
      raise(_msg, "that isn't a valid UTC offset!");
    }
  },

  "range": (args, _msg) => {
    let range = `users.${_msg.author.id}.${_msg.guild.id}.range`;
    // @Muffy range
    if (args.length == 0) {
      _msg.channel.send(`${exists(range) ? `your time range is ${conf.get(range)}` : "you haven't set your time range!"}`);
    // @Muffy range reset
    } else if (args[0] == "reset") {
      set(range, "", _msg);
    // @Muffy range [valid range]
    } else if (args[0].match(ranges)) {
      set(range, args[0], _msg);
    // @Muffy range [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let r = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.range`;
      _msg.channel.send(`${exists(r) ? `this user's time range is ${conf.get(r)}` : `this user hasn't set their time range!`}`);
    // anything else
    } else {
      raise(_msg, "that isn't a valid time range!");
    }
  }
};

// emitted when muffy is ready to start
client.on('ready', () => {
  console.log(symbols.success, " logged in!");
  console.log(symbols.info, ` storing data for ${Object.keys(conf.get("users")).length} users\n`)
});

// emitted on message
client.on('message', msg => {
  if (msg.guild) {
    let author = msg.author.id;
    let guild = msg.guild.id;
    let whitelist = `users.${author}.${guild}.whitelist`;
    let offset = `users.${author}.offset`;
    let range = `users.${author}.${guild}.range`;
    if (exists(offset) && exists(range)) {
      let hrs = conf.get(range).split("-");
      offset = Number(conf.get(offset).replace(":30", ".5").replace(":45", ".75")) * 60;

      if (dayjs(dayjs.utc().utcOffset(offset).format("h:mma"), "h:mma").isBetween(dayjs(hrs[0], "h:mma"), dayjs(hrs[1], "h:mma"))) {
        if (!conf.get(whitelist).includes(String(msg.channel.id))) {
          msg.react("🟡");
        }
      }
    }
  }

  if (msg.guild && msg.content.match(/^<@!?806929919929614346>/)) {
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

// utils
raise = (_msg, err) => {
  _msg.channel.send(err);
}

set = (key, value, _msg) => {
  conf.set(key, value);
  _msg.react("✅");
  console.log(symbols.info, ` user ${(_msg.author.id + "").padEnd(20, " ")} ${key.slice(key.lastIndexOf(".") + 1).padEnd(9, " ")} -> ${(typeof value === "object" ? `length ${value.length}` : value).padEnd(15, " ")} (server ${_msg.guild.id})`);
}

exists = key => !(conf.get(key) === undefined || conf.get(key).length == 0);

client.login(process.env.TOKEN);
