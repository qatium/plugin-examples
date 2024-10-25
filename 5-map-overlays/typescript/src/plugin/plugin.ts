import { OBJLoader } from "@loaders.gl/obj";
import { Feature, LineString, Point, Polygon } from "geojson";

import {
  Junction,
  OverlayLayer,
  OverlayLayerType
} from "@qatium/sdk";
import { Plugin } from '@qatium/sdk/plugin';

type Overlay = Exclude<OverlayLayerType,
  "HexagonLayer" |
  "H3ClusterLayer" |
  "H3HexagonLayer" |
  "MVTLayer" |
  "QuadkeyLayer" |
  "S2Layer" |
  "TerrainLayer" |
  "Tile3DLayer" |
  "TileLayer" |
  "ScenegraphLayer"
>;

type Message = { overlay: Overlay }

export class MyPlugin implements Plugin {
  private activeOverlay: Overlay = "ArcLayer";

  run() {
    this[this.activeOverlay]()
  }

  onMessage(message: Message) {
    this.activeOverlay = message.overlay;
    this.run();
  }

  SimpleMeshLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { pressure: p.simulation!.pressure }
    }) as Feature);

    sdk.map.addOverlay([{
      id: "SimpleMeshLayer",
      type: "SimpleMeshLayer",
      data,
      visible: true,
      loaders: [OBJLoader],
      mesh: "http://localhost:8888/teapot.obj",
      sizeScale: 10,
      getPosition: (f: Feature<Point>) => f.geometry.coordinates as [number, number],
      getWeight: (f: Feature) => f.properties!.pressure,
      getOrientation: () => [0, 90, 90],
      getColor: (f: Feature) => [f.properties!.pressure, 255,f.properties!.pressure,255]
    } as OverlayLayer<"SimpleMeshLayer">]);
  }

  HeatmapLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { pressure: p.simulation!.pressure }
    }) as Feature);

    sdk.map.addOverlay([{
      id: "ScreenGridLayer",
      type: "HeatmapLayer",
      data,
      visible: true,
      aggregation: "MEAN",
      radiusPixels: 25,
      opacity: 0.4,
      getPosition: (f: Feature<Point>) => f.geometry.coordinates as [number, number],
      getWeight: (f: Feature) => f.properties!.pressure,
    } as OverlayLayer<"HeatmapLayer">]);
  }

  ScreenGridLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { pressure: p.simulation!.pressure }
    }) as Feature);

    sdk.map.addOverlay([{
      id: "ScreenGridLayer",
      type: "ScreenGridLayer",
      data,
      visible: true,
      cellSizePixels: 50,
      colorRange: [
        [0, 25, 0, 25],
        [0, 85, 0, 85],
        [0, 127, 0, 127],
        [0, 170, 0, 170],
        [0, 190, 0, 190],
        [0, 255, 0, 255]
      ],
      getPosition: (f: Feature<Point>) => f.geometry.coordinates as [number, number],
      getWeight: (f: Feature) => f.properties!.pressure,
    } as OverlayLayer<"ScreenGridLayer">]);
  }

  ContourLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { pressure: p.simulation!.pressure }
    }) as Feature);

    sdk.map.addOverlay([{
      id: "ContourLayer",
      type: "ContourLayer",
      data,
      cellSize: 100,
      contours: [
        {threshold: 60, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
        {threshold: 70, color: [55, 0, 55], zIndex: 0},
        {threshold: 80, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
        {threshold: 100, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
      ],
      getPosition: (f: Feature<Point>) => f.geometry.coordinates as [number, number],
      getWeight: (f: Feature) => f.properties!.pressure,
      aggregation: "MAX",
    } as OverlayLayer<"ContourLayer">]);
  }

  TextLayer() {
    const data = sdk.network.getTanks().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { id: p.id }
    }) as Feature);

    sdk.map.addOverlay([{
      id: "TextLayer",
      type: "TextLayer",
      data,
      getPosition: (f: Feature<Point>) => [f.geometry.coordinates[0], f.geometry.coordinates[1], 10],
      getText: (f: Feature) => f.properties!.id,
      getSize: () => 24,
      getColor: () => [255, 255, 255, 255],
      fontFamily: "Arial"
    } as OverlayLayer<"TextLayer">]);
  }

  GeoJsonLayer() {
    const data = sdk.network.getPipes().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {}
    }) as Feature);

    sdk.map.addOverlay([{
      id: "GeoJsonLayer",
      type: "GeoJsonLayer",
      data,
      getLineColor: [128, 0, 255, 255],
      getLineWidth: 20
    } as OverlayLayer<"GeoJsonLayer">]);
  }

  SolidPolygonLayer() {
    const data = [{
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          sdk.network.getAsset("Nellybay")?.geometry.coordinates,
          sdk.network.getAsset("Mandalay_P1")?.geometry.coordinates,
          sdk.network.getAsset("Arcadia_DMA_PRV")?.geometry.coordinates,
        ]
      },
      properties: {}
    } as Feature<Polygon>];

    sdk.map.addOverlay([{
      id: "SolidPolygonLayer",
      type: "SolidPolygonLayer",
      data,
      extruded: true,
      getPolygon: (d: Feature<Polygon>) => d.geometry.coordinates as unknown as [number, number][],
      getElevation: () => 100,
      getFillColor: () => [64, 140, 0, 255],
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 20
    } as OverlayLayer<"SolidPolygonLayer">]);
  }

  PolygonLayer() {
    const data = [{
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          sdk.network.getAsset("Nellybay")?.geometry.coordinates,
          sdk.network.getAsset("Mandalay_P1")?.geometry.coordinates,
          sdk.network.getAsset("Arcadia_DMA_PRV")?.geometry.coordinates,
        ]
      },
      properties: {}
    } as Feature<Polygon>];

    sdk.map.addOverlay([{
      id: "PolygonLayer",
      type: "PolygonLayer",
      data,
      getPolygon: (d: Feature<Polygon>) => d.geometry.coordinates,
      getElevation: () => 10,
      getFillColor: () => [64, 140, 0, 255],
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 20
    } as OverlayLayer<"PolygonLayer">]);
  }

  PathLayer() {
    const data = sdk.network.getPipes().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {}
    }) as Feature);

    sdk.map.addOverlay([{
      type: "PathLayer",
      id: "PathLayer",
      data,
      getWidth: () => 8,
      getColor: () => [128, 0, 128, 255],
      getPath: (f: Feature) => {
        return (f.geometry as LineString).coordinates.map((c) => [c[0], c[1], 10]) as [number, number, number][]
      },
      visible: true
    } as OverlayLayer<"PathLayer">]);
  }

  TripsLayer() {
    const max = 1000;
    const data = sdk.network.getPipes().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {
        timestamps: p.geometry.coordinates.map((_, i) => i / p.geometry.coordinates.length * max)
      }
    }) as Feature);

    sdk.map.addOverlay([{
      type: "TripsLayer",
      id: "TripsLayer",
      data,
      positionFormat: "XY",
      widthUnits: "pixels",
      capRounded: false,
      jointRounded: true,
      fadeTrail: true,
      getWidth: () => 8,
      getPath: (f: Feature<LineString>) => f.geometry.coordinates as [number, number][],
      getColor: () => [255, 0, 255, 255],
      getTimestamps: (f: Feature) => f.properties!.timestamps,
      currentTime: max,
      trailLength: max / 2,
      visible: true
    } as OverlayLayer<"TripsLayer">]);
  }

  GridCellLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'GridCellLayer',
      type: "GridCellLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      diskResolution: 12,
      extruded: true,
      cellSize: 50,
      elevationScale: 10,
      getElevation: (d: Feature) => d.properties!.elevation,
      getFillColor: (d: Feature) => [48, 128, d.properties!.elevation * 10, 255],
    } as OverlayLayer<"GridCellLayer">]);
  }

  GridLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'GridLayer',
      type: "GridLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      diskResolution: 12,
      extruded: true,
      cellSize: 80,
      elevationScale: 1,
      getElevation: (d: Feature) => d.properties!.elevation,
      getFillColor: (d: Feature) => [48, 128, d.properties!.elevation * 10, 255],
      _filterData: null
    } as OverlayLayer<"GridLayer">]);
  }

  CPUGridLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'CPUGridLayer',
      type: "CPUGridLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      diskResolution: 12,
      extruded: true,
      cellSize: 80,
      elevationScale: 1,
      getElevation: (d: Feature) => d.properties!.elevation,
      getFillColor: (d: Feature) => [48, 128, d.properties!.elevation * 10, 255],
      _filterData: null
    } as OverlayLayer<"CPUGridLayer">]);
  }

  GPUGridLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'GPUGridLayer',
      type: "GPUGridLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      diskResolution: 12,
      extruded: true,
      cellSize: 80,
      elevationScale: 1,
      getElevation: (d: Feature) => d.properties!.elevation,
      getFillColor: (d: Feature) => [48, 128, d.properties!.elevation * 10, 255],
      _filterData: null
    } as OverlayLayer<"GPUGridLayer">]);
  }

  ColumnLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'ColumnLayer',
      type: "ColumnLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      diskResolution: 12,
      extruded: true,
      radius: 30,
      elevationScale: 10,
      getElevation: (d: Feature) => d.properties!.elevation,
      getFillColor: (d: Feature) => [48, 128, d.properties!.elevation * 10, 255],
    } as OverlayLayer<"ColumnLayer">]);
  }

  ScatterplotLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'ScatterplotLayer',
      type: "ScatterplotLayer",
      data,
      stroked: true,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      getRadius: () => 2,
      getFillColor: [255, 140, 0],
      getLineColor: [0, 0, 0],
      getLineWidth: 2,
      radiusScale: 6,
      pickable: true
    } as OverlayLayer<"ScatterplotLayer">]);
  }

  PointCloudLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { elevation: p.elevation }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'PointCloudLayer',
      type: "PointCloudLayer",
      data,
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], d.properties!.elevation];
      },
      getNormal: () => [1, 0, 0],
      getColor: () => [255, 0, 255, 255],
      pointSize: 4,
      coordinateOrigin: [sdk.map.getCamera().center.lng, sdk.map.getCamera().center.lat, 10]
    } as OverlayLayer<"PointCloudLayer">]);
  }

  LineLayer() {
    const data = sdk.network.getPipes().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {}
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'LineLayer',
      type: "LineLayer",
      data,
      getSourcePosition: (d: Feature) => {
        const p = (d.geometry as LineString).coordinates[0];
        return [p[0], p[1], 0];
      },
      getTargetPosition: (d: Feature) => {
        const p = (d.geometry as LineString).coordinates[(d.geometry as LineString).coordinates.length - 1];
        return [p[0], p[1], 0];
      },
      getColor: () => [255, 0, 255, 128],
      getWidth: 12,
      pickable: true
    } as OverlayLayer<"LineLayer">]);
  }

  IconLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {}
    }) as Feature);

    const mapping = {
      hamburger: {
        x: 0,
        y: 0,
        width: 160,
        height: 160,
        mask: false,
        anchorX: 80,
        anchorY: 80
      },
      paella: {
        x: 160,
        y: 0,
        width: 160,
        height: 160,
        mask: false,
        anchorX: 80,
        anchorY: 80
      }
    };

    sdk.map.addOverlay([{
      id: 'IconLayer',
      type: "IconLayer",
      data,
      getIcon: () => Math.random() > 0.5 ? 'hamburger' : 'paella',
      getColor: () => [255, 255, 255, 255],
      getPosition: (d: Feature) => {
        const p = (d.geometry as Point).coordinates;
        return [p[0], p[1], 0];
      },
      getSize: () => 24,
      visible: true,
      iconAtlas: 'http://localhost:8888/atlas.png',
      iconMapping: mapping,
      billboard: true
    } as OverlayLayer<"IconLayer">]);
  }

  ArcLayer() {
    const data = sdk.network.getPipes().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: {
        sourcePressure: (sdk.network.getNeighborAssets(p.id)[0] as Junction).simulation?.pressure,
        targetPressure: (sdk.network.getNeighborAssets(p.id)[1] as Junction).simulation?.pressure
      }
    }) as Feature);

    sdk.map.addOverlay([{
      id: 'ArcLayer',
      data,
      type: "ArcLayer",
      getSourcePosition: (d: Feature) => {
        const p = (d.geometry as LineString).coordinates[0];
        return [p[0], p[1], 0];
      },
      getTargetPosition: (d: Feature) => {
        const p = (d.geometry as LineString).coordinates[(d.geometry as LineString).coordinates.length - 1];
        return [p[0], p[1], 0];
      },
      getHeight: 1,
      getSourceColor: (f: Feature) => [f.properties!.sourcePressure * 2, 0, 255, 255],
      getTargetColor: (f: Feature) => [f.properties!.targetPressure * 2, 0, 130, 255],
      getWidth: 4
    } as OverlayLayer<"ArcLayer">]);
  }

  HexagonLayer() {
    const data = sdk.network.getJunctions().map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: { pressure: p.simulation!.pressure }
    }) as Feature);

    const COLOR_PALETTE_HEX = [
      "#796ebd",
      "#bb66a6",
      "#d56f9b",
      "#e87c90",
      "#f48d87",
      "#faa17f",
      "#fcb77d",
      "#e2d57e"
    ];

    function hexToRgb(hex: string): [number, number, number, number] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          255
        ]
        : [0, 0, 0, 255];
    }

    sdk.map.addOverlay([{
      id: "hexagons",
      type: "HexagonLayer",
      data,
      opacity: 0.7,
      coverage: 0.95,
      radius: 100,
      visible: true,
      colorRange: COLOR_PALETTE_HEX.map((c) => hexToRgb(c)),
      colorDomain: [-0.5, COLOR_PALETTE_HEX.length - 0.5],
      _filterData: null,
      getColorValue: () => Math.floor(Math.random() * COLOR_PALETTE_HEX.length),
      getPosition: (junction: unknown) =>
        (junction as Junction).geometry.coordinates as [number, number]
    } as OverlayLayer<"HexagonLayer">]);
  }
}