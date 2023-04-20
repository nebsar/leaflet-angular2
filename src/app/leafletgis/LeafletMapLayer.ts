import {Layer, Map} from 'leaflet'
import {MapLayer} from "../interface/MapLayer";
import {PixiOverlay} from "../pixioverlay/leafletpixioverlay";
import {LeafletMilitaryMapElement} from "./LeafletMilitaryMapElement";

export class LeafletMapLayer extends MapLayer {

  map: Map;

  constructor(layer: Layer, map: Map) {
    super(layer);
    this.map = map;
  }

  setGISLayerVisibility(visible: boolean): void {
    if (visible) {
      this.map.addLayer(this.gisLayer as Layer);
    } else {
      this.map.removeLayer(this.gisLayer as Layer);
    }
  }

  addElement(element: LeafletMilitaryMapElement): void {
    (this.gisLayer as PixiOverlay).addGraphics(element.GISRefObject);
  }

}
