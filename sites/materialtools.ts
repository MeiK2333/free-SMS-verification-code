import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'

async function filterRequest(page: puppeteer.Page) {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        const filters = [
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

export class Materialtools implements Site {
    name = 'materialtools'
    async list(): Promise<Array<Phone>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto('https://www.materialtools.com/')

        let data = await this.parse(page)
        const page_size = await page.evaluate(() => {
            const lis = document.querySelectorAll('ul')[3].querySelectorAll('li')
            const page_size = Number(lis[lis.length - 2].innerText.trim())
            return page_size
        })
        for (let i = 2; i <= page_size; i++) {
            await page.goto(`https://www.materialtools.com/?page=${i}`)
            data = data.concat(await this.parse(page))
        }
        await page.close()
        return data
    }
    async detail(phone: Phone): Promise<Array<SMS>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto(phone.detail_url)
        const data = await page.evaluate(() => {
            const div = document.getElementsByClassName('sms-content-table')[1]
            const tr_list = div.querySelectorAll('tr')
            const data = []
            for (let i = 1; i < tr_list.length; i++) {
                const tr = tr_list[i]
                const td_list = tr.querySelectorAll('td')
                data.push({
                    sms_id: td_list[0].innerText.trim(),
                    send_phone: td_list[1].innerText.trim(),
                    text: td_list[2].innerText.trim(),
                    recv_time: td_list[3].innerText.trim(),
                })
            }
            return data
        })
        await page.close()
        return data
    }
    async parse(page: puppeteer.Page): Promise<Array<Phone>> {
        const data = await page.evaluate((site_name) => {
            const data = []
            const sms_list = document.getElementsByClassName('sms-number-list');
            for (let i = 0; i < sms_list.length; i++) {
                const phone_number_div = sms_list[i].querySelector('.phone_number-text')
                if (!phone_number_div) {
                    continue
                }
                const small = phone_number_div.querySelector('small')
                if (!small || small.innerText.trim() !== '+86') {
                    continue
                }
                const phone_number = phone_number_div.querySelector('h3').innerText.trim()
                const detail_url = sms_list[i].querySelector('.sms-number-read').querySelector('a').href
                data.push({
                    phone_number: phone_number,
                    detail_url: detail_url,
                    site: site_name
                })
            }
            return data
        }, this.name)
        return data
    }
}