import {Layer, TileLayer} from 'leaflet';

interface WMTSOptions {

  service?: 'WMTS',
  request?: 'GetTile',
  version?: '1.0.0',
  layer?: string,
  style?: string,
  tilematrixset?: string,
  format?: string | 'image/jpeg'
}

declare class WMTS extends Layer {

  constructor(url: string, options?: WMTSOptions);

}

declare function parseGetCapabilitiesXML(getCapabilitiesURL:string, layerName:string, callback:Function):void;

declare function getServiceURLTemplates(getCapabilitiesXML:any, layerName:string, callback:Function):void;

declare function createWMTSLayer(serviceURLTemplates:any, tileMatrixSet:any, style:any, layerName:any):TileLayer;

declare function getWMTSCapabilities(url: string):Promise<[{layername:string, tilematrixset:string, style:string, format:string}]>;
