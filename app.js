const puppeteer = require('puppeteer');
const fs = require('fs');
const randomUseragent = require('random-useragent');

const uas = randomUseragent.getRandom(function(ua) {
	return ua.browserName === 'Firefox';
});

const searchDomain = ['norenthermal.com', 'norencts.com'];
const searchTerms = 'eco+friendly+thermal+management,eco+friendly+heat+exchanger,eco+friendly+thermal+solution,eco+friendly+enclosure+cooling,below+ambient+thermal+management,below+ambient+heat+exchanger,below+ambient+thermal+solution,below+ambient+enclosure+cooling,heat+pipe+thermal+management,heat+pipe+heat+exchanger,heat+pipe+thermal+solution,heat+pipe+enclosure+cooling,custom+thermal+management,custom+heat+exchanger,custom+thermal+solution,custom+enclosure+cooling,air+to+air+thermal+management,air+to+air+thermal+solution,air+to+air+enclosure+cooling,air+to+water+thermal+management,air+to+water+heat+exchanger,air+to+water+thermal+solution,air+to+water+enclosure+cooling,hazardous+location+thermal+management,hazardous+location+heat+exchanger,hazardous+location+thermal+solution,hazardous+location+enclosure+cooling,heat+sink+thermal+management,heat+sink+heat+exchanger,heat+sink+thermal+solution,heat+sink+enclosure+cooling,cold+plate+thermal+management,cold+plate+heat+exchanger,cold+plate+thermal+solution,cold+plate+enclosure+cooling,oil+and+gas+thermal+management,oil+and+gas+heat+exchanger,oil+and+gas+thermal+solution,oil+and+gas+enclosure+cooling,electrical+panel+thermal+management,electrical+panel+heat+exchanger,electrical+panel+thermal+solution,electrical+panel+enclosure+cooling,cost+effective+thermal+management,cost+effective+heat+exchanger,cost+effective+thermal+solution,cost+effective+enclosure+cooling,filter+fan+thermal+management,filter+fan+thermal+solution,filter+fan+enclosure+cooling,plastic+injection+mold+cooling,plastic+rotational+mold+cooling,plastic+blow+mold+cooling,plastic+extrusion+mold+cooling,plastic+thermal+management,plastic+thermal+solution,NEMA+12+thermal+management,NEMA+12+heat+exchanger,NEMA+12+thermal+solution,NEMA+12+enclosure+cooling,NEMA+4X+thermal+management,NEMA+4X+heat+exchanger,NEMA+4X+thermal+solution,NEMA+4X+enclosure+cooling';
const searchArray = searchTerms.split(',');

(async () => {

	const args = [];
	
	const options = {
		args,
		headless: false
	}

	const browser = await puppeteer.launch(options);
	
	const page = await browser.newPage();
		
	for (var x = 0; x < searchArray.length; x++) {

		var currentPage = 0,
			resultFound = -1,
			websiteIndex,
			recaptchaFlag = false;
		
		while (resultFound === -1 && currentPage <= 100) {
		
			console.log(x, currentPage, searchArray[x]);

			if (!recaptchaFlag) {
				await page.goto('https://www.google.com/search?q=' + searchArray[x] + '&start=' + currentPage);
			}

			// Extract page results
			try {

				var result = await page.evaluate(function(searchDomain) {

					var results = {
						'status': -1
					};

					if (document.getElementById('captcha-form') !== null) {
						results.status = -2;
						return results;
					}
					
					var children = document.getElementsByClassName('g');
					
					for (var i = 0; i < children.length; i++) {
						
						for (var x = 0; x < searchDomain.length; x++) {
						
							if (children[i].textContent.includes(searchDomain[x])) {
								results.status = i+1;
								results.website = x;
								return results;
							}
							
						}
					
					}
					
					return results;

				}, searchDomain);			

				if (result.status == -2) {

					// Recatpcha found
					console.log('Recatpcha found. Sleeping.');
					recaptchaFlag = true;
					await new Promise(resolve => setTimeout(resolve, 5000));

				} else if (result.status == -1) {

					currentPage += 10;
					recaptchaFlag = false;

				} else {

					resultFound = result.status;
					websiteIndex = result.website;
					recaptchaFlag = false;

				}

			} catch (error) {

				// If we hit an error, it's most likely because we answered recaptcha.
				console.log(error);
				recaptchaFlag = false;

			}
		
		}

		var outputMessage = '';
		
		if (resultFound === -1) {
			outputMessage = 'Not found in first 100 results,';
		} else {
			outputMessage = 'Page:' + (currentPage / 10 + 1) + ' Position:' + resultFound + ' Domain:' + searchDomain[websiteIndex] + ',';
		}	
		
		fs.writeFile('./output.txt', outputMessage, { flag: 'a+' }, err => {
			if (err) {
				console.log(err);
				return;
			}
		});
	
	}

	await browser.close();
})();
