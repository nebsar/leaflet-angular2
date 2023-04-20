import {GISLayer} from "./MapLayer";


export interface LayerHandler {
  addLayer: (layer: GISLayer) => void;
}

export abstract class MapLayerHandler implements LayerHandler {
  addLayer(layer: GISLayer): void {
    this.gisAddLayer(layer);
  }

  abstract gisAddLayer(layer: GISLayer): void;

}
