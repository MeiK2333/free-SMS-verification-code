import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'

async function filterRequest(page: puppeteer.Page) {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        const filters = [
            'ifreesite.com',
            'bootstrapcdn.com',
            'cloudflare.com',
            'qhimg.com',
            'qhres.com',
            'ampproject.org',
            'addthis.com',
            'bdstatic.com',
            '360.cn',
            'cnzz.com',
            'moatads.com',
            'mmstat.com',
            'gstatic.com',
            'static.pdflibr.com',
            'googlesyndication.com',
            'googletagmanager.com',
            'google.com',
            'doubleclick.net',
            'google-analytics.com',
            'googletagservices.com',
            'googleapis.com',
        ];
        const shouldAbort = filters.some((urlPart) => url.includes(urlPart));
        if (shouldAbort) request.abort();
        else {
            request.continue();
        }
    });
}

export class Cnwml implements Site {
    name = 'cnwml'
    async list(): Promise<Array<Phone>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto('https://www.cnwml.com/')

        const data = await page.evaluate((site_name) => {
            const div = document.getElementsByClassName('number-boxes-item')
            const data = []
            for (let i = 0; i < div.length; i++) {
                const phone_number = div[i].querySelector('h4').innerText.trim()
                if (!phone_number.startsWith('+86')) {
                    continue
                }
                const detail_url = div[i].querySelector('a').href
                data.push({
                    phone_number: phone_number.substr(3),
                    detail_url: detail_url,
                    site: site_name
                })
            }
            return data
        }, this.name)
        await page.close()
        return data
    }
    async detail(phone: Phone): Promise<Array<SMS>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto(phone.detail_url)

        const data = await page.evaluate(() => {
            const data = []
            const tr_list = document.getElementsByClassName('list-item')
            for (let i = 3; i < tr_list.length; i++) {
                const tr = tr_list[i]
                const send_phone = tr.querySelector('h3').innerText.trim()
                const recv_time = tr.querySelector('script').innerText.match(/diff_time\("(.*)"\)/)[1]
                //@ts-ignore
                const text = tr.querySelector('.list-item-content').innerText.trim()
                data.push({
                    send_phone: send_phone,
                    recv_time: recv_time,
                    text: text
                })
            }
            return data
        })
        await page.close()
        return data
    }
}
