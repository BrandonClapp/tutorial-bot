import { Client, Message, Constants } from "discord.js";

export default async function ping(client: Client) {
  client.on(Constants.Events.MESSAGE_CREATE, async (message: Message) => {
    if (message.content === "ping") {
      message.reply("Pongers!");
    }
  });
}
