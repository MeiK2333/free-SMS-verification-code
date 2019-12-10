import * as puppeteer from 'puppeteer'

export interface Phone {
    phone_number: string
    detail_url: string
    site: string
}

export interface SMS {
    phone: string
    text: string
    recv_time: string
    send_phone: string
}

export interface Site {
    name: string
    list(): Promise<Array<Phone>>
    detail(phone: Phone): Promise<Array<SMS>>
}

export interface SiteState {
    site: Site
    list: Array<Phone>
    updated_at: Date
}

export const Global = new class {
    sitesState: Array<SiteState>
    constructor() {
        this.sitesState = []
    }
    pushSite(site: Site) {
        this.sitesState.push({
            site: site,
            list: [],
            updated_at: new Date("1980-01-01T00:00:00.000Z")
        })
    }
}

class BrowserCls {
    browser: puppeteer.Browser
    async getBrowser(): Promise<puppeteer.Browser> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
            })
        }
        return this.browser
    }
}

export const Browser = new BrowserCls()
