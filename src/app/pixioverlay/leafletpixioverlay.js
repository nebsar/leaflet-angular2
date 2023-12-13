import * as PIXI from 'pixi.js'
import * as L from 'leaflet'

const round = L.Point.prototype._round;
const no_round = function () {
  return this;
};

function setEventSystem(renderer, destroyInteractionManager, autoPreventDefault) {
  var eventSystem = (PIXI.VERSION < "7") ? renderer.plugins.interaction : renderer.events;
  if (destroyInteractionManager) {
    eventSystem.destroy();
  } else if (!autoPreventDefault) {
    eventSystem.autoPreventDefault = false;
  }
}

function projectionZoom(map) {
  var maxZoom = map.getMaxZoom();
  var minZoom = map.getMinZoom();
  if (maxZoom === Infinity) return minZoom + 8;

  return (maxZoom + minZoom) / 2;
}

export const PixiOverlay = L.Layer.extend({

  options: {
    // @option padding: Number = 0.1
    // How much to extend the clip area around the map view (relative to its size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0.1,
    // @option forceCanvas: Boolean = false
    // Force use of a 2d-canvas
    forceCanvas: false,
    // @option doubleBuffering: Boolean = false
    // Help to prevent flicker when refreshing display on some devices (e.g. iOS devices)
    // It is ignored if rendering is done with 2d-canvas
    doubleBuffering: false,
    // @option resolution: Number = 1
    // Resolution of the renderer canvas
    resolution: L.Browser.retina ? 2 : 1,
    // @option projectionZoom(map: map): Number
    // return the layer projection zoom level
    projectionZoom: projectionZoom,
    // @option destroyInteractionManager:  Boolean = false
    // Destroy PIXI EventSystem
    destroyInteractionManager: false,
    // @option
    // Customize PIXI EventSystem autoPreventDefault property
    // This option is ignored if destroyInteractionManager is set
    autoPreventDefault: true,
    // @option resolution: Boolean = false
    // Enables drawing buffer preservation
    preserveDrawingBuffer: false,
    // @option resolution: Boolean = true
    // Clear the canvas before the new render pass
    clearBeforeRender: true,

    zIndex: 0,
    // @option shouldRedrawOnMove(e: moveEvent): Boolean
    // filter move events that should trigger a layer redraw
    shouldRedrawOnMove: function () {
      return false;
    },
  },

  initialize: function (drawCallback, options) {
    L.setOptions(this, options);
    L.stamp(this);

    this._drawCallback = drawCallback;
    this._pixiContainer = new PIXI.Container();
    this.symbolsArray = [];
    this.firstRenderingArray = [];

    this._rendererOptions = {
      resolution: this.options.resolution,
      antialias: true,
      forceCanvas: this.options.forceCanvas,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer,
      clearBeforeRender: this.options.clearBeforeRender
    };

    if (PIXI.VERSION < "6") {
      this._rendererOptions.transparent = true;
    } else {
      this._rendererOptions.backgroundAlpha = 0;
    }

    this._doubleBuffering = PIXI.utils.isWebGLSupported() && !this.options.forceCanvas &&
      this.options.doubleBuffering;
  },

  _setMap: function () {
  },

  _setContainerStyle: function () {
  },

  _addContainer: function () {
    this.getPane().appendChild(this._container);
  },

  _setEvents: function () {
  },

  addGraphics: function (graphics) {
    this.firstRenderingArray.push(graphics);
    //this.symbolsArray.push(graphics);
    this._pixiContainer.addChild(graphics);
  },

  removeGraphicsAt: function (index) {
    this._pixiContainer.removeChildAt(index);
    this.symbolsArray.splice(index, 1);

  },

  removeGraphics: function (graphics) {
    this._pixiContainer.removeChild(graphics);
    this.symbolsArray = this.symbolsArray.filter(item => item != graphics);
  },

  getSymbolsArray: function () {
    return this.symbolsArray;
  },

  getFirstRenderingArray: function () {
    return this.firstRenderingArray;
  },

  onAdd: function (targetMap) {
    this._setMap(targetMap);
    if (!this._container) {
      var container = this._container = L.DomUtil.create('div', 'leaflet-pixi-layer');
      container.style.position = 'absolute';
      this._renderer = PIXI.autoDetectRenderer(this._rendererOptions);
      setEventSystem(
        this._renderer,
        this.options.destroyInteractionManager,
        this.options.autoPreventDefault
      );
      container.appendChild(this._renderer.view);
      if (this._zoomAnimated) {
        L.DomUtil.addClass(container, 'leaflet-zoom-animated');
        this._setContainerStyle();
      }
      if (this._doubleBuffering) {
        this._auxRenderer = PIXI.autoDetectRenderer(this._rendererOptions);
        setEventSystem(
          this._auxRenderer,
          this.options.destroyInteractionManager,
          this.options.autoPreventDefault
        );
        container.appendChild(this._auxRenderer.view);
        this._renderer.view.style.position = 'absolute';
        this._auxRenderer.view.style.position = 'absolute';
      }
    }
    this._addContainer();
    this._setEvents();

    var map = this._map;
    this._initialZoom = this.options.projectionZoom(map);
    this._wgsOrigin = L.latLng([0, 0]);
    this._wgsInitialShift = map.project(this._wgsOrigin, this._initialZoom);
    this._mapInitialZoom = map.getZoom();
    var _layer = this;

    this.utils = {
      latLngToLayerPoint: function (latLng, zoom) {
        zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
        var projectedPoint = map.project(L.latLng(latLng), zoom);
        return projectedPoint;
      },
      layerPointToLatLng: function (point, zoom) {
        zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
        var projectedPoint = L.point(point);
        return map.unproject(projectedPoint, zoom);
      },
      getScale: function (zoom) {
        if (zoom === undefined) return map.getZoomScale(map.getZoom(), _layer._initialZoom);
        else return map.getZoomScale(zoom, _layer._initialZoom);
      },
      getRenderer: function () {
        return _layer._renderer;
      },
      getContainer: function () {
        return _layer._pixiContainer;
      },
      getMap: function () {
        return _layer._map;
      },
      getSymbolsArray: function () {
        return _layer.symbolsArray;
      },

      getFirstRenderingArray: function () {
        return _layer.firstRenderingArray;
      },

      setMarkerScale: function (prevZoom, zoom, invScale) {
          _layer.symbolsArray.forEach(entity => {
            entity.scale.set(invScale);
          });
      }
    };

    this._update({type: 'add'});
  },

  onRemove: function () {
    L.DomUtil.remove(this._container);
  },

  getEvents: function () {
    var events = {
      zoom: this._onZoom,
      move: this._onMove,
      moveend: this._update
    };
    if (this._zoomAnimated) {
      events.zoomanim = this._onAnimZoom;
    }
    return events;
  },

  _onZoom: function () {
    this._updateTransform(this._map.getCenter(), this._map.getZoom());
  },

  _onAnimZoom: function (e) {
    this._updateTransform(e.center, e.zoom);
  },

  _onMove: function (e) {
    if (this.options.shouldRedrawOnMove(e)) {
      this._update(e);
    }
  },

  _updateTransform: function (center, zoom) {
    var scale = this._map.getZoomScale(zoom, this._zoom),
      viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
      currentCenterPoint = this._map.project(this._center, zoom),

      topLeftOffset = viewHalf.multiplyBy(-scale).add(currentCenterPoint)
        .subtract(this._map._getNewPixelOrigin(center, zoom));

    if (L.Browser.any3d) {
      L.DomUtil.setTransform(this._container, topLeftOffset, scale);
    } else {
      L.DomUtil.setPosition(this._container, topLeftOffset);
    }
  },

  _redraw: function (offset, e) {
    this._disableLeafletRounding();
    var scale = this._map.getZoomScale(this._zoom, this._initialZoom),
      shift = this._map.latLngToLayerPoint(this._wgsOrigin)
        ._subtract(this._wgsInitialShift.multiplyBy(scale))._subtract(offset);
    this._pixiContainer.scale.set(scale);
    this._pixiContainer.position.set(shift.x, shift.y);
    this._drawCallback(this.utils, e);
    this._enableLeafletRounding();
  },

  _update: function (e) {
    // is this really useful?
    if (this._map._animatingZoom && this._bounds) {
      return;
    }

    // Update pixel bounds of renderer container
    var p = this.options.padding,
      mapSize = this._map.getSize(),
      min = this._map.containerPointToLayerPoint(mapSize.multiplyBy(-p)).round();

    this._bounds = new L.Bounds(min, min.add(mapSize.multiplyBy(1 + p * 2)).round());
    this._center = this._map.getCenter();
    this._zoom = this._map.getZoom();

    if (this._doubleBuffering) {
      var currentRenderer = this._renderer;
      this._renderer = this._auxRenderer;
      this._auxRenderer = currentRenderer;
    }

    var view = this._renderer.view;
    var b = this._bounds,
      container = this._container,
      size = b.getSize();

    if (!this._renderer.size || this._renderer.size.x !== size.x || this._renderer.size.y !== size.y) {
      if (this._renderer.gl) {
        this._renderer.resolution = this.options.resolution;
        if (this._renderer.rootRenderTarget) {
          this._renderer.rootRenderTarget.resolution = this.options.resolution;
        }
      }
      this._renderer.resize(size.x, size.y);
      view.style.width = size.x + 'px';
      view.style.height = size.y + 'px';
      if (this._renderer.gl) {
        var gl = this._renderer.gl;
        if (gl.drawingBufferWidth !== this._renderer.width) {
          var resolution = this.options.resolution * gl.drawingBufferWidth / this._renderer.width;
          this._renderer.resolution = resolution;
          if (this._renderer.rootRenderTarget) {
            this._renderer.rootRenderTarget.resolution = resolution;
          }
          this._renderer.resize(size.x, size.y);
        }
      }
      this._renderer.size = size;
    }

    if (this._doubleBuffering) {
      var self = this;
      requestAnimationFrame(function () {
        self._redraw(b.min, e);
        self._renderer.gl.finish();
        view.style.visibility = 'visible';
        self._auxRenderer.view.style.visibility = 'hidden';
        L.DomUtil.setPosition(container, b.min);
      });
    } else {
      this._redraw(b.min, e);
      L.DomUtil.setPosition(container, b.min);
    }
  },

  _disableLeafletRounding: function () {
    L.Point.prototype._round = no_round;
  },

  _enableLeafletRounding: function () {
    L.Point.prototype._round = round;
  },

  redraw: function (data) {
    if (this._map) {
      this._disableLeafletRounding();
      this._drawCallback(this.utils, data);
      this._enableLeafletRounding();
    }
    return this;
  },

  _destroy: function () {
    this._renderer.destroy(true);
    if (this._doubleBuffering) {
      this._auxRenderer.destroy(true);
    }
  },

  destroy: function () {
    this.remove();
    this._destroy();
  },

  _updateZIndex: function () {
    if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },

  _setAutoZIndex: function (compare) {
    // go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)
    let layers = this.getPane().children;
    let edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

    for (let i = 0, len = layers.length, zIndex; i < len; i++) {
      zIndex = layers[i].style.zIndex;
      if (layers[i] !== this._container && zIndex) {
        edgeZIndex = compare(edgeZIndex, +zIndex);
      }
    }

    if (isFinite(edgeZIndex)) {
      this.options.zIndex = edgeZIndex + compare(-1, 1);
      this._updateZIndex();
    }
  },

  // @function toFront(el: HTMLElement)
  // Makes `el` the last child of its parent, so it renders in front of the other children.
  toFront(element) {
    let parent = element.parentNode;
    if (parent && parent.lastChild !== element) {
      parent.appendChild(element);
    }
  },

  // @function toBack(el: HTMLElement)
  // Makes `el` the first child of its parent, so it renders behind the other children.
  toBack(element) {
    let parent = element.parentNode;
    if (parent && parent.firstChild !== element) {
      parent.insertBefore(element, parent.firstChild);
    }
  },

  setOptions(options) {
    L.setOptions(this, options);
    L.stamp(this);
  },

  getOptions() {
    return this.options;
  },

  // @method bringToFront: this
  // Brings the tile layer to the top of all tile layers.
  bringToFront: function () {
    if (this._map) {
      this._setAutoZIndex(Math.max);
    }
    return this;
  },

  // @method bringToBack: this
  // Brings the tile layer to the bottom of all tile layers.
  bringToBack: function () {
    if (this._map) {
      this._setAutoZIndex(Math.min);
    }
    return this;
  },

  project(latLng, zoom){
    zoom = (zoom === undefined) ? this._initialZoom : zoom;
    let projectedPoint = this._map.project(L.latLng(latLng), zoom);
    return projectedPoint;
  },

  unProject(point, zoom){
    zoom = (zoom === undefined) ? this._initialZoom : zoom;
    let projectedPoint = L.point(point);
    return map.unproject(projectedPoint, zoom);
  }

});

