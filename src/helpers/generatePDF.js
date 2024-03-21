const puppeteer = require('puppeteer');

const htmlToPDF = async () => {

    // launch a new chrome instance
    const browser = await puppeteer.launch({
        headless: true
    })
    // create a new page
    const page = await browser.newPage();

    const html = ''

    await page.setContent('<h1>Hello, Puppeteer!</h1><p>Esto es un parrafo</p>');


    await page.pdf({ path: 'example.pdf', format: 'A4' });

    await browser.close();

}



module.exports = { htmlToPDF }