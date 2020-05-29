import { Client } from "discord.js";
const client = new Client();

import { registerCommands } from "./commands";

import * as dotenv from "dotenv";
dotenv.config();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await registerCommands(client);
});

client.login(process.env.TOKEN);
