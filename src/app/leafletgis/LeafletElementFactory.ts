import {MapElementFactory} from "../interface/ElementFactory";
import {Texture} from "pixi.js";
import {LeafletMilitaryMapElement} from "./LeafletMilitaryMapElement";
import {Entity} from "../entity/entity";

import {LeafletMapDisplay} from "./LeafletMapDisplay";

export interface IconTextureHash {
  [sidc: string]: Texture,

}

export class LeafletElementFactory extends MapElementFactory {

  ms2525IconTextureHash: IconTextureHash = {};

  leafletMapDisplay: LeafletMapDisplay;

  constructor(mapDisplay: LeafletMapDisplay) {
    super();
    this.leafletMapDisplay = mapDisplay;
  }

  override gisCreateMilitaryElement(sidc: string, location?:any): LeafletMilitaryMapElement {
    let entity: Entity = new Entity(sidc, this);
    if (location) {
      entity.setLocation(location);
    }

    entity.eventMode = 'dynamic';

    return {
      id: 1,
      GISRefObject : entity,
      mapLayer:null,
      sidc: sidc,
    };
  }

}
