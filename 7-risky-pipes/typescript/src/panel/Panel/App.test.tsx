import { render } from "@testing-library/react";
import { App } from "./App";
import { onMessage } from "@qatium/sdk/ui";
import { Form } from "./Form";
import { PipeList } from "./PipeList";

jest.mock("@qatium/sdk/ui", () => ({
  onMessage: jest.fn(),
}));

jest.mock("./Form", () => ({
  Form: jest.fn(() => <div>Mocked Form</div>),
}));

jest.mock("./PipeList", () => ({
  PipeList: jest.fn(() => <div>Mocked PipeList</div>),
}));

describe("App", () => {
  const mockRemoveListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (onMessage as jest.Mock).mockImplementation((callback) => {
      callback({ event: "pressure-unit", pressureUnit: "bar" });
      callback({
        event: "pipes-in-risk",
        pipes: [
          { id: "pipe1", years: 10, maxPressure: 100 },
          { id: "pipe2", years: 5, maxPressure: 80 },
        ],
      });

      return { removeListener: mockRemoveListener };
    });
  });

  it("sets pressureUnit and pipesInRisk state based on messages", () => {

    render(<App />);
    expect(Form).toHaveBeenCalledWith(
      expect.objectContaining({
        pressureUnit: "bar",
        isLoading: false,
      }),
      expect.anything()
    );

    expect(PipeList).toHaveBeenCalledWith(
      {
        pipes: [
          { id: "pipe1", years: 10, maxPressure: 100 },
          { id: "pipe2", years: 5, maxPressure: 80 },
        ],
      },
      expect.anything()
    );
  });

  it("cleans up the message listener on unmount", () => {
    const { unmount } = render(<App />);

    unmount();

    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });
});