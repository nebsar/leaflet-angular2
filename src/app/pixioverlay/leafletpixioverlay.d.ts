import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import {DisplayObject} from "pixi.js";
import {Display} from "../interface/MapDisplay";
import {Entity} from "../entity/entity";
import {LatLng, Point} from "leaflet";

// declare function setEventSystem(renderer: PIXI.Renderer, destroyInteractionManager: boolean, autoPreventDefault: boolean): void;

// declare function projectionZoom(map: L.Map): number;

interface Utils {
  latLngToLayerPoint: (latLng: L.LatLng, zoom: number) => L.Point;
  layerPointToLatLng: (point: L.Point, zoom: number) => L.LatLng;
  getScale: (zoom: number) => number;
  getRenderer: () => PIXI.Renderer;
  getContainer: () => PIXI.Container;
  getMap: () => L.Map;
  getSymbolsArray: () => Entity[];
  getFirstRenderingArray: () => Entity[];
  setMarkerScale: (prevZoom: number, zoom: number, invScale: number) => Promise<void>;
}

interface PixiOverlayOptions {
  padding?: number;
  forceCanvas?: boolean;
  doubleBuffering?: boolean;
  resolution?: number;
  projectionZoom?: (map: L.Map) => number;
  destroyInteractionManager?: boolean;
  autoPreventDefault?: boolean;
  preserveDrawingBuffer?: boolean;
  clearBeforeRender?: boolean;
  shouldRedrawOnMove?: () => boolean;
  pane?: 'markerPane' | 'overlayPane' | 'shadowPane' | 'tilePane' | 'mapPane' | 'tooltipPane' | 'popupPane';
  zIndex?: number;
}

declare class PixiOverlay extends L.Layer {

  constructor(drawCallback: (utils: Utils) => void, options?: PixiOverlayOptions);

  redraw: (data?: any) => this;
  destroy: () => void;
  bringToFront: () => this;
  getSymbolsArray: () => Entity[];
  getFirstRenderingArray: () => Entity[];
  addGraphics: (graphics: Entity) => void;
  removeGraphicsAt: (index: number) => void;
  removeGraphics: (graphics: Entity) => void;
  bringToBack: () => this;
  setOptions: (options: PixiOverlayOptions) => void;
  getOptions: () => PixiOverlayOptions;
  project: (latLng: LatLng, zoom?: number) => Point;
  unProject: (point: Point, zoom?: number) => LatLng;
}
