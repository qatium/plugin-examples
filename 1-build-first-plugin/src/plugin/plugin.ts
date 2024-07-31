import { AssetStatus, AssetTypes } from "@qatium/sdk";
import { Plugin } from "@qatium/sdk/plugin";

type Message = {
  action: "create-scenario" | "get-flow";
  assetId: string;
};

export class MyPlugin implements Plugin {
  lastAssetId = "";

  onNetworkChanged() {
    if (this.lastAssetId === "") return;

    const asset = sdk.network.getAsset(this.lastAssetId);

    if (!asset || (asset.type !== AssetTypes.PIPE && asset.type !== AssetTypes.PUMP)) {
      return;
    }

    sdk.ui.sendMessage(asset.simulation!.flow);
  }

  onMessage(message: Message) {
    const asset = sdk.network.getAsset(message.assetId);

    if (!asset || (asset.type !== AssetTypes.PIPE && asset.type !== AssetTypes.PUMP)) {
      return;
    }

    this.lastAssetId = asset.id;

    if (message.action === "create-scenario") {
      sdk.network.setStatus(asset.id, AssetStatus.CLOSED);
    }

    sdk.ui.sendMessage(asset.simulation!.flow);
  }
}
