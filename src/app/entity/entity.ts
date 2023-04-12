import {
  Container,
  Graphics,
  Sprite,
  Texture,
  Text,
  Rectangle,
  FederatedPointerEvent,
  FederatedEventTarget
} from 'pixi.js'
import {MapComponent} from "../map/map.component";
import ms from 'milsymbol';
import {LeafletEvent, LeafletMouseEvent, Point} from "leaflet";

export interface IconTextureHash {
  [sidc: string]: Texture,

}

export class Entity extends Sprite {

  _selected: boolean = false;
  _mapComponent: MapComponent;
  selectionBox: Graphics = new Graphics();

  _label: Text = new Text();

  _iconLocalBounds: Rectangle;

  _sidc: string;

  //data: Entity | null;

  override parent: Container = this.parent;

  constructor(sidc: string, mapComponent: MapComponent, label?: string) {
    super();

    this._sidc = sidc;
    if (mapComponent.ms2525IconTextureHash[this._sidc]) {
      this.texture = mapComponent.ms2525IconTextureHash[this._sidc];
    } else {

      let symbol = new ms.Symbol(this._sidc, {
        size: 25,
      }).asCanvas();
      this.texture = Texture.from(symbol);
      mapComponent.ms2525IconTextureHash[sidc] = this.texture;

      this.cullable = true;
    }


    this._iconLocalBounds = new Rectangle();
    this.anchor.set(0.5, 1.0);
    this._iconLocalBounds = this.getLocalBounds().clone();

    this._mapComponent = mapComponent;

    this.addLabel(label);

    //this.on('mouseenter', (event)=>{
    // console.log(`entered to ${label}`)
    //});

    this.on('mousedowncapture', (event: FederatedPointerEvent) => {
      this.selected = true;
      this.bringToFront();
    });

    this.on('mousedown', this.onDragStart);
    // this.on('mousemove', this.onDragMove);
    // this.on('mouseupoutside', this.onDragEnd);
   // this.on('mouseup', this.onDragEnd);

  }

  onDragStart(event: FederatedPointerEvent) {
    //this.data = event.target as Entity;
    this._mapComponent.map.dragging.disable();
    this.alpha = 0.5;
    this._mapComponent.dragged = true;
    this._mapComponent.selectedGraphic = this;
  }

  onDragEnd(event: FederatedPointerEvent) {
    this.alpha = 1.0;
    this._mapComponent.map.dragging.enable();
    this._mapComponent.dragged = false;
    //this.data = null;
    this._mapComponent.selectedGraphic = null;
    this._mapComponent.militarySymbolLayer.redraw();
  }

  onDragMove(event: FederatedPointerEvent) {
    // if (this._mapComponent.dragged && this.data) {
    //   const newPosition = event.getLocalPosition(this.parent);
    //   this.x = newPosition.x;
    //   this.y = newPosition.y;
    //   //let latlon = this._mapComponent.militarySymbolLayer.utils.layerPointToLatLng([this.x, this.y]);
    //   // this.popup.setLatLng(latlon);
    //   // this.popup.setContent('latlon is: ' + latlon.lat + ' ' + latlon.lng);
    //   this._mapComponent.militarySymbolLayer.redraw();
    // }
  }

  set selected(selected: boolean) {
    this._selected = selected;
    this._mapComponent.selected = selected;
  }

  get selected(): boolean {
    return this._selected;
  }

  set labelText(label: string) {
    this._label.text = label;
  }

  get labelText(): string {
    return this._label.text;
  }

  addSelectionBox() {
    this.selectionBox.clear();
    this.selectionBox.lineStyle(2, 0xff0000, 1);

    let iconBounds: Rectangle = this.getIconLocalBounds();

    this.selectionBox.moveTo(iconBounds.left, iconBounds.top)
    this.selectionBox.lineTo(iconBounds.right, iconBounds.top);
    this.selectionBox.lineTo(iconBounds.right, iconBounds.bottom);
    this.selectionBox.lineTo(iconBounds.left, iconBounds.bottom);
    this.selectionBox.lineTo(iconBounds.left, iconBounds.top);

    this.addChild(this.selectionBox);
  }

  addLabel(text?: string) {
    if (text) {
      this._label.style.fontSize = 12;
      this._label.x = this._iconLocalBounds.right;
      this._label.y = this._iconLocalBounds.bottom;
      this._label.text = text;
      this.addChild(this._label);
    }
  }

  removeSelectionBox() {
    this.removeChild(this.selectionBox);
  }

  removeLabel() {
    this.removeChild(this._label);
  }

  getIconLocalBounds(): Rectangle {
    return this._iconLocalBounds;
  }

  bringToFront() {
    if (this.parent) {
      var parent = this.parent;
      parent.removeChild(this);
      parent.addChild(this);
    }
  }

}
