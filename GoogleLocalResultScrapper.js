const $ = require('cheerio');
const fs = require('fs');

class GoogleLocalResultScrapper {

    constructor() {
        this.records = [];
        this.resultPage = 1;
    }

    /**
     * @description opens the browser, a new window and set all important options
     * @param {Boolean} headless maybe to run the browser in headless mode or not
     * @return {Promise<GoogleLocalResultScrapper>}
     */
    async initPuppeteer(headless = true) {
        const puppeteer = require('puppeteer');

        const PUPPETEER_OPTIONS = {
            headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        };
        this.browser = await puppeteer.launch(PUPPETEER_OPTIONS);

        // opens new browser window
        this.page = await this.browser.newPage();

        const BROWSER_EXTRA_HEADERS = {'Accept-Language': 'en-NG,en-GB;q=0.9,en;q=0.8'};
        const BROWSER_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
        const BROWSER_VIEW_PORT = {width: 1500, height: 764};

        await this.page.setExtraHTTPHeaders(BROWSER_EXTRA_HEADERS);
        await this.page.setUserAgent(BROWSER_USER_AGENT);
        this.page.setViewport(BROWSER_VIEW_PORT);
    }

    /**
     * @description visits google.com, enters the search query and returns the result
     * @param {String} searchQuery the query to search e.g. Schools in Lekki
     * @param {Number} resultPageLimit specify this to limit the number pages to read result from
     * @return {Promise<Array>} array of object e.g {name, category, phone_number, location, website}
     */
    async visitGoogle(searchQuery, resultPageLimit = 0) {
        try {

            const PAGE_URL = 'https://www.google.com';
            const PAGE_OPTIONS = {timeout: 60000};

            // Goto google.com
            await this.page.goto(PAGE_URL, PAGE_OPTIONS);

            // wait for random amount of time. Useful so google spamming algorithm doesn't detect our pattern :)
            await this.page.waitFor(1250 + Math.floor(Math.random() * 250));

            // Select the search input field,
            await this.page.click("input[name=\"q\"]");

            // Enter the search query
            await this.page.keyboard.type(searchQuery);

            // Press the enter key to initiate search
            await this.page.keyboard.type(String.fromCharCode(13));

            // Wait till page finish loading
            await this.page.waitForNavigation();

            // Wait for random amount of time :)
            await this.page.waitFor(1250 + Math.floor(Math.random() * 250));

            // Click the view more button
            await this.page.click(".cMjHbjVt9AZ__button");

            // wait till page finish loading
            await this.page.waitForNavigation();

            // wait for random amount of time
            await this.page.waitFor(1250 + Math.floor(Math.random() * 250));

            // Get the page content in raw html, so we can access it with the jquery guy $
            const pageContent = await this.page.content();

            // proceed to the next method to read or data from the DOM and write it to a file
            return await this._readData(pageContent, resultPageLimit);

        } catch (error) {
            throw error;
        }
    }

    /**
     * @description Extracts the data from the page to extract data from
     * @param {String} pageContent HTML content of the page
     * @param {Number} resultPageLimit The number of pages to scrap result from
     * @return {Promise<Array>} array of object e.g {name, category, phone_number, location, website}
     * @private
     */
    async _readData(pageContent, resultPageLimit) {

        // Parse the page content with cheerio
        const allResults = $(pageContent).find('div[jsname="GZq3Ke"]');

        // Loop through all results, and format the data.
        if (allResults.length) {
            for (let i = 0; i < allResults.length; i++) {

                // get the of the current result card.
                const cid = $(allResults[i]).find('a.C8TUKc').attr('data-cid');

                // Click the current card to get the details
                await this.page.click(`a[data-cid="${cid}"]`);

                // Wait for at least 1.5secs for the result modal to load
                await this.page.waitFor(1500 + Math.floor(Math.random() * 250));

                const updatedPagedContent = await this.page.content();

                const detailCard = $(updatedPagedContent).find('div[id*="akp_tsuid"]');

                // Get the record name
                const name = detailCard.find('div[data-attrid="title"]').text();

                // Get the record category, could be high record driving record e.t.c
                let category = detailCard.
                find('.YhemCb:nth-child(2)').text() || detailCard.find('.YhemCb:nth-child(1)').text();

                // Get the record location
                const location = $(detailCard.find('span.LrzXr')[0]).text();

                // Get the phone number
                const phone_number = detailCard.find('span.LrzXr.zdqRlf.kno-fv').text();

                // Get the records website
                const website = detailCard.find('a.CL9Uqc.ab_button').attr('href') || '';

                // Add the record to the array of records for the current local government area
                const record = {name, category, phone_number, location, website};
                this.records.push(record);
            }
        }

        // Get the next button
        const nextButton = await this.page.$('a[id="pnnext"]');

        // Check the if the button exists i.e we are not on the last page of the result
        if (nextButton) {

            // If the set result limit not equal result page continue scrapping
            if (resultPageLimit && (resultPageLimit !== this.resultPage)) {
                // If it does, click the next button
                await nextButton.click();

                // But for now wait for 2.5second for the next page result to load
                await this.page.waitFor(1500);
                this.resultPage += 1;

                // Re-run the process all over again
                await this._readData(await this.page.content(), resultPageLimit)
            }
        }

        return this.records;
    }

    /**
     * @description This method saves the result to a file
     * @param {Array} records The record to be saved inform of array
     * @param {String} file_name The name of the file
     * @return {Promise<String>} The file name
     */
    async saveAsJson({records, file_name}) {
        return new Promise((resolve, reject) => {
            // convert file name to lowercase and replace all white space with underscore
            const newFileName = file_name.toLowerCase()
                .replace(/ /ig, "_");

            fs.writeFile(`${newFileName}.json`, JSON.stringify(records), 'utf8', (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(`${newFileName}.json`);
                }
            });
        })
    }

    /**
     * @description Reads the data from a JSON file
     * @param {String} fileName the name of the file to read
     * @return {Promise<Array/Object>} The parsed JSON
     */
    async readJsonData(fileName) {
        return new Promise((resolve, reject) => {

            fs.readFile(fileName, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(data));
                }
            })

        })
    }

    static logDataStats(records) {

        // Get total records
        const total_records = records.length;

        const total_records_with_phone = records.filter(record => (record.phone_number.length)).length;

        const total_records_with_website = records.filter(record => (
            record.website !== '#' && record.website.length)).length;

        const total_categories = [...new Set(records.map(item => item.category))].length;


        console.table({
            total_records,
            total_records_with_phone,
            total_records_with_website,
            total_categories
        });
    }

    async closeBrowser() {
        await this.browser.close();
    }

}

module.exports = GoogleLocalResultScrapper;
