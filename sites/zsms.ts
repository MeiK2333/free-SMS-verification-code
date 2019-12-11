import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'
import axios from 'axios'

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

export class ZSms implements Site {
    name = 'z-sms'
    async list(): Promise<Array<Phone>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        // await filterRequest(page)
        await page.goto('http://www.z-sms.com/')

        const data = await page.evaluate((site_name) => {
            const div = document.getElementsByClassName('col-md-4')
            const data = []
            for (let i = 0; i < div.length; i++) {
                const phone_number = div[i].querySelector('p').innerText.trim()
                if (!phone_number.startsWith('+86')) {
                    continue
                }
                data.push({
                    phone_number: phone_number.substr(4, 11),
                    detail_url: document.cookie,
                    site: site_name
                })
            }
            return data
        }, this.name)
        await page.close()
        return data
    }
    async detail(phone: Phone): Promise<Array<SMS>> {
        const cookie = phone.detail_url
        const { data } = await axios.post('http://www.z-sms.com/admin/redis/smslistSB.php', `PhoNum=${phone.phone_number}`,
            {
                headers: {
                    "Cookie": cookie,
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                }
            })
        let rData = []
        data.forEach(item => {
            rData.push({
                send_phone: item['smsNumber'],
                recv_time: item['smsDate'],
                text: item['smsContent']
            })
        });
        return rData
    }
}
