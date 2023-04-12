import * as L from 'leaflet';
import * as PIXI from 'pixi.js';

// declare function setEventSystem(renderer: PIXI.Renderer, destroyInteractionManager: boolean, autoPreventDefault: boolean): void;

// declare function projectionZoom(map: L.Map): number;

interface Utils {
  latLngToLayerPoint: (latLng: L.LatLng, zoom: number) => L.Point;
  layerPointToLatLng: (point: L.Point, zoom: number) => L.LatLng;
  getScale: (zoom: number) => number;
  getRenderer: () => PIXI.Renderer;
  getContainer: () => PIXI.Container;
  getMap: () => L.Map;
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
  pane?: 'markerPane' | 'overlayPane' | 'shadowPane' | 'tilePane' | 'mapPane' |'tooltipPane' | 'popupPane';
  zIndex?: number;

}

declare class PixiOverlay extends L.Layer {
  redraw: (data?: any) => this;
  destroy: () => void;
  bringToFront: () => this;
  bringToBack: () => this;
  setOptions: (options: PixiOverlayOptions) => void;
  getOptions: () => PixiOverlayOptions;
  constructor(drawCallback: (utils: any) => void, pixiContainer?: PIXI.Container, options?: PixiOverlayOptions);


}
