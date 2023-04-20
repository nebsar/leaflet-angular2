import {Layer, LayerGroup, LayerOptions, Map} from "leaflet";

declare class MGRSGraticuleLayer extends Layer {

  constructor(options?: LayerOptions);

  override onAdd(map: Map): this;

  override onRemove(map: Map): this;

}
