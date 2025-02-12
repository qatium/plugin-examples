import { AssetId } from "@qatium/sdk";
import { LineString, MultiLineString } from "geojson";

export type FormValues = {
  olderThanYears: number;
  maxPressure: number;
};

export type PipeInRisk = {
  years: string;
  maxPressure: number;
  id: AssetId;
  geometry: LineString | MultiLineString;
};

export type PointGeometry = { type: string; coordinates: number[] };
export type LineGeometry = LineString | MultiLineString;

export type OverlayFeature = {
  id: string;
  type: string;
  geometry: LineGeometry | PointGeometry;
  properties: { color: [number, number, number, number] };
};