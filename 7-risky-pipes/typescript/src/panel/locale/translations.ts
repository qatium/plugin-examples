type TranslationKeys = {
  translation: {
    errorMustBePositive: string;
    send: string;
    olderThanYears: string;
    maxPressure: string;
    emptyPipeList: string;
    loading: string;
    showLayerHint: string;
  };
};

export const en: TranslationKeys = {
  translation: {
    errorMustBePositive: "Must be a positive number",
    send: "Update",
    olderThanYears: "Older Than Years",
    maxPressure: "Max Pressure",
    emptyPipeList: "No pipes at risk were found.",
    loading: "Loading...",
    showLayerHint: "Show pipes on map",
  },
};

export const es: TranslationKeys = {
  translation: {
    errorMustBePositive: "Debe ser un número positivo",
    send: "Actualizar",
    olderThanYears: "Más antiguo que años",
    maxPressure: "Presión máxima",
    emptyPipeList: "No se encontraron tuberías en riesgo.",
    loading: "Cargando...",
    showLayerHint: "Mostrar tuberías en el mapa",
  },
};
