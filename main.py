import asyncio
from datetime import datetime

from aiohttp import web

from sites.materialtools import Materialtools
from sites.models import SMS, Phone, session

sites = {
    "materialtools": {"class": Materialtools, "updated_time": "1980-01-01 00:00:00"}
}

routes = web.RouteTableDef()


@routes.get("/sites")
async def web_sites(request):
    return web.json_response(
        [
            {"site": key, "updated_time": value["updated_time"]}
            for key, value in sites.items()
        ]
    )


@routes.get("/{site}/update")
async def web_update(request):
    site = sites[request.match_info["site"]]["class"]()
    await site.update()
    sites[request.match_info["site"]]["updated_time"] = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )
    return web.json_response("success")


@routes.get("/phones")
async def web_phones(request):
    phones = session.query(Phone).all()
    return web.json_response(
        [
            {
                "phone_number": item.phone_number,
                "site": item.site,
                "detail_url": item.detail_url,
            }
            for item in phones
        ]
    )


@routes.get("/{site}/{phone}/sms")
async def web_sms(request):
    site = sites[request.match_info["site"]]["class"]()
    phone_number = request.match_info["phone"]
    phone = session.query(Phone).filter_by(phone_number=phone_number).first()
    if not phone:
        return web.json_response("phone number not found")
    sms = await site.detail(phone)
    return web.json_response(
        [
            {
                "send_phone": item.send_phone,
                "text": item.text,
                "recv_time": item.recv_time.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for item in sms
        ]
    )


if __name__ == "__main__":
    app = web.Application()
    app.add_routes(routes)
    web.run_app(app)
