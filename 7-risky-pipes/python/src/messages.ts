export type MessageToUI = {
  type: "has-api-key";
  hasKey: boolean;
} | {
  type: "weather-forecast";
  location: string;
  temp: number;
  wind: number;
  humidity: number;
  iconUrl: string;
}