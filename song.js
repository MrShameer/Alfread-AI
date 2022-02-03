const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { joinVoiceChannel, createAudioPlayer, createAudioResource }  = require('@discordjs/voice');
const { Collection } = require('discord.js');
var subscription = null;
module.exports = async(client, message, args, currentChannel, play) => {

    if(!play && subscription) return subscription.unsubscribe();

    const voiceChannel = message.member.voice.channel;
 
    if (!voiceChannel) return client.channels.cache.get(currentChannel).send('You need to be in a channel to execute this command!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return client.channels.cache.get(currentChannel).send('You dont have the correct permissins');
    if (!permissions.has('SPEAK')) return client.channels.cache.get(currentChannel).send('You dont have the correct permissins');
    if (!args.length) return client.channels.cache.get(currentChannel).send('You need to send the second argument!');


    const validURL = (str) =>{
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if(!regex.test(str)){
            return false;
        } else {
            return true;
        }
    }

    if(validURL(args[0])){

        connection = await joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
			selfDeaf: false
		});
        const stream  = ytdl(args[0], {filter: 'audioonly'});

        var player = createAudioPlayer();
        var resource = createAudioResource(stream);

        player.play(resource);
        subscription = connection.subscribe(player);

        try{
            await message.reply(`:thumbsup: Now Playing ***Your Link!***`)
        }
        catch{
            client.channels.cache.get(currentChannel).send(`:thumbsup: Now Playing ***Your Link!***`);
        }

        return
    }

    connection = await joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
    });

    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;  
    }

    const video = await videoFinder(args);

    if(video){
        const stream  = ytdl(video.url, {filter: 'audioonly'});

        var player = createAudioPlayer();
        var resource = createAudioResource(stream);

        player.play(resource);
        subscription = connection.subscribe(player);

        try{
            await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
        }
        catch{
            client.channels.cache.get(currentChannel).send(`:thumbsup: Now Playing ***${video.title}***`);
        }
    } else {
        message.channel.send('No video results found');
    }
}
