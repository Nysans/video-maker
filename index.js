const readline = require('readline-sync');

function start(){
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

	console.log(content);
}

start();