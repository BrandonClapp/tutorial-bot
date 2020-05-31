import { Client, Constants, Message } from "discord.js";
import { splitArguments } from "../utility/splitArguments";
import { createIdentifier } from "../utility/createIdentifier";
import { Giveaway, GiveawayRepo } from "./libs/GiveawayRepo";

const repo = new GiveawayRepo();

export default async function giveaway(client: Client, settings: any) {
  settings = {};
  settings.commandPrefix = "!giveaway";

  client.on(Constants.Events.MESSAGE_CREATE, async (message: Message) => {
    if (!message.content.startsWith(settings.commandPrefix)) {
      return;
    }

    const action = message.content.split(" ")[1];

    if (!["create", "cancel", "extend"].includes(action)) {
      console.log("Invalid sub-command action", action);
      return;
    }

    // [60, "Free Steam Key", :mage:, '2']
    const actionArgs = splitArguments(message.content).slice(2);

    switch (action) {
      case "create":
        await createGiveaway(actionArgs, message);
        break;
      case "cancel":
        console.log("cancelling");
        break;
      case "extend":
        console.log("extending");
        break;
    }
  });
}

async function createGiveaway(args: string[], message: Message) {
  const [duration, title, emoji, winnerCount] = args;

  const durationMinutes = parseInt(duration, 10);
  if (durationMinutes === NaN) {
    throw "Duration parameter must be a number, got " + duration;
  }

  const id = createIdentifier();
  let expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + durationMinutes);

  const giveaway = <Giveaway>{
    id,
    expiration: expiration.getTime(),
  };

  const reply = await message.channel.send(`
${title} (${giveaway.id})
React with ${emoji} to enter!
${winnerCount} winner(s) will be selected at ${expiration.toLocaleTimeString()}
  `);

  giveaway.message = reply.id;
  await repo.save(giveaway);
}
