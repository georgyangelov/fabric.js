//= require "object.class"

(function(global) {
  
  "use strict";
  
  var fabric = global.fabric || (global.fabric = { });
  
  if (fabric.Bitmap) {
    console.warn('fabric.Bitmap is already defined');
    return;
  }
  
  /** 
   * @class Bitmap
   * @extends fabric.Object
   */
  fabric.Bitmap = fabric.util.createClass(fabric.Object, /** @scope fabric.Bitmap.prototype */ {
    
    /**
     * @property
     * @type String
     */
    type: 'bitmap',
    
    /**
     * @property
     * @type Object
     */
    /*options: {
      rx: 0,
      ry: 0
    },*/
	
	tCtx: null,
    
    /**
     * Constructor
     * @method initialize
     * @param options {Object} options object
     * @return {Object} thisArg
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
	  this._initTempCanvas();
      //this._initRxRy();
    },
	
	_initTempCanvas: function() {
	  var canvasTemp = document.createElement("canvas");
	  canvasTemp.width = this.width;
	  canvasTemp.height = this.height;
	  this.tCtx = canvasTemp.getContext("2d");
	},
	
	drawPixels: function(pixelData, x, y) {
	  this.tCtx.putImageData(pixelData, x, y);
	},
	
	add: function(object) {
	  object.render(this.tCtx);
	},
	
	invert: function() {
	  var pixels = this.tCtx.getImageData(0, 0, this.width, this.height);
	  var px = pixels.data;
	  var len = px.length;
	  
	  for (var i = 0; i < len; i += 4) {
		px[i] = 255 - px[i];
		px[i + 1] = 255 - px[i + 1];
		px[i + 2] = 255 - px[i + 2];
		//px[i + 3] = 255;
	  }
	  
	  this.tCtx.clearRect(0, 0, this.width, this.height);
	  this.tCtx.putImageData(pixels, 0, 0);
	},
	
    /**
     * @private
     * @method _render
     * @param ctx {CanvasRenderingContext2D} context to render on
     */
    _render: function(ctx) {
	  ctx.save();
	  ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(this.tCtx.canvas, 0, 0);
	  ctx.restore();
    },
  });
  
  /**
   * Returns fabric.Rect instance from an object representation
   * @static
   * @method fabric.Rect.fromObject
   * @param object {Object} object to create an instance from
   * @return {Object} instance of fabric.Rect
   */
  fabric.Bitmap.fromObject = function(object) {
    return new fabric.Bitmap(object);
  };
  
})(typeof exports != 'undefined' ? exports : this);