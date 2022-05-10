const GoogleLocalResultScrapper = require('./GoogleLocalResultScrapper');
const args = require('minimist')(process.argv.slice(2));

/**
 * This example searches for companies in Lekki, Lagos Nigeria.
 */

(async ()=>{
    const bot = new GoogleLocalResultScrapper();

    try {
        await bot.initPuppeteer(false);

        const query = args.q;
	
	const pages = args.p;

        const records = await bot.visitGoogle(query, pages);

	await bot.saveAsCSV({records, file_name: query});

        //GoogleLocalResultScrapper.logDataStats(records);

    }catch (e) {
        console.error(e)
    }
    await bot.closeBrowser();

})();
