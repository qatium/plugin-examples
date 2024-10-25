import { sendMessage, onMessage } from '@qatium/sdk/ui'

const assetIdInput = document.querySelector<HTMLInputElement>("#pipe-id");
const flowLabel = document.querySelector("#pipe-flow");
const createScenarioButton = document.querySelector("#create-scenario");

assetIdInput?.addEventListener("input", () => {
  const assetId = assetIdInput!.value;

  sendMessage({
    action: "get-flow",
    assetId
  });
})

createScenarioButton?.addEventListener("click", () => {
  const assetId = assetIdInput!.value;

  sendMessage({
    action: "create-scenario",
    assetId
  })
})

onMessage<number>((flow) => {
  flowLabel!.innerHTML = flow.toString();
})