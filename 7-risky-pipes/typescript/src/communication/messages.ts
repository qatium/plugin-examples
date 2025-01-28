import { FormValues, PipeInRisk } from "../types";


export type MessageToUI =
  | {
      event: "pipes-in-risk";
      pipes: PipeInRisk[];
    }
  | {
      event: "pressure-unit";
      pressureUnit: string;
    };


export type MessageToEngine =
  |{
      event: "fit-to";
      assetId: string;
    }
  | {
      event: "highlight";
      assetId: string;
    }
  | {
      event: "clear-highlights";
    }
  | {
      event: "request-risky-pipes";
      payload: FormValues;
    };
  