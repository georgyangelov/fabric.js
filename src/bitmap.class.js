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
	 * Resizes the temp canvas with offsets specified by the parameters
	 * @private
	 * @method _resizeBmp
	 * @param left {Number} The offset by which to stretch the left border (positive to widen, negative to shrink)
	 * @param top {Number} The offset by which to stretch the top border (positive to widen, negative to shrink)
	 * @param right {Number} The offset by which to stretch the right border (positive to widen, negative to shrink)
	 * @param bottom {Number} The offset by which to stretch the bottom border (positive to widen, negative to shrink)
	 */
	_resizeBmp: function(left, top, right, bottom) {
	  var copyOld = (this.width != 0 && this.height != 0);
	  
	  var oldBitmap;
	  if (copyOld) {
		oldBitmap = this.bmp.getImageData(0, 0, this.width, this.height);
	  }
	  
	  this.bmp.canvas.width = left + this.width + right;
	  this.bmp.canvas.height = top + this.height + bottom;
	  
	  this.width = this.bmp.canvas.width;
	  this.height = this.bmp.canvas.height;
	  
	  if (copyOld) {
		// The canvas should be cleared by the resize so just draw the old contents over it
		this.bmp.putImageData(oldBitmap, left, top);
	  }
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
	  var boundingBox = object.getBoundingBox();
	  
	  // If there's nothing drawn already
	  
	  var me;
	  if (this.width == 0 || this.height == 0) {
		this._resizeBmp(0, 0, boundingBox.width, boundingBox.height);
		
		this.setPositionByOrigin(new fabric.Point(boundingBox.x, boundingBox.y), 'left', 'top');
		me = this.getPointByOrigin('left', 'top');
	  }
	  else {
		me = this.getPointByOrigin('left', 'top');
		
		var left = me.x - boundingBox.x,
			top = me.y - boundingBox.y,
			right = boundingBox.x + boundingBox.width - (me.x + this.width),
			bottom = boundingBox.y + boundingBox.height - (me.y + this.height);
  
		if (left > 0 || top > 0 || right > 0 || bottom > 0) {
		  this._resizeBmp(left > 0 ? left : 0, top > 0 ? top : 0, right > 0 ? right : 0, bottom > 0 ? bottom : 0);
		}
	  }
	  
	  // Render the object relative to the global coordinates
	  // TODO (stormbreaker): Account for bitmap rotation
	  this.bmp.save();
	  this.bmp.translate(-me.x, -me.y);
	  object.render(this.bmp);
	  this.bmp.restore();
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
	  // We need to be in center-center coordinate space
	  ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(this.bmp.canvas, 0, 0);
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