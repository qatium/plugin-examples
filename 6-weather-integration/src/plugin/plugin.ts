import { Plugin } from "@qatium/sdk/plugin";

export class MyPlugin implements Plugin {
  private secretName = "API_KEY";

  async init() {
    const hasKey = await sdk.integrations.secrets.has(this.secretName);
    sdk.ui.sendMessage({type: "has-api-key", hasKey })

    if (hasKey) {
      await this.fetchWeather();
    }
  }

  async fetchWeather() {
    const baseUrl = "https://api.weatherapi.com/v1/current.json";
    const bounds = sdk.network.getBounds();
    const center = {
      lat: (bounds.ne.lat + bounds.sw.lat) / 2,
      lng: (bounds.ne.lng + bounds.sw.lng) / 2
    };
    const url = `${baseUrl}?q=${center.lat}%2C${center.lng}&key=$(secret:${this.secretName})`;

    const response = await sdk.integrations.fetch(url);
    const body = await response.json();

    console.log(body)

    sdk.ui.sendMessage({
      type: "weather-forecast",
      location: `${body.location.name}, ${body.location.region}`,
      temp: body.current.temp_c,
      wind: body.current.wind_kph,
      humidity: body.current.humidity,
      iconUrl: body.current.condition.icon
    })
  }

  async onMessage({apiToken}: { apiToken: string}) {
    const result = await sdk.integrations.secrets.set(this.secretName, apiToken);
    console.log(result)
    await this.fetchWeather();
  }
}
