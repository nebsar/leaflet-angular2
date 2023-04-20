import {MapDisplay} from "../interface/MapDisplay";
import {ElementFactory} from "../interface/ElementFactory";
import {LayerFactory} from "../interface/LayerFactory";
import {LayerHandler} from "../interface/LayerHandler";
import {latLng, latLngBounds, Map, MapOptions} from "leaflet";
import {LeafletElementFactory} from "./LeafletElementFactory";
import {LeafletLayerFactory} from "./LeafLetLayerFactory";
import {LeafletLayerHandler} from "./LeafletLayerHandler";
import * as L from "leaflet";
import {Container, Graphics, Renderer, Sprite} from "pixi.js";
import {Entity} from "../entity/entity";
import * as PIXI from "pixi.js";
import {PixiOverlay, Utils} from "../pixioverlay/leafletpixioverlay";
import {LeafletMilitaryMapElement} from "./LeafletMilitaryMapElement";
import {LeafletMapLayer} from "./LeafletMapLayer";

export class LeafletMapDisplay extends MapDisplay {
  leafletMap: Map;
  leafletElementFactory: LeafletElementFactory;
  leafletLayerFactory: LeafletLayerFactory;
  leafletLayerHandler: LeafletLayerHandler;
  dragged: boolean = false;
  selectedGraphic: Graphics | Sprite | null;
  selected: boolean = false;
  mouseDown: boolean = false;
  militarySymbolLayer: PixiOverlay;


  constructor() {
    super();

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

    let symbols: string[] = [milSymbol1, milSymbol2, milSymbol3, milSymbol4, milSymbol5, milSymbol6, milSymbol7, milSymbol8, milSymbol9, milSymbol10, milSymbol11, milSymbol12];

    const centroid: L.LatLngExpression = [0.0, 0.0]; //
    this.leafletMap = new Map('map', {
      editable: true,
      center: centroid,
      zoom: 12,
      attributionControl: false,
      maxBoundsViscosity: 1.0,
      maxZoom: 21,
      minZoom: 2.5,
    });
    var southWest = latLng(-89.98155760646617, -180),
      northEast = latLng(89.99346179538875, 180);
    var bounds = latLngBounds(southWest, northEast);
    this.leafletMap.setMaxBounds(bounds);

    this.leafletMap.on('drag', () => {
      this.leafletMap.panInsideBounds(bounds, {animate: false});
    });

    this.leafletElementFactory = new LeafletElementFactory(this);
    this.leafletLayerFactory = new LeafletLayerFactory(this.leafletMap);
    this.leafletLayerHandler = new LeafletLayerHandler(this.leafletMap);

    this.leafletMap.on('mousemove', (e) => {
      if (this.selectedGraphic && this.mouseDown) {
        let point: L.Point = project(e.latlng);
        this.selectedGraphic.x = point.x;
        this.selectedGraphic.y = point.y;
        this.militarySymbolLayer.redraw();
      }
    });

    this.leafletMap.on('mousedown', (e) => {
      this.mouseDown = true;
    });

    this.leafletMap.on('mouseup', () => {
      if (this.mouseDown && this.selectedGraphic) {
        this.mouseDown = false;
        this.selectedGraphic.alpha = 1.0;
        this.leafletMap.dragging.enable();
        this.dragged = false;
        this.selectedGraphic = null;
        this.militarySymbolLayer.redraw();
      }
    });

    this.leafletMap.on('mousedown', (e) => {
      if (this.selected) {
        this.selected = false;
        //console.log('coming from pixi sprite')
      } else {
        this.militarySymbolLayer.getSymbolsArray().forEach((marker) => {
          marker.selected = false;
          marker.removeSelectionBox();
        });

        this.militarySymbolLayer.redraw();
      }
    });

    let project: Function;
    let unProject: Function;
    let firstDraw: boolean = true;
    let prevZoom: number;

    //pixiContainer.eventMode = 'dynamic';
    //pixiContainer.interactiveChildren = true;

    this.militarySymbolLayer = new PixiOverlay((utils: Utils) => {
      const zoom: number = utils.getMap().getZoom();
      const container: Container = utils.getContainer();
      const renderer: Renderer = utils.getRenderer();
      const map: L.Map = utils.getMap();
      project = utils.latLngToLayerPoint;
      unProject = utils.layerPointToLatLng;
      const scale: number = utils.getScale(zoom);
      const invScale: number = 1 / scale;
      let symbolsArray = utils.getSymbolsArray();
      symbolsArray.forEach((marker) => {
        if (marker.selected) {
          //console.log("selection box?")
          marker.addSelectionBox();
        }
      });

      if (firstDraw) {
        symbolsArray.forEach((marker) => {
          const coords: L.Point = project(marker.location);
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
        symbolsArray.forEach((marker) => {
          marker.scale.set(invScale);
        });
      }

      firstDraw = false;
      prevZoom = zoom;

      renderer.render(container);
    }, {
      //pane: 'markerPane',
      // forceCanvas : true
    });

    let militaryLayer: LeafletMapLayer = new LeafletMapLayer(this.militarySymbolLayer, this.leafletMap);


    this.leafletMap.on("layeradd", this.onLayerAdd);


    for (let i: number = 0; i < 5000; i++) {
      let latlon: L.LatLngTuple = centroid as L.LatLngTuple;
      let markerLocation: L.LatLngExpression = [
        latlon[0] + Math.random() * 60 - 30,
        latlon[1] + Math.random() * 60 - 30,
      ];

      let sidc = symbols[Math.floor(Math.random() * symbols.length)];
      let entitiy = new Entity(sidc, this.getElementFactory() as LeafletElementFactory);
      // entitiy.interactiveChildren = true;
      // entitiy.interactive = false;
      entitiy.setLocation(markerLocation);
      let marker: LeafletMilitaryMapElement = {
        sidc: sidc,
        mapLayer: null,
        GISRefObject: entitiy
      }
      // new LeafletMilitaryMapElement(symbols[Math.floor(Math.random() * symbols.length)], this.getElementFactory() as LeafletElementFactory, markerLocation);

      //  let marker: Entity = new Entity(symbols[Math.floor(Math.random() * symbols.length)], this.getElementFactory() as LeafletElementFactory);
      //  marker.setLocation(markerLocation);
      militaryLayer.addElement(marker);
      // this.militarySymbolLayer.addGraphics(marker);


    }



    this.getLayerHandler().addLayer(militaryLayer);

    //This is about Geoman control buttons.
    const drawingButtonsDiv = document.querySelector('.leaflet-pm-draw');

    if (drawingButtonsDiv?.children) {
      const buttonContainers = Array.from(drawingButtonsDiv.children) as HTMLDivElement[];
      for (const buttonContainer of buttonContainers) {
        buttonContainer.firstChild?.addEventListener('mousedown', (e) => {
          this.militarySymbolLayer.bringToFront();
          this.militarySymbolLayer.setOptions({pane: "markerPane"});
          this.militarySymbolLayer.redraw();
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

    // this.leafletMap.addLayer(this.militarySymbolLayer);
  }

  getMap(): Map {
    return this.leafletMap;
  }

  setMapOptions(mapOptions: MapOptions) {
    this.leafletMap.options = mapOptions;
  }

  getElementFactory(): ElementFactory {
    return this.leafletElementFactory as ElementFactory;
  }

  getLayerFactory(): LayerFactory {
    return this.leafletLayerFactory as LayerFactory;
  }

  getLayerHandler(): LayerHandler {
    return this.leafletLayerHandler as LeafletLayerHandler;
  }

  onLayerAdd = (event: any) => {
    // console.log(event.layer);
    //   console.log("layer added")
    //This is important, do ont miss it!!!!!!
    let pixiOverlayDiv = this.militarySymbolLayer.getPane()?.querySelector('.leaflet-pixi-layer');
    if ((pixiOverlayDiv as HTMLDivElement).style) {
      (pixiOverlayDiv as HTMLDivElement).style.zIndex = '300';
    }

  }

}
