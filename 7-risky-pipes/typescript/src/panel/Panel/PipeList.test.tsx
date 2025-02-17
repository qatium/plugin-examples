import { render, screen, fireEvent } from "@testing-library/react";
import { PipeList } from "./PipeList";
import { sendMessage } from "@qatium/sdk/ui";
import { PipeInRisk } from "../../types";

jest.mock("@qatium/sdk/ui", () => ({
  sendMessage: jest.fn(),
}));

describe("PipeList", () => {
  const pipes: PipeInRisk[] = [
    { id: "pipe1", years: "10", maxPressure: 100, geometry: {type: 'LineString', coordinates: []} },
    { id: "pipe2", years: "5", maxPressure: 80, geometry: { type: 'LineString', coordinates: [] } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });


  it("renders a list of pipes", () => {
    render(<PipeList pipes={pipes}></PipeList>);

    expect(screen.getByText("pipe1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    expect(screen.getByText("pipe2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("does not render the list if there are no pipes", () => {
    render(<PipeList pipes={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("calls focusAsset when the button is clicked", () => {
    render(<PipeList pipes={pipes} />);

    const button = screen.getAllByRole("button")[0];
    fireEvent.click(button);

    expect(sendMessage).toHaveBeenCalledWith({
      event: "highlight",
      assetId: "pipe1",
    });
    expect(sendMessage).toHaveBeenCalledWith({
      event: "fit-to",
      assetId: "pipe1",
    });

  });

  it("renders the correct number of buttons", () => {
    render(<PipeList pipes={pipes} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(pipes.length);
  });
});