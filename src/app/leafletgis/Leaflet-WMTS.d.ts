import {Layer} from 'leaflet';

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
