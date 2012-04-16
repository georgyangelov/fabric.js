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
     * @type {CanvasRenderingContext2D}
     */	
	bmp: null,
    
    /**
     * Constructor
     * @method initialize
     * @param options {Object} options object
     * @return {Object} thisArg
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
	  this._initTempCanvas();
    },
	
	/**
	 * Initializes the cached canvas representation of the bitmap data
	 * @private
	 * @method _initTempCanvas
	 */
	_initTempCanvas: function() {
	  var canvasTemp = document.createElement("canvas");
	  canvasTemp.width = this.width;
	  canvasTemp.height = this.height;
	  this.bmp = canvasTemp.getContext("2d");
	},
	
	/**
	 * Overlay pixels over the bitmap
	 * @method draw
	 * @param imageData {ImageData}
	 * @param x {Number} Left-constrained x coordinate of the draw
	 * @param y {Number} Top-constrained y coordinate of the draw
	 */
	draw: function(imageData, x, y) {
	  this.bmp.putImageData(imageData, x, y);
	},
	
	/**
	 * Clears the bitmap
	 * @method clear
	 */
	clear: function() {
	  this.bmp.clearRect(0, 0, this.width, this.height);
	},
	
	/**
	 * Renders a fabric.Object on the bitmap (only once, when this function is called)
	 * and saves it as a bitmap. Shapes aren't preserved
	 * @method add
	 * @param object {fabric.Object}
	 */
	add: function(object) {
	  object.render(this.bmp);
	},
	
	// Please ignore for now, this code doesn't belong here
	/*invert: function() {
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
	},*/
	
    /**
     * @private
     * @method _render
     * @param ctx {CanvasRenderingContext2D} context to render on
     */
    _render: function(ctx) {
	  ctx.save();
	  // We need to be in top-left coordinate space
	  ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(this.tCtx.canvas, 0, 0);
	  ctx.restore();
    },
  });
  
  /**
   * Returns fabric.Bitmap instance from an object representation
   * @static
   * @method fabric.Bitmap.fromObject
   * @param object {Object} object to create an instance from
   * @return {fabric.Bitmap}
   */
  fabric.Bitmap.fromObject = function(object) {
    return new fabric.Bitmap(object);
  };
  
  /**
   * Returns fabric.Bitmap instance from a fabric.Object instance
   * @static
   * @method fabric.Bitmap.fromObject
   * @param object {fabric.Object} object to create an instance from
   * @return {fabric.Bitmap}
   */
  fabric.Bitmap.fromFabricObject = function(object) {
	var bmp = new fabric.Bitmap({
	  width: object.width,
	  height: object.height,
	  top: object.top,
	  left: object.left
	});
	bmp.add(object);
	
	return bmp;
  };
  
})(typeof exports != 'undefined' ? exports : this);