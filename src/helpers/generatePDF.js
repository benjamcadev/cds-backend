const puppeteer = require('puppeteer');



const htmlToPDF = async (html, responsePath, numberTicket) => {

    try {
        // launch a new chrome instance

        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']

        })


        // create a new page
        const page = await browser.newPage();

        //let html = fs.readFileSync('./src/html-vale-salida.html', 'utf8')


        await page.setContent(html);


        await page.pdf({
            path: responsePath + '/ticket_salida_' + numberTicket + '.pdf',
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        
    } catch (error) {
        console.log(error)
    }
}

const htmlToPdfEntrada = async (html, responsePath, numberTicket) => {
    
    try {
        // launch a new chrome instance

        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']

        })
        
        // create a new page

        const page = await browser.newPage();


        await page.setContent(html);

        await page.pdf({
            path: responsePath + '/ticket_entrada_' + numberTicket + '.pdf',
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();
    } catch (error) {
        console.log(error)
    }
}



module.exports = { htmlToPDF, htmlToPdfEntrada }