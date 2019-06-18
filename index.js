const readline = require('readline-sync');
const robots = {
	text: require('./robots/text'),
}

async function start() {
	const content = {
		maximumSentences: 7
	};

	content.searchItem = askAndReturnSearchTerm();
	content.prefix = askAndReturnPrefix();

	await robots.text(content);

	// console.log(JSON.stringify(content, null, 4));
}

function askAndReturnSearchTerm() {
	return readline.question('Type a Wikipedia search term: ');
}

function askAndReturnPrefix() {
	const prefixes = ['Who is', 'What is', 'The history off'];
	const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose an option');
	const selectedPrefixText = prefixes[selectedPrefixIndex];

	return selectedPrefixText;
}

start();