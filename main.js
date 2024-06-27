import { Client, Partials, GatewayIntentBits } from 'discord.js';
import { parseDiceRoll } from './dice-rolls.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [ Partials.Channel ]
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('ye im still alive, thx');
	}
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    if (message.channel.type == 1) {
        const replies = ['stop messaging me im not ur friend', 'go away', 'im busy', '...', 'can you not right now?'];
        message.author.send(replies[Math.floor(Math.random() * replies.length)]);
        return;
    }

    // Split message by each word said
    const words = message.content.split(/\s/);
    let replyMsg = "";

    try {
        for (const indx in words) {
            let parsedResults = parseDiceRoll(words[indx]);
            if (parsedResults == null) continue;

            if (parsedResults[0].isMultipleRolls) {
                for (const indx in parsedResults) {
                    const result = parsedResults[indx];
                    replyMsg += `\` ${result.result + (result.staticModifier ?? 0)} \` ⟵ [${result.rolls.join(", ")}] ${result.match}\n`;
                }
                replyMsg = replyMsg.substring(0, replyMsg.length - 1);
            } else {
                let total = 0;
                for (const indx in parsedResults) {
                    const result = parsedResults[indx];
                    if (result.symbol == '+' || result.symbol == null)
                        total += result.result + (result.staticModifier ?? 0);
                    else
                        total -= result.result + (result.staticModifier ?? 0);
                    replyMsg += ` ${result.symbol ?? ''} [${result.rolls.join(", ")}] ${result.match}`;
                }
                replyMsg = `\` ${total} \` ⟵ ${replyMsg.substring(1)}`;
            }
        }

        if (replyMsg == "") return;
        if (message.author.id == "286516454080249857") {
            const replies = ['mmmmmm no', 'nah', 'nuh uh', 'not for u, ty tho']
            return message.reply({ content: replies[Math.floor(Math.random() * replies.length)], allowedMentions: { repliedUser: false }});
        }
        await message.reply({ content: replyMsg, allowedMentions: { repliedUser: false }});
    } catch (ex) {
        console.log('err!', ex.message, ex.stack);
        await message.reply(`wow. nice one. you broke it. <@404872989188816906> was notified & DM'd. SHAME 🔔!`);
        await message.guild.members.cache
            .get('404872989188816906')
            .send(`Bot Broke 💀\nUser: ${message.author.displayName} (${message.author.username})\nMessage: [${message.content}](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})\nError: \`\`\`\n${ex.message}\n\t${ex.stack}\`\`\``);
    }
});

client.login(process.env.DISCORD_TOKEN);