import {LayerHandler} from "./LayerHandler";
import {ElementFactory} from "./ElementFactory";
import {LayerFactory} from "./LayerFactory";

export interface Display {

  getLayerHandler: () => LayerHandler;

  getElementFactory: () => ElementFactory;

  getLayerFactory: () => LayerFactory;

  getMap: () => {};

}

export abstract class MapDisplay implements Display {

  abstract getLayerHandler(): LayerHandler;

  abstract getElementFactory(): ElementFactory;

  abstract getLayerFactory(): LayerFactory;

  abstract getMap(): {};

}
