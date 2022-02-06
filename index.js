const config = require('./config.json')
const slashCommand = require('./slash-command.json')

const { Client, Intents, MessageEmbed } = require("discord.js");
const { joinVoiceChannel }  = require('@discordjs/voice');
var { addSpeechEvent } = require("discord-speech-recognition");

const command = require('./command')
const play = require('./song')
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
	.setColor(config['help-embed'])
	.setTitle('Alfread-AI is a discord bot that can help you play songs and do fun activities.')
	.setURL('')
	.setAuthor({ name: 'Alfread-AI', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg', url: '' })
	.setDescription('\u200B')
	.setThumbnail('https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg')
	.addFields(
		{ name: '.help', value: 'Display commands for Alfread-AI' },
		{ name: '.play {SONG_NAME / URL}', value: 'Play the song you have entered either in keywords or url'},
		{ name: '.join', value: 'Joins the voice channel' },
		{ name: '.leave', value: 'Leave the voice channel' },
	)
	.addField('\u200B','\u200B')
	.addField('This bot also has speach recognition so that you can run the commands using just speach', '\u200B')
	.addField('leave', 'if you say anything with leave or disconnect it will leave the voice channel')
	.addField('play', 'if you say anything with play and folowed by the song name it will play the song.')
	.addField('\u200B','\u200B')
	.setTimestamp()
	.setFooter({ text: 'By MrShameer', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg' });

client.on('ready', () => {
	console.log('The client is ready')

	const guildId = config.guildId;
	var guild = client.guilds.cache.get(guildId)
	// guild.commands.delete('939534235646197771')
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

	slash(client, 'ttt11', message => {
		message.reply('dddd')
	})

	slash(client, 'tictactoe', async(interaction) => {
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

	command(client, 'help', (message) =>{
		message.reply({ embeds: [help] })
	})

	slash(client, 'help', (interaction) =>{
		interaction.reply({ embeds: [help] })
	})

	function ping(message){
		var ping =  new MessageEmbed()
			.setAuthor({ name: 'Alfread-AI', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg', url: '' })
			.setDescription(`Latency : **${Date.now() - message.createdTimestamp}** ms \n API Latency : **${Math.round(client.ws.ping)}** ms`)
		message.reply({ embeds: [ping] })
	}

	command(client, 'ping', (message) =>{
		ping(message)
	})

	slash(client, 'ping', (message) => {
		ping(message)
	})

	command(client, 'join', (message) =>{
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
	command(client, 'language', (message) =>{
		var lang = message.content.substr('.language'.length).trim().split(' ').shift();
		if(config.language[lang]){
			console.log(config.language[lang]);
			addSpeechEvent(client, { lang: config.language[lang] });
		}
	})

	command(client, ['leave','disconnect','dc'], (message) =>{
		connection.destroy();
	})

	command(client, ['play','p'], (message) =>{
		currentChannel = message.channel.id;
		var songs = message.content.substr('.play'.length).trim()
		play(client, message, songs, currentChannel)
	})

	command(client, ['stop','skip'], (message) =>{
		play(null,message)
	})

	command(client, ['tictactoe'], (message) => {
		tictactoe(client, message)
	})
})


function checkcommand(args, message){
	if(args.some(substring=>message.content.includes(substring))){
		return true
	}
	return false
}

client.on("speech", (message) => {
	console.log(message.content);
	if(!message.content){
		return;
	}
	var listned = new MessageEmbed()
		.setColor(config['listned-embed'])
		.addFields(
			{ name: 'What I heared', value: message.content },
		)
	client.channels.cache.get(currentChannel).send({ embeds: [listned] });

	if(currentChannel){
		if(checkcommand(['leave','disconnect'], message)){
			connection.destroy();
		}
		else if(checkcommand(['play'], message)){
			// var keyword = (message.content.indexOf('play') > message.content.indexOf('song')) ? 'play' : 'song';
			var songs = message.content.substring(message.content.indexOf('play')+'play'.length).trim()
			// if(songs){
			play(client, message, songs, currentChannel)
			// }
		}
		else if(checkcommand(['stop','skip'], message)){
			play()
		}
	}
});

client.login(config.token)

//544961199696
//https://discord.com/api/oauth2/authorize?client_id=934534754416611400&permissions=544961199696&scope=bot%20applications.commands