const fs = require('fs');
const puppeteer = require('puppeteer');

async function run(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.chainabuse.com/reports');


// Iterate over the reports and extract the data
  
  const reports = await page.evaluate(() => {
    const reportElements = Array.from(
      document.querySelectorAll('.create-ResultsSectionLayout__results .create-ScamReportCard')
    ); //since all the keys are present inside the above two divs we'll store their information in this array
  
    return reportElements.map((element) => {
      const hashSelector = '.create-ReportedSection .create-ResponsiveAddress__text';
      const tagSelector = '.create-ScamReportCard__content .create-ScamReportCard__category-section p';
      const descriptionSelector = '.create-ScamReportCard__content .create-ScamReportCard__body .create-ScamReportCard__preview-description-wrapper p';
      const timeSelector = '.create-ScamReportCard__body .create-ScamReportCard__submit-comments-info .create-ScamReportCard__submitted-info > span:nth-child(3)';
      //stores appropriate selectors for required key

      const hashElement = element.querySelector(hashSelector);
      const tagElement = element.querySelector(tagSelector);
      const descriptionElement = element.querySelector(descriptionSelector);
      const timeElement = element.querySelector(timeSelector);
      //elements created by querySelector to the appropriate selector

      let AddedInChainAbuse = '';
    if (timeElement) {
      const relativeTime = timeElement.innerText.trim();
      const [amount, unit] = relativeTime.split(' ');
      if (!isNaN(amount)) {
        const currentDate = new Date();
        if (unit.includes('minute')) {
          const minutesAgo = parseInt(amount, 10);
          currentDate.setMinutes(currentDate.getMinutes() - minutesAgo);
        } else if (unit.includes('hour')) {
          const hoursAgo = parseInt(amount, 10);
          currentDate.setHours(currentDate.getHours() - hoursAgo);
        } else if (unit.includes('second')) {
          const secondsAgo = parseInt(amount, 10);
          currentDate.setSeconds(currentDate.getSeconds() - secondsAgo);
        }
        AddedInChainAbuse = currentDate.toISOString();
      }
    }//to calculate time we'll subtract the no. of minutes to current time which can be found by Date() function
     const hash = hashElement ? hashElement.innerText.trim() : '';
     const type = hash ? 'BTC' : '';
     //when hash value is empty return empty type key else return BTC 

      return {
        "hash": hashElement ? hashElement.innerText.trim() : '',
        "AddedInChainAbuse": AddedInChainAbuse,
        "Description": descriptionElement ? descriptionElement.innerText.trim() : '',
        "Source": "ChainAbuse",
        "Tag": tagElement ? tagElement.innerText.trim() : '',
         "Type": type,
      };
    });
  });
  
  console.log(reports);
  
  
  
  
  //Save data to JSON file
  fs.writeFile('reports.json', JSON.stringify(reports), (err) => {
    if(err) throw err;
    console.log("File saved");
  });

  await browser.close();
}

run();