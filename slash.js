module.exports = (client, command, callback) => {
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isCommand()) return;
    
        const { commandName } = interaction;

        if(commandName === command){
            callback(interaction)
        }
    })
    
}