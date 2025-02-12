import React, { useState } from "react";
import { FormValues } from "../../types";
import { sendMessage } from "@qatium/sdk/ui";
import { MessageToEngine } from "../../communication/messages";
import { useTranslation } from "react-i18next";
import { DEFAULT_MAX_PREASSURE, DEFAULT_OLDER_YEARS } from "../../constants";


type FormProps = {
  pressureUnit: string;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const requestSearch = (payload: FormValues) => {
  sendMessage<MessageToEngine>({
    event: "request-risky-pipes",
    payload,
  });
};

const isValidNumber = (value: number) => {
  if (Number.isNaN(value)) return false
  return value >= 0
}

export const Form = ({ pressureUnit, setIsLoading, isLoading }: FormProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formValues, setFormValues] = useState<FormValues>({
    olderThanYears: DEFAULT_OLDER_YEARS,
    maxPressure: DEFAULT_MAX_PREASSURE,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!isValidNumber(formValues.olderThanYears)) {
      newErrors.olderThanYears = t("errorMustBePositive");
    }
    if (!isValidNumber(formValues.maxPressure)) {
      newErrors.maxPressure = t("errorMustBePositive");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      const values = {
        maxPressure: Number(formValues.maxPressure),
        olderThanYears: Number(formValues.olderThanYears)
      }
      setIsLoading(true);
      requestSearch(values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="olderThanYears">{t("olderThanYears")}</label>
        <input
          id="olderThanYears"
          name="olderThanYears"
          value={formValues.olderThanYears}
          onChange={handleChange}
        />
        {errors.olderThanYears && <p>{errors.olderThanYears}</p>}
      </div>
      <div>
        <label htmlFor="maxPressure">{t("maxPressure")} {pressureUnit}</label>
        <input
          id="maxPressure"
          name="maxPressure"
          value={formValues.maxPressure}
          onChange={handleChange}
        />
        {errors.maxPressure && <p>{errors.maxPressure}</p>}
      </div>
      <button type="submit" name="send" disabled={isLoading}>{t("send")}</button>
    </form>
  );
};
