import { Client } from "discord.js";
import * as fs from "fs";

export async function registerCommands(client: Client) {
  const settings = require("../../settings.json");
  fs.readdirSync(__dirname).forEach(async (file) => {
    if (file === "index.ts") {
      return;
    }

    const cmd = require(`./${file}`).default;
    const section = settings[file.replace(".ts", "")];
    await cmd(client, section);
  });
}
