import {
  Client,
  TextChannel,
  ChannelLogsQueryOptions,
  MessageReaction,
  User,
  Constants,
} from "discord.js";

const CHANNELS = {
  rules: "714985876014235668",
};

export default async function agreeToRules(client: Client) {
  const rules: TextChannel = (await client.channels.fetch(
    CHANNELS.rules,
    true
  )) as TextChannel;
  await rules.messages.fetch(<ChannelLogsQueryOptions>{ limit: 90 }, true);

  client.on(
    Constants.Events.MESSAGE_REACTION_ADD,
    async (reaction: MessageReaction, user: User) => {
      if (
        reaction.message.id === "714985925469536286" &&
        reaction.emoji.name === "👍"
      ) {
        const guestsRole = reaction.message.guild.roles.cache.find(
          (r) => r.name === "guests"
        );

        await reaction.message.guild.member(user).roles.add(guestsRole);
      }
    }
  );
}
