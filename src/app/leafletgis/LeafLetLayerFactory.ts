import {Map, TileLayer} from 'leaflet';
import {MapLayerFactory} from "../interface/LayerFactory";
import {MGRSGraticule} from "../mgrsgraticule/MgrsGraticule";
import * as L from "leaflet";
import WMS = TileLayer.WMS;
import {WMTS} from "./Leaflet-WMTS";
import {LeafletMapLayer} from "./LeafletMapLayer";

export class LeafletLayerFactory extends MapLayerFactory {

  map: Map;

  constructor(map: Map) {
    super();
    this.map = map;
  }

  createMGRSGraticuleLayer(): any {
    return new MGRSGraticule(this.map, "mgrs", true);
  }

  gisCreateTiledLayer(url: string): LeafletMapLayer {

    const tileLayer: L.TileLayer = L.tileLayer(
      url, {maxZoom: 21}
    );
    let leafletMapLayer = new LeafletMapLayer(tileLayer, this.map);
    // this.map.addLayer(tileLayer);
    return leafletMapLayer;
  }

  gisCreateWMSLayer(url: string): LeafletMapLayer {
    const wmsLayer: WMS = new WMS(url, {maxZoom: 21});
    let leafletMapLayer = new LeafletMapLayer(wmsLayer, this.map);
    //this.map.addLayer(wmsLayer);
    return leafletMapLayer;
  }

  gisCreateWMTSLayer(url: string): LeafletMapLayer {
    const wmtsLayer: WMTS = new WMTS(url,
      {
        layer: 'EOC Basemap',
        tilematrixset: "EPSG:3857",
        format: 'image/png',

      });
    // this.map.addLayer(wmtsLayer);
    let leafletMapLayer = new LeafletMapLayer(wmtsLayer, this.map);
    //this.map.addLayer(wmsLayer);
    return leafletMapLayer;
  }


}
