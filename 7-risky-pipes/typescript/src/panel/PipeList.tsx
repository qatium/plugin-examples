import { AssetId } from "@qatium/sdk";
import { sendMessage } from "@qatium/sdk/ui";
import { MessageToEngine } from "../communication/messages";
import { PipeInRisk } from "../types";
import IconMapPointer from "./assets/icon-map-pointer.svg";

type PipeListProps = {
  pipes: PipeInRisk[];
}

const CLEAR_HIGHLIGHTS_TIMEOUT = 1500;


const mapService = {
  fitTo: (assetId: string) => { 
    sendMessage<MessageToEngine>({ event: "fit-to", assetId });
  },
  highlight: (assetId: string) => {
    sendMessage<MessageToEngine>({ event: "highlight", assetId });
  },
  clearHighlights: () => {
    sendMessage<MessageToEngine>({ event: "clear-highlights" });
  },
};

const focusAsset = (assetId: AssetId) => {
    mapService.highlight(assetId);
    mapService.fitTo(assetId);

    setTimeout(() => {
      mapService.clearHighlights();
    }, CLEAR_HIGHLIGHTS_TIMEOUT);
  };

export const PipeList = ({ pipes }: PipeListProps) => {
  return (
    <div>
      {pipes.length > 0 && (
        <ol>
          {pipes.map((pipe) => (
            <li key={pipe.id}>
              <div>{pipe.id}</div>
              <div>{pipe.years}</div>
              <div>{pipe.maxPressure}</div>
              <button
                onClick={() => focusAsset(pipe.id)}
              >
                <IconMapPointer aria-label="Map pointer" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};