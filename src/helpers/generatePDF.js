const puppeteer = require('puppeteer');
const fs = require('fs');


const htmlToPDF = async (html) => {

    // launch a new chrome instance
    const browser = await puppeteer.launch({
        headless: true
    })
    // create a new page
    const page = await browser.newPage();

    //let html = fs.readFileSync('./src/html-vale-salida.html', 'utf8')
    

    await page.setContent(html);


    await page.pdf({ 
        path: 'example.pdf', 
        format: 'A4',
        printBackground: true
    });

    await browser.close();

}



module.exports = { htmlToPDF }