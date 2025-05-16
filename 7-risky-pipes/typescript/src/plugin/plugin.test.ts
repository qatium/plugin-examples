import { RiskyPipes } from "./plugin";
import { MessageToEngine } from "../communication/messages";
import { PipeInRisk } from "../types";
import { mockSDK } from "@qatium/sdk-testing-library";

describe("MyPlugin", () => {
  let plugin: RiskyPipes;

  beforeEach(() => {
    plugin = new RiskyPipes();
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("sends the pressure unit to the UI", () => {
      const sdk = mockSDK({});
      const sendMessageSpy = jest.spyOn(sdk.ui, "sendMessage");

      global.sdk = sdk;
      plugin.init();

      expect(sendMessageSpy).toHaveBeenCalledWith({
        event: "pressure-unit",
        pressureUnit: "mwc",
      });
    });
  });

  describe("run", () => {
    it("calculates pipes in risk and updates styles and panel", () => {
      const sdk = mockSDK({
        network: [
          {
            type: "Pipe",
            id: "pipe1",
            installationDate: new Date("1990-01-01"),
            connections: ["J1"],
            geometry: {
              type: 'LineString',
              coordinates: [[2,2]]
            }
          },
          { id: "J1", type: "Junction", simulation: { pressure: 120 } },
        ],
      });

      global.sdk = sdk;

      const pipesInRisk = [
        {
          id: "pipe1",
          maxPressure: 120,
          years: "1990",
          geometry: {
            type: "LineString",
            coordinates: [[2, 2]],
          },
        },
      ];



      jest.spyOn(plugin as any, "updatePanel");

      plugin.onNetworkChanged();

      expect(sdk.map.addOverlay).toHaveBeenCalled();
      expect(plugin["updatePanel"]).toHaveBeenCalledWith(pipesInRisk);
    });
  });

  describe("onZoomChanged", () => {
    it("map overlay is not displayed when toggle is off", () => {
      const sdk = mockSDK({});
      global.sdk = sdk;

      plugin.onMessage({
        event: "toggle-shutdown-layer",
        isLayerVisible: false,
      });

      plugin.onZoomChanged();
      expect(sdk.map.hideOverlay).toHaveBeenCalled();
      expect(sdk.map.addOverlay).not.toHaveBeenCalled();
    });
  });

  describe("updatePanel", () => {
    it("sends pipes in risk to the UI", () => {
      const pipesInRisk: PipeInRisk[] = [
        {
          id: "pipe1",
          maxPressure: 120,
          years: "1990",
          geometry: { type: "LineString", coordinates: [] },
        },
      ];

      const sdk = mockSDK({
        network: [
          {
            type: "Pipe",
            id: "pipe1",
            installationDate: new Date("1990-01-01"),
            connections: ["J1"],
          },
          { id: "J1", type: "Junction", simulation: { pressure: 120 } },
        ],
      });

      global.sdk = sdk;

      plugin["updatePanel"](pipesInRisk);

      expect(sdk.ui.sendMessage).toHaveBeenCalledWith({
        event: "pipes-in-risk",
        pipes: pipesInRisk,
      });
    });
  });

  describe("onMessage", () => {
    beforeAll(() => {
      const sdk = mockSDK({});
      global.sdk = sdk;
    });
    it("handles 'request-risky-pipes' messages", () => {
      const sdk = mockSDK({});
      global.sdk = sdk;

      const message: MessageToEngine = {
        event: "request-risky-pipes",
        payload: { olderThanYears: 30, maxPressure: 90 },
      };

      plugin.onMessage(message);

      expect(plugin["olderThanYears"]).toBe(30);
      expect(plugin["maxPressure"]).toBe(90);
      expect(sdk.ui.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
        event: "pipes-in-risk",
      }));
    });

    it("handles 'fit-to' messages", () => {
      const message: MessageToEngine = {
        event: "fit-to",
        assetId: "pipe1",
      };

      plugin.onMessage(message);

      expect(sdk.map.fitTo).toHaveBeenCalledWith(["pipe1"], {
        padding: { top: 200, left: 200, right: 300, bottom: 200 },
        flightDuration: 900,
        maxZoom: 21,
      });
    });

    it("handles 'highlight' messages", () => {
      const message: MessageToEngine = {
        event: "highlight",
        assetId: "pipe1",
      };

      plugin.onMessage(message);

      expect(sdk.map.setHighlights).toHaveBeenCalledWith(["pipe1"]);
    });
  });
});
