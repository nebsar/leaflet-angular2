import {MapLayerHandler} from "../interface/LayerHandler";
import * as L from 'leaflet';
import {Layer} from "../interface/MapLayer";

export class LeafletLayerHandler extends MapLayerHandler {

  leafletMap: L.Map;

  constructor(map: L.Map) {
    super();
    this.leafletMap = map;
  }

  gisAddLayer(layer: Layer): void {
     this.leafletMap.addLayer(layer?.getGISLayer() as L.Layer);
  }

}
