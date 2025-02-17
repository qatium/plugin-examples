import { Plugin } from "@qatium/sdk/plugin";
import { Junction, OverlayLayer, Pipe } from "@qatium/sdk";
import { MessageToEngine, MessageToUI } from "../communication/messages";
import { OverlayFeature, PipeInRisk } from "../types";
import { DEFAULT_MAX_PREASSURE, DEFAULT_OLDER_YEARS } from "../constants";
import { yearsToMilis } from "../panel/utils/time";

const getWidth = (zoom: number) => {
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const widthByZoom: { [zoomLevel: number]: number } = {
    [24]: 0.05,
    [23]: 0.05,
    [22]: 0.5,
    [21]: 0.5,
    [20]: 1,
    [19]: 1,
    [18]: 1,
    [17]: 2.5,
    [16]: 2,
    [15]: 5,
    [14]: 10,
    [13]: 10,
    [12]: 10,
    [11]: 10,
    [10]: 10,
    [9]: 10,
    [8]: 10,
    [7]: 12,
    [6]: 12,
    [5]: 12,
    [4]: 12,
    [3]: 12,
    [2]: 12,
    [1]: 12,
  };

  const a = widthByZoom[Math.floor(zoom)];
  const b = widthByZoom[Math.ceil(zoom)];
  const t = zoom - Math.floor(zoom);

  return lerp(a, b, t);
};

const N_PIPES_UI = 20

export class RiskyPipes implements Plugin {
  private olderThanYears: number = DEFAULT_OLDER_YEARS;
  private maxPressure: number = DEFAULT_MAX_PREASSURE;

  init() {
    sdk.ui.sendMessage<MessageToUI>({
      event: "pressure-unit",
      pressureUnit: sdk.network.getUnits().parameters?.pressure ?? "",
    });
  }

  private udpateNetwork() {
    const pipes = this.getPipesInRisk({
      olderThanYears: this.olderThanYears,
      maxPressure: this.maxPressure,
    });

    if (pipes.length > 0) {
      const pipesOverlay = this.createPathLayer(pipes);
      sdk.map.addOverlay([pipesOverlay]);
    } else {
      sdk.map.hideOverlay();
    }

    this.updatePanel(pipes);
  }

  onNetworkChanged() {
    this.udpateNetwork();
  }

  updatePanel(pipes: PipeInRisk[]) {
    sdk.ui.sendMessage<MessageToUI>({
      event: "pipes-in-risk",
      pipes: JSON.parse(JSON.stringify(pipes)),
    });
  }

  onMessage(message: MessageToEngine) {
    switch (message.event) {
      case "request-risky-pipes":
        this.maxPressure = message.payload.maxPressure;
        this.olderThanYears = message.payload.olderThanYears;
        this.udpateNetwork();
        break;
      case "fit-to":
        sdk.map.fitTo([message.assetId], {
          padding: { top: 200, left: 200, right: 300, bottom: 200 },
          flightDuration: 900,
          maxZoom: 21,
        });
        break;
      case "highlight":
        sdk.map.setHighlights([message.assetId]);
        break;
      case "toggle-shutdown-layer":
        if (message.isLayerVisible === true) {
          sdk.map.showOverlay();
        } else {
          sdk.map.hideOverlay();
        }
        sdk.ui.sendMessage<MessageToUI>({
          event: "update-layer-visibility",
          isLayerVisible: message.isLayerVisible,
        });
        break;
    }
  }

  onZoomChanged() {
    this.udpateNetwork();
  }

  private calculatePipeMaxPressure = (pipe: Pipe) => {
    const junctionsConnectedToPipe = sdk.network
      .getConnectedAssets([pipe.id], (asset) => asset.type === "Junction")
      .filter((a): a is Junction => a.type === "Junction");

    return junctionsConnectedToPipe.reduce((maxPressure, junction) => {
      if (!junction.simulation || junction.simulation.pressure < maxPressure) {
        return maxPressure;
      }

      return junction.simulation.pressure;
    }, -Infinity);
  };

  private getPipesInRisk = ({
    olderThanYears,
    maxPressure,
  }: {
    olderThanYears: number;
    maxPressure: number;
  }): PipeInRisk[] => {
    const installationDateThreshold =
      this.calculateInstallationDateThreshold(olderThanYears);
    
      return sdk.network
        .getPipes()
        .filter((pipe) =>
          this.isPipeInRisk(pipe, installationDateThreshold, maxPressure)
        )
        .map((pipe) => this.formatPipeInRisk(pipe))
        .sort(
          (a, b) =>
            b.maxPressure - a.maxPressure ||
            parseInt(b.years) - parseInt(a.years)
        )
        .slice(0, N_PIPES_UI);
  };

  private calculateInstallationDateThreshold(years: number): number {
    return Date.now() - yearsToMilis(years);
  }

  private isPipeInRisk(
    pipe: Pipe,
    installationDateThreshold: number,
    maxAllowedPressure: number
  ): boolean {
    const installationDate = pipe.installationDate?.getTime() ?? Infinity;
    const isOld = installationDate < installationDateThreshold;

    const maxPressure = this.calculatePipeMaxPressure(pipe);
    const isPressureExceeded = maxPressure > maxAllowedPressure;

    return isOld && isPressureExceeded;
  }

  private formatPipeInRisk(pipe: Pipe): PipeInRisk {
    const installationYear =
      pipe.installationDate?.getFullYear()?.toString() ||
      "No date registered for this pipe";

    return {
      id: pipe.id,
      maxPressure: this.calculatePipeMaxPressure(pipe),
      years: installationYear,
      geometry: pipe.geometry,
    };
  }

  private createPathLayer = (pipes: PipeInRisk[]) => {
    const linesData: OverlayFeature[] = pipes.map((p) => {
      const color: [number, number, number, number] = [90, 185, 2, 128]; // "#5AB902"
      return {
        id: String(p.id),
        type: "Feature",
        geometry: p.geometry,
        properties: { color },
      };
    });

    const { zoom } = sdk.map.getCamera();
    return {
      id: "risky-pipes",
      data: linesData,
      type: "PathLayer",
      visible: true,
      getPath: (p: OverlayFeature) =>
        p.geometry.coordinates as [number, number][],
      getColor: (p: OverlayFeature) => p.properties.color,
      getWidth: getWidth(zoom),
    } as OverlayLayer<"PathLayer", (typeof linesData)[0]>;
  };
}
