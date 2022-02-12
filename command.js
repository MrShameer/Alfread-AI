var config = null;
try{
	config = require('./config.json');
}
catch{
	config = process.env;
}
module.exports = (client, aliases, message, callback) => {
	if(typeof aliases === 'string'){
		aliases = [aliases]
	}
	const {content} = message

	aliases.forEach((alias) => {
		const command = `${config.PREFIX}${alias}`

		if(content.startsWith(`${command} `) || content === command){
			console.log(`Running the command ${command}`)
			callback(message)
		}
	})
}

