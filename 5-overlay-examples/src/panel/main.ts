import { sendMessage } from "@qatium/sdk/ui";

const overlays = [
  "ArcLayer","IconLayer","LineLayer","PointCloudLayer","ScatterplotLayer","ColumnLayer","GridCellLayer","PathLayer","PolygonLayer","GeoJsonLayer","TextLayer","SolidPolygonLayer","ContourLayer","GridLayer","GPUGridLayer","CPUGridLayer","HexagonLayer","ScreenGridLayer","HeatmapLayer","TripsLayer","SimpleMeshLayer"
]

document.querySelector("#select-layer")!.innerHTML = overlays.reduce(
  (acc, overlay) => acc +=`<option id=${overlay}>${overlay}</option>`
, "");

document.querySelector("#select-layer")?.addEventListener("change", (ev) => {
  const overlay = (ev.currentTarget as any)!.value;
  sendMessage({ overlay });
})