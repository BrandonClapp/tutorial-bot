import { Client } from "discord.js";
import * as fs from "fs";

export async function registerCommands(client: Client) {
  fs.readdirSync(__dirname).forEach(async (file) => {
    if (file === "index.ts") {
      return;
    }

    const cmd = require(`./${file}`).default;
    await cmd(client);
  });
}
