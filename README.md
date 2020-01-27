# Google Local Result Scrapper
This script scrapes google local search result for name, category, phone number, location and website then save the record to a JSON file.

This can be particularly useful to get leads in a location, or as a data gathering tool.

<img src="https://res.cloudinary.com/bwahab/image/upload/v1580064129/Screenshot_from_2020-01-26_19-37-15.png"/>

## Getting Started
These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- An IDE of choice of your choice e.g [Visual Studio Code](https://code.visualstudio.com/)
- Node.js (minimum Node v7.6.0) 
- Basic understanding JavaScript (ES6)

### Clone the project
- `git clone https://github.com/03balogun/google_local_result_scrapper.git`
- Install the project dependencies by running `npm install`
- Modify the search query in `example.js` e.g. I.T Companies in Nigeria
- In your command line run `node example.js` to begin scrapping the search result.

### GoogleLocalResultScrapper `class`

The `GoogleLocalResultScrapper` class handles all the operation of visiting google entering the search query and saving the result to JSON file.


- `initPuppeteer` An async method which starts the browser using puppeteer and opens a new window where all our operation will happen.

    **Params** 
    - **headless** *Boolean* to run puppeteer in headless mode or not. The default value *true* setting this to false will open the chrome browser while performing the operation.

- `visitGoogle` Async method which takes to parameters the search query and result page limit. This method is responsible for visiting google, scraping the result then returns an array of object e.g `[{name, category, phone_number, location, website}]`
    
    **Params**
    - **searchQuery** *String* The Query to search for. e.g Schools in Lekki
    - **resultPageLimit** *Number* Used to limit the number of page to scrape data from
    
    **Return**
    
    This method returns a promise that resolves into an *Array* of *Objects* in this format [{name, category, phone_number, location, website}]
    
    
- `saveAsJson` This async function can be used to save the result of `visitGoogle` into a JSON file. It requires a single parameter which is an Object which must include the property records and file_name.

    **Params**
    
    - *Object* `{records: Array, file_name: String}`
    
- `logDataStats` A static method which can be used to get the statistics of the search result. This method logs the result stats to console in tabular form.
    ```
    {
        total_records,
        total_records_with_phone,
        total_records_with_website,
        total_categories
    }
    ```

    **Params**
    
    - **records** Array the result of `visitGoogle` 
    
 - `closeBrowser` Closes the browser gracefully
 
 # Example Usage
 
 
 ### Example 1
 
 The code snippet below searches for all companies in Lekki, Lagos Nigeria the save the record to a JSON file. 
 
```
const GoogleLocalResultScrapper = require('./GoogleLocalResultScrapper');

(async ()=>{
    const bot = new GoogleLocalResultScrapper();

    try {
        await bot.initPuppeteer(false);

        const query = 'Companies in Lekki';

        const records = await bot.visitGoogle(query, 1);

        await bot.saveAsJson({records, file_name: query});

        GoogleLocalResultScrapper.logDataStats(records);

    }catch (e) {
        console.error(e)
    }
    await bot.closeBrowser();

})();
```
### Example 2

This example searches for all companies for each Local Government Area of Lagos, Nigeria.

```
const GoogleLocalResultScrapper = require('./GoogleLocalResultScrapper');

/**
 * This example searches for all companies in each local government in Nigeria.
 */

(const GoogleLocalResultScrapper = require('./GoogleLocalResultScrapper');
 
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


```


# Built With
- [Node.js](https://nodejs.org/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine. 
- [Puppeteer](https://pptr.dev/) - Headless Chrome Node.js API.
- [Cheerio](https://cheerio.js.org/) - Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
