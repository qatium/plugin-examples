import { useEffect, useState } from "react";
import "./App.css";
import { onMessage, sendMessage } from "@qatium/sdk/ui";
import { MessageToEngine, MessageToUI } from "../../communication/messages";
import { Form } from "./Form"
import { PipeList } from "./PipeList";
import { PipeInRisk } from "../../types";
import { Toggle } from "./Toggle";

const onToggleLayerVisibility = (isLayerVisible: boolean) => {
 sendMessage<MessageToEngine>({
   event: "toggle-shutdown-layer",
   isLayerVisible,
   });
};

export const App = () => {

  const [pipesInRisk, setPipesInRisk] = useState<PipeInRisk[]>([]);
  const [pressureUnit, setPressureUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLayerVisible, setIsLayerVisible] = useState<boolean>(true);

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
    <div className="container">
      <Form pressureUnit={pressureUnit} setIsLoading={setIsLoading} isLoading={isLoading} />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <PipeList pipes={pipesInRisk} />
      )}
      <Toggle
        aria-label={"showLayerHint"}
        onChange={onToggleLayerVisibility}
        toggled={isLayerVisible}
        size={"medium"}
      />
    </div>
  );
};