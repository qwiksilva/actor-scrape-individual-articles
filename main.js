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

    urls= ['https://rebusinessonline.com/general-contractor-survey-27-percent-of-firms-report-layoffs-since-coronavirus-outbreak/',
            'https://rebusinessonline.com/outlook-is-bright-for-student-housing-in-post-covid-19-world/',
            'https://commercialobserver.com/2020/03/la-imposes-freeze-on-most-of-its-rental-stock/',
            'https://commercialobserver.com/2020/04/preventing-the-pending-collapse-of-the-real-estate-market/'];

    domainToScraper = {
        "commercialobserver.com":"qwiksilva/commercialobserver",
        "rebusinessonline.com":"qwiksilva/rebusinessonline"
    };

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
