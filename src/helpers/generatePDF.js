const puppeteer = require('puppeteer');
require('dotenv').config()


const htmlToPDF = async (html, responsePath, numberTicket) => {

    let production = process.env.PRODUCTION

    // launch a new chrome instance
    let browser;

    browser = await puppeteer.launch({
        headless: true,
        executablePath: '../../usr/bin/chromium-browser'
    })

    // if(production){
    //     browser = await puppeteer.launch({
    //         headless: true,
    //         executablePath: '/usr/bin/chromium-browser'
    //     })
    // }else{
    //     browser = await puppeteer.launch({
    //         headless: true
    //     })
    // }
  
    // create a new page
    const page = await browser.newPage();

    //let html = fs.readFileSync('./src/html-vale-salida.html', 'utf8')
    

    await page.setContent(html);


    await page.pdf({ 
        path: responsePath + '/ticket_salida_'+numberTicket+'.pdf', 
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true
    });

    await browser.close();

}



module.exports = { htmlToPDF }