import {
  Client,
  TextChannel,
  ChannelLogsQueryOptions,
  Constants,
  MessageReaction,
  User,
  Role,
} from "discord.js";

export default async function agreeToRules(client: Client, settings: any) {
  const rules: TextChannel = (await client.channels.fetch(
    settings.rulesChannel,
    true
  )) as TextChannel;

  await rules.messages.fetch(<ChannelLogsQueryOptions>{ limit: 90 }, true);

  client.on(
    Constants.Events.MESSAGE_REACTION_ADD,
    async (reaction: MessageReaction, user: User) => {
      if (
        reaction.message.id === settings.ruleMessage &&
        reaction.emoji.name === settings.emoji
      ) {
        const guestRole: Role = reaction.message.guild.roles.cache.find(
          (r) => r.name === settings.role
        );

        await reaction.message.guild.member(user).roles.add(guestRole);
      }
    }
  );
}
