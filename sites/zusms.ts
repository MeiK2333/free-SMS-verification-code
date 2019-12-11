import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'

async function filterRequest(page: puppeteer.Page) {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        const filters = [
            'jquery.com',
            'jsdelivr.net',
            'bootcss.com',
            'ifreesite.com',
            'sohu.com',
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

export class ZuSms implements Site {
    name = 'zusms'
    async list(): Promise<Array<Phone>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto('https://zusms.com/phone/china')

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
                    phone_number: phone_number.substr(4),
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
            //@ts-ignore
            const list = window.__NUXT__.state.mobile.freeMessages
            for (let i = 0; i < list.length; i++) {
                const item = list[i]
                if (item['deleted']) {
                    continue
                }
                const dt = new Date(item['update_at'])
                data.push({
                    send_phone: item['from'],
                    recv_time: `${dt.getFullYear().toString().padStart(4, '0')}-${
                        dt.getDate().toString().padStart(2, '0')}-${
                        (dt.getMonth() + 1).toString().padStart(2, '0')} ${
                        dt.getHours().toString().padStart(2, '0')}:${
                        dt.getMinutes().toString().padStart(2, '0')}:${
                        dt.getSeconds().toString().padStart(2, '0')}`,
                    text: item['message']
                })
            }
            return data
        })
        await page.close()
        return data
    }
}
