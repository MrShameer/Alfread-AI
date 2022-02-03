const { Client, Intents, MessageEmbed  } = require("discord.js");
const config = require('./config.json')
const language = require('./language.json')
const command = require('./command')
const play = require('./song')
const { joinVoiceChannel }  = require('@discordjs/voice');
var { addSpeechEvent } = require("discord-speech-recognition");
const client = new Client({
	intents: [
	  Intents.FLAGS.GUILDS,
	  Intents.FLAGS.GUILD_VOICE_STATES,
	  Intents.FLAGS.GUILD_MESSAGES,
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
	.setFooter({ text: 'By MrShamer', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg' });

function checkcommand(args, message){
	
	if(args.some(substring=>message.content.includes(substring))){
		return true
	}
	return false
}

client.on('ready', () => {
	console.log('The client is ready')

	command(client, 'help', (message) =>{
		message.channel.send({ embeds: [help] })
	})

	command(client, 'ping', (message) =>{
		message.channel.send('Pong!')
	})

	command(client, 'join', (message) =>{
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
		if(!language[lang]){
			console.log(language[lang]);
			addSpeechEvent(client, { lang: language[lang] });
		}
	})

	command(client, ['leave','disconnect','dc'], (message) =>{
		connection.destroy();
	})

	command(client, ['play','p'], (message) =>{
		currentChannel = message.channel.id;
		var songs = message.content.substr('.play'.length).trim()
		play(client, message, songs, currentChannel, true)
	})

	command(client, ['stop','skip'], (message) =>{
		play(null, null, null, null, false)
	})
})

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
			play(client, message, songs, currentChannel, true)
			// }
		}
		else if(checkcommand(['stop','skip'], message)){
			play(null, null, null, null, false)
		}
	}
});
client.login(config.token)

//320011976528
//https://discord.com/api/oauth2/authorize?client_id=934534754416611400&permissions=407521984336&scope=bot