const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;

const sentenceBoundaryDetection = require('sbd');

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

async function robot(content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentence(content);
    limiteMaximumSentences(content);
    await fetchKeywordOfAllSentences(content);
}

async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
        nlu.analyze(
            {
                text: sentence,
                features: {
                    keywords: {}
                }
            },
            function (err, response) {
                if (err) {
                    throw err;
                } else {
                    const keywords = response.keywords.map((keyword) => {
                        return keyword.text;
                    });
                    resolve(keywords);
                }
            }
        );
    });
}

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

    function removeDatesInParenthesis(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
    }
}

function breakContentIntoSentence(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

    sentences.forEach((sentence) => {
        content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
        });
    });
}

function limiteMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
}

async function fetchKeywordOfAllSentences(content){
    for(const sentence of content.sentences){
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
}

module.exports = robot;