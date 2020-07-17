const Apify = require('apify');
const urlLib = require('url');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const {
        urls,
        domainToScraper,
        apiEndpoint
    } = input;

    console.log("Got the following urls as input:");
    console.log(urls);

    var scraperToUrls = {};
    for (const url of urls) {
        const request = {
            'url': url,
            'userData': {
                'label': 'ARTICLE'
            }
        };
        var scraper = null;
        const domain = parseDomain(url);
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
    for (var task of Object.keys(scraperToUrls)) {
        const startUrls = scraperToUrls[task];
        const taskInput = {
            startUrls,
            apiEndpoint,
            datasetId
        };
        console.log(`Starting task: ${task}...`);
        result = await Apify.callTask(task, taskInput);
        console.log(`Finished task: ${task} with result:`);
        console.log(result);
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
