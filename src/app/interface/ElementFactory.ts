import {MapMilitaryElement} from "./MapMilitaryElement";

export enum MilitaryElementType {
  SYMBOL,
  TACTICAL_GRAPHICS
}

export interface ElementFactory {
  createMilitaryElement: (type: MilitaryElementType, sidc: string) => MapMilitaryElement | null;
}

export abstract class MapElementFactory implements ElementFactory {
  createMilitaryElement(type: MilitaryElementType, sidc: string): MapMilitaryElement | null {
    return this.gisCreateMilitaryElement(sidc);
  }

  abstract gisCreateMilitaryElement(sidc: string): MapMilitaryElement;

}
