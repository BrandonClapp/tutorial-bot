const Discord = require("discord.js");
const client = new Discord.Client();
import * as dotenv from "dotenv";
import { registerCommands } from "./commands";
dotenv.config();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await registerCommands(client);
});

client.on("message", (msg) => {
  if (msg.content === "ping") {
    msg.reply("Pong!");
  }
});

client.login(process.env.TOKEN);
