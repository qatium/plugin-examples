import type { MessageToUI } from "../messages";
import { sendMessage, onMessage } from '@qatium/sdk/ui';

document.querySelector<HTMLDivElement>("#main")!.style.display = "none";
document.querySelector<HTMLDivElement>("#login")!.style.display = "none";

const submitButton = document.querySelector<HTMLButtonElement>("#submit");
submitButton?.addEventListener("click", () => {
  const apiToken = document.querySelector<HTMLInputElement>("#api-token")?.value ?? "";

  sendMessage({
    type: "set-api-token",
    apiToken
  });
});

onMessage((msg: MessageToUI) => {
  document.querySelector<HTMLDivElement>("#loading")!.style.display = "none";

  switch (msg.type) {
    case "has-api-key":
      if (msg.hasKey) {
        document.querySelector<HTMLDivElement>("#main")!.style.display = "flex";
      } else {
        document.querySelector<HTMLDivElement>("#login")!.style.display = "flex";
      }
      break;
    case "weather-forecast":
      document.querySelector<HTMLDivElement>("#login")!.style.display = "none";
      document.querySelector<HTMLDivElement>("#main")!.style.display = "flex";
      document.querySelector<HTMLDivElement>("#main")!.innerHTML = `
      <h3>${msg.location}</h3>
      <div style="display: flex; flex-direction: row">
        <img src="${msg.iconUrl}" />
        <div>
          <p>Temperature: ${msg.temp} ºC</p>
          <p>Humidity: ${msg.humidity}%</p>
          <p>Wind: ${msg.wind} km/h</p>
        </div>
      </div>
      `;
      break;
  }
});
