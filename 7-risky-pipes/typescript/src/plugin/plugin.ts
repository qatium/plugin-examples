import { Plugin } from "@qatium/sdk/plugin";
import { Junction, Pipe, StyleProperties } from "@qatium/sdk";
import { MessageToEngine, MessageToUI } from "../communication/messages";
import { PipeInRisk } from "../types";

const yearsToMilis = (years: number) => years * 365 * 24 * 60 * 60 * 1000;

const calculatePipeMaxPressure = (pipe: Pipe) => {
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

const getPipesInRisk = (riskParameters: {
  olderThanYears: number;
  maxPressure: number;
}): PipeInRisk[] => {
  const installationDateThreshold =
    new Date().getTime() - yearsToMilis(riskParameters.olderThanYears);
  

  const pipesInRisk: PipeInRisk[] = [];

  sdk.network.getPipes((pipe) => {
    const pipeDateOld = pipe.installationDate?.getTime() ?? Infinity;
    const isInstallationDateOld = pipeDateOld < installationDateThreshold;

    const maxPressure = calculatePipeMaxPressure(pipe);
    const isPressureAboveMax = maxPressure > riskParameters.maxPressure;

    const isPipeInRisk = isInstallationDateOld && isPressureAboveMax;
    const pipeYearsOld =
      pipe.installationDate?.getTime() && pipe.installationDate?.getTime() > 0
        ? new Date(pipeDateOld).getFullYear().toString()
        : "No date registered for this pipe";
    if (isPipeInRisk) {
      pipesInRisk.push({ id: pipe.id, maxPressure, years: pipeYearsOld });
    }
    return isPipeInRisk
  });

  return pipesInRisk;
};

export class MyPlugin implements Plugin {
  private olderThanYears: number = 35;
  private maxPressure: number = 100;

  init() {
    sdk.ui.sendMessage<MessageToUI>({
      event: "pressure-unit",
      pressureUnit: sdk.network.getUnits().parameters?.pressure ?? "",
    });
  }

  run() {
    const pipes = getPipesInRisk({
      olderThanYears: this.olderThanYears,
      maxPressure: this.maxPressure,
    });

    const styles = Object.fromEntries(
      pipes.map((a): [string, StyleProperties] => [
        a.id,
        {
          elementColor: "red",
          isElementVisible: true,
          shadowColor: "green",
          isShadowVisible: true,
          outlineOpacity: 0,
        },
      ])
    );

    sdk.map.addStyles(styles);
    this.updatePanel(pipes);
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
        this.run();
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
      case "clear-highlights":
        sdk.map.clearHighlights();
        break;
    }
  }
}
