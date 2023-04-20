import {Layer} from "./MapLayer";

export interface LayerFactory {

  createMGRSGraticuleLayer: () => any;
  createTiledLayer: (url: string) => Layer;

}

export abstract class MapLayerFactory implements LayerFactory {

  abstract createMGRSGraticuleLayer(): any;

  createTiledLayer(url: string): Layer {
    if (url.includes("tile")) {
      return this.gisCreateTiledLayer(url);
    } else if (url.includes("wms")) {
      return this.gisCreateWMSLayer(url);
    } else if (url.includes("wmts")) {
      return this.gisCreateWMTSLayer(url);
    }
    return null;
  }

  abstract gisCreateTiledLayer(url: string): Layer;

  abstract gisCreateWMSLayer(url: string): Layer;

  abstract gisCreateWMTSLayer(url: string): Layer;


}
