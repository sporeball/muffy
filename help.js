/*
  help.js
  muffy help text
  copyright (c) 2021 sporeball
  MIT license
*/

const general = {
  color: "#2bd642",
  title: "Help",
  description: "I delete messages you try to send during the time range you ask me to, so you can focus on other things!\n\nType **@Muffy help [COMMAND]** for more information about a command.",
  fields: [
    {
      name: "whitelist",
      value: "Get or set your whitelist for this server."
    },
    {
      name: "timezone",
      value: "Get or set your timezone."
    },
    {
      name: "range",
      value: "Get or set the time range your messages will be deleted during.\n\nIf your **timezone** is set, and your current time is within your **range** for this server, I'll delete any messages you try to send in channels outside your **whitelist**."
    }
  ]
};

const whitelist = {
  color: "#2bd642",
  title: "whitelist",
  fields: [
    {
      name: "@Muffy whitelist",
      value: "Display your whitelist for this server. Messages sent in whitelisted channels will never be deleted."
    },
    {
      name: "@Muffy whitelist #channel ...",
      value: "Set your whitelist for this server to the channels listed."
    },
    {
      name: "@Muffy whitelist @user",
      value: "Display someone else's whitelist for this server."
    },
    {
      name: "@Muffy whitelist reset",
      value: "Empty your whitelist for this server."
    }
  ]
};

const timezone = {
  color: "#2bd642",
  title: "timezone",
  fields: [
    {
      name: "@Muffy timezone",
      value: "Display your timezone. This is used across all servers."
    },
    {
      name: "@Muffy timezone [TIMEZONE]",
      value: "Set your timezone.\nThis must be a timezone in the **tz database**, e.g. **America/Los_Angeles**, **Europe/London**, etc."
    },
    {
      name: "@Muffy timezone @user",
      value: "Display someone else's timezone."
    },
    {
      name: "@Muffy timezone reset",
      value: "Reset your timezone. After this, it will need to be set again."
    }
  ]
};

const range = {
  color: "#2bd642",
  title: "range",
  fields: [
    {
      name: "@Muffy range",
      value: "Display your time range for this server. This determines when your messages will be deleted."
    },
    {
      name: "@Muffy range [RANGE]",
      value: "Set your time range for this server.\nThis must be in the format **h:mma-h:mma**, e.g. **9:00am-5:00pm**, **2:00pm-10:00pm**, etc."
    },
    {
      name: "@Muffy range @user",
      value: "Display someone else's time range for this server."
    },
    {
      name: "@Muffy range reset",
      value: "Reset your time range for this server."
    }
  ]
}

module.exports = { general, whitelist, timezone, range };
