const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
var Queue=require('js-queue');

const { createAudioPlayer, createAudioResource }  = require('@discordjs/voice');
const { Collection, MessageEmbed } = require('discord.js');
var config = null;
try{
	config = require('./config.json');
}
catch{
	config = process.env;
}
var queue=new Queue;
var player = createAudioPlayer();

const help =  new MessageEmbed()
	.setColor(config['HELP-EMBED'])
	.setTitle('Song Help')
	.setURL('')
	.setAuthor({ name: 'Alfread-AI', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg', url: '' })
	.setDescription('\u200B')
	.setThumbnail('https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg')
	.addFields(
		{ name: '.play {SONG_NAME / URL}', value: 'Play the song you have entered either in keywords or url'},
		{ name: '.join', value: 'Joins the voice channel' },
		{ name: '.leave', value: 'Leave the voice channel' },
        { name: '.skip', value: 'Skip the current song' },
        { name: '.pause', value: 'Pause the current song' },
        { name: '.resume', value: 'Resume the current song' },
	)
	.setTimestamp()
	.setFooter({ text: 'By ...', iconURL: 'https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg' });

module.exports = {
    playSong : async function(client, message, args, currentChannel, connection){
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
            const stream  = ytdl(args[0], {filter: 'audioonly'});

            try{
                var resource = createAudioResource(stream);

                player.play(resource);
                connection.subscribe(player); 
            }catch{
                return
            }
            

            try{
                await message.reply(`:notes: Now Playing ***Your Link!***`)
            }
            catch{
                await client.channels.cache.get(currentChannel).send(`:notes: Now Playing ***Your Link!***`);
            }

            return
        }

        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;  
        }

        const video = await videoFinder(args);
        if(video){
            if(player.state.status == "playing"){
                
                var addQueue = new MessageEmbed()
            	.setColor(config['song-embed'])
            	.addFields(
            		{ name: ':arrow_double_up: Added to the queue', value: `***${video.title}***` },
            	)

                try{
                    await message.reply({ embeds: [song] })
                }
                catch{
                    await client.channels.cache.get(currentChannel).send({ embeds: [addQueue] });
                }
            }
            queue.add(
                addSong.bind(queue,video)
            );

        } else {
            message.channel.send('No video results found');
        }

        async function addSong(video){
            
            const stream  = ytdl(video.url, {filter: 'audioonly'});

            try{
               var resource = createAudioResource(stream);

                player.play(resource);
                connection.subscribe(player); 
            }catch{
                return
            }
            

            var song = new MessageEmbed()
                .setColor(config['SONG-EMBED'])
                .addFields(
                    { name: ':notes: Now Playing', value: `***${video.title}***` },
                )

            try{
                await message.reply({ embeds: [song] })
            }
            catch{
                await client.channels.cache.get(currentChannel).send({ embeds: [song] });
            }
        }

        player.addListener("stateChange", (oldOne, newOne) => {
            if (player.state.status == "idle") {
                queue.next();
            }
        });
        
    },

    skipSong : function(){
        player.stop();
    },

    pauseSong : function(pause){
        if(pause) return player.pause();
        return player.unpause();
    },

    helpSong : function(message){
        message.reply({ embeds: [help] })
    },


}
