import {Component, OnInit} from '@angular/core';
import * as PIXI from 'pixi.js';
import * as L from 'leaflet';
import 'leaflet-draw';
import ms from 'milsymbol';
import {Graticule} from "mgrsgraticule";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: L.Map;
  private centroid: L.LatLngExpression = [42.8601, -81.0589]; //

  private initMap(): void {
    var milSymbol1 = new ms.Symbol('shgpewrh--mt', {
      size: 35,
    }).asCanvas();

    var milSymbol2 = new ms.Symbol('shgpewrh--mt', {
      size: 35,
    });

    var milSymbol3 = new ms.Symbol('shgpewrh--mt', {
      size: 35,
      quantity: '200',
      staffComments: 'for reinforcements'.toUpperCase(),
      additionalInformation: 'added support for JJ'.toUpperCase(),
      direction: '270',
      type: 'machine gun'.toUpperCase(),
      dtg: '30140000ZSEP97',
      location: '0900000.0E570306.0N',
    }).asCanvas();

    this.map = L.map('map', {
      center: this.centroid,
      zoom: 12,
    });

    const tileLayer: L.TileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 21,
        minZoom: 0,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    this.map.addLayer(tileLayer);

    var drawnFeatures: L.FeatureGroup = new L.FeatureGroup<any>();

    let drawControl: L.Control.Draw = new L.Control.Draw({
      draw: {
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnFeatures,
      }
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, function (e) {
      let type = e.type;
      let layer = e.layer;
      drawnFeatures.addLayer(layer);
    });

    new Graticule(this.map, "mgrs", true);

    this.map.addLayer(drawnFeatures);


  }

  ngOnInit(): void {
    this.initMap()
  }

}
