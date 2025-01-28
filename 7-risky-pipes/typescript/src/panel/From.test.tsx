import { render, screen, fireEvent } from "@testing-library/react";
import { Form } from "./Form";
import { sendMessage } from "@qatium/sdk/ui";

jest.mock("@qatium/sdk/ui", () => ({
    sendMessage: jest.fn(),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("Form", () => {
    const pressureUnit = "bar";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the form with default values", () => {
        render(<Form pressureUnit={pressureUnit} />);

        expect(screen.getByLabelText("Older Than Years")).toHaveValue("35");
        expect(screen.getByLabelText(`Max Pressure ${pressureUnit}`)).toHaveValue(
            "100"
        );
        expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
    });

    it("updates form values when input changes", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText("Older Than Years");
        const maxPressureInput = screen.getByLabelText(`Max Pressure ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: "40" } });
        fireEvent.change(maxPressureInput, { target: { value: "150" } });

        expect(olderThanYearsInput).toHaveValue("40");
        expect(maxPressureInput).toHaveValue("150");
    });

    it("shows validation errors for invalid inputs", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText("Older Than Years");
        const maxPressureInput = screen.getByLabelText(`Max Pressure ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: "-10" } });
        fireEvent.change(maxPressureInput, { target: { value: "-50" } });

        const submitButton = screen.getByRole("button", { name: "Enviar" });
        fireEvent.click(submitButton);

        expect(screen.getByText("errorMustBePositive")).toBeInTheDocument();
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("calls requestSearch with valid form values on submit", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText("Older Than Years");
        const maxPressureInput = screen.getByLabelText(`Max Pressure ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: "40" } });
        fireEvent.change(maxPressureInput, { target: { value: "150" } });

        const submitButton = screen.getByRole("button", { name: "Enviar" });
        fireEvent.click(submitButton);

        expect(sendMessage).toHaveBeenCalledWith({
            event: "request-risky-pipes",
            payload: {
                olderThanYears: 40,
                maxPressure: 150,
            },
        });
    });
});