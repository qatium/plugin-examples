import { AssetId } from "@qatium/sdk";
import { sendMessage } from "@qatium/sdk/ui";
import { MessageToEngine } from "../../communication/messages";
import IconMapPointer from "../assets/icon-map-pointer.svg";
import { PipeInRisk } from "../../types";
import { useTranslation } from "react-i18next";

type PipeListProps = {
  pipes: PipeInRisk[];
};


const mapService = {
  fitTo: (assetId: string) => {
    sendMessage<MessageToEngine>({ event: "fit-to", assetId });
  },
  highlight: (assetId: string) => {
    sendMessage<MessageToEngine>({ event: "highlight", assetId });
  },
};

const focusAsset = (assetId: AssetId) => {
  mapService.highlight(assetId);
  mapService.fitTo(assetId);
};

export const PipeList = ({ pipes }: PipeListProps) => {
  const { t } = useTranslation();

  return (
    <div className="pipe-list vstack full-width">
      {pipes.length > 0 ? (
        <ol>
          {pipes.map((pipe) => (
            <li key={pipe.id} className="pipe-data">
              <div className="pipe-id">{pipe.id}</div>
              <div>{pipe.years}</div>
              <div>{pipe.maxPressure.toFixed(2)}</div>
              <button
                onClick={() => focusAsset(pipe.id)}
              >
                <IconMapPointer aria-label="Map pointer" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p>{t("emptyPipeList")}</p>
      )}
    </div>
  );
};