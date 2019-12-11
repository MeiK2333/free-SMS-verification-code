import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'

async function filterRequest(page: puppeteer.Page) {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        const filters = [
            'baidu.com',
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

export class YinSiDuanXin implements Site {
    name = 'yinsiduanxin'
    async list(): Promise<Array<Phone>> {
        const browser = await Browser.getBrowser()
        const page = await browser.newPage()
        await filterRequest(page)
        await page.goto('https://www.yinsiduanxin.com/index.html')

        let data = await this.parse(page)
        const page_size = await page.evaluate(() => {
            const lis = document.querySelectorAll('ul')[2].querySelectorAll('li')
            const page_size = Number(lis[lis.length - 2].innerText.trim())
            return page_size
        })
        for (let i = 2; i <= page_size; i++) {
            await page.goto(`https://www.yinsiduanxin.com/dl/${i}.html`)
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
            const data = []
            //@ts-ignore
            const tr_list = document.querySelectorAll('tr')
            for (let i = 0; i < tr_list.length; i++) {
                const item = tr_list[i]
                const tds = item.querySelectorAll('td')
                if (tds.length < 3) {
                    continue
                }
                data.push({
                    send_phone: tds[0].innerText.trim(),
                    text: tds[1].innerText.trim(),
                    recv_time: tds[2].innerText.trim(),
                })
            }
            return data
        })
        await page.close()
        return data
    }
    async parse(page: puppeteer.Page): Promise<Array<Phone>> {
        const data = await page.evaluate((site_name) => {
            const div = document.getElementsByClassName('layui-col-lg4')
            const data = []
            for (let i = 0; i < div.length; i++) {
                //@ts-ignore
                if (!div[i].querySelector('.layui-card-header') || div[i].querySelector('.layui-card-header').innerText.trim() !== '接收中') {
                    continue
                }

                const a = div[i].querySelector('a')
                const phone_number = a.innerText
                if (!phone_number.startsWith('+86')) {
                    continue
                }
                const detail_url = a.href
                data.push({
                    phone_number: phone_number.substr(4),
                    detail_url: detail_url,
                    site: site_name
                })
            }
            return data
        }, this.name)
        return data
    }
}
