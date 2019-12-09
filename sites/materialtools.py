"""
https://www.materialtools.com/
"""
import asyncio
from datetime import datetime
from typing import List

import aiohttp
from bs4 import BeautifulSoup

from .models import SMS, Phone, session


class Materialtools:
    async def update(self):
        site = "materialtools"

        # 首先清理该站点过往数据
        session.query(Phone).filter_by(site=site).delete()
        session.commit()
        async with aiohttp.ClientSession() as aio_session:
            # 获取页码
            async with aio_session.get(
                "https://www.materialtools.com/",
                headers={
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
                },
            ) as resp:
                text = await resp.text()
                print(text)
            page_size = int(
                BeautifulSoup(text, "html.parser")
                .find_all("ul")[-1]
                .find_all("li")[-2]
                .text.strip()
            )
            # 获取每页的数据
            for page in range(1, page_size + 1):
                async with aio_session.get(
                    f"https://www.materialtools.com/?page={page}"
                ) as resp:
                    text = await resp.text()
                soup = BeautifulSoup(text, "html.parser")
                for div in soup.find_all(class_="sms-number-list"):
                    number_div = div.find(class_="number-list-phone_number")
                    if not number_div:  # 过滤广告列
                        continue
                    small = number_div.find("small").text.strip()
                    if small != "+86":  # 过滤非大陆手机号
                        continue
                    phone_number = number_div.find("h3").text.strip()
                    read_div = div.find(class_="sms-number-read")
                    read_link = (
                        "https://www.materialtools.com" + read_div.find("a")["href"]
                    )
                    phone = (
                        session.query(Phone)
                        .filter_by(phone_number=phone_number, site=site)
                        .first()
                    )
                    if phone:  # 判断数据重复
                        continue
                    phone = Phone()
                    phone.phone_number = phone_number
                    phone.site = site
                    phone.detail_url = read_link
                    session.add(phone)
            session.commit()

    async def detail(self, phone: Phone) -> List[SMS]:
        sms_list = []
        async with aiohttp.ClientSession() as aio_session:
            async with aio_session.get(phone.detail_url) as resp:
                text = await resp.text()
        soup = BeautifulSoup(text, "html.parser")
        div = soup.find_all(class_="sms-content-table")[1]
        for tr in div.find_all("tr"):
            items = tr.find_all("td")
            if not items:
                continue
            sms = SMS()
            sms.phone = phone
            sms.sms_id = items[0].text.strip()
            sms.send_phone = items[1].text.strip()
            sms.text = items[2].text.strip()
            sms.recv_time = datetime.strptime(
                items[3].text.strip(), "%Y-%m-%d %H:%M:%S"
            )
            # 其实好像没什么必要存起来，因为这种数据实时性比较高，每次都要重新获取的
            session.add(sms)
            sms_list.append(sms)
        phone.sms = sms_list
        session.commit()
        return sms_list
