<p align="center"><a href="#" target="_blank"><img src="https://img.freepik.com/free-vector/business-suit-leader-person-concept-vector-illustration_1284-42667.jpg" width="250"></a>
 <h1 align="center">Alfread-AI</h1>
</p>


<h4 align="center">A discord bot that has speach recognition function</h4>

<p align="center">
  <a href="#features">Features</a>
  •
  <a href="#adding-the-bot">Adding The Bot</a>
  •
  <a href="#installation">Installation</a>
  •
  <a href="#license">License</a>
</p>

# Features

### Music
- `.play <SONG / URL` > Play music
- `.pause` > Pause the current song
- `.resume` > Resume song
- `.skip` > Skip the current song
---

### Speech Recognition
> This bot comes with speech recognition. It will do commands based on the keyword it heard.

- `.language <LANGUAGE>` > Change the language you will speak into

**Example of keyword you can say:**
- `leave` or `disconnects` > It will make the bot disconnect from the channel
- `play` > It will play the song after the `play` keyword. E.g. when you say *Play the song Happy Birthday* it will play Happy Birthday song
- `stop` or `skip` > It will skip the current song
---

### Application / Slash Commands
> With this you can have interaction with this bot

- `/help` > See list of commands
- `/ping` > See the ping for this bot
- `/tictactoe <USER>` > Play tictactoe with the mentioned user
---

### Other Basic Command
- `.join` > Joins the voice channel you are in
- `.leave` > Leave the voice channel
- `.help` > See list of commands
- `.ping` > See the ping for this bot
<br>

# Adding the Bot
For now the bot isn't featured in [top.gg](https://top.gg/) but you can add using this **[LINK](https://discord.com/api/oauth2/authorize?client_id=934534754416611400&permissions=544961199696&scope=bot%20applications.commands)**

Make sure to enable all the premission if you want to use all the features.

<br>

# Installation
> If you want to run this bot on your own, you can follow the steps below.

1. Download this github repository
2. Copy the content of [config.example.json](https://github.com/MrShameer/Alfread-AI/blob/main/config.example.json) and place it inside a new file called `config.json`.
3. Set the token to your bot token. You can obtain this at discord developer portal [here](https://discord.com/developers/applications)
4. Install the dependency by typing:
```
npm i
```
6. To run the bot simply type:
```
node index.js
```

<br>

# License
The app is open-sourced app licensed under the [MIT license](https://opensource.org/licenses/MIT).

<br>

# My Other Bot
Check out my other bot where you can play meme sound in discord. The bot is made using Discord.py. Check it out [here](https://github.com/MrShameer/DiscordMemeSound)
