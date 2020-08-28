const Apify = require('apify');
const urlLib = require('url');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    var {
        urls,
        domainToScraper,
        bubbleEndpoint,
        apiEndpoint,
        gsheetsEndpoint
    } = input;

    var scraperToUrls = {};
    for (var request of urls) {
        var url = request.url;
        const validProtocol = url.startsWith('http://') || url.startsWith('https://');
        if (!validProtocol) {
            url = 'https://' + url; 
        }
        const domain = parseDomain(url);
        request.userData.domain = domain;

        var scraper = null;
        if (domain in domainToScraper) {
            scraper = domainToScraper[domain];
        } else if ('default' in domainToScraper) {
            scraper = domainToScraper['default'];
        } else {
            console.log(`Got url:${url} with domain ${domain} with no matching scraper task`);
            continue;
        }

        if (scraper in scraperToUrls) {
            scraperToUrls[scraper].push(request);
        } else {
            scraperToUrls[scraper] = [request];
        }
    }

    const { datasetId } = Apify.getEnv();
    const mustHaveDate = false;
    for (var task of Object.keys(scraperToUrls)) {
        const startUrls = scraperToUrls[task];
        const taskInput = {
            articleUrls,
            bubbleEndpoint,
            apiEndpoint,
            gsheetsEndpoint,
            datasetId,
            mustHaveDate
        };
        console.log(`Starting task: ${task}...`);
        for (j in startUrls) {
            console.log(j, startUrls[j]['url']);
        }
        result = await Apify.callTask(task, taskInput);
        console.log(`Finished task: ${task} with result:`);
    }
    console.log('All tasks finished.');
});

parseDomain = (url) => {
    if (!url) return null;
    const parsed = urlLib.parse(url);
    if (parsed && parsed.host) {
        return parsed.host.replace('www.', '');
    }
};
