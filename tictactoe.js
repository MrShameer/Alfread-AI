const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = (client, message, interaction) => {
    message.reply({ content: 'Lets Play', components: [
        {type: 1, components: [
            {type: 2, label: "_", style: 2, custom_id: "ttt11"},
            {type: 2, label: "_", style: 2, custom_id: "ttt12"},
            {type: 2, label: "_", style: 2, custom_id: "ttt13"},
        ]},
        {type: 1, components: [
                {type: 2, label: "_", style: 2, custom_id: "ttt21"},
                {type: 2, label: "_", style: 2, custom_id: "ttt22"},
                {type: 2, label: "_", style: 2, custom_id: "ttt23"},
        ]},
        {type: 1, components: [
                {type: 2, label: "_", style: 2, custom_id: "ttt31"},
                {type: 2, label: "_", style: 2, custom_id: "ttt32"},
                {type: 2, label: "_", style: 2, custom_id: "ttt33"},
        ]}
    ]});
    client.on("interactionCreate", async interaction => {
        if(interaction.isMessageComponent() && interaction.customId.startsWith("ttt")){
            await updateGrid(interaction);
        }
    });

    async function updateGrid(interaction) {
        /** @type {Discord.Message} message */
        const message = interaction.message;
    
        let xs = 0, os = 0;
    
        for(let actionRow of message.components) {
            for(let button of actionRow.components) {
                if(button.label === 'X') xs++;
                else if(button.label === 'O') os++;
            }
        }
    
        const xs_turn = xs <= os;
        const i = parseInt(interaction.customId[3]),
            j = parseInt(interaction.customId[4]);
    
        const buttonPressed = message.components[i-1].components[j-1];
    
        if(buttonPressed.label !== '_')
            return await interaction.reply("Someone already played there!", {ephemeral: true});
    
        buttonPressed.label = xs_turn ? 'X' : 'O';
        buttonPressed.style = xs_turn ? "SUCCESS" : "DANGER";
    
        const styleToNumber = style => style === "SECONDARY" ? 2 : style === "SUCCESS" ? 3 : 4;
    
        const components = [];
    
        for(let actionRow of message.components) {
            components.push({type: 1, components: []});
            for (let button of actionRow.components) {
                components[components.length - 1].components.push({type: 2, label: button.label, style: styleToNumber(button.style), custom_id: button.customId});
            }
        }
    
        await message.edit({components: components});
    
        await interaction.deferUpdate();
    }
   
    console.log(message.mentions.users.first().username);
}