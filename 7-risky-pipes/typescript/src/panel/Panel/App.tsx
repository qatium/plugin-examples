import { useEffect, useState } from "react";
import "./App.css";
import { onMessage } from "@qatium/sdk/ui";
import { MessageToUI } from "../../communication/messages";
import { Form } from "./Form"
import { PipeList } from "./PipeList";
import { PipeInRisk } from "../../types";


export const App = () => {

  const [pipesInRisk, setPipesInRisk] = useState<PipeInRisk[]>([]);
  const [pressureUnit, setPressureUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const { removeListener } = onMessage<MessageToUI>((msg) => {
      if (msg.event === "pipes-in-risk") {
        setPipesInRisk(msg.pipes);
        setIsLoading(false);
      }
      if (msg.event === "pressure-unit") {
        setPressureUnit(msg.pressureUnit);
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
    </div>
  );
};