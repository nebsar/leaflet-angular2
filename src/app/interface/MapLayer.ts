export type GISLayer = {} | null;
export type Layer = Lyr | null;

export interface Lyr {
  setVisible: (visible: boolean) => void;
  getGISLayer: () => any;
}

export abstract class MapLayer implements Lyr {

  gisLayer: GISLayer;

  protected constructor(layer: GISLayer) {
    this.gisLayer = layer;
  }

  setVisible(visible: boolean): void {
    this.setGISLayerVisibility(visible);
  }

  abstract setGISLayerVisibility(visible: boolean): void

  getGISLayer():any{
    return this.gisLayer;
  };
}


