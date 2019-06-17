const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

async function robot(content) {

    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentence(content);

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithn = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithn.pipe(content.searchItem);
        const wikipediaContent = wikipediaResponse.get();

        content.sourceContentOriginal = wikipediaContent.content;

    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlanklinesAndMarkdown(content.sourceContentOriginal);
        const withoutDatesInParenthesis = removeDatesInParenthesis(withoutBlankLinesAndMarkdown);
        content.sourceContentSanitized = withoutDatesInParenthesis;

        function removeBlanklinesAndMarkdown(text) {
            const allLines = text.split('\n');

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                const trimmedLine = line.trim();
                if (trimmedLine.length === 0 || trimmedLine.startsWith('=')) {
                    return false;
                }
                return true;
            });

            return withoutBlankLinesAndMarkdown.join(' ');
        }

        function removeDatesInParenthesis(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ');
        }
    }

    function breakContentIntoSentence(content){
        content.sentences = [];

        const sentences =  sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

        sentences.forEach((sentence)=> {
            content.sentences.push({
                text: sentence, 
                keywords: [], 
                images: []
            });
        });
    }
}

module.exports = robot;