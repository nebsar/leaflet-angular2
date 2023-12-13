import {Layer} from "./MapLayer";

export interface LayerFactory {

  createMGRSGraticuleLayer: () => Layer;
  createTiledLayer: (url: string, layers?: string[]) => Layer | Promise<Layer>;
  createMilitarySymbolLayer: () => Layer;

}

export abstract class MapLayerFactory implements LayerFactory {

  abstract createMGRSGraticuleLayer(): Layer;

  createTiledLayer(url: string, layers?: string[]): Layer | Promise<Layer> {
    if (url.toLowerCase().includes("tile")) {
      return this.gisCreateTiledLayer(url);
    } else if (url.toLowerCase().includes("wms")) {
      return this.gisCreateWMSLayer(url, layers);
    } else if (url.toLowerCase().includes("wmts")) {
      return this.gisCreateWMTSLayer(url);
    }
    return null;
  }

  createMilitarySymbolLayer(): Layer {
    return this.gisCreateMilitarySymbolLayer();
  };

  protected abstract gisCreateTiledLayer(url: string): Layer | Promise<Layer>;

  protected abstract gisCreateWMSLayer(url: string, layer?: string[]): Layer | Promise<Layer>;

  protected abstract gisCreateWMTSLayer(url: string): Layer | Promise<Layer>;

  protected abstract gisCreateMilitarySymbolLayer(): Layer;

}
