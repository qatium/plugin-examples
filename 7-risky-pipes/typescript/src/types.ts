import { AssetId } from "@qatium/sdk";

export type FormValues = {
  olderThanYears: number;
  maxPressure: number;
}


export type PipeInRisk = {
  years: string;
  maxPressure: number;
  id: AssetId
};