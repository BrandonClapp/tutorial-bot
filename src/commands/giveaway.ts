import { Client, Constants, Message, TextChannel } from "discord.js";
import { splitArguments } from "../utility/splitArguments";
import { createIdentifier } from "../utility/createIdentifier";
import { Giveaway, GiveawayRepo } from "./libs/GiveawayRepo";
import { selectWinners } from "../utility/selectWinners";

let _client: Client = undefined;

export default async function giveaway(client: Client, settings: any) {
  if (!settings.enabled) {
    return;
  }

  _client = client;

  await GiveawayRepo.loadCache();
  monitorGiveaways();

  client.on(Constants.Events.MESSAGE_CREATE, async (message: Message) => {
    if (!message.content.startsWith(settings.prefix)) {
      return;
    }

    const action = message.content.split(" ")[1];

    if (!["create", "cancel", "extend", "list", "remove"].includes(action)) {
      console.log("Invalid sub-command action", action);
      return;
    }

    // [60, "Free Steam Key", :mage:, '2']
    const actionArgs = splitArguments(message.content).slice(2);

    switch (action) {
      case "create":
        await createGiveaway(actionArgs, message);
        break;
      case "remove":
        await removeGiveaway(actionArgs, message);
        break;
      case "cancel":
        console.log("cancelling");
        break;
      case "extend":
        console.log("extending");
        break;
      case "list":
        listGiveaways(actionArgs, message);
    }
  });
}

async function createGiveaway(args: string[], message: Message) {
  const [duration, title, emoji, winnerCount] = args;

  const durationMinutes = parseInt(duration, 10);
  if (durationMinutes === NaN) {
    throw "Duration parameter must be a number, got " + duration;
  }

  let numberWinners = parseInt(winnerCount, 10) || 1;

  const id = createIdentifier();
  let expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + durationMinutes);

  const giveaway = <Giveaway>{
    id,
    expiration: expiration.getTime(),
    title,
    emoji,
    numberWinners,
  };

  const reply = await message.channel.send(`
${title} (${giveaway.id})
React with ${emoji} to enter!
${numberWinners} winner(s) will be selected at ${expiration.toLocaleTimeString()}
  `);

  reply.react(emoji);

  giveaway.messageId = reply.id;
  giveaway.channelId = reply.channel.id;
  await GiveawayRepo.save(giveaway);
}

function listGiveaways(args: string[], message: Message) {
  const giveaways = GiveawayRepo.getAll();
  const reply =
    giveaways.length > 0
      ? `Current giveaways: ${giveaways.map((g) => g.id).join(", ")}`
      : "There are no active giveaways";
  message.channel.send(reply);
}

async function removeGiveaway(args: string[], message: Message) {
  const [id] = args;
  await GiveawayRepo.remove(id);
  message.channel.send("Removed giveaway " + id);
}

function monitorGiveaways() {
  setInterval(() => {
    GiveawayRepo.getAll().forEach(handleGiveaway);
  }, 2000);
}

async function handleGiveaway(giveaway: Giveaway) {
  if (Date.now() < giveaway.expiration) {
    return;
  }

  console.log(
    `${giveaway.id} is expired. ${Date.now()} > ${giveaway.expiration}`
  );

  const channel = _client.channels.cache.find(
    (c) => c.id === giveaway.channelId
  ) as TextChannel;

  const message = await channel.messages.fetch(giveaway.messageId, true);

  if (!message) {
    return GiveawayRepo.remove(giveaway.id);
  }

  const reaction = await message.reactions.cache.find(
    (r) => r.emoji.name === giveaway.emoji
  );

  // Load users into cache, otherwise they're not present on the reaction
  const users = await reaction.users.fetch();
  const eligible = users
    .filter((u) => u.id !== message.author.id)
    .map((u) => u.id);

  const winners = selectWinners(eligible, giveaway.numberWinners);

  message.channel.send(
    `${giveaway.title} giveaway has expired. Congratulations to ${winners
      .map((uid) => `<@${uid}>`)
      .join(", ")}!`
  );
  GiveawayRepo.remove(giveaway.id);
}
