from qatiumsdk import Plugin, sdk
import time

SECRET_NAME = "API_KEY"
API_BASE_URL = "https://api.weatherapi.com/v1/current.json";

class MyPlugin(Plugin):
  async def init(self):
    hasKey = await sdk.integrations.secrets.has(SECRET_NAME)

    sdk.ui.send_message({ "type": "has-api-key", "hasKey": hasKey })

    if hasKey == True:
      await self.fetch_weather()

  async def fetch_weather(self):
    bounds = sdk.network.get_bounds()
    center = {
      'lat': (bounds.ne.lat + bounds.sw.lat) / 2,
      'lng': (bounds.ne.lng + bounds.sw.lng) / 2
    }

    url = f"{API_BASE_URL}?q={center['lat']}%2C{center['lng']}&key=$(secret:{SECRET_NAME})"

    response = await sdk.integrations.fetch(url)
    body = await response.json()

    sdk.ui.send_message({
      "type": "weather-forecast",
      "location": f"{body.location.name}, {body.location.country}",
      "temp": body.current.temp_c,
      "wind": body.current.wind_kph,
      "humidity": body.current.humidity,
      "iconUrl": body.current.condition.icon
    })

  async def onMessage(self, message):
    await sdk.integrations.secrets.set(SECRET_NAME, message.apiToken)
    time.sleep(0.5)
    await self.fetch_weather()
