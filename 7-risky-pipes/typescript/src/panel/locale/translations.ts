type TranslationKeys = {
  translation: {
    errorMustBePositive: string;
    send: string;
    olderThanYears: string;
    maxPressure: string;
    emptyPipeList: string;
  };
};

export const en: TranslationKeys = {
  translation: {
    errorMustBePositive: "Must be a positive number",
    send: "Send",
    olderThanYears: "Older Than Years",
    maxPressure: "Max Pressure",
    emptyPipeList: "No pipes at risk were found.",
  },
};

export const es: TranslationKeys = {
  translation: {
    errorMustBePositive: "Debe ser un número positivo",
    send: "Enviar",
    olderThanYears: "Más antiguo que años",
    maxPressure: "Presión máxima",
    emptyPipeList: "No se encontraron tuberías en riesgo.",
  },
};
