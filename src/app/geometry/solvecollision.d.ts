import * as PIXI from 'pixi.js';
import * as d3 from 'd3';

interface CollisionOptions {
  r0?: number;
  zoom?: number;
}

declare function solveCollision(markers: PIXI.Sprite[], options: CollisionOptions):any;

