import { onMessage, sendMessage } from "@qatium/sdk/ui";

const yearInput = document.querySelector<HTMLInputElement>("#limit-year");
const colorInput = document.querySelector<HTMLInputElement>("#color");

let year = 1980;
let color = "FFAC1C";

onMessage<{ year: number; color: string }>((message) => {
  if (!yearInput || !colorInput) return;
  yearInput.value = message.year.toString();
  colorInput.value = message.color;
});

yearInput?.addEventListener("input", () => {
  year = Number(yearInput.value);

  if (year < 1900) return;
  sendMessage({ year, color });
});

colorInput?.addEventListener("change", () => {
  color = colorInput.value;
  sendMessage({ year, color });
});
