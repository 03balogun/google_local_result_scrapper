const GoogleLocalResultScrapper = require('./GoogleLocalResultScrapper');

/**
 * This example searches for all companies in each local government in Nigeria.
 */

(async ()=>{
    const bot = new GoogleLocalResultScrapper();

    try {
        await bot.initPuppeteer();

        const localGovernments = [
            "Ajeromi-Ifelodun",
            "Alimosho",
            "Amuwo-Odofin",
            "Apapa",
            "Badagry",
            "Epe",
            "Eti Osa",
            "Ibeju-Lekki",
            "Ifako-Ijaiye",
            "Ikeja",
            "Ikorodu",
            "Kosofe",
            "Lagos Island",
            "Lagos Mainland",
            "Mushin",
            "Ojo",
            "Oshodi-Isolo",
            "Shomolu",
            "Surulere"
        ];

        let records = {};

        for (let i = 0; i < localGovernments.length; i++) {

            const currentLga = localGovernments[i];

            const query = `Companies in ${currentLga}`;
            console.log(`Currently Searching::: ${query}`);

            const data = await bot.visitGoogle(query, 1);

            records[currentLga] = data;

            console.log(records[currentLga]);

            GoogleLocalResultScrapper.logDataStats(data)
        }

        await bot.saveAsJson({
            records,
            file_name: 'companies in lagos'
        });

    }catch (e) {
        console.error(e)
    }

    await bot.closeBrowser();
})();
