import {Component, OnInit} from '@angular/core';
import * as PIXI from 'pixi.js';
import * as L from 'leaflet';
import 'leaflet-path-drag';
import 'leaflet-editable';
//import 'leaflet-editable-drag';
import {PixiOverlay, Utils} from '../pixioverlay/leafletpixioverlay';
import '@geoman-io/leaflet-geoman-free';
import {MgrsGraticule} from "../mgrsgraticule/MgrsGraticule";
import {EntityControl, PolygonControl, PolylineControl} from "../shape-controls/shape-editors";
import {solveCollision} from "../geometry/solvecollision";
import {Entity, IconTextureHash} from "../entity/entity";
import {Circle, LatLng, Polygon} from "leaflet";
import {Container, Graphics, Rectangle, Renderer, Sprite} from "pixi.js";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: L.Map;
  private centroid: L.LatLngExpression = [0.0, 0.0]; //

  selected: boolean = false;

  dragged: boolean = false;

  mouseDown: boolean = false;

  ms2525IconTextureHash: IconTextureHash = {};

  militarySymbolLayer: PixiOverlay;

  selectedGraphic: Graphics | Sprite | null;

  /* To use for injections */
  constructor() {
  }

  onLayerAdd = (event: any) => {
    // console.log(event.layer);
    //   console.log("layer added")
    let pixiOverlayDiv = this.militarySymbolLayer.getPane()?.querySelector('.leaflet-pixi-layer');
    if ((pixiOverlayDiv as HTMLDivElement).style) {
      (pixiOverlayDiv as HTMLDivElement).style.zIndex = '300';
    }


  }

  private initMap(): void {
    let milSymbol1 = 'shgpewrh--mt';
    let milSymbol2 = 'sfgpewrh--mt';
    let milSymbol3 = 'sugpewrh--mt';
    // quantity: '200',
    // staffComments: 'for reinforcements'.toUpperCase(),
    // additionalInformation: 'added support for JJ'.toUpperCase(),
    // direction: '270',
    // type: 'machine gun'.toUpperCase(),
    // dtg: '30140000ZSEP97',
    // location: '0900000.0E570306.0N',
    let milSymbol4 = 'sfgpucatw--dca-';
    let milSymbol5 = 'shgpucatw--dca-';
    let milSymbol6 = 'sugpucatw--dca-';
    let milSymbol7 = 'GFG*GPWA--****X';
    let milSymbol8 = 'GFG*DPOF--****X';
    let milSymbol9 = 'GHG*DPT---****X';
    let milSymbol10 = 'GFG*GPAM--****X';
    let milSymbol11 = 'GFG*GPOW--****X';
    let milSymbol12 = 'GFG*GPPD--****X';


    this.map = new L.Map('map', {
      editable: true,
      center: this.centroid,
      zoom: 12,
    });

    let symbols: string[] = [milSymbol1, milSymbol2, milSymbol3, milSymbol4, milSymbol5, milSymbol6, milSymbol7, milSymbol8, milSymbol9, milSymbol10, milSymbol11, milSymbol12];


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

    new MgrsGraticule(this.map, "mgrs", true);

    const tileLayer: L.TileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 21,
        minZoom: 0,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

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

    var selectedShape: L.Path | null;
    var clikedOnShape: boolean;

    // this.map.on('layeradd', (e) => {
    //   console.log("layer added " + e.layer.getTooltip());
    // });


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

    this.map.on('mousemove', (e) => {
      if (this.selectedGraphic && this.mouseDown) {
        let point: L.Point = project(e.latlng);
        this.selectedGraphic.x = point.x;
        this.selectedGraphic.y = point.y;
        this.militarySymbolLayer.redraw();
      }
    });

    this.map.on('mousedown', (e) => {
      this.mouseDown = true;
    });

    this.map.on('mouseup', () => {
      if (this.mouseDown && this.selectedGraphic) {
        this.mouseDown = false;
        this.selectedGraphic.alpha = 1.0;
        this.map.dragging.enable();
        this.dragged = false;
        this.selectedGraphic = null;
        this.militarySymbolLayer.redraw();
      }
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

    this.map.addLayer(tileLayer);

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

    //This is about Geoman control buttons.
    const drawingButtonsDiv = document.querySelector('.leaflet-pm-draw');

    if (drawingButtonsDiv?.children) {
      const buttonContainers = Array.from(drawingButtonsDiv.children) as HTMLDivElement[];
      for (const buttonContainer of buttonContainers) {
        buttonContainer.firstChild?.addEventListener('mousedown', (e) => {
          this.militarySymbolLayer.bringToFront();
          // this.militarySymbolLayer.setOptions({pane: "markerPane"});
          // this.militarySymbolLayer.redraw();
        });
      }
    }

    const editButtonsDiv = document.querySelector('.leaflet-pm-edit');

    if (editButtonsDiv?.children) {
      const buttonContainers = Array.from(editButtonsDiv.children) as HTMLDivElement[];
      for (const buttonContainer of buttonContainers) {
        buttonContainer.firstChild?.addEventListener('mousedown', (e) => {
          if (buttonContainer.title === "Drag Layers" || buttonContainer.title === "Remove Layers") {
            let pixiOverlayDiv = this.militarySymbolLayer.getPane()?.querySelector('.leaflet-pixi-layer');
            if ((pixiOverlayDiv as HTMLDivElement).style) {
              (pixiOverlayDiv as HTMLDivElement).style.zIndex = '101';
            }
          }
        });
      }
    }

///////////////// GEOMAN CONTROL BUTTONS //////////////////////

    this.map.addLayer(drawnFeatures);

    let markers: Entity[] = [];
    let markerCoords = new Map<PIXI.Sprite, L.LatLngExpression>();

    const pixiContainer: PIXI.Container = new PIXI.Container();
    pixiContainer.cullable = true;
    //pixiContainer.eventMode = 'dynamic';
    //pixiContainer.interactiveChildren = true;

    for (let i: number = 0; i < 100000; i++) {
      let latlon: L.LatLngTuple = this.centroid as L.LatLngTuple;
      let markerLocation: L.LatLngExpression = [
        latlon[0] + Math.random() * 60 - 30,
        latlon[1] + Math.random() * 60 - 30,
      ];

      let marker: Entity = new Entity(symbols[Math.floor(Math.random() * symbols.length)], this);
      marker.eventMode = 'dynamic';
      //marker.interactiveChildren = true;
      //marker.interactive = false;

      markers.push(marker);
      markerCoords.set(marker, markerLocation);
      pixiContainer.addChild(marker);
    }

    this.map.on('mousedown', (e) => {
      if (this.selected) {
        this.selected = false;
        //console.log('coming from pixi sprite')
      } else {
        markers.forEach((marker) => {
          marker.selected = false;
          marker.removeSelectionBox();
        });

        this.militarySymbolLayer.redraw();
      }
    });


    this.map.on("layeradd", this.onLayerAdd);

    let firstDraw = true;
    let prevZoom: any;
    // const colorScale = d3.scaleLinear().domain([0, 50, 100])
    //   .range(["#c6233c", "#ffd300", "#008000"]);

    let project: Function;
    let unProject: Function;


    this.militarySymbolLayer = new PixiOverlay((utils: Utils) => {
      const zoom: number = utils.getMap().getZoom();
      const container: Container = utils.getContainer();
      const renderer: Renderer = utils.getRenderer();
      const map: L.Map = utils.getMap();
      project = utils.latLngToLayerPoint;
      unProject = utils.layerPointToLatLng;
      const scale: number = utils.getScale(zoom);
      const invScale: number = 1 / scale;

      markers.forEach((marker) => {
        if (marker.selected) {
          //console.log("selection box?")
          marker.addSelectionBox();
        }
      });

      if (firstDraw) {
        markers.forEach((marker) => {
          const coords: L.Point = project(markerCoords.get(marker));
          marker.x = coords.x;
          marker.y = coords.y;
          //marker.anchor.set(0.5, 1);
        });
      }

      if (firstDraw || prevZoom !== zoom) {
        const mapBounds: L.LatLngBounds = map.getBounds();
        //  console.log(project(mapBounds.getNorthWest()) + " " + project(mapBounds.getNorthEast()) + " " + project(mapBounds.getSouthWest()) + " " + project(mapBounds.getSouthEast()));
        // console.log(container.getBounds());
        //container.set = (new Rectangle());
        markers.forEach((marker) => {
          marker.scale.set(invScale);
        });
      }

      firstDraw = false;
      prevZoom = zoom;

      renderer.render(container);
    }, pixiContainer, {
      //pane: 'markerPane',
      // forceCanvas : true
    });


    this.map.addLayer(this.militarySymbolLayer);
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
