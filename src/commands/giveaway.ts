import { Client, Constants, Message } from "discord.js";
import { GiveawayRepo, Giveaway } from "./libs/GiveawayRepo";
import { splitArguments } from "../utility/splitArguments";
import { createIdentifier } from "../utility/createIdentifier";

const repo = new GiveawayRepo();

export default async function giveaway(client: Client, settings: any) {
  settings = {};
  settings.commandPrefix = "!giveaway";

  client.on(Constants.Events.MESSAGE_CREATE, async (message: Message) => {
    if (!message.content.startsWith(settings.commandPrefix)) {
      return;
    }

    // Figure out sub-command action
    const action = message.content.split(" ")[1];

    // Validate that this is a valid sub-command action
    if (!["create", "cancel", "extend"].includes(action)) {
      console.log("Invalid sub-command action", action);
      return;
    }

    const actionArgs = splitArguments(message.content).slice(2);

    // Route to appropriate handler.
    switch (action) {
      case "create":
        await createGiveaway(actionArgs, message);
        break;
      case "cancel":
        console.log("canceling");
        break;
      case "extend":
        console.log("extending");
        break;
    }

    console.log("giveaway command", this);
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

  const expires = new Date(0);
  expires.setSeconds(giveaway.expiration);

  const reply = await message.channel.send(
    `
${title} (${giveaway.id})
React with ${emoji} to enter!
${winnerCount} winner(s) will be selected at ${expiration.toLocaleTimeString()}
    `
  );
  giveaway.message = reply.id;
  await repo.save(giveaway);
}

// Given the command, return the parsed GiveawayCreateArguments
// function parseArgs(arguments: string): GiveawayCreateArguments {}

// !giveaway create 60 "Free Steam Key" :mage: 2
// !giveaway create <minutes> <title> <reaction_emoji> <winner_count=1>

// !giveaway cancel f44ds5sdf52d
// !giveaway cancel <giveaway_id>

// !giveaway extend f44ds5sdf52d 15
// !giveaway extend <giveaway_id> <minutes>
