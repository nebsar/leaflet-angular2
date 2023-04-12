import {Control, Map, DomUtil, DomEvent, ControlOptions} from 'leaflet'

interface EditControlOptions extends ControlOptions {
  callback: ((this: any, ...args: any[]) => any) | null;
  kind: string;
  html: string;
}

class EditControl extends Control {

  override options: EditControlOptions;

  constructor() {
    super({position: 'topleft'});
  }

  override onAdd(map: Map): HTMLElement {
    let container = DomUtil.create('div', 'leaflet-control leaflet-bar'),
      link = DomUtil.create('a', '', container);

    link.href = '#';
    link.title = 'Create a new ' + this.options.kind;
    link.innerHTML = this.options.html;
    const options = this.options;
    DomEvent.on(link, 'click', DomEvent.stop)
      .on(link, 'click', function () {
        if (options && options.callback) {
          console.log('noluyor?' + options.callback.call(map.editTools));
          (window as any).LAYER = options.callback.call(map.editTools);
        }

      }.bind(this));

    return container;
  }
}

export class PolylineControl extends EditControl {

  map: Map;

  constructor(map: Map) {
    super();
    this.map = map;

    this.options.callback = this.map.editTools.startPolyline;
    this.options.kind = 'polyline';
    this.options.html = '\\/\\';
  }

}

export class PolygonControl extends EditControl {

  map: Map;

  constructor(map: Map) {
    super();
    this.map = map;

    this.options.callback = map.editTools.startPolygon;
    this.options.kind = 'polygon';
    this.options.html = '▰';
  }
}

export class EntityControl extends EditControl {

  map: Map;

  constructor(map: Map) {
    super();
    this.map = map;

    this.options.callback = map.editTools.startMarker;
    this.options.kind = 'entity';
    this.options.html = '🖈';
  }


}


