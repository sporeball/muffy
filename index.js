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
var timezone = require("dayjs/plugin/timezone");
dayjs.extend(timezone);

// regex helpers
const H = "([2-9]|1[0-2]?)";
const MM = "(:[0-5][0-9])";
const a = "(am|pm)";
const times = `${H}${MM}${a}`;
const ranges = new RegExp(`${times}-${times}`, "gm");

// other
const help = require("./help.js");
const symbols = require("log-symbols");

const commands = {
  "help": (args, _msg) => {
    // @Muffy help
    if (args.length == 0) {
      _msg.channel.send({ embed: help.general });
    } else if (args[0] == "whitelist") {
      _msg.channel.send({ embed: help.whitelist });
    } else if (args[0] == "timezone") {
      _msg.channel.send({ embed: help.timezone });
    } else if (args[0] == "range") {
      _msg.channel.send({ embed: help.range });
    } else {
      respondError("Make sure you ask for help with a valid command!", _msg);
    }
  },

  "whitelist": (args, _msg) => {
    let whitelist = `users.${_msg.author.id}.${_msg.guild.id}.whitelist`;
    // @Muffy whitelist
    if (args.length == 0) {
      respond(`Your whitelist for this server is ${exists(whitelist) ? conf.get(whitelist).map(x => `<#${x}>`).join(", ") + "." : "empty!"}`, _msg);
    // @Muffy whitelist reset
    } else if (args[0] == "reset") {
      set(whitelist, [], _msg);
    // @Muffy whitelist [#channel]
    } else if (args[0].match(/^<#\d+>$/)) {
      // assert every argument is a channel
      if (args.every(x => x.match(/^<#\d+>$/))) {
        set(whitelist, _msg.mentions.channels.array().map(x => x.id), _msg);
      } else {
        respondError("Make sure you only reference channels!", _msg);
      }
    // @Muffy whitelist [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let w = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.whitelist`;
      respond(`This user's whitelist is ${exists(w) ? conf.get(w).map(x => `<#${x}>`).join(", ") + "." : "empty!"}`, _msg);
    // anything else
    } else {
      respondError("Make sure you only reference channels!", _msg);
    }
  },

  "timezone": (args, _msg) => {
    let timezone = `users.${_msg.author.id}.timezone`;
    // @Muffy timezone
    if (args.length == 0) {
      respond(`${exists(timezone) ? `Your timezone is **${conf.get(timezone)}**.` : "You haven't set your timezone!"}`, _msg);
    // @Muffy timezone reset
    } else if (args[0] == "reset") {
      set(timezone, "", _msg);
    // @Muffy timezone [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let t = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.timezone`;
      respond(`${exists(t) ? `This user's timezone is **${conf.get(t)}**.` : `This user hasn't set their timezone!`}`, _msg);
    // anything else
    } else {
      let valid = true;
      try {
        let time = dayjs().tz(args[0]);
      } catch {
        respondError("Make sure the timezone you're referencing is in the tz database!", _msg);
        valid = false;
      }

      if (valid) set(timezone, args[0], _msg);
    }
  },

  "range": (args, _msg) => {
    let range = `users.${_msg.author.id}.${_msg.guild.id}.range`;
    // @Muffy range
    if (args.length == 0) {
      respond(`${exists(range) ? `Your time range for this server is **${conf.get(range)}**.` : "You haven't set a time range for this server!"}`, _msg);
    // @Muffy range reset
    } else if (args[0] == "reset") {
      set(range, "", _msg);
    // @Muffy range [valid range]
    } else if (args[0].match(ranges)) {
      set(range, args[0], _msg);
    // @Muffy range [@user]
    } else if (args[0].match(/^<@!?\d+>$/)) {
      let r = `users.${_msg.mentions.members.array().find((u, i) => i == 1).user.id}.${_msg.guild.id}.range`;
      respond(`${exists(r) ? `This user's time range is **${conf.get(r)}**.` : `This user hasn't set their time range!`}`, _msg);
    // anything else
    } else {
      respondError("Make sure the time range is formatted correctly, like **9:00am-5:00pm**!", _msg);
    }
  }
};

// emitted when muffy is ready to start
client.on('ready', () => {
  console.log(symbols.success, " logged in!");
  console.log(symbols.info, ` watching users in ${client.guilds.cache.size} servers\n`);
  client.user.setActivity(`users in ${client.guilds.cache.size}+ servers`, { type: "WATCHING" });
});

// emitted on message
client.on('message', msg => {
  if (msg.guild) {
    let deleted = false;
    let author = msg.author.id;
    let guild = msg.guild.id;
    let whitelist = `users.${author}.${guild}.whitelist`;
    let timezone = `users.${author}.timezone`;
    let range = `users.${author}.${guild}.range`;
    if (exists(timezone) && exists(range)) {
      let hrs = conf.get(range).split("-");
      let rangeStart = dayjs(hrs[0], "h:mma").tz(conf.get(timezone));
      let rangeEnd = dayjs(hrs[1], "h:mma").tz(conf.get(timezone));

      if (hrs[0].endsWith("pm") && hrs[1].endsWith("am")) {
        rangeEnd = rangeEnd.add(1, "day");
      }

      if (dayjs(dayjs().tz(conf.get(timezone)).format("h:mma"), "h:mma").isBetween(rangeStart, rangeEnd)) {
        if (!exists(whitelist) || (exists(whitelist) && !conf.get(whitelist).includes(String(msg.channel.id)))) {
          msg.delete();
          deleted = true;
          console.log(symbols.warning, ` user ${(author + "").padEnd(20, " ")} ${"had message deleted".padEnd(45, " ")} (server ${guild})`);
        }
      }
    }

    if (!deleted) {
      if (msg.content.match(/^<@!?806929919929614346>/)) {
        call(msg);
      }
    }
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
respond = (response, _msg) => {
  _msg.channel.send({ embed: {
    color: "#2bd642",
    description: response
  }});
}

respondError = (solution, _msg) => {
  _msg.channel.send({ embed: {
    color: "#d6392b",
    title: "I can't do that!",
    description: solution
  }});
}

set = (key, value, _msg) => {
  conf.set(key, value);
  _msg.react("✅");
  console.log(symbols.info, ` user ${(_msg.author.id + "").padEnd(20, " ")} ${key.slice(key.lastIndexOf(".") + 1).padEnd(9, " ")} -> ${(typeof value === "object" ? `length ${value.length}` : value).padEnd(32, " ")} (server ${_msg.guild.id})`);
}

exists = key => !(conf.get(key) === undefined || conf.get(key).length == 0);

client.login(process.env.TOKEN);
