import {MapMilitaryElement} from "./MapMilitaryElement";
import {GISElement} from "./GISElement";

export type Position = [number, number, number?]

export enum MilitaryElementType {
  SYMBOL,
  TACTICAL_GRAPHICS
}

export interface ElementFactory {
  createMilitaryElement: (type: MilitaryElementType, sidc: string, position: Position) => GISElement;
}

export abstract class MapElementFactory implements ElementFactory {
  createMilitaryElement(type: MilitaryElementType, sidc: string, position: Position): GISElement {
    return this.gisCreateMilitaryElement(sidc, position);
  }

  abstract gisCreateMilitaryElement(sidc: string, position: Position): GISElement;

}
