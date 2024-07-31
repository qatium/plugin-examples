import { AssetStatus, OverlayLayer } from "@qatium/sdk";
import { Plugin } from "@qatium/sdk/plugin";
import { tooltipIcon, truckIcon } from "./icon";

export class MyPlugin implements Plugin {
  data: any = {};
  started = false;

  constructor() {
    setInterval(this.retrieveData.bind(this), 5000)
  }

  private async retrieveData() {
    try {
      const response = await fetch("http://localhost:1234")
      this.data = await response.json()
      this.started = true;
      this.run()
    } catch {}
  }

  run() {
    if (!this.started) return;

    const feature = {
      type: "Feature",
      properties: { id: this.data.id },
      geometry: {
        type: "Point",
        coordinates: this.data.coordinates as [number, number]
      }
    }

    const tooltip = (item: any) => ({
      sections: [[
        {
          label: "Crew Members",
          value: this.data.crew.join(", ")
        },
        ...this.data.affectedAssets.map((asset: any) => ({
          label: `Asset ${asset.id}`,
          value: asset.status
        }))
      ], [
        {
          label: "Reason",
          value: this.data.reason
        }
      ]],
      title: `Work order #${item.id}`,
      type: "Work Order",
      icon: {
        media: "image/jpg",
        charset: "utf-8",
        data: tooltipIcon
      }
    })

    sdk.map.addOverlay([{
      type: "IconLayer",
      data: [feature],
      id: "CrewLayer",
      getIcon: () => ({
        height: 128,
        width: 128,
        url: truckIcon
      }),
      getPixelOffset: [0, 0],
      sizeScale: 30,
      getPosition: (element) => (element.geometry as any).coordinates,
      interactive: true,
      tooltip: (item) => tooltip(item),
      popover: (item) => tooltip(item)
    } as OverlayLayer<"IconLayer">])

    this.data.affectedAssets.forEach((asset: any) => {
      if (asset.status === "working") {
        sdk.map.addStyles({
          [asset.id as string]: {
            shadowColor: "orange",
            isShadowVisible: true,
            isElementVisible: true
          }
        })
      }

      if (asset.status === "closed") {
        sdk.network.setStatus(asset.id as string, AssetStatus.CLOSED);
        sdk.map.removeStyles();
      }
    })
  }
}