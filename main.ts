import { Materialtools } from './sites/materialtools'
import { Becmd } from './sites/becmd'
import { Cnwml } from './sites/cnwml'
import { ZSms } from './sites/zsms'
import { XNSms } from './sites/xnsms'
import { ZuSms } from './sites/zusms'
import { YinSiDuanXin } from './sites/yinsiduanxin'
import { Global } from './sites/models'

import * as http from 'http'
import * as url from "url"
import { promises } from 'fs'

// Global.pushSite(new Materialtools())
Global.pushSite(new Becmd())
Global.pushSite(new Cnwml())
Global.pushSite(new ZSms())
Global.pushSite(new XNSms())
Global.pushSite(new ZuSms())
Global.pushSite(new YinSiDuanXin())

http.createServer(async function (req, resp) {
    const parsed = url.parse(req.url, true)
    const path = parsed.pathname
    resp.writeHead(200, { 'Content-type': 'application/json; charset=utf-8' })
    if (path === '/sites') {
        const data = []
        Global.sitesState.forEach(siteState => {
            data.push({
                site: siteState.site.name,
                updated_at: siteState.updated_at
            })
        });
        resp.write(JSON.stringify(data))
    } else if (path === '/update') {
        const site = parsed.query['site']
        for (let i = 0; i < Global.sitesState.length; i++) {
            if (Global.sitesState[i].site.name === site) {
                const list = await Global.sitesState[i].site.list()
                Global.sitesState[i].list = list
                Global.sitesState[i].updated_at = new Date()
                resp.write(JSON.stringify(list))
                break
            }
        }
    } else if (path === '/phones') {
        let data = []
        for (let i = 0; i < Global.sitesState.length; i++) {
            data = data.concat(Global.sitesState[i].list)
        }
        resp.write(JSON.stringify(data))
    } else if (path === '/sms') {
        const site = parsed.query['site']
        const phone_number = parsed.query['phone']
        for (let i = 0; i < Global.sitesState.length; i++) {
            if (Global.sitesState[i].site.name === site) {
                let siteState = Global.sitesState[i]
                for (let j = 0; j < siteState.list.length; j++) {
                    if (siteState.list[j].phone_number === phone_number) {
                        const data = await siteState.site.detail(siteState.list[j])
                        resp.write(JSON.stringify(data))
                        break
                    }
                }
                break
            }
        }
    } else {
        var staticPath = 'html/dist'
        var filePath = staticPath + path;
        if (path === '/')
            filePath = `${staticPath}/index.html`

        var extname = filePath.split('.').pop()
        var contentType = 'text/html'
        switch (extname) {
            case 'js':
                contentType = 'text/javascript'
                break
            case 'css':
                contentType = 'text/css'
                break
            case 'json':
                contentType = 'application/json'
                break
            case 'png':
                contentType = 'image/png'
                break
            case 'jpg':
                contentType = 'image/jpg'
                break
            case 'ico':
                contentType = 'image/vnd.microsoft.icon'
                break
            case 'wav':
                contentType = 'audio/wav'
                break
        }
        resp.writeHead(200, { 'Content-type': `${contentType}; charset=utf-8` })
        let content
        try {
            content = await promises.readFile(filePath)
        } catch (e) {
            if (e.code === 'ENOENT') {
                content = await promises.readFile(`${staticPath}/index.html`)
            } else {
                resp.writeHead(500)
            }
        }
        resp.write(content)
    }
    resp.end()
}).listen(8080)
