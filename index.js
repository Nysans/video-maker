const readline = require('readline-sync');
const robots = {
	text: require('./robots/text'),
}

async function start(){

	function askAndReturnSearchTerm(){
		return readline.question('Type a Wikipedia search term: ');
	}

	function askAndReturnPrefix(){
		const prefixes = ['Who is', 'What is', 'The history off'];
		const selectedPrefixIndex = readline.keyInSelect(prefixes,'Choose an option');
		const selectedPrefixText = prefixes[selectedPrefixIndex];

		return selectedPrefixText; 

	}

	const content = {};

	content.searchItem = askAndReturnSearchTerm();
	content.prefix = askAndReturnPrefix();

	await robots.text(content);
}

start();