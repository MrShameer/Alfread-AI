var config = null;
try{
	config = require('./config.json');
}
catch{
	config = process.env;
}
// const config = (require('./config.json')) ? require('./config.json') : process.env;
const slashCommand = require('./slash-command.json')

const { Client, Intents, MessageEmbed } = require("discord.js");
const { joinVoiceChannel }  = require('@discordjs/voice');
var { addSpeechEvent } = require("discord-speech-recognition");

const command = require('./command')
const { playSong, skipSong, pauseSong, helpSong } = require('./song')
const tictactoe = require('./tictactoe')
const slash = require("./slash");

const client = new Client({
	intents: [
	  Intents.FLAGS.GUILDS,
	  Intents.FLAGS.GUILD_VOICE_STATES,
	  Intents.FLAGS.GUILD_MESSAGES,
	  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
  });
addSpeechEvent(client);
var currentChannel = null;
var connection = null;

const help =  new MessageEmbed()
	.setColor(config['HELP-EMBED'])
	.setTitle('Alfread-AI is a discord bot that can help you play songs and do fun activities.')
	.setURL('')
	.setAuthor({ name: 'Alfread-AI', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg', url: '' })
	.setDescription('This bot also has speach recognition so that you can run the commands using just speech')
	.setThumbnail('https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg')
	.addFields(
		{ name: '.help', value: 'Display commands for Alfread-AI' },
		{ name: '.join', value: 'Joins the voice channel' },
		{ name: '.leave', value: 'Leave the voice channel' },
		{ name: '.songhelp', value: 'Display commands for songs' },
		{ name: '.speechhelp', value: 'Display commands for speech recognition' },
	)
	.setTimestamp()
	.setFooter({ text: 'By ...', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg' });

function ping(message){
	var ping =  new MessageEmbed()
		.setAuthor({ name: 'Alfread-AI', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg', url: '' })
		.setDescription(`Latency : **${Date.now() - message.createdTimestamp}** ms \n API Latency : **${Math.round(client.ws.ping)}** ms`)
	message.reply({ embeds: [ping] })
}

function checkcommand(args, message){
	if(args.some(substring=>message.content.includes(substring))) return true;
	return false;
}

client.on('ready', () => {
	console.log('The client is ready')

	const guildId = config.GUILDID;
	var guild = client.guilds.cache.get(guildId)
	// guild.commands.delete('command id')
	// guild.commands.fetch().then(c=> console.log(c))
	let commands
	if (guild) {
		commands = guild.commands
	} else {
	  commands = client.application?.commands
	}

	slashCommand.forEach(function(obj){ 
		commands?.create(obj)
	});
})

client.on('messageCreate', message => {
	command(client, 'help', message, (message) =>{
		message.reply({ embeds: [help] })
	})

	command(client, 'songhelp', message, (message) =>{
		helpSong(message)
	})

	command(client, 'ping', message, (message) =>{
		ping(message)
	})

	command(client, 'join', message, (message) =>{
		var voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.reply('You need to be in a channel to execute this command!');
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) return message.reply('You dont have the correct permissins');
		if (!permissions.has('SPEAK')) return message.reply('You dont have the correct permissins');
		connection = joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
			selfDeaf: false
		});
		currentChannel = message.channel.id;
	})

	//EXPERIMENTAL
	command(client, 'language', message, (message) =>{
		var lang = message.content.substr('.language'.length).trim().split(' ').shift();
		if(config.LANGUAGE[lang]){
			console.log(config.LANGUAGE[lang]);
			addSpeechEvent(client, { lang: config.LANGUAGE[lang] });
		}
	})

	command(client, ['leave','disconnect','dc'], message, (message) =>{
		connection.destroy();
	})

	command(client, ['play','p'], message, (message) =>{
		connection = joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
			selfDeaf: false
		});
		currentChannel = message.channel.id;
		var songs = message.content.substr('.play'.length).trim()
		playSong(client, message, songs, currentChannel, connection)
	})

	command(client, ['stop','skip'], message, (message) =>{
		skipSong()
	})

	command(client, ['pause'], message, (message) =>{
		pauseSong(true)
	})

	command(client, ['resume'], message, (message) =>{
		pauseSong(false)
	})

	command(client, ['tictactoe'], message, (message) => {
		tictactoe(client, message)
	})
})

client.on('interactionCreate', async (interaction) => {
	slash(client, 'tictactoe', interaction, async(interaction) => {
		let { options } = interaction

		await interaction.reply( `${options.getUser('opponent')} do you want to play?`)
		const filter = (reaction, user) => {
			return ['✅', '❌'].includes(reaction.emoji.name) && user.id === options.getUser('opponent').id;
		};
		const message = await interaction.fetchReply()
		message.react('✅').then(() => message.react('❌'));

		message.awaitReactions({filter, max: 1, time: 30000, errors: ['time'] }).then(collected => {
			const reaction = collected.first();

			if (reaction.emoji.name === '✅') {
				tictactoe(client, message, interaction)
			} else {
				message.reply('Sorry maybe next time!');
			}
		})
		.catch(collected => {
			message.reply('You reacted with neither a thumbs up, nor a thumbs down.');
		});
	})

	slash(client, 'help', interaction, (interaction) =>{
		interaction.reply({ embeds: [help] })
	})

	slash(client, 'ping', interaction, (message) => {
		ping(message)
	})
})

client.on("speech", (message) => {
	console.log(message.content);
	if(!message.content){
		return;
	}
	var listned = new MessageEmbed()
		.setColor(config['LISTNED-EMBED'])
		.addFields(
			{ name: 'What I heared', value: message.content },
		)
	client.channels.cache.get(currentChannel).send({ embeds: [listned] });

	if(currentChannel){
		if(checkcommand(['leave','disconnect'], message)){
			connection.destroy();
		}
		else if(checkcommand(['play'], message)){
			connection = joinVoiceChannel({
				channelId: message.member.voice.channel.id,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator,
				selfDeaf: false
			});
			var songs = message.content.substring(message.content.indexOf('play')+'play'.length).trim()
			playSong(client, message, songs, currentChannel, connection)
		}
		else if(checkcommand(['stop','skip'], message)){
			skipSong()
		}
	}
});

client.login(config.TOKEN)

//544961199696
//https://discord.com/api/oauth2/authorize?client_id=934534754416611400&permissions=544961199696&scope=bot%20applications.commands