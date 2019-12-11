import { Phone, SMS, Site, Browser } from './models'
import * as puppeteer from 'puppeteer'
import axios from 'axios'

export class XNSms implements Site {
    name = 'xnsms'
    async list(): Promise<Array<Phone>> {
        const { data } = await axios.post('http://www.xnsms.com:81/test/getPhones', "", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
            }
        })
        let rData: Array<Phone> = []
        data['phones'].forEach(item => {
            if (item['code'] === '+86') {
                rData.push({
                    phone_number: item['phone'],
                    detail_url: "",
                    site: this.name
                })
            }
        });
        return rData
    }
    async detail(phone: Phone): Promise<Array<SMS>> {
        const { data } = await axios.post('http://www.xnsms.com:81/test/getPhoneData', `{"phone":"${phone.phone_number}"}`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
                    "Content-Type": "application/json",
                }
            })
        let rData: Array<SMS> = []
        data['data'].forEach(item => {
            rData.push({
                send_phone: item['smsNumber'],
                recv_time: item['smsDate'],
                text: item['smsContent']
            })
        });
        return rData
    }
}
