import { Materialtools } from './sites/materialtools'
import { Becmd } from './sites/becmd'
import { Global } from './sites/models'

import * as http from 'http'
import * as url from "url"

Global.pushSite(new Materialtools())
Global.pushSite(new Becmd())

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
        resp.writeHead(404)
        resp.write('page not found')
    }
    resp.end()
}).listen(8080)
