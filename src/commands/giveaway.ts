import {
  Client,
  Constants,
  Message,
  TextChannel,
  MessageEmbed,
} from "discord.js";
import { splitArguments } from "../utility/splitArguments";
import { createIdentifier } from "../utility/createIdentifier";
import { Giveaway, GiveawayRepo } from "./libs/GiveawayRepo";
import { selectWinners } from "../utility/selectWinners";
import { isEmptyOrSpaces } from "../utility/isEmptyOrSpaces";

let _client: Client = undefined;
let _settings: any = undefined;

export default async function giveaway(client: Client, settings: any) {
  if (!settings.enabled) {
    return;
  }

  _client = client;
  _settings = settings;

  await GiveawayRepo.loadCache();
  monitorGiveaways();

  client.on(Constants.Events.MESSAGE_CREATE, async (message: Message) => {
    if (!message.content.startsWith(settings.prefix)) {
      return;
    }

    const action = message.content.split(" ")[1];
    const availableActions = ["create", "list", "remove", "help"];

    if (!action) {
      return message.reply(
        `Available actions: ${availableActions
          .map((a) => `\`${a}\``)
          .join(", ")}`
      );
    }

    if (!availableActions.includes(action)) {
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
      case "list":
        listGiveaways(actionArgs, message);
        break;
      case "help":
        giveHelp(actionArgs, message);
        break;
    }
  });
}

async function createGiveaway(args: string[], message: Message) {
  const [duration, title, emoji, winnerCount] = args;

  const durationMinutes = parseInt(duration, 10);
  let errors =
    isEmptyOrSpaces(title) || isEmptyOrSpaces(emoji) || durationMinutes === NaN;

  if (errors) {
    // send a message to user
    return message.reply(
      `\`${_settings.prefix} create <minutes:number> <title:string> <emoji> <winners?=1>\``
    );
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

  const announcement = new MessageEmbed()
    .setColor(_settings.color || "#00CC00")
    .setTitle(`Giveaway: ${giveaway.title}`)
    .setDescription(
      `React with ${emoji} to enter! **${numberWinners}** ${
        numberWinners > 1 ? "winners" : "winner"
      } will be selected at **${expiration.toLocaleTimeString()}**.`
    )
    .addFields(
      { name: "ID", value: giveaway.id, inline: true },
      { name: "Giveaway", value: giveaway.title, inline: true },
      { name: "Winners", value: giveaway.numberWinners, inline: true },
      { name: "Ends at", value: expiration.toLocaleTimeString(), inline: true }
    );

  const reply = await message.channel.send(announcement);

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
  if (!id) {
    return message.channel.send("No giveaway ID specified.");
  }
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

  const announcement =
    winners.length > 0
      ? `'${
          giveaway.title
        }' giveaway has ended. Congratulations to ${winners
          .map((uid) => `<@${uid}>`)
          .join(", ")}!`
      : `'${giveaway.title}' giveaway ended, but no users entered the drawing. :frowning:`;

  message.channel.send(announcement);
  GiveawayRepo.remove(giveaway.id);
}

// !giveaway help
function giveHelp(args: string[], message: Message) {
  message.reply(
    `\`\`\`
${_settings.prefix} help
${_settings.prefix} list
${_settings.prefix} create <minutes:number> <title:string> <emoji> <winners?:number=1>
${_settings.prefix} remove <id:string>
\`\`\``
  );
}
