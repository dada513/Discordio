import { Command, CommandoMessage } from "discord.js-commando";
import { MessageEmbed } from "discord.js";
import knex from "../../database";
import loadingEmbed from "../../apis/loadingembed";
import * as util from "./util";

export default class ConsiderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "consider",
      group: "suggestions",
      memberName: "consider",
      description: "Considers a suggestion",
      userPermissions: ["ADMINISTRATOR"],
      args: [
        {
          key: "id",
          type: "integer",
          prompt:
            "What is the ID of the suggestion you would like to consider?",
        },
        {
          key: "reason",
          type: "string",
          prompt: "What is the reason for considering the suggestion?",
          default: "No reason provided",
        },
      ],
    });
  }

  /**
   * @param {CommandoMessage} message
   */
  async run(message, { id, reason }) {
    const channel = await util.getChannel(message.guild.id);
    if (!channel) {
      return message.say(
        "This guild does not have a suggestion channel set up."
      );
    }

    const ch = message.guild.channels.cache.get(channel.channelid);
    if (!ch) {
      return message.say(`The suggestion channel for this guild seems to be deleted.
      Create it with \`${this.client.commandPrefix}setupSuggestions\``);
    }

    const [suggestion] = await knex("suggestions")
      .where({
        guild: message.guild.id,
        id,
      })
      .select();

    if (!suggestion) {
      return message.say(`No suggestion with id ${id} found.`);
    }

    const msg = await ch.send(loadingEmbed());

    const embed = new MessageEmbed()
      .setAuthor(suggestion.author_tag, suggestion.author_avatar)
      .setTitle(`Suggestion #${suggestion.id} Considered`)
      .setDescription(suggestion.content)
      .addField(`Reason from ${message.author.tag}`, reason)
      .setColor("ORANGE");
    return msg.edit("", embed);
  }
}
