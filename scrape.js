puppeteer = require("puppeteer-core");

module.exports = async function scrape(productName) {
	const modifiedProductName = productName.replace(/ /g, "+"); // This line replaces spaces with +
	console.log("scrape", modifiedProductName);

	// console.log('TRYING TO FETCH BROWSER')
	// const browserFetcher = puppeteer.createBrowserFetcher();
	// const revisionInfo = await browserFetcher.download("884014");

	// console.log("revisionInfo", revisionInfo);

	const browser = await puppeteer.launch({
		executablePath: "/usr/bin/chromium",
		args: ["--no-sandbox", "--disabled-setupid-sandbox"],
	});

	const page = await browser.newPage();

	// Go to the specified URL
	await page.goto(
		`https://store.alnabaa.com/search?q=${encodeURIComponent(productName)}`,
	);

	try {
		// Wait for the div with the specified class to be visible
		await page.waitForSelector(
			".boost-pfs-filter-products.product-list.product-list--collection",
		);

		// Get the first product element
		const productElement = await page.$(
			".boost-pfs-filter-products.product-list.product-list--collection .product-item",
		);
		if (!productElement) {
			return { publicName: "not found", publicPrice: "not found" };
		}

		// Extract name and price
		const publicName = await productElement.$eval(
			".product-item__title",
			(element) => element.textContent.trim(),
		);

		const publicPrice = await productElement.$eval(
			".product-item__price-list",
			(element) => element.textContent.trim(),
		);

		// Extract images

		let publicImages = "";

		publicImages += await productElement.$eval(
			".product-item__primary-image",
			(element) => element.srcset.split(",").reverse()[0],
		);

		publicImages += ",";

		// currently only one primary image is being fetched
		publicImages += await productElement.$eval(
			".product-item__secondary-image",
			(element) => element.srcset.split(",").reverse()[0],
		);

		console.log("publicImages", publicImages);

		await browser.close();
		return { publicName, publicPrice, publicImages };
	} catch (error) {
		await browser.close();
		return { error: error.message };
	}
};
