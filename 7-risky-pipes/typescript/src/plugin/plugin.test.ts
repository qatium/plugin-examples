import { MyPlugin } from "./plugin";
import "@qatium/sdk";
import { Pipe, Junction, StyleProperties } from "@qatium/sdk";
import { MessageToEngine } from "../communication/messages";
import { PipeInRisk } from "../types";

jest.mock("@qatium/sdk", () => ({
  sdk: {
    network: {
      getPipes: jest.fn(),
      getConnectedAssets: jest.fn(),
      getUnits: jest.fn(() => ({
        parameters: { pressure: "psi" },
      })),
    },
    map: {
      addStyles: jest.fn(),
      fitTo: jest.fn(),
      setHighlights: jest.fn(),
      clearHighlights: jest.fn(),
    },
    ui: {
      sendMessage: jest.fn(),
    },
  },
}));

describe("MyPlugin", () => {
  let plugin: MyPlugin;

  beforeEach(() => {
    plugin = new MyPlugin();
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("sends the pressure unit to the UI", () => {
      plugin.init();

      expect(sdk.ui.sendMessage).toHaveBeenCalledWith({
        event: "pressure-unit",
        pressureUnit: "psi",
      });
    });
  });

  describe("run", () => {
    it("calculates pipes in risk and updates styles and panel", () => {
      const mockPipes: Pipe[] = [
        {
          id: "pipe1",
          installationDate: new Date("1970-01-01"),
        } as Pipe,
        {
          id: "pipe2",
          installationDate: new Date("2020-01-01"),
        } as Pipe,
      ];

      const mockJunctions: Junction[] = [
        {
          id: "junction1",
          simulation: { pressure: 120 },
        } as Junction,
      ];

      (sdk.network.getPipes as jest.Mock).mockImplementation((callback) =>
        mockPipes.forEach((pipe) => callback(pipe))
      );

      (sdk.network.getConnectedAssets as jest.Mock).mockReturnValue(
        mockJunctions
      );

      const pipesInRisk = [{ id: "pipe1", maxPressure: 120, years: "1970" }];

      const styles: Record<string, StyleProperties> = {
        pipe1: {
          elementColor: "red",
          isElementVisible: true,
          shadowColor: "green",
          isShadowVisible: true,
          outlineOpacity: 0,
        },
      };

      jest.spyOn(plugin as any, "updatePanel");

      plugin.run();

      expect(sdk.map.addStyles).toHaveBeenCalledWith(styles);
      expect(plugin["updatePanel"]).toHaveBeenCalledWith(pipesInRisk);
    });
  });

  describe("updatePanel", () => {
    it("sends pipes in risk to the UI", () => {
      const pipesInRisk: PipeInRisk[] = [
        { id: "pipe1", maxPressure: 120, years: "1970" },
      ];

      plugin["updatePanel"](pipesInRisk);

      expect(sdk.ui.sendMessage).toHaveBeenCalledWith({
        event: "pipes-in-risk",
        pipes: pipesInRisk,
      });
    });
  });

  describe("onMessage", () => {
    it("handles 'request-risky-pipes' messages", () => {
      jest.spyOn(plugin, "run");

      const message: MessageToEngine = {
        event: "request-risky-pipes",
        payload: { olderThanYears: 30, maxPressure: 90 },
      };

      plugin.onMessage(message);

      expect(plugin["olderThanYears"]).toBe(30);
      expect(plugin["maxPressure"]).toBe(90);
      expect(plugin.run).toHaveBeenCalled();
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

    it("handles 'clear-highlights' messages", () => {
      const message: MessageToEngine = {
        event: "clear-highlights",
      };

      plugin.onMessage(message);

      expect(sdk.map.clearHighlights).toHaveBeenCalled();
    });
  });
});
