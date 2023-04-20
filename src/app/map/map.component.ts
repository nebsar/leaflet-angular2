import {Component, OnInit} from '@angular/core';
import * as PIXI from 'pixi.js';
import {Container, Graphics, Renderer, Sprite} from 'pixi.js';
import * as L from 'leaflet';
import {Circle, LatLng, Polygon} from 'leaflet';
import 'leaflet-path-drag';
import 'leaflet-editable';
//import 'leaflet-editable-drag';
import {PixiOverlay, Utils} from '../pixioverlay/leafletpixioverlay';
import '@geoman-io/leaflet-geoman-free';
import {MGRSGraticule} from "../mgrsgraticule/MgrsGraticule";
import {LeafletMapDisplay} from "../leafletgis/LeafletMapDisplay";
import {Display} from "../interface/MapDisplay";
import {Layer} from "../interface/MapLayer";
import {MilitaryElementType} from "../interface/ElementFactory";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: L.Map;
  mapDisplay: Display;


  dragged: boolean = false;

  mouseDown: boolean = false;


  /* To use for injections */
  constructor() {
  }


  private initMap(): void {


    this.mapDisplay = new LeafletMapDisplay();

    this.map = this.mapDisplay.getMap() as L.Map;

    //this.mapDisplay.getElementFactory().createMilitaryElement(MilitaryElementType.SYMBOL, milSymbol1);

    this.mapDisplay.getLayerFactory().createMGRSGraticuleLayer();


    // var polyline = L.polyline([[43.1, -81], [43.2, -80.5], [43.3, -81.5]]).addTo(this.map);
    // polyline.enableEdit();

    // var drawControl = L.Control.extend({
    //   options: {
    //     position: "topleft"
    //   },
    //
    //   onAdd: function () {
    //     var container = L.DomUtil.create("div", "leaflet-bar leaflet-draw-toolbar");
    //     var drawButton = L.DomUtil.create("a", "leaflet-draw-draw-polyline", container);
    //     drawButton.title = "Draw a polyline";
    //     drawButton.href = "#";
    //     return container;
    //   }
    // });

    // this.map.addControl(new drawControl());

    // var basemaps = {
    //   Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
    //     layers: 'TOPO-WMS'
    //   }),
    //
    //   Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
    //     layers: 'OSM-Overlay-WMS'
    //   }),
    //
    //   'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
    //     layers: 'TOPO-WMS,OSM-Overlay-WMS'
    //   }),
    //
    //   'Places, then topography': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
    //     layers: 'OSM-Overlay-WMS,TOPO-WMS'
    //   })
    // };
    //
    // L.control.layers(basemaps).addTo(this.map);
    //
    // basemaps.Topography.addTo(this.map);


    // let mgrsGraticuleLayer: MGRSGraticuleLayer = new MGRSGraticuleLayer();

    // this.map.addLayer(mgrsGraticuleLayer);


    // let polygonControl: PolygonControl = new PolygonControl(this.map);
    // let polylineControl: PolylineControl = new PolylineControl(this.map);
    // let entityControl: EntityControl = new EntityControl(this.map);
    // this.map.addControl(polygonControl);
    // this.map.addControl(polylineControl);
    // this.map.addControl(entityControl);
    //
    // this.map.on('editable:created', function (event) {
    //   const layer = event.layer;
    //   layer.on('click', (e) => {
    //     if (layer instanceof L.Polygon) {
    //       let polygon: L.Polygon = layer as L.Polygon;
    //       if (polygon.editEnabled()) {
    //         polygon.disableEdit();
    //       } else {
    //         polygon.enableEdit();
    //       }
    //
    //       console.log("ahan da polygon");
    //       layer.setStyle({
    //         fillColor: '#FF0000',
    //         fillOpacity: 0.5,
    //         fillRule: 'nonzero',
    //         weight: 6
    //       });
    //     }
    //   });
    //
    // });

    // this.map.on('layeradd', (e) => {
    //   console.log("layer added " + e.layer.getTooltip());
    // });

    var selectedShape: L.Path | null;
    var clikedOnShape: boolean;

    this.map.on('click', (e) => {
      clikedOnShape = false;
      let i: number = 0;
      this.map.eachLayer(layer => {
        i++;
      });
      // console.log("layer count " + i);
    });

    this.map.on('pm:rotate', (e) => {
      // console.log('rotating');
    });

    this.map.on('pm:remove', (e) => {
      selectedShape = null;
    });


    this.map.on('pm:create', (e) => {

      e.layer.on('click', (ev) => {
        let shape: L.Path = e.layer as L.Path;
        if (shape instanceof L.Polygon) {
          let polygon: L.Polygon = (shape as L.Polygon);
          polygon.setStyle({
            fillColor: '#FF0000',
            fillOpacity: 0.0,
            fillRule: 'nonzero'
          });
        } else if (shape instanceof L.Circle) {

        }
        clikedOnShape = true;
        const shapeType: string = ev.sourceTarget.pm._shape;
        switch (shapeType) {
          case 'Polygon': {
            if (selectedShape) {
              selectedShape.pm.disable()
            }
            let polygon: Polygon = (ev.sourceTarget as Polygon);

            if (!polygon.pm.enabled()) {
              selectedShape = polygon;
              polygon.pm.enable({
                allowSelfIntersection: false,
              });
            } else {
              selectedShape = null;
              polygon.pm.disable();
            }

            //  console.log(polygon);
            let latLonArray: LatLng[][] = polygon.getLatLngs() as LatLng[][];
            ev.sourceTarget.redraw();
            e.layer.bindPopup("" + latLonArray[0]);
            //   latLonArray[0].push(new LatLng(42.445, -81.55));
            latLonArray[0].forEach(ll => {
              //  console.log(ll);
            });
            break;
          }
          case 'Circle': {
            let circle: Circle = (ev.sourceTarget as Circle);
            if (selectedShape) {
              selectedShape.pm.disable()
            }
            selectedShape = circle;
            circle.pm.enable({
              allowSelfIntersection: false,
            });
            break;
          }
        }
        if (ev.sourceTarget._latlngs) {
          //  console.log(ev.sourceTarget._latlngs[0].length);
          //  console.log(ev.sourceTarget.pm._shape);
        } else {
          //  console.log(ev.sourceTarget.pm._shape);
        }
        // console.log(ev.sourceTarget );
      });
      e.layer.options.pmIgnore = false;
      L.PM.reInitLayer(e.layer);
    });

    this.map.on('pm:actionclick', (e) => {
      // console.log(e)
      // e.layer.options.pmIgnore = false;
      // L.PM.reInitLayer(e.layer);
    });

    this.map.on('click', (e) => {
      //  console.log(`On map click ${e.target instanceof Entity}`);
    });


    this.map.pm.addControls({
      position: 'topleft',
    });


    // var canvas = document.createElement("canvas");
    // canvas.id = "myCanvas";
    // canvas.style.position = "absolute";
    // canvas.style.top = "0";
    // canvas.style.left = "0";
    // canvas.style.zIndex = "1000";
    // document.body.appendChild(canvas);

// Get the 2D drawing context of the canvas
//     var ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
//
// // Draw a red arc on the canvas
//     var x = 100; // x-coordinate of center point
//     var y = 100; // y-coordinate of center point
//     var radius = 100;
//     var startAngle = 0; // in radians (0 = 3 o'clock position)
//     var endAngle = Math.PI; // in radians (Math.PI = 6 o'clock position)
//     var anticlockwise = false;
//     ctx.beginPath();
//     ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
//     ctx.strokeStyle = "#ff0000"; // red stroke color
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//     ctx.stroke();

    let tiledLayer: Layer = this.mapDisplay.getLayerFactory().createTiledLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    this.mapDisplay.getLayerHandler().addLayer(tiledLayer);

    // this.mapDisplay.getLayerFactory().addTiledLayer('https://tiles.geoservice.dlr.de/service/wmts');


    var drawnFeatures: L.FeatureGroup = new L.FeatureGroup<any>();

    // let drawControl: L.Control.Draw = new L.Control.Draw({
    //   draw: {
    //     marker: false,
    //     circlemarker: false,
    //   },
    //   edit: {
    //     featureGroup: drawnFeatures,
    //   }
    // });
    // this.map.addControl(drawControl);
    //
    // this.map.on(L.Draw.Event.CREATED, function (e) {
    //   let type = e.type;
    //   let layer = e.layer;
    //   drawnFeatures.addLayer(layer);
    // });


///////////////// GEOMAN CONTROL BUTTONS //////////////////////

    this.map.addLayer(drawnFeatures);


    // let firstDraw = true;
    // let prevZoom: any;
    // const colorScale = d3.scaleLinear().domain([0, 50, 100])
    //   .range(["#c6233c", "#ffd300", "#008000"]);


    //this.militarySymbolLayer.bringToFront();

    let i: number = 0;

    /*
       async function myCallback(): Promise<void> {
      markers.forEach((marker) => {
        if (unProject) {
          let location: L.LatLng = unProject([marker.x, marker.y]);
          location.lat += 0.001;
          let point: L.Point = project(location);
          marker.x = point.x;
          marker.y = point.y;
        }
      });

      pixiLayer.redraw();
    }

    async function asyncSetInterval(callback: () => Promise<void>, delay: number): Promise<number> {
      const intervalId = setInterval(async () => {
        await callback();
      }, delay);
      return intervalId;
    }

    const intervalId = asyncSetInterval(myCallback, 1000);
    * */


    // setInterval(function (this:MapComponent) {
    //   markers.forEach((marker) => {
    //     if (unProject) {
    //       let location: L.LatLng = unProject([marker.x, marker.y]);
    //       location.lat += 0.05;
    //       let point: L.Point = project(location);
    //       marker.x = point.x;
    //       marker.y = point.y;
    //     }
    //
    //   });
    //
    //   this.militarySymbolLayer.redraw();
    //   //   console.log(`${unproject([markers[0].x, markers[0].y])}`);
    // }.bind(this), 1000);

  }

  ngOnInit()
    :
    void {
    this.initMap()
  }

}
