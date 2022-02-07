const {PREFIX} = (require('./config.json')) ? require('./config.json') : process.env;

module.exports = (client, aliases, message, callback) => {
	if(typeof aliases === 'string'){
		aliases = [aliases]
	}
	const {content} = message

	aliases.forEach((alias) => {
		const command = `${PREFIX}${alias}`

		if(content.startsWith(`${command} `) || content === command){
			// console.log(`Running the command ${command}`)
			callback(message)
		}
	})
}

