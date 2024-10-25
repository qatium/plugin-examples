import { sendMessage } from '@qatium/sdk/ui'

const yearInput = document.querySelector<HTMLInputElement>("#limit-year");
const colorInput = document.querySelector<HTMLInputElement>("#color");

let year = 1980;
let color = "FFAC1C";

yearInput?.addEventListener("input", () => {
  year = Number(yearInput.value);

  if (year < 1900) return;
  sendMessage({year, color});
});

colorInput?.addEventListener("change", () => {
  color = colorInput.value;
  sendMessage({year, color});
})