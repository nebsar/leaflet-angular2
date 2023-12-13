import {Map, TileLayer} from 'leaflet';
import {MapLayerFactory} from "../interface/LayerFactory";
import {MGRSGraticule} from "../mgrsgraticule/MgrsGraticule";
import * as L from "leaflet";
import WMS = TileLayer.WMS;
import {getWMTSCapabilities, WMTS} from "./Leaflet-WMTS";
import {LeafletMapLayer} from "./LeafletMapLayer";
import {Layer} from "../interface/MapLayer";
import {PixiOverlay, Utils} from "../pixioverlay/leafletpixioverlay";
import {Container, Renderer} from "pixi.js";
import {MGRSGraticuleLayer} from "../mgrsgraticule/MGRSGraticuleLayer";

export class LeafletLayerFactory extends MapLayerFactory {

  map: Map;

  constructor(map: Map) {
    super();
    this.map = map;
  }

  createMGRSGraticuleLayer(): any {
    return new LeafletMapLayer(new MGRSGraticuleLayer(), this.map);
    // return new MGRSGraticule(this.map, "mgrs", true);
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

  gisCreateWMTSLayer(url: string): Promise<LeafletMapLayer> {
    return getWMTSCapabilities(url).then(result => {
        let layerParameters = result[0];
        const wmtsLayer: WMTS = new WMTS(url,
          {
            layer: layerParameters['layername'],
            tilematrixset: layerParameters['tilematrixset'],
            format: layerParameters['format'],
            style: layerParameters['style']
          });
        // this.map.addLayer(wmtsLayer);
        let leafletMapLayer = new LeafletMapLayer(wmtsLayer, this.map);
        //this.map.addLayer(wmsLayer);
        return leafletMapLayer;
      }
    );
  }

  protected gisCreateMilitarySymbolLayer(): Layer {

    let prevZoom: number;
    let first: boolean = true;

    let militarySymbolLayer = new PixiOverlay((utils: Utils) => {
      const zoom: number = utils.getMap().getZoom();
      const container: Container = utils.getContainer();
      const renderer: Renderer = utils.getRenderer();
      const project: Function = utils.latLngToLayerPoint;
      const scale: number = utils.getScale(zoom);
      const invScale: number = 1 / scale;
      //console.log(`scale is ${invScale}`);
      let symbolsArray = utils.getSymbolsArray();
      let firstRenderingArray = utils.getFirstRenderingArray();
      symbolsArray.forEach((marker) => {
        if (marker.selected) {
          //console.log("selection box?")
          marker.addSelectionBox();
        }
      });

      while (firstRenderingArray.length > 0) {
        const marker = firstRenderingArray.pop();
        if (marker) {
          const coords: L.Point = project(marker.location);
          marker.x = coords.x;
          marker.y = coords.y;
          marker.scale.set(invScale);
          symbolsArray.push(marker);
        }
        //marker.anchor.set(0.5, 1);
      }
      if (prevZoom !== zoom) {
        utils.setMarkerScale(prevZoom, zoom, invScale);
        //const mapBounds: L.LatLngBounds = map.getBounds();
        //  console.log(project(mapBounds.getNorthWest()) + " " + project(mapBounds.getNorthEast()) + " " + project(mapBounds.getSouthWest()) + " " + project(mapBounds.getSouthEast()));
        // console.log(container.getBounds());
        //container.set = (new Rectangle());
      }

      prevZoom = zoom;
      renderer.render(container);
    }, {
      //pane: 'markerPane',
      // forceCanvas : true
    });

    return new LeafletMapLayer(militarySymbolLayer, this.map);
  }


}
