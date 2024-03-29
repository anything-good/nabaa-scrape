const puppeteer = require('puppeteer');

module.exports = async function scrape(productName) {
  productName = productName.replace(/ /g, '+'); // This line replaces spaces with +
  console.log('scrape', productName);
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
  const page = await browser.newPage();

  // Go to the specified URL
  await page.goto(`https://store.alnabaa.com/search?q=${encodeURIComponent(productName)}`);

  try {
    // Wait for the div with the specified class to be visible
    await page.waitForSelector('.boost-pfs-filter-products.product-list.product-list--collection');

    // Get the first product element
    const productElement = await page.$('.boost-pfs-filter-products.product-list.product-list--collection .product-item');
    if (!productElement) {
      return { publicName: "not found", publicPrice: "not found" };
    }

    // Extract name and price
    const publicName = await productElement.$eval('.product-item__title', element => element.textContent.trim());
    const publicPrice = await productElement.$eval('.product-item__price-list', element => element.textContent.trim());

    await browser.close();
    return { publicName, publicPrice };
  } catch (error) {
    await browser.close();
    return { error: error.message };
  }



};


