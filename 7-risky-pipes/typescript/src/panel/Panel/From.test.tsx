import { render, screen, fireEvent } from "@testing-library/react";
import { Form } from "./Form";
import { sendMessage } from "@qatium/sdk/ui";
import { useTranslation } from "react-i18next";
import { DEFAULT_MAX_PREASSURE, DEFAULT_OLDER_YEARS } from "../../constants";
const { t } = useTranslation();

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

        expect(screen.getByLabelText(t("olderThanYears"))).toHaveValue(DEFAULT_OLDER_YEARS.toString());
        expect(screen.getByLabelText(`${t("maxPressure")} ${pressureUnit}`)).toHaveValue(
            DEFAULT_MAX_PREASSURE.toString()
        );
        expect(screen.getByRole("button", { name: "send" })).toBeInTheDocument();
    });

    it("updates form values when input changes", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText(t("olderThanYears"));
        const maxPressureInput = screen.getByLabelText(`${t("maxPressure")} ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: "40" } });
        fireEvent.change(maxPressureInput, { target: { value: "150" } });

        expect(olderThanYearsInput).toHaveValue("40");
        expect(maxPressureInput).toHaveValue("150");
    });

    it("shows validation errors for invalid inputs", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText(t("olderThanYears"));
        const maxPressureInput = screen.getByLabelText(`${t("maxPressure")} ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: -10 } });
        fireEvent.change(maxPressureInput, { target: { value: -50 } });

        const submitButton = screen.getByRole("button", { name: "send" });
        fireEvent.click(submitButton);

        const errors = screen.queryAllByText(/errorMustBePositive/);
        expect(errors).toHaveLength(2);
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("calls requestSearch with valid form values on submit", () => {
        render(<Form pressureUnit={pressureUnit} />);

        const olderThanYearsInput = screen.getByLabelText(t("olderThanYears"));
        const maxPressureInput = screen.getByLabelText(`${t("maxPressure")} ${pressureUnit}`);

        fireEvent.change(olderThanYearsInput, { target: { value: "40" } });
        fireEvent.change(maxPressureInput, { target: { value: "150" } });

        const submitButton = screen.getByRole("button", { name: "send" });
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