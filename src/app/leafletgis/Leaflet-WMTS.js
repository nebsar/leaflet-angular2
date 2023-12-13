import * as L from 'leaflet';
import {TileLayer} from "leaflet";

export const WMTS = L.TileLayer.extend({
  defaultWmtsParams: {
    service: 'WMTS',
    request: 'GetTile',
    version: '1.0.0',
    layer: 'EOC Baseoverlay',
    style: 'default',
    tilematrixset: 'EPSG:3857',
    format: 'image/jpeg'
  },

  initialize: function (url, options) { // (String, Object)
    this._url = url;
    var lOptions = {};
    var cOptions = Object.keys(options);
    cOptions.forEach(element => {
      lOptions[element.toLowerCase()] = options[element];
    });
    var wmtsParams = L.extend({}, this.defaultWmtsParams);
    var tileSize = lOptions.tileSize || this.options.tileSize;
    if (lOptions.detectRetina && L.Browser.retina) {
      wmtsParams.width = wmtsParams.height = tileSize * 2;
    } else {
      wmtsParams.width = wmtsParams.height = tileSize;
    }
    for (var i in lOptions) {
      // all keys that are in defaultWmtsParams options go to WMTS params
      if (wmtsParams.hasOwnProperty(i) && i != "matrixIds") {
        wmtsParams[i] = lOptions[i];
      }
    }
    this.wmtsParams = wmtsParams;
    this.matrixIds = options.matrixIds || this.getDefaultMatrix();
    L.setOptions(this, options);
  },

  onAdd: function (map) {
    this._crs = this.options.crs || map.options.crs;
    L.TileLayer.prototype.onAdd.call(this, map);
  },

  getTileUrl: function (coords) { // (Point, Number) -> String
    var tileSize = this.options.tileSize;
    var nwPoint = coords.multiplyBy(tileSize);
    nwPoint.x += 1;
    nwPoint.y -= 1;
    var sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
    var zoom = this._tileZoom;
    var nw = this._crs.project(this._map.unproject(nwPoint, zoom));
    var se = this._crs.project(this._map.unproject(sePoint, zoom));
    var tilewidth = se.x - nw.x;
    var ident = this.matrixIds[zoom].identifier;
    var tilematrix = ident;
    var X0 = this.matrixIds[zoom].topLeftCorner.lng;
    var Y0 = this.matrixIds[zoom].topLeftCorner.lat;
    var tilecol = Math.floor((nw.x - X0) / tilewidth);
    var tilerow = -Math.floor((nw.y - Y0) / tilewidth);
    var url = L.Util.template(this._url, {s: this._getSubdomain(coords)});
    let resURL = url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + tilematrix + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
    return resURL;
  },

  setParams: function (params, noRedraw) {
    L.extend(this.wmtsParams, params);
    if (!noRedraw) {
      this.redraw();
    }
    return this;
  },

  getDefaultMatrix: function () {
    /**
     * the matrix3857 represents the projection
     * for in the IGN WMTS for the google coordinates.
     */
    var matrixIds3857 = new Array(22);
    for (var i = 0; i < 22; i++) {
      matrixIds3857[i] = {
        identifier: "" + i,
        topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)
      };
    }
    return matrixIds3857;
  }
});

export function parseGetCapabilitiesXML(getCapabilitiesURL, layerName, callback) {

  var xhr = new XMLHttpRequest();

  xhr.open("GET", getCapabilitiesURL);
  xhr.onload = function () {

    var getCapabilitiesXML = xhr.responseXML;

    getServiceURLTemplates(getCapabilitiesXML, layerName, callback);

  };

  xhr.send();

};

// XMLHttpRequest.onload function: extract <Style>, <TileMatrixSet> and <ressourceURL> values from parsed GetCapabilities XML
export function getServiceURLTemplates(getCapabilitiesXML, layerName, createWMTSLayer) {

  var layerNodes = getCapabilitiesXML.getElementsByTagName("Layer");

  for (var i = 0; i < layerNodes.length; i++) {

    var title = layerNodes[i].getElementsByTagName("ows:Title")[0].childNodes[0].nodeValue;

    if (title == layerName) {

      var style = layerNodes[i].getElementsByTagName("Style")[0].children[0].childNodes[0].nodeValue;
      var tileMatrixSet = layerNodes[i].getElementsByTagName("TileMatrixSetLink")[0].children[0].childNodes[0].nodeValue;

      var serviceURLTemplates = layerNodes[i].getElementsByTagName("ResourceURL")[4].attributes.getNamedItem("template").nodeValue

      createWMTSLayer(serviceURLTemplates, tileMatrixSet, style, layerName);

    }
    ;

  }
  ;

};

export function createWMTSLayer(serviceURLTemplates, tileMatrixSet, style, layerName) {

  var sharding = ["maps", "maps1", "maps2", "maps3", "maps4"];

  var baseURL = serviceURLTemplates.replace("maps", "{s}")
    .replace("{Style}", style)
    .replace("{TileMatrixSet}", tileMatrixSet)
    .replace("{TileMatrix}", "{z}")
    .replace("{TileRow}", "{y}")
    .replace("{TileCol}", "{x}");

  let WMTSLayer = new TileLayer(baseURL, {
    id: layerName,
    subdomains: sharding
  });

  return WMTSLayer;

};

export async function getWMTSCapabilities(url) {
  const response = await fetch(url);
  const xmlText = await response.text();
  const parser = new DOMParser();
  const getCapabilitiesXML = parser.parseFromString(xmlText, "text/xml");
  const layerNodes = getCapabilitiesXML.getElementsByTagName("Layer");
  const layers = [];
  for (let i = 0; i < layerNodes.length; i++) {
    const layerName = layerNodes[i].getElementsByTagName("ows:Title")[0].textContent;
    const tileMatrixSets = layerNodes[i].getElementsByTagName("TileMatrixSet");

    const style = layerNodes[i].getElementsByTagName("Style")[0].getElementsByTagName("ows:Identifier")[0].textContent;

    const format = layerNodes[i].getElementsByTagName("Format")[0].textContent;


    for (let j = 0; j < tileMatrixSets.length; j++) {
      layers[j] = {layername: layerName, tilematrixset: tileMatrixSets[j].textContent, style:style, format:format};
    }
  }
  return layers;
};

