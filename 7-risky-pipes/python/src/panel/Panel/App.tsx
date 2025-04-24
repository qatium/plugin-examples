import { onMessage, sendMessage } from "@qatium/sdk/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageToEngine, MessageToUI } from "../../communication/messages";
import { PipeInRisk } from "../../types";
import "./App.css";
import { Form } from "./Form";
import { PipeList } from "./PipeList";
import { Toggle } from "./Toggle";

const onToggleLayerVisibility = (isLayerVisible: boolean) => {
  sendMessage<MessageToEngine>({
    event: "toggle-shutdown-layer",
    isLayerVisible
  });
};

export const App = () => {
  const [pipesInRisk, setPipesInRisk] = useState<PipeInRisk[]>([]);
  const [pressureUnit, setPressureUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLayerVisible, setIsLayerVisible] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    const { removeListener } = onMessage<MessageToUI>((msg) => {
      if (msg.event === "pipes-in-risk") {
        setPipesInRisk(msg.pipes);
        setIsLoading(false);
      }
      if (msg.event === "pressure-unit") {
        setPressureUnit(msg.pressureUnit);
      }

      if (msg.event === "update-layer-visibility") {
        setIsLayerVisible(msg.isLayerVisible);
      }
    });

    return removeListener;
  }, []);

  return (
    <div className="vstack">
      <Form
        pressureUnit={pressureUnit}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />
      {isLoading ? (
        <p>{t("loading")}</p>
      ) : (
        <>
          {pipesInRisk.length > 0 && (
            <Toggle
              onChange={onToggleLayerVisibility}
              toggled={isLayerVisible}
              label={t("showLayerHint")}
            />
          )}
          <PipeList pipes={pipesInRisk} />
        </>
      )}
    </div>
  );
};
