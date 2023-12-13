import {GISElement} from "./GISElement";

export type MilStd2525Object = {} | null;

export interface MapMilitaryElement extends GISElement{
  sidc: string;
  GISRefObject : MilStd2525Object;
}

