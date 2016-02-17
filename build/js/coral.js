/* global Typekit */
/* jshint -W033,-W116 */
(function(window, undefined) {
  "use strict"

  var typeKitId = 'ruf7eed';

  if (window.Coral && window.Coral.options && window.Coral.options.typeKitId) {
    typeKitId = window.Coral.options.typeKitId;
  }

  var config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    var h = document.getElementsByTagName("html")[0];
    h.className += " wf-loading";
    var t = setTimeout(function() {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
      h.className += " wf-inactive";
    }, config.scriptTimeout);
    var tk = document.createElement("script"),
      d = false;
    tk.src = '//use.typekit.net/' + config.kitId + '.js';
    tk.type = "text/javascript";
    tk.async = "true";
    tk.onload = tk.onreadystatechange = function() {
      var a = this.readyState;
      if (d || a && a !== "complete" && a !== "loaded") {
        return;
      }
      d = true;
      clearTimeout(t);
      try {
        Typekit.load(config);
      } catch (b) {}
    };
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tk, s);
  }

}(this));

/*!
 * jQuery UI Core @VERSION
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 */

/*
  Note: This code has been lifted directly from jQuery UI
  https://github.com/jquery/jquery-ui/blob/master/ui/core.js
*/
(function ($) {

  // selectors
  function focusable( element, isTabIndexNotNaN ) {
    var map, mapName, img,
      nodeName = element.nodeName.toLowerCase();
    if ( "area" === nodeName ) {
      map = element.parentNode;
      mapName = map.name;
      if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
        return false;
      }
      img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
      return !!img && visible( img );
    }
    return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
      !element.disabled :
      "a" === nodeName ?
        element.href || isTabIndexNotNaN :
        isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible( element );
  }

  function visible( element ) {
    return $.expr.filters.visible( element ) &&
      !$( element ).parents().addBack().filter(function() {
        return $.css( this, "visibility" ) === "hidden";
      }).length;
  }

  $.extend( $.expr[ ":" ], {
    data: $.expr.createPseudo ?
      $.expr.createPseudo(function( dataName ) {
        return function( elem ) {
          return !!$.data( elem, dataName );
        };
      }) :
      // support: jQuery <1.8
      function( elem, i, match ) {
        return !!$.data( elem, match[ 3 ] );
      },

    focusable: function( element ) {
      return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
    },

    tabbable: function( element ) {
      var tabIndex = $.attr( element, "tabindex" ),
        isTabIndexNaN = isNaN( tabIndex );
      return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
    }
  });

}(jQuery));

/*!
 * jQuery UI Position b3a9b13a218cd90b7cf67be5d5f8ad6e76c557b0
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: UI Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
( function() {

$.ui = $.ui || {};

var cachedScrollbarWidth, supportsOffsetFractions,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

// Support: IE <=9 only
supportsOffsetFractions = function() {
	var element = $( "<div>" )
			.css( "position", "absolute" )
			.appendTo( "body" )
			.offset( {
				top: 1.5,
				left: 1.5
			} ),
		support = element.offset().top === 1.5;

	element.remove();

	supportsOffsetFractions = function() {
		return support;
	};

	return support;
};

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !supportsOffsetFractions() ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );

/*
 ADOBE CONFIDENTIAL

 Copyright 2014 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function() {
  // A polyfill for HTMLElement.hidden property

  var testEl = document.createElement('div');

  if ('hidden' in testEl) {
    return;
  }

  Object.defineProperty(HTMLElement.prototype, 'hidden', {
    get: function() {
      return this.hasAttribute('hidden');
    },
    set: function set(v) {
      if (v) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    },
    configurable: true
  });
})();

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.6.0-6acf57f
window.WebComponents=window.WebComponents||{},function(e){var t=e.flags||{},o="webcomponents.js",n=document.querySelector('script[src*="'+o+'"]');if(!t.noOpts){if(location.search.slice(1).split("&").forEach(function(e){e=e.split("="),e[0]&&(t[e[0]]=e[1]||!0)}),n)for(var r,i=0;r=n.attributes[i];i++)"src"!==r.name&&(t[r.name]=r.value||!0);if(t.log){var a=t.log.split(",");t.log={},a.forEach(function(e){t.log[e]=!0})}else t.log={}}t.shadow=t.shadow||t.shadowdom||t.polyfill,t.shadow="native"===t.shadow?!1:t.shadow||!HTMLElement.prototype.createShadowRoot,t.register&&(window.CustomElements=window.CustomElements||{flags:{}},window.CustomElements.flags.register=t.register),e.flags=t}(WebComponents),"undefined"==typeof WeakMap&&!function(){var e=Object.defineProperty,t=Date.now()%1e9,o=function(){this.name="__st"+(1e9*Math.random()>>>0)+(t++ +"__")};o.prototype={set:function(t,o){var n=t[this.name];return n&&n[0]===t?n[1]=o:e(t,this.name,{value:[t,o],writable:!0}),this},get:function(e){var t;return(t=e[this.name])&&t[0]===e?t[1]:void 0},"delete":function(e){var t=e[this.name];return t&&t[0]===e?(t[0]=t[1]=void 0,!0):!1},has:function(e){var t=e[this.name];return t?t[0]===e:!1}},window.WeakMap=o}(),function(e){function t(e){_.push(e),b||(b=!0,h(n))}function o(e){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(e)||e}function n(){b=!1;var e=_;_=[],e.sort(function(e,t){return e.uid_-t.uid_});var t=!1;e.forEach(function(e){var o=e.takeRecords();r(e),o.length&&(e.callback_(o,e),t=!0)}),t&&n()}function r(e){e.nodes_.forEach(function(t){var o=v.get(t);o&&o.forEach(function(t){t.observer===e&&t.removeTransientObservers()})})}function i(e,t){for(var o=e;o;o=o.parentNode){var n=v.get(o);if(n)for(var r=0;r<n.length;r++){var i=n[r],a=i.options;if(o===e||a.subtree){var s=t(a);s&&i.enqueue(s)}}}}function a(e){this.callback_=e,this.nodes_=[],this.records_=[],this.uid_=++E}function s(e,t){this.type=e,this.target=t,this.addedNodes=[],this.removedNodes=[],this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function d(e){var t=new s(e.type,e.target);return t.addedNodes=e.addedNodes.slice(),t.removedNodes=e.removedNodes.slice(),t.previousSibling=e.previousSibling,t.nextSibling=e.nextSibling,t.attributeName=e.attributeName,t.attributeNamespace=e.attributeNamespace,t.oldValue=e.oldValue,t}function u(e,t){return y=new s(e,t)}function c(e){return N?N:(N=d(y),N.oldValue=e,N)}function l(){y=N=void 0}function f(e){return e===N||e===y}function p(e,t){return e===t?e:N&&f(e)?N:null}function m(e,t,o){this.observer=e,this.target=t,this.options=o,this.transientObservedNodes=[]}var h,v=new WeakMap;if(/Trident|Edge/.test(navigator.userAgent))h=setTimeout;else if(window.setImmediate)h=window.setImmediate;else{var w=[],g=String(Math.random());window.addEventListener("message",function(e){if(e.data===g){var t=w;w=[],t.forEach(function(e){e()})}}),h=function(e){w.push(e),window.postMessage(g,"*")}}var b=!1,_=[],E=0;a.prototype={observe:function(e,t){if(e=o(e),!t.childList&&!t.attributes&&!t.characterData||t.attributeOldValue&&!t.attributes||t.attributeFilter&&t.attributeFilter.length&&!t.attributes||t.characterDataOldValue&&!t.characterData)throw new SyntaxError;var n=v.get(e);n||v.set(e,n=[]);for(var r,i=0;i<n.length;i++)if(n[i].observer===this){r=n[i],r.removeListeners(),r.options=t;break}r||(r=new m(this,e,t),n.push(r),this.nodes_.push(e)),r.addListeners()},disconnect:function(){this.nodes_.forEach(function(e){for(var t=v.get(e),o=0;o<t.length;o++){var n=t[o];if(n.observer===this){n.removeListeners(),t.splice(o,1);break}}},this),this.records_=[]},takeRecords:function(){var e=this.records_;return this.records_=[],e}};var y,N;m.prototype={enqueue:function(e){var o=this.observer.records_,n=o.length;if(o.length>0){var r=o[n-1],i=p(r,e);if(i)return void(o[n-1]=i)}else t(this.observer);o[n]=e},addListeners:function(){this.addListeners_(this.target)},addListeners_:function(e){var t=this.options;t.attributes&&e.addEventListener("DOMAttrModified",this,!0),t.characterData&&e.addEventListener("DOMCharacterDataModified",this,!0),t.childList&&e.addEventListener("DOMNodeInserted",this,!0),(t.childList||t.subtree)&&e.addEventListener("DOMNodeRemoved",this,!0)},removeListeners:function(){this.removeListeners_(this.target)},removeListeners_:function(e){var t=this.options;t.attributes&&e.removeEventListener("DOMAttrModified",this,!0),t.characterData&&e.removeEventListener("DOMCharacterDataModified",this,!0),t.childList&&e.removeEventListener("DOMNodeInserted",this,!0),(t.childList||t.subtree)&&e.removeEventListener("DOMNodeRemoved",this,!0)},addTransientObserver:function(e){if(e!==this.target){this.addListeners_(e),this.transientObservedNodes.push(e);var t=v.get(e);t||v.set(e,t=[]),t.push(this)}},removeTransientObservers:function(){var e=this.transientObservedNodes;this.transientObservedNodes=[],e.forEach(function(e){this.removeListeners_(e);for(var t=v.get(e),o=0;o<t.length;o++)if(t[o]===this){t.splice(o,1);break}},this)},handleEvent:function(e){switch(e.stopImmediatePropagation(),e.type){case"DOMAttrModified":var t=e.attrName,o=e.relatedNode.namespaceURI,n=e.target,r=new u("attributes",n);r.attributeName=t,r.attributeNamespace=o;var a=e.attrChange===MutationEvent.ADDITION?null:e.prevValue;i(n,function(e){return!e.attributes||e.attributeFilter&&e.attributeFilter.length&&-1===e.attributeFilter.indexOf(t)&&-1===e.attributeFilter.indexOf(o)?void 0:e.attributeOldValue?c(a):r});break;case"DOMCharacterDataModified":var n=e.target,r=u("characterData",n),a=e.prevValue;i(n,function(e){return e.characterData?e.characterDataOldValue?c(a):r:void 0});break;case"DOMNodeRemoved":this.addTransientObserver(e.target);case"DOMNodeInserted":var s,d,f=e.target;"DOMNodeInserted"===e.type?(s=[f],d=[]):(s=[],d=[f]);var p=f.previousSibling,m=f.nextSibling,r=u("childList",e.target.parentNode);r.addedNodes=s,r.removedNodes=d,r.previousSibling=p,r.nextSibling=m,i(e.relatedNode,function(e){return e.childList?r:void 0})}l()}},e.JsMutationObserver=a,e.MutationObserver||(e.MutationObserver=a)}(this),window.CustomElements=window.CustomElements||{flags:{}},function(e){var t=e.flags,o=[],n=function(e){o.push(e)},r=function(){o.forEach(function(t){t(e)})};e.addModule=n,e.initializeModules=r,e.hasNative=Boolean(document.registerElement),e.useNative=!t.register&&e.hasNative&&!window.ShadowDOMPolyfill&&(!window.HTMLImports||HTMLImports.useNative)}(CustomElements),CustomElements.addModule(function(e){function t(e,t){o(e,function(e){return t(e)?!0:void n(e,t)}),n(e,t)}function o(e,t,n){var r=e.firstElementChild;if(!r)for(r=e.firstChild;r&&r.nodeType!==Node.ELEMENT_NODE;)r=r.nextSibling;for(;r;)t(r,n)!==!0&&o(r,t,n),r=r.nextElementSibling;return null}function n(e,o){for(var n=e.shadowRoot;n;)t(n,o),n=n.olderShadowRoot}function r(e,t){a=[],i(e,t),a=null}function i(e,t){if(e=wrap(e),!(a.indexOf(e)>=0)){a.push(e);for(var o,n=e.querySelectorAll("link[rel="+s+"]"),r=0,d=n.length;d>r&&(o=n[r]);r++)o["import"]&&i(o["import"],t);t(e)}}var a,s=window.HTMLImports?HTMLImports.IMPORT_LINK_TYPE:"none";e.forDocumentTree=r,e.forSubtree=t}),CustomElements.addModule(function(e){function t(e){return o(e)||n(e)}function o(t){return e.upgrade(t)?!0:void s(t)}function n(e){_(e,function(e){return o(e)?!0:void 0})}function r(e){s(e),f(e)&&_(e,function(e){s(e)})}function i(e){M.push(e),N||(N=!0,setTimeout(a))}function a(){N=!1;for(var e,t=M,o=0,n=t.length;n>o&&(e=t[o]);o++)e();M=[]}function s(e){y?i(function(){d(e)}):d(e)}function d(e){e.__upgraded__&&(e.attachedCallback||e.detachedCallback)&&!e.__attached&&f(e)&&(e.__attached=!0,e.attachedCallback&&e.attachedCallback())}function u(e){c(e),_(e,function(e){c(e)})}function c(e){y?i(function(){l(e)}):l(e)}function l(e){e.__upgraded__&&(e.attachedCallback||e.detachedCallback)&&e.__attached&&!f(e)&&(e.__attached=!1,e.detachedCallback&&e.detachedCallback())}function f(e){for(var t=e,o=wrap(document);t;){if(t==o)return!0;t=t.parentNode||t.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&t.host}}function p(e){if(e.shadowRoot&&!e.shadowRoot.__watched){b.dom&&console.log("watching shadow-root for: ",e.localName);for(var t=e.shadowRoot;t;)v(t),t=t.olderShadowRoot}}function m(e){if(b.dom){var o=e[0];if(o&&"childList"===o.type&&o.addedNodes&&o.addedNodes){for(var n=o.addedNodes[0];n&&n!==document&&!n.host;)n=n.parentNode;var r=n&&(n.URL||n._URL||n.host&&n.host.localName)||"";r=r.split("/?").shift().split("/").pop()}console.group("mutations (%d) [%s]",e.length,r||"")}e.forEach(function(e){"childList"===e.type&&(O(e.addedNodes,function(e){e.localName&&t(e)}),O(e.removedNodes,function(e){e.localName&&u(e)}))}),b.dom&&console.groupEnd()}function h(e){for(e=wrap(e),e||(e=wrap(document));e.parentNode;)e=e.parentNode;var t=e.__observer;t&&(m(t.takeRecords()),a())}function v(e){if(!e.__observer){var t=new MutationObserver(m);t.observe(e,{childList:!0,subtree:!0}),e.__observer=t}}function w(e){e=wrap(e),b.dom&&console.group("upgradeDocument: ",e.baseURI.split("/").pop()),t(e),v(e),b.dom&&console.groupEnd()}function g(e){E(e,w)}var b=e.flags,_=e.forSubtree,E=e.forDocumentTree,y=!window.MutationObserver||window.MutationObserver===window.JsMutationObserver;e.hasPolyfillMutations=y;var N=!1,M=[],O=Array.prototype.forEach.call.bind(Array.prototype.forEach),L=Element.prototype.createShadowRoot;L&&(Element.prototype.createShadowRoot=function(){var e=L.call(this);return CustomElements.watchShadow(this),e}),e.watchShadow=p,e.upgradeDocumentTree=g,e.upgradeSubtree=n,e.upgradeAll=t,e.attachedNode=r,e.takeRecords=h}),CustomElements.addModule(function(e){function t(t){if(!t.__upgraded__&&t.nodeType===Node.ELEMENT_NODE){var n=t.getAttribute("is"),r=e.getRegisteredDefinition(n||t.localName);if(r){if(n&&r.tag==t.localName)return o(t,r);if(!n&&!r["extends"])return o(t,r)}}}function o(t,o){return a.upgrade&&console.group("upgrade:",t.localName),o.is&&t.setAttribute("is",o.is),n(t,o),t.__upgraded__=!0,i(t),e.attachedNode(t),e.upgradeSubtree(t),a.upgrade&&console.groupEnd(),t}function n(e,t){Object.__proto__?e.__proto__=t.prototype:(r(e,t.prototype,t["native"]),e.__proto__=t.prototype)}function r(e,t,o){for(var n={},r=t;r!==o&&r!==HTMLElement.prototype;){for(var i,a=Object.getOwnPropertyNames(r),s=0;i=a[s];s++)n[i]||(Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(r,i)),n[i]=1);r=Object.getPrototypeOf(r)}}function i(e){e.createdCallback&&e.createdCallback()}var a=e.flags;e.upgrade=t,e.upgradeWithDefinition=o,e.implementPrototype=n}),CustomElements.addModule(function(e){function t(t,n){var d=n||{};if(!t)throw new Error("document.registerElement: first argument `name` must not be empty");if(t.indexOf("-")<0)throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '"+String(t)+"'.");if(r(t))throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '"+String(t)+"'. The type name is invalid.");if(u(t))throw new Error("DuplicateDefinitionError: a type with name '"+String(t)+"' is already registered");return d.prototype||(d.prototype=Object.create(HTMLElement.prototype)),d.__name=t.toLowerCase(),d.lifecycle=d.lifecycle||{},d.ancestry=i(d["extends"]),a(d),s(d),o(d.prototype),c(d.__name,d),d.ctor=l(d),d.ctor.prototype=d.prototype,d.prototype.constructor=d.ctor,e.ready&&v(document),d.ctor}function o(e){if(!e.setAttribute._polyfilled){var t=e.setAttribute;e.setAttribute=function(e,o){n.call(this,e,o,t)};var o=e.removeAttribute;e.removeAttribute=function(e){n.call(this,e,null,o)},e.setAttribute._polyfilled=!0}}function n(e,t,o){e=e.toLowerCase();var n=this.getAttribute(e);o.apply(this,arguments);var r=this.getAttribute(e);this.attributeChangedCallback&&r!==n&&this.attributeChangedCallback(e,n,r)}function r(e){for(var t=0;t<E.length;t++)if(e===E[t])return!0}function i(e){var t=u(e);return t?i(t["extends"]).concat([t]):[]}function a(e){for(var t,o=e["extends"],n=0;t=e.ancestry[n];n++)o=t.is&&t.tag;e.tag=o||e.__name,o&&(e.is=e.__name)}function s(e){if(!Object.__proto__){var t=HTMLElement.prototype;if(e.is){var o=document.createElement(e.tag),n=Object.getPrototypeOf(o);n===e.prototype&&(t=n)}for(var r,i=e.prototype;i&&i!==t;)r=Object.getPrototypeOf(i),i.__proto__=r,i=r;e["native"]=t}}function d(e){return g(M(e.tag),e)}function u(e){return e?y[e.toLowerCase()]:void 0}function c(e,t){y[e]=t}function l(e){return function(){return d(e)}}function f(e,t,o){return e===N?p(t,o):O(e,t)}function p(e,t){var o=u(t||e);if(o){if(e==o.tag&&t==o.is)return new o.ctor;if(!t&&!o.is)return new o.ctor}var n;return t?(n=p(e),n.setAttribute("is",t),n):(n=M(e),e.indexOf("-")>=0&&b(n,HTMLElement),n)}function m(e){var t=L.call(this,e);return w(t),t}var h,v=e.upgradeDocumentTree,w=e.upgrade,g=e.upgradeWithDefinition,b=e.implementPrototype,_=e.useNative,E=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"],y={},N="http://www.w3.org/1999/xhtml",M=document.createElement.bind(document),O=document.createElementNS.bind(document),L=Node.prototype.cloneNode;h=Object.__proto__||_?function(e,t){return e instanceof t}:function(e,t){for(var o=e;o;){if(o===t.prototype)return!0;o=o.__proto__}return!1},document.registerElement=t,document.createElement=p,document.createElementNS=f,Node.prototype.cloneNode=m,e.registry=y,e["instanceof"]=h,e.reservedTagList=E,e.getRegisteredDefinition=u,document.register=document.registerElement}),function(e){function t(){a(wrap(document)),window.HTMLImports&&(HTMLImports.__importsParsingHook=function(e){a(wrap(e["import"]))}),CustomElements.ready=!0,setTimeout(function(){CustomElements.readyTime=Date.now(),window.HTMLImports&&(CustomElements.elapsed=CustomElements.readyTime-HTMLImports.readyTime),document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})}var o=e.useNative,n=e.initializeModules,r=/Trident/.test(navigator.userAgent);if(r&&!function(){var e=document.importNode;document.importNode=function(){var t=e.apply(document,arguments);if(t.nodeType==t.DOCUMENT_FRAGMENT_NODE){var o=document.createDocumentFragment();return o.appendChild(t),o}return t}}(),o){var i=function(){};e.watchShadow=i,e.upgrade=i,e.upgradeAll=i,e.upgradeDocumentTree=i,e.upgradeSubtree=i,e.takeRecords=i,e["instanceof"]=function(e,t){return e instanceof t}}else n();var a=e.upgradeDocumentTree;if(window.wrap||(window.ShadowDOMPolyfill?(window.wrap=ShadowDOMPolyfill.wrapIfNeeded,window.unwrap=ShadowDOMPolyfill.unwrapIfNeeded):window.wrap=window.unwrap=function(e){return e}),r&&"function"!=typeof window.CustomEvent&&(window.CustomEvent=function(e,t){t=t||{};var o=document.createEvent("CustomEvent");return o.initCustomEvent(e,Boolean(t.bubbles),Boolean(t.cancelable),t.detail),o},window.CustomEvent.prototype=window.Event.prototype),"complete"===document.readyState||e.flags.eager)t();else if("interactive"!==document.readyState||window.attachEvent||window.HTMLImports&&!window.HTMLImports.ready){var s=window.HTMLImports&&!HTMLImports.ready?"HTMLImportsLoaded":"DOMContentLoaded";window.addEventListener(s,t)}else t()}(window.CustomElements);

(function(global) {
  // The next ID we'll use for scoped delegation
  var lastID = 0;

  /*
    Matches selectors that are scoped, such as:
      > selector
      :scope > selector
  */
  var scopedSelectorRegex = /^\s*(>|:scope\s*>)/;

  /**
    Check if the first array contains every element in the second array

    @ignore
  */
  function contains(set, subSet) {
    for (var i = 0; i < subSet.length; i++) {
      if (set.indexOf(subSet[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  /**
    Check if the provided selector is scoped (has context)

    @ignore
  */
  function isScoped(selector) {
    return selector && scopedSelectorRegex.test(selector);
  }

  /**
    Replaces the stopPropagation() method of an event object

    @ignore
  */
  function ventStopPropagation() {
    this._ventPropagationStopped = true;
    Event.prototype.stopPropagation.call(this);
  }

  /**
    Replaces the stopImmediatePropagation() method of an event object

    @ignore
  */
  function ventStopImmediatePropagation() {
    this._ventImmediatePropagationStopped = true;
    Event.prototype.stopImmediatePropagation.call(this);
  }

  /**
    Get the right method to match selectors on

    @ignore
  */
  var matchesSelector = (function() {
    var proto = Element.prototype;
    var matchesSelector = (
      proto.matches ||
      proto.matchesSelector ||
      proto.webkitMatchesSelector ||
      proto.mozMatchesSelector ||
      proto.msMatchesSelector ||
      proto.oMatchesSelector
    );

    if (!matchesSelector) {
      throw new Error('Vent: Browser does not support matchesSelector');
    }

    return matchesSelector;
  }());

  /**
    @class Vent
    @classdesc DOM event delegation

    @param {HTMLElement|String} elementOrSelector
      The element or selector indicating the element to use as the delegation root.
  */
  function Vent(elementOrSelector) {
    if (this === global) {
      throw new Error('Vent must be invoked with the new keyword');
    }

    var root;
    if (typeof elementOrSelector === 'string') {
      root = document.querySelector(elementOrSelector);
    }
    else {
      root = elementOrSelector;
    }

    // Store a reference to the root element
    // This is the node at which we'll listen to events
    this.root = root;

    // Map of event names to array of events
    // Don't inherit from Object so we don't collide with properties on its prototype
    this._listenersByType = Object.create(null);

    /*
      A list of all of the listener objects tracked by this instance
      Each item takes the following form:
      {
        eventName: String,
        handler: Function,
        namespaces: Array<string>,
        selector: String | null,
        useCapture: Boolean,
        isScoped: Boolean
      }
    */
    this._allListeners = [];

    // Ensure listeners always execute in the scope of this instance
    this._executeCaptureListeners = this._executeCaptureListeners.bind(this);
    this._executeBubbleListeners = this._executeBubbleListeners.bind(this);

    // All Vent instances get an ID
    this._id = this._id || lastID++;
  }

  /**
    Check if the listener should fire on the given rooted target

    @ignore
  */
  Vent.prototype._listenerMatchesRootTarget = function(listener, target) {
    return (
      // When no selector is provided
      listener.selector === null &&
      (
        // Execute if we've landed on the root
        target === this.root
      )
    );
  };

  /**
    Check if the listener should fire on the given delegated target

    @ignore
  */
  Vent.prototype._listenerMatchesDelegateTarget = function(listener, target) {
    return (
      // document does not support matches()
      target !== document &&
      // Don't bother with delegation on the root element
      target !== this.root &&
      // Check if the event is delegated
      listener.selector !== null &&
      // Only execute  if the selector matches
      (
        // Check if the selector has context
        listener.isScoped ?
        // Run the match using the root element's ID
        matchesSelector.call(target, '[__vent-id__="'+this._id+'"] '+listener.selector)
        // Run the match without context
        : matchesSelector.call(target, listener.selector)
      )
    );
  };

  /**
    Check if the listener matches the given event phase

    @ignore
  */
  Vent.prototype._listenerMatchesEventPhase = function(listener, useCapture) {
    // Check if the event is the in right phase
    return (listener.useCapture === useCapture);
  };

  /**
    This function is responsible for checking if listeners should be executed for the current event

    @ignore
  */
  Vent.prototype._executeListenersAtElement = function(target, listeners, event, useCapture) {
    var listener;
    var returnValue;

    // Execute each listener that meets the criteria
    executeListeners: for (var listenerIndex = 0; listenerIndex < listeners.length; listenerIndex++) {
      listener = listeners[listenerIndex];

      if (
        // Do not process events on disabled items #1
        !(event.type === 'click' && target.disabled === true)
        &&
        // Check if the target element matches for this listener
        (
          this._listenerMatchesRootTarget(listener, target) ||
          this._listenerMatchesDelegateTarget(listener, target)
        ) &&
        this._listenerMatchesEventPhase(listener, useCapture)
      ) {
        // Store the target that matches the event currently
        event.matchedTarget = target;

        // Call handlers in the scope of the delegate target, passing the event along
        returnValue = listener.handler.call(target, event);

        // Prevent default and stopPropagation if the handler returned false
        if (returnValue === false) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (event._ventImmediatePropagationStopped) {
          // Do not process any more event handlers and stop bubbling
          break executeListeners;
        }
      } // end if
    } // end executeListeners
  };

  /**
    Handles all events added with Vent

    @private
    @memberof Vent
  */
  Vent.prototype._executeCaptureListeners = function(event) {
    var listeners = this._listenersByType[event.type];

    if (!listeners) {
      throw new Error('Vent: _executeListeners called in response to '+event.type+', but we are not listening to it');
    }

    if (listeners.length) {
      // Get a copy of the listeners
      // Without this, removing an event inside of a callback will cause errors
      listeners = listeners.slice();

      // Decorate the event object so we know when stopPropagation is called
      this._decorateEvent(event);

      // Get the event's path through the DOM
      var eventPath = this._getPath(event);

      // Simulate the capture phase by trickling down the target list
      trickleDown: for (var eventPathIndex = eventPath.length - 1; eventPathIndex >= 0; eventPathIndex--) {
        if (!listeners.length) {
          // Stop trickling down if there are no more listeners to execute
          break trickleDown;
        }

        var currentTargetElement = eventPath[eventPathIndex];
        this._executeListenersAtElement(currentTargetElement, listeners, event, true);

        // Stop if a handler told us to stop trickling down the DOM
        if (
          event._ventImmediatePropagationStopped ||
          event._ventPropagationStopped
        ) {
          // Stop simulating trickle down
          break trickleDown;
        }
      }
    }

    // Clean up after Vent
    // We'll be re-decorating the event object in the bubble phase, if the event gets there
    this._undecorateEvent(event);
  };

  /**
    Handles all events added with Vent

    @private
    @memberof Vent
  */
  Vent.prototype._executeBubbleListeners = function(event) {
    var listeners = this._listenersByType[event.type];

    if (!listeners) {
      throw new Error('Vent: _executeListeners called in response to '+event.type+', but we are not listening to it');
    }

    if (listeners.length) {
      // Get a copy of the listeners
      // Without this, removing an event inside of a callback will cause errors
      listeners = listeners.slice();

      // Decorate the event object so we know when stopPropagation is called
      this._decorateEvent(event);

      /*
        Figure out if the bubble phase should be simulated

        Both focus and blur do not bubble:
          https://developer.mozilla.org/en-US/docs/Web/Events/focus
          https://developer.mozilla.org/en-US/docs/Web/Events/blur

        However, focusin, focusout, change, and other events do.
      */
      var shouldBubble = event.type !== 'focus' && event.type !== 'blur';

      // Re-use the event path as calculated during the capture phase
      var eventPath = this._getPath(event);

      // If listeners remain and propagation was not stopped, simulate the bubble phase by bubbling up the target list
      bubbleUp: for (var eventPathIndex = 0; eventPathIndex < eventPath.length; eventPathIndex++) {
        if (!listeners.length) {
          // Stop bubbling up if there are no more listeners to execute
          break bubbleUp;
        }

        var currentTargetElement = eventPath[eventPathIndex];
        this._executeListenersAtElement(currentTargetElement, listeners, event, false);

        // Stop simulating the bubble phase if a handler told us to
        if (
          event._ventImmediatePropagationStopped ||
          event._ventPropagationStopped
        ) {
          break bubbleUp;
        }

        // If the event shouldn't bubble, only simulate it on the target
        if (!shouldBubble) {
          break bubbleUp;
        }
      }
    }

    // Clean up after Vent
    this._undecorateEvent(event);

    // Clear the path
    event['_ventPath'+this._id] = null;
  };

  /**
    Override stopPropagation/stopImmediatePropagation so we know if we should stop processing events
  */
  Vent.prototype._decorateEvent = function(event) {
    event.stopPropagation = ventStopPropagation;
    event.stopImmediatePropagation = ventStopImmediatePropagation;
  };

  /**
    Restore the normal stopPropagation methods
  */
  Vent.prototype._undecorateEvent = function(event) {
    event.stopPropagation = Event.prototype.stopPropagation;
    event.stopImmediatePropagation = Event.prototype.stopImmediatePropagation;
  };

  /**
    Restore the normal stopPropagation methods
  */
  Vent.prototype._getPath = function(event) {
    if (event['_ventPath'+this._id]) {
      return event['_ventPath'+this._id];
    }

    // If the event was fired on a text node, delegation should assume the target is its parent
    var target = event.target;
    if (target.nodeType === Node.TEXT_NODE) {
      target = target.parentNode;
    }

    // Build an array of the DOM tree between the root and the element that dispatched the event
    // The HTML specification states that, if the tree is modified during dispatch, the event should bubble as it was before
    // Building this list before we dispatch allows us to simulate that behavior
    var pathEl = target;
    var eventPath = [];
    buildPath: while (pathEl && pathEl !== this.root) {
      eventPath.push(pathEl);
      pathEl = pathEl.parentNode;
    }
    eventPath.push(this.root);

    event['_ventPath'+this._id] = eventPath;

    return eventPath;
  };

  /**
    Add an event listener.
    @memberof Vent

    @param {String} eventName
      The event name to listen for, including optional namespace(s).
    @param {String} [selector]
      The selector to use for event delegation.
    @param {Function} handler
      The function that will be called when the event is fired.
    @param {Boolean} [useCapture]
      Whether or not to listen during the capturing or bubbling phase.

    @returns {Vent} this, chainable.
  */
  Vent.prototype.on = function(eventName, selector, handler, useCapture) {
    if (typeof selector === 'function') {
      useCapture = handler;
      handler = selector;
      selector = null;
    }

    if (typeof handler !== 'function') {
      throw new Error('Vent: Cannot add listener with non-function handler');
    }

    // Be null if every falsy (undefined or empty string passed)
    if (!selector) {
      selector = null;
    }


    if (typeof useCapture === 'undefined') {
      // Force useCapture for focus and blur events
      if (eventName === 'focus' || eventName === 'blur') {
        // true by default for focus and blur events only
        useCapture = true;
      }
      else {
        // false by default
        // This matches the HTML API
        useCapture = false;
      }
    }

    // Extract namespaces
    var namespaces = null;
    var dotIndex = eventName.indexOf('.');
    if (dotIndex !== -1) {
      namespaces = eventName.slice(dotIndex+1).split('.');
      eventName = eventName.slice(0, dotIndex);
    }

    // Get/create the list for the event type
    var listenerList = this._listenersByType[eventName];
    if (!listenerList) {
      listenerList = this._listenersByType[eventName] = [];

      // Add the actual listener
      this.root.addEventListener(eventName, this._executeCaptureListeners, true);
      this.root.addEventListener(eventName, this._executeBubbleListeners, false);
    }

    // Set the special ID attribute if the selector is scoped
    var listenerIsScoped = isScoped(selector);
    if (listenerIsScoped) {
      // Normalize selectors so they don't use :scope
      selector = selector.replace(scopedSelectorRegex, '>');

      // Store a unique ID and set a special attribute we'll use to scope
      this.root.setAttribute('__vent-id__', this._id);
    }

    // Create an object with the event's information
    var eventObject = {
      eventName: eventName,
      handler: handler,
      namespaces: namespaces,
      selector: selector,
      useCapture: useCapture,
      isScoped: listenerIsScoped
    };

    // Store relative to the current type and with everyone else
    listenerList.push(eventObject);
    this._allListeners.push(eventObject);
  };

  /**
    Remove an event listener.
    @memberof Vent

    @param {String} [eventName]
      The event name to stop listening for, including optional namespace(s).
    @param {String} [selector]
      The selector that was used for event delegation.
    @param {Function} [handler]
      The function that was passed to <code>on()</code>.
    @param {Boolean} [useCapture]
      Only remove listeners with <code>useCapture</code> set to the value passed in.

    @returns {Vent} this, chainable.
  */
  Vent.prototype.off = function(eventName, selector, handler, useCapture) {
    if (typeof selector === 'function') {
      useCapture = handler;
      handler = selector;
      selector = null;
    }

    // Be null if not provided
    if (typeof eventName === 'undefined') {
      eventName = null;
    }

    if (typeof selector === 'undefined') {
      selector = null;
    }

    if (typeof handler === 'undefined') {
      handler = null;
    }

    if (typeof useCapture === 'undefined') {
      useCapture = null;
    }

    // Extract namespaces
    var namespaces = null;
    if (eventName) {
      var dotIndex = eventName.indexOf('.');
      if (dotIndex !== -1) {
        namespaces = eventName.slice(dotIndex+1).split('.');
        eventName = eventName.slice(0, dotIndex);
      }
    }

    // Be null
    if (eventName === '') {
      eventName = null;
    }

    var listener;
    var index;
    var listeners = this._allListeners;
    for (var i = 0; i < listeners.length; i++) {
      listener = listeners[i];

      if (
        (eventName === null || listener.eventName === eventName) &&
        (selector === null || listener.selector === selector) &&
        (handler === null || listener.handler === handler) &&
        (useCapture === null || listener.useCapture === useCapture) &&
        (
          // Remove matching listeners, regardless of namespace
          namespaces === null ||
          // Listener matches all specified namespaces
          (listener.namespaces && contains(listener.namespaces, namespaces))
        )
      ) {
        // Remove the listeners info
        this._allListeners.splice(i, 1);

        // Array length changed, so check the same index on the next iteration
        i--;

        // Get index in listenersByType map
        if (!this._listenersByType[listener.eventName]) {
          throw new Error('Vent: Missing listenersByType for '+listener.eventName);
        }

        // Find the event info in the other lookup list
        index = this._listenersByType[listener.eventName].indexOf(listener);
        if (index !== -1) {
          var mapList = this._listenersByType[listener.eventName];

          // Remove from the map
          mapList.splice(index, 1);

          // Check if we've removed all the listeners for this event type
          if (mapList.length === 0) {
            // Remove the actual listener, if necessary
            this.root.removeEventListener(listener.eventName, this._executeCaptureListeners, true);
            this.root.removeEventListener(listener.eventName, this._executeBubbleListeners, false);

            // Avoid using delete operator for performance
            this._listenersByType[listener.eventName] = null;
          }
        }
        else {
          throw new Error('Vent: Event existed in allEvents, but did not exist in listenersByType');
        }
        // Don't stop now! We want to remove all matching listeners, so continue to loop
      }
    }

    return this;
  };

  if (typeof CustomEvent === 'function') {
    // Use native CustomEvent on platforms that support it
    // Note: defaultPrevented will not be set correctly if CustomEvent is polyfilled

    /**
      Dispatch a custom event at the root element.
      @memberof Vent

      @param {String} eventName
        The name of the event to dispatch.
      @param {Object} [options]
        CustomEvent options.
      @param {Object} [options.bubbles=true]
        Whether the event should bubble.
      @param {Object} [options.cancelable=true]
        Whether the event should be cancelable.
      @param {Object} [options.detail]
        Data to pass to handlers as <code>event.detail</code>
    */
    Vent.prototype.dispatch = function(eventName, options) {
      options = options || {};

      if (typeof options.bubbles === 'undefined') {
        options.bubbles = true;
      }

      if (typeof options.cancelable === 'undefined') {
        options.cancelable = true;
      }

      var event = new CustomEvent(eventName, options);
      this.root.dispatchEvent(event);

      return event;
    };
  }
  else {
    // Use createEvent for old browsers
    Vent.prototype.dispatch = function(eventName, options) {
      options = options || {};

      if (typeof options.bubbles === 'undefined') {
        options.bubbles = true;
      }

      if (typeof options.cancelable === 'undefined') {
        options.cancelable = true;
      }

      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, options.bubbles, options.cancelable, options.detail);

      // Dispatch the event, checking the return value to see if preventDefault() was called
      var defaultPrevented = !this.root.dispatchEvent(event);

      // Check if the defaultPrevented status was correctly stored back to the event object
      if (defaultPrevented !== event.defaultPrevented) {
        // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
        // However, it does return false if preventDefault() was called
        // Unfortunately, the returned event's defaultPrevented property is read-only
        // We need to work around this such that (patchedEvent instanceof Event) === true
        // First, we'll create an object that uses the event as its prototype
        // This gives us an object we can modify that is still technically an instanceof Event
        var patchedEvent = Object.create(event);

        // Next, we set the correct value for defaultPrevented on the new object
        // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
        // For some reason, defineProperty doesn't cause this
        Object.defineProperty(patchedEvent, 'defaultPrevented', { value: defaultPrevented });

        return patchedEvent;
      }

      return event;
    };
  }

  /**
    Destroy this instance, removing all events and references.
    @memberof Vent
  */
  Vent.prototype.destroy = function() {
    if (this.destroyed) {
      // Instance is already destroyed, do nothing
      return;
    }

    // Remove all events
    this.off();

    // Remove all references
    this._listenersByType = null;
    this._allListeners = null;
    this.root = null;
    this.destroyed = true;
  };

  // Expose globally
  global.Vent = Vent;
}(this));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Vent: true */
/**
  The main Coral namespace.
  @namespace
*/
var Coral = window.Coral = window.Coral || {};

Coral.events = new Vent(window);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  The Coral utility belt.
  @namespace
*/
Coral.commons = Coral.commons || {};

/**
  Copy the properties from all provided objects into the first object.

  @param {Object} dest
    The object to copy properties to
  @param {...Object} source
    An object to copy properties from. Additional objects can be passed as subsequent arguments.

  @returns {Object}
    The destination object, <code>dest</code>

  @memberof Coral.commons
  @static
*/
Coral.commons.extend = function() {
  'use strict';
  var dest = arguments[0];
  for (var i = 1, ni = arguments.length; i < ni; i++) {
    var source = arguments[i];
    for (var prop in source) {
      dest[prop] = source[prop];
    }
  }
  return dest;
};

/**
  Copy the properties from the source object to the destination object, but calls the callback if the property is
  already present on the destination object.

  @param {Object} dest
    The object to copy properties to
  @param {...Object} source
    An object to copy properties from. Additional objects can be passed as subsequent arguments.
  @param {Coral.commons~handleCollision} [handleCollision]
    Called if the property being copied is already present on the destination.
    The return value will be used as the property value.

  @returns {Object}
    The destination object, <code>dest</code>

  @memberof Coral.commons
  @static
*/
Coral.commons.augment = function() {
  'use strict';
  var dest = arguments[0];
  var handleCollision;
  var argCount = arguments.length;
  var lastArg = arguments[argCount - 1];

  if (typeof lastArg === 'function') {
    handleCollision = lastArg;

    // Don't attempt to augment using the last argument
    argCount--;
  }

  for (var i = 1; i < argCount; i++) {
    var source = arguments[i];

    for (var prop in source) {
      if (typeof dest[prop] !== 'undefined') {
        if (typeof handleCollision === 'function') {
          // Call the handleCollision callback if the property is already present
          var ret = handleCollision(dest[prop], source[prop], prop, dest, source);
          if (typeof ret !== 'undefined') {
            dest[prop] = ret;
          }
        }
      // Otherwise, do nothing
      }
      else {
        dest[prop] = source[prop];
      }
    }
  }

  return dest;
};

/**
  Called when a property already exists on the destination object.

  @callback Coral.commons~handleCollision

  @param {*} oldValue
    The value currently present on the destination object.
  @param {*} newValue
    The value on the destination object.
  @param {*} prop
    The property that collided.
  @param {*} dest
    The destination object.
  @param {*} source
    The source object.

  @returns {*} The value to use. If <code>undefined</code>, the old value will be used.
*/

/**
  Return a new object with the swapped keys and values of the provided object.

  @param {Object} obj
    The object to copy.

  @returns {Object}
    An object with its keys as the values and values as the keys of the source object.

  @memberof Coral.commons
  @static
*/
Coral.commons.swapKeysAndValues = function(obj) {
  'use strict';

  var map = {};
  for (var key in obj) {
    map[obj[key]] = key;
  }
  return map;
};

/**
  Execute the provided callback on the next animation frame.
  @function
  @param {Function} callback
    The callback to execute.
*/
Coral.commons.nextFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {'use strict'; return window.setTimeout(callback, 1000 / 60); }).bind(window);


/**
  Execute the callback once a CSS transition has ended.

  @callback Coral.commons~transitionEndCallback
  @param event
    The event passed to the callback.
  @param {HTMLElement} event.target
    The DOM element that was affected by the CSS transition.
  @param {Boolean} event.cssTransitionSupported
    Whether CSS transitions are supported by the browser.
  @param {Boolean} event.transitionStoppedByTimeout
    Whether the CSS transition has been ended by a timeout (should only happen as a fallback).
 */

/**
  Execute the provided callback once a CSS transition has ended. This method listens for the next transitionEnd event on
  the given DOM element. It cannot be used to listen continuously on transitionEnd events. If browser does not support
  CSS transitions (e.g. IE 9) the callback is immediately called.

  @param {HTMLElement} element
    The DOM element that is affected by the CSS transition.
  @param {Coral.commons~transitionEndCallback} callback
    The callback to execute.
 */
Coral.commons.transitionEnd = function(element, callback) {
  'use strict';

  var $element = jQuery(element);
  var propertyName;
  var hasTransitionEnded = false;
  var transitionEndEventName = null;
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'MSTransition': 'msTransitionEnd'
  };
  var transitionEndTimeout = null;
  var onTransitionEnd = function(event) {
    var transitionStoppedByTimeout = (typeof event === 'undefined');

    if (!hasTransitionEnded) {
      hasTransitionEnded = true;

      clearTimeout(transitionEndTimeout);

      // Remove event listener (if any was used by the current browser)
      element.removeEventListener(transitionEndEventName, onTransitionEnd);

      // Call callback with specified element
      callback({
        target: element,
        cssTransitionSupported: true,
        transitionStoppedByTimeout: transitionStoppedByTimeout
      });
    }
  };

  // Find transitionEnd event name used by browser
  for (propertyName in transitions) {
    if (element.style[propertyName] !== undefined) {
      transitionEndEventName = transitions[propertyName];
      break;
    }
  }

  if (transitionEndEventName !== null) {
    // Register on transitionEnd event
    element.addEventListener(transitionEndEventName, onTransitionEnd);

    // Catch IE 10/11 sometimes not performing the transition at all => set timeout for this case
    transitionEndTimeout = setTimeout(onTransitionEnd, parseFloat($element.css('transition-duration')) * 1000 + 100);
  }
  else {
    // ... if browser does not support transitions directly call the callback (e.g.: IE9)
    callback({
      target: element,
      cssTransitionSupported: false,
      transitionStoppedByTimeout: false
    });
  }
};

/**
  Execute the provided callback when all web components are ready.

  @param {HTMLElement} parent
    The element to check readiness of
  @param {Function} callback
    The callback to execute.
*/
(function() {
  'use strict';

  function isCoralComponent(element) {
    if (element.tagName.indexOf('CORAL-') === 0) {
      return true;
    }
    else {
      var is = element.getAttribute('is');
      if (is && is.toUpperCase().indexOf('CORAL-') === 0) {
        return true;
      }
    }
    return false;
  }

  function allChildrenReady(element, childElements) {
    var readyCount = 0;
    var componentCount = 0;

    // If the parent element is a custom element, return false if it's not ready
    // When it is ready, the ready event will trigger, calling this function again
    // If, at that time, no other children need to be upgraded, we'll return true and the callback will be called
    if (isCoralComponent(element) && !element._componentReady) {
      return false;
    }

    for (var i = 0; i < childElements.length; i++) {
      var childElement = childElements[i];

      // Check only those that are Coral components
      if (isCoralComponent(childElement)) {
        componentCount++;

        if (childElement._componentReady) {
          readyCount++;
        }
      }
    }

    return readyCount === componentCount;
  }

  // Track whether web components are ready
  var webComponentsReady = false;
  window.addEventListener('WebComponentsReady', function handleWebComponentsReady() {
    webComponentsReady = true;
    window.removeEventListener('WebComponentsReady', handleWebComponentsReady);
  });

  /**
    Execute the callback once a component and sub-components are [ready]{@link Coral.commons.ready}.

    @callback Coral.commons~readyCallback
    @param {HTMLElement} element
      The element that is ready.
  */

  /**
    Checks, if a Coral components and all nested components are ready, which means their
    <code>_initialize</code> and <code>_render</code> methods have been called. If so, the provided callback function is executed

    @param {HTMLElement} element
      The element that should be watched for ready events.
    @param {Coral.commons~readyCallback} callback
      The callback to call when all components are ready.
  */
  Coral.commons.ready = function(element, callback) {
    if (typeof element === 'function') {
      callback = element;

      if (webComponentsReady) {
        // Already ready
        callback(window);
      }
      else {
        // Wait for WebComponentsReady event
        window.addEventListener('WebComponentsReady', function handleWebComponentsReady() {
          callback(window);
          window.removeEventListener('WebComponentsReady', handleWebComponentsReady);
        });
      }
      return;
    }

    // Since we can't querySelector for Coral components. Get all the child elements and find the components
    var childElements = element.getElementsByTagName('*');

    if (allChildrenReady(element, childElements)) {
      // All components are already ready
      callback(element);
    }
    else {
      // Listen to the ready event and check if all components are ready
      element.addEventListener('coral-component:ready', function handleComponentReady(event) {
        if (allChildrenReady(element, childElements)) {
          element.removeEventListener('coral-component:ready', handleComponentReady);
          callback(element);
        }
      });
    }

  };
}());

/**
  Assign an object given a nested path

  @param {Object} root
    The root object on which the path should be traversed.
  @param {String} path
    The path at which the object should be assignment.
  @param {String} obj
    The object to assign at path.

  @throws Will throw an error if the path is not present on the object.
*/
Coral.commons.setSubProperty = function(root, path, obj) {
  'use strict';

  var nsParts = path.split('.');
  var curObj = root;

  if (nsParts.length === 1) {
    // Assign immediately
    curObj[path] = obj;
    return;
  }

  // Make sure we can assign at the requested location
  while (nsParts.length > 1) {
    var part = nsParts.shift();
    if (curObj[part]) {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.setSubProperty: could not set ' + path + ', part ' + part + ' not found');
    }
  }

  // Do the actual assignment
  curObj[nsParts.shift()] = obj;
};

/**
  Get the value of the property at the given nested path.

  @param {Object} root
    The root object on which the path should be traversed.
  @param {String} path
    The path of the sub-property to return.

  @returns {*}
    The value of the provided property.

  @throws Will throw an error if the path is not present on the object.
*/
Coral.commons.getSubProperty = function(root, path) {
  'use strict';

  var nsParts = path.split('.');
  var curObj = root;

  if (nsParts.length === 1) {
    // Return property immediately
    return curObj[path];
  }

  // Make sure we can assign at the requested location
  while (nsParts.length) {
    var part = nsParts.shift();
    // The property might be undefined, and that's OK if it's the last part
    if (nsParts.length === 0 || typeof curObj[part] !== 'undefined') {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.getSubProperty: could not get ' + path + ', part ' + part + ' not found');
    }
  }

  return curObj;
};

(function() {
  /* jshint validthis: true */
  'use strict';

  /**
    Apply a mixin to the given object.

    @param {Object}
      The object to apply the mixin to.
    @param {Object|Function} mixin
      The mixin to apply.
    @param {Object} options
      An objcet to pass to functional mixins.

    @ignore
  */
  function applyMixin(target, mixin, options) {
    var mixinType = typeof mixin;

    if (mixinType === 'function') {
      mixin(target, options);
    }
    else if (mixinType === 'object' && mixin !== null) {
      Coral.commons.extend(target, mixin);
    }
    else {
      throw new Error('Coral.commons.mixin: Cannot mix in ' + mixinType + ' to ' + target.toString());
    }
  }

  /**
    Mix a set of mixins to a target object.

    @param {Object} target
      The target prototype or instance on which to apply mixins.
    @param {Object|Coral~mixin|Array<Object|Coral~mixin>} mixins
      A mixin or set of mixins to apply.
    @param {Object} options
      An object that will be passed to functional mixins as the second argument (options).
  */
  Coral.commons.mixin = function(target, mixins, options) {
    if (Array.isArray(mixins)) {
      for (var i = 0; i < mixins.length; i++) {
        applyMixin(target, mixins[i], options);
      }
    }
    else {
      applyMixin(target, mixins, options);
    }
  };

  /**
    A functional mixin.

    @callback Coral~mixin

    @param {Object} target
      The target prototype or instance to apply the mixin to.
    @param {Object} options
      Options for this mixin.
    @param {Coral~PropertyDescriptor.properties} options.properties
      The properties object as passed to {@link Coral.register}. This can be modified in place.
  */
}());

(function() {
  'use strict';

  var nextID = 0;

  /**
    Get a unique ID.

    @memberof Coral.commons
    @static
    @returns {String} unique identifier.
  */
  Coral.commons.getUID = function() {
    return 'coral-id-' + (nextID++);
  };
}());

(function() {
  'use strict';

  function noop() {
  }

  function returnFirst(first, second) {
    return function returnFirst() {
      var ret = first.apply(this, arguments);
      second.apply(this, arguments);
      return ret;
    };
  }

  /**
    Check if the provided object is a function

    @ignore

    @param {*} object
      The object to test

    @returns {Boolean} Whether the provided object is a function.
  */
  function isFunction(object) {
    return typeof object === 'function';
  }

  /**
    Call all of the provided functions, in order, returning the return value of the specified function.

    @param {...Function} func
      A function to call
    @param {Number} [nth=0]
      A zero-based index indicating the noth argument to return the value of.
      If the nth argument is not a function, <code>null</code> will be returned.

    @returns {Function} The aggregate function.
  */
  Coral.commons.callAll = function() {
    var nth = arguments[arguments.length - 1];
    if (typeof nth !== 'number') {
      nth = 0;
    }

    // Get the function whose value we should return
    var funcToReturn = arguments[nth];

    // Only use arguments that are functions
    var functions = Array.prototype.filter.call(arguments, isFunction);

    if (functions.length === 2 && nth === 0) {
      // Most common usecase: two valid functions passed
      return returnFirst(functions[0], functions[1]);
    }
    else if (functions.length === 1) {
      // Common usecase: one valid function passed
      return functions[0];
    }
    else if (functions.length === 0) {
      // Fail case: no valid functions passed
      return noop;
    }

    if (typeof funcToReturn !== 'function') {
      // If the argument at the provided index wasn't a function, just return the value of the first valid function
      funcToReturn = functions[0];
    }

    return function() {
      var finalRet;
      var ret;
      var func;

      // Skip first arg
      for (var i = 0; i < functions.length; i++) {
        func = functions[i];
        ret = func.apply(this, arguments);

        // Store return value of desired function
        if (func === funcToReturn) {
          finalRet = ret;
        }
      }
      return finalRet;
    };
  };
}());

(function() {
  'use strict';

  // Adaptation of http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
  function ResizeEventTrigger() {
    // User agent toggles
    var isIE = navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/Edge/);
    this.useNativeResizeSupport = document.attachEvent && !isIE;
  }

  ResizeEventTrigger.prototype._addTriggerElement = function(element, listenerFunction) {
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    var obj = document.createElement('object');
    element._resizeTriggerElement = obj;
    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -100; opacity:0;');
    obj.setAttribute('tabindex', '-1');

    obj.onload = function(e) {
      this.contentDocument.defaultView._originalElement = element;
      this.contentDocument.defaultView._listenerFunction = listenerFunction;
      this.contentDocument.defaultView.addEventListener('resize', listenerFunction);

      // Call one initial resize for all browsers
      // Required, as in WebKit this callback adding the event listeners is called too late. Layout has already finished.
      listenerFunction({
        target: this.contentDocument.defaultView
      });
    };

    obj.type = 'text/html';

    // InternetExplorer is picky about the order of "obj.data = ..." and element.appendChild(obj) so make sure to get it right
    element.appendChild(obj);
    obj.data = 'about:blank';
  };

  ResizeEventTrigger.prototype._removeTriggerElement = function(element) {
    if (!element._resizeTriggerElement) {
      return;
    }

    var triggerElement = element._resizeTriggerElement;

    // processObjectLoadedEvent might never have been called
    if (triggerElement.contentDocument && triggerElement.contentDocument.defaultView) {
      triggerElement.contentDocument.defaultView.removeEventListener('resize', triggerElement.contentDocument.defaultView._listenerFunction);
    }

    element._resizeTriggerElement = !element.removeChild(element._resizeTriggerElement);
  };

  ResizeEventTrigger.prototype._fireResizeListeners = function(event) {
    var targetElement = event.target || event.srcElement;

    var trigger = targetElement._originalElement || targetElement;
    trigger._resizeListeners.forEach(function(fn) {
      fn.call(trigger, event);
    });
  };

  /**
    Adds a resize listener to the given element.

    @param {HTMLElement} element
      The element to add the resize event to.
    @param {Function} callback
      The resize callback.
  */
  ResizeEventTrigger.prototype.addResizeListener = function(element, callback) {
    if (!element) {
      return;
    }

    if (this.useNativeResizeSupport) {
      element.addEventListener('resize', callback);
      return;
    }

    // The array may still exist, so we check its length too
    if (!element._resizeListeners || element._resizeListeners.length === 0) {
      element._resizeListeners = [];
      this._addTriggerElement(element, this._fireResizeListeners.bind(this));
    }

    element._resizeListeners.push(callback);
  };

  /**
    Removes a resize listener from the given element.

    @param {HTMLElement} element
      The element to remove the resize event from.
    @param {Function} callback
      The resize callback.
  */
  ResizeEventTrigger.prototype.removeResizeListener = function(element, callback) {
    if (!element) {
      return;
    }

    if (this.useNativeResizeSupport) {
      element.removeEventListener('resize', callback);
      return;
    }

    // resizeListeners and resizeTrigger must be present
    if (!element._resizeListeners || !element._resizeTriggerElement) {
      return;
    }

    var fnIndex = element._resizeListeners.indexOf(callback);

    // Don't remove the function unless it is already registered
    if (fnIndex === -1) {
      return;
    }

    element._resizeListeners.splice(fnIndex, 1);

    if (!element._resizeListeners.length) {
      this._removeTriggerElement(element);
    }
  };

  /**
    Bind static methods
  */
  var resizeEvent = new ResizeEventTrigger();
  Coral.commons.addResizeListener = resizeEvent.addResizeListener.bind(resizeEvent);
  Coral.commons.removeResizeListener = resizeEvent.removeResizeListener.bind(resizeEvent);
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property value transform functions.
  @namespace
*/
Coral.transform = {};

/**
  Transform the provided value into a boolean. Follows the behavior of JavaScript thruty/falsy.

  @param {*} value
    The value to convert to Boolean.

  @returns {Boolean} The corresponding boolean value.
*/
Coral.transform.boolean = function(value) {
  'use strict';
  return !!value;
};

/**
  Transform the provided value into a boolean. Follows the behavior of the HTML specification, in which the existence of
  the attribute indicates <code>true</code> regardless of the attribute's value.

  @param {*} value
    The value to convert to Boolean.

  @returns {Boolean} The corresponding boolean value.
*/
Coral.transform.booleanAttr = function(value) {
  'use strict';
  return !(value === null || typeof value === 'undefined');
};

/**
  Transforms the provided value into a floating point number.

  @param {*} value
    The value to convert to a Number.

  @returns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to a number.
*/
Coral.transform.number = function(value) {
  'use strict';

  value = parseFloat(value);
  return isNaN(value) ? null : value;
};


/**
  Transforms the provided value into a floating number. The conversion is strict in the sense that if non numeric values
  are detected, <code>null</code> is returned instead.

  @param {*} value
    The value to be converted to a Number.

  @retuns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to number.
*/
Coral.transform.float = function(value) {
  'use strict';

  if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
    return Number(value);
  }

  return null;
};

/**
  Transform the provided value into a string. When given <code>null</code> or <code>undefined</code> it will be
  converted to an empty string("").

  @param {*} value
    The value to convert to String.

  @returns {String} The corresponding string value.
*/
Coral.transform.string = function(value) {
  'use strict';
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  return typeof value === 'string' ? value : String(value);
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property value validators
  @namespace
*/
Coral.validate = {};

/**
  Signature of the function used to validate new input. It accepts a newValue and an oldValue which are used to
  determine if the newValue is valid.

  @callback Coral.validate~validationFunction

  @param {*} newValue
    The new value to validate.
  @param {*} oldValue
    The existing value.

  @returns {Boolean} <code>true</code> if the validation succeeded, otherwise <code>false</code>.
*/

/**
  Ensures that the value has changed.

  @param {*} newValue
    The new value.
  @param {*} oldValue
    The existing value.

  @returns {Boolean} <code>true</code> if the values are different.
*/
Coral.validate.valueMustChange = function(newValue, oldValue) {
  'use strict';

  // We can use exact equality here as validation functions are called after transform. Thus, the input value will be
  // converted to the same type as a stored value
  return newValue !== oldValue;
};

/**
  Ensures that the new value is within the enumeration. The enumeration can be given as an array of values or as a
  key/value Object. Take into consideration that enumerations are case sensitive.

  @example // Enumeration as Array
Coral.validate.enumeration(['xs', 's', 'm', 'l']);
  @example // Enumeration as Object
Coral.validate.enumeration({EXTRA_SMALL : 'xs', SMALL : 's', MEDIUM : 'm', LARGE : 'l'});
  @param {Object} enumeration
    Object that represents an enum.

  @returns {Coral.validate~validationFunction}
    a validation function that ensures that the given value is within the enumeration.
*/
Coral.validate.enumeration = function(enumeration) {
  'use strict';

  // Reverses the enumeration, so that we can check that the variable new value exists inside
  var enumReversed = Coral.commons.swapKeysAndValues(enumeration);

  // Returns a new function that matches the newValue, oldValue signature
  return function(newValue, oldValue) {
    return typeof enumReversed[newValue] !== 'undefined';
  };
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property descriptor factory factories
  @namespace
*/
Coral.property = {};

/**
  A factory that creates descriptor factories that proxy a local property/attribute to a sub-property.
  This factory should be used when you need the property of an sub-object to be set or queued for sync when a local
  property changes.
  This is especially useful for setting the innerHTML or other properties of sub-elements.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor
  @param {String} path
    The path under <code>this</code> to proxy to. For instance, <code>_elements.header.innerHTML</code> would proxy
    to the <code>innerHTML</code> of the element with the handle <code>header</code>
  @param {Boolean} [needsDOMSync=false]
    Whether the property set should happen asynchronously on the next animation frame.

  @returns {Function} The descriptor factory.
*/
Coral.property.proxy = function(descriptor) {
  'use strict';

  // Store the path
  var path = descriptor.path;

  function setProxy(value, silent) {
    /* jshint validthis: true */
    Coral.commons.setSubProperty(this, path, value);
  }

  function getProxy() {
    /* jshint validthis: true */
    return Coral.commons.getSubProperty(this, path);
  }

  var functionalDescriptor = function(proto, propName) {
    var tempPropName = '_' + propName;

    if (descriptor.needsDOMSync) {
      // If a sync needs to happen, define a method
      descriptor.sync = function() {
        Coral.commons.setSubProperty(this, path, this[tempPropName]);

        // Use undefined here, not null
        this[tempPropName] = undefined;
      };

      descriptor.set = function(value, silent) {
        this[tempPropName] = value;
      };

      descriptor.get = function() {
        // Return the temporary variable if it's set, otherwise get the property we're proxying
        return typeof this[tempPropName] === 'undefined' ?
          Coral.commons.getSubProperty(this, path) : this[tempPropName];
      };
    }
    else {
      // If we don't need to sync, simply delegate to the property
      // @todo test if it's faster to compose a function with new Function()
      descriptor.set = setProxy;
      descriptor.get = getProxy;
      descriptor.sync = null;
    }

    return descriptor;
  };

  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;

  // Return a function that sets up the property
  return functionalDescriptor;
};

/**
  A factory that creates descriptor factories that proxy a local property/attribute to a sub-element's attribute.

  This is useful when you want to proxy a property/attrubute to a sub-element as an attribute set/removal.
  For instance, you may want to proxy the <code>aria-labelledby</code> property of a field component to the actual
  input inside of the component for accessibility purposes.

  When using this property factory, be sure to specify a property name not implemented by the browser already.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor.
  @param {String} descriptor.attribute
    The attribute to proxy.
  @param {String} descriptor.handle
    The handle of the element to proxy the attribute to.
*/
Coral.property.proxyAttr = function(descriptor) {
  'use strict';

  var attribute = descriptor.attribute;
  var handle = descriptor.handle;

  var functionalDescriptor = function(proto, propName) {
    return Coral.commons.extend({
      attribute: attribute,
      set: function(value) {
        // Both false and null should remove the attribute
        // This supports the behavior of Coral.transform.boolean as well as non-transformed attributes
        // Any other value, including empty string, should set it
        this._elements[handle][value === false || value === null ? 'removeAttribute' : 'setAttribute'](attribute, value);
      },
      get: function() {
        return this._elements[handle].getAttribute(attribute);
      }
    }, descriptor);
  };

  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;

  return functionalDescriptor;
};

/**
  A factory that creates descriptor factories for content zones.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor.
  @param {String} descriptor.handle
    The handle of the element to proxy the attribute to.
  @param {String} [descriptor.tagName]
    The tag name to expect. If not provided, any tag will be accepted.
  @param {Function} [descriptor.set]
    Executed after the property is set.
  @param {Function} [descriptor.get]
    An alternate getter. If not provided, the element specified by the handle will be returned.
*/
Coral.property.contentZone = function(descriptor) {
  'use strict';

  var handle = descriptor.handle;
  var expectedTagName = descriptor.tagName;
  var additionalSetter = descriptor.set;
  var alternateGetter = descriptor.get;

  var functionalDescriptor = function(proto, propName) {
    // Combine the provided descriptor with the factory's properties
    // Give precidence to the factory's properties
    return Coral.commons.extend({}, descriptor, {
      contentZone: true,
      set: function(value) {
        if (!(value instanceof HTMLElement)) {
          throw new Error('DOMException: Failed to set the \'' + propName + '\' property on \'' + this.toString() +
            '\': The provided value is not of type \'HTMLElement\'.');
        }

        if (expectedTagName && value.tagName.toLowerCase() !== expectedTagName) {
          throw new Error('DOMException: Failed to set the \'' + propName + '\' property on \'' + this.toString() +
            '\': The new ' + propName + ' element is of type \'' + value.tagName + '\'. It must be a \'' +
            expectedTagName.toUpperCase() + '\' element.');
        }

        // Replace the existing element
        this._elements[handle].parentNode.replaceChild(value, this._elements[handle]);

        // Re-assign the handle to the new element
        this._elements[handle] = value;

        // Invoke the setter
        if (typeof additionalSetter === 'function') {
          additionalSetter.call(this, value);
        }
      },
      get: alternateGetter || function() {
          return this._elements[handle];
        }
    });
  };

  return functionalDescriptor;
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global module: true, exports: true */
var Coral = window.Coral = window.Coral || {};

// CommonJS and Node.js module support
if (typeof exports !== 'undefined') {
  // Support Node.js specific `module.exports` (which can be a function)
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Coral;
  }
  // But always support CommonJS module 1.1.1 spec, Coral is an object
  exports = Coral;
}

/**
  A property descriptor.

  @typedef {Object} Coral~PropertyDescriptor
  @property {Function} [transform=null]
    The value transformation function. Values passed to setters will be ran through this function first.
  @property {Function} [attributeTransform=transform]
    The value transformation function for attribute. The value given by <code>attributeChangedCallback</code> will be
    ran through this function first before passed to setters.
  @property {Coral.validate~validationFunction} [validate={@link Coral.validate.valueMustChange}]
    The value validation function. A validation function that takes two arguments, <code>newValue</code> and
    <code>oldValue</code>, returning true if the setter should run or false if not.
  @property {String|Function} [trigger=null]
    The name of the event to trigger after this property changes, or a {Function} to call that will trigger the event.
    The function is passed the <code>newValue</code> and <code>oldValue</code>.
  @property {String|Function} [triggerBefore=null]
    The name of the event to trigger before this property changes, a {Function} to call that will trigger the event,
    or <code>true</code> to set the name automatically. The function is passed the <code>newValue</code> and
    <code>oldValue</code> and must return the Event object for <code>preventDefault()</code> to work within handlers. If
    set to <code>true</code>, {@link Coral~PropertyDescriptor} must be a string with a colon in it, such as
    <code>coral-component:change</code>, which results in <code>coral-component:beforechange</code>. If set to
    <code>false</code>, no event will be triggered before the setter is ran.
  @property {String} [attribute=propName]
    The name of the attribute corresponding to this property. If not provided, the property name itself will be used.
    If <code>null</code> is provided, the property will not be set by a corresponding attribute.
  @property {Boolean} [reflectAttribute=false]
    Whether this property should be reflected as an attribute when changed. This is useful when you want to style CSS
    according to the property's existence or value.
  @property {Function} [sync=null]
    The method to be called when this property's value should be synced to the DOM.
  @property {String|Array.<String>} [alsoSync=null]
    A property or list of properties that should be synced after this property is synced.
  @property {Function} [set={@link Coral~defaultSet}]
    The setter for this property.
  @property {Function} [get={@link Coral~defaultGet}]
    The getter for this property.
  @property {Boolean} [override=false]
    Whether this property descriptor should completely override. If <code>false</code>, this descriptor will augment
    the existing descriptor. See {@link Coral.register.augmentProperties} for details.
  @property {Boolean} [contentZone=false]
    Whether this property represents a content zone. Content zones are treated differently when set() is invoked such
    that the provided value is passed to the content zone's set() method.
*/
(function() {
  'use strict';

  // These properties won't be treated as methods
  var specialProperties = {
    extend: true,
    properties: true,
    events: true,
    _elements: true,
    name: true,
    tagName: true,
    baseTagName: true,
    className: true
  };

  function noop() {
  }
  function passThrough(value) {
    return value;
  }

  /**
    Creates an array with validation functions for the given properties. If no validate is specified, then the default
    validator is used.
    @ignore
  */
  function makeValidate(descriptor) {
    if (!descriptor.validate) {
      return [Coral.validate.valueMustChange];
    }

    if (Array.isArray(descriptor.validate)) {
      return descriptor.validate;
    }

    return [descriptor.validate];
  }

  /**
    Make a attribute reflect function for the given property. If the property is not reflected, return a noop.
    @ignore
  */
  function makeReflect(propName, descriptor) {
    if (!descriptor.reflectAttribute) {
      return noop;
    }

    var attrName = descriptor.attribute || propName;

    return function doReflect(value, silent) {
      // Reflect the property
      if (value === false || value === null) {
        // Non-truthy attributes should be destroyed
        this.removeAttribute(attrName);
      }
      else {
        // Boolean true for a value just means the property should exist
        if (value === true) {
          value = '';
        }

        // Only perform the set if the attribute is of a different value
        // This avoids triggering mutation observers unnecessarily
        if (this.getAttribute(attrName) !== value) {
          this.setAttribute(attrName, value);
        }
      }
    };
  }

  /**
    Make an event trigger function for the given property. If no event should be triggered, return a noop.
    @ignore
  */
  function makeTrigger(trigger) {
    if (!trigger) {
      return noop;
    }

    if (typeof trigger === 'function') {
      return trigger;
    }

    var eventName = trigger;

    return function doTrigger(newValue, oldValue) {
      // Trigger an event that has the new and old values under detail
      return this.trigger(eventName, {
        oldValue: oldValue,
        value: newValue
      });
    };
  }

  /**
    Make a queue sync function for the given property. If nothing needs to be synced, return a noop.
    @ignore
  */
  function makeQueueSync(propName, descriptor) {
    var propList = descriptor.alsoSync;
    var sync = descriptor.sync;

    if (!sync && !propList) {
      return noop;
    }

    if (propList) {
      // Other properties in addition to ours
      if (Array.isArray(propList)) {
        propList.unshift(propName);
      }
      else {
        propList = [propName, propList];
      }
      return function doMultiSync(value) {
        // Sync the list of properties
        this._queueSync.apply(this, propList);
      };
    }

    return function doSync(value) {
      // Sync the property
      this._queueSync(propName);
    };
  }

  /**
    Create and store the methods back to the property descriptor, then store the descriptor on the prototype.
    This enables overriding descriptor parts.

    @ignore
  */
  function storeDescriptor(proto, propName, descriptor) {
    // triggerBefore can be function, boolean, or string
    var triggerBeforeValue;
    if (typeof descriptor.triggerBefore === 'function' || typeof descriptor.triggerBefore === 'string') {
      // Directly use string or function, makeTrigger will do the rest
      triggerBeforeValue = descriptor.triggerBefore;
    }
    else if (descriptor.triggerBefore === true) {
      // Automatically set name based on descriptor.trigger
      if (typeof descriptor.trigger === 'string' && descriptor.trigger.indexOf(':') !== -1) {
        triggerBeforeValue = descriptor.trigger.replace(':', ':before');
      }
      else {
        throw new Error('Coral.register: Cannot automatically set "before" event name unless descriptor.trigger ' +
          'is a string that conatins a colon');
      }
    }

    // Use provided setter, or make a setter that sets a "private" underscore-prefixed variable
    descriptor.set = descriptor.set || makeBasicSetter(propName);

    // Use provided getter, or make a getter that returns a "private" underscore-prefixed variable
    descriptor.get = descriptor.get || makeBasicGetter(propName);

    // Store methods
    var inheritedMethods = descriptor._methods;
    descriptor._methods = {};

    // store references to inherited methods in descriptor._methods
    if (inheritedMethods) {
      for (var methodName in inheritedMethods) {
        descriptor._methods[methodName] = inheritedMethods[methodName];
      }
    }

    descriptor._methods.triggerBefore = makeTrigger(triggerBeforeValue);
    descriptor._methods.trigger = makeTrigger(descriptor.trigger);
    descriptor._methods.transform = descriptor.transform || passThrough;
    descriptor._methods.attributeTransform = descriptor.attributeTransform || passThrough;
    descriptor._methods.reflectAttribute = makeReflect(propName, descriptor);
    descriptor._methods.queueSync = makeQueueSync(propName, descriptor);

    // We need to store the list of validators back on the descriptor as we modify this inside of makeValidate
    descriptor._methods.validate = makeValidate(descriptor);

    // Store reverse mapping of attribute -> property
    if (descriptor.attribute) {
      proto._attributes[descriptor.attribute] = propName;
    }
    else {
      // Remove the mapping in case it was overridden
      proto._attributes[descriptor.attribute] = null;
    }

    // Store the descriptor
    proto._properties[propName] = descriptor;
  }

  /**
    Create a generic getter.

    @param {String} propName
      The property name whose getter should be invoked.

    @ignore
  */
  function makeGetter(propName) {
    return function getter() {
      // Invoke the original getter
      return this._properties[propName].get.call(this);
    };
  }

  /**
    Create a genertic setter.

    @param {String} propName
      The name of the property.

    @alias Coral.register.makeSetter

    @returns {Function} The setter function.
  */
  function makeSetter(propName) {
    return function setter(value, silent) {
      var descriptor = this._properties[propName];
      var methods = descriptor._methods;

      // Transform the value, passing the default
      // The default value cannot be cached in the outer closure as that would prevent monkey-patching
      var newValue = methods.transform.call(this, value, this._properties[propName].default);

      // Store the old value before the setter is invoked
      var oldValue = this[propName];

      // Performs all the validations until one of them fails
      var self = this;
      var failed = methods.validate.some(function(validator) {
        return !validator.call(self, newValue, oldValue);
      });

      // If a validation failed then we return
      if (failed) {
        return;
      }

      if (!silent) {
        var event = methods.triggerBefore.call(this, newValue, oldValue);
        if (event && event.defaultPrevented) {
          // Allow calls to preventDefault() to stop events
          return;
        }
      }

      // Invoke the original setter
      descriptor.set.call(this, newValue, silent);

      // Reflect the attribute
      methods.reflectAttribute.call(this, newValue);

      // Queue property sync. Do this before trigger, in case an event listener wants to unroll the sync queue
      methods.queueSync.call(this);

      // Trigger an event
      if (!silent) {
        methods.trigger.call(this, newValue, oldValue);
      }

      // Store that this prop has been set
      // This is used during initialization when deciding whether to apply default values
      this._setProps[propName] = true;
    };
  }

  function makeBasicGetter(propName) {
    var tempVarName = '_' + propName;

    /**
      Gets the corresponding underscore prefixed "private" property by the same name.

      @function Coral~defaultGet
      @returns The prefixed property
    */
    return function getter() {
      return this[tempVarName];
    };
  }

  function makeBasicSetter(propName) {
    var tempVarName = '_' + propName;

    /**
      Sets the corresponding underscore prefixed "private" property by the same name.

      @param {*} value  The value to set
      @function Coral~defaultSet
    */
    return function setter(value) {
      this[tempVarName] = value;
    };
  }

  /**
    Define a set of {@link Coral~PropertyDescriptors} on the passed object

    @param {Object} proto
      The object to define properties on, usually a prototype.
    @param {Object.<String, Coral~PropertyDescriptor>} properties
      A map of property names to their corresponding descriptors.

    @alias Coral.register.defineProperties
  */
  function defineProperties(proto, properties) {
    // Loop over properties and define them on the prototype
    for (var propName in properties) {
      if (!properties[propName]) {
        // Skip properties that were removed to avoid redefinition
        continue;
      }
      defineProperty(proto, propName, properties[propName]);
    }
  }

  /**
    Define a single {@link Coral~PropertyDescriptors} on the passed object

    @param {Object} proto
      The object to define properties on, usually a prototype.
    @param {String} propName
      The name of the property.
    @param {Coral~PropertyDescriptor} descriptor
      A property descriptor

    @alias Coral.register.defineProperty
  */
  function defineProperty(proto, propName, descriptor) {
    // Handle mixin case
    if (typeof descriptor === 'function') {
      // Let descriptor apply itself to the prototype
      // This allows it to add methods
      // Use its return value as the actual descriptor
      descriptor = descriptor(proto, propName);

      // If nothing is returned, we're done with this property
      if (!descriptor) {
        throw new Error('Coral.register.defineProperty: Property function did not return a descriptor for ' + propName);
      }
    }

    // Store the associated methods
    storeDescriptor(proto, propName, descriptor);

    // Create the generic setters and getters for this property
    // Store them back so we can access them for silent sets
    // These do not need to be overridden as they delegate to this._properties._methods
    var actualSetter = descriptor._methods.set = makeSetter(propName);
    var actualGetter = descriptor._methods.get = makeGetter(propName);

    // Define the property
    Object.defineProperty(proto, propName, {
      // All properties are enumerable
      enumerable: true,
      // No properties are configurable
      configurable: false,
      set: actualSetter,
      get: actualGetter
    });
  }

  var tagPrototypes = {};
  /**
    Memoized getProtoTypeOf for HTML tags
    @ignore
  */
  function getPrototypeOfTag(tagName) {
    tagPrototypes[tagName] = tagPrototypes[tagName] || Object.getPrototypeOf(document.createElement(tagName));
    return tagPrototypes[tagName];
  }

  /**
    Register a Coral component, setting up inheritance, mixins, properties, and the associated custom element.

    @memberof Coral
    @static

    @param {Object} options
      Component options.
    @param {String} options.name
      Name of the constructor (i.e. 'Accordion.Item'). The constructor will be available under 'Coral' at the path
      specified by the name.
    @param {String} options.tagName
      Name of the new element (i.e 'coral-component').
    @param {String} [options.baseTagName = (none)]
      Name of the tag to extend (i.e. 'button'). This is only required when extending an existing HTML element such that
      the <code>&lt;button is="custom-element"&gt;</code> style will be used.
    @param {Object} [options.extend = Coral.Component]
      Base class of the component. When extending an existing HTML element, this should match the interface implemented
      by the tag -- that is, for <code>baseTagName: 'button'</code> you should pass
      <code>extend: HTMLButtonElement</code>.
    @param {Array.<Object|Coral~mixin>} [options.mixins]
      Mixin or {Array} of mixins to add. Mixins can be an {Object} or a {Coral~mixin}.
    @param {Object.<String, Coral~PropertyDescriptor>} [options.properties]
      A map of property names to their corresponding descriptors.
    @param {Object} [options.events]
      Map of the events and their handler.
    @param {Object} [options._elements]
      Map of elements and their locations used for caching.
  */
  Coral.register = function(options) {
    // Throw away options.extend if baseTagName provided and the prototype isn't part of Coral.Component
    if (options.extend && !options.extend.prototype._methods) {
      options.extend = Coral.Component;
    }

    // Extend Coral.Component if nothing is provided
    var extend = options.extend || Coral.Component;

    // We'll use the prototype of the argument passed constructor we're extending
    var baseComponentProto = extend.prototype;
    var actualPrototype = baseComponentProto;

    // Use passed or be an empty object so mixins can add properties to components that don't define any
    // Don't modify the passed properties object directly
    var properties = options.properties ? Coral.commons.extend({}, options.properties) : {};

    if (options.baseTagName) {
      // If we're extending a base tag, we need to use its prototype, not the Component's
      actualPrototype = getPrototypeOfTag(options.baseTagName);
    }

    // Setup the prototype chain
    var proto = Object.create(
      actualPrototype
    );

    // Store a reference to the next component's prototype in the chain
    // This allows us to crawl up the component prototype chain later
    proto._proto = baseComponentProto;

    if (options.baseTagName) {
      var protoChain = [];

      // Build the prototype chain
      var curBaseProto = baseComponentProto;
      while (curBaseProto && curBaseProto._methods) {
        protoChain.unshift(curBaseProto);
        curBaseProto = curBaseProto._proto;
      }

      // Iterate over the prototype chain and mix all the methods in
      while (curBaseProto = protoChain.shift()) {
        for (var methodName in curBaseProto._methods) {
          proto[methodName] = curBaseProto[methodName];
        }
      }

      // Note that we'll already get a flattened list of properties from _properties
      // So we don't have to do something similar there
    }

    // Create attribute -> property mappings and the property descriptor map
    // Do this before we mixin/override properties as storeDescriptor() will write back to _attributes and _properties
    proto._attributes = Coral.commons.extend({}, baseComponentProto._attributes);
    proto._properties = {};

    // Define and inherit events from parent class
    proto._events = Coral.commons.extend({}, baseComponentProto._events, options.events);

    // Define and inherit sub-elements from parent class
    proto._elements = Coral.commons.extend({}, baseComponentProto._elements, options._elements);

    // Store the name on the prototype
    // the toString method of Coral.Component uses this
    proto._componentName = options.name;

    // CSS className
    proto._className = options.className;

    // Add methods to the prototype, and store them in an object for easy access
    // We'll use this object when extending base tagnames later
    var _methods = proto._methods = {};
    for (var method in options) {
      if (!specialProperties[method]) {
        proto[method] = _methods[method] = options[method];
      }
    }

    // Add mixins to the prototype
    // Do this before combining properties to allow seemless modification of properties overridden by mixins
    if (options.mixins) {
      Coral.commons.mixin(
        proto,
        // A single Object, Function, or Array thereof
        options.mixins,
        {
          // Pass properties so functional mixins can augment them
          properties: properties
        }
      );
    }

    // Store and override property descriptors
    Coral.commons.augment(proto._properties, baseComponentProto._properties, properties, function(existingDesc, newDesc, propName) {
      // Drop properties that are not defined
      if (!newDesc) {
        return null;
      }

      // The child component (newDesc) determines whether to ignore the base component's descriptor
      if (newDesc.override === true) {
        // The new component wants to ignore the base component's descriptor
        return newDesc;
      }

      // Combine and override as necessary
      // The order of arguments seems backwards because we use this method in Coral.register.augmentProperties
      // This makes it so the existing setter is called first
      // It also makes it so the new descriptor will override other properties
      var combinedDesc = Coral.commons.augment(
        // Don't modify the existing descriptor
        {},
        newDesc,
        existingDesc,
        handleAugmentPropertyCollision
      );

      // Store the new methods and descriptor
      storeDescriptor(proto, propName, combinedDesc);

      // The property is already defined, so tell defineProperties not to define it again
      properties[propName] = undefined;

      // storeDescriptor() already stored the descriptor, but we have to return it anyway
      return combinedDesc;
    });

    // Removed properties that have been removed by inheriting components
    for (var propName in proto._properties) {
      if (!proto._properties[propName]) {
        delete proto._properties[propName];
      }
    }

    // Define properties last
    // This allows mixins to merge and modify properties
    if (options.baseTagName) {
      // Define ALL properties as we don't pick up any from the prototype
      defineProperties(proto, proto._properties);
    }
    else {
      // Define just the new properties
      defineProperties(proto, properties);
    }

    // The options to be passed to registerElement
    var registrationOptions = {
      prototype: proto
    };

    if (options.baseTagName) {
      // When a base tag is provided, we need to tell registerElement
      registrationOptions.extends = options.baseTagName;
    }

    // Register the element
    // This returns a constructor
    var Constructor = document.registerElement(options.tagName, registrationOptions);

    // Assign the constructor at the correct location within the Coral namespace
    Coral.commons.setSubProperty(Coral, options.name, Constructor);

    return Constructor;
  };

  // Expose globally
  Coral.register.defineProperties = defineProperties;
  Coral.register.defineProperty = defineProperty;

  /**
    Augment a set of property descriptors with another set.
    The <code>dest</code> property descriptors map is modified in place.
    The individual property descriptors (values of <code>dest</code>) are not modified.

    @param {Object<String,Coral~PropertyDescriptor>} dest
      The set of property descriptors to agument.
    @param {Object<String,Coral~PropertyDescriptor>} source
      The set of property descriptors to use.
    @param {Coral.commons~handleCollision} [handleCollision]
      Called if the descriptor property being copied is already present on the destination.
      The return value will be used as the property value.
      By default, if <code>sync</code> or <code>set</code> collides, both provided methods will be called.
      By default, if any other descriptor property collides, the destination's value will be used.
  */
  Coral.register.augmentProperties = function(dest, source, handleCollision) {
    Coral.commons.augment(dest, source, function(existingDesc, newDesc, propName) {
      // The mixin target (dest) determines whether to ignore the mixin's properties
      if (existingDesc.override === true) {
        // The mixin target (dest) wants to ignore the mixin's descriptor
        return existingDesc;
      }

      // Deep-augment individual property descriptor properties
      var combinedDesc = Coral.commons.augment(
        // Don't modify the existing descriptor
        {},
        existingDesc,
        newDesc,
        handleCollision || handleAugmentPropertyCollision
      );

      return combinedDesc;
    });
  };

  /**
    Default collision handler when augmenting properties
    @ignore
  */
  function handleAugmentPropertyCollision(destValue, sourceValue, descPropName) {
    switch (descPropName) {
    case 'sync':
    case 'set':
      // Use both methods
      return callBoth(sourceValue, destValue);
    default:
      // Use component's value
      return destValue;
    }
  }

  /**
    Return a function that calls both functions and ignores their return values
    @ignore
  */
  function callBoth(first, second) {
    return function() {
      first.apply(this, arguments);
      second.apply(this, arguments);
    };
  }
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Mixins for Coral components.
  @namespace
*/
Coral.mixin = Coral.mixin || {};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function($) {
  'use strict';
  /* jshint -W040 */

  /**
    A map of modifier names to their corresponding keycodes.
    @ignore
  */
  /* jshint -W015 */
  var modifierCodes = {
    '⇧': 16, 'shift': 16,
    '⌥': 18, 'alt': 18, 'option': 18,
    '⌃': 17, 'ctrl': 17, 'control': 17,
    '⌘': 91, 'cmd': 91, 'command': 91, 'meta': 91
  };

  /**
    Used to check if a key is a modifier.
    @ignore
  */
  var modifierCodeMap = {
    16: true,
    17: true,
    18: true,
    91: true
  };

  /**
    A list of modifier event property names in sorted key code order. Used to add keycodes for modifiers.
    @ignore
  */
  var modifierEventPropertyNames = [
    'shiftKey',
    'ctrlKey',
    'altKey',
    'metaKey'
  ];

  /**
    A map of key codes to normalize. These are duplicate keys such as the number pad.
    @ignore
  */
  var normalizedCodes = {
    // Numpad 0-9
    '96': 48,
    '97': 49,
    '98': 50,
    '99': 51,
    '100': 52,
    '101': 53,
    '102': 54,
    '103': 55,
    '104': 56,
    '105': 57
  };

  var specialKeyCodes = {
    'backspace': 8,
    'tab': 9,
    'return': 13,
    'enter': 13,
    'pause': 19,
    'capslock': 20,
    'esc': 27,
    'escape': 27,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'insert': 45,
    'del': 46,
    'delete': 46,
    ';': 186,
    '=': 187,
    '*': 106,
    'plus': 107,
    'minus': 189,
    '.': 190,
    'period': 190,
    '/': 191,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    'f13': 124,
    'f14': 125,
    'f15': 126,
    'f16': 127,
    'f17': 128,
    'f18': 129,
    'f19': 130,
    'numlock': 144,
    'scroll': 145,
    ',': 188,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221,
    '\'': 222
  };

  // Match a namespaced event, such as ctrl+r.myNS
  var namespaceRE = /(.*?)(\..+)$/;

  /**
    The set of tags to ignore hot keys when focused within for the default filter.

    @ignore
  */
  var restrictedTagNames = {
    'INPUT': true,
    'SELECT': true,
    'TEXTAREA': true
  };

  /**
    The default keycombo event filter function. Ignores key combos triggered on input, select, and textarea.

    @function Coral.Keys.filterInputs

    @param event
      The event passed

    @returns {Boolean} True, if event.target is not editable and event.target.tagname is not restricted
  */
  function filterInputs(event) {
    var target = event.target;
    var tagName = target.tagName;
    var isContentEditable = target.isContentEditable;
    var isRestrictedTag = restrictedTagNames[tagName];
    return !isContentEditable && !isRestrictedTag;
  }

  /**
    Convert a key to its character code representation.

    @function Coral.Keys.keyToCode

    @param {String} key
      The key character that needs to be converted. If the String contains more than one character, an error will be
      produced.

    @returns {Number} The character code of the given String.
  */
  function keyToCode(key) {
    key = key.toLowerCase();

    // Map special string representations to their character code equivalent
    var code = specialKeyCodes[key] || modifierCodes[key];

    if (!code && key.length > 1) {
      throw new Error('Coral.Keys: Key ' + key + ' not recognized');
    }

    // Return the special code from the map or the char code repesenting the character
    return code || key.toUpperCase().charCodeAt(0);
  }

  /**
    Normalize duplicate codes.
    @ignore
  */
  function normalizeCode(code) {
    return normalizedCodes[code] || code;
  }

  /**
    Convert a combination of keys separated by + into the corresponding code string.
    @ignore
  */
  function keyComboToCodeString(keyCombo) {
    return keyCombo
      // Convert to string so numbers are supported
      .toString()
      .split('+')
      .map(keyToCode)
      // Sort keys for easy comparison
      .sort()
      .join('+');
  }

  /**
    Handle key combination events.

    @class Coral.Keys
    @param {*} elOrSelector
      The selector or element to listen for keyboard events on. This should be the common parent of all
      elements you wish to listen for events on.
    @param {Object} [options]
      Options for this combo handler.
    @param {Function} [options.context]
      The desired value of the <code>this</code> keyword context when executing listeners. Defaults to the element on
      which the event is listened for.
    @param {Function} [options.preventDefault=false]
      Whether to prevent the default behavior when a key combo is matched.
    @param {Function} [options.stopPropagation=false]
      Whether to stop propagation when a key combo is matched.
    @param {Function} [options.filter={@link Coral.Keys.filterInputs}]
      The filter function for keyboard events. This can be used to stop events from being triggered when they originate
      from specific elements.
  */
  function makeComboHandler(elOrSelector, options) {
    options = options || {};

    if (typeof elOrSelector === 'undefined') {
      throw new Error('Coral.Keys: Cannot create a combo handler for ' + elOrSelector);
    }

    // Cache the element object
    var el = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;

    // Use provided context
    var context = options.context;

    /**
      The filter function to use when evaluating keypresses
    */
    var filter = options.filter || filterInputs;

    /**
      Whether to prevent default
    */
    var preventDefault = options.preventDefault || false;

    /**
      Whether to stop propagation and prevent default
    */
    var stopPropagation = options.stopPropagation || false;

    /**
      A map of key code combinations to arrays of listener functions
      @ignore
    */
    var keyListeners;

    /**
      A an array of key sequences objects
      @ignore
    */
    var keySequences;

    /**
      The sorted array of currently pressed keycodes
      @ignore
    */
    var currentKeys;

    /**
      The joined string representation of currently pressed keycodes
      @ignore
    */
    var currentKeyCombo;

    /**
      The timeout that cooresponds to sequences
      @ignore
    */
    var sequenceTimeout;

    function handleKeyDown(event) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(resetSequence, Coral.Keys.sequenceTime);

      // Store pressed key in array
      var key = normalizeCode(event.keyCode);

      // Don't do anything when a modifier is pressed
      if (modifierCodeMap[key]) {
        return;
      }

      if (currentKeys.indexOf(key) === -1) {
        currentKeys.push(key);

        setCurrentKeyCombo(event);
      }

      executeListeners.call(this, event);

      // Workaround: keyup events are never triggered while the command key is down, so reset the list of keys
      if (event.metaKey) {
        reset();
      }

      if (!event.target.parentNode) {
        // Workaround: keyup events are never triggered if the element does not have a parent node
        reset();
      }
    }

    function setCurrentKeyCombo(event) {
      // Build string for modifiers
      var currentModifiers = [];
      for (var i = 0; i < modifierEventPropertyNames.length; i++) {
        var propName = modifierEventPropertyNames[i];

        if (event[propName]) {
          currentModifiers.push(modifierCodes[propName.slice(0, -3)]);
        }
      }

      // Store current key combo
      currentKeyCombo = currentKeys.concat(currentModifiers).sort().join('+');
    }

    function handleKeyUp(event) {
      var key = normalizeCode(event.keyCode);

      if (modifierCodeMap[key]) {
        // Workaround: keyup events are not triggered when command key is down on Mac, so if the command key is
        // released, consider all keys released
        // Test: comment this out, press K, press L, press Command, release L, release Command, then release K -- L is
        // triggered. This also prevents handlers for related key combos to be triggered
        // Test: comment this out, press Control, press Alt, press A, press S, release Alt, release S -- Control+A is
        // triggered
        reset();

        // We don't ever want to execute handlers when a modifier is released, and we can't since they don't end up in
        // currentKeys. If we weren't doing the index check below, that could result in key combo handlers for ctrl+r to
        // be triggered when someone released alt first after triggering ctrl+alt+r. In any case, return to avoid the
        // uselss extra work
        return;
      }

      // Remove key from array
      var index = currentKeys.indexOf(key);
      if (index !== -1) {
        currentKeys.splice(index, 1);

        // If too many keys are pressed, then one is removed, make sure to check for a match
        setCurrentKeyCombo(event);
        executeListeners.call(this, event, true);
      }
    }

    function processSequences() {
      var activeSequenceListeners = [];

      // Check each sequence's state
      keySequences.forEach(function(sequence) {
        if (sequence.parts[sequence.currentPart] === currentKeyCombo) {
          // If the current key combo in the sequence was pressed, increment the pointer
          sequence.currentPart++;
        }
        else {
          // Reset the sequence if a key was encountered out of sequence
          sequence.currentPart = 0;
        }

        if (sequence.currentPart === sequence.parts.length) {
          // If we've reached the end of the sequence, add it to the list of active sequences
          activeSequenceListeners.push(sequence);

          // Reset the sequence's state so it can be triggered again
          sequence.currentPart = 0;
        }
      });

      return activeSequenceListeners;
    }

    function executeListeners(event, keyup) {
      // Don't do anything if we don't have any keys pressed
      if (!currentKeyCombo) {
        return;
      }

      // Evaluate whether we should filter this keypress
      if (!filter(event)) {
        return;
      }

      var target = (event.target || event.srcElement);

      var listeners = [];

      // Execute listeners associated with the current key combination
      var comboListeners = keyListeners[currentKeyCombo];

      var sequenceListeners;
      if (!keyup) {
        // Process sequences and get listeners associated with the current sequence
        // Don't do this on keyup as this breaks sequences with modifiers
        sequenceListeners = processSequences();
      }

      if (comboListeners && comboListeners.length) {
        listeners = listeners.concat(comboListeners);
      }

      if (sequenceListeners && sequenceListeners.length) {
        listeners = listeners.concat(sequenceListeners);
      }

      if (listeners && listeners.length) {
        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];

          // Perform event delegation
          // jQuery's event delegation code has fixes related to clicks, SVGs, etc that are not relevant here
          // To simplify things, instead of using jQuery's on() for delegated events, we'll perform delegation manually
          if (listener.selector) {
            // Use the same matching code from jQuery's event.js
            // This allows us to match when the delegation selector includes context
            var matches = listener.needsContext ?
              jQuery(listener.selector, this).index(target) >= 0 :
              jQuery.find(listener.selector, this, null, [target]).length;

            // Skip if the originating element doesn't match the selector
            if (!matches) {
              continue;
            }
          }

          // Add data to event object
          if (typeof listener.data !== undefined) {
            event.data = listener.data;
          }

          // Add matchedTarget
          event.matchedTarget = target;

          listener.listener.call(context || this, event);
        }

        // Don't do the default thing
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
      }
    }

    /**
      Add a key combo listener.

      @function on
      @memberof Coral.Keys#
      @param {String} keyCombo
        The key combination to listen for, such as <code>'ctrl-f'</code>.
      @param {String} [selector]
        A selector to use for event delegation.
      @param {String} [data]
        Data to pass to listeners as <code>event.data</code>.
      @param {Function} listener
        The listener to execute when this key combination is pressed. Executes on keydown, or, if too many keys are
        pressed and one is released, resulting in the correct key combination, executes on keyup.

      @returns {Coral.Keys} this, chainable.
    */
    function on(keyCombo, selector, data, listener) {
      // keyCombo can be a map of keyCombos to handlers
      if (typeof keyCombo === 'object') {
        // ( keyCombo-Object, selector, data )
        if (typeof selector !== 'string') {
          // ( keyCombo-Object, data )
          // ( keyCombo-Object, null, data )
          data = data || selector;
          selector = undefined;
        }
        for (var combo in keyCombo) {
          this.on(combo, selector, data, keyCombo[combo]);
        }
        return this;
      }

      if (typeof data === 'undefined' && typeof listener === 'undefined') {
        // ( keyCombo, listener )
        listener = selector;
        data = selector = undefined;
      }
      else if (typeof listener === 'undefined') {
        if (typeof selector === 'string') {
          // ( keyCombo, selector, listener )
          listener = data;
          data = undefined;
        }
        else {
          // ( keyCombo, data, listener )
          listener = data;
          data = selector;
          selector = undefined;
        }
      }

      if (typeof listener !== 'function') {
        throw new Error('Coral.Keys: Cannot add listener of type ' + (typeof listener));
      }

      var namespace;
      var namespaceMatch = namespaceRE.exec(keyCombo);
      if (namespaceMatch) {
        keyCombo = namespaceMatch[1];
        namespace = namespaceMatch[2];
      }

      // Determine if this selector needs context when evaluating event delegation
      // A selector needs context when it includes things like >, ~, :first-child, etc
      var needsContext = selector ? jQuery.expr.match.needsContext.test(listener.selector) : false;

      // Check if the stirng is a sequence or a keypress
      if (keyCombo.toString().indexOf('-') !== -1) {
        // It's a sequence!

        // Divide it into its parts and convert to a code string
        var sequenceParts = keySequenceStringToArray(keyCombo);

        // Store the listener and associated information in the list for this sequence
        keySequences.push({
          originalString: keyCombo,
          currentPart: 0,
          parts: sequenceParts,
          needsContext: needsContext,
          selector: selector,
          listener: listener,
          data: data,
          namespace: namespace
        });
      }
      else {
        // It's a key combo!
        keyCombo = keyComboToCodeString(keyCombo);

        var listeners = keyListeners[keyCombo] = keyListeners[keyCombo] || [];

        // Store the listener and associated information in the list for this keyCombo
        listeners.push({
          // Determine if this selector needs context when evaluating event delegation
          // A selector needs context when it includes things like >, ~, :first-child, etc
          needsContext: selector ? jQuery.expr.match.needsContext.test(listener.selector) : false,
          selector: selector,
          listener: listener,
          data: data,
          namespace: namespace
        });
      }

      return this;
    }

    function keySequenceStringToArray(keyCombo) {
      return keyCombo.toString().split('-').map(keyComboToCodeString);
    }

    function offByKeyComboString(keyComboString, namespace, selector, listener) {
      var i;
      var listeners = keyListeners[keyComboString];

      if (listeners && listeners.length) {
        if (typeof selector === 'undefined' && typeof listener === 'undefined' && typeof namespace === 'undefined') {
          // Unbind all listeners for this key combo
          listeners.length = 0;
        }
        else if (typeof listener === 'undefined') {
          // Unbind all listeners of a specific selector and or namespace
          for (i = 0; i < listeners.length; i++) {
            // This comparison works because selector and namespace are undefined by default
            if (listeners[i].selector === selector && listeners[i].namespace === namespace) {
              listeners.splice(i, 1);
              i--;
            }
          }
        }
        else {
          // Unbind a specific listener, optionally on a specific selector and specific namespace
          for (i = 0; i < listeners.length; i++) {
            if (listeners[i].listener === listener &&
              listeners[i].selector === selector &&
              listeners[i].namespace === namespace) {
              listeners.splice(i, 1);
              i--;
            }
          }
        }
      }
    }

    /**
      Remove a key combo listener.

      @function off
      @memberof Coral.Keys#
      @param {String} keyCombo
        The key combination to listen for, such as <code>'ctrl-f'</code>.
      @param {String} [selector]
        A selector to use for event delegation.
      @param {Function} listener
        The listener that was passed to on.

      @returns {Coral.Keys} this, chainable.
    */
    function off(keyCombo, selector, listener) {
      if (typeof listener === 'undefined') {
        listener = selector;
        selector = undefined;
      }

      var i;
      var namespace;
      var namespaceMatch = namespaceRE.exec(keyCombo);
      if (namespaceMatch) {
        keyCombo = namespaceMatch[1];
        namespace = namespaceMatch[2];
      }

      if (keyCombo === '' && namespace !== undefined) {
        // If we have a namespace by no keyCombo, remove all events of the namespace for each key combo
        for (keyCombo in keyListeners) {
          offByKeyComboString(keyCombo, namespace, selector, listener);
        }

        // Remove sequences
        for (i = 0; i < keySequences.length; i++) {
          if (keySequences[i].namespace === namespace) {
            keySequences.splice(i, 1);
            i--;
          }
        }

        return this;
      }

      if (keyCombo.indexOf('-') !== -1) {
        // Unbind a specific key sequence listener, optionally on a specific selector and specific namespace
        for (i = 0; i < keySequences.length; i++) {
          if (
            (keyCombo === undefined || keySequences[i].originalString === keyCombo) &&
            (listener === undefined || keySequences[i].listener === listener) &&
            (selector === undefined || keySequences[i].selector === selector) &&
            (namespace === undefined || keySequences[i].namespace === namespace)
          ) {
            keySequences.splice(i, 1);
            i--;
          }
        }
      }
      else {
        keyCombo = keyComboToCodeString(keyCombo);

        offByKeyComboString(keyCombo, namespace, selector, listener);
      }

      return this;
    }

    function resetSequence() {
      clearTimeout(sequenceTimeout);
      keySequences.forEach(function(sequence) {
        // Reset each sequence
        sequence.currentPart = 0;
      });
    }

    /**
      Reset the state of this instance. This resets the currently pressed keys.

      @function reset
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function reset() {
      // Only reset variables related to currently pressed keys
      // Don't mess with sequences
      currentKeys = [];
      currentKeyCombo = '';

      return this;
    }

    /**
      Initialize an instance created without the <code>new</code> keyword or revive a destroyed instance. This method
      will be called automatically if an instance is created with <code>new Coral.keys</code>, but otherwise will not be
      called.

      @function init
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function init() {
      // Reset all variable states
      currentKeys = [];
      currentKeyCombo = '';
      keyListeners = {};
      keySequences = [];

      el.addEventListener('keydown', handleKeyDown);
      // Watching on capture so it is immune to stopPropagation(). It's very important this event
      // is handled so key entries previously added on keydown can be cleared out.
      window.addEventListener('keyup', handleKeyUp, true);
      window.addEventListener('focus', reset);

      return this;
    }

    /**
      Destroy this instance. This removes all event listeners, references, and state.

      @function destroy
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function destroy() {
      keyListeners = null;
      currentKeys = null;
      currentKeyCombo = null;

      el.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('focus', reset);

      return this;
    }

    // @todo is this insane?
    if (this instanceof makeComboHandler) {
      // Initialize immediately if new keyword used
      init();
    }


    return {
      on: on,
      off: off,
      reset: reset,
      init: init,
      destroy: destroy
    };
  }

  Coral.Keys = makeComboHandler;

  Coral.Keys.filterInputs = filterInputs;

  Coral.Keys.keyToCode = keyToCode;

  /**
    The time allowed between keypresses for a sequence in miliseconds
    @type Number
    @default 1500
  */
  Coral.Keys.sequenceTime = 1500;

  /**
    A key listener for global hotkeys.

    @static
    @type Coral.keys
  */
  // Register against the documentElement, <html>, so event delegation works
  Coral.keys = new Coral.Keys(document.documentElement, {
    // Don't let global hotkeys trigger default actions
    stopPropagation: true,
    preventDefault: true
  });

}(jQuery));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Vent: true */
/* jshint -W064 */
(function() {
  'use strict';

  var $ = jQuery;

  // Used to split events by type/target
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  /**
    Return the method corresponding to the method name or the function, if passed.

    @ignore
  */
  function getListenerFromMethodNameOrFunction(obj, eventName, methodNameOrFunction) {
    // Try to get the method
    if (typeof methodNameOrFunction === 'function') {
      return methodNameOrFunction;
    }
    else if (typeof methodNameOrFunction === 'string') {
      if (!obj[methodNameOrFunction]) {
        throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
          ', method ' + methodNameOrFunction + ' not found');
      }

      var listener = obj[methodNameOrFunction];

      if (typeof listener !== 'function') {
        throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
          ', listener is a ' + (typeof listener) + ' but should be a function');
      }

      return listener;
    }
    else if (methodNameOrFunction) {
      // If we're passed something that's truthy (like an object), but it's not a valid method name or a function, get
      // angry
      throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() + ', ' +
        methodNameOrFunction + ' is neither a method name or a function');
    }

    return null;
  }

  /**
    @class Coral.Component
    @classdesc The base element for all Coral components
    @extends HTMLElement
  */
  Coral.Component = function() {
    throw new Error('Coral.Component is not meant to be invoked directly. Inherit from its prototype instead.');
  };

  // Inherit from HTMLElement
  Coral.Component.prototype = Object.create(HTMLElement.prototype);

  // Store a reference to properties
  Coral.Component.prototype._properties = {};

  /**
    Return this component's name.

    @ignore
  */
  Coral.Component.prototype.toString = function() {
    return 'Coral.' + this._componentName;
  };

  /**
    Events map. Key is Backbone-style event description, value is string indicating method name or function. Handlers
    are always called with <code>this</code> as the element.

    @type {Object}
    @protected
  */
  Coral.Component.prototype._events = {

  };

  /**
    Called when the component is being constructed. This method applies the CSS class, renders the component, binds
    events, and sets initial property values.

    {@link Coral.Component#_initialize} is called after the above operations are complete.
    @protected
  */
  Coral.Component.prototype.createdCallback = function() {
    // We have to add toString directly on the instance or it doesn't work in IE 9
    // A side-effect of this is that toString cannot be overridden
    if (this.toString !== Coral.Component.prototype.toString) {
      this.toString = Coral.Component.prototype.toString;
    }

    // Track which properties have been set
    // This is used when setting defaults
    this._setProps = {};

    this._syncQueue = [];

    // Make sure context is correct when called by nextFrame
    this._syncDOM = this._syncDOM.bind(this);

    // Keep a reference to the jQuery object. Refer to http://msdn.microsoft.com/en-us/library/bb250448(v=vs.85).aspx
    // @todo does this cause memory leaks in IE due to circular references?
    this.$ = $(this);

    // Create a Vent instance to handle local events
    this._vent = new Vent(this);

    // Apply the class name
    if (this._className) {
      this.$.addClass(this._className);
    }

    // Create the elements property before the template. Templates that use handle="someName" attrs will need this
    this._elements = {};

    // Render template, if necessary
    if (typeof this._render === 'function') {
      this._render();
    }

    var prop;
    var attr;
    var value;
    var descriptor;
    var methods;

    // A list of attribute values indexed by property name
    // prop -> attrValue
    var attrValues = {};

    // Build a cache of attribute values provided via the markup
    for (prop in this._properties) {
      descriptor = this._properties[prop];
      // Use the attribute name specified by the map
      attr = descriptor.attribute || prop;

      // Fetch the attribute corresponding to the property from the element
      attrValues[prop] = this.getAttribute(attr);
    }

    // Apply default values for all properties and their associated attributes
    for (prop in this._properties) {
      descriptor = this._properties[prop];
      methods = descriptor._methods;

      // Get the attribute value from the cache
      value = attrValues[prop];

      if (value !== null) {
        // Since the value is loaded as an attribute, it needs to be transformed from its attribute value
        if (methods.attributeTransform) {
          value = methods.attributeTransform.call(this, value, descriptor.default);
        }

        // Run the value transform function
        if (descriptor.transform) {
          value = methods.transform.call(this, value, descriptor.default);
        }

        // Check if the value valdiates
        if (methods.validate) {
          for (var i = 0; i < methods.validate.length; i++) {
            // Don't pass the old value
            if (!methods.validate[i].call(this, value)) {
              // If it fails validation, we'll use the default
              value = null;
              break;
            }
          }
        }
      }

      if (value === null) {
        // If the property has already been set in another setter, don't apply the default
        if (this._setProps[prop]) {
          continue;
        }

        // If the default is a function we call it
        if (typeof descriptor.default === 'function') {
          // Call method if the default value is a method
          value = descriptor.default.call(this);
        }
        else {
          // Otherwise we set it from the descriptor directly
          value = descriptor.default;
        }

        // If the value that came out of the default is undefined,
        // this means that the property does not really have a default value
        // so we continue in order to avoid setting it
        if (typeof value === 'undefined') {
          continue;
        }
      }

      // Invoke the setter silently so we don't trigger "change" events on initialization
      this.set(prop, value, true);
    }

    this._delegateEvents();

    // Call the initialize method, if necessary
    if (typeof this._initialize === 'function') {
      this._initialize();
    }

    // Trigger ready event
    this._componentReady = true;
    this.trigger('coral-component:ready');
  };

  /**
    Called after the element has been constructed, template rendered, and attributes applied.

    @function _initialize
    @protected
    @memberof Coral.Component#
  */

  /**
    The CSS class name to apply to the element.

    @type {String}
    @member _className
    @protected
    @memberof Coral.Component#
  */

  /**
    Called during construction, is responsible for rendering any required sub-elements.

    @function _render
    @protected
    @memberof Coral.Component#
  */

  /**
    The filter function for keyboard events. By default, any child element can trigger keyboard events. You can pass
    {@link Coral.Keys.filterInputs} to avoid listening to key events triggered from within inputs.

    @function _filterKeys
    @protected
    @memberof Coral.Component#
  */
  Coral.Component.prototype._filterKeys = function() {
    return true;
  };

  /**
    Called when this element is inserted into the DOM.

    @fires Coral.Component#coral-component:attached
    @private
  */
  Coral.Component.prototype.attachedCallback = function() {
    this.trigger('coral-component:attached');

    // A component that is in the DOM should respond to global events
    this._delegateGlobalEvents();
  };

  /**
    Called when this element is removed from the DOM.

    @fires Coral.Component#coral-component:detached
    @private
  */
  Coral.Component.prototype.detachedCallback = function() {
    this.trigger('coral-component:detached');

    // A component that isn't in the DOM should not be responding to global events
    this._undelegateGlobalEvents();
  };

  /**
    Apply attribute changes by invoking setters. This creates a one-way relationship between attributes and properties.
    Changing an attribute updates the property, but changing the property does not update the attribute.

    @private
  */
  Coral.Component.prototype.attributeChangedCallback = function(attrName, oldValue, newValue) {
    // Use the property name from the attribute map, otherwise just set the property by the same name
    var propName = this._attributes[attrName] || attrName;

    // Case 1: We are handling sets/gets for this property
    var descriptor = this._properties[propName];
    if (typeof descriptor !== 'undefined') {
      if (descriptor.attribute === null) {
        // Don't set properties that have explicitly asked to have no corresponding attribute
        return;
      }

      ['attributeTransform', 'transform'].forEach(function(v) {
        // Use the stored methods
        var transform = descriptor._methods[v];
        if (transform) {
          newValue = transform.call(this, newValue, descriptor.default);
        }
      }, this);

      // Don't bother with the setter unless the value changed
      if (newValue !== this[propName]) {
        // Just invoke setter
        this[propName] = newValue;
      }
    }

    // Case 2: We have a passive setter for this attribute
    if (this._properties['_' + propName]) {
      this._properties['_' + propName].set.call(this, newValue);
    }
  };

  /**
    Queue a DOM sync for the next animation frame. In order for this to work as expected, sync methods should never
    rely on the result of another value being synced.

    @protected
  */
  Coral.Component.prototype._queueSync = function() {
    for (var i = 0, ni = arguments.length; i < ni; i++) {
      var propName = arguments[i];

      // Check if a sync is already queued
      var currentIndex = this._syncQueue.indexOf(propName);
      if (currentIndex !== -1) {
        // Move to the bottom of the queue.
        // This is necessary if a sync has already been queued for a property,
        // but another property sync is queued and specifies that this sync should come later.
        // This happens when Button.text is synced, as it wants to sync icon afterwards
        this._syncQueue.splice(currentIndex, 1);
      }

      // Queue the sync
      this._syncQueue.push(propName);
    }

    if (!this._syncPending) {
      Coral.commons.nextFrame(this._syncDOM);
      this._syncPending = true;
    }
  };

  /**
    Sync the specified property to the DOM.

    @param {String} propName
      The name of the property to sync.
    @param {Boolean} [leaveInQueue=false]
      Whether the property should be left in the queue.

    @protected
  */
  Coral.Component.prototype._syncProp = function(propName, leaveInQueue) {
    // De-queue each sync operation
    var method = this._properties[propName].sync;
    if (method) {
      method.call(this);
    }
    else {
      console.warn('Coral.Component: sync method for %s is not defined', propName);
    }

    if (!leaveInQueue) {
      var index = this._syncQueue.indexOf(propName);
      if (index !== -1) {
        this._syncQueue.splice(index, 1);
      }
    }
  };

  /**
    Sync all changed properties to the DOM.

    @protected
  */
  Coral.Component.prototype._syncDOM = function() {
    var propName;

    // De-queue each sync operation
    while (propName = this._syncQueue.shift()) {
      // Sync the property, and avoid removing it because we already have
      this._syncProp(propName, true);
    }

    this._syncPending = false;
  };

  /**
    Add local event and key combo listeners for this component, store global event/key combo listeners for later.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._delegateEvents = function() {
    /*
      Add listeners to new event
        - Include in hash
      Add listeners to existing event
        - Override method and use super
      Remove existing event
        - Pass null
    */
    var match;
    var eventName;
    var eventInfo;
    var listener;
    var selector;
    var elements;
    var isGlobal;
    var isKey;
    var isResize;
    var isCapture;

    for (eventInfo in this._events) {
      listener = this._events[eventInfo];

      // Extract the event name and the selector
      match = eventInfo.match(delegateEventSplitter);
      eventName = match[1] + '.CoralComponent';
      selector = match[2];

      if (selector === '') {
        // instead of null because the key module checks for undefined
        selector = undefined;
      }

      // Try to get the method corresponding to the value in the map
      listener = getListenerFromMethodNameOrFunction(this, eventName, listener);

      if (listener) {
        // Always execute in the context of the object
        // @todo is this necessary? this should be correct anyway
        listener = listener.bind(this);

        // Check if the listener is on the window
        isGlobal = eventName.indexOf('global:') === 0;
        if (isGlobal) {
          eventName = eventName.substr(7);
        }

        // Check if the listener is a capture listener
        isCapture = eventName.indexOf('capture:') === 0;
        if (isCapture) {
          // @todo Limitation: It should be possible to do capture:global:, but it isn't
          eventName = eventName.substr(8);
        }

        // Check if the listener is a key listener
        isKey = eventName.indexOf('key:') === 0;
        if (isKey) {
          if (isCapture) {
            throw new Error('Coral.Keys does not currently support listening to key events with capture');
          }
          eventName = eventName.substr(4);
        }

        // Check if the listener is a resize listener
        isResize = eventName.indexOf('resize') === 0;
        if (isResize) {
          if (isCapture) {
            throw new Error('Coral.commons.addResizeListener does not currently support listening to resize event with capture');
          }
        }

        if (isGlobal) {
          // Store for adding/removal
          if (isKey) {
            this._globalKeys = this._globalKeys || [];
            this._globalKeys.push({
              keyCombo: eventName,
              selector: selector,
              listener: listener
            });
          }
          else {
            this._globalEvents = this._globalEvents || [];
            this._globalEvents.push({
              eventName: eventName,
              selector: selector,
              listener: listener,
              isCapture: isCapture
            });
          }
        }
        else {
          // Events on the element itself
          if (isKey) {
            // Create the keys instance only if its needed
            this._keys = this._keys || new Coral.Keys(this, {
                filter: this._filterKeys,
                // Execute key listeners in the context of the element
                context: this
              });

            // Add listener locally
            this._keys.on(eventName, selector, listener);
          }
          else if (isResize) {
            if (selector) {
              elements = document.querySelectorAll(selector);
              for (var i = 0; i < elements.length; ++i) {
                Coral.commons.addResizeListener(elements[i], listener);
              }
            }
            else {
              Coral.commons.addResizeListener(this, listener);
            }
          }
          else {
            this._vent.on(eventName, selector, listener, isCapture);
          }
        }
      }
    }
  };

  /**
    Remove global event listeners for this component.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._undelegateGlobalEvents = function() {
    var i;
    if (this._globalEvents) {
      // Remove global event listeners
      for (i = 0; i < this._globalEvents.length; i++) {
        var event = this._globalEvents[i];
        Coral.events.off(event.eventName, event.selector, event.listener, event.isCapture);
      }
    }

    if (this._globalKeys) {
      // Remove global key listeners
      for (i = 0; i < this._globalKeys.length; i++) {
        var key = this._globalKeys[i];
        Coral.keys.off(key.keyCombo, key.selector, key.listener);
      }
    }

    return this;
  };

  /**
    Add global event listeners for this component.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._delegateGlobalEvents = function() {
    var i;
    if (this._globalEvents) {
      // Add global event listeners
      for (i = 0; i < this._globalEvents.length; i++) {
        var event = this._globalEvents[i];
        Coral.events.on(event.eventName, event.selector, event.listener, event.isCapture);
      }
    }

    if (this._globalKeys) {
      // Add global key listeners
      for (i = 0; i < this._globalKeys.length; i++) {
        var key = this._globalKeys[i];
        Coral.keys.on(key.keyCombo, key.selector, key.listener);
      }
    }

    return this;
  };

  /**
    Add an event listener.

    @param {String} eventName
      The event name to listen for.
    @param {String} [selector]
      The selector to use for event delegation.
    @param {Function} func
      The function that will be called when the event is triggered.
    @param {Boolean} [useCapture=false]
      Whether or not to listen during the capturing or bubbling phase.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.on = function(eventName, selector, func, useCapture) {
    this._vent.on(eventName, selector, func, useCapture);
    return this;
  };

  /**
    Remove an event listener.

    @param {String} eventName
      The event name to stop listening for.
    @param {String} [selector]
      The selector that was used for event delegation.
    @param {Function} func
      The function that was passed to <code>on()</code>.
    @param {Boolean} [useCapture]
      Only remove listeners with <code>useCapture</code> set to the value passed in.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.off = function(eventName, selector, func, useCapture) {
    this._vent.off(eventName, selector, func, useCapture);
    return this;
  };

  /**
    Trigger an event.

    @param {String} eventName
      The event name to trigger.
    @param {Object} [props]
      Additional properties to make available to handlers as <code>event.detail</code>.
    @param {Boolean} [bubbles=true]
      Set to <code>false</code> to prevent the event from bubbling.
    @param {Boolean} [cancelable=true]
      Set to <code>false</code> to prevent the event from being cancelable.

    @returns {CustomEvent} CustomEvent object
  */
  Coral.Component.prototype.trigger = function(eventName, props, bubbles, cancelable) {
    // When 'bubbles' is not set, then default to true:
    bubbles = bubbles || bubbles === undefined;

    // When 'cancelable' is not set, then default to true:
    cancelable = cancelable || cancelable === undefined;

    // CustomEvent is polyfilled for IE via Polymer:
    // https://github.com/Polymer/CustomElements/blob/master/src/boot.js#L84-L93
    var event = new CustomEvent(eventName, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: props
    });

    // default value in case the dispatching fails
    var defaultPrevented = false;

    try {
      // leads to NS_ERROR_UNEXPECTED in Firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=329509
      defaultPrevented = !this.dispatchEvent(event);
    } catch (e) {}

    // Check if the defaultPrevented status was correctly stored back to the event object
    if (defaultPrevented !== event.defaultPrevented) {
      // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
      // However, it does return false if preventDefault() was called
      // Unfortunately, the returned event's defaultPrevented property is read-only
      // We need to work around this such that (patchedEvent instanceof Event) === true
      // First, we'll create an object that uses the event as its prototype
      // This gives us an object we can modify that is still technically an instanceof Event
      var patchedEvent = Object.create(event);

      // Next, we set the correct value for defaultPrevented on the new object
      // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
      // For some reason, defineProperty doesn't cause this
      Object.defineProperty(patchedEvent, 'defaultPrevented', {
        value: defaultPrevented
      });

      return patchedEvent;
    }

    return event;
  };

  /**
    Non-destructively remove this element. It can be re-added by simply appending it to the document again.
    It will be garbage collected if there are no more references to it.
    This is different from using jQuery's remove(), which is destructive in that it removes data and listeners.
  */
  Coral.Component.prototype.remove = function() {
    if (this.parentNode) {
      // Just remove the element from its parent. This will automatically invoke detachedCallback
      this.parentNode.removeChild(this);
    }
  };

  /**
    @ignore
    @private
  */
  Coral.Component.prototype._doSet = function(property, value, silent) {
    // Get property descriptor from constructor. Property descriptors are stored on constructor with methods
    // dereferenced to actual functions
    var descriptor = this._properties && this._properties[property];

    if (descriptor) {
      // if the property is a content zone we will call its set function instead
      if (descriptor.contentZone && this[property].set) {
        this[property].set(value);
      }
      else if (descriptor._methods && descriptor._methods.set) {
        // Call and pass true silent
        // Use the actual setter method instead of the original method so events are triggered etc
        descriptor._methods.set.call(this, value, !!silent);
      }
      else {
        this[property] = value;
      }
    }
    else {
      // Simply set the property if it doesn't exist or has no setter
      this[property] = value;
    }
  };

  /**
    Set a single property.

    @name Coral.Component#set
    @function

    @param {String} property
      The name of the property to set.
    @param {*} value
      The value to set the property to.
    @param {Boolean} silent
      If true, events should not be triggered as a result of this set.

    @returns {Coral.Component} this, chainable.
  */

  /**
    Set multiple properties.

    @name Coral.Component#set
    @function

    @param {Object.<String, *>} properties
      An object of property/value pairs to set.
    @param {Boolean} silent
      If true, events should not be triggered as a result of this set.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.set = function(propertyOrProperties, valueOrSilent, silent) {
    var property;
    var properties;
    var value;

    if (typeof propertyOrProperties === 'string') {
      // Set a single property
      property = propertyOrProperties;
      value = valueOrSilent;
      this._doSet(property, value, silent);
    }
    else {
      properties = propertyOrProperties;
      silent = valueOrSilent;

      // Set a map of properties
      for (property in properties) {
        value = properties[property];

        this._doSet(property, value, silent);
      }
    }

    return this;
  };

  /**
    Get the value of a property.

    @param {String} property
      The name of the property to fetch the value of.

    @returns {*} Property value.
  */
  Coral.Component.prototype.get = function(property) {
    return this[property];
  };

  /**
    Show this component.

    @returns {Coral.Component} this, chainable
  */
  Coral.Component.prototype.show = function() {
    if (!this.hidden) {
      return this;
    }

    this.hidden = false;
    return this;
  };

  /**
    Hide this component.

    @returns {Coral.Component} this, chainable
  */
  Coral.Component.prototype.hide = function() {
    if (this.hidden) {
      return this;
    }

    this.hidden = true;
    return this;
  };

  // Copy all methods for baseTagName-style inheritance
  Coral.Component.prototype._methods = {};
  for (var prop in Coral.Component.prototype) {
    if (Coral.Component.prototype.hasOwnProperty(prop)) {
      Coral.Component.prototype._methods[prop] = Coral.Component.prototype[prop];
    }
  }

  /**
    Whether this component is hidden or not.

    @name hidden
    @type {Boolean}
    @default false
    @htmlattribute hidden
    @htmlattributereflected
    @memberof Coral.Component#
  */

  /**
    Triggered when the component is attached to the DOM.

    @event Coral.Component#coral-component:attached

    @param {Object} event
      Event object.
  */

  /**
    Triggered when the component is detached to the DOM.

    @event Coral.Component#coral-component:detached

    @param {Object} event
      Event object.
  */

  /**
    Triggerred when the component has been upgraded and is ready for use.

    @event Coral.Component#coral-component:ready

    @param {Object} event
      Event object.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /** @private */
  function getTagSelector(tag, nativeTag) {
    return nativeTag ? (nativeTag + '[is="' + tag + '"]') : tag;
  }

  /**
    The Collection API as used as an interface to manipulate item collections within the components.

    @param {HTMLElement} options.host
      The element that hosts the collection.
    @param {String} options.itemTagName
      The tag name of the elements that constitute a collection item.
    @param {String} options.itemBaseTag
      The optional base tag name of the elements that constitute a collection item. This is required for elements that
      extend native elements, like Button.
    @param {String} [options.itemSelector]
      Optional, derived from itemTagName and itemBaseTag by default. Used to query the host element for its collection
      items.
    @param {HTMLElement} [options.container]
      Optional element that wraps the collection. Defines where the new items will be added when <code>add</code> method
      is called. Is the same as options.host by default.
    @param {Function} [options.filter]
      Optional function used to filter the results.
    @param {Function} [options.onItemAdded]
      Method called once an item is added to the DOM.
    @param {Function} [options.onItemRemoved]
      Method called once an item is removed from the DOM.

    @interface
  */
  Coral.Collection = function(options) {
    options = options || {};

    this._host = options.host;
    this._itemTagName = options.itemTagName;
    this._itemBaseTagName = options.itemBaseTagName;
    this._itemSelector = options.itemSelector || getTagSelector(this._itemTagName, this._itemBaseTagName);

    // the container where the new items are added
    this._container = options.container || this._host;
    this._filter = options.filter;

    this._onItemAdded = options.onItemAdded;
    this._onItemRemoved = options.onItemRemoved;
  };

  var properties = {
    /**
      Number of items inside the Collection.

      @type {Number}
      @default 0
      @memberof Coral.Collection#
    */
    'length': {
      get: function() {
        return this.getAll().length;
      }
    }
  };

  Coral.Collection.prototype = Object.create(Object.prototype, properties);

  Coral.Collection.prototype._properties = properties;

  /**
    Adds an item to the Collection. The item can be either a <code>HTMLElement</code> or an Object with the item
    properties. If the index is not provided the element appended to the end. If <code>options.onItemAdded</code> was
    provided, it will be called after the element is added from the DOM.

    @param {HTMLElement|Object} item
      The item to add to the Collection.
    @param {Number} [insertBefore]
      Existing item used as a reference to insert the new item before. If the value is <code>null</code>, then the new
      item will be added at the end.

    @fires Coral.Collection#coral-collection:add

    @returns {HTMLElement} the item added.
   */
  Coral.Collection.prototype.add = function(item, insertBefore) {
    // container and itemtagname are the minimum options that need to be provided to automatically handle this function
    if (this._container && this._itemTagName) {
      if (!(item instanceof HTMLElement)) {
        // creates an instance of an item from the object
        if (this._itemBaseTagName) {
          item = document.createElement(this._itemBaseTagName, this._itemTagName).set(item, true);
        }
        else {
          item = document.createElement(this._itemTagName).set(item, true);
        }
      }

      // inserts the element in the specified container
      this._container.insertBefore(item, insertBefore || null);

      if (typeof this._onItemAdded === 'function' && this._host) {
        this._onItemAdded.call(this._host, item);
      }

      return item;
    }

    throw new Error('Please provide host and itemTagName or override add() to provide your own implementation.');
  };

  /**
    Removes all the items from the Collection.

    @returns {Array.<HTMLElement>} an Array with all the removed items.
   */
  Coral.Collection.prototype.clear = function() {
    var items = this.getAll();

    var removed = [];

    for (var i = items.length - 1; i > -1; i--) {
      removed.push(this.remove(items[i]));
    }

    return removed;
  };

  /**
    Returns an array with all the items inside the Collection. Each element is of type <code>HTMLElement</code>.

    @returns {Array.<HTMLElement>} an Array with all the items inside the collection.
   */
  Coral.Collection.prototype.getAll = function() {
    // in order to perform the automatic getAll query, the _host and _itemSelector must be provided
    if (this._host && this._itemSelector) {
      var items = Array.prototype.slice.call(this._host.querySelectorAll(this._itemSelector));
      if (this._filter) {
        items = items.filter(this._filter);
      }

      return items;
    }

    throw new Error('Please provide host and itemTagName or override getAll() to provide your own implementation.');
  };

  /**
    Removes the given item from the Collection. If <code>options.onItemRemoved</code> was provided, it will be called
    after the element is removed from the DOM.

    @param {HTMLElement} item
      The item to add to the Collection.

    @fires Coral.Collection#coral-collection:remove

    @returns {HTMLElement} the item removed.
   */
  Coral.Collection.prototype.remove = function(item) {
    if (item.parentNode) {
      item.parentNode.removeChild(item);

      // we only call the callback if the item was really removed
      if (typeof this._onItemRemoved === 'function' && this._host) {
        this._onItemRemoved.call(this._host, item);
      }
    }

    return item;
  };

  /**
    Returns the first item of the collection.

    @returns {?HTMLElement} the first item of the collection.
  */
  Coral.Collection.prototype.first = function() {
    // Use getAll() so filter() is applied
    return this.getAll()[0] || null;
  };

  /**
    Returns the last item of the collection.

    @returns {?HTMLElement} the last item of the collection.
  */
  Coral.Collection.prototype.last = function() {
    var all = this.getAll();
    var count = all.length;
    return all[count - 1] || null;
  };

  /**
    Triggered when an item is added to the Collection.

    @event Coral.Collection#coral-collection:add

    @param {Object} event
      Event object.
    @param {HTMLElement} event.detail.item
      The item that was added.
  */

  /**
    Triggered when an item is removed from a Collection.

    @event Coral.Collection#coral-collection:remove

    @param {Object} event
      Event object.
    @param {HTMLElement} event.detail.item
      The item that was removed.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  /* jshint validthis: true */
  'use strict';

  // The tab capture element that lives at the top of the body
  var topTabCaptureEl;
  var $topTabCaptureEl;
  var bottomTabCaptureEl;
  var $bottomTabCaptureEl;

  // A reference to the backdrop element
  var backdropEl;
  var $backdropEl;

  // The starting zIndex for overlays
  var startZIndex = 10000;

  // Tab keycode
  var TAB_KEY = 9;

  /**
    Focus trap options.
    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var trapFocus = {
    /** Focus is trapped such that the use cannot focus outside of the overlay. */
    ON: 'on',
    /** The user can focus outside the overlay as normal. */
    OFF: 'off'
  };

  /**
    Return focus options.

    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var returnFocus = {
    /** When the overlay is closed, the element that was focused before the it was shown will be focused again. */
    ON: 'on',
    /** Nothing will be focused when the overlay is closed. */
    OFF: 'off'
  };

  /**
    Focus behavior options.

    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var focusOnShow = {
    /** When the overlay is opened, it will be focused. */
    ON: 'on',
    /** The overlay will not focus itself when opened. */
    OFF: 'off'
  };

  // A stack interface for overlays
  var _overlays = [];
  var overlays = {
    pop: function(instance) {
      // Get overlay index
      var index = this.indexOf(instance);

      if (index === -1) {
        return null;
      }

      // Get the overlay
      var overlay = _overlays[index];

      // Remove from the stack
      _overlays.splice(index, 1);

      // Return the passed overlay or the found overlay
      return overlay;
    },

    push: function(instance) {
      // Pop overlay
      var overlay = this.pop(instance) || {
          instance: instance
        };

      // Get the new highest zIndex
      var zIndex = this.getHighestZIndex() + 10;

      // Store the zIndex
      overlay.zIndex = zIndex;
      instance.style.zIndex = zIndex;

      // Push it
      _overlays.push(overlay);

      if (overlay.backdrop) {
        // If the backdrop is shown, we'll need to reposition it
        // Generally, a component will not call _pushOverlay unnecessarily
        // However, attachedCallback is asynchronous in polyfilld environments,
        // so _pushOverlay will be called when shown and when attached
        doRepositionBackdrop();
      }

      return overlay;
    },

    indexOf: function(instance) {
      // Loop over stack
      // Find overlay
      // Return index
      for (var i = 0; i < _overlays.length; i++) {
        if (_overlays[i].instance === instance) {
          return i;
        }
      }
      return -1;
    },

    get: function(instance) {
      // Get overlay index
      var index = this.indexOf(instance);

      // Return overlay
      return index === -1 ? null : _overlays[index];
    },

    top: function() {
      var length = _overlays.length;
      return length === 0 ? null : _overlays[length - 1];
    },

    getHighestZIndex: function() {
      var overlay = this.top();
      return overlay ? overlay.zIndex : startZIndex;
    },

    some: function() {
      return _overlays.some.apply(_overlays, arguments);
    },

    forEach: function() {
      return _overlays.forEach.apply(_overlays, arguments);
    }
  };

  /**
    Hide the backdrop if no overlays are using it.
  */
  function hideOrRepositionBackdrop() {
    if (!backdropEl) {
      // Do nothing if we've never shown the backdrop
      return;
    }

    // Loop over all overlays
    var keepBackdrop = overlays.some(function(overlay) {
      // Check for backdrop usage
      if (overlay.backdrop) {
        return true;
      }
    });

    if (!keepBackdrop) {
      // Hide the backdrop
      doBackdropHide();
    }
    else {
      // Reposition the backdrop
      doRepositionBackdrop();
    }

    // Hide/create the document-level tab capture element as necessary
    // This only applies to modal overlays (those that have backdrops)
    var top = overlays.top();
    if (!top || !(top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop)) {
      hideDocumentTabCaptureEls();
    }
    else if (top && top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop) {
      createDocumentTabCaptureEls();
    }
  }

  /**
    Actually reposition the backdrop to be under the topmost overlay.
  */
  function doRepositionBackdrop() {
    // Position under the topmost overlay
    var top = overlays.top();

    if (top) {

      // The backdrop, if shown, should be positioned under the topmost overlay that does have a backdrop
      for (var i=_overlays.length - 1; i > -1; i--) {
        if (_overlays[i].backdrop) {
          backdropEl.style.zIndex = _overlays[i].zIndex - 1;
          break;
        }
      }

      // ARIA: Set hidden properly
      hideEverythingBut(top.instance);

    }
  }

  /**
    Cancel the backdrop hide mid-animation.
  */
  var fadeTimeout;
  function cancelBackdropHide() {
    clearTimeout(fadeTimeout);
  }

  /**
    Actually hide the backdrop.
  */
  function doBackdropHide() {
    $(document.body).removeClass('u-coral-noscroll');

    // Start animation
    Coral.commons.nextFrame(function() {
      $backdropEl.removeClass('is-open');

      cancelBackdropHide();
      fadeTimeout = setTimeout(function() {
        backdropEl.style.display = 'none';
      }, Coral.mixin.overlay.FADETIME);
    });

    // Set flag for testing
    backdropEl._isOpen = false;

    // Wait for animation to complete
    showEverything();
  }

  /**
    Actually show the backdrop.
  */
  function doBackdropShow(zIndex, instance) {
    $(document.body).addClass('u-coral-noscroll');

    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.className = 'coral-Backdrop';
      document.body.appendChild(backdropEl);

      $backdropEl = $(backdropEl);
      $backdropEl.on('click', handleBackdropClick);
    }

    // Show just under the provided zIndex
    // Since we always increment by 10, this will never collide
    backdropEl.style.zIndex = zIndex - 1;

    // Set flag for testing
    backdropEl._isOpen = true;

    // Start animation
    cancelBackdropHide();
    backdropEl.style.display = '';
    Coral.commons.nextFrame(function() {
      // Add the class on the next animation frame so backdrop has time to exist
      // Otherwise, the animation for opacity will not work.
      $backdropEl.addClass('is-open');
    });

    hideEverythingBut(instance);
  }

  /**
    Handles clicks to the backdrop, calling backdropClickedCallback for every overlay
  */
  function handleBackdropClick(event) {
    overlays.forEach(function(overlay) {
      if (typeof overlay.instance.backdropClickedCallback === 'function') {
        overlay.instance.backdropClickedCallback(event);
      }
    });
  }

  /**
    Set aria-hidden on every immediate child except the one passed, which should not be hidden.
  */
  function hideEverythingBut(instance) {
    // ARIA: Hide all the things
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      // If it's not a parent of or not the instance itself, it needs to be hidden
      if (child !== instance && !child.contains(instance)) {
        var currentAriaHidden = child.getAttribute('aria-hidden');
        if (currentAriaHidden) {
          // Store the previous value of aria-hidden if present
          // Don't blow away the previously stored value
          child._previousAriaHidden = child._previousAriaHidden || currentAriaHidden;
          if (currentAriaHidden === 'true') {
            // It's already true, don't bother setting
            continue;
          }
        }
        else {
          // Nothing is hidden by default, store that
          child._previousAriaHidden = 'false';
        }

        // Hide it
        child.setAttribute('aria-hidden', 'true');
      }
    }

    // Always show ourselves
    instance.setAttribute('aria-hidden', 'false');
  }

  /**
    Show or restore the aria-hidden state of every child of body.
  */
  function showEverything() {
    // ARIA: Show all the things
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      // Restore the previous aria-hidden value
      child.setAttribute('aria-hidden', child._previousAriaHidden || 'false');
    }
  }

  /**
    Create the global tab capture element.
  */
  function createDocumentTabCaptureEls() {
    if (!topTabCaptureEl) {
      topTabCaptureEl = document.createElement('div');
      topTabCaptureEl.setAttribute('coral-tabcapture', '');
      topTabCaptureEl.tabIndex = 0;
      $topTabCaptureEl = $(topTabCaptureEl);
      $topTabCaptureEl.prependTo(document.body);
      $topTabCaptureEl.on('focus', function(event) {
        var top = overlays.top();
        if (top && top.instance.trapFocus === trapFocus.ON) {
          // Focus on the first tabbable element of the top overlay
          top.instance.$.find(':tabbable').not('[coral-tabcapture]').first().focus();
        }
      });

      bottomTabCaptureEl = document.createElement('div');
      bottomTabCaptureEl.setAttribute('coral-tabcapture', '');
      bottomTabCaptureEl.tabIndex = 0;
      $bottomTabCaptureEl = $(bottomTabCaptureEl);
      $bottomTabCaptureEl.appendTo(document.body);
      $bottomTabCaptureEl.on('focus', function(event) {
        var top = overlays.top();
        if (top && top.instance.trapFocus === trapFocus.ON) {
          // Focus on the last tabbable element of the top overlay
          top.instance.$.find(':tabbable').not('[coral-tabcapture]').last().focus();
        }
      });
    }
    else {
      if (document.body.firstElementChild !== topTabCaptureEl) {
        // Make sure we stay at the very top
        $topTabCaptureEl.prependTo(document.body);
      }

      if (document.body.lastElementChild !== bottomTabCaptureEl) {
        // Make sure we stay at the very bottom
        $bottomTabCaptureEl.appendTo(document.body);
      }
    }

    // Make sure the tab capture elemenst are shown
    topTabCaptureEl.style.display = 'inline';
    bottomTabCaptureEl.style.display = 'inline';
  }

  /**
    Called after all overlays are hidden and we shouldn't capture the first tab into the page.
  */
  function hideDocumentTabCaptureEls() {
    if (topTabCaptureEl) {
      topTabCaptureEl.style.display = 'none';
      bottomTabCaptureEl.style.display = 'none';
    }
  }

  // Properties to add to the object
  var properties = {
    /**
      Whether to trap tabs and keep them within the overlay.

      @type {Coral.mixin.overlay.trapFocus}
      @default Coral.mixin.overlay.trapFocus.OFF
      @htmlattribute trapfocus
      @memberof Coral.mixin.overlay#
    */
    'trapFocus': {
      attribute: 'trapfocus',
      default: trapFocus.OFF,
      validate: Coral.validate.enumeration(trapFocus),
      set: function(value) {
        if (value === trapFocus.ON) {
          // Give ourselves tabIndex if we're not focusable
          if (!this.$.is(':focusable')) {
            this.tabIndex = 0;
          }

          // Create elements
          this._elements.topTabCapture = document.createElement('div');
          this._elements.topTabCapture.setAttribute('coral-tabcapture', 'top');
          this._elements.topTabCapture.tabIndex = 0;
          this.insertBefore(this._elements.topTabCapture, this.firstElementChild);
          this._elements.intermediateTabCapture = document.createElement('div');
          this._elements.intermediateTabCapture.setAttribute('coral-tabcapture', 'intermediate');
          this._elements.intermediateTabCapture.tabIndex = 0;
          this.appendChild(this._elements.intermediateTabCapture);
          this._elements.bottomTabCapture = document.createElement('div');
          this._elements.bottomTabCapture.setAttribute('coral-tabcapture', 'bottom');
          this._elements.bottomTabCapture.tabIndex = 0;
          this.appendChild(this._elements.bottomTabCapture);

          // Add listeners
          this._handleTabCaptureFocus = this._handleTabCaptureFocus.bind(this);
          this._handleRootKeypress = this._handleRootKeypress.bind(this);
          this._vent.on('keydown', this._handleRootKeypress);
          this._vent.on('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
        }
        else {
          // Don't just put this in an else, check if we currently have it disabled
          // so we only attempt to remove elements if we were previously capturing tabs
          if (this.trapFocus === trapFocus.ON) {
            // Remove elements
            this.removeChild(this._elements.topTabCapture);
            this.removeChild(this._elements.intermediateTabCapture);
            this.removeChild(this._elements.bottomTabCapture);
            this._elements.topTabCapture = null;
            this._elements.intermediateTabCapture = null;
            this._elements.bottomTabCaptureEl = null;

            // Remove listeners
            this._vent.off('keydown', this._handleRootKeypress);
            this._vent.off('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
          }
        }

        this._trapFocus = value;
      }
    },

    /**
      Whether to return focus to the previously focused element when closed.

      @type {Coral.mixin.overlay.returnFocus}
      @default Coral.mixin.overlay.returnFocus.OFF
      @htmlattribute returnfocus
      @memberof Coral.mixin.overlay#
    */
    'returnFocus': {
      attribute: 'returnfocus',
      default: returnFocus.OFF,
      validate: Coral.validate.enumeration(returnFocus),
    },

    /**
      Whether to focus when opened.

      @type {Coral.mixin.overlay.focusOnShow}
      @default Coral.mixin.overlay.focusOnShow.OFF
      @htmlattribute focusonshow
      @memberof Coral.mixin.overlay#
    */
    'focusOnShow': {
      attribute: 'focusonshow',
      default: focusOnShow.OFF,
      validate: Coral.validate.enumeration(focusOnShow)
    },

    /**
      Whether this overlay is open or not.

      @type {Boolean}
      @default false
      @htmlattribute open
      @htmlattributereflected
      @memberof Coral.mixin.overlay#
      @fires Coral.mixin.overlay#coral-overlay:open
      @fires Coral.mixin.overlay#coral-overlay:close
      @fires Coral.mixin.overlay#coral-overlay:beforeopen
      @fires Coral.mixin.overlay#coral-overlay:beforeclose
    */
    'open': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      triggerBefore: function(newValue, oldValue) {
        // We have to manually implement triggerBefore since we can trigger multiple events
        return this.trigger(newValue ? 'coral-overlay:beforeopen' : 'coral-overlay:beforeclose');
      },
      trigger: function(newValue, oldValue) {
        return this.trigger(newValue ? 'coral-overlay:open' : 'coral-overlay:close');
      },
      set: function(value) {
        // We need to store the value here as we're not using the default setter
        this._open = value;

        // Set synchronously as it does not affect rendering
        if (this.open) {
          // Set aria-hidden false before we show
          // Otherwise, screen readers will not announce
          this.setAttribute('aria-hidden', 'false');
        }
        else {
          // Doesn't matter when we set aria-hidden true (nothing being announced)
          this.setAttribute('aria-hidden', 'true');
        }

        // Synchronous operations
        if (this.parentNode) {
          // Don't do anything if we're not in the DOM yet
          // This prevents errors related to allocating a zIndex we don't need
          if (this.open) {
            // Do this check afterwards as we may have been appended inside of _show()

            // Set z-index
            this._pushOverlay();

            if (this.returnFocus === returnFocus.ON) {
              // Store the element that currently has focus, or the element that was passed to returnFocusTo()
              this._elementToFocusWhenHidden = this._elementToFocusWhenHidden || (document.activeElement === document.body ? null : document.activeElement);
            }
          }
          else {
            // Release zIndex
            this._popOverlay();

            if (this.returnFocus === returnFocus.ON && this._elementToFocusWhenHidden) {
              if (document.activeElement && !this.contains(document.activeElement)) {
                // Don't return focus if the user focused outside of the overlay
                return;
              }

              // IE will throw if you try to focus on a non-focusable or hidden element
              // Catch these errors so we recover gracefully
              try {
                // Return focus, ignoring tab capture if it's an overlay
                this._elementToFocusWhenHidden._ignoreTabCapture = true;
                this._elementToFocusWhenHidden.focus();
                this._elementToFocusWhenHidden._ignoreTabCapture = false;
              } catch (error) {}

              // Drop the reference to avoid memory leaks
              this._elementToFocusWhenHidden = null;
            }
          }
        }
      },
      sync: function() {
        var self = this;

        if (this.open) {
          if (this.trapFocus === trapFocus.ON) {
            // Make sure tab capture elements are positioned correctly
            if (
              // Tab capture elements are no longer at the bottom
              this._elements.topTabCapture !== this.firstElementChild ||
              this._elements.bottomTabCapture !== this.lastElementChild ||
              // Tab capture elements have been separated
              this._elements.bottomTabCapture.previousElementSibling !== this._elements.intermediateTabCapture
            ) {
              this.insertBefore(this._elements.intermediateTabCapture, this.firstElementChild);
              this.appendChild(this._elements.intermediateTabCapture);
              this.appendChild(this._elements.bottomTabCapture);
            }
          }

          // The default style should be display: none for overlays
          // Show ourselves first for centering calculations etc
          this.style.display = 'block';

          this._cancelClose();

          Coral.commons.nextFrame(function() {
            self.$.addClass('is-open');
          });

          // Focus on the overlay itself, announcing it
          // Pressing the tab key will then focus on the next focusable element inside of it
          if (this.focusOnShow === focusOnShow.ON) {
            this.focus();
          }
        }
        else {
          // Set a flag that shows we're currently closing
          this._closing = true;

          this._cancelClose();

          // Fade out
          Coral.commons.nextFrame(function() {
            self.$.removeClass('is-open');

            var closeComplete = function() {
              // Reset flag
              self._closing = false;

              // Hide self
              self.style.display = 'none';
            };

            if (self._overlayAnimationTime) {
              // Wait for animation to complete
              self._closeTimeout = setTimeout(closeComplete, self._overlayAnimationTime);
            }
            else {
              // Execute immediately
              closeComplete();
            }
          });
        }
      }
    }

    /**
      The time it takes for the overlay to animate opening/closing.
      This value should match the CSS animation time for the overlay in question.

      @name _overlayAnimationTime
      @type {Number}
      @default 0
      @protected
      @memberof Coral.mixin.overlay#
    */
  };

  var methods = {
    detachedCallback: function() {
      if (this.open) {
        // Release zIndex as we're not in the DOM any longer
        // When we're re-added, we'll get a new zIndex
        this._popOverlay();

        if (this._requestedBackdrop) {
          // Mark that we'll need to show the backdrop when attached
          this._showBackdropOnAttached = true;
        }
      }
    },

    attachedCallback: function() {
      if (this.open) {
        this._pushOverlay();

        if (this._showBackdropOnAttached) {
          // Show the backdrop again
          this._showBackdrop();
        }
      }
    },

    /**
      Open the overlay and set the z-index accordingly.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    show: function() {
      this.open = true;

      return this;
    },

    /**
      Close the overlay.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    hide: function() {
      this.open = false;

      return this;
    },

    /**
      Set the element that focus should be returned to when the overlay is hidden.

      @param {HTMLElement} element
        The element to return focus to. This must be a DOM element, not a jQuery object or selector.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    returnFocusTo: function(element) {
      if (this.returnFocus === returnFocus.OFF) {
        // Switch on returning focus if it's off
        this.returnFocus = returnFocus.ON;
      }

      // Give tabindex if the element is not focusable
      if (!$(element).is(':focusable')) {
        element.tabIndex = 0;
      }

      this._elementToFocusWhenHidden = element;
      return this;
    },

    /**
      Check if this overlay is the topmost.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _isTopOverlay: function() {
      var top = overlays.top();
      return top && top.instance === this;
    },

    /**
      Push the overlay to the top of the stack.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _pushOverlay: function() {
      overlays.push(this);
    },

    /**
      Remove the overlay from the stack.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _popOverlay: function() {
      overlays.pop(this);

      // Automatically hide the backdrop if required
      hideOrRepositionBackdrop();
    },

    /**
      Show the backdrop.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _showBackdrop: function() {
      var overlay = overlays.get(this);

      // Overlay is not tracked unless the component is in the DOM
      // Hence, we need to check
      if (overlay) {
        overlay.backdrop = true;
        doBackdropShow(overlay.zIndex, this);
      }

      // Mark on the instance that the backdrop has been requested for this overlay
      this._requestedBackdrop = true;

      // Mark that the backdrop was requested when not attached to the DOM
      // This allows us to know whether to push the overlay when the component is attached
      if (!this.parentNode) {
        this._showBackdropOnAttached = true;
      }

      if (this.trapFocus === trapFocus.ON) {
        createDocumentTabCaptureEls();
      }
    },

    /**
      Show the backdrop.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _hideBackdrop: function() {
      var overlay = overlays.get(this);

      if (overlay) {
        overlay.backdrop = false;

        // If that was the last overlay using the backdrop, hide it
        hideOrRepositionBackdrop();
      }

      // Mark on the instance that the backdrop is no longer needed
      this._requestedBackdrop = false;
    },

    /**
      Cancel a close operation.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _cancelClose: function() {
      clearTimeout(this._closeTimeout);
      this._closing = false;
    },

    /**
      Handles keypresses on the root of the overlay and marshalls focus accordingly.

      @protected
    */
    _handleRootKeypress: function(event) {
      if (event.target === this && event.keyCode === TAB_KEY) {
        // Skip the top tabcapture and focus on the first focusable element
        this._focusOn('first');

        // Stop the normal tab behavior
        event.preventDefault();
      }
    },

    /**
      Handles focus events on tab capture elements.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _handleTabCaptureFocus: function(event) {
      // Avoid moving around if we're trying to focus on coral-tabcapture
      if (this._ignoreTabCapture) {
        this._ignoreTabCapture = false;
        return;
      }

      // Focus on the correct tabbable element
      var target = event.target;
      var which = (target === this._elements.intermediateTabCapture ? 'first' : 'last');

      this._focusOn(which);
    },

    /**
      Focus on the first or last element

      @param {String} which   one of "first" or "last"
      @protected
    */
    _focusOn: function(which) {
      var tabTarget = this.$.find(':tabbable').not('[coral-tabcapture]')[which]();

      if (tabTarget.length) {
        tabTarget.focus();
      }
      else {
        this.focus();
      }
    }
  };

  /**
    Make an object an overlay (prototype or instance).
    @mixin
  */
  Coral.mixin.overlay = function(object, options) {
    // Augment property descriptors
    Coral.register.augmentProperties(options.properties, properties);

    // Add methods
    Coral.commons.augment(object, methods, function(objectMethod, mixinMethod, prop) {
      if (prop === 'hide' || prop === 'show') {
        return mixinMethod;
      }
      return Coral.commons.callAll(mixinMethod, objectMethod);
    });
  };

  // Expose methods on prototype so they may be called by implementing components
  Coral.mixin.overlay.prototype = methods;

  // The time it should take for overlays to fade in milliseconds
  // Important: This should be greater than or equal to the CSS transition time
  Coral.mixin.overlay.FADETIME = 350;

  /**
    Called when the overlay is clicked.

    @function backdropClickedCallback
    @memberof Coral.mixin.overlay#
    @protected
  */

  /**
    Triggerred before the component is opened with <code>show()</code> or <code>instance.open = true</code>.

    @event Coral.mixin.overlay#coral-overlay:beforeopen

    @param {Object} event
      Event object.
    @param {Function} event.preventDefault
      Call to stop the overlay from opening.
  */

  /**
    Triggerred after the overlay is opened with <code>show()</code> or <code>instance.open = true</code>

    @event Coral.mixin.overlay#coral-overlay:open

    @param {Object} event
      Event object.
  */

  /**
    Triggerred before the component is closed with <code>hide()</code> or <code>instance.open = false</code>.

    @event Coral.mixin.overlay#coral-overlay:beforeclose

    @param {Object} event
      Event object.
    @param {Function} event.preventDefault
      Call to stop the overlay from closing.
  */

  /**
    Triggerred after the component is closed with <code>hide()</code> or <code>instance.open = false</code>

    @event Coral.mixin.overlay#coral-overlay:close

    @param {Object} event
      Event object.
  */

  Coral.mixin.overlay.trapFocus = trapFocus;
  Coral.mixin.overlay.returnFocus = returnFocus;
  Coral.mixin.overlay.focusOnShow = focusOnShow;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  function getTagSelector(tag, nativeTag) {
    return nativeTag ? (nativeTag + '[is="' + tag + '"]') : tag;
  }

  var events = function(options) {

    var itemTagName = options.itemTagName;
    var itemBaseTagName = options.itemBaseTagName;
    var itemSelectors = options.itemSelectors || [getTagSelector(itemTagName, itemBaseTagName)];
    var itemSelectorsFlattened = itemSelectors.join(',');

    var events = {};
    events['coral-component:attached ' + itemSelectorsFlattened] = '_onItemAttached';

    return events;
  };

  var properties = function(options) {

    var itemTagName = options.itemTagName;
    var itemBaseTag = options.itemBaseTagName;
    var itemSelectors = options.itemSelectors || [getTagSelector(itemTagName, itemBaseTag)];
    var itemSelectorsFlattened = itemSelectors.join(',');
    var supportMultiple = typeof options.supportMultiple === 'undefined' || options.supportMultiple;
    var containerSelector = options.containerSelector;

    var result = {

      /**
        Returns the first selected item in the selectionList. The value <code>null</code> is returned if no element is
        selected.

        @type {HTMLElement}
        @readonly
        @memberof Coral.mixin.selectionList#
      */
      'selectedItem': {
        get: function() {
          if (this.multiple) {
            // Return the first item when in multiple mode:
            return this.items.getFirstSelected();
          }
          else {
            // Return the last item when in single selection mode:
            return this.items.getLastSelected();
          }
        },
        set: function() {
          // Read-only
        }
      },

      /**
        Returns an Array containing the set selected items.

        @type {Array.<HTMLElement>}
        @readonly
        @memberof Coral.mixin.selectionList#
      */
      'selectedItems': {
        get: function() {
          return this.items.getSelected();
        },
        set: function() {
          // Read-only
        }
      },

      /**
        The Collection Interface that allows interacting with the items that the component contains. See
        {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.mixin.selectionList#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {

            var container = this.querySelector(containerSelector);
            var options = {
              itemTagName: itemTagName,
              itemBaseTag: itemBaseTag,
              itemSelector: itemSelectorsFlattened,
              container: container
            };
            this._items = this._constructCollection(options);
          }

          return this._items;
        },
        set: function() {
          // Read-only
        }
      },

      /**
        Whether multiple items can be selected.

        @type {Boolean}
        @default false
        @htmlattribute multiple
        @memberof Coral.mixin.selectionList#
      */
      'multiple': {
        default: false,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.setAttribute('aria-multiselectable', this.multiple);
          this._mutateSelection(function() {
            if (!this.multiple) {
              this.items.deselectAllExceptLast();
            }
          });
        }
      }
    };

    if (!supportMultiple) {
      delete result.selectedItems;
      result.multiple.get = function() {
        return false;
      };
      result.multiple.set = function() {
        // Read-only.
      };
    }

    return result;
  };

  var methods = function(options) {

    var itemTagName = options.itemTagName;
    var itemBaseTag = options.itemBaseTagName;

    var itemSelectors = options.itemSelectors || [getTagSelector(itemTagName, itemBaseTag)];
    var itemSelectorsFlattened = itemSelectors.join(',');

    var role = options.role || 'listbox';
    var tabIndex = options.tabIndex;
    var allowSingleModeDeselect = options.allowSingleModeDeselect;
    var forceSelection = options.forceSelection;

    return {

      /** @private */
      _onItemAttached: function(event) {

        var item = event.target;

        // ':attached' events bubble, so components that hold child components may signal multiple
        // attached events, and lists might be nested. We are only interested in the attachment
        // of list items for which this list is the closest ancestor:
        if (!item.$.is(itemSelectorsFlattened) ||
          !item.$.closest(this.tagName.toLowerCase()).is(this)
        ) {
          return;
        }

        // Listen to the item being detached directly on the item (delegation will not work in this
        // case because the item will be removed from the display list when the event fires). Bind
        // (just once) the listener to the selectionList instance so it can trigger a
        // 'coral-collection:remove' event from there:
        if (!this._boundOnItemDetached) {
          this._boundOnItemDetached = this._onItemDetached.bind(this);
        }
        item.on('coral-component:detached', this._boundOnItemDetached);

        // See if this affects our selection (we might require a selection when an item is available):
        this._validateSelection();

        this.trigger('coral-collection:add', {
          item: item
        });
      },

      /** @private */
      _onItemDetached: function(event) {
        var item = event.target;

        // Ignore events that came bubbling in (see _onItemAttached comments for detail):
        if (item !== event.currentTarget) {
          return;
        }

        // Stop listening to the item being detached:
        item.off('coral-component:detached', this._boundOnItemDetached);

        // We shouldn't let an item be in a selected state when it is not a child of a selectionList otherwise there can
        // be unexpected behavior in polyfilled environments when the selectionList.Item is re-added to a selectionList.
        // See details in selectionList.Item#selected.
        if (item.selected) {
          // since we removed a selected item, we need to make sure our internals are working correctly. we can do it
          // here since the element has already been removed from the DOM.
          this._oldSelection = this._getSelection();

          // we do not allow removed items to be selected
          item.selected = false;

          // The item is off the display list, so delegate 'deselected' events won't reach us at this point. Hence
          // re-validate the selection here:
          this._validateSelection(item);
        }

        this.trigger('coral-collection:remove', {
          item: item
        });
      },

      /**
        This method should be used by host components to indicate that an item has been interacted with. The routine
        decides what's applicable: toggling the items selection state, or to set it to <code>true</code>.

        Depending on the set properties, the list may decide to mutate the state of other items. It does this such that
        only a single ':change' event will be fired.

        @private
      */
      _selectItem: function(item) {

        // We ignore the select if the item is disabled, or if selection
        // is turned off:
        if (item.disabled) {
          return;
        }

        // Depending on the combination of list parameters, the selection of one item may result in the deselection of
        // others. If that's the case we still want the client to recieve only a single change event. By applying the
        // mutations via _mutateSelection, the old selection is compared to the new after all mutations have been
        // applied. If change is detected, a single event gets triggered.
        this._mutateSelection(function() {

          // If we are in multiple mode, or if we support deselection in single select mode, a click means that the
          // selected state of the selected item gets toggled, rather than set to true:
          if (allowSingleModeDeselect || this.multiple) {
            // Toggle the selection of the item:
            item.selected = !item.selected;
          }
          else {
            // Select the clicked item:
            item.selected = true;
          }
        });
      },

      /**
        Invoked by the item when an item's selected property is set to 'true'.

        @private
      */
      _onItemSelected: function(item) {
        this._mutateSelection(function() {
          if (!this.multiple) {
            this.items.deselectAllExcept(item);
          }
        });
      },

      /**
        Invoked by the item when an item's selected property is set to 'false'.

        @private
      */
      _onItemDeselected: function(item) {
        this._mutateSelection(function() {
          this._validateSelection(item);
        });
      },

      /** @ignore */
      _initialize: function() {
        this.setAttribute('role', role);

        if (typeof tabIndex !== 'undefined') {
          this.setAttribute('tabindex', tabIndex);
        }

        // makes sure that the initial selection is valid. Setting this in the initialize instead of waiting for the
        // itemAttached callback avoids triggering a change event for the initial state
        this._validateSelection();

        // we keep a list of the last selection to determine if something changed. we need to do this after
        // validateSelection since it modifies the initial state based on the option
        this._oldSelection = this._getSelection();
      },

      /** @ignore */
      attachedCallback: function() {
        if (!this.multiple) {
          // Under single-selection mode, deselect all but the selected item that comes last.
          this.items.deselectAllExceptLast();
        }
      },

      /**
        Provide a way for hosts to construct a custom Collection by overriding this method.

        @ignore
      */
      _constructCollection: function(options) {
        options.host = this;
        return new Coral.mixin.selectionList.Collection(options);
      },

      /**
        Used to perform item selected state mutations while making sure only a single ':change' event is emitted when
        done. When the routine exits finding the mutation counter to be zero, it will compare the selection as it found
        it when starting the mutations with the selection when it was done. When there's a diff, the ':change' event is
        fired.

        Works nested if need be.

        @param {Function} mutationsCallback
          function that should contain the item selected state mutions. It gets invoked in the scope of the list.

        @ignore
      */
      _mutateSelection: function(mutationsCallback) {
        this._increaseMutationCounter();

        mutationsCallback.call(this);

        this._decreaseMutationCounter();

        if (this._mutatingSelection === 0) {
          var newSelection = this._getSelection();
          if (this._selectionDiffersFromOldSelection(newSelection)) {
            this._onSelectionChange(newSelection, this._oldSelection);
            // changes the old selection array since we selected something new
            this._oldSelection = newSelection;
          }
        }
      },

      /** @ignore */
      _onSelectionChange: function(newSelection, oldSelection) {
        this.trigger(this.tagName.toLowerCase() + ':change', {
          oldSelection: oldSelection,
          selection: newSelection
        });
      },

      /** @ignore */
      _selectionDiffersFromOldSelection: function(selection) {
        // When both the new and the old selection resolve as empty, do not signal change:
        if (this._isEmptySelection(selection) && this._isEmptySelection(this._oldSelection)) {
          return false;
        }

        // Assess if the new selection differs from the current:
        var oldIsArray = $.isArray(this._oldSelection);
        var newIsArray = $.isArray(selection);
        if (!oldIsArray && !newIsArray) {
          return selection !== this._oldSelection;
        }
        else if (oldIsArray && newIsArray) {
          return this._oldSelection.length !== selection.length || $(this._oldSelection).not(selection).length !== 0;
        }
        else {
          return true;
        }
      },

      /** @ignore */
      _isEmptySelection: function(selection) {
        return selection === null || typeof selection === 'undefined' || selection.length === 0;
      },

      /** @ignore */
      _getSelection: function() {
        return this.multiple ? this.selectedItems : this.selectedItem;
      },

      /**
        When <code>forceSelection</code> is <code>true</code>, it makes sure that at at least one item is selected.

        @private
      */
      _validateSelection: function(deselectedItem) {
        if (forceSelection) {
          // gets the current selection
          var selection = this.items.getSelected();

          // if no item is currently selected, we need to find a candidate
          if (selection.length === 0) {
            // gets the first candidate for selection
            var selectable = this.items.getNextSelectable(deselectedItem);

            if (selectable) {
              // selects using the attribute in case the item is not yet initialized
              selectable.setAttribute('selected', true);
            }
          }
        }
      },

      _increaseMutationCounter: function() {
        if (typeof this._mutatingSelection === 'undefined') {
          this._mutatingSelection = 1;
        }
        else {
          this._mutatingSelection++;
        }
      },

      _decreaseMutationCounter: function() {
        this._mutatingSelection--;
      }
    };
  };

  /**
    The <code>selectionList</code> mixin adds support for items and their selection to the host component.

    @mixin

    @param {String} mixinOptions.itemTagName
      Defines the type of tag that the list should construct on being passed a configuration object to its
      <code>add</code> method.
    @param {String} [mixinOptions.itemBaseTagName]
      Defines the base type of tag that the list should construct on being passed a configuration object to its
      <code>add</code> method. Specify this option when <code>itemTagName</code> refers to a component that inherits a
      native element.
    @param {Array.<String>} [mixinOptions.itemSelectors]
      The set of selectors that the list uses to fetch all of its children. When unspecified the list creates a selector
      based on the itemTagName and itemBaseTagName.
    @param {String} [mixinOptions.role=listbox]
      Value for the <code>role</code> attribute on the host component.
    @param {Number} [mixinOptions.tabIndex=undefined]
      When defined, adds a <code>tabindex</code> attribute with the to given value to the host component.
    @param {Boolean} [mixinOptions.allowSingleModeDeselect=false]
      When <code>true</code>, clicking a selected item in single select mode will cause it to be unselected.
    @param {Boolean} [mixinOptions.supportMultiple=true]
      When <code>false</code>, the host will not get the <code>selectedItems</code> mixed in, and its
      <code>multiple</code> property will be read-only, set to <code>false</code>.
    @param {Boolean} [mixinOptions.forceSelection=false]
      When <code>true</code>, the host component will enforce at least a single item to be selected, if available.
    @param {String} [mixinOptions.containerSelector]
      Defines where the new items will be added when <code>add</code> method is called.
      Specify this option when items should not be direct children of the host component but should be wrapped instead.
  */
  Coral.mixin.selectionList = function(mixinOptions) {

    return function(prototype, options) {

      // Add methods:
      Coral.commons.augment(prototype, methods(mixinOptions), function(objectMethod, mixinMethod, prop) {
        return Coral.commons.callAll(mixinMethod, objectMethod);
      });

      // Define events, letting the object override the mixin:
      prototype._events = Coral.commons.augment({}, prototype._events, events(mixinOptions));

      // Augment props:
      Coral.register.augmentProperties(options.properties, properties(mixinOptions));
    };
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  function getTagSelector(tag, nativeTag) {
    return nativeTag ? (nativeTag + '[is="' + tag + '"]') : tag;
  }

  /**
    The default Collection as used by 'selectionList'.

    @param options.host {HTMLElement}
      The element that hosts the collection
    @param options.itemTagName {String}
      The tag name of the elements that constitute a collection item.
    @param options.itemBaseTag {String}
      The optional base tag name of the elements that constitute a collection item. This is required for elements that
      extend native elements, like Button.
    @param options.itemSelector {String}
      Optional, derived from itemTagName and itemBaseTag by default. Used to query the host element for its collection
      items.
    @param options.container {HTMLElement}
      Optional element that wraps the collection.
      Defines where the new items will be added when <code>add</code> method is called.
      Is the same as options.host by default.

    @constructor
    @ignore
   */
  var Collection = function(options) {
    this._host = options.host;
    this.$host = this._host.$;
    this._itemTagName = options.itemTagName;
    this._itemBaseTag = options.itemBaseTag;
    this._itemSelector = options.itemSelector || getTagSelector(this._itemTagName, this._itemBaseTag);
    this._nonNestedItemSelector = this._host.tagName.toLowerCase() + ' ' + this._itemSelector;

    // container where the new items are added
    this._container = options.container || this._host;
  };

  // Assigns the prototype to get access to the Collection signature methods:
  Collection.prototype = Object.create(Coral.Collection.prototype);

  // Create a new element from a given configuration object:
  Collection.prototype.createElement = function(itemTagName, itemBaseTag) {
    return itemBaseTag ? document.createElement(itemBaseTag, itemTagName) : document.createElement(itemTagName);
  };

  Collection.prototype.add = function(item, before) {
    var config;
    if (!(item instanceof HTMLElement)) {
      // Creates a new item and initializes its values:
      config = item;
      item = this.createElement(this._itemTagName, this._itemBaseTag, item);
    }

    // Configurate the item, but don't apply selection yet (for we do not allow this before
    // the item is attached).
    var selected = config && config.selected;
    if (config) {
      delete config.selected;
      // Silently apply the settings:
      item.set(config, true);
    }

    // 'insertBefore' with an undefined "before" argument fails on IE9.
    this._container.insertBefore(item, before || null);

    // Now apply the selected state, non-silently, so that the host will be informed of this
    // item being added selected:
    if (selected) {
      item.selected = selected;
    }

    return item;
  };

  Collection.prototype.getAll = function() {
    return this._getNonNestedItems().toArray();
  };

  Collection.prototype.getNextSelectable = function(item, wrap) {
    var items = this._getSelectableItems();
    // it will produce '0' if the item is not inside
    var index = items.index(item);

    // in case the item is not specified, we need to return the first selectable item, hence the 0
    var targetIndex = !item ? 0 : index + 1;

    if (wrap) {
      return items.eq(targetIndex % items.length).get(0) || null;
    }
    else {
      // if we already know that the item is the last item we can simply return it, instead of querrying the DOM again.
      // we just need to make sure that the collection is not empty
      return (targetIndex === items.length && targetIndex !== 0) ? item : (items.eq(targetIndex).get(0) || null);
    }
  };

  Collection.prototype.getPreviousSelectable = function(item, wrap) {
    var items = this._getSelectableItems();
    // it will produce '0' if the item is not inside
    var index = items.index(item);

    // in case the item is not specified, or it is not inside the collection, we need to return the first selectable
    // item, hence the 0.
    var targetIndex = (!item || index === -1) ? 0 : index - 1;

    if (wrap) {
      return items.eq(targetIndex).get(0) || null;
    }
    else {
      return targetIndex === -1 ? item : (items.eq(targetIndex).get(0) || null);
    }
  };

  Collection.prototype.getFirstSelectable = function() {
    return this._getSelectableItems().first().get(0) || null;
  };

  Collection.prototype.getLastSelectable = function() {
    return this._getSelectableItems().last().get(0) || null;
  };

  Collection.prototype.getSelected = function() {
    return this._getSelectedItems().toArray();
  };

  Collection.prototype.getFirstSelected = function() {
    return this._getSelectedItems().first().get(0) || null;
  };

  Collection.prototype.getLastSelected = function() {
    return this._getSelectedItems().last().get(0) || null;
  };

  /*
    The deselection routines below are not using jQuery "removeAttr" because it does not work correctly on elements that
    have not yet been upgraded. More detail at:

    https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=CUI&title=Gotchas
   */
  Collection.prototype.deselectAll = function() {
    this
      ._getNonNestedItems()
      .filter('[selected]')
      .each(function() {
        this.removeAttribute('selected');
      });
  };

  Collection.prototype.deselectAllExcept = function(item) {
    this
      ._getNonNestedItems()
      .filter('[selected]')
      .each(function() {
        if (this !== item) {
          this.removeAttribute('selected');
        }
      });
  };

  Collection.prototype.deselectAllExceptLast = function() {
    this
      ._getNonNestedItems()
      .filter('[selected]:not(:last)')
      .each(function() {
        this.removeAttribute('selected');
      });
  };

  /*
    Internal
  */

  /**
    Gets a list of all non nested child items.

    @private

    @returns {jQuery} items.
  */
  Collection.prototype._getNonNestedItems = function() {
    return this.$host.find(this._itemSelector).not(this.$host.find(this._nonNestedItemSelector));
  };

  /**
    Gets a list of all selectable items. For an item to be selectable it cannot be disabled or hidden.

    @private

    @returns {jQuery} items.
  */
  Collection.prototype._getSelectableItems = function() {
    return this._getNonNestedItems().filter(':not([disabled],[hidden])');
  };

  /**
    Gets a list of all selected items. A selected item can be hidden.

    @private

    @returns {jQuery} items.
  */
  Collection.prototype._getSelectedItems = function() {
    return this._getNonNestedItems().filter('[selected]:not([disabled])');
  };

  /**
    The default Collection as used by 'selectionList'.
    @class
    @extends Coral.Collection
    @ignore
  */
  Coral.mixin.selectionList.Collection = Collection;
})();

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var properties = function(options) {

    var alwaysEnabled = options.alwaysEnabled;

    var properties = {

      /**
        Whether the item is selected. Selected cannot be set to <code>true</code> if the item is disabled.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.mixin.selectionList.Item#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        validate: [
          Coral.validate.valueMustChange,
          function(value) {
            return !value || !this.disabled;
          }
        ],
        trigger: function(newValue, oldValue) {
          // Although we're not dispatching an event, we do use the 'trigger' property because
          // we do not want to invoke the callback on first change (and since the initial value
          // is set 'silently', invoking the callback from here will achieve just that).
          var list = this._getSelectionList();
          if (list) {
            var callback = newValue ? list._onItemSelected : list._onItemDeselected;
            if ($.isFunction(callback)) {
              callback.call(list, this);
            }
          }
          // No event, no prevent-default:
          return false;
        },
        set: function(value, silent) {
          // We prevent a selectListItem from being selected before being added as a child in order
          // to prevent race condition issues like the one below in polyfilled environments:
          //
          // item1.selected = true;
          // el.appendChild(item1);
          // el.appendChild(item2);
          // el.appendChild(item3);
          //
          // item2.selected = true;
          // console.log(el.selectedItem); // item2
          // Coral.commons.nextFrame(function() {
          //   console.log(el.selectedItem); // item1 (though user would expect item2)
          //   done();
          // });
          var list = this._getSelectionList();
          if (value && !list) {
            throw new Error(this + ' cannot be selected before being added as a child.');
          }

          this._selected = value;
        },
        sync: function() {
          this.$.toggleClass('is-selected', this.selected)
            .attr('aria-selected', this.selected);
        }
      },

      /**
        Whether this item is disabled. When set to <code>true</code>, this will prevent every user interaction with the
        item. If disabled is set to <code>true</code> for a selected item it will be deselected.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.mixin.selectionList.Item#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value, silent) {
          this._disabled = value;

          if (this.selected && value) {
            this.selected = false;
          }
        },
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled)
            .attr('aria-disabled', this.disabled);
        }
      }

    };

    if (alwaysEnabled) {
      delete properties.disabled;
    }

    return properties;
  };

  var methods = function(options) {

    var role = options.role || 'option';
    var tabIndex = options.tabIndex;
    var listSelector = options.listSelector;

    return {
      /** @ignore */
      _initialize: function() {
        this.setAttribute('role', role);
        if (typeof tabIndex !== 'undefined') {
          this.setAttribute('tabindex', tabIndex);
        }
      },

      /** @private */
      _getSelectionList: function() {
        return this.$.closest(listSelector).get(0);
      }

    };
  };

  /**
    The <code>selectionList.Item</code> mixes in features that are expected to be present on child elements of
    components that mixin <code>selectionList</code>.

    @mixin

    @param {String} mixinOptions.listSelector
      Used to allow the item to obtain a reference to its <code>selectionList</code> implementing ancestor.
    @param {String} [mixinOptions.role=option]
      Value for the <code>role</code> attribute on the host component.
    @param {Number} [mixinOptions.tabIndex=undefined]
      When defined, ads a <code>tabindex</code> attribute with the to given value to the host component.
    @param {Boolean} [mixinOptions.alwaysEnabled=undefined]
      When <code>true</code>, the <code>disabled</code> property will not be added to the host component.
  */
  Coral.mixin.selectionList.Item = function(mixinOptions) {
    return function(prototype, options) {

      // Add methods:
      Coral.commons.augment(prototype, methods(mixinOptions), function(objectMethod, mixinMethod, prop) {
        return Coral.commons.callAll(mixinMethod, objectMethod);
      });

      // Augment props:
      Coral.register.augmentProperties(options.properties, properties(mixinOptions));
    };
  };
})();

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
  var LABELLABLE_ELEMENTS_SELECTOR = 'button,input:not([type=hidden]),keygen,meter,output,progress,select,textarea';

  var properties = {
    /**
      Whether this field is disabled or not.

      @type {Boolean}
      @default false
      @htmlattribute disabled
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'disabled': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-disabled', this.disabled);
      }
    },

    /**
      Whether the current value of this field is invalid or not.

      @type {Boolean}
      @default false
      @htmlattribute invalid
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'invalid': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-invalid', this.invalid);
      }
    },

    /**
      Name used to submit the data in a form.

      @type {String}
      @default ""
      @htmlattribute name
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'name': {
      default: '',
      reflectAttribute: true,
      transform: Coral.transform.string
    },

    /**
      Whether this field is readOnly or not. Indicating that the user cannot modify the value of the control.
      This is ignored for checkbox, radio or fileupload.

      @type {Boolean}
      @default false
      @htmlattribute readonly
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'readOnly': {
      default: false,
      reflectAttribute: true,
      attribute: 'readonly',
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-readonly', this.readOnly);
      }
    },

    /**
      Whether this field is required or not.

      @type {Boolean}
      @default false
      @htmlattribute required
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'required': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-required', this.required);
      }
    },

    /**
      This field's current value.

      @type {String}
      @default ""
      @htmlattribute value
      @memberof Coral.mixin.formField#

      @fires Coral.mixin.formField#change
    */
    'value': {
      default: '',
      transform: Coral.transform.string
    },

    /**
      Reference to a space delimited set of ids for the HTML elements that provide a label for the formField.
      Implementers should override this method to ensure that the appropriate descendant elements are labelled using the
      <code>aria-labelledby</code> attribute. This will ensure that the component is properly identified for
      accessibility purposes. It reflects the <code>aria-labelledby</code> attribute to the DOM.

      @type {?String}
      @default null
      @htmlattribute labelledby
      @memberof Coral.mixin.formField#
    */
    'labelledBy': {
      attribute: 'labelledby',
      transform: Coral.transform.string,
      get: function() {
        return this._getLabellableElement().getAttribute('aria-labelledby');
      },
      set: function(value) {
        // gets the element that will get the label assigned. the _getLabellableElement method should be overriden to
        // allow other bevaviors.
        var element = this._getLabellableElement();
        // we get and assign the it that will be passed around
        var elementId = element.id = element.id || Coral.commons.getUID();

        var currentLabelledBy = element.getAttribute('aria-labelledby');

        // we clear the old label asignments
        if (currentLabelledBy && currentLabelledBy !== value) {
          this._updateForAttributes(currentLabelledBy, elementId, true);
        }

        if (value) {
          element.setAttribute('aria-labelledby', value);
          if ($(element).is(LABELLABLE_ELEMENTS_SELECTOR)) {
            this._updateForAttributes(value, elementId);
          }
        }
        else {
          // since no labelledby value was set, we remove everything
          element.removeAttribute('aria-labelledby');
        }
      }
    }
  };

  // Methods to add
  var methods = {
    /**
      Gets the element that should get the label. In case none of the valid labelelable items are found, the component
      will be labelled instead.

      @protected
      @memberof Coral.mixin.formField#

      @returns {HTMLElement} the labellable element.
    */
    _getLabellableElement: function() {
      var element = this.querySelector(LABELLABLE_ELEMENTS_SELECTOR);

      // Use the found element or the container
      return element || this;
    },

    /**
      @protected
      @memberof Coral.mixin.formField#
    */
    _onInputChange: function(event) {
      // stops the current event
      event.stopPropagation();

      this[this._componentTargetProperty] = event.target[this._eventTargetProperty];

      // Explicitly re-emit the change event after the property has been set
      if (this._triggerChangeEvent) {
        this.trigger('change');
      }
    },

    /**
      Resets the formField when a reset is triggered on the parent form.

      @protected
      @memberof Coral.mixin.formField#
    */
    _onFormReset: function(event) {
      if (event.target.contains(this)) {
        this.reset();
      }
    },

    /**
      A utility method for adding the appropriate <code>for</code> attribute to any <code>label</code> elements
      referenced by the <code>labelledBy</code> property value.

      @param {String} labelledBy
        The value of the <code>labelledBy<code> property providing a space-delimited list of the <code>id</code>
        attributes for elements that label the formField.
      @param {String} elementId
        The <code>id</code> of the formField or one of its descendants that should be labelled by
        <code>label</code> elements referenced by the <code>labelledBy</code> property value.
      @param {Boolean} remove
        Whether the existing <code>for</code> attributes should be removed.

      @protected
      @memberof Coral.mixin.formField#
    */
    _updateForAttributes: function(labelledBy, elementId, remove) {
      // labelledby contains whitespace sparated items, so we need to separate each individual id
      var labelIds = labelledBy.split(/\s+/);
      // we update the 'for' attribute for every id.
      labelIds.forEach(function(currentValue) {
        var labelElement = document.getElementById(currentValue);
        if (labelElement && labelElement.tagName === 'LABEL') {
          var forAttribute = labelElement.getAttribute('for');

          if (remove) {
            // we just remove it when it is our target
            if (forAttribute === elementId) {
              labelElement.removeAttribute('for');
            }
          }
          else {
            // if we do not have to remove, it does not matter the current value of the label, we can set it in every
            // case
            labelElement.setAttribute('for', elementId);
          }
        }
      });
    },

    /**
      Clears the <code>value</code> of formField to the default value.
    */
    clear: function() {
      this.value = '';
    },

    /**
      Resets the <code>value</code> to the initial value.
    */
    reset: function() {

    }
  };

  // Events to add
  var events = {
    'capture:change input': '_onInputChange',
    'global:reset': '_onFormReset'
  };

  // The properties whose set/get methods must be implemented by the component we're mixed into
  var requiredPropertySet = [
    'name',
    'value'
  ];

  // Props we should not add if we inhert from HTMLInputElement
  var defaultProps = [
    'disabled',
    'name',
    'required',
    'readOnly',
    'value'
  ];

  // Basic properties to add to the prototype
  var basicProperties = {
    /**
      Target property inside the component that will be updated when a change event is triggered.

      @type {String}
      @default "value"
      @protected
      @memberof Coral.mixin.formField#
    */
    _componentTargetProperty: 'value',

    /**
      Target property that will be taken from <code>event.target</code> and set into
      {@link Coral.mixin.formField#_componentTargetProperty} when a change event is triggered.

      @type {String}
      @default "value"
      @protected
      @memberof Coral.mixin.formField#
    */
    _eventTargetProperty: 'value',


    /**
      Whether the change event needs to be triggered when {@link Coral.mixin.formField#_onInputChange} is called.

      @type {Boolean}
      @default true
      @protected
      @memberof Coral.mixin.formField#
    */
    _triggerChangeEvent: true
  };

  /**
    Configure a component to have the basic properties that are expected inside a form.

    @class
  */
  Coral.mixin.formField = function(prototype, options) {
    // Add methods
    Coral.commons.augment(prototype, methods, function(objectMethod, mixinMethod, propName) {
      // Use the provided methods if overridden
      if (propName === 'reset' || propName === 'clear' || propName === '_onInputChange' || propName === '_getLabellableElement') {
        return objectMethod;
      }
      return Coral.commons.callAll(mixinMethod, objectMethod);
    });

    // Define events, letting the object override the mixin
    prototype._events = Coral.commons.augment({}, prototype._events, events);

    // Define basic properties, letting the object override the mixin
    Coral.commons.augment(prototype, basicProperties);

    // Only try to include properties that are not defined in this or any parent prototype
    var targetProperties = {};
    var prop;

    // Check if the prototype inherits from HTMLInputElement
    var skipDefaultProps = false;
    var curProto = prototype;
    while (curProto) {
      if (curProto === HTMLInputElement.prototype || curProto === HTMLTextAreaElement.prototype) {
        skipDefaultProps = true;
        break;
      }
      curProto = Object.getPrototypeOf(curProto);
    }

    for (prop in properties) {
      // Skip properties implemented by HTMLInputElement if necessary
      if (skipDefaultProps && defaultProps.indexOf(prop) !== -1) {
        continue;
      }
      targetProperties[prop] = properties[prop];
    }

    // Property sync is not reinforced if they were not added
    if (!skipDefaultProps) {
      // Throw if required set methods are not implemented
      requiredPropertySet.forEach(function(propName) {
        if (!targetProperties[propName]) {
          // Do not complain if it is already implemented
          return;
        }

        if (
          !options.properties[propName] ||
          typeof options.properties[propName].set !== 'function' ||
          typeof options.properties[propName].get !== 'function'
        ) {
          throw new Error('Coral.mixin.formField: You must implement properties.' + propName +
            '.set() and properties.' + propName + '.get()');
        }
      });
    }

    // Augment property descriptors
    Coral.register.augmentProperties(options.properties, targetProperties);
  };

  /**
    Triggered when the value has changed. This event is only triggered by user interaction.

    @event Coral.mixin.formField#change

    @param {Object} event
      Event object.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Regex used to remove the modifier classes. Size related classes are not matched this regex.

    @ignore
  */
  var ICON_REGEX = /[\s?]coral-Icon--(?!size(XXS|XS|S|M|L))\w+/g;

  /**
    Regex used to match URLs. Assume it's a URL if it has a slash, colon, or dot.

    @ignore
  */
  var URL_REGEX = /\/|:|\./g;

  /**
    Regex used to split camel case icon names into more screen-reader friendly alt text.

    @ignore
  */
  var SPLIT_CAMELCASE_REGEX = /([a-z0-9])([A-Z])/g;

  /**
    Icons can be rendered in different sizes. It follows the shirt sizing naming convention to help you remember them
    easily.

    @enum {String}
    @memberof Coral.Icon
  */
  var size = {
    /** Extra extra small size icon, typically 9px size. */
    EXTRA_EXTRA_SMALL: 'XXS',
    /** Extra small size icon, typically 12px size. */
    EXTRA_SMALL: 'XS',
    /** Small size icon, typically 18px size. This is the default size. */
    SMALL: 'S',
    /** Medium size icon, typically 24px size. */
    MEDIUM: 'M',
    /** Large icon, typically 36px size. */
    LARGE: 'L',
    /** Extra large icon, typically 48px size. */
    EXTRA_LARGE: 'XL',
    /** Extra extra large icon, typically 72px size. */
    EXTRA_EXTRA_LARGE: 'XXL'
  };

  // icon's base classname
  var CLASSNAME = 'coral-Icon';

  // builds a string containing all possible size classnames. this will be used to remove classnames when the size
  // changes
  var ALL_SIZE_CLASSES = '';
  for (var sizeValue in size) {
    ALL_SIZE_CLASSES += CLASSNAME + '--size' + size[sizeValue] + ' ';
  }

  Coral.register( /** lends Coral.Icon# */ {
    /**
      @class Coral.Icon
      @classdesc An Icon component
      @extends Coral.Component
      @htmltag coral-icon
    */
    name: 'Icon',
    tagName: 'coral-icon',
    className: CLASSNAME,

    properties: {
      /**
        Icon name accordion to the CloudUI Icon sheet.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'icon': {
        default: '',
        reflectAttribute: true,
        transform: Coral.transform.string,
        sync: function() {
          // removes the old class.
          this.className = this.className.replace(ICON_REGEX, '').trim();

          // sets the desired icon
          if (this.icon) {
            // Detect if it's a URL
            if (this.icon.match(URL_REGEX)) {
              // Note that we're an image so we hide the font-related goodies
              this.$.addClass('is-image');

              // Create an image and add it to the icon
              var img = this._elements.image = this._elements.image || document.createElement('img');
              img.className = this._className + '-image';
              img.src = this.icon;
              this.appendChild(img);
            }
            else {
              if (this._elements.image && this._elements.image.parentNode === this) {
                // Remove image related stuff
                this.removeChild(this._elements.image);
                this.$.removeClass('is-image');
              }
              this.$.addClass(this._className + '--' + this._icon);
            }
          }
        },
        alsoSync: 'alt'
      },

      /**
        Size of the icon. It accepts both lower and upper case sizes.

        @type {Coral.Icon.size}
        @default Coral.Icon.size.SMALL
        @htmlattribute size
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'size': {
        default: size.SMALL,
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          // removes all the existing sizes
          this.$.removeClass(ALL_SIZE_CLASSES);
          // adds the new size
          this.$.addClass(this._className + '--size' + this.size);
        }
      },

      /**
        Alternative text to identify the icon for accessibility.
        <p>When no <code>alt</code> attribute is provided, the icon will fallback to using either the <code>title</code> attribute or icon name as alternative text for accessibility. However, by explicitly setting the <code>alt</code> attribute to an empty string in markup or by using the <code>setAttribute</code> method, one can override the default behavior to avoid redundancy or to indicate that the icon is purely decorative in elements like labelled icon buttons.</p>

        @type {String}
        @htmlattribute alt
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'alt': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function () {
          return this._alt || '';
        },
        sync: function () {
          this._updateAltText();
        }
      }
    },

    /**
      Updates the aria-label or img alt attribute depending on value of alt, title or icon.
      @protected
    */
    _updateAltText: function() {
      var isImage = this.$.hasClass('is-image');

      // If alt has explicitly been set to null, remove all attributes
      if (!this._alt) {
        this.removeAttribute('aria-label');
        if (isImage) {
          this._elements.image.setAttribute('alt', '');
        }
      }

      // Fall back to the title attribute, then the icon name
      var altText = !!this._alt || this.hasAttribute('alt') ? this.alt : this.getAttribute('title') || (isImage ? '' : this.icon.replace(SPLIT_CAMELCASE_REGEX, '$1 $2').toLowerCase());

      // If no other role has been set, provide the appropriate
      // role depending on whether or not the icon is an arbitrary image URL.
      var role = this.getAttribute('role');
      var roleOverride = (role && (role !== 'presentation' && role !== 'img'));
      if (!roleOverride) {
        this.setAttribute('role', isImage ? 'presentation' : 'img');
      }

      // Set accessibility attributes accordingly
      if (isImage) {
        this.removeAttribute('aria-label');
        this._elements.image.setAttribute('alt', altText);
      }
      else if (altText === '') {
        this.removeAttribute('aria-label');
        if (!roleOverride) {
          this.removeAttribute('role');
        }
      }
      else {
        this.setAttribute('aria-label', altText);
      }
    },

    /** @ignore */
    _initialize: function() {
      this._queueSync();
    },

    /** @ignore */
    attributeChangedCallback: function(attrName, oldValue, newValue) {
      attrName = attrName.toLowerCase();
      if (attrName === 'title') {
        this._updateAltText();
        return;
      }

      // Call top level attributeChangedCallback, which sets internal property values
      Coral.Component.prototype.attributeChangedCallback.apply(this, arguments);

      // In cases where the alt attribute has been removed or set to an empty string,
      // for example, when the alt property is undefined and we add the attribute alt=''
      // to explicitly override the default behavior, or when we remove an alt attribute
      // thus restoring the default behavior, we make sure to update the alt text.
      if (attrName === 'alt' && (newValue === null || (oldValue === null && newValue === ''))) {
        this._updateAltText();
      }
    }

  });

  // exports the sizes enumeration
  Coral.Icon.size = size;

}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for button variant values.

    @enum {String}
    @memberof Coral.Button
  */
  var variant = {
    /** A default, gray button */
    DEFAULT: 'default',
    /** A blue button that indicates that the button's action is the primary action. */
    PRIMARY: 'primary',
    /** A button with no border or background. */
    QUIET: 'quiet',
    /** A red button that indicates that the button's action is dangerous. */
    WARNING: 'warning',
    /** A minimal button with no background or border. */
    MINIMAL: 'minimal'
  };

  // the button's base classname
  var CLASSNAME = 'coral-Button';

  // builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }

  /**
    Enumeration representing button sizes.

    @memberof Coral.Button
    @enum {String}
  */
  var size = {
    /** A medium button is the default, normal sized button. */
    MEDIUM: 'M',
    /** A large button, which is larger than a medium button. */
    LARGE: 'L'
  };

  Coral.register( /** @lends Coral.Button# */ {
    /**
      @class Coral.Button
      @classdesc A Button component
      @htmltag coral-button
      @htmlbasetag button
      @extends Coral.Component
      @extends HTMLButtonElement
    */
    name: 'Button',
    tagName: 'coral-button',
    baseTagName: 'button',
    extend: HTMLButtonElement,
    className: CLASSNAME,

    properties: {
      /**
        The label of the button.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Button#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-button-label'
      }),

      /**
        Specifies the icon name used inside the button. When the icon is set and no text is available, the button
        automatically changes to be square, in order to accomodate better the icon. See {@link Coral.Icon} for valid
        icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Button#

        @see {@link Coral.Icon}
      */
      'icon': {
        get: function() {
          return this._elements.icon.icon;
        },
        set: function(value) {
          this._elements.icon.icon = value;

          // removes the icon element from the DOM.
          if (this.icon === '') {
            this._elements.icon.remove();
          }
          // adds the icon back since it was blown away by textContent
          else if (!this._elements.icon.parentNode) {
            this.insertBefore(this._elements.icon, this.firstChild);
          }

          this._toggleSquare();
        }
      },

      /**
        Size of the icon. It accepts both lower and upper case sizes.

        @type {Coral.Icon.size}
        @default Coral.Icon.size.SMALL
        @htmlattribute iconsize
        @memberof Coral.Button#

        @see {@link Coral.Icon#size}
      */
      'iconSize': {
        attribute: 'iconsize',
        get: function() {
          return this._elements.icon.size;
        },
        set: function(value) {
          this._elements.icon.size = value;
        }
      },


      /**
        The size of the button. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
        are available.

        @type {Coral.Button.size}
        @default Coral.Button.size.MEDIUM
        @htmlattribute size
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'size': {
        default: size.MEDIUM,
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        set: function(newSize) {
          this._size = newSize;

          this.$[this.size === size.LARGE ? 'addClass' : 'removeClass'](CLASSNAME + '--large');
        }
      },

      /**
        Whether the button is selected.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(selected) {
          this._selected = selected;

          this.$.toggleClass('is-selected', this.selected);
        }
      },

      /**
        Expands the button to the full width of the parent.

        @type {Boolean}
        @default false
        @htmlattribute block
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'block': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(block) {
          this._block = block;

          this.$.toggleClass(this._className + '--block', this.block);
        }
      },

      /**
        The button's variant.

        @type {Coral.Button.variant}
        @default Coral.Button.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Button#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        set: function(variant) {
          this._variant = variant;

          // removes every existing variant
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Button.variant.DEFAULT) {
            this.$.addClass(this._className + '--' + this.variant);
          }
        }
      }
    },

    /**
      Toggles the square modifier. This is added when there is an icon without a label.

      @protected
    */
    _toggleSquare: function() {
      // the square modifier is needed when no label is available
      var hasLabel = this.label.textContent.length > 0;
      var hasIcon = this.icon !== '';
      var isSquare = hasIcon && !hasLabel;
      this.$.toggleClass(this._className + '--square', isSquare);
    },

    /** @ignore */
    attachedCallback: function() {
      // Call top level class' attachedCallback
      Coral.Component.prototype.attachedCallback.call(this);

      // @polyfill IE9
      // We must do this because IE does not catch mutations when nodes are not in the DOM
      this._toggleSquare();
    },

    /** @ignore */
    _initialize: function() {
      // Listen for mutations
      this._observer = new MutationObserver(this._toggleSquare.bind(this));

      // Watch for changes to the label element
      this._observer.observe(this.label, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      // Label
      var label = this._elements.label = this.querySelector('coral-button-label') ||
        document.createElement('coral-button-label');

      // Remove it so we can process children
      if (label.parentNode) {
        this.removeChild(label);
      }

      // Process remaining elements as necessary
      while (this.firstChild) {
        var child = this.firstChild;

        if (child.tagName === 'CORAL-ICON') {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Move anything else into the label
          label.appendChild(child);
        }
      }

      if (!this._elements.icon) {
        // creates the icon. it is not added to the DOM
        this._elements.icon = document.createElement('coral-icon');
      }

      fragment.appendChild(label);
      this.appendChild(fragment);
    }
  });

  Coral.register( /** lends Coral.Button.Label# */ {
    /**
      @class Coral.Button.Label
      @classdesc The Button label content
      @htmltag coral-button-label
      @extends Coral.Component
    */
    name: 'Button.Label',
    tagName: 'coral-button-label',
    className: 'coral-Button-label'
  });

  // exports the variants enumeration
  Coral.Button.variant = variant;
  Coral.Button.size = size;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Key code
  var SPACE = 32;

  Coral.register( /** @lends Coral.AnchorButton# */ {
    /**
      @class Coral.AnchorButton
      @classdesc A Link component rendering as a button.
      @htmltag coral-anchorbutton
      @htmlbasetag a
      @extends Coral.Component
      @extends HTMLAnchorElement
    */
    name: 'AnchorButton',
    tagName: 'coral-anchorbutton',
    baseTagName: 'a',
    extend: HTMLAnchorElement,
    className: Coral.Button.prototype._className,

    events: {
      'keydown': '_onKeyDown',
      'keyup': '_onKeyUp'
    },

    properties: Coral.commons.extend({}, Coral.Button.prototype._properties, {

      /**
        Disables the button from user interaction.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.AnchorButton#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled)
            .attr('tabindex', this.disabled ? '-1' : '0')
            .attr('aria-disabled', this.disabled);
        }
      }
    }),

    // since we do not properly extend Coral.Button we need to copy some private methods
    _toggleSquare: Coral.Button.prototype._toggleSquare,

    /**
      Keyboard handling per the WAI-ARIA button widget design pattern:
      https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

      @ignore
    */
    _onKeyDown: function(event) {
      if (event.keyCode === SPACE) {
        event.preventDefault();
        this.click();
        this.$.addClass('is-selected');
      }
    },

    /** @ignore */
    _onKeyUp: function(event) {
      if (event.keyCode === SPACE) {
        event.preventDefault();
        this.$.removeClass('is-selected');
      }
    },

    /** @ignore */
    _onClick: function(event) {
      if (this.disabled) {
        event.preventDefault();
      }
    },

    /**
      Initializes the AnchorButton. It adds the required accessibility features for it to behave like a button.

      @ignore
    */
    _initialize: function() {
      Coral.Button.prototype._initialize.call(this);
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      // cannot use the events hash because events on disabled items are not reported
      this.addEventListener('click', this._onClick.bind(this));
    },

    /** @ignore */
    _render: function() {

      var fragment = document.createDocumentFragment();

      // Label
      var label = this._elements.label = this.querySelector('coral-anchorbutton-label') ||
        document.createElement('coral-anchorbutton-label');

      // Move any remaining elements into the label
      while (this.firstChild) {
        var child = this.firstChild;

        if (child.nodeType === Node.TEXT_NODE) {
          // Move text elements to the label
          label.appendChild(child);
        }
        else if (child.tagName === 'CORAL-ICON') {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Remove anything else
          this.removeChild(child);
        }
      }

      if (!this._elements.icon) {
        // creates the icon. it is not added to the DOM
        this._elements.icon = document.createElement('coral-icon');
      }

      fragment.appendChild(label);
      this.appendChild(fragment);
    }
  });

  Coral.register( /** lends Coral.AnchorButton.Label# */ {
    /**
      @class Coral.AnchorButton.Label
      @classdesc The Button label content
      @htmltag coral-button-label
      @extends Coral.Component
    */
    name: 'AnchorButton.Label',
    tagName: 'coral-anchorbutton-label',
    className: 'coral-Button-label'
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var ButtonGroupCollection = function(options) {
    this._host = options.host;
    this.$host = this._host.$;
    this._itemTagName = options.itemTagName;
    this._itemBaseTag = options.itemBaseTag;
    this._itemSelector = this._itemBaseTag + '[is="' + this._itemTagName + '"]';
  };

  ButtonGroupCollection.prototype = Object.create(Coral.Collection.prototype);

  ButtonGroupCollection.prototype.add = function(item, before) {
    var config;
    if (!(item instanceof HTMLElement)) {
      config = item;
      // creates a new item
      item = document.createElement(this._itemBaseTag, this._itemTagName);
    }

    // configures the item but does not apply the selection
    var selected = config && config.selected;
    if (config) {
      delete config.selected;
      // Silently apply the settings
      item.set(config, true);
    }

    // 'insertBefore' with an undefined "before" argument fails on IE9
    // @polyfill IE9
    this._host.insertBefore(item, before || null);

    // sets the selected state
    if (selected) {
      item.setAttribute('selected', true);
    }

    return item;
  };

  ButtonGroupCollection.prototype.getAll = function() {
    return this._getAllItems().toArray();
  };

  /** @private */
  ButtonGroupCollection.prototype._getAllItems = function() {
    return this.$host.children(this._itemSelector);
  };

  /** @private */
  ButtonGroupCollection.prototype._getSelectedItems = function() {
    return this._getAllItems().filter('[selected]:not([disabled])').toArray();
  };

  /** @private */
  ButtonGroupCollection.prototype._getSelectableItems = function() {
    return this._getAllItems().filter(':not([disabled],[hidden])').toArray();
  };

  /**
    Enumeration representing buttongroup selection modes.

    @memberof Coral.ButtonGroup
    @enum {String}
   */
  var selectionMode = {
    /** None is default, selection of buttons doesn't happen based on click */
    NONE: 'none',
    /** Single selection mode, button group behaves like radio input elements */
    SINGLE: 'single',
    /** Multiple selection mode, button group behaves like checkbox input elements */
    MULTIPLE: 'multiple'
  };

  Coral.register( /** @lends Coral.ButtonGroup# */ {
    /**
      @class Coral.ButtonGroup
      @classdesc A ButtonGroup component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-buttongroup
    */
    name: 'ButtonGroup',
    tagName: 'coral-buttongroup',
    className: 'coral-ButtonGroup',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'coral-component:attached button[is="coral-button"]': '_onItemAttached',

      'click button[is="coral-button"]': '_onButtonClick'
    },

    properties: {

      /**
        The Collection Interface that allows interacting with the items that the component contains. See
        {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.ButtonGroup#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new ButtonGroupCollection({
              host: this,
              itemBaseTag: 'button',
              itemTagName: 'coral-button'
            });
          }

          return this._items;
        },
        set: function() {
          // Read-only
        }
      },

      /**
        Selection mode of Button group

        @type {String}
        @default Coral.ButtonGroup.selectionMode.NONE
        @htmlattribute selectionmode
        @memberof Coral.ButtonGroup#
      */
      'selectionMode': {
        default: selectionMode.NONE,
        attribute: 'selectionmode',
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(selectionMode)
        ],
        set: function(value) {
          this._selectionMode = value;
          // update select element if multiple
          // this is required while appplying default selection
          // if selection mode is single first elem gets selected but for multiple its not
          this._elements.nativeSelect.multiple = this._selectionMode === selectionMode.MULTIPLE;
        },
        sync: function() {
          if (this.selectionMode === selectionMode.SINGLE) {
            this.setAttribute('role', 'radiogroup');

            // makes sure the internal options are properly initialized
            this._syncItemOptions();

            // we make sure the selection is valid by explicitely finding a candidate or making sure just 1 item is
            // selected
            this._validateSelection();
          }
          else if (this.selectionMode === selectionMode.MULTIPLE) {
            this.setAttribute('role', 'group');

            // makes sure the internal options are properly initialized
            this._syncItemOptions();
          }
          else {
            this.setAttribute('role', 'group');

            this._removeItemOptions();
          }
        }
      },

      // JSDoc inherited
      'name': {
        get: function(value) {
          return this._elements.nativeSelect.name;
        },
        set: function(value) {
          this._elements.nativeSelect.name = value;
        }
      },

      // JSDoc inherited
      'value': {
        get: function() {
          return this._elements.nativeSelect.value;
        },
        set: function(value) {
          if (this.selectionMode === selectionMode.NONE) {
            return;
          }

          // we proceed to select the provided value
          this._selectItemByValue([value]);
        }
      },

      /**
        Returns an Array containing the selected buttons.

        @type {Array.<HTMLElement>}
        @readonly
        @memberof Coral.ButtonGroup#
      */
      'selectedItems': {
        get: function() {
          return this.items._getSelectedItems();
        },
        set: function() {
          // Read-only
        }
      },

      /**
        Returns the first selected button in the Button Group. The value <code>null</code> is returned if no button is
        selected.

        @type {HTMLElement}
        @readonly
        @memberof Coral.ButtonGroup#
      */
      'selectedItem': {
        get: function() {
          return this.selectedItems[0] || null;
        },
        set: function() {
          // Read-only
        }
      },

      /**
        Current selected values as submitted during form submission.

        @type {Array.<String>}
        @memberof Coral.ButtonGroup#
      */
      'values': {
        attribute: null,
        validate: [
          Coral.validate.valueMustChange,
          function(values) {
            return Array.isArray(values);
          }
        ],
        set: function(values) {
          if (this.selectionMode === selectionMode.NONE) {
            return;
          }

          // just keeps the first value if selectionMode is not multile
          if (this.selectionMode !== selectionMode.MULTIPLE && values.length > 1) {
            values = [values[0]];
          }

          // we proceed to select the provided values
          this._selectItemByValue(values);
        },
        get: function() {
          var values = [];

          // uses the nativeSelect since it holds the truth of what will be submitted with the form
          var selectedOptions = this._elements.nativeSelect.selectedOptions;
          var selectedOptionsCount = selectedOptions.length;

          for (var i = 0; i < selectedOptionsCount; i++) {
            values.push(selectedOptions[i].value);
          }

          return values;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this._elements.nativeSelect.disabled = this.disabled || this.readOnly;
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function() {
          this._elements.nativeSelect.disabled = this.readOnly || this.disabled;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.nativeSelect.required = this.required;
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);
        }
      }
    },

    /** @private */
    _onButtonClick: function(event) {
      // uses matchTarget to make sure the buttons is handled and not an internal component
      var item = event.matchedTarget;

      if (this.selectionMode === selectionMode.SINGLE) {
        // prevent event only if selectionMode is not of type none
        event.preventDefault();

        // first unselect the other element
        var selectedElems = this.items._getSelectedItems();

        // we deselect the previously selected item
        if (selectedElems.length !== 0 && selectedElems[0] !== item) {
          this._toggleItemSelection(selectedElems[0], false);
        }

        // forces the selection on the clicked item
        this._toggleItemSelection(item, true);

        // if the same button was clicked we do not need to trigger an event
        if (selectedElems[0] !== item) {
          this._triggerChangeEvent();
        }
      }
      else if (this.selectionMode === selectionMode.MULTIPLE) {
        // prevent event only if selectionMode is not of type none
        event.preventDefault();

        this._toggleItemSelection(item);

        // since we toggle the selection we always trigger a change event
        this._triggerChangeEvent();
      }
    },

    /** @private */
    _onItemAttached: function(event) {
      var item = event.target;

      // we make sure we are handling a button and and not other component (coral-icon, coral-button-label, etc)
      if (item !== event.matchedTarget) {
        return;
      }

      item.$.addClass('coral-ButtonGroup-item');
      item.setAttribute('role', 'listitem');

      // Listen for the button being detached, and clean-up when it does:
      item.on('coral-component:detached', this._onItemDetached);

      this._addItemOption(item);

      // See if this affects our selection (we might require a selection when an item is available):
      this._validateSelection(this._isItemSelected(item) ? item : null) ;

      // triggers the collection API event
      this.trigger('coral-collection:add', {
        item: item
      });
    },

    /** @private */
    _onItemDetached: function(event) {
      var item = event.target;

      item.off('coral-component:detached', this._onItemDetached);

      item.$.removeClass('coral-ButtonGroup-item');
      item.removeAttribute('role');

      // delete option
      if (item.option) {
        item.option.parentNode.removeChild(item.option);
        delete item.option;
      }

      // we need to make sure that the state of the selectionMode is valid
      this._validateSelection();

      // triggers the collection API event
      this.trigger('coral-collection:remove', {
        item: item
      });
    },

    /** @private */
    _onMutations: function(mutations) {
      // monitors only attributes of name selected and values
      var mutationsCount = mutations.length;
      for (var i = 0; i < mutationsCount; i++) {
        var elem = mutations[i].target;

        switch (mutations[i].attributeName) {
        case 'value':
          // we only process a change in the button, options should be ignored
          if ($(elem).is('button[is="coral-button"]')) {
            elem.option.value = this._getItemValue(elem);
          }
          break;
        case 'selected':
          // we only process a change in the button, options should be ignored
          if ($(elem).is('button[is="coral-button"]')) {
            var isSelected = this._isItemSelected(elem);

            // when in single mode, we need to make sure the current selection is valid
            if (this.selectionMode === selectionMode.SINGLE) {
              this._validateSelection(isSelected ? elem : null);
            }
            else {
              // we simply toggle the selection
              this._toggleItemSelection(elem, isSelected);
            }
          }
          break;
        }
      }
    },

    /** @private */
    _isItemSelected: function(item) {
      return item.hasAttribute('selected');
    },

    /**
      Obtains the associated value of the item. If a value attribute is available then we use it directly, otherwise we
      use the contents of the item to generate a valid value. This behavior resembles the behavior of the native options
      in HTML. The item has to be a Coral.Button.

      @param {HTMLElement} item
        the item used to generate the associated value.

      @returns {String} the associated value.

      @private
    */
    _getItemValue: function(item) {
      return item.hasAttribute('value') ?
        item.getAttribute('value') :
        item.label.textContent.replace(/\s{2,}/g, ' ').trim();
    },

    /**
      Toggles the selected state of the item. When <code>selected</code> is provided, it is set as the current state. If
      the value is ommited, then the selected is toggled.

      @param {HTMLElement} item
        Item whose selection needs to be updated.
      @param {Boolean} [selected=undefined]
        Whether the item is selected. If it is not provided, then it is toggled.

      @private
    */
    _toggleItemSelection: function(item, selected) {
      // if selected is provided it is used to enforce the selection, otherwise we toggle the current state
      selected = typeof selected !== 'undefined' ? selected : !this._isItemSelected(item);

      // only manipulates the attributes when necessary to avoid unnecessary mutations
      if (selected && !this._isItemSelected(item)) {
        item.setAttribute('selected', true);
      }
      else if (!selected && this._isItemSelected(item)) {
        item.removeAttribute('selected');
      }

      // if element.option is present - absent when selection mode changed to none
      if (item.option) {
        item.option.selected = selected;
      }
    },

    /** @private */
    _selectItemByValue: function(values) {
      // queries all the buttons to change their selection state
      var buttons = this.items.getAll();
      var buttonsCount = buttons.length;

      var item;
      for (var i = 0; i < buttonsCount; i++) {
        // stores the reference
        item = buttons[i];

        // if the value is inside the new values array it should be selected
        this._toggleItemSelection(item, values.indexOf(this._getItemValue(item)) !== -1);
      }
    },

    /** @private */
    _addItemOption: function(item) {
      if (this.selectionMode === selectionMode.NONE) {
        return;
      }

      // if already attached return
      if (item.option) {
        return;
      }

      var option = document.createElement('option');
      option.value = this._getItemValue(item);

      // add it to DOM. In single selectionMode the first item gets selected automatically
      item.option = option;
      this._elements.nativeSelect.add(option);

      // we make sure the options reflect the state of the button
      if (this._isItemSelected(item)) {
        this._toggleItemSelection(item, true);
      }
    },

    /** @private */
    _removeItemOptions: function() {
      // Find all buttons and try attaching corresponding option elem
      var buttons = this.items.getAll();
      var buttonsCount = buttons.length;

      var item;
      for (var i = 0; i < buttonsCount; i++) {
        // stores the reference
        item = buttons[i];

        // single we are removing the options, selection must also go away
        if (this._isItemSelected(item)) {
          this._toggleItemSelection(item, false);
        }

        // we clear the related option element
        if (item.option) {
          item.option.parentNode.removeChild(item.option);
          delete item.option;
        }
      }
    },

    /** @private */
    _syncItemOptions: function() {
      // finds all buttons and try attaching corresponding option elem
      var buttons = this.items.getAll();
      var buttonsCount = buttons.length;

      for (var i = 0; i < buttonsCount; i++) {
        // try attaching corresponding input element
        this._addItemOption(buttons[i]);
      }
    },

    /** @private */
    _validateSelection: function(item) {
      // when selectionMode = single, we need to force a selection
      if (this.selectionMode === selectionMode.SINGLE) {
        // gets the current selection
        var selection = this.items._getSelectedItems();

        // if no item is currently selected, we need to find a candidate
        if (selection.length === 0) {
          // gets the first candidate for selection
          var selectable = this.items._getSelectableItems();

          if (selectable[0]) {
            this._toggleItemSelection(selectable[0], true);
          }
        }
        // more items are selected, so we find a single item and deselect everything else
        else if (selection.length > 1) {
          // if no item was provided we force the selection on the first item
          item = item || selection[0];

          // we make sure the item is selected, this is important to match the options with the selection
          this._toggleItemSelection(item, true);

          selection.forEach(function(elem) {
            if (elem !== item) {
              this._toggleItemSelection(elem, false);
            }
          }.bind(this));
        }
      }
    },

    /**
      Modifies the accessibility target to be the ButtonGroup itself and not any of the internal buttons.

      @private
    */
    _getLabellableElement: function() {
      return this;
    },

    /** @private */
    _triggerChangeEvent: function() {
      this.trigger('change');
    },

    /** @ignore */
    _render: function() {
      this.insertBefore(Coral.templates.ButtonGroup.base.call(this._elements), this.firstChild);
    },

    /** @ignore */
    _initialize: function() {
      // we correctly bind the detach event
      this._onItemDetached = this._onItemDetached.bind(this);

      // monitor only attributes of name selected and value
      this._observer = new MutationObserver(this._onMutations.bind(this));
      this._observer.observe(this, {
        attributes: true,
        subtree: true,
        attributeFilter: ['selected', 'value']
      });
    }
  });

  // exports the selectionMode enumeration
  Coral.ButtonGroup.selectionMode = selectionMode;
})();

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["ButtonGroup"] = this["Coral"]["templates"]["ButtonGroup"] || {};
this["Coral"]["templates"]["ButtonGroup"]["base"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["nativeSelect"] = document.createElement("select");
  el0.className += " coral-ButtonGroup-select";
  el0.setAttribute("tabindex", "-1");
  el0.setAttribute("handle", "nativeSelect");
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** lends Coral.Checkbox# */ {
    /**
      @class Coral.Checkbox
      @classdesc A Checkbox component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-checkbox
    */
    name: 'Checkbox',
    tagName: 'coral-checkbox',
    className: 'coral-Checkbox',

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      /**
        Checked state for the checkbox. When the checked state is changed by user interaction a
        {@link Coral.mixin.formField#event:change} event is triggered.

        @type {Boolean}
        @default false
        @htmlattribute checked
        @htmlattributereflected
        @fires Coral.mixin.formField#change
        @memberof Coral.Checkbox#
      */
      'checked': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._checked = value;
          this._elements.input.checked = value;
        }
      },

      /**
        Indicates that the checkbox is neither on nor off.

        @type {Boolean}
        @default false
        @htmlattribute indeterminate
        @htmlattributereflected
        @memberof Coral.Checkbox#
      */
      'indeterminate': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this._elements.input.indeterminate = this.indeterminate;
          this._elements.input[this.indeterminate ? 'setAttribute' : 'removeAttribute']('aria-checked', 'mixed');
        }
      },

      /**
        The checkbox's label element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Checkbox#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-checkbox-label'
      }),

      /**
        The value that will be submitted when the checkbox is checked. Changing this value will not trigger an event.

        @type {String}
        @default "on"
        @htmlattribute value
        @memberof Coral.Checkbox#
      */
      'value': {
        default: 'on',
        set: function(value) {
          this._elements.input.value = value;
        },
        get: function() {
          return this._elements.input.value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);
          this._elements.input.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      }
    },

    /*
      Indicates to the formField that the 'checked' property needs to be set in this component.

      @protected
     */
    _componentTargetProperty: 'checked',

    /*
      Indicates to the formField that the 'checked' property has to be extracted from the event.

      @protected
     */
    _eventTargetProperty: 'checked',

    /** @private */
    _onInputChange: function(event) {
      // stops the current event
      event.stopPropagation();

      this[this._componentTargetProperty] = event.target[this._eventTargetProperty];

      // resets the interminate state after user interaction
      this.indeterminate = false;

      // Explicitly re-emit the change event after the property has been set
      if (this._triggerChangeEvent) {
        this.trigger('change');
      }
    },

    _templateHandleNames: ['input', 'checkbox', 'labelWrapper'],

    /** @private */
    _render: function() {
      // Create a temporary fragment
      var frag = document.createDocumentFragment();

      // Render the main template
      frag.appendChild(Coral.templates.Checkbox.base.call(this._elements));

      // Try to find the label content zone
      var foundLabel = this.querySelector('coral-checkbox-label');

      // Create the label content zone if necessary
      var label = this._elements.label = foundLabel || document.createElement('coral-checkbox-label');

      // Add the label to the label wrapper
      this._elements.labelWrapper.appendChild(label);

      if (!foundLabel) {
        // Hide the wrapper if no label was provided
        this._elements.labelWrapper.hidden = true;
      }

      while (this.firstChild) {
        var child = this.firstChild;
        if (child.nodeType === Node.TEXT_NODE ||
          this._templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
          // Add non-template elements to the label
          label.appendChild(child);
        }
        else {
          // Remove anything else element
          this.removeChild(child);
        }
      }

      // Add the frag to the component
      this.appendChild(frag);
    },

    /** @private */
    _initialize: function() {
      // Check if the label is empty whenever we get a mutation
      this._observer = new MutationObserver(this._hideLabelIfEmpty.bind(this));

      // Watch for changes to the label element's children
      this._observer.observe(this.label, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    },

    /**
      Hide the label if it's empty
      @ignore
    */
    _hideLabelIfEmpty: function() {
      var label = this._elements.label;

      // If it's empty and has no non-textnode children, hide the label
      var hiddenValue = label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '';

      // Only bother if the hidden status has changed
      if (hiddenValue !== this._elements.labelWrapper.hidden) {
        this._elements.labelWrapper.hidden = hiddenValue;
      }
    },

    attachedCallback: function() {
      // Call top level class' attachedCallback
      Coral.Component.prototype.attachedCallback.call(this);

      // @polyfill IE9
      // Check if we need to hide the label
      // We must do this because IE does not catch mutations when nodes are not in the DOM
      this._hideLabelIfEmpty();
    }
  });

  Coral.register( /** @lends Coral.Checkbox.Label */ {
    /**
      @class Coral.Checkbox.Label
      @classdesc A Checkbox Label component
      @extends Coral.Component
      @htmltag coral-checkbox-label
    */
    name: 'Checkbox.Label',
    tagName: 'coral-checkbox-label'
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Checkbox"] = window["Coral"]["templates"]["Checkbox"] || {};
window["Coral"]["templates"]["Checkbox"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("type", "checkbox");
  el0.setAttribute("handle", "input");
  el0.className += " coral-Checkbox-input";
  el0.id = Coral["commons"]["getUID"]();
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["checkbox"] = document.createElement("span");
  el2.className += " coral-Checkbox-checkmark";
  el2.setAttribute("handle", "checkbox");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["labelWrapper"] = document.createElement("label");
  el4.className += " coral-Checkbox-description";
  el4.setAttribute("handle", "labelWrapper");
  el4.setAttribute("for", this["input"]["id"]);
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var $body = $(document.body);

  // Attributes
  var attributeName = 'coral-dragaction';
  var attributeNameDropZone = 'coral-dragaction-dropzone';
  var attributeNameHandle = 'coral-dragaction-handle';
  var attributeNameAxis = 'coral-dragaction-axis';
  var attributeNameScrolling = 'coral-dragaction-scroll';
  var attributeNameContainment = 'coral-dragaction-containment';

  // Classes
  var openHandClass = 'u-coral-openHand';
  var isDraggingClass = 'u-coral-closedHand is-dragging';

  // Scroll offset default values
  var defaultScrollOffset = 20;
  var defaultScrollBy = 10;

  /**
    Enum for DragAction axis values.

    @enum {String}
    @memberof Coral.DragAction
  */
  var axis = {
    /** Allows vertically dragging only. */
    VERTICAL: 'vertical',
    /** Allows horizontally dragging only. */
    HORIZONTAL: 'horizontal'
  };

  /**
    @ignore
    @param {HTMLElement} $element
    @returns {HTMLElement}
      First parent element with overflow [hidden|scroll|auto]
  */
  function getViewContainer($element) {
    while (true) {
      var p = $element.parent();

      if (p.length === 0) {
        return p;
      }
      if (p.is('body')) {
        return p;
      }

      var flow = p.css('overflow');
      if (flow === 'hidden' || flow === 'auto' || flow === 'scroll') {
        return p;
      }

      $element = p;
    }
  }

  /**
    @ignore
    @param {Object} event
    @returns {Object}
      X and y position whether event was generated by a click or a touch
  */
  function getPagePosition(event) {
    var touch = {};
    if (event.originalEvent) {
      var o = event.originalEvent;
      if (o.changedTouches && o.changedTouches.length > 0) {
        touch = o.changedTouches[0];
      }
      if (o.touches && o.touches.length > 0) {
        touch = o.touches[0];
      }
    }

    return {
      x: touch.pageX || event.pageX,
      y: touch.pageY || event.pageY
    };
  }

  /**
    @ignore
    @param {Coral.DragAction} self
      Coral.DragAction instance
    @returns {HTMLElement}
      The dropzone that is being hovered by the dragged element or null if none
  */
  function isOverDropZone(self) {
    var dropZone = null;
    if (self._$dropZone && self._$dropZone.length) {
      $.each(self._$dropZone, function() {
        if (within(self._$dragElement, $(this))) {
          dropZone = this;
          return false;
        }
      });
    }

    return dropZone;
  }

  /**
    @ignore
    @param {HTMLElement} $a
    @param {HTMLElement} $b
    @returns {Boolean}
      Whether a is within b bounds
  */
  function within($a, $b) {
    var aOffset = $a.offset();
    var bOffset = $b.offset();

    var al = aOffset.left;
    var ar = al + $a.outerWidth();
    var bl = bOffset.left;
    var br = bl + $b.outerWidth();

    var at = aOffset.top;
    var ab = at + $a.outerHeight();
    var bt = bOffset.top;
    var bb = bt + $b.outerHeight();

    return !((bl > ar || br < al) || (bt > ab || bb < at));
  }

  /**
    @class Coral.DragAction
    @classdesc This a decorator which adds draggable functionality to DOM elements
    @param {String|HTMLElement} dragElement
      The draggable element.
  */
  Coral.DragAction = function(dragElement) {
    if (!dragElement) {
      throw new Error('Coral.DragAction: dragElement is missing');
    }

    this._id = Coral.commons.getUID();
    this._dragElement = dragElement;
    this._$dragElement = $(dragElement);

    // Destroy instance if existing
    if (this._$dragElement[0].dragAction) {
      this._$dragElement[0].dragAction.destroy();
    }

    // Store initial position
    this._initialPosition = {
      position: this._$dragElement.css('position'),
      left: this._$dragElement.css('top'),
      top: this._$dragElement.css('left')
    };

    // Prepare Vent
    this._vent = new window.Vent(this._$dragElement[0]);

    // Handle options
    this.handle = this._$dragElement.attr(attributeNameHandle);

    // DropZone options
    this.dropZone = this._$dragElement.attr(attributeNameDropZone);

    // Axis horizontal|vertical
    this.axis = this._$dragElement.attr(attributeNameAxis);

    // Scroll options
    this.scroll = this._$dragElement.is('[' + attributeNameScrolling + ']');

    // Restriction to container
    this.containment = this._$dragElement.is('[' + attributeNameContainment + ']');

    // Bind events
    if(!(this._$handle && this._$handle.length) && !this._$dragElement.hasClass(openHandClass)) {
      this._$dragElement
        .on('touchstart.CoralDragAction mousedown.CoralDragAction', this._dragStart.bind(this))
        .addClass(openHandClass);
    }

    this._drag = this._drag.bind(this);
    this._dragEnd = this._dragEnd.bind(this);

    $(document)
      .on('touchmove.CoralDragAction' + this._id + ' mousemove.CoralDragAction' + this._id, this._drag)
      .on('touchend.CoralDragAction' + this._id + ' mouseup.CoralDragAction' + this._id, this._dragEnd);

    // Store reference on dragElement
    this._$dragElement[0].dragAction = this;
  };

  Coral.DragAction.prototype = {};

  /**
    The draggable element.

    @name dragElement
    @readonly
    @type {String|HTMLElement}
    @htmlattribute coral-dragaction
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'dragElement', {
    get: function() {
      return this._dragElement;
    },
    set: function(value) {}
  });

  /**
    The handle allowing to drag the element.

    @name handle
    @type {String|HTMLElement}
    @htmlattribute coral-dragaction-handle
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'handle', {
    get: function() {
      return this._handle;
    },
    set: function(value) {
      if (Coral.validate.valueMustChange(value, this._handle)) {

        // Unbind events
        this._$dragElement
          .off('.CoralDragAction')
          .removeClass(isDraggingClass + ' ' + openHandClass);

        if (this._$handle && this._$handle.length) {
          $.each(this._$handle, function() {
            $(this)
              .off('.CoralDragAction')
              .removeClass(isDraggingClass + ' ' + openHandClass);
          });
        }

        if (typeof value === 'string' ||
          value instanceof HTMLElement ||
          Object.prototype.toString.call(value) === '[object NodeList]') {

          // Set new value
          this._handle = value;
          this._$handle = $(value);

          // Bind events
          if (this._$handle && this._$handle.length) {
            var self = this;
            $.each(this._$handle, function() {
              $(this)
                .on('mousedown.CoralDragAction', self._dragStart.bind(self))
                .on('touchstart.CoralDragAction', self._dragStart.bind(self))
                .addClass(openHandClass);
            });
          }
          else {
            this._$dragElement
              .on('touchstart.CoralDragAction', this._dragStart.bind(this))
              .on('mousedown.CoralDragAction', this._dragStart.bind(this))
              .addClass(openHandClass);
          }
        }
        else {
          this._handle = '';
          this._$handle = $([]);
          this._$dragElement
            .on('touchstart.CoralDragAction', this._dragStart.bind(this))
            .on('mousedown.CoralDragAction', this._dragStart.bind(this))
            .addClass(openHandClass);
        }
      }
    }
  });

  /**
    The dropZone to drop the dragged element.

    @name dropZone
    @type {String|HTMLElement}
    @htmlattribute coral-dragaction-dropzone
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'dropZone', {
    get: function() {
      return this._dropZone;
    },
    set: function(value) {
      if (Coral.validate.valueMustChange(value, this._dropZone)) {
        this._dropZoneEntered = false;

        if (typeof value === 'string' ||
          value instanceof HTMLElement ||
          Object.prototype.toString.call(value) === '[object NodeList]') {

          this._dropZone = value;
          this._$dropZone = $(value);
        }
        else {
          this._dropZone = '';
          this._$dropZone = $([]);
        }
      }
    }
  });

  /**
    The axis to constrain drag movement.

    @name axis
    @type {Coral.DragAction.axis}
    @htmlattribute coral-dragaction-axis
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'axis', {
    get: function() {
      return this._axis;
    },
    set: function(value) {
      var newAxis = Coral.transform.string(value);
      if (Coral.validate.valueMustChange(newAxis, this._axis)) {
        if (Coral.validate.enumeration(axis)(newAxis)) {
          this._axis = newAxis;
        }
        else {
          this._axis = '';
        }
      }
    }
  });

  /**
    Whether to scroll the container when the draggable element is moved beyond the viewport.

    @name scroll
    @default false
    @type {Boolean}
    @htmlattribute coral-dragaction-scroll
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'scroll', {
    get: function() {
      return this._scroll;
    },
    set: function(value) {
      var newScroll = Coral.transform.boolean(value);
      if (Coral.validate.valueMustChange(newScroll, this._scroll)) {
        this._scroll = newScroll;
      }
    }
  });

  /**
    Whether to constrain the draggable element to its container viewport.

    @name containment
    @default false
    @type {Boolean}
    @htmlattribute coral-dragaction-containment
    @memberof Coral.DragAction#
  */
  Object.defineProperty(Coral.DragAction.prototype, 'containment', {
    get: function() {
      return this._containment;
    },
    set: function(value) {
      var newContainment = Coral.transform.boolean(value);
      if (Coral.validate.valueMustChange(newContainment, this._containment)) {
        this._containment = newContainment;
      }
    }
  });

  /** @private */
  Coral.DragAction.prototype._dragStart = function(event) {
    // Container
    this._$container = getViewContainer(this._$dragElement);

    // Prevent dragging ghost image
    if (event.target.tagName === 'IMG') {
      event.preventDefault();
    }

    // Prevent touchscreen windows to scroll while dragging
    $(document).one('touchmove', function(event) {
      event.preventDefault();
    });

    $body
      .data('overflow', $body.css('overflow'))
      .css('overflow', 'hidden');

    if (!this._$container.is('body')) {
      this._$container
        .data('overflow', this._$container.css('overflow'))
        .css('overflow', this.scroll ? 'scroll' : 'hidden');
    }

    var position = this._$dragElement.offset();
    var pagePosition = getPagePosition(event);

    this._dragPosition = getPagePosition(event);
    this._dragPosition.x -= position.left;
    this._dragPosition.y -= position.top;

    this._$dragElement.addClass(isDraggingClass);

    this._vent.dispatch('coral-dragaction:dragstart', {
      detail: {
        dragElement: this._$dragElement[0],
        pageX: pagePosition.x,
        pageY: pagePosition.y
      }
    });
  };

  /** @private */
  Coral.DragAction.prototype._drag = function(event) {
    if (this._$dragElement.hasClass(isDraggingClass)) {
      var self = this;
      var pagePosition = getPagePosition(event);

      var dragElementPosition = this._$dragElement.position();
      var containerPosition = this._$container.position();

      var dragElementHeight = this._$dragElement.outerHeight();
      var dragElementWidth = this._$dragElement.outerWidth();
      var containerWidth = this._$container.outerWidth();
      var containerHeight = this._$container.outerHeight();

      self._vent.dispatch('coral-dragaction:drag', {
        detail: {
          dragElement: self._$dragElement[0],
          pageX: pagePosition.x,
          pageY: pagePosition.y
        }
      });

      // Remove selection
      if (document.selection) {
        document.selection.empty();
      }
      else if (window.getSelection) {
        // @polyfill ie
        if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      }

      // Need to scroll ?
      if (this.scroll) {

        if (this._$container.is('body')) {
          // Use window instead of body. FF and IE always return 0 for $('body').scrollTop()
          var $window = $(window);

          // Scroll to the top
          if ($window.scrollTop() - dragElementPosition.top + defaultScrollOffset > 0) {
            $window.scrollTop($window.scrollTop() - defaultScrollBy);
          }

          // Scroll to the bottom
          if ((window.innerHeight + $window.scrollTop() - defaultScrollBy) <= (dragElementPosition.top + dragElementHeight)) {
            $window.scrollTop($window.scrollTop() + defaultScrollBy);
          }

          // Scroll to the left
          if ($window.scrollLeft() - dragElementPosition.left + defaultScrollOffset > 0) {
            $window.scrollLeft($window.scrollLeft() - defaultScrollBy);
          }

          // Scroll to the right
          if ((window.innerWidth + $window.scrollLeft() - defaultScrollBy) <= (dragElementPosition.left + dragElementWidth)) {
            $window.scrollLeft($window.scrollLeft() + defaultScrollBy);
          }
        }
        else {
          // Scroll to the top
          if ((dragElementPosition.top - containerPosition.top) <= defaultScrollOffset) {
            this._$container.scrollTop(this._$container.scrollTop() - defaultScrollBy);
          }

          // Scroll to the bottom
          if ((dragElementPosition.top + dragElementHeight) >= (containerPosition.top + containerHeight - defaultScrollOffset)) {
            this._$container.scrollTop(this._$container.scrollTop() + defaultScrollBy);
          }

          // Scroll to the left
          if ((dragElementPosition.left - containerPosition.left) <= defaultScrollOffset) {
            this._$container.scrollLeft(this._$container.scrollLeft() - defaultScrollBy);
          }

          // Scroll to the right
          if ((containerWidth + this._$container.scrollLeft() - defaultScrollBy) <= (dragElementPosition.left + dragElementWidth)) {
            this._$container.scrollLeft(this._$container.scrollLeft() + defaultScrollBy);
          }
        }
      }

      // Set drag element's new position
      var newPosition = {};

      if (this.axis !== 'horizontal') {
        var top = pagePosition.y - this._dragPosition.y;

        // Applying container containment for y movements
        if (this.containment) {
          if (top >= containerPosition.top && top + dragElementHeight <= containerPosition.top + containerHeight) {
            newPosition.top = top;
          }
          else {
            // put the drag element to the container's top
            if (pagePosition.y <= containerPosition.top) {
              newPosition.top = containerPosition.top;
            }
            // put the drag element to the container's bottom
            else if (pagePosition.y >= containerPosition.top + containerHeight) {
              newPosition.top = containerPosition.top + containerHeight - dragElementHeight;
            }
          }
        }
        else {
          newPosition.top = top;
        }
      }
      if (this.axis !== 'vertical') {
        var left = pagePosition.x - this._dragPosition.x;

        // Applying container containment for x movements
        if (this.containment) {
          if (left >= containerPosition.left && left + dragElementWidth <= containerPosition.left + containerWidth) {
            newPosition.left = left;
          }
          else {
            // put the drag element to the container's left
            if (pagePosition.x <= containerPosition.left) {
              newPosition.left = containerPosition.left;
            }
            // put the drag element to the container's right
            else if (pagePosition.x >= containerPosition.left + containerWidth) {
              newPosition.left = containerPosition.left + containerWidth - dragElementWidth;
            }
          }
        }
        else {
          newPosition.left = left;
        }
      }

      // Set the new position
      this._$dragElement.offset(newPosition);

      // Trigger dropzone related events
      var dropZone = isOverDropZone(self);
      if (dropZone) {
        self._dropElement = dropZone;
        if (!self._dropZoneEntered) {
          self._dropZoneEntered = true;
          self._vent.dispatch('coral-dragaction:dragenter', {
            detail: {
              dragElement: self._$dragElement[0],
              pageX: pagePosition.x,
              pageY: pagePosition.y,
              dropElement: self._dropElement
            }
          });
        }

        self._vent.dispatch('coral-dragaction:dragover', {
          detail: {
            dragElement: self._$dragElement[0],
            pageX: pagePosition.x,
            pageY: pagePosition.y,
            dropElement: self._dropElement
          }
        });
      }
      else {
        if (self._dropZoneEntered) {
          self._vent.dispatch('coral-dragaction:dragleave', {
            detail: {
              dragElement: self._$dragElement[0],
              pageX: pagePosition.x,
              pageY: pagePosition.y,
              dropElement: self._dropElement
            }
          });
          self._dropZoneEntered = false;
        }
      }
    }
  };

  /** @private */
  Coral.DragAction.prototype._dragEnd = function(event) {
    if (this._$dragElement.hasClass(isDraggingClass)) {
      var pagePosition = getPagePosition(event);

      // Restore overflow
      $body
        .css('overflow', $body.data('overflow'))
        .removeData('overflow');

      if (!this._$container.is('body')) {
        this._$container
          .css('overflow', this._$container.data('overflow'))
          .removeData('overflow');
      }

      this._$dragElement.removeClass(isDraggingClass);

      if (this._dropZoneEntered) {
        var dropZone = isOverDropZone(this);
        if (dropZone) {
          this._dropElement = dropZone;
          this._vent.dispatch('coral-dragaction:drop', {
            detail: {
              dragElement: this._$dragElement[0],
              pageX: pagePosition.x,
              pageY: pagePosition.y,
              dropElement: this._dropElement
            }
          });
        }
      }

      this._vent.dispatch('coral-dragaction:dragend', {
        detail: {
          dragElement: this._$dragElement[0],
          pageX: pagePosition.x,
          pageY: pagePosition.y
        }
      });
    }
  };

  /**
    Remove draggable actions

    @function destroy
    @param {Boolean} restorePosition
      Whether to restore the draggable element to its initial position
    @memberof Coral.DragAction
  */
  Coral.DragAction.prototype.destroy = function(restorePosition) {
    // Unbind events
    if (this._$handle && this._$handle.length) {
      $.each(this._$handle, function() {
        $(this)
          .off('.CoralDragAction')
          .removeClass(isDraggingClass + ' ' + openHandClass);
      });
    }
    else {
      this._$dragElement
        .off('.CoralDragAction')
        .removeClass(isDraggingClass + ' ' + openHandClass);
    }
    $(document).off('.CoralDragAction' + this._id);

    // Restore overflow
    if ($body.data('overflow')) {
      $body
        .css('overflow', $body.data('overflow'))
        .removeData('overflow');
    }

    // Container might not have been initialized
    if (this._$container) {
      if (!this._$container.is('body') && this._$container.data('overflow')) {
        this._$container
          .css('overflow', this._$container.data('overflow'))
          .removeData('overflow');
      }
    }

    // Set to initial position
    if (restorePosition) {
      this._$dragElement.css({
        position: this._initialPosition.position,
        top: this._initialPosition.top,
        left: this._initialPosition.left
      });
    }

    // Remove reference
    delete this._$dragElement[0].dragAction;
  };

  // Exports the axis enumeration
  Coral.DragAction.axis = axis;

  // Apply draggable actions
  document.addEventListener('DOMContentLoaded', function() {
    $('[' + attributeName + ']').each(function() {
      new Coral.DragAction(this);
    });
  });

  /**
    Triggered when the drag element starts to be dragged.

    @event Coral.DragAction#coral-dragaction:dragstart

    @param {HTMLElement} dragElement
      The dragged element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element is being dragged.

    @event Coral.DragAction#coral-dragaction:drag

    @param {HTMLElement} dragElement
      The dragged element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element stops to be dragged.

    @event Coral.DragAction#coral-dragaction:dragend

    @param {HTMLElement} dragElement
      The dragged element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element enters a drop element.

    @event Coral.DragAction#coral-dragaction:dragenter

    @param {HTMLElement} dragElement
      The dragged element
    @param {HTMLElement} dropElement
      The drop element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element is over a drop element.

    @event Coral.DragAction#coral-dragaction:dragover

    @param {HTMLElement} dragElement
      The dragged element
    @param {HTMLElement} dropElement
      The drop element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element leaves a drop element.

    @event Coral.DragAction#coral-dragaction:dragleave

    @param {HTMLElement} dragElement
      The dragged element
    @param {HTMLElement} dropElement
      The drop element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */

  /**
    Triggered when the drag element is dropped on a drop element.

    @event Coral.DragAction#coral-dragaction:drop

    @param {HTMLElement} dragElement
      The dragged element
    @param {HTMLElement} dropElement
      The drop element
    @param {Number} pageX
      The mouse position relative to the left edge of the document.
    @param {Number} pageY
      The mouse position relative to the top edge of the document.
  */
})();

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Drawer directions.

    @enum {String}
    @memberof Coral.Drawer
  */
  var direction = {
    /** A drawer with a toggle button on the bottom. */
    DOWN: 'down',
    /** A drawer with a toggle button on top. */
    UP: 'up'
  };

  // in milliseconds
  var animationDuration = 250;

  // The drawer's base classname
  var CLASSNAME = 'coral-Drawer';

  // A string of all possible direction classnames
  var ALL_DIRECTION_CLASSES = '';
  for (var directionValue in direction) {
    ALL_DIRECTION_CLASSES += CLASSNAME + '--' + direction[directionValue] + ' ';
  }

  Coral.register( /** @lends Coral.Drawer# */ {

    /**
      @class Coral.Drawer
      @classdesc A Drawer component
      @extends Coral.Component
      @htmltag coral-drawer
    */
    name: 'Drawer',
    tagName: 'coral-drawer',
    className: CLASSNAME,

    events: {
      'click [handle=toggle]:not(:disabled)': '_onClick'
    },

    properties: {

      /**
        Whether this item is disabled or not. This will stop every user interaction with the item.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.Drawer#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$
            .attr('aria-disabled', this.disabled)
            .toggleClass('is-disabled', this.disabled);
          this._elements.toggle.disabled = this.disabled;
        }
      },

      /**
        The drawer's content element.

        @type {HTMLElement}
        @htmlttribute content
        @contentzone
        @memberof Coral.Drawer#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-drawer-content'
      }),

      /**
        Whether the Drawer is expanded or not.

        @type {Boolean}
        @default false
        @htmlattribute open
        @htmlattributereflected
        @memberof Coral.Drawer#
      */
      'open': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.setAttribute('aria-expanded', this.open);
          this._updateIcon();

          $(this._elements.contentWrapper)[this.open ? 'slideDown' : 'slideUp']({
            duration: animationDuration,
            complete: function() {
              this.trigger(this.open ? 'coral-drawer:open' : 'coral-drawer:close');
            }.bind(this)
          });
        }
      },

      /**
        The drawer's direction.

        @type {Coral.Drawer.direction}
        @default Coral.Drawer.direction.DOWN
        @htmlattribute direction
        @memberof Coral.Drawer#
      */
      'direction': {
        default: direction.DOWN,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(direction)
        ],
        sync: function() {
          this.$
            .removeClass(ALL_DIRECTION_CLASSES)
            .addClass(this._className + '--' + this.direction);

          this._updateIcon();
        }
      }
    },

    /** @private */
    _onClick: function() {
      this.open = !this.open;
    },

    /** @private */
    _updateIcon: function() {
      if (this.direction === direction.UP) {
        this._elements.toggle.icon = this.open ? 'chevronDown' : 'chevronUp';
      }
      else if (this.direction === direction.DOWN) {
        this._elements.toggle.icon = this.open ? 'chevronUp' : 'chevronDown';
      }
    },

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var fragment = document.createDocumentFragment();

      // Render the template
      fragment.appendChild(Coral.templates.Drawer.base.call(this._elements));

      // Fetch or create the content content zone element
      var content = this._elements.content = this.querySelector('coral-drawer-content') || document.createElement('coral-drawer-content');

      // Add the content zone to the frag
      this._elements.contentWrapper.appendChild(content);

      // Move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Add the frag to the component
      this.appendChild(fragment);
    }

    /**
      Triggered when the drawer is opened

      @event Coral.Drawer#coral-drawer:open

      @param {Object} event
        Event object
    */

    /**
      Triggered when the drawer is closed

      @event Coral.Drawer#coral-drawer:close

      @param {Object} event
        Event object
    */
  });

  Coral.register( /** @lends Coral.Drawer.Content */ {
    /**
     @class Coral.Drawer.Content
     @classdesc A Drawer Content component
     @extends Coral.Component
     @htmltag coral-drawer-content
     */
    name: 'Drawer.Content',
    tagName: 'coral-drawer-content'
  });

  // exports the direction enumeration
  Coral.Drawer.direction = direction;
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Drawer"] = this["Coral"]["templates"]["Drawer"] || {};
this["Coral"]["templates"]["Drawer"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["contentWrapper"] = document.createElement("div");
  el0.setAttribute("handle", "contentWrapper");
  el0.className += " coral-Drawer-content coral-Drawer-content--padding";
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral-Drawer-toggle";
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["toggle"] = document.createElement("button","coral-button");
  el4.setAttribute("type", "button");
  el4.setAttribute("handle", "toggle");
  el4.setAttribute("is", "coral-button");
  el4.setAttribute("variant", "minimal");
  el4.setAttribute("icon", "chevronDown");
  el4.setAttribute("iconSize", "XS");
  el4.setAttribute("aria-label", "coral-drawer");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Check if HTML5 XMLHttpRequest 2 features are available
  var useXHR2 = function() {
    var xhr = new XMLHttpRequest();
    return !!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
  };

  var XHR_EVENT_NAMES = ['loadstart', 'progress', 'load', 'error', 'loadend', 'readystatechange', 'abort', 'timeout'];

  /**
    Enumeration representing HTTP methods that can be used to upload files.

    @memberof Coral.FileUpload
    @enum {String}
  */
  var method = {
    /** Send a POST request. Used when creating a resource. */
    'POST': 'POST',
    /** Send a PUT request. Used when replacing a resource. */
    'PUT': 'PUT',
    /** Send a PATCH request. Used when partially updating a resource. */
    'PATCH': 'PATCH'
  };

  // Validator/transform is used in the property and internally
  var isValidMethod = Coral.validate.enumeration(method);
  var transformMethod = function(value) {
    return typeof value === 'string' ? value.toUpperCase() : value;
  };

  Coral.register( /** @lends Coral.FileUpload# */ {

    /**
      @class Coral.FileUpload
      @classdesc A FileUpload component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-fileupload
    */
    name: 'FileUpload',
    tagName: 'coral-fileupload',
    className: 'coral3-FileUpload',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      // Clickable hooks
      'click [coral-fileupload-submit]': '_onSubmitButtonClick',
      'click [coral-fileupload-clear]': 'clear',
      'click [coral-fileupload-select]': '_showFileDialog',
      'click [coral-fileupload-abort]': 'abort',
      'click [coral-fileupload-abortfile]': '_onAbortFileClick',
      'click [coral-fileupload-removefile]': '_onRemoveFileClick',
      'click [coral-fileupload-uploadfile]': '_onUploadFileClick',

      // Drag & Drop zones
      'dragenter [coral-fileupload-dropzone]': '_onDragAndDrop',
      'dragover [coral-fileupload-dropzone]': '_onDragAndDrop',
      'dragleave [coral-fileupload-dropzone]': '_onDragAndDrop',
      'drop [coral-fileupload-dropzone]': '_onDragAndDrop',

      // Accessibility
      'capture:focus [coral-fileupload-select]': '_onButtonFocusIn',
      'capture:focus [handle="input"]': '_onInputFocusIn',
      'capture:blur [handle="input"]': '_onInputFocusOut'
    },

    properties: {
      // JSDoc inherited
      'disabled': {
        set: function(value) {
          this._disabled = value;
          this._elements.input.disabled = this.disabled;
        },
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);

          this._setElementState();
        }
      },

      // JSDoc inherited
      'invalid': {
        set: function(value) {
          this._invalid = value;
          this._elements.input.setAttribute('aria-invalid', this.invalid);
        },
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);

          this._setElementState();
        }
      },

      // JSDoc inherited
      'readOnly': {
        set: function(value) {
          this._readOnly = value;
          this._elements.input.disabled = this.readOnly;
        },
        sync: function() {
          this.$.toggleClass('is-readOnly', this.readOnly);

          this._setElementState();
        }
      },

      // JSDoc inherited
      'required': {
        set: function(value) {
          this._elements.input.required = value;
        },
        get: function() {
          return this._elements.input.required;
        },
        sync: function() {
          this.$.toggleClass('is-required', this.required);

          this._setElementState();
        }
      },

      // JSDoc inherited
      'value': {
        set: function(value) {
          if (value === '' || value === null) {
            this._clearQueue();
            this._clearFileInputValue();
          }
          else {
            // Throws dom exception if value is different than an empty string or null
            throw new Error('Coral.FileUpload accepts a filename, which may only be programmatically set to the' +
              ' empty string.');
          }
        },
        get: function() {
          var item = (this._uploadQueue) ? this._getQueueItem(0) : null;

          // The first selected filename, or the empty string if no files are selected.
          return (item) ? 'C:\\fakepath\\' + item.file.name : '';
        }
      },

      /**
        The names of the currently selected files.
        When {@link Coral.FileUpload#multiple} is <code>false</code>, this will be an array of length 1.

        @type {Array.<String>}
        @memberof Coral.FileUpload#
      */
      'values': {
        validate: [
          Coral.validate.valueMustChange,
          function(values) {
            return Array.isArray(values);
          }
        ],
        set: function(values) {
          if (values.length) {
            this.value = values[0];
          }
          else {
            this.value = '';
          }
        },
        get: function() {
          var values = this._uploadQueue.map(function(item) {
            return 'C:\\fakepath\\' + item.file.name;
          });

          if (values.length && !this.multiple) {
            values = [values[0]];
          }

          return values;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      /**
        Array of additional parameters as key:value to send in addition of files.
        A parameter must contain a <code>name</code> key:value and optionally a <code>value</code> key:value.

        @type {Array.<Object>}
        @default []
        @memberof Coral.FileUpload#
      */
      'parameters': {
        default: function() {
          return [];
        },
        attribute: null,
        validate: [
          Coral.validate.valueMustChange,
          function(newValue, oldValue) {
            // Verify that every item has a name
            return Array.isArray(newValue) && newValue.every(function(el) {
                return el && el.name;
              });
          }
        ],
        sync: function() {
          if (!this.async) {
            $(this.querySelectorAll('input[type="hidden"]')).remove();

            // Add extra parameters
            this.parameters.forEach(function(param) {
              this.$.append($(document.createElement('input')).attr({
                type: 'hidden',
                name: param.name,
                value: param.value
              }));
            }.bind(this));
          }
        }
      },

      /**
        Whether files should be uploaded asynchronously via XHR or synchronously e.g. within a
        <code>&lt;form&gt;</code> tag. One option excludes the other. Setting a new <code>async</code> value removes all
        files from the queue.

        @type {Boolean}
        @default false
        @htmlattributereflected
        @memberof Coral.FileUpload#
      */
      'async': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._async = value;

          // Sync extra parameters in case of form submission
          if (!this._async) {
            this._syncProp('parameters');
          }

          // Clear file selection
          if (this._uploadQueue) {
            this._clearQueue();
            this._clearFileInputValue();
          }
        }
      },

      /**
        The URL where the upload request should be sent. When used within a <code>&lt;form&gt;</code> tag to upload
        synchronously, the action of the form is used. If an element is clicked that has a
        <code>[coral-fileupload-submit]</code> attribute as well as a <code>[formaction]</code> attribute, the action of
        the clicked element will be used. Set this property before calling {@link Coral.FileUpload#upload} to reset the
        action set by a click.

        @type {String}
        @default ""
        @htmlattribute action
        @memberof Coral.FileUpload#
      */
      'action': {
        default: '',
        attribute: 'action',
        transform: Coral.transform.string,
        attributeTransform: Coral.transform.string,
        set: function(action) {
          this._action = action;

          // Reset button action as action was set explcitly
          this._buttonAction = null;
        }
      },

      /**
        The HTTP method to use when uploading files asynchronously. When used within a <code>&lt;form&gt;</code> tag to
        upload synchronously, the method of the form is used. If an element is clicked that has a
        <code>[coral-fileupload-submit]</code> attribute as well as a <code>[formmethod]</code> attribute, the method of
        the clicked element will be used. Set this property before calling {@link Coral.FileUpload#upload} to reset the
        method set by a click.

        @type {Coral.FileUpload.method}
        @default Coral.FileUpload.method.POST
        @htmlattribute method
        @memberof Coral.FileUpload#
      */
      'method': {
        default: method.POST,
        transform: transformMethod,
        validate: [
          Coral.validate.valueMustChange,
          isValidMethod
        ],
        set: function(value) {
          this._method = value;

          // Reset button method as method was set explcitly
          this._buttonMethod = null;
        }
      },

      /**
        Whether more than one file can be chosen at the same time to upload.

        @type {Boolean}
        @default false
        @htmlattribute multiple
        @htmlattributereflected
        @memberof Coral.FileUpload#
      */
      'multiple': Coral.property.proxy({
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        path: '_elements.input.multiple'
      }),

      /**
        File size limit in bytes for one file. The value of 0 indicates unlimited, which is also the default.

        @type {Number}
        @htmlattribute sizelimit
        @default 0
        @memberof Coral.FileUpload#
      */
      'sizeLimit': {
        default: 0,
        attribute: 'sizelimit',
        transform: Coral.transform.number,
        attributeTransform: Coral.transform.number
      },

      /**
        MIME types allowed for uploading (proper MIME types, wildcard '*' and file extensions are supported). To specify
        more than one value, separate the values with a comma (e.g.
        <code>&lt;input accept="audio/*,video/*,image/*" /&gt;</code>.

        @type {String}
        @default ""
        @htmlattribute accept
        @htmlattributereflected
        @memberof Coral.FileUpload#
      */
      'accept': Coral.property.proxy({
        reflectAttribute: true,
        path: '_elements.input.accept'
      }),

      /**
        Whether the upload should start immediately after file selection.

        @type {Boolean}
        @default false
        @htmlattribute autostart
        @htmlattributereflected
        @memberof Coral.FileUpload#
      */
      'autoStart': {
        default: false,
        attribute: 'autostart',
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr
      },

      /**
        Files waiting impatiently to be uploaded.

        @readonly
        @default []
        @type {Array.<Object>}
        @memberof Coral.FileUpload#
      */
      'uploadQueue': {
        attribute: null,
        set: function() {}
      }
    },

    /** @private */
    _onButtonFocusIn: function(event) {
      // Get the input
      var input = this._elements.input;

      // Get the button
      var button = event.matchedTarget;

      // Move the input to after the button
      // This lets the next focused item be the correct one according to tab order
      button.parentNode.insertBefore(input, button.nextElementSibling);

      // Make sure the input gets focused on FF
      window.setTimeout(function() {
        input.focus();
      }, 100);
    },

    /** @private */
    _onInputFocusIn: function(event) {
      var $button = $(this._elements.input).prevAll('[coral-fileupload-select]').first();
      if ($button.length) {
        // Remove from the tab order so shift+tab works
        $button[0].tabIndex = -1;

        // Mark the button as focused
        $button.addClass('is-focused');
      }
    },

    /** @private */
    _onInputFocusOut: function(event) {
      // Unmark all the focused buttons
      this.$
        .find('[coral-fileupload-select].is-focused')
        .removeClass('is-focused').prop('tabIndex', '');
    },

    /** @private */
    _onAbortFileClick: function(event) {
      if (!this.async) {
        throw new Error('Coral.FileUpload does not support aborting file(s) upload on synchronous mode.');
      }

      // Get file to abort
      var fileName = event.target.getAttribute('coral-fileupload-abortfile');
      if (fileName) {
        this._abortFile(fileName);
      }
    },

    /** @private */
    _onRemoveFileClick: function(event) {
      if (!this.async) {
        throw new Error('Coral.FileUpload does not support removing a file from the queue on synchronous mode.');
      }
      else {
        // Get file to remove
        var fileName = event.target.getAttribute('coral-fileupload-removefile');
        if (fileName) {
          this._clearFile(fileName);
        }
      }
    },

    /** @private */
    _onUploadFileClick: function(event) {
      if (!this.async) {
        throw new Error('Coral.FileUpload does not support uploading a file from the queue on synchronous mode.');
      }

      // Get file to upload
      var fileName = event.target.getAttribute('coral-fileupload-uploadfile');
      if (fileName) {
        this.upload(fileName);
      }
    },

    /** @private */
    _onDragAndDrop: function(event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      if (event.preventDefault) {
        event.preventDefault();
      }

      // Set dragging classes
      if (event.type === 'dragenter' || event.type === 'dragover') {
        this._addDragClass();
      }
      else if (event.type === 'dragleave' || event.type === 'drop') {
        this._removeDragClass();
      }

      this.trigger('coral-fileupload:' + event.type);

      // On drop trigger the select
      if (event.type === 'drop') {
        // Clear file selection
        this._elements.input.value = '';
        this._onInputChange(event);
      }

      return false;
    },

    _addDragClass: function() {
      clearTimeout(this._removeClassTimeout);
      this._removeClassTimeout = setTimeout(this._doAddDragClass, 10);
    },

    _doAddDragClass: function() {
      this.$.addClass('is-dragging');
      this.$.find('[coral-fileupload-dropzone]').addClass('is-dragging');
    },

    _removeDragClass: function() {
      clearTimeout(this._removeClassTimeout);
      this._removeClassTimeout = setTimeout(this._doRemoveDragClass, 10);
    },

    _doRemoveDragClass: function() {
      this.$.removeClass('is-dragging');
      this.$.find('[coral-fileupload-dropzone]').removeClass('is-dragging');
    },

    /**
      Handles clicks to submit buttons

      @private
    */
    _onSubmitButtonClick: function(event) {
      var target = event.matchedTarget;

      // Override or reset the action/method given the button's configuration
      this._buttonAction = target.getAttribute('formaction') || null;

      // Make sure the method provided by the button is valid
      var buttonMethod = transformMethod(target.getAttribute('formmethod'));
      this._buttonMethod = buttonMethod && isValidMethod(buttonMethod) ? buttonMethod : null;

      // Start the file upload
      this.upload();
    },

    /**
      Handles changes to the input element.

      @private
    */
    _onInputChange: function(event) {
      // Stop the current event
      event.stopPropagation();

      if (this.disabled) {
        return;
      }

      var self = this;
      var files = [];
      var items = [];

      if (this._useXHR2) {
        // Retrieve files for select event
        if (event.target.files && event.target.files.length) {
          this._clearQueue();
          files = event.target.files;

          // Verify if multiple file upload is allowed
          if (!this.multiple) {
            files = [files[0]];
          }
        }
        // Retrieve files for drop event
        else if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          this._clearQueue();
          files = event.dataTransfer.files;

          // Verify if multiple file upload is allowed
          if (!this.multiple) {
            files = [files[0]];
          }
        }
        else {
          return;
        }
      }
      else {
        this._clearQueue();
        files = [event.target];
      }

      // Initialize items
      for (var i = 0; i < files.length; i++) {
        items.push(new Coral.FileUpload.Item(files[i], this._useXHR2));
      }

      // Verify if file is allowed to be uploaded and trigger events accordingly
      items.forEach(function(item) {

        // If file is not found in uploadQueue using filename
        if (!self._getQueueItemByFilename(item.file.name)) {

          // Check file size
          if (self.sizeLimit && item.file.size > self.sizeLimit) {
            self.trigger('coral-fileupload:filesizeexceeded', {
              item: item
            });
          }
          // Check mime type
          else if (self.accept && !item._isMimeTypeAllowed(self.accept)) {
            self.trigger('coral-fileupload:filemimetyperejected', {
              item: item
            });
          }
          else {
            // Add item to queue
            self._uploadQueue.push(item);

            self.trigger('coral-fileupload:fileadded', {
              item: item
            });
          }
        }
      });

      if (this.autoStart) {
        this.upload();
      }

      // Explicitly re-emit the change event
      if (this._triggerChangeEvent) {
        this.trigger('change');
      }

      // Clear file input once files are added to the queue to make sure next file selection will trigger a change event
      if (this.async) {
        this._clearFileInputValue();
      }
    },

    /**
      Sets the disabled/readonly state of elements with the associated special attributes

      @private
    */
    _setElementState: function() {
      this.$.find(
        '[coral-fileupload-select],' +
        '[coral-fileupload-dropzone],' +
        '[coral-fileupload-submit],' +
        '[coral-fileupload-clear],' +
        '[coral-fileupload-abort],' +
        '[coral-fileupload-abortfile],' +
        '[coral-fileupload-removefile],' +
        '[coral-fileupload-uploadfile]'
      )
        .toggleClass('is-invalid', this.invalid)
        .toggleClass('is-disabled', this.disabled)
        .toggleClass('is-required', this.required)
        .toggleClass('is-readOnly', this.readOnly)
        .prop('disabled', this.disabled || this.readOnly);
    },

    /** @private */
    _clearQueue: function() {
      this._uploadQueue.slice().forEach(function(item) {
        this._clearFile(item.file.name);
      }.bind(this));
    },

    /**
      Remove a file or all files from the upload queue.

      @param {String} [filename]
        The filename of the file to remove. If a filename is not provided, all files will be removed.
    */
    clear: function(filename) {
      if (!this.async) {
        if (typeof filename === 'string') {
          throw new Error('Coral.FileUpload does not support removing a file from the queue on synchronous mode.');
        }
        this._clearQueue();
        this._clearFileInputValue();
      }
      else {
        if (typeof filename === 'string') {
          this._clearFile(filename);
        }
        else {
          this._clearQueue();
        }
      }
    },

    /**
      Clear file selection on the file input

      @private
    */
    _clearFileInputValue: function() {
      this._elements.input.value = '';

      // @polyfill ie9
      if (this._elements.input.value) {
        var input = this._elements.input.cloneNode();
        $(this._elements.input).replaceWith(input);
        this._elements.input = input;
      }
    },

    /**
      Remove a file from the upload queue.

      @param {String} filename
        The filename of the file to remove.

      @private
    */
    _clearFile: function(filename) {
      var item = this._getQueueItemByFilename(filename);
      if (item) {
        // Abort file upload
        this._abortFile(filename);

        // Remove file from queue
        this._uploadQueue.splice(this._getQueueIndex(filename), 1);

        this.trigger('coral-fileupload:fileremoved', {
          item: item
        });
      }
    },

    /**
      Uploads a file in the queue. If an array is provided as the first argument, it is used as the parameters.

      @param filename {String}
        The name of the file to upload.
      @param {Array.<Object>} [parameters]
        The filename of the file to upload.

      @private
    */
    _uploadFile: function(filename) {
      var item = this._getQueueItemByFilename(filename);
      if (item) {
        this._abortFile(filename);
        this._ajaxUpload(item);
      }
    },

    /**
      Uploads the given filename, or all the files into the queue. It accepts extra parameters that are sent with the
      file.

      @param {String} [filename]
        The name of the file to upload.
    */
    upload: function(filename) {
      if (!this.async) {
        if (typeof filename === 'string') {
          throw new Error('Coral.FileUpload does not support uploading a file from the queue on synchronous mode.');
        }

        var $form = this.$.parents('form');
        if (!$form.length) {
          $form = $(document.createElement('form'));
          $form
            .attr({
              method: this.method.toLowerCase(), // method is lowercase for consistency with other attributes
              enctype: 'multipart/form-data',
              action: this.action
            })
            .css('display', 'none');

          $(this._elements.input).wrap($form);

          Array.prototype.forEach.call(this.querySelectorAll('input[type="hidden"]'), function(input) {
            $form.append(input);
          });
        }

        $form.append($(document.createElement('input')).attr({
          type: 'hidden',
          name: '_charset_',
          value: 'utf-8'
        }));

        $form.trigger('submit');
      }
      else {
        if (typeof filename === 'string') {
          this._uploadFile(filename);
        }
        else {
          var self = this;
          self._uploadQueue.forEach(function(item) {
            self._abortFile(item.file.name);
            self._ajaxUpload(item);
          });
        }
      }
    },

    /** @private */
    _showFileDialog: function(event) {
      // Show the dialog
      // This ONLY works when the call stack traces back to another click event!
      this._elements.input.click();
    },

    /**
      Abort specific file upload.

      @param {String} filename
        The filename identifies the file to abort.

      @private
    */
    _abortFile: function(filename) {
      var item = this._getQueueItemByFilename(filename);
      if (item && item._xhr) {
        item._xhr.abort();
        item._xhr = null;
      }
    },

    /**
      Abort upload of a given file or all files in the queue.

      @param {String} [filename]
        The filename of the file to abort. If a filename is not provided, all files will be aborted.
    */
    abort: function(filename) {
      if (!this.async) {
        throw new Error('Coral.FileUpload does not support aborting file(s) upload on synchronous mode.');
      }

      if (typeof filename === 'string') {
        // Abort a single file
        this._abortFile(filename);
      }
      else {
        // Abort all files
        var self = this;
        self._uploadQueue.forEach(function(item) {
          self._abortFile(item.file.name);
        });
      }
    },

    /**
      Handles the ajax upload.

      @private
    */
    _ajaxUpload: function(item) {
      var self = this;

      // Use the action/method provided by the last button click, if provided
      var action = this._buttonAction || this.action;
      var requestMethod = this._buttonMethod ? this._buttonMethod.toUpperCase() : this.method;

      // We merge the global parameters with the specific file parameters and send them all together
      var parameters = self.parameters.concat(item.parameters);

      if (this._useXHR2 && window.FormData) {
        var formData = new FormData();

        parameters.forEach(function(additionalParameter) {
          formData.append(additionalParameter.name, additionalParameter.value);
        });

        formData.append('_charset_', 'utf-8');
        formData.append(this.name, item.file);

        // Store the XHR on the item itself
        item._xhr = new XMLHttpRequest();

        // Opening before being able to set response type to avoid IE11 InvalidStateError
        item._xhr.open(requestMethod, action);

        // Reflect specific xhr properties
        item._xhr.timeout = item.timeout;
        item._xhr.responseType = item.responseType;
        item._xhr.withCredentials = item.withCredentials;

        XHR_EVENT_NAMES.forEach(function(name) {
          // Progress event is the only event among other ProgressEvents that can trigger multiple times.
          // Hence it's the only one that gives away usable progress information.
          var isProgressEvent = (name === 'progress');
          (isProgressEvent ? item._xhr.upload : item._xhr).addEventListener(name, function(event) {
            var detail = {
              item: item,
              action: action,
              method: requestMethod
            };

            if (isProgressEvent) {
              detail.lengthComputable = event.lengthComputable;
              detail.loaded = event.loaded;
              detail.total = event.total;
            }

            self.trigger('coral-fileupload:' + name, detail);
          });
        });

        item._xhr.send(formData);
      }
      // @polyfill IE9
      else {
        // Build an iframe
        var iframeName = 'upload-' + new Date().getTime();
        var $iframe = $(document.createElement('iframe'));
        $iframe
          .attr('name', iframeName)
          .css('display', 'none')
          .appendTo(self);

        // Build a form
        var $form = $(document.createElement('form'));
        $form
          .attr({
            method: requestMethod.toLowerCase(), // method is lowercase for consistency with other attributes
            enctype: 'multipart/form-data',
            action: action,
            target: iframeName
          })
          .css('display', 'none');

        $(self._elements.input).wrap($form);

        $form = self.$.find('form[target="' + iframeName + '"]');

        // Add extra parameters
        parameters.forEach(function(param) {
          $form.append($(document.createElement('input')).attr({
            type: 'hidden',
            name: param.name,
            value: param.value
          }));
        });

        $form.append($(document.createElement('input')).attr({
          type: 'hidden',
          name: '_charset_',
          value: 'utf-8'
        }));

        $iframe.one('load', function() {
          // Clean-up
          $form.children('input[type="hidden"]').remove();
          $(self._elements.input).unwrap();
          $iframe.remove();

          self.trigger('coral-fileupload:loadend', {
            item: item,
            action: action,
            method: requestMethod
          });
        });

        $form.trigger('submit');
        self.trigger('coral-fileupload:loadstart', {
          item: item,
          action: action,
          method: requestMethod
        });
      }
    },

    /** @private */
    _getQueueItemByFilename: function(filename) {
      return this._getQueueItem(this._getQueueIndex(filename));
    },

    /** @private */
    _getQueueItem: function(index) {
      return index > -1 ? this._uploadQueue[index] : null;
    },

    /** @private */
    _getQueueIndex: function(filename) {
      var index = -1;
      this._uploadQueue.some(function(item, i) {
        if (item.file.name === filename) {
          index = i;
          return true;
        }
      });
      return index;
    },

    /** @ignore */
    _initialize: function() {
      this._useXHR2 = useXHR2();
      this._uploadQueue = [];

      this._doAddDragClass = this._doAddDragClass.bind(this);
      this._doRemoveDragClass = this._doRemoveDragClass.bind(this);
    },

    /** @ignore */
    _render: function() {
      // Fetch additional parameters if any
      var parameters = [];
      Array.prototype.forEach.call(this.querySelectorAll('input[type="hidden"]'), function(input) {
        parameters.push({
          name: input.name,
          value: input.value
        });
      });
      this.parameters = parameters;

      // Create a temporary fragment
      var fragment = document.createDocumentFragment();

      // Render the template
      fragment.appendChild(Coral.templates.FileUpload.base.call(this._elements));

      // Add the frag to the component
      this.appendChild(fragment);
    }

    /**
      Triggered when a file size exceeds the file size limit.

      @event Coral.FileUpload#coral-fileupload:filesizeexceeded

      @param {Object} event
        Event object
      @param {Coral.FileUpload.Item} event.detail.item
        The rejected FileUpload item.
    */

    /**
      Triggered when a file is rejected due to its MIME type.

      @event Coral.FileUpload#coral-fileupload:filemimetyperejected

      @param {Object} event
        Event object
      @param {Coral.FileUpload.Item} event.detail.item
        The rejected FileUpload item.
    */

    /**
      Triggered when a file is added to the queue.

      @event Coral.FileUpload#coral-fileupload:fileadded

      @param {Object} event
        Event object
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when a file is removed from the queue.

      @event Coral.FileUpload#coral-fileupload:fileremoved

      @param {Object} event
        Event object
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when the upload has begun.

      @event Coral.FileUpload#coral-fileupload:loadstart

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when the upload has successfully finished. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:load

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when the upload is stopped.

      @event Coral.FileUpload#coral-fileupload:loadend

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered every time the readyState changes. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:readystatechange

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered during upload progress. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:progress

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
      @param {Boolean} event.detail.lengthComputable
        Whether the upload progress can be calculated.
      @param {Number} event.detail.loaded
        The upload progress in bytes.
      @param {Number} event.detail.total
        The total upload size in bytes.
    */

    /**
      Triggered when the upload reaches a timeout. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:timeout

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when the upload fails. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:error

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when the upload is terminated. Does not trigger in IE9.

      @event Coral.FileUpload#coral-fileupload:abort

      @param {Object} event
        Event object
      @param {Object} event.detail.action
        The URL the file is being uploaded to.
      @param {Coral.FileUpload.method} event.detail.method
        HTTP method used to upload.
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */

    /**
      Triggered when a file enters a dropzone.

      @event Coral.FileUpload#coral-fileupload:dragenter

      @param {Object} event
        Event object
    */

    /**
      Triggered when a file is being dragged over a dropzone.

      @event Coral.FileUpload#coral-fileupload:dragover

      @param {Object} event
        Event object
    */

    /**
      Triggered when a file is dragged out of a dropzone.

      @event Coral.FileUpload#coral-fileupload:dragleave

      @param {Object} event
        Event object
    */

    /**
      Triggered when a file is dropped on a dropzone.

      @event Coral.FileUpload#coral-fileupload:drop

      @param {Object} event
        Event object
      @param {Coral.FileUpload.Item} event.detail.item
        FileUpload item.
    */
  });

  // Expose enumerations
  Coral.FileUpload.method = method;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Response types.

    @enum {String}
    @memberof Coral.FileUpload.Item
  */
  var responseType = {
    /** String type. */
    TEXT: 'text',
    /** Array buffer type. */
    ARRAY_BUFFER: 'arraybuffer',
    /** Blob type. */
    BLOB: 'blob',
    /** Document type. */
    DOCUMENT: 'document',
    /** JavaScript object, parsed from a JSON string returned by the server. */
    JSON: 'json'
  };

  // Required as the file input "accept" attribute is not supported on IE9
  // @polyfill IE9
  var MIME_TYPE_REGEXP = /(.+)\/(.+)$/; // eg text/plain
  var FILE_EXTENSION_REGEXP = /\.(.+)$/; // eg .txt
  var SHORTCUT_REGEXP = /.*/; // eg text
  var MIME_TYPE_AUDIO = 'audio/*';
  var MIME_TYPE_IMAGE = 'image/*';
  var MIME_TYPE_VIDEO = 'video/*';
  var MIME_TYPES = {
    '.123': 'application/vnd.lotus-1-2-3',
    '.3dml': 'text/vnd.in3d.3dml',
    '.3g2': 'video/3gpp2',
    '.3gp': 'video/3gpp',
    '.a': 'application/octet-stream',
    '.aab': 'application/x-authorware-bin',
    '.aac': 'audio/x-aac',
    '.aam': 'application/x-authorware-map',
    '.aas': 'application/x-authorware-seg',
    '.abw': 'application/x-abiword',
    '.acc': 'application/vnd.americandynamics.acc',
    '.ace': 'application/x-ace-compressed',
    '.acu': 'application/vnd.acucobol',
    '.acutc': 'application/vnd.acucorp',
    '.adp': 'audio/adpcm',
    '.aep': 'application/vnd.audiograph',
    '.afm': 'application/x-font-type1',
    '.afp': 'application/vnd.ibm.modcap',
    '.ai': 'application/postscript',
    '.aif': 'audio/x-aiff',
    '.aifc': 'audio/x-aiff',
    '.aiff': 'audio/x-aiff',
    '.air': 'application/vnd.adobe.air-application-installer-package+zip',
    '.ami': 'application/vnd.amiga.ami',
    '.apk': 'application/vnd.android.package-archive',
    '.application': 'application/x-ms-application',
    '.apr': 'application/vnd.lotus-approach',
    '.asc': 'application/pgp-signature',
    '.asf': 'video/x-ms-asf',
    '.asm': 'text/x-asm',
    '.aso': 'application/vnd.accpac.simply.aso',
    '.asx': 'video/x-ms-asf',
    '.atc': 'application/vnd.acucorp',
    '.atom': 'application/atom+xml',
    '.atomcat': 'application/atomcat+xml',
    '.atomsvc': 'application/atomsvc+xml',
    '.atx': 'application/vnd.antix.game-component',
    '.au': 'audio/basic',
    '.avi': 'video/x-msvideo',
    '.aw': 'application/applixware',
    '.azf': 'application/vnd.airzip.filesecure.azf',
    '.azs': 'application/vnd.airzip.filesecure.azs',
    '.azw': 'application/vnd.amazon.ebook',
    '.bat': 'application/x-msdownload',
    '.bcpio': 'application/x-bcpio',
    '.bdf': 'application/x-font-bdf',
    '.bdm': 'application/vnd.syncml.dm+wbxml',
    '.bh2': 'application/vnd.fujitsu.oasysprs',
    '.bin': 'application/octet-stream',
    '.bmi': 'application/vnd.bmi',
    '.bmp': 'image/bmp',
    '.book': 'application/vnd.framemaker',
    '.box': 'application/vnd.previewsystems.box',
    '.boz': 'application/x-bzip2',
    '.bpk': 'application/octet-stream',
    '.btif': 'image/prs.btif',
    '.bz': 'application/x-bzip',
    '.bz2': 'application/x-bzip2',
    '.c': 'text/x-c',
    '.c4d': 'application/vnd.clonk.c4group',
    '.c4f': 'application/vnd.clonk.c4group',
    '.c4g': 'application/vnd.clonk.c4group',
    '.c4p': 'application/vnd.clonk.c4group',
    '.c4u': 'application/vnd.clonk.c4group',
    '.cab': 'application/vnd.ms-cab-compressed',
    '.car': 'application/vnd.curl.car',
    '.cat': 'application/vnd.ms-pki.seccat',
    '.cc': 'text/x-c',
    '.cct': 'application/x-director',
    '.ccxml': 'application/ccxml+xml',
    '.cdbcmsg': 'application/vnd.contact.cmsg',
    '.cdf': 'application/x-netcdf',
    '.cdkey': 'application/vnd.mediastation.cdkey',
    '.cdx': 'chemical/x-cdx',
    '.cdxml': 'application/vnd.chemdraw+xml',
    '.cdy': 'application/vnd.cinderella',
    '.cer': 'application/pkix-cert',
    '.cgm': 'image/cgm',
    '.chat': 'application/x-chat',
    '.chm': 'application/vnd.ms-htmlhelp',
    '.chrt': 'application/vnd.kde.kchart',
    '.cif': 'chemical/x-cif',
    '.cii': 'application/vnd.anser-web-certificate-issue-initiation',
    '.cil': 'application/vnd.ms-artgalry',
    '.cla': 'application/vnd.claymore',
    '.class': 'application/java-vm',
    '.clkk': 'application/vnd.crick.clicker.keyboard',
    '.clkp': 'application/vnd.crick.clicker.palette',
    '.clkt': 'application/vnd.crick.clicker.template',
    '.clkw': 'application/vnd.crick.clicker.wordbank',
    '.clkx': 'application/vnd.crick.clicker',
    '.clp': 'application/x-msclip',
    '.cmc': 'application/vnd.cosmocaller',
    '.cmdf': 'chemical/x-cmdf',
    '.cml': 'chemical/x-cml',
    '.cmp': 'application/vnd.yellowriver-custom-menu',
    '.cmx': 'image/x-cmx',
    '.cod': 'application/vnd.rim.cod',
    '.com': 'application/x-msdownload',
    '.conf': 'text/plain',
    '.cpio': 'application/x-cpio',
    '.cpp': 'text/x-c',
    '.cpt': 'application/mac-compactpro',
    '.crd': 'application/x-mscardfile',
    '.crl': 'application/pkix-crl',
    '.crt': 'application/x-x509-ca-cert',
    '.csh': 'application/x-csh',
    '.csml': 'chemical/x-csml',
    '.csp': 'application/vnd.commonspace',
    '.css': 'text/css',
    '.cst': 'application/x-director',
    '.csv': 'text/csv',
    '.cu': 'application/cu-seeme',
    '.curl': 'text/vnd.curl',
    '.cww': 'application/prs.cww',
    '.cxt': 'application/x-director',
    '.cxx': 'text/x-c',
    '.daf': 'application/vnd.mobius.daf',
    '.dataless': 'application/vnd.fdsn.seed',
    '.davmount': 'application/davmount+xml',
    '.dcr': 'application/x-director',
    '.dcurl': 'text/vnd.curl.dcurl',
    '.dd2': 'application/vnd.oma.dd2+xml',
    '.ddd': 'application/vnd.fujixerox.ddd',
    '.deb': 'application/x-debian-package',
    '.def': 'text/plain',
    '.deploy': 'application/octet-stream',
    '.der': 'application/x-x509-ca-cert',
    '.dfac': 'application/vnd.dreamfactory',
    '.dic': 'text/x-c',
    '.diff': 'text/plain',
    '.dir': 'application/x-director',
    '.dis': 'application/vnd.mobius.dis',
    '.dist': 'application/octet-stream',
    '.distz': 'application/octet-stream',
    '.djv': 'image/vnd.djvu',
    '.djvu': 'image/vnd.djvu',
    '.dll': 'application/x-msdownload',
    '.dmg': 'application/octet-stream',
    '.dms': 'application/octet-stream',
    '.dna': 'application/vnd.dna',
    '.doc': 'application/msword',
    '.docm': 'application/vnd.ms-word.document.macroenabled.12',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.dot': 'application/msword',
    '.dotm': 'application/vnd.ms-word.template.macroenabled.12',
    '.dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    '.dp': 'application/vnd.osgi.dp',
    '.dpg': 'application/vnd.dpgraph',
    '.dsc': 'text/prs.lines.tag',
    '.dtb': 'application/x-dtbook+xml',
    '.dtd': 'application/xml-dtd',
    '.dts': 'audio/vnd.dts',
    '.dtshd': 'audio/vnd.dts.hd',
    '.dump': 'application/octet-stream',
    '.dvi': 'application/x-dvi',
    '.dwf': 'model/vnd.dwf',
    '.dwg': 'image/vnd.dwg',
    '.dxf': 'image/vnd.dxf',
    '.dxp': 'application/vnd.spotfire.dxp',
    '.dxr': 'application/x-director',
    '.ecelp4800': 'audio/vnd.nuera.ecelp4800',
    '.ecelp7470': 'audio/vnd.nuera.ecelp7470',
    '.ecelp9600': 'audio/vnd.nuera.ecelp9600',
    '.ecma': 'application/ecmascript',
    '.edm': 'application/vnd.novadigm.edm',
    '.edx': 'application/vnd.novadigm.edx',
    '.efif': 'application/vnd.picsel',
    '.ei6': 'application/vnd.pg.osasli',
    '.elc': 'application/octet-stream',
    '.eml': 'message/rfc822',
    '.emma': 'application/emma+xml',
    '.eol': 'audio/vnd.digital-winds',
    '.eot': 'application/vnd.ms-fontobject',
    '.eps': 'application/postscript',
    '.epub': 'application/epub+zip',
    '.es3': 'application/vnd.eszigno3+xml',
    '.esf': 'application/vnd.epson.esf',
    '.et3': 'application/vnd.eszigno3+xml',
    '.etx': 'text/x-setext',
    '.exe': 'application/x-msdownload',
    '.ext': 'application/vnd.novadigm.ext',
    '.ez': 'application/andrew-inset',
    '.ez2': 'application/vnd.ezpix-album',
    '.ez3': 'application/vnd.ezpix-package',
    '.f': 'text/x-fortran',
    '.f4v': 'video/x-f4v',
    '.f77': 'text/x-fortran',
    '.f90': 'text/x-fortran',
    '.fbs': 'image/vnd.fastbidsheet',
    '.fdf': 'application/vnd.fdf',
    '.fe_launch': 'application/vnd.denovo.fcselayout-link',
    '.fg5': 'application/vnd.fujitsu.oasysgp',
    '.fgd': 'application/x-director',
    '.fh': 'image/x-freehand',
    '.fh4': 'image/x-freehand',
    '.fh5': 'image/x-freehand',
    '.fh7': 'image/x-freehand',
    '.fhc': 'image/x-freehand',
    '.fig': 'application/x-xfig',
    '.fli': 'video/x-fli',
    '.flo': 'application/vnd.micrografx.flo',
    '.flv': 'video/x-flv',
    '.flw': 'application/vnd.kde.kivio',
    '.flx': 'text/vnd.fmi.flexstor',
    '.fly': 'text/vnd.fly',
    '.fm': 'application/vnd.framemaker',
    '.fnc': 'application/vnd.frogans.fnc',
    '.for': 'text/x-fortran',
    '.fpx': 'image/vnd.fpx',
    '.frame': 'application/vnd.framemaker',
    '.fsc': 'application/vnd.fsc.weblaunch',
    '.fst': 'image/vnd.fst',
    '.ftc': 'application/vnd.fluxtime.clip',
    '.fti': 'application/vnd.anser-web-funds-transfer-initiation',
    '.fvt': 'video/vnd.fvt',
    '.fzs': 'application/vnd.fuzzysheet',
    '.g3': 'image/g3fax',
    '.gac': 'application/vnd.groove-account',
    '.gdl': 'model/vnd.gdl',
    '.geo': 'application/vnd.dynageo',
    '.gex': 'application/vnd.geometry-explorer',
    '.ggb': 'application/vnd.geogebra.file',
    '.ggt': 'application/vnd.geogebra.tool',
    '.ghf': 'application/vnd.groove-help',
    '.gif': 'image/gif',
    '.gim': 'application/vnd.groove-identity-message',
    '.gmx': 'application/vnd.gmx',
    '.gnumeric': 'application/x-gnumeric',
    '.gph': 'application/vnd.flographit',
    '.gqf': 'application/vnd.grafeq',
    '.gqs': 'application/vnd.grafeq',
    '.gram': 'application/srgs',
    '.gre': 'application/vnd.geometry-explorer',
    '.grv': 'application/vnd.groove-injector',
    '.grxml': 'application/srgs+xml',
    '.gsf': 'application/x-font-ghostscript',
    '.gtar': 'application/x-gtar',
    '.gtm': 'application/vnd.groove-tool-message',
    '.gtw': 'model/vnd.gtw',
    '.gv': 'text/vnd.graphviz',
    '.gz': 'application/x-gzip',
    '.h': 'text/x-c',
    '.h261': 'video/h261',
    '.h263': 'video/h263',
    '.h264': 'video/h264',
    '.hbci': 'application/vnd.hbci',
    '.hdf': 'application/x-hdf',
    '.hh': 'text/x-c',
    '.hlp': 'application/winhlp',
    '.hpgl': 'application/vnd.hp-hpgl',
    '.hpid': 'application/vnd.hp-hpid',
    '.hps': 'application/vnd.hp-hps',
    '.hqx': 'application/mac-binhex40',
    '.htke': 'application/vnd.kenameaapp',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.hvd': 'application/vnd.yamaha.hv-dic',
    '.hvp': 'application/vnd.yamaha.hv-voice',
    '.hvs': 'application/vnd.yamaha.hv-script',
    '.icc': 'application/vnd.iccprofile',
    '.ice': 'x-conference/x-cooltalk',
    '.icm': 'application/vnd.iccprofile',
    '.ico': 'image/x-icon',
    '.ics': 'text/calendar',
    '.ief': 'image/ief',
    '.ifb': 'text/calendar',
    '.ifm': 'application/vnd.shana.informed.formdata',
    '.iges': 'model/iges',
    '.igl': 'application/vnd.igloader',
    '.igs': 'model/iges',
    '.igx': 'application/vnd.micrografx.igx',
    '.iif': 'application/vnd.shana.informed.interchange',
    '.imp': 'application/vnd.accpac.simply.imp',
    '.ims': 'application/vnd.ms-ims',
    '.in': 'text/plain',
    '.ipk': 'application/vnd.shana.informed.package',
    '.irm': 'application/vnd.ibm.rights-management',
    '.irp': 'application/vnd.irepository.package+xml',
    '.iso': 'application/octet-stream',
    '.itp': 'application/vnd.shana.informed.formtemplate',
    '.ivp': 'application/vnd.immervision-ivp',
    '.ivu': 'application/vnd.immervision-ivu',
    '.jad': 'text/vnd.sun.j2me.app-descriptor',
    '.jam': 'application/vnd.jam',
    '.jar': 'application/java-archive',
    '.java': 'text/x-java-source',
    '.jisp': 'application/vnd.jisp',
    '.jlt': 'application/vnd.hp-jlyt',
    '.jnlp': 'application/x-java-jnlp-file',
    '.joda': 'application/vnd.joost.joda-archive',
    '.jpe': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.jpgm': 'video/jpm',
    '.jpgv': 'video/jpeg',
    '.jpm': 'video/jpm',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.kar': 'audio/midi',
    '.karbon': 'application/vnd.kde.karbon',
    '.kfo': 'application/vnd.kde.kformula',
    '.kia': 'application/vnd.kidspiration',
    '.kil': 'application/x-killustrator',
    '.kml': 'application/vnd.google-earth.kml+xml',
    '.kmz': 'application/vnd.google-earth.kmz',
    '.kne': 'application/vnd.kinar',
    '.knp': 'application/vnd.kinar',
    '.kon': 'application/vnd.kde.kontour',
    '.kpr': 'application/vnd.kde.kpresenter',
    '.kpt': 'application/vnd.kde.kpresenter',
    '.ksh': 'text/plain',
    '.ksp': 'application/vnd.kde.kspread',
    '.ktr': 'application/vnd.kahootz',
    '.ktz': 'application/vnd.kahootz',
    '.kwd': 'application/vnd.kde.kword',
    '.kwt': 'application/vnd.kde.kword',
    '.latex': 'application/x-latex',
    '.lbd': 'application/vnd.llamagraphics.life-balance.desktop',
    '.lbe': 'application/vnd.llamagraphics.life-balance.exchange+xml',
    '.les': 'application/vnd.hhe.lesson-player',
    '.lha': 'application/octet-stream',
    '.link66': 'application/vnd.route66.link66+xml',
    '.list': 'text/plain',
    '.list3820': 'application/vnd.ibm.modcap',
    '.listafp': 'application/vnd.ibm.modcap',
    '.log': 'text/plain',
    '.lostxml': 'application/lost+xml',
    '.lrf': 'application/octet-stream',
    '.lrm': 'application/vnd.ms-lrm',
    '.ltf': 'application/vnd.frogans.ltf',
    '.lvp': 'audio/vnd.lucent.voice',
    '.lwp': 'application/vnd.lotus-wordpro',
    '.lzh': 'application/octet-stream',
    '.m13': 'application/x-msmediaview',
    '.m14': 'application/x-msmediaview',
    '.m1v': 'video/mpeg',
    '.m2a': 'audio/mpeg',
    '.m2v': 'video/mpeg',
    '.m3a': 'audio/mpeg',
    '.m3u': 'audio/x-mpegurl',
    '.m4u': 'video/vnd.mpegurl',
    '.m4v': 'video/x-m4v',
    '.ma': 'application/mathematica',
    '.mag': 'application/vnd.ecowin.chart',
    '.maker': 'application/vnd.framemaker',
    '.man': 'text/troff',
    '.mathml': 'application/mathml+xml',
    '.mb': 'application/mathematica',
    '.mbk': 'application/vnd.mobius.mbk',
    '.mbox': 'application/mbox',
    '.mc1': 'application/vnd.medcalcdata',
    '.mcd': 'application/vnd.mcd',
    '.mcurl': 'text/vnd.curl.mcurl',
    '.mdb': 'application/x-msaccess',
    '.mdi': 'image/vnd.ms-modi',
    '.me': 'text/troff',
    '.mesh': 'model/mesh',
    '.mfm': 'application/vnd.mfmp',
    '.mgz': 'application/vnd.proteus.magazine',
    '.mht': 'message/rfc822',
    '.mhtml': 'message/rfc822',
    '.mid': 'audio/midi',
    '.midi': 'audio/midi',
    '.mif': 'application/vnd.mif',
    '.mime': 'message/rfc822',
    '.mj2': 'video/mj2',
    '.mjp2': 'video/mj2',
    '.mlp': 'application/vnd.dolby.mlp',
    '.mmd': 'application/vnd.chipnuts.karaoke-mmd',
    '.mmf': 'application/vnd.smaf',
    '.mmr': 'image/vnd.fujixerox.edmics-mmr',
    '.mny': 'application/x-msmoney',
    '.mobi': 'application/x-mobipocket-ebook',
    '.mov': 'video/quicktime',
    '.movie': 'video/x-sgi-movie',
    '.mp2': 'audio/mpeg',
    '.mp2a': 'audio/mpeg',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.mp4a': 'audio/mp4',
    '.mp4s': 'application/mp4',
    '.mp4v': 'video/mp4',
    '.mpa': 'video/mpeg',
    '.mpc': 'application/vnd.mophun.certificate',
    '.mpe': 'video/mpeg',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.mpg4': 'video/mp4',
    '.mpga': 'audio/mpeg',
    '.mpkg': 'application/vnd.apple.installer+xml',
    '.mpm': 'application/vnd.blueice.multipass',
    '.mpn': 'application/vnd.mophun.application',
    '.mpp': 'application/vnd.ms-project',
    '.mpt': 'application/vnd.ms-project',
    '.mpy': 'application/vnd.ibm.minipay',
    '.mqy': 'application/vnd.mobius.mqy',
    '.mrc': 'application/marc',
    '.ms': 'text/troff',
    '.mscml': 'application/mediaservercontrol+xml',
    '.mseed': 'application/vnd.fdsn.mseed',
    '.mseq': 'application/vnd.mseq',
    '.msf': 'application/vnd.epson.msf',
    '.msh': 'model/mesh',
    '.msi': 'application/x-msdownload',
    '.msl': 'application/vnd.mobius.msl',
    '.msty': 'application/vnd.muvee.style',
    '.mts': 'model/vnd.mts',
    '.mus': 'application/vnd.musician',
    '.musicxml': 'application/vnd.recordare.musicxml+xml',
    '.mvb': 'application/x-msmediaview',
    '.mwf': 'application/vnd.mfer',
    '.mxf': 'application/mxf',
    '.mxl': 'application/vnd.recordare.musicxml',
    '.mxml': 'application/xv+xml',
    '.mxs': 'application/vnd.triscape.mxs',
    '.mxu': 'video/vnd.mpegurl',
    '.n-gage': 'application/vnd.nokia.n-gage.symbian.install',
    '.nb': 'application/mathematica',
    '.nc': 'application/x-netcdf',
    '.ncx': 'application/x-dtbncx+xml',
    '.ngdat': 'application/vnd.nokia.n-gage.data',
    '.nlu': 'application/vnd.neurolanguage.nlu',
    '.nml': 'application/vnd.enliven',
    '.nnd': 'application/vnd.noblenet-directory',
    '.nns': 'application/vnd.noblenet-sealer',
    '.nnw': 'application/vnd.noblenet-web',
    '.npx': 'image/vnd.net-fpx',
    '.nsf': 'application/vnd.lotus-notes',
    '.nws': 'message/rfc822',
    '.o': 'application/octet-stream',
    '.oa2': 'application/vnd.fujitsu.oasys2',
    '.oa3': 'application/vnd.fujitsu.oasys3',
    '.oas': 'application/vnd.fujitsu.oasys',
    '.obd': 'application/x-msbinder',
    '.obj': 'application/octet-stream',
    '.oda': 'application/oda',
    '.odb': 'application/vnd.oasis.opendocument.database',
    '.odc': 'application/vnd.oasis.opendocument.chart',
    '.odf': 'application/vnd.oasis.opendocument.formula',
    '.odft': 'application/vnd.oasis.opendocument.formula-template',
    '.odg': 'application/vnd.oasis.opendocument.graphics',
    '.odi': 'application/vnd.oasis.opendocument.image',
    '.odp': 'application/vnd.oasis.opendocument.presentation',
    '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.oga': 'audio/ogg',
    '.ogg': 'audio/ogg',
    '.ogv': 'video/ogg',
    '.ogx': 'application/ogg',
    '.onepkg': 'application/onenote',
    '.onetmp': 'application/onenote',
    '.onetoc': 'application/onenote',
    '.onetoc2': 'application/onenote',
    '.opf': 'application/oebps-package+xml',
    '.oprc': 'application/vnd.palm',
    '.org': 'application/vnd.lotus-organizer',
    '.osf': 'application/vnd.yamaha.openscoreformat',
    '.osfpvg': 'application/vnd.yamaha.openscoreformat.osfpvg+xml',
    '.otc': 'application/vnd.oasis.opendocument.chart-template',
    '.otf': 'application/x-font-otf',
    '.otg': 'application/vnd.oasis.opendocument.graphics-template',
    '.oth': 'application/vnd.oasis.opendocument.text-web',
    '.oti': 'application/vnd.oasis.opendocument.image-template',
    '.otm': 'application/vnd.oasis.opendocument.text-master',
    '.otp': 'application/vnd.oasis.opendocument.presentation-template',
    '.ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
    '.ott': 'application/vnd.oasis.opendocument.text-template',
    '.oxt': 'application/vnd.openofficeorg.extension',
    '.p': 'text/x-pascal',
    '.p10': 'application/pkcs10',
    '.p12': 'application/x-pkcs12',
    '.p7b': 'application/x-pkcs7-certificates',
    '.p7c': 'application/pkcs7-mime',
    '.p7m': 'application/pkcs7-mime',
    '.p7r': 'application/x-pkcs7-certreqresp',
    '.p7s': 'application/pkcs7-signature',
    '.pas': 'text/x-pascal',
    '.pbd': 'application/vnd.powerbuilder6',
    '.pbm': 'image/x-portable-bitmap',
    '.pcf': 'application/x-font-pcf',
    '.pcl': 'application/vnd.hp-pcl',
    '.pclxl': 'application/vnd.hp-pclxl',
    '.pct': 'image/x-pict',
    '.pcurl': 'application/vnd.curl.pcurl',
    '.pcx': 'image/x-pcx',
    '.pdb': 'application/vnd.palm',
    '.pdf': 'application/pdf',
    '.pfa': 'application/x-font-type1',
    '.pfb': 'application/x-font-type1',
    '.pfm': 'application/x-font-type1',
    '.pfr': 'application/font-tdpfr',
    '.pfx': 'application/x-pkcs12',
    '.pgm': 'image/x-portable-graymap',
    '.pgn': 'application/x-chess-pgn',
    '.pgp': 'application/pgp-encrypted',
    '.pic': 'image/x-pict',
    '.pkg': 'application/octet-stream',
    '.pki': 'application/pkixcmp',
    '.pkipath': 'application/pkix-pkipath',
    '.pl': 'text/plain',
    '.plb': 'application/vnd.3gpp.pic-bw-large',
    '.plc': 'application/vnd.mobius.plc',
    '.plf': 'application/vnd.pocketlearn',
    '.pls': 'application/pls+xml',
    '.pml': 'application/vnd.ctc-posml',
    '.png': 'image/png',
    '.pnm': 'image/x-portable-anymap',
    '.portpkg': 'application/vnd.macports.portpkg',
    '.pot': 'application/vnd.ms-powerpoint',
    '.potm': 'application/vnd.ms-powerpoint.template.macroenabled.12',
    '.potx': 'application/vnd.openxmlformats-officedocument.presentationml.template',
    '.ppa': 'application/vnd.ms-powerpoint',
    '.ppam': 'application/vnd.ms-powerpoint.addin.macroenabled.12',
    '.ppd': 'application/vnd.cups-ppd',
    '.ppm': 'image/x-portable-pixmap',
    '.pps': 'application/vnd.ms-powerpoint',
    '.ppsm': 'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
    '.ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptm': 'application/vnd.ms-powerpoint.presentation.macroenabled.12',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.pqa': 'application/vnd.palm',
    '.prc': 'application/x-mobipocket-ebook',
    '.pre': 'application/vnd.lotus-freelance',
    '.prf': 'application/pics-rules',
    '.ps': 'application/postscript',
    '.psb': 'application/vnd.3gpp.pic-bw-small',
    '.psd': 'image/vnd.adobe.photoshop',
    '.psf': 'application/x-font-linux-psf',
    '.ptid': 'application/vnd.pvi.ptid1',
    '.pub': 'application/x-mspublisher',
    '.pvb': 'application/vnd.3gpp.pic-bw-var',
    '.pwn': 'application/vnd.3m.post-it-notes',
    '.pwz': 'application/vnd.ms-powerpoint',
    '.py': 'text/x-python',
    '.pya': 'audio/vnd.ms-playready.media.pya',
    '.pyc': 'application/x-python-code',
    '.pyo': 'application/x-python-code',
    '.pyv': 'video/vnd.ms-playready.media.pyv',
    '.qam': 'application/vnd.epson.quickanime',
    '.qbo': 'application/vnd.intu.qbo',
    '.qfx': 'application/vnd.intu.qfx',
    '.qps': 'application/vnd.publishare-delta-tree',
    '.qt': 'video/quicktime',
    '.qwd': 'application/vnd.quark.quarkxpress',
    '.qwt': 'application/vnd.quark.quarkxpress',
    '.qxb': 'application/vnd.quark.quarkxpress',
    '.qxd': 'application/vnd.quark.quarkxpress',
    '.qxl': 'application/vnd.quark.quarkxpress',
    '.qxt': 'application/vnd.quark.quarkxpress',
    '.ra': 'audio/x-pn-realaudio',
    '.ram': 'audio/x-pn-realaudio',
    '.rar': 'application/x-rar-compressed',
    '.ras': 'image/x-cmu-raster',
    '.rcprofile': 'application/vnd.ipunplugged.rcprofile',
    '.rdf': 'application/rdf+xml',
    '.rdz': 'application/vnd.data-vision.rdz',
    '.rep': 'application/vnd.businessobjects',
    '.res': 'application/x-dtbresource+xml',
    '.rgb': 'image/x-rgb',
    '.rif': 'application/reginfo+xml',
    '.rl': 'application/resource-lists+xml',
    '.rlc': 'image/vnd.fujixerox.edmics-rlc',
    '.rld': 'application/resource-lists-diff+xml',
    '.rm': 'application/vnd.rn-realmedia',
    '.rmi': 'audio/midi',
    '.rmp': 'audio/x-pn-realaudio-plugin',
    '.rms': 'application/vnd.jcp.javame.midlet-rms',
    '.rnc': 'application/relax-ng-compact-syntax',
    '.roff': 'text/troff',
    '.rpm': 'application/x-rpm',
    '.rpss': 'application/vnd.nokia.radio-presets',
    '.rpst': 'application/vnd.nokia.radio-preset',
    '.rq': 'application/sparql-query',
    '.rs': 'application/rls-services+xml',
    '.rsd': 'application/rsd+xml',
    '.rss': 'application/rss+xml',
    '.rtf': 'application/rtf',
    '.rtx': 'text/richtext',
    '.s': 'text/x-asm',
    '.saf': 'application/vnd.yamaha.smaf-audio',
    '.sbml': 'application/sbml+xml',
    '.sc': 'application/vnd.ibm.secure-container',
    '.scd': 'application/x-msschedule',
    '.scm': 'application/vnd.lotus-screencam',
    '.scq': 'application/scvp-cv-request',
    '.scs': 'application/scvp-cv-response',
    '.scurl': 'text/vnd.curl.scurl',
    '.sda': 'application/vnd.stardivision.draw',
    '.sdc': 'application/vnd.stardivision.calc',
    '.sdd': 'application/vnd.stardivision.impress',
    '.sdkd': 'application/vnd.solent.sdkm+xml',
    '.sdkm': 'application/vnd.solent.sdkm+xml',
    '.sdp': 'application/sdp',
    '.sdw': 'application/vnd.stardivision.writer',
    '.see': 'application/vnd.seemail',
    '.seed': 'application/vnd.fdsn.seed',
    '.sema': 'application/vnd.sema',
    '.semd': 'application/vnd.semd',
    '.semf': 'application/vnd.semf',
    '.ser': 'application/java-serialized-object',
    '.setpay': 'application/set-payment-initiation',
    '.setreg': 'application/set-registration-initiation',
    '.sfd-hdstx': 'application/vnd.hydrostatix.sof-data',
    '.sfs': 'application/vnd.spotfire.sfs',
    '.sgl': 'application/vnd.stardivision.writer-global',
    '.sgm': 'text/sgml',
    '.sgml': 'text/sgml',
    '.sh': 'application/x-sh',
    '.shar': 'application/x-shar',
    '.shf': 'application/shf+xml',
    '.si': 'text/vnd.wap.si',
    '.sic': 'application/vnd.wap.sic',
    '.sig': 'application/pgp-signature',
    '.silo': 'model/mesh',
    '.sis': 'application/vnd.symbian.install',
    '.sisx': 'application/vnd.symbian.install',
    '.sit': 'application/x-stuffit',
    '.sitx': 'application/x-stuffitx',
    '.skd': 'application/vnd.koan',
    '.skm': 'application/vnd.koan',
    '.skp': 'application/vnd.koan',
    '.skt': 'application/vnd.koan',
    '.sl': 'text/vnd.wap.sl',
    '.slc': 'application/vnd.wap.slc',
    '.sldm': 'application/vnd.ms-powerpoint.slide.macroenabled.12',
    '.sldx': 'application/vnd.openxmlformats-officedocument.presentationml.slide',
    '.slt': 'application/vnd.epson.salt',
    '.smf': 'application/vnd.stardivision.math',
    '.smi': 'application/smil+xml',
    '.smil': 'application/smil+xml',
    '.snd': 'audio/basic',
    '.snf': 'application/x-font-snf',
    '.so': 'application/octet-stream',
    '.spc': 'application/x-pkcs7-certificates',
    '.spf': 'application/vnd.yamaha.smaf-phrase',
    '.spl': 'application/x-futuresplash',
    '.spot': 'text/vnd.in3d.spot',
    '.spp': 'application/scvp-vp-response',
    '.spq': 'application/scvp-vp-request',
    '.spx': 'audio/ogg',
    '.src': 'application/x-wais-source',
    '.srx': 'application/sparql-results+xml',
    '.sse': 'application/vnd.kodak-descriptor',
    '.ssf': 'application/vnd.epson.ssf',
    '.ssml': 'application/ssml+xml',
    '.stc': 'application/vnd.sun.xml.calc.template',
    '.std': 'application/vnd.sun.xml.draw.template',
    '.stf': 'application/vnd.wt.stf',
    '.sti': 'application/vnd.sun.xml.impress.template',
    '.stk': 'application/hyperstudio',
    '.stl': 'application/vnd.ms-pki.stl',
    '.str': 'application/vnd.pg.format',
    '.stw': 'application/vnd.sun.xml.writer.template',
    '.sus': 'application/vnd.sus-calendar',
    '.susp': 'application/vnd.sus-calendar',
    '.sv4cpio': 'application/x-sv4cpio',
    '.sv4crc': 'application/x-sv4crc',
    '.svd': 'application/vnd.svd',
    '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml',
    '.swa': 'application/x-director',
    '.swf': 'application/x-shockwave-flash',
    '.swi': 'application/vnd.arastra.swi',
    '.sxc': 'application/vnd.sun.xml.calc',
    '.sxd': 'application/vnd.sun.xml.draw',
    '.sxg': 'application/vnd.sun.xml.writer.global',
    '.sxi': 'application/vnd.sun.xml.impress',
    '.sxm': 'application/vnd.sun.xml.math',
    '.sxw': 'application/vnd.sun.xml.writer',
    '.t': 'text/troff',
    '.tao': 'application/vnd.tao.intent-module-archive',
    '.tar': 'application/x-tar',
    '.tcap': 'application/vnd.3gpp2.tcap',
    '.tcl': 'application/x-tcl',
    '.teacher': 'application/vnd.smart.teacher',
    '.tex': 'application/x-tex',
    '.texi': 'application/x-texinfo',
    '.texinfo': 'application/x-texinfo',
    '.text': 'text/plain',
    '.tfm': 'application/x-tex-tfm',
    '.tgz': 'application/x-gzip',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.tmo': 'application/vnd.tmobile-livetv',
    '.torrent': 'application/x-bittorrent',
    '.tpl': 'application/vnd.groove-tool-template',
    '.tpt': 'application/vnd.trid.tpt',
    '.tr': 'text/troff',
    '.tra': 'application/vnd.trueapp',
    '.trm': 'application/x-msterminal',
    '.tsv': 'text/tab-separated-values',
    '.ttc': 'application/x-font-ttf',
    '.ttf': 'application/x-font-ttf',
    '.twd': 'application/vnd.simtech-mindmapper',
    '.twds': 'application/vnd.simtech-mindmapper',
    '.txd': 'application/vnd.genomatix.tuxedo',
    '.txf': 'application/vnd.mobius.txf',
    '.txt': 'text/plain',
    '.u32': 'application/x-authorware-bin',
    '.udeb': 'application/x-debian-package',
    '.ufd': 'application/vnd.ufdl',
    '.ufdl': 'application/vnd.ufdl',
    '.umj': 'application/vnd.umajin',
    '.unityweb': 'application/vnd.unity',
    '.uoml': 'application/vnd.uoml+xml',
    '.uri': 'text/uri-list',
    '.uris': 'text/uri-list',
    '.urls': 'text/uri-list',
    '.ustar': 'application/x-ustar',
    '.utz': 'application/vnd.uiq.theme',
    '.uu': 'text/x-uuencode',
    '.vcd': 'application/x-cdlink',
    '.vcf': 'text/x-vcard',
    '.vcg': 'application/vnd.groove-vcard',
    '.vcs': 'text/x-vcalendar',
    '.vcx': 'application/vnd.vcx',
    '.vis': 'application/vnd.visionary',
    '.viv': 'video/vnd.vivo',
    '.vor': 'application/vnd.stardivision.writer',
    '.vox': 'application/x-authorware-bin',
    '.vrml': 'model/vrml',
    '.vsd': 'application/vnd.visio',
    '.vsf': 'application/vnd.vsf',
    '.vss': 'application/vnd.visio',
    '.vst': 'application/vnd.visio',
    '.vsw': 'application/vnd.visio',
    '.vtu': 'model/vnd.vtu',
    '.vxml': 'application/voicexml+xml',
    '.w3d': 'application/x-director',
    '.wad': 'application/x-doom',
    '.wav': 'audio/x-wav',
    '.wax': 'audio/x-ms-wax',
    '.wbmp': 'image/vnd.wap.wbmp',
    '.wbs': 'application/vnd.criticaltools.wbs+xml',
    '.wbxml': 'application/vnd.wap.wbxml',
    '.wcm': 'application/vnd.ms-works',
    '.wdb': 'application/vnd.ms-works',
    '.wiz': 'application/msword',
    '.wks': 'application/vnd.ms-works',
    '.wm': 'video/x-ms-wm',
    '.wma': 'audio/x-ms-wma',
    '.wmd': 'application/x-ms-wmd',
    '.wmf': 'application/x-msmetafile',
    '.wml': 'text/vnd.wap.wml',
    '.wmlc': 'application/vnd.wap.wmlc',
    '.wmls': 'text/vnd.wap.wmlscript',
    '.wmlsc': 'application/vnd.wap.wmlscriptc',
    '.wmv': 'video/x-ms-wmv',
    '.wmx': 'video/x-ms-wmx',
    '.wmz': 'application/x-ms-wmz',
    '.wpd': 'application/vnd.wordperfect',
    '.wpl': 'application/vnd.ms-wpl',
    '.wps': 'application/vnd.ms-works',
    '.wqd': 'application/vnd.wqd',
    '.wri': 'application/x-mswrite',
    '.wrl': 'model/vrml',
    '.wsdl': 'application/wsdl+xml',
    '.wspolicy': 'application/wspolicy+xml',
    '.wtb': 'application/vnd.webturbo',
    '.wvx': 'video/x-ms-wvx',
    '.x32': 'application/x-authorware-bin',
    '.x3d': 'application/vnd.hzn-3d-crossword',
    '.xap': 'application/x-silverlight-app',
    '.xar': 'application/vnd.xara',
    '.xbap': 'application/x-ms-xbap',
    '.xbd': 'application/vnd.fujixerox.docuworks.binder',
    '.xbm': 'image/x-xbitmap',
    '.xdm': 'application/vnd.syncml.dm+xml',
    '.xdp': 'application/vnd.adobe.xdp+xml',
    '.xdw': 'application/vnd.fujixerox.docuworks',
    '.xenc': 'application/xenc+xml',
    '.xer': 'application/patch-ops-error+xml',
    '.xfdf': 'application/vnd.adobe.xfdf',
    '.xfdl': 'application/vnd.xfdl',
    '.xht': 'application/xhtml+xml',
    '.xhtml': 'application/xhtml+xml',
    '.xhvml': 'application/xv+xml',
    '.xif': 'image/vnd.xiff',
    '.xla': 'application/vnd.ms-excel',
    '.xlam': 'application/vnd.ms-excel.addin.macroenabled.12',
    '.xlb': 'application/vnd.ms-excel',
    '.xlc': 'application/vnd.ms-excel',
    '.xlm': 'application/vnd.ms-excel',
    '.xls': 'application/vnd.ms-excel',
    '.xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
    '.xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xlt': 'application/vnd.ms-excel',
    '.xltm': 'application/vnd.ms-excel.template.macroenabled.12',
    '.xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    '.xlw': 'application/vnd.ms-excel',
    '.xml': 'application/xml',
    '.xo': 'application/vnd.olpc-sugar',
    '.xop': 'application/xop+xml',
    '.xpdl': 'application/xml',
    '.xpi': 'application/x-xpinstall',
    '.xpm': 'image/x-xpixmap',
    '.xpr': 'application/vnd.is-xpr',
    '.xps': 'application/vnd.ms-xpsdocument',
    '.xpw': 'application/vnd.intercon.formnet',
    '.xpx': 'application/vnd.intercon.formnet',
    '.xsl': 'application/xml',
    '.xslt': 'application/xslt+xml',
    '.xsm': 'application/vnd.syncml+xml',
    '.xspf': 'application/xspf+xml',
    '.xul': 'application/vnd.mozilla.xul+xml',
    '.xvm': 'application/xv+xml',
    '.xvml': 'application/xv+xml',
    '.xwd': 'image/x-xwindowdump',
    '.xyz': 'chemical/x-xyz',
    '.zaz': 'application/vnd.zzazz.deck+xml',
    '.zip': 'application/zip',
    '.zir': 'application/vnd.zul',
    '.zirz': 'application/vnd.zul',
    '.zmm': 'application/vnd.handheld-entertainment+xml'
  };

  /**
    @class Coral.FileUpload.Item
    @classdesc A FileUpload item encapsulating file meta-data
    @param {File|HTMLElement} file
      The file element.
    @param {Boolean} useHTML5
      Whether the File API should be used.

  */
  Coral.FileUpload.Item = function(file, useHTML5) {
    this._file = file;
    this._xhr = null;
    this._useHTML5 = useHTML5;

    // Defaults
    this._parameters = [];
    this._withCredentials = false;
    this._timeout = 0;
    this._responseType = Coral.FileUpload.Item.responseType.TEXT;
    this._readyState = 0;
    this._response = null;
    this._responseText = '';
    this._responseXML = null;
    this._status = 0;
    this._statusText = '';

    // @polyfill IE9
    if (!useHTML5) {
      var filename = this._getFilename(file);
      this._file = {
        _name: filename,
        _size: this._getFileSize(file),
        _type: this._getFileMimeType(file, filename),
        // readonly
        get name() {
          return this._name;
        },
        // readonly
        get size() {
          return this._size;
        },
        // readonly
        get type() {
          return this._type;
        }
      };
    }
  };

  Coral.FileUpload.Item.prototype = {};

  /**
    The File.

    @name file
    @readonly
    @type {File}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'file', {
    get: function() {
      return this._file;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    Array of additional parameters as key:value to be uploaded with the file.
    A parameter must contain a <code>name</code> key:value and optionally a <code>value</code> key:value.

    @name parameters
    @type {Array.<Object>}
    @default []
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'parameters', {
    get: function() {
      return this._parameters;
    },
    set: function(value) {
      if (Coral.validate.valueMustChange(value, this._parameters)) {
        // Verify that every item has a name
        var validate = Array.isArray(value) && value.every(function(el) {
            return el && el.name;
          });

        if (validate) {
          this._parameters = value;
        }
      }
    }
  });

  /**
    The item xhr <code>withCredentials</code> property.

    @name withCredentials
    @type {Boolean}
    @default false
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'withCredentials', {
    get: function() {
      return this._withCredentials;
    },
    set: function(value) {
      value = Coral.transform.boolean(value);
      if (Coral.validate.valueMustChange(value, this._withCredentials)) {
        this._withCredentials = value;
      }
    }
  });

  /**
    The item xhr <code>timeout</code> property.

    @name timeout
    @type {Number}
    @default 0
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'timeout', {
    get: function() {
      return this._timeout;
    },
    set: function(value) {
      if (Coral.validate.valueMustChange(value, this._timeout)) {
        var timeout = Coral.transform.number(value);
        if (timeout !== null) {
          this._timeout = timeout;
          if (this._xhr) {
            this._xhr.timeout = timeout;
          }
        }
      }
    }
  });

  /**
    The item xhr <code>responseType</code> property.

    @name responseType
    @default {Coral.FileUpload.Item.responseType.TEXT}
    @type {Coral.FileUpload.Item.responseType}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'responseType', {
    get: function() {
      return this._responseType;
    },
    set: function(value) {
      if (Coral.validate.valueMustChange(value, this._responseType) && Coral.validate.enumeration(responseType)(value)) {
        this._responseType = value;
        if (this._xhr) {
          this._xhr.responseType = value;
        }
      }
    }
  });

  /**
    The item xhr <code>readyState</code> property.

    @name readyState
    @readonly
    @default 0
    @type {Number}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'readyState', {
    get: function() {
      return this._xhr ? this._xhr.readyState : this._readyState;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    The item xhr <code>responseType</code> property. Depends on {@link Coral.FileUpload.Item#responseType}.

    @name response
    @readonly
    @default ""
    @type {String|ArrayBuffer|Blob|Document}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'response', {
    get: function() {
      return this._xhr ? this._xhr.response : this._response;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    The item xhr <code>responseText</code> property.

    @name responseText
    @readonly
    @default ""
    @type {String}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'responseText', {
    get: function() {
      return this._xhr ? this._xhr.responseText : this._responseText;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    The item xhr <code>responseXML</code> property.

    @name responseXML
    @readonly
    @default null
    @type {HTMLElement}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'responseXML', {
    get: function() {
      return this._xhr ? this._xhr.responseXML : this._responseXML;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    The item xhr <code>status</code> property.

    @name status
    @readonly
    @default 0
    @type {Number}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'status', {
    get: function() {
      return this._xhr ? this._xhr.status : this._status;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    The item xhr <code>statusText</code> property.

    @name statusText
    @readonly
    @default ""
    @type {String}
    @memberof Coral.FileUpload.Item#
  */
  Object.defineProperty(Coral.FileUpload.Item.prototype, 'statusText', {
    get: function() {
      return this._xhr ? this._xhr.statusText : this._statusText;
    },
    set: function(value) {
      // readonly
    }
  });

  /**
    @ignore
    @polyfill IE9
  */
  Coral.FileUpload.Item.prototype._getFilename = function(file) {
    if (this._useHTML5) {
      return file.name;
    }

    var value = file.value || file.getAttribute('value');
    // Browsers append 'C:\fakepath\' to the file name for security reasons (the file path is never revealed).
    return value && value.replace('C:\\fakepath\\', '');
  };

  /**
    @ignore
    @polyfill IE9
  */
  Coral.FileUpload.Item.prototype._getFileSize = function(file) {
    if (this._useHTML5) {
      return file.size;
    }

    if (window.ActiveXObject) {
      try {
        var myFSO = new window.ActiveXObject('Scripting.FileSystemObject');
        return myFSO.getFile(file.value).size;
      } catch (e) {}
    }

    // Impossible to determine file size.
    return -1;
  };

  /**
    @ignore
    @polyfill IE9
  */
  Coral.FileUpload.Item.prototype._getFileMimeType = function(file, filename) {
    if (this._useHTML5 && file.type !== '') {
      return file.type;
    }

    return this._getMimeTypeFromFileName(filename);
  };

  /**
    @ignore
    @polyfill IE9
  */
  Coral.FileUpload.Item.prototype._getMimeTypeFromFileName = function(filename) {
    var fileExtensionMatch = filename.match(/.+(\..+)/);

    if (fileExtensionMatch && MIME_TYPES[fileExtensionMatch[1]]) {
      return MIME_TYPES[fileExtensionMatch[1]];
    }

    return 'application/unknown';
  };

  /**
    @ignore
    @polyfill IE9
  */
  Coral.FileUpload.Item.prototype._isMimeTypeAllowed = function(acceptedMimeTypes) {
    var isAllowed = false;

    if (!this.file.type || !this.file.type.match(MIME_TYPE_REGEXP)) {
      // File mime type is erroneous
      return false;
    }

    return acceptedMimeTypes.split(',').some(function(allowedMimeType) {
      allowedMimeType = $.trim(allowedMimeType);

      if (allowedMimeType === '*' ||
        allowedMimeType === '.*' ||
        allowedMimeType === '*/*' ||
        this.file.type === 'application/unknown') {
        // Explicit wildcard case: allow any file
        // Allow unknown mime types
        isAllowed = true;
      }
      else if (allowedMimeType.match(MIME_TYPE_REGEXP)) {
        if (allowedMimeType === MIME_TYPE_AUDIO) {
          isAllowed = (this.file.type.indexOf(MIME_TYPE_AUDIO.slice(0, -1)) === 0);
        }
        else if (allowedMimeType === MIME_TYPE_IMAGE) {
          isAllowed = (this.file.type.indexOf(MIME_TYPE_IMAGE.slice(0, -1)) === 0);
        }
        else if (allowedMimeType === MIME_TYPE_VIDEO) {
          isAllowed = (this.file.type.indexOf(MIME_TYPE_VIDEO.slice(0, -1)) === 0);
        }
        else {
          // Proper mime type case: directly compare with file mime type
          isAllowed = (this.file.type === allowedMimeType);
        }
      }
      else if (allowedMimeType.match(FILE_EXTENSION_REGEXP)) {
        // File extension case: map extension to proper mime type and then compare
        isAllowed = (this.file.type === MIME_TYPES[allowedMimeType]);
      }
      else if (allowedMimeType.match(SHORTCUT_REGEXP)) {
        // "Shortcut" case: only compare first part of the file mime type with the shortcut
        isAllowed = (this.file.type.split('/')[0] === allowedMimeType);
      }

      // Break the loop if file mime type is allowed
      return isAllowed;
    }.bind(this));
  };

  // Export enum
  Coral.FileUpload.Item.responseType = responseType;
})();

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["FileUpload"] = this["Coral"]["templates"]["FileUpload"] || {};
this["Coral"]["templates"]["FileUpload"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("handle", "input");
  el0.className += " coral3-FileUpload-input";
  el0.setAttribute("tabindex", "-1");
  el0.setAttribute("name", "");
  el0.setAttribute("type", "file");
  el0.setAttribute("accept", "");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enumeration representing progress bar sizes.

    @enum {String}
    @memberof Coral.Progress
  */
  var size = {
    /** A small progress bar. */
    SMALL: 'S',
    /** A medium progress bar. */
    MEDIUM: 'M',
    /** A large progress bar. */
    LARGE: 'L'
  };

  /**
    Enumeration representing progress bar label positions.

    @enum {String}
    @memberof Coral.Progress
  */
  var labelPosition = {
    /** Show the label to the left of the bar. */
    LEFT: 'left',
    /** Show the label to the right of the bar. */
    RIGHT: 'right',
    /** Show the label below the bar. */
    BOTTOM: 'bottom'
  };

  // Base classname
  // We're not using coral-Progress here to avoid conflicts with core
  var CLASSNAME = 'coral-Progress';

  // size mapping
  var SIZE_CLASSES = {
    'S': 'small',
    'M': 'medium',
    'L': 'large'
  };

  // A string of all possible size classnames
  var ALL_SIZE_CLASSES = '';
  for (var sizeValue in size) {
    ALL_SIZE_CLASSES += CLASSNAME + '--' + SIZE_CLASSES[size[sizeValue]] + ' ';
  }

  // A string of all possible label position classnames
  var ALL_LABEL_POSITION_CLASSES = '';
  for (var position in labelPosition) {
    ALL_LABEL_POSITION_CLASSES += CLASSNAME + '--' + labelPosition[position] + 'Label ';
  }

  Coral.register( /** lends Coral.Progress# */ {
    /**
      @class Coral.Progress
      @classdesc A Progress bar component
      @htmltag coral-progress
      @extends Coral.Component
    */
    name: 'Progress',
    tagName: 'coral-progress',
    className: CLASSNAME,

    properties: {
      /**
        The current progress in percent.

        @type {Number}
        @default 0
        @fires Coral.Progress.coral-progress:changed
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Progress#
      */
      'value': {
        default: 0,
        reflectAttribute: true,
        trigger: 'coral-progress:change',
        transform: function(value) {
          value = Coral.transform.number(value);

          // Invalid input sets to 0
          if (value === null) {
            value = 0;
          }

          // Stay within bounds
          if (value > 100) {
            value = 100;
          }
          else if (value < 0) {
            value = 0;
          }

          return value;
        },
        sync: function() {
          this._elements.status.style.width = this.value + '%';

          if (!this.indeterminate) {
            // ARIA: Reflect value for screenreaders
            this.setAttribute('aria-valuenow', this.value);

            if (this.showPercent === true) {
              // Only update label text in percent mode
              this._setLabelContent(this.value + '%');
            }
          }
        },
        get: function() {
          return this.indeterminate ? 0 : this._value;
        }
      },

      /**
        Whether to hide the current value and show an animation. Set to true for operations whose progress cannot be
        determined.

        @type {Boolean}
        @default false
        @htmlattribute indeterminate
        @htmlattributereflected
        @memberof Coral.Progress#
      */
      'indeterminate': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        alsoSync: 'value',
        sync: function() {
          if (this.indeterminate) {

            this.$.addClass(this._className + '--indeterminate');

            // ARIA: Remove attributes
            this.removeAttribute('aria-valuenow');
            this.removeAttribute('aria-valuemin');
            this.removeAttribute('aria-valuemax');

          }
          else {
            this.$.removeClass(this._className + '--indeterminate');

            // ARIA: Add attributes
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
          }
        }
      },

      /**
        The vertical and text size of this progress bar. To adjust the width, simply set the CSS width property.

        @type {Coral.Progress.size}
        @default Coral.Progress.size.MEDIUM
        @htmlattribute size
        @memberof Coral.Progress#
      */
      'size': {
        default: size.MEDIUM,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          this.$.removeClass(ALL_SIZE_CLASSES).addClass(this._className + '--' + SIZE_CLASSES[this.size]);
        }
      },

      /**
        Boolean attribute to toggle showing progress percent as the label content.
        Default is true.

        @type {Boolean}
        @default false
        @htmlattribute showpercent
        @memberof Coral.Progress#
      */
      'showPercent': {
        // Do not provide a default, otherwise sync will run and blow away the label
        // default: false,
        attribute: 'showpercent',
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          if (this.showPercent === true) {
            var content = this.indeterminate ? '' : this.value + '%';
            this._setLabelContent(content);
            this._showLabel();
          }
          else {
            // This clears the content of the label when showPercent is turned off
            // Ideally, if a label was set and showPercent was set to false, we wouldn't mess with it
            // However, in this case, we don't want to leave incorrect label contents around, so we remove it to be safe
            this.label.innerHTML = '';
          }
        }
      },

      /**
        Used to access to the {@link Coral.Progress.Label} element. Keep in mind that the width of a custom label is
        limited for {@link Coral.Progress.labelPosition.LEFT} and {@link Coral.Progress.labelPosition.RIGHT}.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Progress#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-progress-label'
      }),

      /**
        Label position.

        @type {Coral.Progress.labelPosition}
        @default Coral.Progress.labelPosition.RIGHT
        @htmlattribute labelposition
        @memberof Coral.Progress#
      */
      'labelPosition': {
        default: labelPosition.RIGHT,
        attribute: 'labelposition',
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(labelPosition)
        ],
        sync: function() {
          this.$.removeClass(ALL_LABEL_POSITION_CLASSES);
          if (this._elements.label.textContent.length > 0) {
            this.$.addClass(this._className + '--' + this.labelPosition + 'Label');
          }
        }
      }
    },

    /** @ignore */
    _initialize: function() {
      // ARIA
      this.setAttribute('role', 'progressbar');
      this.setAttribute('aria-valuenow', '0');
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');

      // Watch for label changes
      this._observer = new MutationObserver(this._toggleLabelBasedOnContent.bind(this));
      this._observer.observe(this._elements.label, {
        characterData: true,
        childList: true,
        subtree: true
      });
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();
      fragment.appendChild(Coral.templates.Progress.base.call(this._elements));

      var label = this._elements.label = this.querySelector('coral-progress-label') || document.createElement('coral-progress-label');
      fragment.appendChild(label);

      while (this.firstChild) {
        label.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
      this._toggleLabelBasedOnContent();
    },

    attachedCallback: function() {
      // Call superclass method
      Coral.Component.prototype.attachedCallback.call(this);

      // @polyfill IE9 Check if the label is empty when attached
      // This is because MutationObservers won't fire when not in the DOM in IE 9
      this._toggleLabelBasedOnContent();
    },

    /** @ignore */
    _toggleLabelBasedOnContent: function() {
      if (this._elements.label.textContent.length > 0) {
        this._showLabel();
      }
      else {
        this._hideLabel();
      }
    },

    /** @ignore */
    _hideLabel: function() {
      this._elements.label.hidden = true;
      this.$.removeClass(ALL_LABEL_POSITION_CLASSES).addClass(this._className + '--noLabel');

      // Remove the value for accessibility so the screenreader knows we're unlabelled
      this.removeAttribute('aria-valuetext');
    },

    /** @ignore */
    _showLabel: function() {
      this._elements.label.hidden = false;
      this.$.removeClass(this._className + '--noLabel').addClass(this._className + '--' + this.labelPosition + 'Label');

      if (this.showPercent === false) {
        // Update the value for accessibility as it was cleared when the label was hidden
        this.setAttribute('aria-valuetext', this.label.textContent);
      }
    },

    /** @ignore */
    _setLabelContent: function(content) {
      this._elements.label.textContent = content;

      // ARIA
      if (this.showPercent === true) {
        this.removeAttribute('aria-valuetext');
      }
      else {
        this.setAttribute('aria-valuetext', this.label.textContent);
      }
    },

    /**
      Triggered when the progress value is changed.

      @event Coral.Progress#coral-progress:change

      @param {Object} event
        Event object.
      @param {Object} event.detail.value
        The current progress value in percent.
      @param {Object} event.detail.oldValue
        The previous progress value in percent.
    */
  });

  Coral.register( /** lends Coral.Progress.Label# */ {
    /**
      @class Coral.Progress.Label
      @classdesc The Progress label content
      @htmltag coral-progress-label
      @extends Coral.Component
    */
    name: 'Progress.Label',
    tagName: 'coral-progress-label',
    className: 'coral-Progress-label'
  });

  // Expose enums globally
  Coral.Progress.size = size;
  Coral.Progress.labelPosition = labelPosition;
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Progress"] = this["Coral"]["templates"]["Progress"] || {};
this["Coral"]["templates"]["Progress"]["base"] = (function anonymous(data_0) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = document.createElement("div");
  el0.className += " coral-Progress-bar";
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["status"] = document.createElement("div");
  el2.className += " coral-Progress-status";
  el2.setAttribute("handle", "status");
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  frag.appendChild(el0);
  var el4 = document.createTextNode("\n");
  frag.appendChild(el4);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** lends Coral.Radio# */ {
    /**
      @class Coral.Radio
      @classdesc A Radio component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-radio
    */
    name: 'Radio',
    tagName: 'coral-radio',
    className: 'coral-Radio',

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      /**
        Checked state for the radio, <code>true</code> is checked and <code>false</code> is unchecked. Changing the
        checked value will cause a {@link Coral.mixin.formField.event:change} event to be triggered.

        @type {Boolean}
        @default false
        @htmlattribute checked
        @htmlattributereflected
        @fires Coral.mixin.formField#change
        @memberof Coral.Radio#
      */
      'checked': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._checked = value;
          // we do this inmediatelly in the setter to be able to properly support forms
          this._elements.input.checked = value;

          // handles related radios
          this._syncRelatedRadios();
        }
      },

      /**
        The radios's label element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Radio#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-radio-label'
      }),

      /**
        The value this radio should submit when checked. Changing this value will not trigger an event.

        @type {String}
        @default "on"
        @htmlattribute value
        @memberof Coral.Radio#
      */
      'value': {
        default: 'on',
        set: function(value, silent) {
          this._elements.input.value = value;
        },
        get: function() {
          return this._elements.input.value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);
          this._elements.input.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      }
    },

    /*
      Indicates to the formField that the 'checked' property needs to be set in this component.

      @protected
     */
    _componentTargetProperty: 'checked',

    /*
      Indicates to the formField that the 'checked' property has to be extracted from the event.

      @protected
     */
    _eventTargetProperty: 'checked',

    /**
      Takes care of keeping the checked property up to date, by unchecking every radio that has the same name. This is
      only done if the radio is already in the DOM, it has a name and it is checked, otherwise this is not needed.

      @ignore
    */
    _syncRelatedRadios: function() {
      // if the checkbox has a name defined and it is checked, we need to ensure that other radios that share the name
      // are not checked.
      if (this.parentNode !== null && this.name && this.checked) {
        // queries the document for all the coral-radios with the same name
        $(this.tagName + '[name=' + JSON.stringify(this.name) + ']')
          // it has to be different than the current radio
          .not(this)
          // unchecks all of them
          .each(function(key, value) {
            Coral.commons.ready(this, function(radio) {
              // sets it silently
              radio.set('checked', false, true);
            });
          });
      }
    },

    /**
      Hide the label if it's empty.

      @ignore
    */
    _hideLabelIfEmpty: function() {
      var label = this._elements.label;

      // If it's empty and has no non-textnode children, hide the label
      var hiddenValue = label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '';

      // Only bother if the hidden status has changed
      if (hiddenValue !== this._elements.labelWrapper.hidden) {
        this._elements.labelWrapper.hidden = hiddenValue;
      }
    },

    /** @ignore */
    attachedCallback: function() {
      Coral.Component.prototype.attachedCallback.call(this);

      // handles the case where the attached component was checked
      this._syncRelatedRadios();

      // @polyfill IE9
      // Check if we need to hide the label
      // We must do this because IE does not catch mutations when nodes are not in the DOM
      this._hideLabelIfEmpty();
    },

    /** @private */
    _initialize: function() {
      // Check if the label is empty whenever we get a mutation
      this._observer = new MutationObserver(this._hideLabelIfEmpty.bind(this));

      // Watch for changes to the label element's children
      this._observer.observe(this.label, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    },


    _templateHandleNames: ['input', 'checkmark', 'labelWrapper'],

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var frag = document.createDocumentFragment();

      // Render the main template
      frag.appendChild(Coral.templates.Radio.base.call(this._elements));

      // Try to find the label content zone
      var foundLabel = this.querySelector('coral-radio-label');

      // Create the label content zone if necessary
      var label = this._elements.label = foundLabel || document.createElement('coral-radio-label');

      // Add the label to the label wrapper
      this._elements.labelWrapper.appendChild(label);

      if (!foundLabel) {
        // Hide the wrapper if no label was provided
        this._elements.labelWrapper.hidden = true;
      }

      while (this.firstChild) {
        var child = this.firstChild;
        if (child.nodeType === Node.TEXT_NODE ||
          this._templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
          // Add non-template elements to the label
          label.appendChild(child);
        }
        else {
          // Remove anything else element
          this.removeChild(child);
        }
      }

      // Add the frag to the component
      this.appendChild(frag);
    }
  });

  Coral.register( /** @lends Coral.Radio.Label */ {
    /**
      @class Coral.Radio.Label
      @classdesc A Radio Label component
      @extends Coral.Component
      @htmltag coral-radio-label
    */
    name: 'Radio.Label',
    tagName: 'coral-radio-label'
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Radio"] = window["Coral"]["templates"]["Radio"] || {};
window["Coral"]["templates"]["Radio"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("type", "radio");
  el0.setAttribute("handle", "input");
  el0.className += " coral-Radio-input";
  el0.id = Coral["commons"]["getUID"]();
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["checkmark"] = document.createElement("span");
  el2.className += " coral-Radio-checkmark";
  el2.setAttribute("handle", "checkmark");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["labelWrapper"] = document.createElement("label");
  el4.className += " coral-Radio-description";
  el4.setAttribute("handle", "labelWrapper");
  el4.setAttribute("for", this["input"]["id"]);
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME_BASE = 'coral-Textfield';

  /**
    Enum for textarea variant values.
    @enum {String}
    @memberof Coral.Textarea
  */
  var variant = {
    /** A default textarea */
    DEFAULT: 'default',
    /** A textarea with no border or background. */
    QUIET: 'quiet'
  };

  // Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME_BASE + '--' + variant[variantValue] + ' ';
  }

  Coral.register( /** @lends Coral.Textarea# */ {
    /**
      @class Coral.Textarea
      @classdesc A Textarea component
      @htmltag coral-textarea
      @htmlbasetag textarea
      @extends Coral.Component
      @extends Coral.mixin.formField
    */
    name: 'Textarea',
    tagName: 'coral-textarea',
    baseTagName: 'textarea',
    extend: HTMLTextAreaElement,
    className: CLASSNAME_BASE + ' ' + CLASSNAME_BASE + '--multiline',

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);
        }
      },

      /**
        The textarea's variant.
        @type {Coral.Textarea.variant}
        @default Coral.Textarea.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Textarea#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // removes every existing variant
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Textarea.variant.DEFAULT) {
            this.$.addClass(CLASSNAME_BASE + '--' + this.variant);
          }
        }
      }
    }
  });

  // exports the variants enumeration
  Coral.Textarea.variant = variant;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for textfield variant values.
    @enum {String}
    @memberof Coral.Textfield
  */
  var variant = {
    /** A default textfield */
    DEFAULT: 'default',
    /** A textfield with no border or background. */
    QUIET: 'quiet'
  };

  // the textfield's base classname
  var CLASSNAME = 'coral-Textfield';

  // Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }

  Coral.register( /** @lends Coral.Textfield# */ {
    /**
      @class Coral.Textfield
      @classdesc A Textfield component
      @htmltag coral-textfield
      @htmlbasetag input
      @extends Coral.Component
      @extends Coral.mixin.formField
    */
    name: 'Textfield',
    tagName: 'coral-textfield',
    baseTagName: 'input',
    extend: HTMLInputElement,
    className: CLASSNAME,

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);
        }
      },
      /**
        The textfield's variant.
        @type {Coral.Textfield.variant}
        @default Coral.Textfield.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Textfield#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // removes every existing variant
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Textfield.variant.DEFAULT) {
            this.$.addClass(this._className + '--' + this.variant);
          }
        }
      }
    }
  });

  // exports the variants enumeration
  Coral.Textfield.variant = variant;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enumeration representing wait indicator sizes.

    @memberof Coral.Wait
    @enum {String}
  */
  var size = {
    /** A small wait indicator. This is the default size. */
    SMALL: 'S',
    /** A large wait indicator. */
    LARGE: 'L'
  };

  Coral.register( /** lends Coral.Wait# */ {
    /**
      @class Coral.Wait
      @classdesc A Wait component
      @extends Coral.Component
      @htmltag coral-wait
    */
    name: 'Wait',
    tagName: 'coral-wait',
    className: 'coral-Wait',
    properties: {

      /**
        The size of the wait indicator. Currently only 'M' (the default) and 'L' are available.
        See {@link Coral.Wait.size}
        @type {Coral.Wait.size}
        @default Coral.Wait.size.SMALL
        @htmlattribute size
        @memberof Coral.Wait#
      */
      'size': {
        default: size.SMALL,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          // only large requires a css change for now
          this.$[this.size === size.LARGE ? 'addClass' : 'removeClass'](this._className + '--large');
        }
      },

      /**
        Whether the component is centered or not. The container needs to have the style <code>position: relative</code>
        for the centering to work correctly.

        @type {Boolean}
        @default false
        @htmlattribute centered
        @htmlattributereflected
        @memberof Coral.Wait#
      */
      'centered': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$.toggleClass(this._className + '--centered', this.centered);
        }
      }
    }
  });

  // expose enumerations
  Coral.Wait.size = size;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Key codes
  var PAGE_UP = 33;
  var PAGE_DOWN = 34;
  var LEFT_ARROW = 37;
  var UP_ARROW = 38;

  /**
    Enum for Accordion variant values.

    @enum {String}
    @memberof Coral.Accordion
  */
  var variant = {
    /** Default Tabpanel look and feel. */
    DEFAULT: 'default',
    /** Quiet variant with minimal borders. */
    QUIET: 'quiet',
    /** Large variant, typically used inside a navigation rail since it does not have borders on the sides. */
    LARGE: 'large'
  };

  // the accordions's base classname
  var CLASSNAME = 'coral3-Accordion';

  // builds a string with all the possible class names to be able to handle variant changes
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }

  Coral.register( /** @lends Coral.Accordion# */ {
    /**
      @class Coral.Accordion
      @classdesc An Accordion component
      @extends Coral.Component
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#selectedItem as Coral.Accordion#selectedItem
      @borrows Coral.mixin.selectionList#items as Coral.Accordion#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.Accordion#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.Accordion#coral-collection:remove

      @htmltag coral-accordion
    */
    name: 'Accordion',
    tagName: 'coral-accordion',
    className: CLASSNAME,

    mixins: [
      Coral.mixin.selectionList({
        role: 'tablist',
        itemTagName: 'coral-accordion-item',
        allowSingleModeDeselect: true
      })
    ],

    events: {
      'click [role=tab]': '_onItemClick',

      'key:space [role=tab]': '_onToggleItemKey',
      'key:return [role=tab]': '_onToggleItemKey',
      'key:pageup [role=tab]': '_focusPreviousItem',
      'key:left [role=tab]': '_focusPreviousItem',
      'key:up [role=tab]': '_focusPreviousItem',
      'key:pagedown [role=tab]': '_focusNextItem',
      'key:right [role=tab]': '_focusNextItem',
      'key:down [role=tab]': '_focusNextItem',
      'key:home [role=tab]': '_onHomeKey',
      'key:end [role=tab]': '_onEndKey',

      'keydown [role=tabpanel]': '_onItemContentKeyDown'
    },

    properties: {

      /**
        The Accordion's variant.

        @type {Coral.Accordion.variant}
        @default Coral.Accordion.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Accordion#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Accordion.variant.DEFAULT) {
            this.$.addClass(this._className + '--' + this.variant);
          }
        }
      },

      /** @private **/
      '_tabTarget': {
        default: null,
        sync: function() {
          var value = this._tabTarget;
          var items = this.items.getAll();

          // Set all but the current set _tabTarget to not be a tab target:
          items.forEach(function(item) {
            item._isTabTarget = item === value;
          });
        }
      }
    },

    /** @private */
    _onHomeKey: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getFirstSelectable());
    },

    /** @private */
    _onEndKey: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getLastSelectable());
    },

    /**
      References:
      http://www.w3.org/WAI/PF/aria-practices/#accordion &

      Handlers for when focus is on an element inside of the panel:
      http://test.cita.illinois.edu/aria/tabpanel/tabpanel2.php

      @private
    */
    _onItemContentKeyDown: function(event) {
      // Required since sometimes the value is a number
      var key = parseFloat(event.keyCode);
      var item = event.matchedTarget.parentNode;

      switch (key) {
      case UP_ARROW:
      case LEFT_ARROW:
        // Set focus on the tab button for the currently displayed tab.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          this._focusItem(item);
        }
        break;
      case PAGE_UP:
        // Show the previous tab and set focus on its corresponding tab button. Shows the last tab in the panel if
        // current tab is the first one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          var prevItem = this.items.getPreviousSelectable(item);
          this._selectItem(prevItem);
          this._focusItem(prevItem);
        }
        break;
      case PAGE_DOWN:
        // Show the next tab and set focus on its corresponding tab button. Shows the first tab in the panel if current
        // tab is the last one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          var nextItem = this.items.getNextSelectable(item);
          this._selectItem(nextItem);
          this._focusItem(nextItem);
        }
        break;
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getPreviousSelectable(event.target.parentNode));
    },

    /** @private */
    _focusNextItem: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getNextSelectable(event.target.parentNode));
    },

    /** @private */
    _onItemClick: function(event) {
      // The click was performed on the header so we select the item (parentNode) the selection is toggled
      var item = $(event.target).closest('coral-accordion-item').get(0);
      if (item) {
        event.preventDefault();
        event.stopPropagation();

        this._selectItem(item);
        this._focusItem(item);
      }
    },

    /** @private */
    _onToggleItemKey: function(event) {
      event.preventDefault();
      event.stopPropagation();

      var item = event.target.parentNode;
      this._selectItem(item);
      this._focusItem(item);
    },

    /**
      Invocation of any of the 4 mixin.selectionList handlers referenced below may result in the internal '_tabTarget'
      property changing. Note that these are not overrides, but additions, invoked via 'Coral.commons.callAll'.

      @private
    */
    _onItemSelected: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemDeselected: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemAttached: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemDetached: function() {
      this._resetTabTarget();
    },

    /**
      Determine what item should get focus (if any) when the user tries to tab into the accordion. This should be the
      first selected panel, or the first selectable panel otherwise. When neither is available, to Accordion cannot be
      tabbed into.

      @private
    */
    _resetTabTarget: function() {
      // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
      var selectedItems = this.items._getNonNestedItems().filter('[selected]:not([disabled],[hidden])');
      this._tabTarget = selectedItems.length ? selectedItems[0] : this.items.getFirstSelectable();
    },

    /** @private */
    _focusItem: function(item) {
      if (item) {
        item.focus();
      }

      this._tabTarget = item;
    },

    /** @private */
    _initialize: function() {
      this.setAttribute('aria-multiselectable', 'true');
    }

    /**
      Triggered when the selected item has changed.

      @event Coral.Accordion#coral-accordion:change

      @param {Object} event Event object
      @param {Object} event.detail
      @param {HTMLElement} event.detail.oldSelection
        The prior selected item(s).
      @param {HTMLElement} event.detail.selection
        The newly selected item(s).
    */
  });

  // exports the variants enumeration
  Coral.Accordion.variant = variant;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Chevron classes for selected states
  var CHEVRON_CLASSES = {
    'true': 'chevronDown',
    'false': 'chevronRight'
  };

  Coral.register( /** @lends Coral.Accordion.Item# */ {
    /**
      @class Coral.Accordion.Item
      @classdesc An item in an accordion
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
      @borrows Coral.mixin.selectionList.Item#disabled as Coral.Accordion.Item#disabled
      @borrows Coral.mixin.selectionList.Item#selected as Coral.Accordion.Item#selected
      @htmltag coral-accordion-item
    */
    name: 'Accordion.Item',
    tagName: 'coral-accordion-item',
    className: 'coral3-Accordion-item',

    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-accordion',
        role: 'presentation'
      })
    ],

    properties: {
      /**
        The label of this accordion item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Accordion.Item#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-accordion-item-label'
      }),

      /**
        The content of this accordion item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Accordion.Item#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-accordion-item-content'
      }),

      // JSDoc inherited
      'selected': {
        sync: function() {
          this.$.toggleClass('is-selected', this.selected);

          this._elements.header.setAttribute('aria-selected', this.selected);
          this._elements.header.setAttribute('aria-expanded', this.selected);

          this._elements.contentContainer.setAttribute('aria-hidden', !this.selected);

          this._elements.icon.icon = CHEVRON_CLASSES[this.selected];

          if (this._animate) {
            this._elements.$contentContainer[this.selected ? 'slideDown' : 'slideUp']({
              duration: 250
            });
          }
          else {
            this._elements.$contentContainer[this.selected ? 'show' : 'hide']();
            // only the first time is it not animated
            this._animate = true;
          }
        }
      },

      // JSDoc inherited
      'disabled': {
        alsoSync: ['_isTabTarget'],
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);

          this._elements.header.setAttribute('aria-disabled', this.disabled);
        }
      },

      /** @private **/
      '_isTabTarget': {
        default: false,
        sync: function() {
          if (this.disabled) {
            this._elements.header.removeAttribute('tabindex');
          }
          else {
            this._elements.header.setAttribute('tabindex', this.__isTabTarget ? '0' : '-1');
          }
        }
      }
    },

    /**
      Handles the focus of the item.

      @ignore
    */
    focus: function() {
      this._elements.header.focus();
    },

    /** @private */
    _initialize: function() {
      var header = this._elements.header;
      header.setAttribute('aria-controls', this._elements.contentContainer.id);
      this._elements.contentContainer.setAttribute('aria-labelledby', header.id);
    },

    _templateHandleNames: ['header', 'icon', 'labelContainer', '$contentContainer'],

    /** @private */
    _render: function() {
      // Render the template and set element references
      var itemFragment = Coral.templates.Accordion.item.call(this._elements);

      // Fetch or create the label and content sub-components
      var label = this._elements.label = this.querySelector('coral-accordion-item-label') ||
        document.createElement('coral-accordion-item-label');
      var content = this._elements.content = this.querySelector('coral-accordion-item-content') ||
        document.createElement('coral-accordion-item-content');

      // Move the label and content sub-components into their container
      this._elements.labelContainer.appendChild(label);
      this._elements.contentContainer.appendChild(content);

      // Move any remaining elements into the content sub-component
      while (this.firstChild) {
        var child = this.firstChild;
        if (child.nodeType === Node.TEXT_NODE ||
          this._templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
          // Add non-template elements to the content
          content.appendChild(child);
        }
        else {
          // Remove anything else element
          this.removeChild(child);
        }
      }

      // Lastly, add the fragment into the container
      this.appendChild(itemFragment);
    }
  });

  Coral.register( /** @lends Coral.Accordion.Item.Content */ {
    /**
      @class Coral.Accordion.Item.Content
      @classdesc Accordion item's content component
      @extends Coral.Component
      @htmltag coral-accordion-item-content
    */
    name: 'Accordion.Item.Content',
    tagName: 'coral-accordion-item-content'
  });

  Coral.register( /** @lends Coral.Accordion.Item.Label */ {
    /**
      @class Coral.Accordion.Item.Label
      @classdesc Accordion item's label component
      @extends Coral.Component
      @htmltag coral-accordion-item-label
    */
    name: 'Accordion.Item.Label',
    tagName: 'coral-accordion-item-label'
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Accordion"] = this["Coral"]["templates"]["Accordion"] || {};
this["Coral"]["templates"]["Accordion"]["item"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["header"] = document.createElement("div");
  el0.className += " coral3-Accordion-header";
  el0.setAttribute("role", "tab");
  el0.id = Coral["commons"]["getUID"]();
  el0.setAttribute("handle", "header");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["icon"] = document.createElement("coral-icon");
  el2.setAttribute("size", "xs");
  el2.setAttribute("handle", "icon");
  el2.setAttribute("icon", "chevronRight");
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n  ");
  el0.appendChild(el3);
  var el4 = this["labelContainer"] = document.createElement("span");
  el4.className += " coral3-Accordion-label";
  el4.setAttribute("handle", "labelContainer");
  el0.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el0.appendChild(el5);
  frag.appendChild(el0);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = this["contentContainer"] = document.createElement("div");
this["$"+"contentContainer"] = $(el7);
  el7.className += " coral3-Accordion-content";
  el7.setAttribute("handle", "$contentContainer");
  el7.id = Coral["commons"]["getUID"]();
  el7.setAttribute("role", "tabpanel");
  frag.appendChild(el7);
  var el8 = document.createTextNode("\n");
  frag.appendChild(el8);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Valid alignment pairs.

    @enum {Object}
    @memberof Coral.Overlay
  */
  var align = {
    /** Use the top of the left side as an anchor point. */
    LEFT_TOP: 'left top',
    /** Use the center of the left side as an anchor point. */
    LEFT_CENTER: 'left center',
    /** Use the bottom of the left side as an anchor point. */
    LEFT_BOTTOM: 'left bottom',
    /** Use the center of the top side as an anchor point. */
    CENTER_TOP: 'center top',
    /** Use the center as an anchor point. */
    CENTER_CENTER: 'center center',
    /** Use the center of the bottom side as an anchor point. */
    CENTER_BOTTOM: 'center bottom',
    /** Use the top of the right side as an anchor point. */
    RIGHT_TOP: 'right top',
    /** Use the center of the right side as an anchor point. */
    RIGHT_CENTER: 'right center',
    /** Use the bottom of the right side as an anchor point. */
    RIGHT_BOTTOM: 'right bottom'
  };

  /**
    Collision detection strategies.

    @enum {String}
    @memberof Coral.Overlay
  */
  var collision = {
    /** Flips the element to the opposite side of the target and the collision detection is run again to see if it will fit. Whichever side allows more of the element to be visible will be used. */
    FLIP: 'flip',
    /** Shift the element away from the edge of the window. */
    FIT: 'fit',
    /** First applies the flip logic, placing the element on whichever side allows more of the element to be visible. Then the fit logic is applied to ensure as much of the element is visible as possible. */
    FLIP_FIT: 'flipfit',
    /** Does not apply any collision detection. */
    NONE: 'none'
  };

  /**
    Anchored overlay targets.

    @enum {String}
    @memberof Coral.Overlay
  */
  var target = {
    /** Use the previous sibling element in the DOM. */
    PREVIOUS: '_prev',
    /** Use the next sibling element in the DOM. */
    NEXT: '_next'
  };

  /**
    Overlay placement values.

    @enum {Object}
    @memberof Coral.Overlay
  */
  var placement = {
    /** An overlay anchored to the left of the target. */
    LEFT: 'left',
    /** An overlay anchored to the right of the target. */
    RIGHT: 'right',
    /** An overlay anchored at the bottom the target. */
    BOTTOM: 'bottom',
    /** An overlay anchored at the top target. */
    TOP: 'top'
  };

  /**
    Boolean enumeration for interaction values.

    @enum {String}
    @memberof Coral.Overlay
  */
  var interaction = {
    /** Keyboard interaction is enabled. */
    ON: 'on',
    /** Keyboard interaction is disabled. */
    OFF: 'off'
  };  

  /**
    Re-position the overlay if it's currently open.

    @ignore
  */
  function repositionIfOpen() {
    /* jshint -W040 */
    if (this.open) {
      // Re-position accordingly
      this._position();
    }
  }

  /**
    Lowecase the passed string if it's a string, passthrough if not.

    @ignore
  */
  function transformAlignment(alignment) {
    // Just pass through non-strings
    return typeof alignment === 'string' ? alignment.toLowerCase() : alignment;
  }

  Coral.register( /** @lends Coral.Overlay# */ {
    /**
      @class Coral.Overlay
      @classdesc An overlay component
      @extends Coral.Component
      @mixes Coral.mixin.overlay
      @borrows Coral.mixin.overlay#focusOnShow as Coral.Overlay#focusOnShow
      @borrows Coral.mixin.overlay#open as Coral.Overlay#open
      @borrows Coral.mixin.overlay#returnFocus as Coral.Overlay#returnFocus
      @borrows Coral.mixin.overlay#trapFocus as Coral.Overlay#trapFocus
      @borrows Coral.mixin.overlay#show as Coral.Overlay#show
      @borrows Coral.mixin.overlay#hide as Coral.Overlay#hide
      @borrows Coral.mixin.overlay#returnFocusTo as Coral.Overlay#returnFocusTo
      @borrows Coral.mixin.overlay#event:coral-overlay:beforeopen as Coral.Overlay#coral-overlay:beforeopen
      @borrows Coral.mixin.overlay#event:coral-overlay:beforeclose as Coral.Overlay#coral-overlay:beforeclose
      @borrows Coral.mixin.overlay#event:coral-overlay:open as Coral.Overlay#coral-overlay:open
      @borrows Coral.mixin.overlay#event:coral-overlay:close as Coral.Overlay#coral-overlay:close

      @htmltag coral-overlay
    */
    name: 'Overlay',
    tagName: 'coral-overlay',
    className: 'coral-Overlay',

    mixins: [
      Coral.mixin.overlay
    ],

    events: {
      'global:resize': '_position',
      'global:key:escape': '_handleEscape',
      'click [coral-close]': '_handleCloseClick'
    },

    properties: {
      /**
        The element the overlay should position relative to. It accepts values from {@link Coral.Overlay.target}, as
        well as a DOM element or a CSS selector. If a CSS selector is provided, the first matching element will be used.
        If a target is not specified, the overlay will not respect {@link Coral.Overlay#alignMy},
        {@link Coral.Overlay#alignAt}, or {@link Coral.Overlay#collision}.

        @type {Coral.Overlay.target|?HTMLElement|String}
        @default null
        @htmlattribute target
        @memberof Coral.Overlay#
      */
      'target': {
        default: null,
        // We don't want to validate that the value must change here
        // If a selector is provided, we'll take the first element matching that selector
        // If the DOM is modified and the user wants a new target with the same selector,
        // They should be able to set target = 'selector' again and get a different element
        validate: function(value) {
          return value === null || typeof value === 'string' || value instanceof Node;
        },
        set: function(value) {
          // Store new value
          this._target = value;

          if (this.target) {
            if (this.open) {
              // If the overlay is already visible, we should move it
              this._position();

              // To make it return focus to the right item, change the target
              if (this._returnFocus === Coral.mixin.overlay.returnFocus.ON) {
                this.returnFocusTo(this._getTarget());
              }
            }
          }
        }
      },

      /**
        The point on the overlay we should anchor from when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.CENTER_CENTER
        @htmlattribute alignmy
        @memberof Coral.Overlay#
      */
      'alignMy': {
        attribute: 'alignmy',
        default: align.CENTER_CENTER,
        transform: transformAlignment,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(align)
        ],
        sync: repositionIfOpen // @todo do this once if both align properties change
      },

      /**
        The point on the target we should anchor to when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.CENTER_CENTER
        @htmlattribute alignat
        @memberof Coral.Overlay#
      */
      'alignAt': {
        attribute: 'alignat',
        default: align.CENTER_CENTER,
        transform: transformAlignment,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(align)
        ],
        sync: repositionIfOpen // @todo do this once if both align properties change
      },

      /**
        The distance the overlay should be from its target.

        @type {Number}
        @default 0
        @htmlattribute offset
        @memberof Coral.Overlay#
      */
      'offset': {
        default: 0,
        transform: Coral.transform.number,
        validate: function(value) {
          return typeof value === 'number';
        },
        set: function(value) {
          this._offset = value;

          if (this.open) {
            // If the overlay is already visible, we should move it accordingly
            this._position();
          }
        }
      },

      /**
        The placement of the overlay. This property sets {@link Coral.Overlay#alignMy} and {@link Coral.Overlay#alignAt}.

        @type {Coral.Overlay.placement}
        @default null
        @htmlattribute placement
        @memberof Coral.Overlay#
      */
      'placement': {
        // default: null, // Don't provide a defualt here
        transform: transformAlignment,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(placement)
        ],
        set: function(value) {
          var alignValues = this._placementAlignValues[value];

          this.alignMy = alignValues.alignMy;
          this.alignAt = alignValues.alignAt;

          this._placement = value;
        }
      },

      /**
        The bounding element for the overlay. The overlay will be sized and positioned such that it is contained within
        this element. It accepts both a DOM Element or a CSS selector. If a CSS selector is provided, the first matching
        element will be used.

        @type {HTMLElement|String}
        @default window
        @memberof Coral.Overlay#
      */
      'within': {
        default: window,
        sync: repositionIfOpen
      },

      /**
        The collision handling strategy when positioning the overlay relative to a target.

        @type {Coral.Overlay.collision}
        @default Coral.Overlay.collision.FLIP_FIT
        @htmlattribute collision
        @memberof Coral.Overlay#
      */
      'collision': {
        default: collision.FLIP_FIT,
        sync: repositionIfOpen
      },

      // JSdoc inheritec
      'open': {
        sync: function() {
          if (this.open) {
            // Position when opened
            this._position();
          }
        }
      },

      /**
        Whether keyboard interaction is enabled.

        @type {Coral.Overlay.interaction}
        @default Coral.Overlay.interaction.ON
        @memberof Coral.Overlay#
      */
      'interaction': {
        default: interaction.ON,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(interaction)
        ]
      }
    },

    /** @protected */
    _overlayAnimationTime: 0,

    /** @ignore */
    _initialize: function() {
      // Hidden by default
      this.style.display = 'none';
    },

    /*
      Get the element the overlay is anchored to.

      @protected
      @param {HTMLElement|String} [target]
        A specific target value to use.
        If not provided, the current value of the {@link Coral.Overlay#target} property will be used.
      @memberof Coral.Overlay#
      @returns {HTMLElement|null}
    */
    _getTarget: function(targetValue) {
      // Use passed target
      targetValue = targetValue || this.target;

      if (targetValue instanceof Node) {
        // Just return the provided Node
        return targetValue;
      }

      // Dynamically get the target node based on target
      var newTarget = null;
      if (typeof targetValue === 'string') {
        if (targetValue === target.PREVIOUS) {
          newTarget = this.previousElementSibling;
        }
        else if (targetValue === target.NEXT) {
          newTarget = this.nextElementSibling;
        }
        else {
          newTarget = document.querySelector(targetValue);
        }
      }

      return newTarget;
    },

    /**
      A map of placement values to their corresponding alignMy and alignAt values.

      @protected
    */
    _placementAlignValues: {
      'right': {
        alignMy: 'left center',
        alignAt: 'right center'
      },
      'left': {
        alignMy: 'right center',
        alignAt: 'left center'
      },
      'top': {
        alignMy: 'center bottom',
        alignAt: 'center top'
      },
      'bottom': {
        alignMy: 'center top',
        alignAt: 'center bottom'
      }
    },

    /**
      Re-position the overlay if it's currently open.

      @function
      @memberof Coral.Overlay#
    */
    reposition: repositionIfOpen,

    /**
      Position the overlay according to {@link Coral.Overlay#target} and
      {@link Coral.Overlay#alignMy}/{@link Coral.Overlay#alignAt}.

      @protected
      @memberof Coral.Overlay#
    */
    _position: function() {
      // @todo do this sync style so we don't position more than necessary?

      // Do nothing unless open
      if (!this.open) {
        return;
      }

      var targetEl = this._getTarget();

      // Do nothing unless we have a target
      if (!targetEl) {
        return;
      }

      // A hook to allow implementation of strategies for preventing miscalculation
      this._beforePosition();

      // Apply offset
      var offset = this.offset;
      var offsetStrings = [];
      var alignMy = this.alignMy;
      var alignAt = this.alignAt;
      var alignMyParts = alignMy.split(' ');
      var alignAtParts = alignAt.split(' ');

      offsetStrings[0] = (offset > 0) ? '+' + offset : offset;
      offsetStrings[1] = (offset > 0) ? '-' + offset : '+' + -offset;

      if (offset) {
        if (alignMyParts[1] === 'top' && (alignAtParts[1] === 'bottom' || alignAtParts[1] === 'top')) {
          alignMy += offsetStrings[0];
        }
        else if (alignMyParts[1] === 'bottom' && (alignAtParts[1] === 'top' || alignAtParts[1] === 'bottom')) {
          alignMy += offsetStrings[1];
        }
        else if (alignMyParts[0] === 'left' && (alignAtParts[0] === 'right' || alignAtParts[0] === 'left')) {
          alignMy = alignMyParts.join(offsetStrings[0] + ' ');
        }
        else if (alignMyParts[0] === 'right' && (alignAtParts[0] === 'left' || alignAtParts[0] === 'right')) {
          alignMy = alignMyParts.join(offsetStrings[1] + ' ');
        }
      }

      // Perform the positioning calculation
      this.$.position({
        my: alignMy,
        at: alignAt,
        using: this._positionCallback,
        of: targetEl,
        collision: this.collision,
        within: this.within
      });
    },

    /**
      Called before positioning to setup the element (width etc).

      @protected
    */
    _beforePosition: function() {
      // Set max width if we're on the left or right
      if (this.alignMy.indexOf('left') === 0 || this.alignMy.indexOf('right') === 0) {
        // Make sure we're visible by setting display
        this.style.display = 'block';

        var target = this._getTarget();

        // Get the position and width of the target
        var targetPos = target.getBoundingClientRect();
        var windowWidth = window.innerWidth;

        // Get the max width of the overlay
        var distanceFromRight = windowWidth - (targetPos.left + targetPos.width);
        var distanceFromLeft = targetPos.left;
        var maxWidth = Math.max(distanceFromLeft, distanceFromRight);

        // Set the width
        this.style.maxWidth = maxWidth + 'px';

        // Reset display value
        this.style.display = '';
      }

      // Don't let the current position dictate the width of the element
      // If we're on the extreme left/right, we may be squishing
      this.style.left = '-9999px';
      this.style.top = '-9999px';
    },

    /**
      Receive the jQueryUI position utility's result and trigger events.

      @ignore

      @param {Object} position
        The calculated position.
      @param {Object} position.left
        The left position.
      @param {Object} position.right
        The right position.

      @fires Coral.Overlay#coral-overlay:positioned
    */
    _positionCallback: function(position, feedback) {
      this._applyPosition(position, feedback);
      this.trigger('coral-overlay:positioned', feedback);
    },

    /**
      Apply the calculated position.

      @protected

      @param {Object} position
        The calculated position.
      @param {Object} position.left
        The left position.
      @param {Object} position.right
        The right position.
    */
    _applyPosition: function(position, feedback) {
      this.style.top = position.top + 'px';
      this.style.left = position.left + 'px';

      this.trigger('coral-overlay:positioned', feedback);
    },

    /**
      @todo maybe this should be mixin or something
      @ignore
    */
    _handleCloseClick: function(event) {
      var dismissTarget = event.matchedTarget;
      var dismissValue = dismissTarget.getAttribute('coral-close');
      if (!dismissValue || this.$.is(dismissValue)) {
        this.hide();
        event.stopPropagation();
      }
    },

    /**
      Hides the overlay if it's on the top. When <code>interaction</code> is OFF it is ignored.

      @ignore
    */
    _handleEscape: function(event) {
      if (this.interaction === interaction.ON && this.open && this._isTopOverlay()) {
        this.hide();
      }
    },    

    /**
      @name Coral.Component#hide
      @ignore
    */

    /**
      @name Coral.Component#show
      @ignore
    */

    /**
      Triggered after the overlay is positioned.

      @event Coral.Overlay#coral-overlay:positioned

      @param {Object} event
        Event object.
      @param {String} event.detail.vertical
        The vertical position of the target relative to the overlay.
        <code>top</code> when the overlay is at the bottom, <code>bottom</code> when it is at the top.
      @param {String} event.detail.horizontal
        The horizontal position of the target relative to the overlay.
        <code>left</code> when the overlay is to the right, <code>right</code> when it is to the left.
      @param {String} event.detail.target
        The target's position.
      @param {String} event.detail.element
        The overlay's position.
    */
  });

  // Expose enums globally
  Coral.Overlay.align = align;
  Coral.Overlay.collision = collision;
  Coral.Overlay.target = target;
  Coral.Overlay.placement = placement;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Boolean enumeration for dialog closable state.

    @enum {String}
    @memberof Coral.Dialog
  */
  var closable = {
    /** Show a close button on the dialog and close the dialog when clicked. */
    ON: 'on',
    /** Do not show a close button. Elements with the <code>coral-close</code> attributes will stil close the dialog. */
    OFF: 'off'
  };

  /**
   Boolean enumeration for dialog keyboard interaction state.

   @enum {String}
   @memberof Coral.Dialog
   */
  var interaction = {
    /** Keyboard interaction is enabled. */
    ON: 'on',
    /** Keyboard interaction is disabled. */
    OFF: 'off'
  };

  /**
    Dialog variants.

    @enum {String}
    @memberof Coral.Dialog
  */
  var variant = {
    /** A dialog with the default, gray header and no icon. */
    DEFAULT: 'default',
    /** A dialog with a red header and warning icon, indicating that an error has occurred. */
    ERROR: 'error',
    /** A dialog with an orange header and warning icon, notifying the user of something important. */
    WARNING: 'warning',
    /** A dialog with a green header and checkmark icon, indicates to the user that an operation was successful. */
    SUCCESS: 'success',
    /** A dialog with a blue header and question mark icon, provides the user with help. */
    HELP: 'help',
    /** A dialog with a blue header and info icon, informs the user of non-critical information. */
    INFO: 'info'
  };

  /**
    Dialog backdrop types.

    @enum {String}
    @memberof Coral.Dialog
  */
  var backdrop = {
    /** No backdrop. */
    NONE: 'none',
    /** A backdrop that hides the dialog when clicked. */
    MODAL: 'modal',
    /** A backdrop that does not hide the dialog when clicked. */
    STATIC: 'static'
  };

  /**
    Map of variant -> icon class names

    @ignore
  */
  var ICON_CLASSES = {
    'error': 'alert',
    'warning': 'alert',
    'success': 'checkCircle',
    'help': 'helpCircle',
    'info': 'infoCircle'
  };

  // The dialog's base classname
  var CLASSNAME = 'coral-Dialog';

  // A string of all possible variant classnames
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }

  Coral.register( /** @lends Coral.Dialog# */ {
    /**
      @class Coral.Dialog
      @classdesc A Dialog component
      @extends Coral.Component
      @extends Coral.mixin.overlay
      @htmltag coral-dialog
    */
    name: 'Dialog',
    tagName: 'coral-dialog',
    className: CLASSNAME,

    mixins: [
      Coral.mixin.overlay
    ],

    events: {
      'click [coral-close]': '_handleCloseClick',

      // Since we cover the backdrop with ourself for positioning purposes, this is implemented as a click listener
      // instead of using backdropClickedCallback
      'click': '_handleClick',

      // Handle resize events
      'global:resize': 'center',

      'global:key:escape': '_handleEscape'
    },

    properties: {

      /**
        Whether keyboard interaction is enabled.

        @type {Coral.Dialog.interaction}
        @default Coral.Dialog.interaction.ON
        @memberof Coral.Dialog#
      */
      'interaction': {
        default: interaction.ON,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(interaction)
        ]
      },

      /**
        Whether to trap tabs and keep them within the overlay.

        @type {Coral.mixin.overlay.trapFocus}
        @default Coral.mixin.overlay.trapFocus.ON
        @htmlattribute trapfocus
        @memberof Coral.Dialog#
      */
      'trapFocus': {
        default: Coral.mixin.overlay.trapFocus.ON
      },

      /**
        Whether to return focus to the previously focused element when closed.

        @type {Coral.mixin.overlay.returnFocus}
        @default Coral.mixin.overlay.returnFocus.ON
        @htmlattribute returnfocus
        @memberof Coral.Dialog#
      */
      'returnFocus': {
        default: Coral.mixin.overlay.returnFocus.ON
      },

      /**
        The dialog's header element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Dialog#
      */
      'header': Coral.property.contentZone({
        handle: 'header',
        tagName: 'coral-dialog-header'
      }),

      /**
        The dialog's content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Dialog#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-dialog-content'
      }),

      /**
        The dialog's footer element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Dialog#
      */
      'footer': Coral.property.contentZone({
        handle: 'footer',
        tagName: 'coral-dialog-footer'
      }),

      /**
        The backdrop configuration for this dialog.

        @type {Coral.Dialog.backdrop}
        @default Coral.Dialog.backdrop.MODAL
        @htmlattribute backdrop
        @memberof Coral.Dialog#
      */
      'backdrop': {
        default: backdrop.MODAL,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(backdrop)
        ],
        sync: function() {
          if (this.open) {
            // We're visible now, so hide or show the modal accordingly
            if (this.backdrop !== 'none') {
              this._showBackdrop();
            }
          }
        }
      },

      /**
        The dialog's variant.

        @type {Coral.Dialog.variant}
        @default Coral.Dialog.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Dialog#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // Remove all variant classes
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant === Coral.Dialog.variant.DEFAULT) {
            this._elements.icon.icon = '';

            // ARIA
            this.setAttribute('role', 'dialog');
          }
          else {
            this._elements.icon.icon = ICON_CLASSES[this.variant];

            // Set new variant class
            // Don't use this._className; use the constant
            // This lets popover get our styles for free
            this.$.addClass(CLASSNAME + '--' + this.variant);

            // ARIA
            this.setAttribute('role', 'alertdialog');
          }
        }
      },

      /**
        Whether the dialog should be displayed full screen (without borders or margin).

        @type {Boolean}
        @default false
        @htmlattribute fullscreen
        @htmlattributereflected
        @memberof Coral.Dialog#
      */
      'fullscreen': {
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$[this.fullscreen ? 'addClass' : 'removeClass'](this._className + '--fullscreen');

          if (this.fullscreen) {
            // Remove any positioning that may have been added by centering
            this._elements.wrapper.style.top = '';
            this._elements.wrapper.style.left = '';
            this._elements.wrapper.style.marginLeft = '';
            this._elements.wrapper.style.marginTop = '';

            this._elements.closeButton.iconSize = 'S';
          }
          else {
            this._elements.closeButton.iconSize = 'XS';

            // Recenter the dialog if fullscreen was removed
            this._center();
          }
        }
      },

      // JSDoc inherited
      'open': {
        sync: function() {
          if (this.open) {
            // Ensure we're a child of the body
            // Fake out mixin.overlay's detached/attachedCallback so they don't do anything
            this._open = false;
            if (this.parentNode !== document.body) {
              document.body.insertBefore(this, document.body.lastElementChild);
            }
            this._open = true;

            // Center immediately during sync method. Don't invoke center() directly, as that would wait a frame
            this._center();

            // Show the backdrop, if necessary
            if (this.backdrop !== 'none') {
              this._showBackdrop();
            }

            // Focus on the top of the dialog. Pressing the tab key will then focus on the close button/content/footer
            this.focus();
          }
        }
      },

      /**
        The dialog's icon.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Dialog#
      */
      'icon': Coral.property.proxy({
        path: 'elements.icon.icon'
      }),

      /**
        Whether the dialog should have a close button.

        @type {Coral.Dialog.closable}
        @default Coral.Dialog.closable.OFF
        @htmlattribute closable
        @htmlattributereflected
        @memberof Coral.Dialog#
      */
      'closable': {
        default: closable.OFF,
        reflectAttribute: true,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(closable)
        ],
        sync: function() {
          this.$.toggleClass(this._className + '--closable', this.closable === closable.ON);
          this._elements.closeButton.style.display = this.closable === closable.ON ? '' : 'none';
        }
      }
    },

    /** @protected */
    _overlayAnimationTime: Coral.mixin.overlay.FADETIME,

    /** @ignore */
    _initialize: function() {
      // Always execute in the context of the component
      this._center = this._center.bind(this);

      this.style.display = 'none';
    },

    /** @ignore */
    _handleEscape: function(event) {
      // When escape is pressed, hide ourselves
      if (this.interaction === Coral.Dialog.interaction.ON && this.open && this._isTopOverlay()) {
        this.hide();
      }
    },

    /**
      @ignore
      @todo maybe this should be mixin or something
    */
    _handleCloseClick: function(event) {
      var dismissTarget = event.matchedTarget;
      var dismissValue = dismissTarget.getAttribute('coral-close');
      if (!dismissValue || this.$.is(dismissValue)) {
        this.hide();
        event.stopPropagation();
      }
    },

    /** @ignore */
    _handleClick: function(event) {
      // When we're modal, we close when our outer area (over the backdrop) is clicked
      if (event.target === this && this.backdrop !== backdrop.STATIC && this._isTopOverlay()) {
        this.hide();
      }
    },

    /** @ignore */
    attachedCallback: function() {
      Coral.Component.prototype.attachedCallback.apply(this, arguments);

      // Center ourself
      if (this.open) {
        this._center();
      }
    },

    /** @ignore */
    _render: function() {
      // Fetch or create the header, content, and footer sub-components
      var header = this._elements.header = this.querySelector('coral-dialog-header') || document.createElement('coral-dialog-header');
      var content = this._elements.content = this.querySelector('coral-dialog-content') || document.createElement('coral-dialog-content');
      var footer = this._elements.footer = this.querySelector('coral-dialog-footer') || document.createElement('coral-dialog-footer');

      // We need to create the wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'coral-Dialog-wrapper';

      // This is where content zones will be appended
      var contentZoneTarget = wrapper;

      // The outer-most wrapper, optionally provided by the user
      var userProvidedWrapper;

      if (content.parentNode && content.parentNode !== this) {
        // A wrapper has been provided, use it to insert content zones into
        userProvidedWrapper = content.parentNode;
        contentZoneTarget = userProvidedWrapper;

        // Find the parent-most wrapper -- we'll append this into the component to keep the tree intact
        // This lets us support multiple wrappers
        while (userProvidedWrapper.parentNode && userProvidedWrapper.parentNode !== this) {
          userProvidedWrapper = userProvidedWrapper.parentNode;
        }

        // Remove the parent-most wrapper from the component so it doesn't get moved later
        userProvidedWrapper.parentNode.removeChild(userProvidedWrapper);
      }

      // Store a reference and give the wrapper the right classname
      this._elements.wrapper = wrapper;
      this._elements.$wrapper = $(wrapper);

      // Render the template for the header
      var headerFrag = Coral.templates.Dialog.header.call(this._elements);

      // Move the header sub-component into the rendered header template
      this._elements.headerContent.appendChild(header);

      var headerWrapper = document.createElement('div');
      headerWrapper.className = 'coral-Dialog-header';
      headerWrapper.appendChild(headerFrag);

      // Move the rendered header template into the wrapper
      contentZoneTarget.appendChild(headerWrapper);

      // Move the content and footer sub-components to the wrapper
      contentZoneTarget.appendChild(content);
      contentZoneTarget.appendChild(footer);

      // Finally, move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Add the wrapper to the component
      this.appendChild(wrapper);

      if (userProvidedWrapper) {
        wrapper.appendChild(userProvidedWrapper);
      }
    },

    /**
      Centers the dialog in the middle of the screen.

      @returns {Coral.Dialog} this, chainable.
    */
    center: function() {
      if (this.fullscreen) {
        // We're already centered in fullscreen mode
        return;
      }

      if (this._centered === true) {
        // If we've already centered or never centered before, wait a frame
        Coral.commons.nextFrame(this._center);
      }

      // Mark that we're not currently centered
      this._centered = false;

      return this;
    },

    /** @private */
    _center: function() {
      var wrapper = this._elements.wrapper;

      var currentStyle = this.style.display;

      // Set display to block so we can measure
      this.style.display = 'block';

      // Change to absolute so we can calculate correctly. Shove it to the top left so we can calculate width
      // correctly
      wrapper.style.position = 'absolute';
      wrapper.style.left = 0;
      wrapper.style.top = 0;

      // Calculate the size
      var width = this._elements.$wrapper.outerWidth();
      var height = this._elements.$wrapper.outerHeight();

      // Only position vertically if we have to use 20px buffers to match the margin from CSS
      if (height < window.innerHeight - 20) {
        // Set position
        wrapper.style.left = '50%';
        wrapper.style.top = '50%';
        wrapper.style.marginLeft = -(width / 2) + 'px';
        wrapper.style.marginTop = -(height / 2) + 'px';
      }
      else {
        // Position normally, allowing scroll
        wrapper.style.position = '';
        wrapper.style.marginLeft = '';
        wrapper.style.marginTop = '';
      }

      // Reset display to previous style
      this.style.display = currentStyle;

      // Mark that we're centered
      this._centered = true;
    }
  });


  Coral.register( /** @lends Coral.Dialog.Header */ {
    /**
      @class Coral.Dialog.Header
      @classdesc A Dialog Header component
      @extends Coral.Component
      @htmltag coral-dialog-header
    */
    name: 'Dialog.Header',
    tagName: 'coral-dialog-header'
  });

  Coral.register( /** @lends Coral.Dialog.Footer */ {
    /**
      @class Coral.Dialog.Footer
      @classdesc A Dialog Footer component
      @extends Coral.Component
      @htmltag coral-dialog-footer
    */
    name: 'Dialog.Footer',
    tagName: 'coral-dialog-footer',
    className: 'coral-Dialog-footer'
  });

  Coral.register( /** @lends Coral.Dialog.Content */ {
    /**
      @class Coral.Dialog.Content
      @classdesc A Dialog Content component
      @extends Coral.Component
      @htmltag coral-dialog-content
    */
    name: 'Dialog.Content',
    tagName: 'coral-dialog-content',
    className: 'coral-Dialog-content'
  });

  // Expose enums globally
  Coral.Dialog.interaction = interaction;
  Coral.Dialog.variant = variant;
  Coral.Dialog.backdrop = backdrop;
  Coral.Dialog.closable = closable;
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Dialog"] = this["Coral"]["templates"]["Dialog"] || {};
this["Coral"]["templates"]["Dialog"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["header"] = document.createElement("coral-dialog-header");
  el0.setAttribute("handle", "header");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["content"] = document.createElement("coral-dialog-content");
  el2.setAttribute("handle", "content");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["footer"] = document.createElement("coral-dialog-footer");
this["$"+"footer"] = $(el4);
  el4.setAttribute("handle", "$footer");
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  return frag;
});

this["Coral"]["templates"]["Dialog"]["header"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.setAttribute("handle", "icon");
  el0.setAttribute("size", "S");
  el0.className += " coral-Dialog-typeIcon";
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["headerContent"] = document.createElement("h2");
  el2.setAttribute("handle", "headerContent");
  el2.className += " coral-Dialog-title coral-Heading coral-Heading--2";
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["closeButton"] = document.createElement("button","coral-button");
  el4.setAttribute("handle", "closeButton");
  el4.className += " coral-Dialog-closeButton";
  el4.setAttribute("type", "button");
  el4.setAttribute("is", "coral-button");
  el4.setAttribute("variant", "minimal");
  el4.setAttribute("icon", "close");
  el4.setAttribute("iconsize", "XS");
  el4.setAttribute("aria-label", "Close");
  el4.setAttribute("coral-close", "");
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral3-Popover';

  /**
    Boolean enumeration for popover closable state.

    @memberof Coral.Popover
    @enum {String}
  */
  var closable = {
    /** Show a close button on the popover and close the popover when clicked. */
    ON: 'on',
    /**
      Do not show a close button. Elements with the <code>coral-close</code> attributes will still close the
      popover.
    */
    OFF: 'off'
  };

  /**
    Popover interaction values.

    @enum {String}
    @memberof Coral.Popover
  */
  var interaction = {
    /** Show when the target is clicked and hide when clicked outside of the target and popover. */
    ON: 'on',
    /** Do not show or hide automatically. */
    OFF: 'off'
  };

  /**
    Popover variants.

    @memberof Coral.Popover
    @enum {String}
  */
  var variant = {
    /** A popover with the default, gray header and no icon. */
    DEFAULT: 'default',
    /** A popover with a red header and warning icon, indicating that an error has occurred. */
    ERROR: 'error',
    /** A popover with an orange header and warning icon, notifying the user of something important. */
    WARNING: 'warning',
    /** A popover with a green header and checkmark icon, indicates to the user that an operation was successful. */
    SUCCESS: 'success',
    /** A popover with a blue header and question mark icon, provides the user with help. */
    HELP: 'help',
    /** A popover with a blue header and info icon, informs the user of non-critical information. */
    INFO: 'info'
  };

  Coral.register( /** @lends Coral.Popover# */ {
    /**
      @class Coral.Popover
      @classdesc A Popover component
      @extends Coral.Component
      @htmltag coral-popover
      @extends Coral.Overlay
    */
    name: 'Popover',
    tagName: 'coral-popover',
    className: CLASSNAME,
    extend: Coral.Overlay,

    events: {
      'global:click': '_handleClick',

      'click [coral-close]': '_handleCloseClick'
    },

    properties: {
      /**
        Whether to trap tabs and keep them within the overlay.

        @type {Coral.mixin.overlay.trapFocus}
        @default Coral.mixin.overlay.trapFocus.ON
        @htmlattribute trapfocus
        @memberof Coral.Popover#
      */
      'trapFocus': {
        default: Coral.mixin.overlay.trapFocus.ON
      },

      /**
        Whether to return focus to the previously focused element when closed.

        @type {Coral.mixin.overlay.returnFocus}
        @default Coral.mixin.overlay.returnFocus.ON
        @htmlattribute returnfocus
        @memberof Coral.Popover#
      */
      'returnFocus': {
        default: Coral.mixin.overlay.returnFocus.ON
      },

      /**
        The popover's content element.

        @contentzone
        @name content
        @type {HTMLElement}
        @memberof Coral.Popover#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-popover-content'
      }),

      /**
        The popover's header element.

        @contentzone
        @name header
        @type {HTMLElement}
        @memberof Coral.Popover#
      */
      'header': Coral.property.contentZone({
        handle: 'header',
        tagName: 'coral-popover-header',
        set: function(value) {
          // Stop observing the old header and observe the new one
          this._observeHeader();

          // Check if header needs to be hidden
          this._hideHeaderIfEmpty();
        }
      }),

      /**
        The point on the overlay we should anchor from when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.LEFT_CENTER
        @htmlattribute alignmy
        @memberof Coral.Popover#
      */
      'alignMy': {
        default: Coral.Overlay.align.LEFT_CENTER
      },

      /**
        The point on the target we should anchor to when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.RIGHT_CENTER
        @htmlattribute alignat
        @memberof Coral.Overlay#
      */
      'alignAt': {
        default: Coral.Overlay.align.RIGHT_CENTER
      },

      /**
        The placement of the overlay. This property sets {@link Coral.Overlay#alignMy} and {@link Coral.Overlay#alignAt}.

        @type {Coral.Overlay.placement}
        @default Coral.Overlay.placement.RIGHT
        @name placement
        @htmlattribute placement
        @memberof Coral.Popover#
      */

      /**
        The distance the overlay should be from its target.

        @type {Number}
        @default 5
        @htmlattribute offset
        @memberof Coral.Popover#
      */
      'offset': {
        default: 5
      },

      // JSDoc inherited
      'open': {
        sync: function() {
          if (this.open) {
            // Announce when opened
            this.focus();
          }

          var $target = $(this._getTarget());
          if (this.open) {
            // Check if the target already has is-selected
            this._targetWasSelected = $target.hasClass('is-selected');

            // Only bother adding the class if the target doesn't have it
            if (!this._targetWasSelected) {
              // Highlight target
              $target.addClass('is-selected');
            }
          }
          else if (!this._targetWasSelected) {
            // When closed, only remove the class if the target didn't have it before
            $target.removeClass('is-selected');
          }
        }
      },

      // JSDoc inherited
      'target': {
        sync: function() {
          if (this.target) {
            if (this.open) {
              // Announce again when target changed
              this.focus();
            }
          }
        }
      },

      /**
        Whether the popover should show itself when the target is interacted with.

        @type {Coral.Popover.interaction}
        @default Coral.Popover.interaction.ON
        @name interaction
        @htmlattribute interaction
        @memberof Coral.Popover#
      */
      'interaction': {
        default: interaction.ON
      },

      /**
        The popover's variant.

        @type {Coral.Dialog.variant}
        @default Coral.Dialog.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Popover#
      */
      // Inherit from Dialog
      'variant': Coral.Dialog.prototype._properties.variant,

      /**
        Whether the popover should have a close button.

        @type {Coral.Popover.closable}
        @default Coral.Popover.closable.OFF
        @htmlattribute closable
        @htmlattributereflected
        @memberof Coral.Popover#
      */
      'closable': {
        default: closable.OFF,
        reflectAttribute: true,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(closable)
        ],
        sync: function() {
          this._elements.closeButton.style.display = this.closable === closable.ON ? '' : 'none';
        }
      },

      /**
        The popover's icon.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Popover#
      */
      'icon': Coral.property.proxy({
        path: '_elements.icon.icon'
      })
    },

    // Use the fade time from overlay
    _overlayAnimationTime: Coral.mixin.overlay.FADETIME,

    /** @ignore */
    _observeHeader: function() {
      this._headerObserver.disconnect();
      this._headerObserver.observe(this._elements.header, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    },

    /**
      Hide the header wrapper if the header content zone is empty.
      @ignore
    */
    _hideHeaderIfEmpty: function() {
      var header = this._elements.header;

      // If it's empty and has no non-textnode children, hide the header
      var hiddenValue = header.children.length === 0 && header.textContent.replace(/\s*/g, '') === '';

      // Only bother if the hidden status has changed
      if (hiddenValue !== this._elements.headerWrapper.hidden) {
        this._elements.headerWrapper.hidden = hiddenValue;

        // Reposition as the height has changed
        this.reposition();
      }
    },

    /**
      @ignore
      @todo maybe this should be mixin or something
    */
    _handleCloseClick: function(event) {
      var dismissTarget = event.matchedTarget;
      var dismissValue = dismissTarget.getAttribute('coral-close');
      if (!dismissValue || this.$.is(dismissValue)) {
        this.hide();
        event.stopPropagation();
      }
    },

    _handleClick: function(event) {
      if (this.interaction === interaction.OFF) {
        // Since we use delegation, just ignore clicks if interaction is off
        return;
      }

      var eventTarget = event.target;
      var targetEl = this._getTarget();

      var eventIsWithinTarget = targetEl ? targetEl.contains(eventTarget) : false;

      if (eventIsWithinTarget) {
        // When target is clicked

        if (!this.open && !targetEl.disabled) {
          // Open if we're not already open and target element is not disabled
          this.show();
        }
        else {
          this.hide();
        }
      }
      else if (this.open && !this.contains(eventTarget)) {
        // Close if we're open and the click was outside of the target and outside of the popover
        this.hide();
      }
    },

    /** @ignore */
    attachedCallback: function() {
      // Call top level class' attachedCallback
      Coral.Component.prototype.attachedCallback.call(this);

      // @todo CUI-3739 - expose methods on prototype and call from there
      // Re-implmement behavior from Coral.mixin.overlay's attachedCallback
      if (this.open) {
        this._pushOverlay();

        if (this._showBackdropOnAttached) {
          // Show the backdrop again
          this._showBackdrop();
        }

        // @todo CUI-3899 - add this to Coral.Overlay
        // Reposition when attached if open
        this.reposition();
      }

      // @polyfill IE9
      // Check if we're empty and hide if so
      // We must do this because IE does not catch mutations when nodes are not in the DOM
      this._hideHeaderIfEmpty();
    },

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var frag = document.createDocumentFragment();

      // Create a wrapper for the header
      // This lets us apply the right CSS classes to the outer container
      var headerWrapper = this._elements.headerWrapper = document.createElement('div');
      headerWrapper.className = 'coral-Dialog-header coral-Popover-header';

      // Create a wrapper for the content
      // This lets us apply the CSS classes to the outer container, while letting the user freely apply classes to the
      // content zone
      var contentWrapper = this._elements.contentWrapper = document.createElement('div');
      contentWrapper.className = 'coral3-Popover-content';

      // Render the template for the header and move it into the wrapper
      var headerFrag = Coral.templates.Dialog.header.call(this._elements);
      headerWrapper.appendChild(headerFrag);

      // Try to find the header
      var foundHeader = this.querySelector('coral-popover-header');

      // Fetch or create the header, content, and footer sub-components
      var header = this._elements.header = foundHeader || document.createElement('coral-popover-header');
      var content = this._elements.content = this.querySelector('coral-popover-content') ||
        document.createElement('coral-popover-content');

      // Move the header sub-component into the rendered header template
      this._elements.headerContent.appendChild(header);

      // Add the content zone to the wrapper
      contentWrapper.appendChild(content);

      if (!foundHeader) {
        // Hide the wrapper if no header was provided
        headerWrapper.hidden = true;
      }

      // Move the rendered header template into the frag
      frag.appendChild(headerWrapper);

      // Move the content and footer sub-components to the frag
      frag.appendChild(contentWrapper);

      // Finally, move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Add the frag to the component
      this.appendChild(frag);
    },

    /** @ignore */
    _initialize: function() {
      // ARIA
      this.setAttribute('role', 'dialog');
      this.setAttribute('aria-live', 'assertive'); // This helped annoucements in certian screen readers

      // Listen for mutations
      this._headerObserver = new MutationObserver(this._hideHeaderIfEmpty.bind(this));

      // Watch for changes to the header element's children
      this._observeHeader();
    }
  });

  Coral.register( /** @lends Coral.Popover.Content */ {
    /**
      @class Coral.Popover.Content
      @classdesc A Popover Content component
      @extends Coral.Component
      @htmltag coral-popover-content
    */
    name: 'Popover.Content',
    tagName: 'coral-popover-content'
  });

  Coral.register( /** @lends Coral.Popover.Header */ {
    /**
      @class Coral.Popover.Header
      @classdesc A Popover Header component
      @extends Coral.Dialog.Header
      @htmltag coral-popover-header
    */
    name: 'Popover.Header',
    tagName: 'coral-popover-header'
  });

  Coral.register( /** @lends Coral.Popover.Separator */ {
    /**
      @class Coral.Popover.Separator
      @classdesc A Popover Separator component
      @extends Coral.Component
      @htmltag coral-popover-separator
    */
    name: 'Popover.Separator',
    tagName: 'coral-popover-separator',
    className: 'coral-Popover-separator'
  });

  Coral.Popover.closable = closable;
  Coral.Popover.interaction = interaction;
  Coral.Popover.variant = variant;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.ActionBar# */ {
    /**
      @class Coral.ActionBar
      @classdesc An ActionBar component
      @extends Coral.Component
      @htmltag coral-actionbar
    */
    name: 'ActionBar',
    tagName: 'coral-actionbar',
    className: 'coral-ActionBar',

    events: {
      'key:up': '_onFocusPreviousItem',
      'key:left': '_onFocusPreviousItem',
      'key:down': '_onFocusNextItem',
      'key:right': '_onFocusNextItem',
      'global:resize': '_onResizeWindow'
    },

    properties: {
      /**
        The primary (left) container of the ActionBar.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.ActionBar#
      */
      'primary': Coral.property.contentZone({
        handle: 'primary',
        tagName: 'coral-actionbar-container'
      }),

      /**
        The secondary (right) container of the ActionBar.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.ActionBar#
      */
      'secondary': Coral.property.contentZone({
        handle: 'secondary',
        tagName: 'coral-actionbar-container'
      })
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      // if the containers doe not exist we create them
      var containers = this.querySelectorAll('coral-actionbar-container');

      this._elements.primary = containers.length > 0 ? containers[0] :
        document.createElement('coral-actionbar-container');
      this._elements.secondary = containers.length > 1 ? containers[1] :
        document.createElement('coral-actionbar-container');

      fragment.appendChild(this._elements.primary);
      fragment.appendChild(this._elements.secondary);

      // moves the existing components to the left
      while (this.firstChild) {
        this._elements.primary.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
    },

    /** @ignore */
    _recalculateLayoutOnMutation: function() {
      // recalculate layout on dom element size change + on dom mutation
      // http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/

      // relayout any time the dom changes
      // wait a frame so that initial dom changes are already done
      var self = this;
      Coral.commons.nextFrame(function() {

        self._observer = new MutationObserver(function() {
          self._onLayout();
        });

        // Watch for changes
        self._observer.observe(self, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      });
    },

    /** @ignore */
    _initialize: function() {

      // bind this._onLayout so it can be removed again
      this._onLayout = this._onLayout.bind(this);

      // @todo: see CUI-3907. This should be Coral.commons.ready
      var self = this;
      Coral.commons.nextFrame(function() {
        //force one layout
        self._onLayout();

        // use the smart strategy instead of re-rendering every frame
        self._recalculateLayoutOnMutation();
      });
    },

    // JSDocs inherited
    attachedCallback: function() {
      Coral.Component.prototype.attachedCallback.apply(this, arguments);

      var self = this;
      Coral.commons.nextFrame(function() {
        // re-calculate layout on element resize
        // wait one frame to attach resize listeners in order to be sure, that sub components are ready
        Coral.commons.addResizeListener(self, self._onLayout);
        Coral.commons.addResizeListener(self.primary, self._onLayout);
        Coral.commons.addResizeListener(self.secondary, self._onLayout);
      });
    },

    // JSDocs inherited
    detachedCallback: function() {
      Coral.Component.prototype.detachedCallback.apply(this, arguments);

      // remove global resize event listeners
      Coral.commons.removeResizeListener(this, this._onLayout);
      Coral.commons.removeResizeListener(this.primary, this._onLayout);
      Coral.commons.removeResizeListener(this.secondary, this._onLayout);
    },

    /** @ignore */
    _onFocusPreviousItem: function(event) {
      // stops the page from scrolling
      event.preventDefault();

      var previousItem = this._getPreviousSelectableWrappedItem(event.target);
      if (previousItem !== null) {
        previousItem.focus();
      }
    },

    /** @ignore */
    _onFocusNextItem: function(event) {
      // stops the page from scrolling
      event.preventDefault();

      var nextWrappedItem = this._getNextSelectableWrappedItem(event.target);
      if (nextWrappedItem !== null) {
        nextWrappedItem.focus();
      }
    },

    /** @ignore */
    _onResizeWindow: function() {
      // just close all popovers for now when screen is resized
      // there might be more popovers, then the 'more' popovers
      var popovers = this.querySelectorAll('coral-popover');
      for (var i = 0; i < popovers.length; i++) {
        popovers[i].open = false;
      }

      // force a relayout (needed especially if framerate during resize drops e.g.: in FF)
      this._onLayout();
    },

    /** @ignore */
    _onLayout: function() {
      if (!this.primary || !this.primary._elements.popover || !this.secondary || !this.secondary._elements.popover) {
        // while containers are not cached do nothing
        return;
      }

      if (this.primary._elements.popover.open === true || this.secondary._elements.popover.open === true) {
        // while popovers are open do not relayout
        return;
      }

      var focusedItem = document.activeElement;
      if (!$.contains(this, focusedItem)) {
        // focus not on the actionbar => do not bother
        focusedItem = null;
      }

      if (focusedItem &&
        focusedItem.parentNode &&
        focusedItem.parentNode.tagName.toLowerCase() === 'coral-actionbar-item') {
        // focusedItem is wrapped
        focusedItem = focusedItem.parentNode;
      }

      var ERROR_MARGIN = 25;
      // both containers do have a 15 px offset from left/right
      var CONTAINER_OFFSET = 15;

      var leftItems = this.primary.items.getAll();
      var rightItems = this.secondary.items.getAll().reverse();
      var itemLeft = null;
      var itemRight = null;
      var widthCache = this._newWidthCache();
      var leftMoreButtonWidth = (leftItems.length > 0) ?
        widthCache.getOuterWidth(this.primary._elements.moreButton) : 0;
      var rightMoreButtonWidth = (rightItems.length > 0) ?
        widthCache.getOuterWidth(this.secondary._elements.moreButton) : 0;

      // Make it possible to set left/right padding to the containers
      var borderWidthLeftContainer = this.primary.offsetWidth - this.primary.$.width();
      var borderWidthRightContainer = this.secondary.offsetWidth - this.secondary.$.width();

      var availableWidth = this.offsetWidth - 2 * CONTAINER_OFFSET - leftMoreButtonWidth - rightMoreButtonWidth -
        borderWidthLeftContainer - borderWidthRightContainer - ERROR_MARGIN;
      var currentUsedWidth = 0;
      var leftVisibleItems = 0;
      var rightVisibleItems = 0;
      var moreButtonLeftVisible = false;
      var moreButtonRightVisible = false;
      var showItem = false;
      var itemWidth = 0;

      for (var i = 0; i < leftItems.length || i < rightItems.length; i++) {
        itemLeft = (i < leftItems.length) ? leftItems[i] : null;
        itemRight = (i < rightItems.length) ? rightItems[i] : null;

        // first calculate visibility of left item
        showItem = false;
        if (itemLeft !== null) {

          if (itemLeft.hidden || itemLeft.style.display === 'none') {
            // item is hidden on purpose (we don't use it for layouting but do also not move offscreen) needed as it
            // might already have been moved offscreen before
            this._moveToScreen(itemLeft);
          }
          else {
            // if item is not hidden on purpose (hiding by actionBar due to space problems does not count) => layout
            // element
            if (!moreButtonLeftVisible) {

              if (this.primary.threshold <= 0 || leftVisibleItems < this.primary.threshold) {
                // if threshold is not reached so far
                itemWidth = widthCache.getOuterWidth(itemLeft);

                if (currentUsedWidth + itemWidth < availableWidth) {
                  // if there is still enough space to show another item
                  showItem = true;
                }
                else if (leftVisibleItems === leftItems.length - 1 &&
                  currentUsedWidth + itemWidth < availableWidth + leftMoreButtonWidth
                ) {
                  // if this is the last item and so far there have been no items hidden => don't show more button
                  showItem = true;
                }
              }
            }

            // enable tab for first left item
            this._makeItemTabEnabled(itemLeft, showItem && i === 0);

            if (showItem) {
              leftVisibleItems += 1;
              currentUsedWidth += itemWidth;
              this._moveToScreen(itemLeft);
            }
            else {
              this._hideItem(itemLeft);
              moreButtonLeftVisible = true;
            }

            if (leftVisibleItems === leftItems.length) {
              // left more button not needed => more free space available
              availableWidth += leftMoreButtonWidth;
              moreButtonLeftVisible = false;
            }
          }
        }

        // then calculate visibility of right item
        showItem = false;
        if (itemRight !== null) {
          if (itemRight.hidden || itemRight.style.display === 'none') {
            // item is hidden on purpose (we don't use it for layouting but do also not move offscreen) needed as it
            // might already have been moved offscreen before
            this._moveToScreen(itemRight);
          }
          else {
            // if item is not hidden on purpose (hiding by actionBar due to space problems does not count) => layout
            // element
            if (!moreButtonRightVisible) {

              if (this.secondary.threshold <= 0 || rightVisibleItems < this.secondary.threshold) {
                // if threshold is not reached so far
                itemWidth = widthCache.getOuterWidth(itemRight);

                if (currentUsedWidth + itemWidth < availableWidth) {
                  // if there is still enough space to show another item
                  showItem = true;
                }
                else if (rightVisibleItems === rightItems.length - 1 &&
                  currentUsedWidth + itemWidth < availableWidth + rightMoreButtonWidth
                ) {
                  // if this is the last item and so far there have been no items hidden => don't show more button
                  showItem = true;
                }
              }
            }

            // enable tab for 'first' right item
            this._makeItemTabEnabled(itemRight, showItem && (i === rightItems.length - 1));

            if (showItem) {
              rightVisibleItems += 1;
              currentUsedWidth += itemWidth;
              this._moveToScreen(itemRight);
            }
            else {
              this._hideItem(itemRight);
              moreButtonRightVisible = true;
            }

            if (rightVisibleItems === rightItems.length) {
              // left more button not needed => more free space available
              availableWidth += rightMoreButtonWidth;
              moreButtonRightVisible = false;
            }
          }
        }
      }

      // show or hide more buttons
      this._moveToScreen(this.primary._elements.moreButton, moreButtonLeftVisible);
      this._moveToScreen(this.secondary._elements.moreButton, moreButtonRightVisible);

      // enable tabs on more buttons if needed
      this._makeItemTabEnabled(this.primary._elements.moreButton, leftVisibleItems < 1);
      this._makeItemTabEnabled(this.secondary._elements.moreButton, rightVisibleItems < rightItems.length);

      // we need to check if item has 'hasAttribute' because it is not present on the document
      if (focusedItem && focusedItem.hasAttribute && focusedItem.hasAttribute('coral-actionbar-offscreen')) {
        // if currently an element is focused, that should not be visible => select first selectable element nicer
        // algorithm possible
        var wrappedItem = Coral.ActionBar._getFirstSelectableWrappedItem(this._getAllSelectableItems()[0]);
        if (wrappedItem) {
          wrappedItem.focus();
        }
      }
    },

    /** @ignore */
    _getNextSelectableWrappedItem: function(currentItem) {
      if (currentItem.parentNode.tagName.toLowerCase() === 'coral-actionbar-item') {
        // currentItem is wrapped
        currentItem = currentItem.parentNode;
      }

      var selectableItems = this._getAllSelectableItems();
      var index = selectableItems.indexOf(currentItem);

      if (index >= 0 && selectableItems.length > index + 1) {
        //if there is a next selectable element return it
        return Coral.ActionBar._getFirstSelectableWrappedItem(selectableItems[index + 1]);
      }

      return null;
    },

    /** @ignore */
    _getPreviousSelectableWrappedItem: function(currentItem) {
      if (currentItem.parentNode.tagName.toLowerCase() === 'coral-actionbar-item') {
        // currentItem is wrapped
        currentItem = currentItem.parentNode;
      }

      var selectableItems = this._getAllSelectableItems();
      var index = selectableItems.indexOf(currentItem);

      if (index > 0) {
        //if there is a previous selectable element return it
        return Coral.ActionBar._getFirstSelectableWrappedItem(selectableItems[index - 1]);
      }

      return null;
    },

    /** @ignore */
    _getAllSelectableItems: function() {
      var selectableItems = [];

      if (this.primary._elements.popover.open === true || this.secondary._elements.popover.open === true) {
        // if popover is open only items in popover can be selected
        var popoverItems = (this.primary._elements.popover.open === true) ? this.primary._itemsInPopover :
          this.secondary._itemsInPopover;
        var item = null;
        for (var i = 0; i < popoverItems.length; i++) {
          item = popoverItems[i];
          if (!item.hasAttribute('disabled') &&
            !item.hasAttribute('hidden') &&
            item.style.display !== 'none' &&
            Coral.ActionBar._getFirstSelectableWrappedItem(item)
          ) {
            selectableItems.push(item);
          }
        }
      }
      else {
        // concat selectable items from left side of the bar and right side of the bar
        var leftSelectableItems = this.primary.items._getAllSelectable();
        var rightSelectableItems = this.secondary.items._getAllSelectable();
        selectableItems = leftSelectableItems.concat(rightSelectableItems);
      }

      return selectableItems;
    },

    /** @ignore */
    _newWidthCache: function() {
      return {
        _items: [],
        _outerWidth: [],
        getOuterWidth: function(item) {
          var index = this._items.indexOf(item);
          if (index < 0) {
            // if item was not cached in current frame => cache it
            this._items.push(item);

            var width = item.offsetWidth;
            this._outerWidth.push(width);
            index = this._outerWidth.length - 1;
          }

          return this._outerWidth[index];
        }
      };
    },

    /** @ignore */
    _forceWebkitRedraw: function(el) {
      var isWebkit = 'WebkitAppearance' in document.documentElement.style;

      if (isWebkit && el.style.display !== 'none') {
        el.style.display = 'none';

        // no need to store this anywhere, the reference would be enough (just saved to silence jshint)
        this._cachedOffsetHeight = el.offsetHeight;

        el.style.display = '';
      }
    },

    /** @ignore */
    _hideItem: function(item, hide) {
      if (hide === false) {
        this._moveToScreen(item);
      }
      else if (!item.hasAttribute('coral-actionbar-offscreen')) {
        // actually just move element offscreen to be able to measure the size while calculating the layout
        item.setAttribute('coral-actionbar-offscreen', '');
        // if I do not force a browser redraw webkit has layouting problems
        this._forceWebkitRedraw(item);
      }
    },

    /** @ignore */
    _moveToScreen: function(item, show) {
      if (show === false) {
        this._hideItem(item);
      }
      else if (item.hasAttribute('coral-actionbar-offscreen')) {
        // actually just move element onscreen again (see _hideItem)
        item.removeAttribute('coral-actionbar-offscreen');
        // if I do not force a browser redraw webkit has layouting problems
        this._forceWebkitRedraw(item);
      }
    },

    /** @ignore */
    _makeItemTabEnabled: function(item, tabable) {
      // item might be wrapped (for now remove/add tabindex only on the first wrapped item)
      item = Coral.ActionBar._getFirstSelectableWrappedItem(item);

      if (item !== null) {
        if (tabable && item.hasAttribute('tabindex')) {
          item.removeAttribute('tabindex');
        }
        else if (!tabable && !item.hasAttribute('tabindex')) {
          item.setAttribute('tabindex', '-1');
        }
      }
    }
  });

  /** @ignore */
  Coral.ActionBar._getFirstSelectableWrappedItem = function(wrapperItem) {
    // util method to get first selectable item inside a wrapper item
    if (!wrapperItem) {
      return null;
    }

    if (wrapperItem.hasAttribute('coral-actionbar-more')) {
      // more buttons are no 'real' actionbar items => not wrapped
      return wrapperItem;
    }

    var child = null;
    for (var i = 0; i < wrapperItem.children.length; i++) {
      child = wrapperItem.children[i];

      // maybe filter even more elements? (opacity, display='none', position='absolute' ...)
      if (!child.hasAttribute('disabled') && !child.hasAttribute('hidden')) {
        return child;
      }
    }

    return null;
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for container position.

    @private
    @enum {String}
    @memberof Coral.ActionBar.Container
  */
  var position = {
    /** Primary (left) ActionBar container */
    PRIMARY: 'primary',
    /** Secondary (right) ActionBar container */
    SECONDARY: 'secondary',
    /** Invalid ActionBar container */
    INVALID: 'invalid'
  };

  Coral.register( /** @lends Coral.ActionBar.Container# */ {
    /**
      @class Coral.ActionBar.Container
      @classdesc An ActionBar component
      @extends Coral.Component
      @htmltag coral-actionbar-container
    */
    name: 'ActionBar.Container',
    tagName: 'coral-actionbar-container',
    className: 'coral-ActionBar-container',

    _itemsInPopover: [],

    properties: {

      /**
        The container position inside the actionbar.

        @private
        @type {Coral.ActionBar.Container.position}
        @readonly
        @default Coral.ActionBar.Container.position.INVALID
        @memberof Coral.ActionBar.Container#
      */
      '_position': {
        attribute: null,
        get: function() {

          if (this.parentNode) {
            var containers = this.parentNode.querySelectorAll('coral-actionbar-container');

            if (containers.length > 0 && containers[0] === this) {
              return Coral.ActionBar.Container.position.PRIMARY;
            }
            else if (containers.length > 1 && containers[1] === this) {
              return Coral.ActionBar.Container.position.SECONDARY;
            }
          }

          return Coral.ActionBar.Container.position.INVALID;
        },
        // Read-only
        set: function() {}
      },

      /**
        The Collection Interface that allows interacting with the items that the component contains. See
        {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.ActionBar.Container#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.ActionBar.Container.Collection(this);
          }

          return this._items;
        },
        set: function() {
          // Read-only
        }
      },

      /**
        The amount of items that are maximally visible inside the container. Using a value <= 0 will disable this
        feature and show as many items as possible.

        @type {Number}
        @default -1
        @htmlattribute threshold
        @htmlattributereflected
        @memberof Coral.ActionBar.Container#
      */
      'threshold': {
        default: -1,
        reflectAttribute: true,
        transform: Coral.transform.number
      },

      /**
        If there are more ActionBarItems inside the ActionBar than currently can be shown, then a "more" Button with the
        following text will be rendered (and some ActionBarItems will be hidden inside of a Popover).

        @type {String}
        @default ""
        @htmlattribute morebuttontext
        @memberof Coral.ActionBar.Container#
      */
      'moreButtonText': {
        default: '',
        attribute: 'morebuttontext',
        transform: Coral.transform.string,
        sync: function() {
          if (this._elements.moreButton) {
            // moreButton might not have been created so far
            this._elements.moreButton.label.innerHTML = this.moreButtonText;
          }
        }
      }
    },

    /**
      Open Popover and show elements inside the actionbar, that are hidden due to space problems.
      @ignore
    */
    _openPopover: function() {
      this._itemsInPopover = this.items._getAllOffScreen();

      if (this._itemsInPopover.length < 1) {
        return;
      }

      // show the current popover (hidden needed to disable fade time of popover)
      this._elements.popover.hidden = false;
      this._elements.popover.open = true;

      // render popover content
      var popoverContent = this._elements.popover.content;
      popoverContent.innerHTML = '';
      popoverContent.appendChild(Coral.templates.ActionBar.popovercontent(this._itemsInPopover));

      var self = this;
      // focus first item (nextFrame needed as popover is not visible so far)
      Coral.commons.nextFrame(function() {
        if (self._itemsInPopover.length > 0) {
          // focus first item
          var wrappedItem = Coral.ActionBar._getFirstSelectableWrappedItem(self._itemsInPopover[0]);
          if (wrappedItem) {
            wrappedItem.removeAttribute('tabindex');
            wrappedItem.focus();
          }
        }
      });
    },

    /**
      Close Popover
      @ignore
    */
    _closePopover: function() {
      var focusedItem = document.activeElement.parentNode;

      // hide the popover(needed to disable fade time of popover)
      this._elements.popover.hidden = true;

      //close any popovers, that might be inside the 'more' popover
      var childPopovers = this._elements.popover.querySelectorAll('coral-popover');
      for (var i = 0; i < childPopovers.length; i++) {
        childPopovers[i].open = false;
      }

      // return all elements from popover
      if (this._position === Coral.ActionBar.Container.position.PRIMARY) {
        this._returnLeftElementsFromPopover();
      }
      else if (this._position === Coral.ActionBar.Container.position.SECONDARY) {
        this._returnRightElementsFromPopover();
      }

      // clear cached items from popover
      this._itemsInPopover = [];

      // we need to check if item has 'hasAttribute' because it is not present on the document
      var isFocusedItemInsideActionBar = $.contains(this.parentNode, focusedItem);
      var isFocusedItemOffscreen = focusedItem.hasAttribute && focusedItem.hasAttribute('coral-actionbar-offscreen');
      if (isFocusedItemInsideActionBar && isFocusedItemOffscreen) {
        // if currently an element is focused, that should not be visible (or is no actionbar-item) => select 'more'
        // button
        this._elements.moreButton.focus();
      }
    },

    /** @ignore */
    _render: function() {
      this._elements.moreButton = new Coral.Button();
      this._elements.moreButton.label.textContent = this.moreButtonText;
      this._elements.moreButton.variant = 'quiet';
      this._elements.moreButton.icon = 'more';
      this._elements.moreButton.type = 'button';
      this._elements.moreButton.setAttribute('coral-actionbar-more', '');
      this.appendChild(this._elements.moreButton);

      // more button might be moved later in dom when Container is attached to parent see: coral-component:attached
      // event handler
      this._elements.popover = new Coral.Popover();
      this._elements.popover.alignMy = Coral.Overlay.align.LEFT_TOP;
      this._elements.popover.alignAt = Coral.Overlay.align.LEFT_BOTTOM;
      this._elements.popover.target = this._elements.moreButton;

      var self = this;
      this._elements.popover.on('coral-overlay:open', function(event) {

        // there might be popovers in popover => ignore them
        if (event.target === self._elements.popover) {
          self._openPopover();
        }
      });

      this._elements.popover.on('coral-overlay:close', function(event) {
        // there might be popovers in popover => ignore them
        if (event.target === self._elements.popover) {
          self._closePopover();
        }
      });

      self.appendChild(this._elements.popover);

    },

    /** @ignore */
    _returnLeftElementsFromPopover: function() {
      var item = null;
      var wrappedItem = null;

      for (var i = 0; i < this._itemsInPopover.length; i++) {
        item = this._itemsInPopover[i];

        // remove tabindex again
        wrappedItem = Coral.ActionBar._getFirstSelectableWrappedItem(item);
        if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
          wrappedItem.setAttribute('tabindex', -1);
        }

        // 'insertBefore' with an undefined "before" argument fails on IE9
        this.insertBefore(item, this._elements.moreButton || null);
      }
    },

    /** @ignore */
    _returnRightElementsFromPopover: function() {
      var item = null;
      var wrappedItem = null;

      for (var i = this._itemsInPopover.length - 1; i >= 0; i--) {
        item = this._itemsInPopover[i];

        // remove tabindex again
        wrappedItem = Coral.ActionBar._getFirstSelectableWrappedItem(item);
        if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
          wrappedItem.setAttribute('tabindex', -1);
        }

        // 'insertBefore' with an undefined "before" argument fails on IE9
        this.insertBefore(item, this.firstChild.nextSibling || null);
      }
    },

    // JSDocs inherited
    attachedCallback: function() {
      Coral.Component.prototype.attachedCallback.apply(this, arguments);

      // append more button at right position
      if (this.parentNode && this.parentNode.primary === this) {
        this.appendChild(this._elements.moreButton);
      }
      else if (this.parentNode && this.parentNode.secondary === this) {
        // 'insertBefore' with an undefined "before" argument fails on IE9.
        this.insertBefore(this._elements.moreButton, this.firstChild || null);
      }
      else {
        throw new Error('Coral.ActionBar.Container: unable to add the more button.');
      }
    }
  });

  // exports the enumeration
  Coral.ActionBar.Container.position = position;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    The default Collection as used by Coral.ActionBar.Container .

    @param host {HTMLElement}
    The element that hosts the collection

    @constructor
    @ignore
  */
  var Collection = function(host) {
    this._host = host;
  };

  // Assigns the prototype to get access to the Collection signature methods:
  Collection.prototype = Object.create(Coral.Collection.prototype);

  Collection.prototype.add = function(item, before) {

    // in the left actionBar container always insert elements before the 'more' button in right actionBar always append
    // at the end
    if (!before && this._host._position === Coral.ActionBar.Container.position.PRIMARY) {
      before = this._host.lastChild;
    }

    if (!(item instanceof HTMLElement)) {
      // Creates a new item and initializes its values:
      var config = item;

      item = document.createElement('coral-actionbar-item');

      // applies quietly the settings
      item.set(config, true);
    }

    // 'insertBefore' with an undefined "before" argument fails on IE9.
    this._host.insertBefore(item, before || null);

    return item;
  };

  Collection.prototype.clear = function() {
    var items = this.getAll();

    var removed = [];

    for (var i = items.length - 1; i > -1; i--) {
      removed.push(this.remove(items[i]));
    }

    this._host._itemsInPopover = [];

    return removed;
  };

  Collection.prototype.getAll = function() {
    var childItems = this._host.$.children('coral-actionbar-item').toArray();

    // add items in popovers
    return childItems.concat(this._host._itemsInPopover);
  };

  Collection.prototype._getAllSelectable = function() {
    var selectableItems = [];

    var child = null;
    for (var i = 0; i < this._host.children.length; i++) {
      child = this._host.children[i];
      if (
        !child.hasAttribute('disabled') &&
        !child.hasAttribute('hidden') &&
        !child.hasAttribute('coral-actionbar-offscreen') &&
        child !== this._host._elements.popover &&
        Coral.ActionBar._getFirstSelectableWrappedItem(child)
      ) {
        selectableItems.push(child);
      }
    }

    return selectableItems;
  };

  Collection.prototype._getAllOffScreen = function() {
    return this._host.$.children('coral-actionbar-item[coral-actionbar-offscreen]').toArray();
  };

  // this class is not public
  Coral.ActionBar.Container.Collection = Collection;
})();

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.ActionBar.Item# */ {
    /**
      An ActionBar Item should simply wrap arbitrary other items

      @class Coral.ActionBar.Item
      @classdesc An ActionBar item
      @extends Coral.Component
      @htmltag coral-actionbar-item
    */
    name: 'ActionBar.Item',
    tagName: 'coral-actionbar-item',
    className: 'coral-ActionBar-item',

    properties: {
      /**
        Item content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.ActionBar.Item#
      */
      'content': {
        contentZone: true,
        get: function() {
          return this;
        },
        set: function() {}
      }
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["ActionBar"] = this["Coral"]["templates"]["ActionBar"] || {};
this["Coral"]["templates"]["ActionBar"]["popovercontent"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = document.createElement("ul");
  el0.className += " coral-List coral-List--minimal";
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var iterated_1 = data_0;
  for (var i1 = 0, ni1 = iterated_1.length; i1 < ni1; i1++) {
    var data_1 = data = iterated_1[i1];
    var el3 = document.createTextNode("\n    ");
    el0.appendChild(el3);
    var el4 = document.createElement("li");
    el4.className += " coral-List-item";
    var el5 = document.createTextNode("\n      ");
    el4.appendChild(el5);
    el4.appendChild(data_1);
    el0.appendChild(el4);
    var el7 = document.createTextNode("\n  ");
    el0.appendChild(el7);
  }
  var el8 = document.createTextNode("\n");
  el0.appendChild(el8);
  frag.appendChild(el0);
  var el9 = document.createTextNode("\n");
  frag.appendChild(el9);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // A map of types to icon names
  var iconMap = {
    'success': 'checkCircle',
    'info': 'infoCircle',
    'error': 'alert',
    'warning': 'alert',
    'help': 'helpCircle'
  };

  /**
    Enumeration representing alert variants.

    @memberof Coral.Alert
    @enum {String}
  */
  var variant = {
    /** An alert with a red header and warning icon, indicating that an error has occurred. */
    ERROR: 'error',
    /** An alert with an orange header and warning icon, notifying the user of something important. */
    WARNING: 'warning',
    /** An alert with a green header and checkmark icon, indicates to the user that an operation was successful. */
    SUCCESS: 'success',
    /** An alert with a blue header and question mark icon, provides the user with help. */
    HELP: 'help',
    /** An alert with a blue header and info icon, informs the user of non-critical information. */
    INFO: 'info'
  };

  /**
    Enumeration representing alert sizes.

    @memberof Coral.Alert
    @enum {String}
  */
  var size = {
    /** A small alert, usually employed for single line alerts without headers. */
    SMALL: 'S',
    /** A large alert, usually employed for multi-line alerts with headers. */
    LARGE: 'L'
  };

  var CLASSNAME = 'coral3-Alert';

  // size mapping
  var SIZE_CLASSES = {
    'S': 'small',
    'L': 'large'
  };

  // A string of all possible variant classnames
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }
  // A string of all possible size classnames
  var ALL_SIZE_CLASSES = '';
  for (var sizeValue in size) {
    ALL_SIZE_CLASSES += CLASSNAME + '--' + SIZE_CLASSES[size[sizeValue]] + ' ';
  }

  Coral.register( /** lends Coral.Alert# */ {
    /**
      @class Coral.Alert
      @classdesc An Alert component
      @extends Coral.Component
      @htmltag coral-alert
    */
    name: 'Alert',
    tagName: 'coral-alert',
    className: CLASSNAME,

    events: {
      'click [coral-close]': '_onCloseClick'
    },

    properties: {

      /**
        The alert variant style to use.

        @type {Coral.Alert.variant}
        @default Coral.Alert.variant.INFO
        @htmlattribute variant
        @memberof Coral.Alert#
      */
      'variant': {
        default: variant.INFO,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        set: function(value) {
          this._variant = value;
          this._elements.icon.icon = iconMap[this.variant];
        },
        sync: function() {
          // Remove all variant classes
          this.$.removeClass(ALL_VARIANT_CLASSES);

          // Set new variant class
          // Don't use this._className; use the constant
          // This lets popover get our styles for free
          this.$.addClass(CLASSNAME + '--' + this.variant);
        }
      },

      /**
        The size of the alert. It accepts both lower and upper case sizes.

        @type {Coral.Alert.size}
        @default Coral.Alert.size.SMALL
        @htmlattribute size
        @htmlattributereflected
        @memberof Coral.Alert#
      */
      'size': {
        default: size.SMALL,
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          // Remove all variant classes and adds the new one
          this.$.removeClass(ALL_SIZE_CLASSES).addClass(CLASSNAME + '--' + SIZE_CLASSES[this.size]);
        }
      },

      /**
        The alert header element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Alert#
      */
      'header': Coral.property.contentZone({
        handle: 'header',
        tagName: 'coral-alert-header'
      }),

      /**
        The alert content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Alert#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-alert-content'
      })
    },

    _templateHandleNames: ['icon'],

    /** @private */
    _render: function() {
      // Create a fragment to hold our new children
      var frag = document.createDocumentFragment();

      // Add the icon to the fragment
      frag.appendChild(Coral.templates.Alert.icon.call(this._elements));

      // Fetch or create the header and content footer sub-components
      var header = this._elements.header = this.querySelector('coral-alert-header') ||
        document.createElement('coral-alert-header');
      var content = this._elements.content = this.querySelector('coral-alert-content') ||
        document.createElement('coral-alert-content');

      // Move the header and content sub-components to the fragment
      frag.appendChild(header);
      frag.appendChild(content);

      while (this.firstChild) {
        var child = this.firstChild;
        if (child.nodeType === Node.TEXT_NODE ||
          this._templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
          // Add non-template elements to the content
          content.appendChild(child);
        }
        else {
          // Remove anything else element
          this.removeChild(child);
        }
      }

      // Append the fragment to the component
      this.appendChild(frag);

      // Dirty awful IE 9 hack
      // @polyfill ie9
      if (window.navigator.userAgent.indexOf('MSIE 9.0') !== -1) {
        this.$.addClass(CLASSNAME + '--IE9');
      }
    },

    /**
      @ignore
      @todo maybe this should be mixin or something
    */
    _onCloseClick: function(event) {
      var dismissTarget = event.matchedTarget;
      var dismissValue = dismissTarget.getAttribute('coral-close');
      if (!dismissValue || this.$.is(dismissValue)) {
        this.hide();
        event.stopPropagation();
      }
    }
  });

  Coral.register( /** lends Coral.Alert.Header# */ {
    /**
      @class Coral.Alert.Header
      @classdesc The Alert header content component
      @htmltag coral-alert-header
      @extends Coral.Component
    */
    name: 'Alert.Header',
    tagName: 'coral-alert-header',
    className: CLASSNAME + '-header'
  });

  Coral.register( /** lends Coral.Alert.Content# */ {
    /**
      @class Coral.Alert.Content
      @classdesc The Alert content component
      @htmltag coral-alert-content
      @extends Coral.Component
    */
    name: 'Alert.Content',
    tagName: 'coral-alert-content',
    className: CLASSNAME + '-content'
  });

  // Exports the enums globally
  Coral.Alert.size = size;
  Coral.Alert.variant = variant;
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Alert"] = this["Coral"]["templates"]["Alert"] || {};
this["Coral"]["templates"]["Alert"]["icon"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.className += " coral3-Alert-typeIcon";
  el0.setAttribute("size", "XS");
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Boolean enumeration for List keyboard interaction state.

    @enum {String}
    @memberof Coral.List#
  */
  var interaction = {
    /** Keyboard interaction is enabled. */
    ON: 'on',
    /** Keyboard interaction is disabled. */
    OFF: 'off'
  };

  Coral.register( /** @lends Coral.List */ {
    /**
      @class Coral.List
      @classdesc A list of interactive items
      @extends Coral.Component
      @htmltag coral-list
    */
    name: 'List',
    tagName: 'coral-list',
    className: 'coral-BasicList',
    itemTagName: 'coral-list-item',

    events: {
      'capture:mouseenter [coral-list-item]': '_onItemMouseEnter',
      'key:down [coral-list-item]': '_focusNextItem',
      'key:right [coral-list-item]': '_focusNextItem',
      'key:left [coral-list-item]': '_focusPreviousItem',
      'key:up [coral-list-item]': '_focusPreviousItem',
      'key:pageup [coral-list-item]': '_focusPreviousItem',
      'key:pagedown [coral-list-item]': '_focusNextItem',
      'key:home [coral-list-item]': '_focusFirstItem',
      'key:end [coral-list-item]': '_focusLastItem'
    },

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.List#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              itemTagName: this.itemTagName,
              itemBaseTagName: this.itemBaseTagName,
              itemSelector: '[coral-list-item]',
              host: this
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        Whether interaction with the component is enabled.

        @type {Coral.List.interaction}
        @default Coral.List.interaction.ON
        @htmlattribute interaction
        @memberof Coral.List#
      */
      'interaction': {
        default: interaction.ON,
        attribute: 'interaction',
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(interaction)
        ]
      }
    },

    /** @private */
    _onItemMouseEnter: function(event) {
      // Do not try to focus on disabled items
      if (!event.matchedTarget.hasAttribute('disabled') && this.interaction === Coral.List.interaction.ON) {
        event.matchedTarget.focus();
      }
    },

    /**
      Returns true if the event is at the matched target.

      @todo this should be moved to Coral.Component
      @private
    */
    _eventIsAtTarget: function(event) {
      var target = event.target;
      var listItem = event.matchedTarget;

      var isAtTarget = (target === listItem);

      if (isAtTarget) {
        // Don't let arrow keys etc scroll the page
        event.preventDefault();
        event.stopPropagation();
      }

      return isAtTarget;
    },

    /** @private */
    _focusFirstItem: function() {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var items = this._getSelectableItems();
      items[0].focus();
    },

    /** @private */
    _focusLastItem: function() {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var items = this._getSelectableItems();
      items[items.length - 1].focus();
    },

    /** @private */
    _focusNextItem: function(event) {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      var items = this._getSelectableItems();
      var index = items.indexOf(target);

      if (index === -1) {
        // Invalid state
        return;
      }

      if (index < items.length - 1) {
        items[index + 1].focus();
      }
      else {
        items[0].focus();
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      var items = this._getSelectableItems();
      var index = items.indexOf(target);

      if (index === -1) {
        // Invalid state
        return;
      }

      if (index > 0) {
        items[index - 1].focus();
      }
      else {
        items[items.length - 1].focus();
      }
    },

    /** @private */
    _getSelectableItems: function() {
      return this.items.getAll().filter(function(item) {
        return !item.hasAttribute('hidden') && !item.hasAttribute('disabled');
      });
    },
  });

  Coral.register( /** @lends Coral.List.Item */ {
    /**
      @class Coral.List.Item
      @classdesc A list item
      @extends Coral.Component
      @htmltag coral-list-item
    */
    name: 'List.Item',
    tagName: 'coral-list-item',
    className: 'coral-BasicList-item',

    properties: {
      /**
        The content of the help item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.List.Item#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-list-item-content'
      }),

      /**
        Whether this item is disabled.

        @default false
        @type {Boolean}
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.AnchorList.Item#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          if (this.disabled) {
            this.setAttribute('aria-disabled', 'true');
          }
          else {
            this.removeAttribute('aria-disabled');
          }
        }
      },

      /**
        The icon to display.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Button#

        @see {@link Coral.Icon}
      */
      'icon': {
        default: '',
        validate: [], // Don't do validation so setter runs
        get: function() {
          return this._elements.icon.icon;
        },
        set: function(value) {
          this._elements.icon.icon = value;

          // Hide if no icon
          this._elements.icon.hidden = this._elements.icon.icon === '';
        }
      }
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();
      fragment.appendChild(Coral.templates.List.item.call(this._elements));

      var content = this._elements.content = this.querySelector('coral-list-item-content') ||
        document.createElement('coral-list-item-content');

      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      this._elements.contentContainer.appendChild(content);

      this.appendChild(fragment);
    },

    /** @ignore */
    _initialize: function() {
      // The attribute that makes different types of list items co-exist
      // This is also used for event delegation
      this.setAttribute('coral-list-item', '');
    }
  });

  Coral.register( /** @lends Coral.List.Item.Content */ {
    /**
      @class Coral.List.Item.Content
      @classdesc The content of a list item
      @extends Coral.Component
      @htmltag coral-list-item-content
    */
    name: 'List.Item.Content',
    tagName: 'coral-list-item-content',
    className: 'coral-BasicList-item-content'
  });

  // exposes the enum globally
  Coral.List.interaction = interaction;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.AnchorList */ {
    /**
      @class Coral.AnchorList
      @classdesc A list of interactive anchors
      @extends Coral.List
      @htmltag coral-anchorlist
    */
    name: 'AnchorList',
    tagName: 'coral-anchorlist',
    className: 'coral-BasicList coral-AnchorList',

    extend: Coral.List,
    itemTagName: 'coral-anchorlist-item',
    itemBaseTagName: 'a'
  });

  Coral.register( /** @lends Coral.AnchorList.Item */ {
    /**
      @class Coral.AnchorList.Item
      @classdesc An anchor list item
      @extends HTMLAnchorElement
      @extends Coral.List.Item
      @htmltag coral-anchorlist-item
    */
    name: 'AnchorList.Item',
    tagName: 'coral-anchorlist-item',
    baseTagName: 'a',
    className: 'coral-BasicList-item coral-AnchorList-item',

    extend: Coral.List.Item,

    events: {
      'click': '_onClick'
    },

    properties: {
      // JSDoc inherited
      'disabled': {
        sync: function(disabled) {
          if (this.disabled) {
            // It's not tabbable anymore
            this.tabIndex = -1;
          }
          else {
            // Now it's tabbable
            this.tabIndex = 0;
          }
        }
      }
    },

    /** @private */
    _onClick: function(event) {
      // Support disabled property
      if (this.disabled) {
        event.preventDefault();
      }
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.ButtonList */ {
    /**
      @class Coral.ButtonList
      @classdesc A list of interactive buttons
      @extends Coral.List
      @htmltag coral-buttonlist
    */
    name: 'ButtonList',
    tagName: 'coral-buttonlist',
    className: 'coral-BasicList coral-ButtonList',

    extend: Coral.List,
    itemTagName: 'coral-buttonlist-item',
    itemBaseTagName: 'button'
  });

  Coral.register( /** @lends Coral.ButtonList.Item */ {
    /**
      @class Coral.ButtonList.Item
      @classdesc An button list item
      @extends HTMLButtonElement
      @extends Coral.BaseList.Item
      @htmltag coral-buttonlist-item
    */
    name: 'ButtonList.Item',
    tagName: 'coral-buttonlist-item',
    baseTagName: 'button',
    className: 'coral-BasicList-item coral-ButtonList-item',

    extend: Coral.List.Item,

    properties: {
      // Don't try to define disabled as HTMLButtonElement already does
      'disabled' : null
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["List"] = this["Coral"]["templates"]["List"] || {};
this["Coral"]["templates"]["List"]["item"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.setAttribute("size", "S");
  el0.className += " coral-BasicList-item-icon";
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral-BasicList-item-outerContainer";
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["contentContainer"] = document.createElement("div");
  el4.className += " coral-BasicList-item-contentContainer";
  el4.setAttribute("handle", "contentContainer");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral-Tag';

  /**
    Enum for tag size values.

    @enum {String}
    @memberof Coral.Tag
  */
  var size = {
    /** A default tag (non-interactive), height 20px without closable button. */
    SMALL: 'S',
    /** A default tag (non-interactive), height 28px without closable button. */
    MEDIUM: 'M',
    /** A default tag (interactive), height 32px without closable button. */
    LARGE: 'L'
  };

  /**
    Color of the tag. By default they are semi-transparent unless otherwise stated.

    @enum {String}
    @memberof Coral.Tag
  */
  var color = {
    DEFAULT: '',
    GREY: 'grey',
    BLUE: 'blue',
    LIGHT_BLUE: 'lightblue',
    PERIWINKLE: 'periwinkle',
    PLUM: 'plum',
    FUCHSIA: 'fuchsia',
    MAGENTA: 'magenta',
    RED: 'red',
    ORANGE: 'orange',
    TANGERINE: 'tangerine',
    YELLOW: 'yellow',
    CHARTREUSE: 'chartreuse',
    GREEN: 'green',
    KELLY_GREEN: 'kellygreen',
    SEA_FOAM: 'seafoam',
    CYAN: 'cyan'
  };

  // size mappings
  var SIZE_CLASSES = {
    'S': 'small',
    'M': 'medium',
    'L': 'large'
  };

  // builds a string containing all possible size classnames. this will be used to remove classnames when the size
  // changes
  var ALL_SIZE_CLASSES = '';
  for (var sizeValue in size) {
    ALL_SIZE_CLASSES += CLASSNAME + '--' + SIZE_CLASSES[size[sizeValue]] + ' ';
  }

  // builds a string containing all possible color classnames. this will be used to remove classnames when the color
  // changes
  var ALL_COLOR_CLASSES = '';
  for (var colorValue in color) {
    ALL_COLOR_CLASSES += CLASSNAME + '--' + color[colorValue] + ' ';
  }

  var quietTagClass = CLASSNAME + '--quiet';
  var multilineTagClass = CLASSNAME + '--multiline';

  Coral.register( /** @lends Coral.Tag# */ {

    /**
      @class Coral.Tag
      @classdesc A Tag component
      @extends Coral.Component
      @htmltag coral-tag
    */
    name: 'Tag',
    tagName: 'coral-tag',
    className: CLASSNAME,

    events: {
      'click [coral-close]': '_onRemoveButtonClick',
      'key:backspace': '_onRemoveButtonClick'
    },

    properties: {
      /**
        The tag's label element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Tag#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-tag-label'
      }),

      /**
        Whether this component can be closed.

        @type {Boolean}
        @default false
        @htmlattribute closable
        @htmlattributereflected
        @memberof Coral.Tag#
      */
      'closable': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this._elements.button.hidden = !this.closable;
        }
      },

      /**
        Value of the tag. If not explicitly set, the value of <code>Node.textContent</code> is returned.

        @type {String}
        @default ""
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Tag#
      */
      'value': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          // keep spaces to only 1 max and trim to mimic native select option behavior
          return typeof this._value === 'undefined' ? this.textContent.replace(/\s{2,}/g, ' ').trim() : this._value;
        },
        set: function(value) {
          this._value = value;
          // @polyfill IE9
          if (window.CustomElements.instanceof(this.parentNode, Coral.TagList) && this.$.data('input')) {
            this.$.data('input').value = value;
          }
        }
      },

      /**
        A quiet tag to differentiate it from default tag.

        @type {Boolean}
        @default false
        @htmlattribute quiet
        @htmlattributereflected
        @memberof Coral.Tag#
      */
      'quiet': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$.toggleClass(quietTagClass, this.quiet);
        }
      },

      /**
        A multiline tag for block-level layout with multiline text.

        @type {Boolean}
        @default false
        @htmlattribute multiline
        @htmlattributereflected
        @memberof Coral.Tag#
      */
      'multiline': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$.toggleClass(multilineTagClass, this.multiline);
        }
      },

      /**
        The tag's size.

        @type {Coral.Tag.size}
        @default Coral.Tag.size.LARGE
        @htmlattribute size
        @memberof Coral.Tag#
      */
      'size': {
        default: size.LARGE,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          this.$.removeClass(ALL_SIZE_CLASSES).addClass(this._className + '--' + SIZE_CLASSES[this.size]);
        }
      },

      /**
        The tags's color.

        @type {Coral.Tag.color}
        @default Coral.Tag.color.DEFAULT
        @htmlattribute color
        @memberof Coral.Tag#
      */
      'color': {
        default: color.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(color)
        ],
        sync: function() {
          // removes every existing color
          this.$.removeClass(ALL_COLOR_CLASSES);

          if (this.color !== Coral.Tag.color.DEFAULT) {
            this.$.addClass(this._className + '--' + this.color);
          }
        }
      }
    },

    /** @private */
    _onRemoveButtonClick: function(event) {
      if (this.closable) {
        event.preventDefault();
        event.stopPropagation();
        this.focus();

        var parent = this.parentNode;
        this.remove();
        // @polyfill IE9
        if (window.CustomElements.instanceof(parent, Coral.TagList)) {
          parent.trigger('change');
        }
      }
    },

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var frag = document.createDocumentFragment();

      // Render the template
      frag.appendChild(Coral.templates.TagList.tag.call(this._elements));

      // Fetch or create the label content zone element
      var label = this._elements.label = this.querySelector('coral-tag-label') || document.createElement('coral-tag-label');
      frag.appendChild(label);

      // Move any remaining elements into the label sub-component
      while (this.firstChild) {
        label.appendChild(this.firstChild);
      }

      // Add the frag to the component
      this.appendChild(frag);
    }
  });

  Coral.register( /** @lends Coral.Tag.Label */ {
    /**
      @class Coral.Tag.Label
      @classdesc A Tag Label component
      @extends Coral.Component
      @htmltag coral-tag-label
    */
    name: 'Tag.Label',
    tagName: 'coral-tag-label',
    className: 'coral-Tag-label'
  });

  // exports the enumerations
  Coral.Tag.size = size;
  Coral.Tag.color = color;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Collection
  var itemTagName = 'coral-tag';
  var TagListCollection = function(tagList) {
    this._tagList = tagList;
  };
  var $itemToFocusAfterDelete = [];

  // Assigns the prototype to get access to the Collection signature methods
  TagListCollection.prototype = Object.create(Coral.Collection.prototype);

  TagListCollection.prototype.add = function(item, before) {
    if (!(item instanceof HTMLElement)) {
      // creates a new item and initializes its values
      var itemObject = item;
      item = document.createElement(itemTagName);
      item.set(itemObject, true);
    }

    return this._tagList.insertBefore(item, before || null);
  };

  TagListCollection.prototype.getAll = function() {
    return this._tagList.$.children(itemTagName).toArray();
  };

  Coral.register( /** @lends Coral.TagList# */ {

    /**
      @class Coral.TagList
      @classdesc A TagList component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-taglist
    */
    name: 'TagList',
    tagName: 'coral-taglist',
    className: 'coral-TagList',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'coral-component:attached coral-tag': '_onComponentAttached',

      'key:right coral-tag': '_focusNextItem',
      'key:down coral-tag': '_focusNextItem',
      'key:pagedown coral-tag': '_focusNextItem',
      'key:left coral-tag': '_focusPreviousItem',
      'key:up coral-tag': '_focusPreviousItem',
      'key:pageup coral-tag': '_focusPreviousItem'
    },

    properties: {
      // JSDoc inherited
      'disabled': {
        sync: function() {
          var self = this;
          self.$
            .toggleClass('is-disabled', self.disabled)
            .attr('aria-disabled', self.disabled);

          self.items.getAll().forEach(function(tag) {
            if (tag.$.data('input')) {
              tag.$.data('input').disabled = self.disabled;
            }
            tag._elements.button.disabled = self.disabled;
            tag.setAttribute('tabindex', self.disabled ? -1 : 0);
          });
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function() {
          var self = this;
          self.setAttribute('aria-readonly', self.readOnly);
          self.items.getAll().forEach(function(tag) {
            tag.closable = !self.readOnly;
          });
        }
      },

      // JSDoc inherited
      'value': {
        transform: Coral.transform.string,
        get: function() {
          var all = this.items.getAll();
          if (all.length) {
            return all[0].value;
          }
          return '';
        },
        set: function(value) {
          if (typeof this.value !== 'undefined') {
            this.items.clear();
            this.items.add(new Coral.Tag().set({
              'label': {
                // @todo this allows HTML, should it be textContent?
                innerHTML: value
              },
              'value': value
            }));
          }
        }
      },

      /**
        Changing the values will redefine the component's items.

        @type {Array.<String>}
        @memberof Coral.TagList#
        @fires Coral.mixin.formField#change
      */
      'values': {
        get: function() {
          return this.items.getAll().map(function(tag) {
            if (tag.$.data('input')) {
              return tag.$.data('input').value;
            }
          });
        },
        set: function(values) {
          var self = this;
          self.items.clear();
          values.forEach(function(value) {
            self.items.add(new Coral.Tag().set({
              'label': {
                // @todo this allows HTML, should it be textContent?
                innerHTML: value
              },
              'value': value
            }));
          });
        }
      },

      /**
        The Collection Interface that allows interacting with the Coral.Tag items that the component contains.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.TagList#
      */
      'items': {
        set: function() {},
        get: function() {
          // just init on demand
          if (!this._items) {
            this._items = new TagListCollection(this);
          }
          return this._items;
        }
      },

      // JSDoc inherited
      'name': {
        transform: Coral.transform.string,
        get: function() {
          return this._name;
        },
        set: function(value) {
          this._name = value;
          this.items.getAll().forEach(function(tag) {
            if (tag.$ && tag.$.data('input')) {
              tag.$.data('input').setAttribute('name', value);
            }
          });
        }
      }
    },

    /** @private */
    _onComponentAttached: function(event) {
      var self = this;

      // Verifies that the taglist is the parent of the component
      if (event.target.parentNode !== self) {
        return;
      }

      // Prevents to add duplicates based on the tag value
      var duplicate = this.items.getAll().some(function(tag) {
        return (tag.value === event.target.value && tag !== event.target);
      });

      if (duplicate) {
        event.target.remove();
        return;
      }

      // create corresponding input field
      this.appendChild(Coral.templates.TagList.input.call(this._elements));
      this._elements.input.disabled = self.disabled;
      this._elements.input.setAttribute('name', self.name);
      this._elements.input.setAttribute('value', event.target.value);

      // adds the role to support accesibility
      event.target.setAttribute('role', 'option');
      event.target.setAttribute('aria-selected', false);
      event.target.setAttribute('tabindex', '-1');
      event.target.closable = !this.readOnly;

      // add tabindex to first item if none existing
      if (!this.$.children(itemTagName + '[tabindex="0"]').length) {
        this.$.children(itemTagName + ':first-child').attr('tabindex', '0');
      }

      event.target.on('coral-component:detached', this._onComponentDetached);
      event.target.on('focus.CoralTagList', function() {
        if (!self.disabled) {
          this.setAttribute('aria-selected', true);

          // add tabindex to first item and remove from previous focused item
          self.$.children(itemTagName + '[tabindex="0"]').attr('tabindex', '-1');
          this.setAttribute('tabindex', '0');

          self._setItemToFocusOnDelete(this);
        }
      });
      event.target.on('blur.CoralTagList', function() {
        if (!self.disabled) {
          this.setAttribute('aria-selected', false);
          self._setItemToFocusOnDelete(this);
        }
      });
      event.target.$.data('input', self._elements.input);

      // triggers the Coral.Collection event
      self.trigger('coral-collection:add', {
        item: event.target
      });
    },

    /** @private */
    _onComponentDetached: function(event) {
      event.target.off('coral-component:detached', this._onComponentDetached);
      event.target.off('.CoralTagList');
      $(event.target.$.data('input')).remove();

      // Cleans the tag from TagList specific values
      $.removeData(event.target, 'input');
      event.target.removeAttribute('role');
      event.target.removeAttribute('aria-selected');
      event.target.removeAttribute('tabindex');

      if ($itemToFocusAfterDelete.length) {
        $itemToFocusAfterDelete.focus();
      }

      // triggers the Coral.Collection event
      this.trigger('coral-collection:remove', {
        item: event.target
      });
    },

    /** @private */
    _focusNextItem: function(event) {
      if (!this.disabled) {
        event.preventDefault();
        event.target.$.nextAll(itemTagName).first().focus();
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      if (!this.disabled) {
        event.preventDefault();
        event.target.$.prevAll(itemTagName).first().focus();
      }
    },

    /** @private */
    _setItemToFocusOnDelete: function(tag) {
      $itemToFocusAfterDelete = tag.$.nextAll(itemTagName).first();

      if ($itemToFocusAfterDelete.length === 0) {
        $itemToFocusAfterDelete = tag.$.prevAll(itemTagName).first();
      }
    },

    /** @ignore */
    _initialize: function() {
      // adds the role to support accessibility
      this.setAttribute('role', 'listbox');

      // binds the 'this' to the listener
      this._onComponentDetached = this._onComponentDetached.bind(this);
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["TagList"] = this["Coral"]["templates"]["TagList"] || {};
this["Coral"]["templates"]["TagList"]["input"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("handle", "input");
  el0.setAttribute("type", "hidden");
  el0.setAttribute("name", "");
  el0.setAttribute("value", "");
  return el0;
});

this["Coral"]["templates"]["TagList"]["tag"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["button"] = document.createElement("button","coral-button");
  el0.setAttribute("handle", "button");
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("type", "button");
  el0.setAttribute("variant", "minimal");
  el0.setAttribute("icon", "close");
  el0.setAttribute("iconSize", "XS");
  el0.className += " coral-Tag-removeButton";
  el0.setAttribute("title", "Remove");
  el0.setAttribute("tabindex", "-1");
  el0.setAttribute("coral-close", "");
  return el0;
});
(function() {
  'use strict';

  var IE9 = (function() {
    if ($.browser) {
      return $.browser.msie && $.browser.msie.version === 9;
    }

    return navigator.userAgent.indexOf('MSIE 9.0') >= 0;
  })();

  // @polyfill IE9 A polyfill of input event
  //
  // According to https://developer.mozilla.org/en-US/docs/Web/Events/input
  // Opera does not fire an input event after dropping text in an input field.
  // IE 9 does not fire an input event when the user removes characters from input filled by keyboard, cut, or drag operations.
  $.event.special.coralinternalinput = {
    add: function(handleObj) {
      var el = $(this).on('input.coralinternalinput', handleObj.selector, handleObj.data, handleObj.handler);

      if (IE9) {
        el
          .on('cut.coralinternalinput', handleObj.selector, handleObj.data, handleObj.handler)
          .on('keyup.coralinternalinput', function(e) {
            switch (e.which) {
            case 8: // backspace
            case 46: // delete
              return handleObj.handler();
            }
          });
      }
    },
    remove: function(handleObj) {
      $(this).off('.coralinternalinput');
    }
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    The distance, in pixels, from the bottom of the List at which we assume the user has scrolled
    to the bottom of the list.
    @type {Number}
    @ignore
   */
  var SCROLL_BOTTOM_THRESHOLD = 50;

  /**
    The number of milliseconds for which scroll events should be debounced.
    @type {Number}
    @ignore
  */
  var SCROLL_DEBOUNCE = 100;

  // @temp - Enable debug messages when writing tests
  var DEBUG = 0;

  var AutocompleteCollection = function(options) {
    Coral.Collection.call(this, arguments);
    this._host = options.host;
  };

  AutocompleteCollection.prototype = Object.create(Coral.Collection.prototype);

  AutocompleteCollection.prototype.add = function(item, insertBefore) {
    if (!(item instanceof HTMLElement)) {
      // Create an instance of an item from the object
      item = new Coral.Autocomplete.Item().set(item, true);
    }

    // 'insertBefore' with an undefined "before" argument fails on IE9.
    this._host.insertBefore(item, insertBefore || null);
    return item;
  };

  AutocompleteCollection.prototype.getAll = function() {
    return Array.prototype.slice.call(this._host.querySelectorAll('coral-autocomplete-item'));
  };

  /**
    Enumeration of match values.

    @enum {String}
    @memberof Coral.Autocomplete
  */
  var match = {
    /** Include only matches that start with the user provided value. */
    STARTSWITH: 'startswith',
    /** Include only matches that contain the user provided value. */
    CONTAINS: 'contains'
  };

  var matchValidator = Coral.validate.enumeration(match);

  Coral.register( /** @lends Coral.Autocomplete# */ {
    /**
      @class Coral.Autocomplete
      @extends Coral.Component
      @extends Coral.mixin.formField
      @classdesc An autocomplete component.
      @htmltag coral-autocomplete
    */
    name: 'Autocomplete',
    tagName: 'coral-autocomplete',
    className: 'coral-Autocomplete',

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Autocomplete#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new AutocompleteCollection({
              itemTagName: 'coral-autocomplete-item',
              itemSelector: 'coral-autocomplete-item',
              host: this
            });
          }

          return this._items;
        },
        set: function() {}
      },

      // JSDoc inherited
      'name': {
        set: function(name) {
          this._name = name;

          // Set/remove the name from the appropriate fields
          this._setName();
        },
        get: function() {
          return this._name;
        }
      },

      /**
        The current value, as submitted during form submission.
        When {@link Coral.Autocomplete#multiple} is <code>true</code>, the first selected value will be returned.

        @type {String}
        @default ""
        @htmlattribute value
        @memberof Coral.Autocomplete#
      */
      'value': {
        override: true,
        transform: function(value) {
          // Convert to an string if empty
          if (value === undefined || value === null) {
            value = '';
          }

          return value;
        },
        set: function(value) {
          // Store in values array
          // Let validation run as part of values' setter
          this.values = [value];
        },
        get: function() {
          // Get the first value (or empty string)
          var values = this.values;
          return values.length > 0 ? values[0] : '';
        }
      },

      /**
        The current values, as submitted during form submission.
        When {@link Coral.Autocomplete#multiple} is <code>false</code>, this will be an array of length 1.

        @type {Array.<String>}
        @memberof Coral.Autocomplete#
      */
      'values': {
        // No default, otherwise setter is invoked
        validate: [
          Coral.validate.valueMustChange,
          function(values) {
            return Array.isArray(values);
          }
        ],
        set: function(values) {
          if (values === undefined || values === null) {
            values = [];
          }

          var i;
          var value;
          var selectedValues = [];
          if (this.forceSelection) { // Valid values only
            // Add each valid value
            for (i = 0; i < values.length; i++) {
              value = values[i];
              if (this._optionsMap[value] !== undefined) {
                selectedValues.push(value);
              }
            }
          }
          else { // Any value goes
            for (i = 0; i < values.length; i++) {
              value = values[i];
              selectedValues.push(value);
            }
          }

          if (this.multiple) {
            // Remove existing tags, DOM selection, etc
            // This is a full override
            this._clearValues();

            // Add each tag
            for (i = 0; i < selectedValues.length; i++) {
              value = selectedValues[i];
              this._addValue(value);
            }
          }
          else {
            // Set value
            this._values = selectedValues.length > 0 ? [selectedValues[0]] : [];
            this._reflectCurrentValue();
          }
        },
        get: function() {
          return this._values;
        }
      },

      /**
        Indicates if the autocomplete is a single or multiple mode. In multiple mode, the user can select multiple
        values.

        @type {Boolean}
        @default false
        @htmlattribute multiple
        @htmlattributereflected
        @memberof Coral.Autocomplete#
      */
      'multiple': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(multiple) {
          this._multiple = multiple;

          this._setName();

          if (multiple) {
            this._elements.tagList.hidden = false;
          }
          else {
            this._elements.tagList.hidden = true;
            this._elements.tagList.items.clear();
          }
        },
        get: function() {
          return this._multiple;
        },
        sync: function() {},
        alsoSync: 'labelledBy'
      },

      /**
        Amount of time, in milliseconds, to wait after typing a character before the suggestion is shown.

        @type {Number}
        @default 200
        @htmlattribute delay
        @htmlattributereflected
        @memberof Coral.Autocomplete#
      */
      'delay': {
        default: 200,
        reflectAttribute: true,
        transform: Coral.transform.number,
        validate: function(newVal, oldVal) {
          return typeof newVal === 'number' && newVal >= 0;
        }
      },

      /**
        Set to <code>true</code> to restrict the selected value to one of the given options from the suggestions.
        When set to <code>false</code>, users can enter anything.

        <strong>NOTE:</strong> This API is under review and may be removed or changed in a subsequent release.
        @ignore

        @type {Boolean}
        @default false
        @htmlattribute forceselection
        @htmlattributereflected
        @memberof Coral.Autocomplete#
      */
      'forceSelection': {
        default: false,
        attribute: 'forceselection',
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(forceSelection) {
          if (this.forceSelection && !forceSelection) {
            // @todo invalidate if incorrect

            if (DEBUG) {
              console.warn('Coral.Autocomplete: Should check for invalid state');
            }
          }
          this._forceSelection = forceSelection;
        },
        get: function() {
          return this._forceSelection;
        }
      },

      /**
        A hint to the user of what can be entered.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.Autocomplete#
      */
      'placeholder': {
        default: '',
        reflectAttribute: true,
        set: function(placeholder) {
          // Set attribute as the placeholder property is not available in IE9
          this._elements.input.setAttribute('placeholder', placeholder);
        },
        get: function() {
          return this._elements.input.getAttribute('placeholder');
        }
      },

      /**
        The icon of the autocomplete.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.Autocomplete#
      */
      'icon': {
        default: '',
        validate: [], // Let Icon handle this
        reflectAttribute: true,
        set: function(icon) {
          this._elements.icon.icon = icon;

          // Hide if no icon provided
          this._elements.icon.hidden = !this._elements.icon.icon;
        },
        get: function() {
          return this._elements.icon.icon;
        }
      },

      /**
        The match mode.

        @type {String}
        @default Coral.Autocomplete.match.CONTAINS
        @htmlattribute match
        @memberof Coral.Autocomplete#
      */
      'match': {
        default: match.CONTAINS,
        validate: function(value) {
          // Strings must match the enumeration
          if (typeof value === 'string') {
            return matchValidator(value);
          }

          return typeof value === 'function';
        },
        set: function(value) {
          if (value === match.STARTSWITH) {
            this._matchFunction = this._optionStartsWithValue;
          }
          else if (value === match.CONTAINS) {
            this._matchFunction = this._optionContainsValue;
          }
          else if (typeof value === 'function') {
            this._matchFunction = value;
          }

          // Store raw value for getter
          this._match = value;
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          // Add to outer component
          this.$.toggleClass('is-invalid', this.invalid);
          this._elements.$input.toggleClass('is-invalid', this.invalid);
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this._elements.input.disabled = this.disabled;
          this._elements.trigger.disabled = this.disabled || this.readOnly;
          this._elements.tagList.disabled = this.disabled || this.readOnly;
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function() {
          this._elements.input.readOnly = this.readOnly;
          this._elements.trigger.disabled = this.readOnly || this.disabled;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'labelledBy': {
        sync: function() {
          if (this.labelledBy && this.multiple) {
            this._elements.tagList.setAttribute('aria-labelledby', this.labelledBy);
          }
          else {
            this._elements.tagList.removeAttribute('aria-labelledby');
          }
        }
      },

      /**
        Indicates that the component is currently loading remote data. This will set the wait indicator inside the list.

        @type {Boolean}
        @default false
        @htmlattribute loading
        @memberof Coral.Autocomplete#
      */
      'loading': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._loading = value;

          var loadIndicator = this._elements.loadIndicator;

          if (this.loading) {
            // if it does not exist we create it
            if (!loadIndicator) {
              loadIndicator = this._elements.loadIndicator = Coral.templates.Autocomplete.loadIndicator().firstChild;
            }

            var overlay = this._elements.overlay;

            // we decide first if we need to scroll to the bottom since adding the load will change the dimentions
            var scrollToBottom = overlay.scrollTop >= overlay.scrollHeight - overlay.clientHeight;

            // inserts the item at the end
            this._elements.overlay.appendChild(loadIndicator);

            // we make the load indicator visible
            if (scrollToBottom) {
              overlay.scrollTop = overlay.scrollHeight;
            }
          }
          else {
            if (loadIndicator && loadIndicator.parentNode) {
              this._elements.overlay.removeChild(loadIndicator);
            }
          }
        }
      }
    },

    events: {

      // ARIA Autocomplete role keyboard interaction
      // http://www.w3.org/TR/wai-aria-practices/#autocomplete
      'key:up [handle="$input"]': '_handleInputUpKeypress',
      'key:alt+up [handle="$input"]': '_handleInputUpKeypress',
      'key:down [handle="$input"]': '_handleInputDownKeypress',
      'key:alt+down [handle="$input"]': '_handleInputDownKeypress',
      'key:tab [handle="$input"]': '_handleInputTabKeypress',
      'key:shift+tab [handle="$input"]': '_handleListFocusShift',

      // If the user leaves the input field, consider that an input event
      'capture:blur [handle="$input"]': '_handleInputBlur',

      // Manually listen to keydown event due to CUI-3973
      'keydown': '_handleInputKeypressEnter',

      // Interaction
      'click [handle="$trigger"]': '_handleTriggerClick',
      'key:escape': '_hideSuggestionsAndFocus',
      'key:shift+tab [is="coral-buttonlist-item"]': '_handleListFocusShift',

      // Focus
      'capture:blur': '_handleFocusOut',
      'capture:focus [handle="$inputGroup"]': '_handleInputGroupFocusIn',
      'capture:blur [handle="$inputGroup"]': '_handleInputGroupFocusOut',

      // Taglist
      'coral-collection:remove [handle="tagList"]': '_handleTagRemoved',
      'change [handle="tagList"]': '_preventTagListChangeEvent',

      // SelectList
      'key:enter button[is="coral-buttonlist-item"]': '_handleSelect', // Needed for ButtonList
      'click button[is="coral-buttonlist-item"]': '_handleSelect',
      'capture:scroll [handle="overlay"]': '_onScroll',
      'mousedown button[is="coral-buttonlist-item"]': '_handleSelect',
      'capture:mouseenter [is="coral-buttonlist-item"]': '_handleListItemFocus',

      // Overlay
      'coral-overlay:positioned': '_handleOverlayPositioned',

      // Items
      'coralui-autocomplete-item:valuechanged': '_handleItemValueChange',
      'coralui-autocomplete-item:selectedchanged': '_handleItemSelectedChange',
      'coralui-autocomplete-item:contentchanged': '_handleItemContentChange'
    },

    /** @private */
    _render: function() {
      this.insertBefore(Coral.templates.Autocomplete.base.call(this._elements), this.firstElementChild);

      // Container role per ARIA Autocomplete
      this.setAttribute('role', 'presentation');

      // Input attributes per ARIA Autocomplete
      this._elements.input.setAttribute('role', 'combobox');
      this._elements.input.setAttribute('aria-autocomplete', 'list');
      this._elements.input.setAttribute('aria-haspopup', 'true');
      this._elements.input.setAttribute('aria-controls', this._elements.selectList.id);

      // Trigger button attributes per ARIA Autocomplete
      this._elements.trigger.setAttribute('aria-haspopup', 'true');
      this._elements.trigger.setAttribute('aria-controls', this._elements.selectList.id);
    },

    /** @private */
    _initialize: function() {
      var self = this;

      // A map of values to tags
      this._tagMap = {};

      // A list of selected values
      this._values = [];

      // A list of options objects
      this._options = [];

      // A map of option values to their content
      this._optionsMap = {};

      // Bind the debounced scroll method
      this._handleScrollBottom = this._handleScrollBottom.bind(this);

      // Bind and store the getSuggestions method so we can use it in a timeout
      // Pass false to avoid focus since this happens on key events
      var _showSuggestions = this._showSuggestions.bind(this);

      // Listen to the specialevent for input
      // We can't do this in the event has as it's not areal event
      this._elements.$input.on('coralinternalinput', function(e) {
        // Any input makes this valid again
        self.invalid = false;

        if (self.delay) {
          // Wait until the use has stopped typing for delay milliseconds before getting suggestions
          clearTimeout(self.timeout);
          self.timeout = setTimeout(_showSuggestions, self.delay);
        }
        else {
          // Immediately get suggestions
          _showSuggestions();
        }
      });

      // Listen for mutations
      this._observer = new MutationObserver(this._handleMutation.bind(this));
      this._startObserving();

      // Set the state from the DOM when initialized
      this._setStateFromDOM();
    },

    /** @ignore */
    attachedCallback: function() {
      Coral.Component.prototype.attachedCallback.call(this);

      // Set the state from the DOM when attached
      // Selected and value change events won't bubble when not in the DOM
      // As such, we'll need to make sure we're in sync when we get put in the DOM
      this._setStateFromDOM();
    },

    /** @private */
    _startObserving: function() {
      this._observer.observe(this, {
        // Only watch the childList
        // Items will tell us if selected/value/content changes
        childList: true
      });
    },

    /**
      Stop watching for mutations. This should be done before manually updating observed properties.

      @protected
    */
    _stopObserving: function() {
      this._observer.disconnect();
    },

    /**
      Set the name accordingly for multiple/single mode so the form submits contain only the right fields.

      @protected
    */
    _setName: function() {
      if (this.multiple) {
        this._elements.tagList.name = this.name;
        this._elements.field.name = '';
      }
      else {
        this._elements.field.name = this.name;
        this._elements.tagList.name = '';
      }
    },

    // Override to do nothing
    _onInputChange: function(event) {
      // stops the current event
      event.stopPropagation();

      if (!this.multiple) {

        var inputText = this._elements.input.value.toLowerCase();

        if (this.forceSelection || inputText === '') {
          // We need a way to deselect item in single selection mode
          // 1) by using an empty string if this.forceSelection === false
          // 2) by using an invalid string if this.forceSelection === true
          var items = this.items.getAll();
          for (var i=0; i<items.length; i++) {
            if (items[i].textContent.toLowerCase() !== inputText) {
              items[i].selected = false;
            }
          }
        }

      }
    },

    /**
      Handle mutations to children and childList. This is used to keep the options in sync with DOM changes.

      @private
    */
    _handleMutation: function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        var target = mutation.target;

        if (mutation.type === 'childList' && target === this) {
          this._setStateFromDOM();
          return;
        }
      }
    },

    /**
      Update the option set and selected options from the DOM.

      @private
    */
    _setStateFromDOM: function() {
      this._createOptionsFromDOM();
      this._setSelectedFromDOM();
    },

    /**
      Create the set of options from nodes in the DOM.

      @private
    */
    _createOptionsFromDOM: function() {
      // Reset options array and value to content map
      this._options.length = 0;
      this._optionsMap = {};

      var items = this.querySelectorAll('coral-autocomplete-item');
      for (var i = 0; i < items.length; i++) {
        var itemEl = items[i];

        // Don't use properties as children may not be initialized yet
        var itemObj = {
          value: itemEl.getAttribute('value'),
          icon: itemEl.getAttribute('icon'),
          disabled: itemEl.hasAttribute('disabled'),
          content: itemEl.textContent
        };
        this._options.push(itemObj);
        this._optionsMap[itemObj.value] = itemObj;
      }

      // @todo update value in hidden field if changed value = old value?
    },

    /** @private */
    _setInputValues: function(value, content) {
      this._elements.field.value = value;

      // Set text into input if in "multiple selection mode" or in "single selection mode and content is not empty"
      // otherwise keep the current text for us (should be marked red)
      if (this.multiple || content !== '') {
        this._elements.input.value = content;
      }
    },

    /** @private */
    _reflectCurrentValue: function() {
      // Use empty string if no values
      var value = this._values.length > 0 ? this._values[0] : '';

      // Reflect the value in the field for form submit
      this._elements.field.value = value;

      var content = '';
      if (value !== '') {
        // Find the object with the corresponding content
        var itemObj = this._optionsMap[value];

        if (itemObj) {
          // Reflect the content in the input
          content = itemObj.content;
        }
        else {
          // Just use the provided value
          content = value;
        }
      }

      this._setInputValues(value, content);
    },

    /**
      Update the option set and selected options from the DOM
      @ignore
    */
    _setSelectedFromDOM: function() {
      var selectedItems = this.querySelectorAll('coral-autocomplete-item[selected]');
      if (selectedItems.length) {
        if (this.multiple) {
          // Remove current tags
          this._resetValues();

          // Add new ones
          for (var i = 0; i < selectedItems.length; i++) {
            var value = selectedItems[i].getAttribute('value');
            var content = selectedItems[i].textContent;

            this._addValue(value, content);
          }
        }
        else {
          // Select last
          var last = selectedItems[selectedItems.length - 1];

          // Deselect others
          this._deselectExcept(last, selectedItems);

          // Set value from the attribute
          // We don't want to use the property as the sub-component may not have been upgraded yet
          this.value = last.getAttribute('value');
        }
      }
      else {
        if (this.multiple) {
          this._resetValues();
        }
        else {
          this.value = '';
        }
      }
    },

    /**
      De-select every item except the provided item.

      @param {HTMLElement} exceptItem
        The item not to select
      @param {Array.<HTMLElement>} [items]
        The set of items to consider when deselecting. If not provided, the current set of selected items is used.

      @private
    */
    _deselectExcept: function(exceptItem, items) {
      var selectedItems = items || this.querySelectorAll('coral-autocomplete-item[selected]');

      // Deselect others
      this._stopObserving();
      for (var i = 0; i < selectedItems.length; i++) {
        if (selectedItems[i] !== exceptItem) {
          selectedItems[i].removeAttribute('selected');
        }
      }
      this._startObserving();
    },

    /**
      Add a tag to the taglist.

      @private
    */
    _addValue: function(value, content) {
      if (!content) {
        // Find the content
        var itemObj = this._optionsMap[value];
        if (itemObj) {
          content = itemObj.content;
        }
        else {
          // Just use the value
          content = value;

          if (DEBUG) {
            console.warn('Coral.Autocomplete: Did not have content for value %s', value);
          }
        }
      }

      // Add to selected values
      var index = this._values.indexOf(value);
      if (index === -1) {
        this._values.push(value);
      }
      else {
        if (DEBUG) {
          console.warn('Coral.Autocomplete: Tried to add value that was already present');
        }
      }

      // Create a new tag
      var tag = new Coral.Tag().set({
        label: {
          innerHTML: content
        },
        value: value
      });

      // Add to map
      this._tagMap[value] = tag;

      // Add to taglist
      this._elements.tagList.items.add(tag);

      // make sure to remove text from input box (to easily choose next item)
      this._setInputValues('','');
    },

    /**
      Remove a tag from the taglist.

      @private
    */
    _removeValue: function(value) {
      // Remove from selected values
      var index = this._values.indexOf(value);
      if (index === -1) {
        if (DEBUG) {
          console.warn('Coral.Autocomplete: Tried to remove tag that is not in values');
        }
        // Get out if we don't have the value
        return;
      }
      else {
        this._values.splice(index, 1);
      }

      // Select autocomplete item
      var item = this.querySelector('coral-autocomplete-item[value=' + JSON.stringify(value) + ']');

      if (item) {
        if (item.hasAttribute('selected')) {
          this._stopObserving();
          item.removeAttribute('selected');
          this._startObserving();
        }
      }
      else {
        if (DEBUG) {
          console.warn('Coral.Autocomplete: Tried to remove value without corresponding item');
        }
      }

      // Look up the tag by value
      var tag = this._tagMap[value];

      if (tag) {
        // Remove from map
        this._tagMap[value] = null;

        // Remove from taglist
        this._elements.tagList.items.remove(tag);
      }

      if (index !== -1) {
        // Emit the change event when a value is removed
        this.trigger('change');
      }
    },

    /**
      Remove all tags from the taglist.

      @private
    */
    _clearValues: function() {
      this._resetValues();

      // Deselect items
      this._stopObserving();
      var items = this.querySelectorAll('coral-autocomplete-item[selected]');
      for (var i = 0; i < items.length; i++) {
        items[i].removeAttribute('selected');
      }
      this._startObserving();
    },

    /**
      Reset values without affecting the DOM.

      @private
    */
    _resetValues: function() {
      // Reset values
      this._values = [];

      // Drop references to tags
      this._tagMap = {};

      // Clear taglist
      this._elements.tagList.items.clear();
    },

    /** @private */
    _focusNextItem: function() {
      // Display focus on next item in the selectList
      var selectList = this._elements.selectList;
      var currentItem = selectList.querySelector('.is-focused');
      var input = this._elements.input;
      var items = selectList._getSelectableItems();
      var index;
      var item;
      if (currentItem) {
        index = items.indexOf(currentItem);
        if (index < items.length - 1) {
          item = items[index + 1];
        }
      }
      else if (items && items.length > 0) {
        item = items[0];
      }
      Coral.commons.nextFrame(function() {
        if (item) {
          if (currentItem) {
            currentItem.$.removeClass('is-focused');
          }
          item.$.addClass('is-focused');
          input.setAttribute('aria-activedescendant', item.id);
        }
        if (!selectList.querySelector('.is-focused')) {
          input.removeAttribute('aria-activedescendant');
        }
      });
    },

    /** @private */
    _focusPreviousItem: function() {
      // Display focus on previous item in the selectList
      var selectList = this._elements.selectList;
      var currentItem = selectList.querySelector('.is-focused');
      var input = this._elements.input;
      var items = selectList._getSelectableItems();
      var index;
      var item;
      if (currentItem) {
        index = items.indexOf(currentItem);
        if (index > 0) {
          item = items[index - 1];
        }
        currentItem.$.removeClass('is-focused');
      }
      else if (items && items.length > 0) {
        item = items[items.length - 1];
      }
      Coral.commons.nextFrame(function() {
        if (item) {
          item.$.addClass('is-focused');
          input.setAttribute('aria-activedescendant', item.id);
        }
        if (!selectList.querySelector('.is-focused')) {
          input.removeAttribute('aria-activedescendant');
        }
      });
    },

    /** @private */
    _showSuggestions: function() {
      // Get value from the input
      var inputValue = this._elements.input.value;

      // Since we're showing fresh suggestions, clear the existing suggestions
      this.clearSuggestions();

      // Trigger an event
      var event = this.trigger('coral-autocomplete:showsuggestions', {
        // Pass user input
        value: inputValue,
        start: 0 // Started at zero here, always
      });

      if (event.defaultPrevented) {
        // Set loading mode
        this.loading = true;

        // Show the menu
        this.showSuggestions();
      }
      else {
        // Show suggestions that match in the DOM
        this.addSuggestions(this._getMatches(inputValue));
        this.showSuggestions();
      }
    },

    /** @private */
    _onScroll: function() {
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = setTimeout(this._handleScrollBottom, SCROLL_DEBOUNCE);
    },

    /** @private */
    _handleScrollBottom: function() {
      var overlay = this._elements.overlay;
      var selectList = this._elements.selectList;

      if (overlay.scrollTop >= overlay.scrollHeight - overlay.clientHeight - SCROLL_BOTTOM_THRESHOLD) {
        var inputValue = this._elements.input.value;

        // Do not clear the suggestions here, instead we'll expect them to append

        // Trigger an event
        var event = this.trigger('coral-autocomplete:showsuggestions', {
          // Pass user input
          value: inputValue,
          start: selectList.items.length
        });

        if (event.defaultPrevented) {
          // Set loading mode
          this.loading = true;
        }
      }
    },

    /** @private */
    _handleFocusOut: function(event) {
      var selectList = this._elements.selectList;

      var autocomplete = this;
      var target = event.target;

      // This is to hack around the fact that you cannot determine which element gets focus in a blur event
      // Firefox doesn't support focusout/focusin, so we're left doing awful things
      setTimeout(function() {
        var relatedTarget = document.activeElement;
        if (
          // Nothing was focused
          !relatedTarget ||
          // Focus is now outside of the autocomplete component
          !autocomplete.contains(relatedTarget) ||
          // Focus has shifted from the selectList to another element inside of the autocomplete component
          selectList.contains(target) && !selectList.contains(relatedTarget)
        ) {
          autocomplete.hideSuggestions();
        }
      }, 0);
    },

    /** @private */
    _handleInputGroupFocusIn: function() {
      this.$.addClass('is-focused');
    },

    /** @private */
    _handleInputGroupFocusOut: function(event) {
      this.$.removeClass('is-focused');
    },

    /** @private */
    _handleOverlayPositioned: function(event) {
      // We'll remove these classes when closed
      if (event.detail.vertical === 'top') {
        this.$.removeClass('is-openAbove').addClass('is-openBelow');
      }
      else {
        this.$.removeClass('is-openBelow').addClass('is-openAbove');
      }
    },

    /** @private */
    _handleListFocusShift: function(event) {
      if (this._elements.overlay.open) {
        // Stop focus shift
        event.preventDefault();
        event.stopImmediatePropagation();

        this._hideSuggestionsAndFocus();
      }
    },

    /** @private */
    _hideSuggestionsAndFocus: function(event) {
      // Hide the menu and focus on the input
      this.hideSuggestions();
      this._elements.input.focus();
    },

    /** @private */
    _handleTriggerClick: function() {
      if (this._elements.overlay.open) {
        this._hideSuggestionsAndFocus();
      }
      else {
        // Focus on the input so down arrow works as expected
        // Per @mijordan
        this._showSuggestions();
        this._elements.input.focus();
      }
    },

    /** @private */
    _handleListItemFocus: function(event) {
      var item = event.matchedTarget;
      var selectList = this._elements.selectList;
      var currentItem = selectList.querySelector('.is-focused');
      var input = this._elements.input;
      if (currentItem) {
        currentItem.$.removeClass('is-focused');
        input.removeAttribute('aria-activedescendant');
      }
      if (!item.disabled) {
        item.$.addClass('is-focused');
        input.setAttribute('aria-activedescendant', item.id);
      }
    },

    /** @private */
    _getMatches: function(value, optionMatchesValue) {
      optionMatchesValue = optionMatchesValue || this._matchFunction;

      var matches = [];

      for (var i = 0; i < this._options.length; i++) {
        if (optionMatchesValue(this._options[i], value)) {
          matches.push(this._options[i]);
        }
      }

      return matches;
    },

    /** @private */
    _handleInputKeypressEnter: function(event) {
      if (event.which === 13) { // Sigh, CUI-3973 Hitting enter quickly after typing causes form to submit
        this._handleInput(event);
      }
    },

    /** @private */
    _handleInputBlur: function(event) {
      var self = this;

      // This is to hack around the fact that you cannot determine which element gets focus in a blur event
      // Firefox doesn't support focusout/focusin, so we're left doing awful things
      setTimeout(function() {
        var relatedTarget = document.activeElement;

        // If focus has moved out of the autocomplete, it's an input event
        if (!self.contains(relatedTarget) && !self.multiple) {
          self._handleInput(event);
        }
        else {
          // Hide the suggestions
          self.hideSuggestions();
        }
      }, 0);
    },

    /** @private */
    _handleInput: function(event) {
      var inputValue;
      // Stop the event
      event.preventDefault();

      // If a selectList item has focus, set the input value to the value of the selected item.
      if (this._elements.overlay.open && this._elements.input.getAttribute('aria-activedescendant')) {
        var currentItem = this._elements.selectList.querySelector('.is-focused');
        if (currentItem) {
          inputValue = currentItem.textContent.trim();
        }
      }

      var value = inputValue || this._elements.input.value;

      var isChange = false;

      if (!value.trim()) {
        // Don't add empty values
        return;
      }

      // Get all exact matches
      var exactMatches = this._getMatches(value, this._optionEqualsValue); // Find exact matches

      if (exactMatches.length) {
        // Get the first exact match
        var exactMatch = exactMatches[0];

        isChange = this.value !== exactMatch.value;

        // Select the matched item
        this._selectItem(exactMatch.value, exactMatch.content);

        if (this.multiple) {
          // Add tag
          this._addValue(exactMatch.value, exactMatch.content);
        }
        else {
          // Set value
          this.value = exactMatch.value;
        }

        // Hide the suggestions so the result can be seen
        this.hideSuggestions();

        // Emit the change event when a selection is made from an exact match
        if (isChange === true) {
          this.trigger('change');
        }
      }
      else {
        if (this.forceSelection) {
          // Invalid
          this.invalid = true;
        // Leave suggestions open if nothing matches
        }
        else {
          // DO NOT select the corresponding item, as this would add an item
          // This would result in adding items that match what the user typed, resulting in selections
          // this._selectItem(value);

          isChange = this.value !== value;

          if (this.multiple) {
            // Add tag
            this._addValue(value);
          }
          else {
            // Set value
            this.value = value;
          }

          // Hide the suggestions so the result can be seen
          this.hideSuggestions();

          // Emit the change event when arbitrary data is entered
          if (isChange === true) {
            this.trigger('change');
          }
        }
      }
    },

    /**
      This ensures the collection API is up to date with selected items, even if they come from suggestions.

      @private
    */
    _selectItem: function(value, content) {
      // Don't get caught up with internal changes
      this._stopObserving();

      // Select autocomplete item if it's there
      var item = this.querySelector('coral-autocomplete-item[value=' + JSON.stringify(value) + ']');
      if (item) {
        // Select the existing item
        item.setAttribute('selected', '');
      }
      else {
        // Add a new, selected item
        this.items.add(new Coral.Autocomplete.Item().set({
          value: value,
          content: {
            innerHTML: typeof content === 'undefined' ? value : content
          },
          selected: true
        }));
      }

      // Resume watching for changes
      this._startObserving();
    },

    /** @private */
    _handleInputUpKeypress: function(event) {
      // Stop any consequences of pressing the key
      event.preventDefault();

      if (this._elements.overlay.open) {
        if (event.altKey) {
          this.hideSuggestions();
        }
        else {
          this._focusPreviousItem();
        }
      }
      else {
        // Show the menu and do not focus on the first item
        // Implements behavior of http://www.w3.org/TR/wai-aria-practices/#autocomplete
        this._showSuggestions();
      }
    },

    /** @private */
    _handleInputDownKeypress: function(event) {
      // Stop any consequences of pressing the key
      event.preventDefault();

      if (this._elements.overlay.open) {
        this._focusNextItem();
      }
      else {
        // Show the menu and do not focus on the first item
        // Implements behavior of http://www.w3.org/TR/wai-aria-practices/#autocomplete
        this._showSuggestions();
      }
    },

    /** @private */
    _handleInputTabKeypress: function(event) {
      // if the select list is open and a list item has focus, prevent default to trap focus.
      if (this._elements.overlay.open && this._elements.input.getAttribute('aria-activedescendant')) {
        event.preventDefault();
      }
    },

    /**
      Handle selections in the selectList.

      @ignore
    */
    _handleSelect: function(event) {
      var selectListItem = event.matchedTarget;

      if (!selectListItem || selectListItem.disabled) {
        // @todo it doesn't seem like this should ever happen, but it does
        return;
      }

      // Select the corresponding item, or add one if it doesn't exist
      this._selectItem(selectListItem.value, selectListItem.content.innerHTML);

      if (!this.multiple) {
        this.value = selectListItem.value;

        // Make sure the value is changed
        // The setter won't run if we set the same value again
        // This forces the DOM to update
        this._setInputValues(this.value, selectListItem.content.textContent);
      }
      else {
        // Add to values
        this._addValue(selectListItem.value, selectListItem.content.innerHTML);
      }

      // Focus on the input element
      // We have to wait a frame here because the item steals focus when selected
      var self = this;
      Coral.commons.nextFrame(function() {
        self._elements.input.focus();
      });

      // Hide the options when option is selected in all cases
      this.hideSuggestions();

      // Emit the change event when a selection is made
      this.trigger('change');
    },

    /**
      Don't let the internal change event bubble and confuse users

      @ignore
    */
    _preventTagListChangeEvent: function(event) {
      event.stopImmediatePropagation();
    },

    /**
      Handle tags that are removed by the user.

      @ignore
    */
    _handleTagRemoved: function(event) {
      // Get the tag from the event
      var tag = event.detail.item;

      // Remove from values
      this._removeValue(tag.value);

      // If all tags were removed, return focus to the input
      if ((this.values.length === 1 && this.values[0] === '') || this.values.length === 0) {
        this._elements.input.focus();
      }
    },

    /**
      Handles value changes on a child item.

      @private
    */
    _handleItemValueChange: function(event) {
      // stop event propogation
      event.stopImmediatePropagation();

      // Update option map from scratch
      // @todo use attributeOldValue mutationobserver option and update map instead of re-creating
      this._createOptionsFromDOM();
    },

    /**
      Handles content changes on a child item.

      @private
    */
    _handleItemContentChange: function(event) {
      // stop event propogation
      event.stopImmediatePropagation();

      // Update option map from scratch with new content
      this._createOptionsFromDOM();
    },

    /**
      Handles selected changes on a child item.

      @private
    */
    _handleItemSelectedChange: function(event) {
      // stop event propogation
      event.stopImmediatePropagation();

      var target = event.target;
      var selected = target.hasAttribute('selected');
      if (this.multiple) {
        this[selected ? '_addValue' : '_removeValue'](target.value, target.content.textContent);
      }
      else {
        if (selected) {
          // Set the value accordingly
          this._elements.input.value = target.content.textContent;
          this.value = target.value;
          this.invalid = false; // value can't be invalid as an item is selected

          // Deselect the other elements if selected programatically changed
          this._deselectExcept(target);
        }
        else {
          // Remove values if deselected
          // Only do this if we're the current value
          // If the selected item was changed, this.value will be different
          if (this.value === target.value) {
            this.value = '';
          }
        }
      }
    },

    /**
      Clears the current selected value or items.
    */
    clear: function() {
      this.value = '';

      if (this.multiple) {
        this._clearValues();
      }
    },

    /**
      Clear the list of suggestions.
    */
    clearSuggestions: function() {
      this._elements.selectList.items.clear();
    },

    /**
      Add the provided list of suggestions and clear loading status.

      @param {Array.<Coral.Autocomplete~suggestion>} suggestions
        The list of suggestions to show.
      @param {Boolean} clear
        If true, existing suggestions will be cleared.
    */
    addSuggestions: function(suggestions, clear) {
      // Disable loading mode
      this.loading = false;

      if (clear) {
        // Remove existing selectList items
        this.clearSuggestions();
      }

      // Add items to the selectlist
      for (var i = 0; i < suggestions.length; i++) {
        var value = suggestions[i].value;
        var content = suggestions[i].content;
        var icon = suggestions[i].icon;
        var disabled = !!suggestions[i].disabled;

        // Only add the item if it's not a selected value or we're in single mode
        if (!this.multiple || this.values.indexOf(value) === -1) {
          this._elements.selectList.items.add({
            value: value,
            type: 'button',
            icon: icon,
            disabled: disabled,
            id: Coral.commons.getUID(),
            tabIndex: -1,
            content: {
              innerHTML: content
            }
          });
          this._elements.selectList.items.last().setAttribute('role', 'option');
        }
      }

      if (!suggestions.length && !this._elements.selectList.items.length) {
        // Show "no results" when no suggestions are found at all
        this._elements.selectList.items.add({
          type: 'button',
          content: {
            innerHTML: '<em>No matching results.</em>'
          },
          disabled: true
        });
        this._elements.selectList.items.last().setAttribute('role', 'status');
        this._elements.selectList.items.last().setAttribute('aria-live', 'polite');
        this._elements.input.removeAttribute('aria-activedescendant');
      }

      // Reset height
      this._elements.selectList.style.height = '';

      // Measure actual height
      var style = window.getComputedStyle(this._elements.selectList);
      var height = parseInt(style.height, 10);
      var maxHeight = parseInt(style.maxHeight, 10);

      if (height < maxHeight) {
        // Make it scrollable
        this._elements.selectList.style.height = height - 1 + 'px';
      }
    },

    /**
      Shows the suggestion UI.
    */
    showSuggestions: function() {
      // @todo make sure this doesn't cause recalculate
      this._elements.overlay.style.minWidth = this.offsetWidth + 'px';

      if (this._elements.overlay.open) {
        // Reposition as the length of the list may have changed
        this._elements.overlay.reposition();
      }
      else {
        // Just show
        this._elements.overlay.open = true;
      }

      this.setAttribute('aria-expanded', 'true');
      this.$.addClass('is-open');
    },

    /**
      Hides the suggestion UI.
    */
    hideSuggestions: function() {
      this._elements.overlay.open = false;

      this.setAttribute('aria-expanded', 'false');
      this.$.removeClass('is-open is-openBelow is-openAbove');
      this._elements.input.removeAttribute('aria-activedescendant');

      // Don't let the suggestions show
      clearTimeout(this.timeout);

      // Trigger an event
      this.trigger('coral-autocomplete:hidesuggestions');
    },

    /**
      Check if the given option partially matches the given value.

      @param {HTMLElement} option
        The option to test
      @param {String} value
        The value to test

      @returns {Boolean} true if the value matches, false if not.

      @protected
    */
    _optionContainsValue: function(option, value) {
      value = (typeof value === 'string' ? value : '').toLowerCase();
      return option.content.toLowerCase().indexOf(value) !== -1;
    },

    /**
      Check if the given option starts with the given value.

      @param {HTMLElement} option
        The option to test
      @param {String} value
        The value to test

      @returns {Boolean} true if the value matches, false if not.

      @protected
    */
    _optionStartsWithValue: function(option, value) {
      value = (typeof value === 'string' ? value : '').toLowerCase();
      return option.content.toLowerCase().indexOf(value) === 0;
    },

    /**
      Check if the given option exactly matches the given value.

      @param {HTMLElement} option
        The option to test
      @param {String} value
        The value to test

      @returns {Boolean} true if the value matches, false if not.

      @protected
    */
    _optionEqualsValue: function(option, value) {
      value = (typeof value === 'string' ? value : '').toLowerCase();
      return option.content.toLowerCase() === value;
    }

    /**
      Triggered before suggestions are determined and displayed.

      @event Coral.Autocomplete#coral-autocomplete:showsuggestions

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.value
        The user-provided input value.
      @param {HTMLElement} event.detail.start
        The count of existing suggestions, the index from which new suggestions should start at.
      @param {Function} event.preventDefault
        When called, prevent search for suggestions in existing items and show a loading indicator.
        Suggestions can be manually added by calling {@link Coral.Autocomplete#showSuggestions}.
    */
  });

  Coral.register( /** @lends Coral.Autocomplete.Item# */ {
    /**
      @class Coral.Autocomplete.Item
      @extends Coral.Component
      @classdesc An autocomplete item.
      @htmltag coral-autocomplete-item
    */
    name: 'Autocomplete.Item',
    tagName: 'coral-autocomplete-item',

    properties: {
      /**
        Value of the item. <code>textContent</code> is used if not provided.

        @type {String}
        @default ""
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Autocomplete.Item#
      */
      'value': {
        reflectAttribute: true,
        trigger: 'coralui-autocomplete-item:valuechanged'
      },
      /**
        The content zone element of the item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Autocomplete.Item#
      */
      'content': {
        contentZone: true,
        set: function() {},
        get: function() {
          return this;
        }
      },

      /**
        Whether this item is selected.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.Autocomplete.Item#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        trigger: 'coralui-autocomplete-item:selectedchanged'
      }
    },

    /** @ignore */
    _initialize: function() {
      this._observer = new MutationObserver(this._handleMutation.bind(this));
      this._observer.observe(this, {
        characterData: true,
        childList: true,
        subtree: true
      });
    },

    /** @private */
    _handleMutation: function(mutations) {
      this.trigger('coralui-autocomplete-item:contentchanged', {
        content: this.innerHTML
      });
    }
  });

  // Expose enums
  Coral.Autocomplete.match = match;

  /**
    A suggestion object.

    @typedef {Object} Coral.Autocomplete~suggestion

    @property {String} value
      The form submission value to use when this suggestion is selected.
    @property {String} [content=value]
      The content to disable in the suggestion dropdown.
  */
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Autocomplete"] = window["Coral"]["templates"]["Autocomplete"] || {};
window["Coral"]["templates"]["Autocomplete"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["field"] = document.createElement("input");
  el0.setAttribute("type", "hidden");
  el0.setAttribute("handle", "field");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n\n");
  frag.appendChild(el1);
  var el2 = this["inputGroup"] = document.createElement("div");
this["$"+"inputGroup"] = $(el2);
  el2.className += " coral-InputGroup coral-InputGroup--block coral-Autocomplete-inputGroup";
  el2.setAttribute("handle", "$inputGroup");
  el2.setAttribute("role", "presentation");
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["label"] = document.createElement("div");
  el4.className += " coral-InputGroup-input coral-DecoratedTextfield";
  el4.setAttribute("handle", "label");
  el4.setAttribute("role", "presentation");
  var el5 = document.createTextNode("\n    ");
  el4.appendChild(el5);
  var el6 = this["icon"] = document.createElement("coral-icon");
this["$"+"icon"] = $(el6);
  el6.setAttribute("size", "XS");
  el6.className += " coral-DecoratedTextfield-icon coral-Autocomplete-icon";
  el6.setAttribute("handle", "$icon");
  el4.appendChild(el6);
  var el7 = document.createTextNode("\n    ");
  el4.appendChild(el7);
  var el8 = this["input"] = document.createElement("input");
this["$"+"input"] = $(el8);
  el8.className += " coral-DecoratedTextfield-input coral-Autocomplete-input coral-Textfield";
  el8.setAttribute("type", "text");
  el8.setAttribute("autocomplete", "off");
  el8.setAttribute("handle", "$input");
  el8.setAttribute("role", "textbox");
  el4.appendChild(el8);
  var el9 = document.createTextNode("\n  ");
  el4.appendChild(el9);
  el2.appendChild(el4);
  var el10 = document.createTextNode("\n  ");
  el2.appendChild(el10);
  var el11 = document.createElement("span");
  el11.className += " coral-InputGroup-button";
  el11.setAttribute("role", "presentation");
  var el12 = document.createTextNode("\n    ");
  el11.appendChild(el12);
  var el13 = this["trigger"] = document.createElement("button","coral-button");
this["$"+"trigger"] = $(el13);
  el13.setAttribute("tabindex", "-1");
  el13.setAttribute("is", "coral-button");
  el13.setAttribute("type", "button");
  el13.setAttribute("icon", "chevronDown");
  el13.setAttribute("iconsize", "XS");
  el13.setAttribute("handle", "$trigger");
  el13.className += " coral-Autocomplete-trigger";
  el11.appendChild(el13);
  var el14 = document.createTextNode("\n  ");
  el11.appendChild(el14);
  el2.appendChild(el11);
  var el15 = document.createTextNode("\n");
  el2.appendChild(el15);
  frag.appendChild(el2);
  var el16 = document.createTextNode("\n\n");
  frag.appendChild(el16);
  var el17 = this["overlay"] = document.createElement("coral-overlay");
  el17.className += " coral-Autocomplete-overlay";
  el17.setAttribute("returnfocus", "off");
  el17.setAttribute("alignmy", "left top");
  el17.setAttribute("alignat", "left bottom");
  el17.setAttribute("target", "_prev");
  el17.setAttribute("handle", "overlay");
  el17.setAttribute("role", "presentation");
  var el18 = document.createTextNode("\n  ");
  el17.appendChild(el18);
  var el19 = this["selectList"] = document.createElement("coral-buttonlist");
  el19.id = Coral["commons"]["getUID"]();
  el19.className += " coral-Autocomplete-selectList";
  el19.setAttribute("handle", "selectList");
  el19.setAttribute("role", "listbox");
  el19.setAttribute("interaction", "off");
  el17.appendChild(el19);
  var el20 = document.createTextNode("\n");
  el17.appendChild(el20);
  frag.appendChild(el17);
  var el21 = document.createTextNode("\n\n");
  frag.appendChild(el21);
  var el22 = this["tagList"] = document.createElement("coral-taglist");
  el22.className += " coral-Autocomplete-tagList";
  el22.setAttribute("handle", "tagList");
  frag.appendChild(el22);
  var el23 = document.createTextNode("\n");
  frag.appendChild(el23);
  return frag;
});

window["Coral"]["templates"]["Autocomplete"]["loadIndicator"] = (function anonymous(data_0
/**/) {
    var frag = document.createDocumentFragment();
    var data = data_0;
    var el0 = document.createElement("div");
    el0.className += " coral-Autocomplete-loading";
    el0.setAttribute("role", "progressbar");
    var el1 = document.createTextNode("\n  ");
    el0.appendChild(el1);
    var el2 = document.createElement("coral-wait");
    el2.setAttribute("centered", "");
    el0.appendChild(el2);
    var el3 = document.createTextNode("\n");
    el0.appendChild(el3);
    frag.appendChild(el0);
    var el4 = document.createTextNode("\n");
    frag.appendChild(el4);
    return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /** @ignore */
  function isDateInRange(date, startDate, endDate) {
    if (startDate === null && endDate === null) {
      return true;
    }
    else if (startDate === null) {
      return date <= endDate;
    }
    else if (endDate === null) {
      return date >= startDate;
    }
    else {
      return startDate <= date && date <= endDate;
    }
  }

  /** @ignore */
  function toMoment(value, format) {
    if (value === 'today') {
      return moment().startOf('day');
    }
    else if (moment.isMoment(value)) {
      return value.isValid() ? value.clone() : null;
    }
    else {
      // if the value provided is a date it does not make sense to provide a format to parse the date
      var result = moment(value, value instanceof Date ? null : format);
      return result.isValid() ? result : null;
    }
  }

  /** @ignore */
  function noop() {
  }

  /** @ignore */
  function validateAsChangedAndValidMoment(newValue, oldValue) {
    // if the value is undefined we change it to null since moment considers both to be different
    newValue = newValue || null;
    oldValue = oldValue || null;

    if (newValue !== oldValue && !moment(newValue).isSame(oldValue, 'day')) {
      return newValue === null || newValue.isValid();
    }

    return false;
  }

  /**
    Slides in new month tables, slides out old tables, and then cleans up the leftovers when it is done.

    @ignore
  */
  function TableAnimator(host) {
    this.host = host;

    this._addContainerIfNotPresent = function(width, height) {
      if (!this.container) {
        // Get a fresh container for the animation:
        Coral.templates.Calendar.container.call(
          this,
          {
            width: width,
            height: height
          }
        );
        this.host.appendChild(this.container);
      }
    };

    this._removeContainerIfEmpty = function() {
      if (this.container && this.container.children.length === 0) {
        this.host.removeChild(this.container);
        this.container = null;
      }
    };

    this.slide = function(newTable, direction) {
      var replace = direction === undefined;
      var isLeft = direction === 'left';

      var $oldTable = this.$oldTable;
      if ($oldTable) {
        $oldTable.off('transitionend');
      }

      // Should the replace flag be raised, or no old table be present, then do a non-transitioned (re)place and exit
      if (replace || !$oldTable) {
        if ($oldTable) {
          $oldTable.remove();
        }
        this.host.insertBefore(newTable, this.host.firstChild);
        this.$oldTable = $(newTable);
        return;
      }

      var width = $oldTable.width();
      var height = $oldTable.height();
      this._addContainerIfNotPresent(width, height);

      // Add both the old and the new table to the container:
      this.container.appendChild($oldTable.get(0));
      this.container.appendChild(newTable);
      var $newTable = $(newTable);

      // Set the existing table to start from being in full view, and mark it to transition on `left` changing
      $oldTable.addClass('coral-Calendar-table--transit');

      // When the transition is done, have the old table removed:
      $oldTable.one('transitionend', function(event) {
        $(event.target).remove();
        this._removeContainerIfEmpty();
      }.bind(this));

      // Set the new table to start out of view (either left or right depending on the direction of the slide), and mark
      // it to transition on `left` changing
      $newTable.addClass('coral-Calendar-table--transit');
      $newTable.css('left', isLeft ? width : -width);

      // When the transition is done, have the transition class lifted
      $newTable.one('transitionend', function(event) {
        var $table = $(event.target);
        $table.removeClass('coral-Calendar-table--transit');
        $table.appendTo(this.host);
        this._removeContainerIfEmpty();
      }.bind(this));

      // Force a redraw by querying the browser for its offsetWidth. Without this, the re-positioning code later on
      // would not lead to a transition. Note that there's no significance to the resulting value being assigned to
      // 'height' -- this is merely so to keep jshint from complaining
      height = this.container.offsetWidth;

      // Set the `left` positions to transition to:
      $oldTable.css('left', isLeft ? -width : width);
      $newTable.css('left', 0);

      this.$oldTable = $newTable;
    };
  }

  /** @ignore */
  var ARRAYOF6 = [0, 0, 0, 0, 0, 0];

  /** @ignore */
  var ARRAYOF7 = [0, 0, 0, 0, 0, 0, 0];

  /** @ignore */
  var INTERNAL_FORMAT = 'YYYY-MM-DD';

  /** @ignore */
  var timeUnit = {
    'YEAR': 'year',
    'MONTH': 'month',
    'WEEK': 'week',
    'DAY': 'day'
  };

  Coral.register( /* @lends Coral.Calendar# */ {
    /**
      @class Coral.Calendar
      @classdesc A Calendar component. Please note that for the <code>next</code> and <code>previous</code> month
      buttons to show properly, the embedding document is required to have <code><meta charset="utf-8"></code> set in
      its <code><head></code> tag.
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-calendar
    */
    name: 'Calendar',
    tagName: 'coral-calendar',
    className: 'coral-Calendar',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'click .coral-Calendar-nextMonth,.coral-Calendar-prevMonth': '_onNextOrPreviousMonthClick',
      'click .coral-Calendar-calendarBody .coral-Calendar-date': '_onDayClick',
      'mousedown .coral-Calendar-calendarBody .coral-Calendar-date': '_onDayMouseDown',
      'key:up .coral-Calendar-calendarBody': '_onUpKey',
      'key:right .coral-Calendar-calendarBody': '_onRightKey',
      'key:down .coral-Calendar-calendarBody': '_onDownKey',
      'key:left .coral-Calendar-calendarBody': '_onLeftKey',
      'key:home .coral-Calendar-calendarBody': '_onHomeOrEndKey',
      'key:end .coral-Calendar-calendarBody': '_onHomeOrEndKey',
      'key:pageup': '_onPageUpKey',
      'key:pagedown': '_onPageDownKey',

      'key:meta+pageup': '_onCtrlPageUpKey', // On OSX we use Command+Page Up
      'key:meta+pagedown': '_onCtrlPageDownKey', // On OSX we use Command+Page Down
      'key:ctrl+pageup': '_onCtrlPageUpKey', // On Windows, we use CTRL+Page Up
      'key:ctrl+pagedown': '_onCtrlPageDownKey', // On Windows, we use CTRL+Page Down

      'key:enter .coral-Calendar-calendarBody': '_onEnterKey',
      'key:space .coral-Calendar-calendarBody': '_onEnterKey'
    },

    properties: {

      /**
        Defines the start day for the week, 0 = Sunday, 1 = Monday etc., as depicted on the calendar days grid.

        @type {Number}
        @default 0
        @htmlattribute startday
        @memberof Coral.Calendar#
      */
      'startDay': {
        default: 0,
        attribute: 'startday',
        transform: Coral.transform.number,
        validate: [
          Coral.validate.valueMustChange,
          function(value) {
            return value >= 0 && value < 7;
          }
        ],
        sync: noop,
        alsoSync: ['_renderCalendarFlag']
      },

      /**
        The format used to display the current month and year. See http://momentjs.com/docs/#/displaying/ for valid
        format string options.

        @type {String}
        @default "MMMM YYYY"
        @htmlattribute headerformat
        @memberof Coral.Calendar#
      */
      'headerFormat': {
        default: 'MMMM YYYY',
        attribute: 'headerformat',
        sync: noop,
        alsoSync: ['_renderCalendarFlag']
      },

      /**
        The minimal selectable date in the Calendar view. When passed a string, it needs to be 'YYYY-MM-DD' formatted.

        @type {String|Date}
        @default null
        @htmlattribute min
        @memberof Coral.Calendar#
      */
      'min': {
        default: null,
        transform: function(value) {
          return toMoment(value, this.valueFormat);
        },
        validate: validateAsChangedAndValidMoment,
        get: function() {
          return this._min ? this._min.toDate() : null;
        },
        sync: noop,
        alsoSync: ['_renderCalendarFlag', 'invalid']
      },

      /**
        The max selectable date in the Calendar view. When passed a string, it needs to be 'YYYY-MM-DD'
        formatted.

        @type {String|Date}
        @default null
        @htmlattribute max
        @memberof Coral.Calendar#
      */
      'max': {
        default: null,
        transform: function(value) {
          return toMoment(value, this.valueFormat);
        },
        validate: validateAsChangedAndValidMoment,
        get: function() {
          return this._max ? this._max.toDate() : null;
        },
        sync: noop,
        alsoSync: ['_renderCalendarFlag', 'invalid']
      },

      /**
        The format to use on expressing the selected date as a string on the <code>value</code> attribute. See
        http://momentjs.com/docs/#/displaying/ for valid format string options.

        @type {String}
        @default "YYYY-MM-DD"
        @htmlattribute valueformat
        @htmlattributereflected
        @memberof Coral.Calendar#
      */
      'valueFormat': {
        default: 'YYYY-MM-DD',
        attribute: 'valueformat',
        reflectAttribute: true,
        set: function(value) {
          this._valueFormat = value;
          this._elements.input.value = this.value;
        }
      },

      /**
        The current value. When set to 'today', the value is coerced into the clients local date expressed as string
        formatted in accordance to the set <code>valueFormat</code>.

        @type {String}
        @default ""
        @fires Coral.mixin.formField#change
        @htmlattribute value
        @memberof Coral.Calendar#
      */
      'value': {
        transform: function(value) {
          return toMoment(value, this.valueFormat);
        },
        validate: function(newVal, oldVal) {
          return validateAsChangedAndValidMoment(newVal, this._value);
        },
        get: function() {
          return this._value ? this._value.format(this.valueFormat) : '';
        },
        set: function(value) {
          this._value = value;
          this._elements.input.value = this.value;

          // resets the view cursor, so the selected month will be in view
          this._cursor = null;

          this._queueSync('_renderCalendarFlag', 'invalid', 'required');
        }
      },

      /**
        The value returned, or set, as a Date. If the value is '' it will return <code>null</code>.

        @type {Date}
        @default null
        @memberof Coral.Calendar#
      */
      'valueAsDate': {
        attribute: null,
        transform: function(value) {
          return (value instanceof Date) ? moment(value) : '';
        },
        get: function() {
          return this._value ? this._value.toDate() : null;
        },
        set: function(value) {
          this.value = value;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this.$.toggleClass('is-required', this.required && this._value === null);
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);
          this._elements.prev.disabled = this.disabled;
          this._elements.next.disabled = this.disabled;
          this._elements.body.setAttribute('aria-disabled', this.disabled);
          this._elements.body[this.disabled ? 'removeAttribute' : 'setAttribute']('tabindex', '0');
        },
        // Have the view reflect the disabled state change (in disabled state, all day buttons become span's
        alsoSync: ['_renderCalendarFlag']
      },

      // JSDoc inherited
      'invalid': {
        get: function() {
          return !(this._value === null || isDateInRange(this._value, this.min, this.max));
        },
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);
        },
        // If the selected date is on display, the view needs to reflect it being invalid
        alsoSync: ['_renderCalendarFlag']
      },

      /**
        Internal property that other properties use via `alsoSync` to schedule a calendar redraw. It makes sure that
        `_renderCalendar` is invoked only once per frame as a result of `alsoSync` invoking `Component._queueSync` that
        removes duplicate entries for the given property (`_renderCalendarFlag` in this case), maintaining only the last
        one added.

        @ignore
      */
      '_renderCalendarFlag': {
        attribute: null,
        sync: function() {
          this._renderCalendar();
        }
      }
    },

    /** @ignore */
    _render: function() {
      this.appendChild(Coral.templates.Calendar.calendar.call(this._elements));
    },

    /** @ignore */
    _initialize: function() {
      // Internal keeper of the month that is currently on display.
      this._cursor = null;

      // Internal keeper for the id of the currently focused date cell or the cell that would receive focus when the
      // calendar body receives focus.
      this._activeDescendant = null;
      this._animator = new TableAnimator(this._elements.body);
      this.setAttribute('role', 'region');
    },

    /** @ignore */
    _renderCalendar: function(slide) {
      var cursor = this._requireCursor();
      var displayYear = cursor.year();
      var displayMonth = cursor.month();
      var self = this;
      var oldTable = this._animator.$oldTable;

      this._elements.heading.innerHTML = moment([displayYear, displayMonth, 1]).format(this.headerFormat);

      var newTable = this._renderTable(displayYear, displayMonth + 1);

      if (oldTable) {
        // Waiting a frame ensures that the element is announced after the transition.
        $(newTable).one('transitionend', function() {
          Coral.commons.nextFrame(function() {
            self._setActiveDescendant();
          });
        });
      }

      if (oldTable) {
        Coral.commons.transitionEnd(newTable, function() {
          self._setActiveDescendant();
        });
      }

      this._animator.slide(newTable, slide);

      var el = this._elements.body.querySelector('.is-selected');
      var selectedId = el ? el.id : null;

      // This will be overwritten later if there is any other function setting the attribute
      this._activeDescendant = selectedId;

      this._setActiveDescendant();
    },

    /**
      Updates the aria-activedescendant property for the calendar grid to communicate the currently focused date, or the
      date that should get focus when the grid receives focus, to assistive technology.

      @ignore
    */
    _setActiveDescendant: function() {
      var el;

      if (!this._activeDescendant || !document.getElementById(this._activeDescendant)) {
        this._activeDescendant = null;
        el = this._elements.body.querySelector('.is-selected');
        var selectedId = el ? el.id : null;
        el = this._elements.body.querySelector('.is-today');
        var todayId = el ? el.id : null;

        this._activeDescendant = selectedId || todayId;

        if (!this._activeDescendant ||
          !this._elements.body.querySelector('#' + this._activeDescendant + ' [data-date]')
        ) {
          el = this._elements.body.querySelector('[data-date]');
          if (el) {
            this._activeDescendant = el.parentElement.id;
          }
        }
      }

      el = this._elements.body.querySelector('.coral-focus');
      if (el) {
        $(el).removeClass('coral-focus');
      }

      this._elements.body.setAttribute('aria-activedescendant', this._activeDescendant);

      if (!this._activeDescendant) {
        return;
      }

      $('#' + this._activeDescendant).addClass('coral-focus');

      this._updateTableCaption();
    },

    /**
      Updates the table caption which serves as a live region to announce the currently focused date to assistive
      technology, improving compatibility across operating systems, browsers and screen readers.

      @ignore
     */
    _updateTableCaption: function() {
      var self = this;
      var caption = self._elements.body.querySelector('caption');

      if (!caption) {
        return;
      }

      if (caption.firstChild) {
        caption.removeChild(caption.firstChild);
      }
      if (this._activeDescendant) {
        var activeDescendant = this._elements.body.querySelector('#' + this._activeDescendant);
        var captionText = document.createTextNode(activeDescendant.getAttribute('title'));
        caption.appendChild(captionText);
      }
    },

    /** @ignore */
    _renderTable: function(year, month) {
      var firstDate = moment([year, month - 1, 1]);
      var monthStartsAt = (firstDate.day() - this.startDay) % 7;
      var dateLocal = this._value ? this._value.clone().startOf('day') : null;

      if (monthStartsAt < 0) {
        monthStartsAt += 7;
      }

      var data = {

        dayNames: ARRAYOF7.map(
          function(_, index, days) {
            var dayMoment = moment().day((index + this.startDay) % 7);
            var dayDetail = {
              dayAbbr: dayMoment.format('dd'),
              dayFullName: dayMoment.format('dddd')
            };
            return dayDetail;
          },
          this),

        weeks: ARRAYOF6.map(
          function(_, weekIndex) {
            return ARRAYOF7.map(
              function(_, dayIndex) {
                var result = {};
                var cssClass = this.disabled ? ['is-disabled'] : [];
                var ariaSelected = false;
                var ariaInvalid = false;
                var day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
                var cursor = moment([year, month - 1, day]);
                var isCurrentMonth = (cursor.month() + 1) === parseFloat(month);
                var dayOfWeek = moment().day((dayIndex + this.startDay) % 7).format('dddd');
                var isToday = cursor.isSame(moment(), 'day');

                var cursorLocal = cursor.clone().startOf('day');

                if (isToday) {
                  cssClass.push('is-today');
                }

                if (dateLocal && cursorLocal.isSame(dateLocal, 'day')) {
                  ariaSelected = true;
                  cssClass.push('is-selected');
                  if (this.invalid) {
                    ariaInvalid = true;
                    cssClass.push('is-invalid');
                  }
                }

                if (isCurrentMonth && !this.disabled && isDateInRange(cursor, this.min, this.max)) {
                  result.dateAttr = cursorLocal.local().format(INTERNAL_FORMAT);
                  result.weekIndex = cursor.week();
                  result.formattedDate = cursor.format('LL');
                }

                result.isDisabled = this.disabled || !result.dateAttr;
                result.dateText = cursor.date();
                result.cssClass = cssClass.join(' ');
                result.isToday = isToday;
                result.ariaSelected = ariaSelected;
                result.ariaInvalid = ariaInvalid;
                result.dateLabel = dayOfWeek;
                result.weekIndex = cursor.week();

                return result;
              },
              this
            );
          },
          this)
      };

      var handles = {};
      Coral.templates.Calendar.table.call(handles, data);

      return handles.table;
    },

    /** @ignore */
    _requireCursor: function() {
      var cursor = this._cursor;
      if (!cursor || !cursor.isValid()) {
        // When its unknown what month we should be showing, use the set date. If that is not available, use 'today'
        cursor = (this._value ? this._value.clone().startOf('day') : moment()).startOf('month');
        this._cursor = cursor;
      }

      return cursor;
    },

    /**
      Navigate to previous or next timeUnit interval.

      @param {String} unit
        Year, Month, Week, Day
      @param {Boolean} isNext
        Whether to navigate forward or backward.
     */
    _gotoPreviousOrNextTimeUnit: function(unit, isNext) {
      var direction = isNext ? 'left' : 'right';
      var operator = isNext ? 'add' : 'subtract';
      var el = this._elements.body.querySelector('td.coral-focus .coral-Calendar-date');

      if (el) {
        var currentActive = el.getAttribute('data-date');
        var currentMoment = moment(currentActive);
        var newMoment = currentMoment[operator](1, unit);
        var difference = Math.abs(moment(currentActive).diff(newMoment, 'days'));
        this._getToNewMoment(null, direction, operator, difference);
        this._setActiveDescendant();
      }
      else {
        this._requireCursor();
        this._cursor[operator](1, unit);
        this._renderCalendar(direction);
      }
    },

    /** @ignore */
    _onNextOrPreviousMonthClick: function(event) {
      event.preventDefault();

      this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, this._elements.next === event.matchedTarget);
      event.matchedTarget.focus();
    },

    /** @ignore */
    _getToNewMoment: function(event, direction, operator, difference) {
      var currentActive = this._elements.body.querySelector('td.coral-focus .coral-Calendar-date')
        .getAttribute('data-date');
      var currentMoment = moment(currentActive);
      var currentMonth = currentMoment.month();
      var currentYear = currentMoment.year();
      var newMoment = currentMoment[operator](difference, 'days');
      var newMonth = newMoment.month();
      var newYear = newMoment.year();
      var newMomentValue = newMoment.local().format(INTERNAL_FORMAT);

      if (newMonth !== currentMonth) {
        this._requireCursor();
        this._cursor[operator](1, 'months');
        this._renderCalendar(direction);
      }
      else if (newMonth === currentMonth && newYear !== currentYear) {
        this._requireCursor();
        this._cursor[operator](1, 'years');
        this._renderCalendar(direction);
      }

      var dateQuery = '.coral-Calendar-date[data-date^=' + JSON.stringify(newMomentValue) + ']';
      var newDescendant = this._elements.body.querySelector(dateQuery);
      if (newDescendant) {
        var newDescendantId = newDescendant.parentNode.getAttribute('id');
        this._activeDescendant = newDescendantId;
      }
    },

    /** @ignore */
    _onDayMouseDown: function(event) {
      this._activeDescendant = event.target.parentNode.id;
      this._setActiveDescendant();
      this._elements.body.focus();
    },

    /** @ignore */
    _onDayClick: function(event) {
      event.preventDefault();

      this._elements.body.focus();

      var date = moment(event.target.getAttribute('data-date'), INTERNAL_FORMAT);
      var dateLocal;

      // Carry over any user set time info
      if (this._value) {
        dateLocal = this._value.clone();
      }

      // Set attribute so a change event will be triggered if the user has selected a different date
      if (validateAsChangedAndValidMoment(date, dateLocal)) {
        this.value = date.local();
        this.trigger('change');
      }
    },

    /** @ignore */
    _onEnterKey: function(event) {
      event.preventDefault();

      var el = this._elements.body.querySelector('td.coral-focus .coral-Calendar-date');

      if (el) {
        el.click();
      }
    },

    /** @ignore */
    _onUpKey: function(event) {
      event.preventDefault();

      this._gotoPreviousOrNextTimeUnit(timeUnit.WEEK, false);
    },

    /** @ignore */
    _onDownKey: function(event) {
      event.preventDefault();

      this._gotoPreviousOrNextTimeUnit(timeUnit.WEEK, true);
    },

    /** @ignore */
    _onRightKey: function(event) {
      event.preventDefault();

      this._gotoPreviousOrNextTimeUnit(timeUnit.DAY, true);
    },

    /** @ignore */
    _onLeftKey: function(event) {
      event.preventDefault();

      this._gotoPreviousOrNextTimeUnit(timeUnit.DAY, false);
    },

    /** @ignore */
    _onHomeOrEndKey: function(event) {
      event.preventDefault();
      var isHome = event.keyCode === Coral.Keys.keyToCode('home');
      var direction = '';
      var operator = isHome ? 'subtract' : 'add';
      var el = this._elements.body.querySelector('td.coral-focus .coral-Calendar-date');

      if (el) {
        var currentActive = el.getAttribute('data-date');
        var currentMoment = moment(currentActive);
        var difference = isHome ? currentMoment.date() - 1 : currentMoment.daysInMonth() - currentMoment.date();
        this._getToNewMoment(event, direction, operator, difference);
        this._setActiveDescendant();
      }
    },

    /** @ignore */
    _onPageDownKey: function(event) {
      event.preventDefault();
      this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, true);
    },

    /** @ignore */
    _onPageUpKey: function(event) {
      event.preventDefault();
      this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, false);
    },

    /** @ignore */
    _onCtrlPageDownKey: function(event) {
      event.preventDefault();
      this._gotoPreviousOrNextTimeUnit(timeUnit.YEAR, true);
    },

    /** @ignore */
    _onCtrlPageUpKey: function(event) {
      event.preventDefault();
      this._gotoPreviousOrNextTimeUnit(timeUnit.YEAR, false);
    }
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Calendar"] = window["Coral"]["templates"]["Calendar"] || {};
window["Coral"]["templates"]["Calendar"]["calendar"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("handle", "input");
  el0.setAttribute("type", "hidden");
  el0.setAttribute("name", "");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral-Calendar-calendarHeader";
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["heading"] = document.createElement("div");
  el4.setAttribute("handle", "heading");
  el4.className += " coral-Heading coral-Heading--2";
  el4.id = Coral["commons"]["getUID"]();
  el4.setAttribute("role", "heading");
  el4.setAttribute("aria-live", "assertive");
  el4.setAttribute("aria-atomic", "true");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n  ");
  el2.appendChild(el5);
  var el6 = this["prev"] = document.createElement("button","coral-button");
  el6.setAttribute("type", "button");
  el6.setAttribute("handle", "prev");
  el6.className += " coral-Calendar-prevMonth";
  el6.setAttribute("is", "coral-button");
  el6.setAttribute("variant", "minimal");
  el6.setAttribute("icon", "chevronLeft");
  el6.setAttribute("iconsize", "XS");
  el6.setAttribute("aria-label", "Previous");
  el6.setAttribute("title", "Previous");
  el2.appendChild(el6);
  var el7 = document.createTextNode("\n  ");
  el2.appendChild(el7);
  var el8 = this["next"] = document.createElement("button","coral-button");
  el8.setAttribute("type", "button");
  el8.setAttribute("handle", "next");
  el8.className += " coral-Calendar-nextMonth";
  el8.setAttribute("is", "coral-button");
  el8.setAttribute("variant", "minimal");
  el8.setAttribute("icon", "chevronRight");
  el8.setAttribute("iconsize", "XS");
  el8.setAttribute("aria-label", "Next");
  el8.setAttribute("title", "Next");
  el2.appendChild(el8);
  var el9 = document.createTextNode("\n");
  el2.appendChild(el9);
  frag.appendChild(el2);
  var el10 = document.createTextNode("\n");
  frag.appendChild(el10);
  var el11 = this["body"] = document.createElement("div");
  el11.className += " coral-Calendar-calendarBody";
  el11.setAttribute("handle", "body");
  el11.setAttribute("role", "grid");
  el11.setAttribute("tabindex", "0");
  el11.setAttribute("aria-readonly", "true");
  el11.textContent = "\n";
  frag.appendChild(el11);
  return frag;
});

window["Coral"]["templates"]["Calendar"]["container"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["container"] = document.createElement("div");
  el0.className += " coral-DatePicker-calendarSlidingContainer";
  el0.setAttribute("handle", "container");
  el0.setAttribute("style", "width: "+data_0["width"]+"px; height: "+data_0["height"]+"px;");
  return el0;
});

window["Coral"]["templates"]["Calendar"]["table"] = (function anonymous(data_0
/**/) {
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  var el0 = this["table"] = document.createElement("table");
  el0.setAttribute("handle", "table");
  el0.setAttribute("role", "presentation");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = document.createElement("thead");
  el2.setAttribute("role", "presentation");
  var el3 = document.createTextNode("\n    ");
  el2.appendChild(el3);
  var el4 = document.createElement("tr");
  el4.setAttribute("role", "row");
  var el5 = document.createTextNode("\n      ");
  el4.appendChild(el5);
  var iterated_1 = data_0["dayNames"];
  for (var i1 = 0, ni1 = iterated_1.length; i1 < ni1; i1++) {
    var data_1 = data = iterated_1[i1];
    var el7 = document.createTextNode("\n        ");
    el4.appendChild(el7);
    var el8 = document.createElement("th");
    el8.setAttribute("role", "columnheader");
    el8.setAttribute("scope", "col");
    var el9 = document.createTextNode("\n          ");
    el8.appendChild(el9);
    var el10 = document.createElement("abbr");
    el10.className += " coral-Calendar-dayOfWeek";
    el10.setAttribute("title", data_1["dayFullName"]);
    el10.textContent = data_1["dayAbbr"];
    el8.appendChild(el10);
    var el11 = document.createTextNode("\n        ");
    el8.appendChild(el11);
    el4.appendChild(el8);
    var el12 = document.createTextNode("\n      ");
    el4.appendChild(el12);
  }
  var el13 = document.createTextNode("\n    ");
  el4.appendChild(el13);
  el2.appendChild(el4);
  var el14 = document.createTextNode("\n  ");
  el2.appendChild(el14);
  el0.appendChild(el2);
  var el15 = document.createTextNode("\n  ");
  el0.appendChild(el15);
  var el16 = document.createElement("tbody");
  el16.setAttribute("role", "presentation");
  var el17 = document.createTextNode("\n    ");
  el16.appendChild(el17);
  var iterated_1 = data_0["weeks"];
  for (var i1 = 0, ni1 = iterated_1.length; i1 < ni1; i1++) {
    var data_1 = data = iterated_1[i1];
    var el19 = document.createTextNode("\n      ");
    el16.appendChild(el19);
    var el20 = document.createElement("tr");
    el20.setAttribute("role", "row");
    var el21 = document.createTextNode("\n        ");
    el20.appendChild(el21);
    var iterated_2 = data_1;
    for (var i2 = 0, ni2 = iterated_2.length; i2 < ni2; i2++) {
      var data_2 = data = iterated_2[i2];
      var el23 = document.createTextNode("\n          ");
      el20.appendChild(el23);
      data = data_2;
      
            /* @TODO: this should be a localized string for including the current state in the title for accessibility */
            data.todayString = data.isToday ? 'Today, ' : '';
            data.selectedString = data.ariaSelected ? ' selected' : '';
          
      data_2 = data;
      var el25 = document.createTextNode("\n          ");
      el20.appendChild(el25);
      var el26 = document.createElement("td");
      el26.setAttribute("role", "gridcell");
      el26.id = Coral["commons"]["getUID"]()+"-row"+i1+"-col"+i2;
      el26.className += " "+data_2["cssClass"];
      el26.setAttribute("aria-selected", data_2["ariaSelected"]);
      if (data_2["isDisabled"]) {
      el26.setAttribute("aria-disabled", "true");
      }
      if (data_2["ariaInvalid"]) {
      el26.setAttribute("aria-invalid", "true");
      }
      if (data_2["formattedDate"]) {
      el26.setAttribute("title", data_2["todayString"]+data_2["dateLabel"]+", "+data_2["formattedDate"]+" "+data_2["selectedString"]);
      }
      var el27 = document.createTextNode("\n            ");
      el26.appendChild(el27);
      if (data_2["dateAttr"]) {
        var el29 = document.createTextNode("\n              ");
        el26.appendChild(el29);
        var el30 = document.createElement("a");
        el30.setAttribute("role", "presentation");
        el30.className += " coral-Calendar-date";
        el30.setAttribute("data-date", data_2["dateAttr"]);
        el30.textContent = data_2["dateText"];
        el26.appendChild(el30);
        var el31 = document.createTextNode("\n              ");
        el26.appendChild(el31);
      }
      else {
        var el32 = document.createTextNode("\n                ");
        el26.appendChild(el32);
        var el33 = document.createElement("span");
        el33.setAttribute("role", "presentation");
        el33.className += " coral-Calendar-secondaryDate";
        el33.textContent = data_2["dateText"];
        el26.appendChild(el33);
        var el34 = document.createTextNode("\n            ");
        el26.appendChild(el34);
      }
      var el35 = document.createTextNode("\n          ");
      el26.appendChild(el35);
      el20.appendChild(el26);
      var el36 = document.createTextNode("\n        ");
      el20.appendChild(el36);
    }
    var el37 = document.createTextNode("\n      ");
    el20.appendChild(el37);
    el16.appendChild(el20);
    var el38 = document.createTextNode("\n    ");
    el16.appendChild(el38);
  }
  var el39 = document.createTextNode("\n  ");
  el16.appendChild(el39);
  el0.appendChild(el16);
  var el40 = document.createTextNode("\n  ");
  el0.appendChild(el40);
  var el41 = document.createElement("caption");
  el41.className += " u-coral-screenReaderOnly";
  el41.setAttribute("aria-live", "assertive");
  el41.setAttribute("aria-atomic", "true");
  el0.appendChild(el41);
  var el42 = document.createTextNode("\n");
  el0.appendChild(el42);
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enumeration representing the possible targets for the CharacterCount.

    @enum {String}
    @memberof Coral.CharacterCount
  */
  var target = {
    /** Relates the CharacterCount to the previous sibling. */
    PREVIOUS: '_prev',
    /** Relates the CharacterCount to the next sibling. */
    NEXT: '_next'
  };

  Coral.register( /** @lends Coral.CharacterCount */ {
    /**
      @class Coral.CharacterCount
      @classdesc A character counter component
      @extends Coral.Component
      @htmltag coral-charactercount
    */
    name: 'CharacterCount',
    tagName: 'coral-charactercount',
    className: 'coral-CharacterCount',

    properties: {
      /**
        The target Textfield or Textarea for this component. It accepts values from {@link Coral.CharacterCount.target},
        as well as any DOM element or CSS selector.

        @type {Coral.CharacterCount.target|HTMLElement|String}
        @default Coral.CharacterCount.target.PREVIOUS
        @htmlattribute target
        @memberof Coral.CharacterCount#
      */
      'target': {
        default: target.PREVIOUS,
        validate: function(value) {
          return typeof value === 'string' || value instanceof Node;
        },
        set: function(value) {
          this._target = value;

          // Remove previous event listener
          if (this._targetEl) {
            this._$targetEl.off('.CoralCharacterCount');
          }

          // Get the target DOM element
          if (value === target.NEXT) {
            this._targetEl = this.nextElementSibling;
          }
          else if (value === target.PREVIOUS) {
            this._targetEl = this.previousElementSibling;
          }
          else if (typeof value === 'string') {
            this._targetEl = document.querySelector(value);
          }
          else {
            this._targetEl = value;
          }

          // Keep a reference to the jQuery Object
          if (this._targetEl) {
            this._$targetEl = $(this._targetEl);
            this._$targetEl.on('input.CoralCharacterCount', this._refreshCharCount.bind(this));

            // Try to get maxlength from target element
            if (this._targetEl.getAttribute('maxlength')) {
              this.maxLength = this._targetEl.getAttribute('maxlength');
            }
          }
        }
      },

      /**
        Maximum character length for the TextField/TextArea (will be read from target field markup if able).

        @type {Number}
        @default null
        @htmlattribute maxlength
        @htmlattributereflected
        @memberof Coral.CharacterCount#
      */
      'maxLength': {
        default: null,
        attribute: 'maxlength',
        reflectAttribute: true,
        transform: Coral.transform.number,
        sync: function() {
          this._refreshCharCount();
        }
      }
    },

    /** @ignore */
    _getCharCount: function() {
      var elementLength = this._targetEl ? this._targetEl.value.length : 0;
      return this._maxLength ? (this._maxLength - elementLength) : elementLength;
    },

    /** @ignore */
    _refreshCharCount: function() {
      var currentCount = this._getCharCount();
      this.innerHTML = currentCount;
      var isMaxExceeded = currentCount < 0;
      if (this._$targetEl) {
        this._$targetEl.toggleClass('is-invalid', isMaxExceeded);
        this.$.toggleClass('is-invalid', isMaxExceeded);
      }
    }
  });

  // Expose enums globally
  Coral.CharacterCount.target = target;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // @polyfill ie
  var REG_EXP = new RegExp('[^\\d.-]', 'g');

  Coral.register( /* @lends Coral.Clock# */ {
    /**
      @class Coral.Clock
      @classdesc A component that allows for selecting a time.
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-clock
    */
    name: 'Clock',
    tagName: 'coral-clock',
    className: 'coral-Clock',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'change input[is=coral-textfield]': '_onInputChange',

      // @polyfill ie
      'keypress input[is=coral-textfield]': '_onInputKeyPress',
      'paste input[is=coral-textfield]': '_onInputKeyPress'
    },

    properties: {
      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this._elements.hours.disabled = this.disabled;
          this._elements.minutes.disabled = this.disabled;
          // stops the form submission
          this._elements.input.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          this._elements.hours.invalid = this.invalid;
          this._elements.minutes.invalid = this.invalid;
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function() {
          this._elements.hours.readOnly = this.readOnly;
          this._elements.minutes.readOnly = this.readOnly;
          this._elements.input.readOnly = this.readOnly;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.hours.required = this.required;
          this._elements.minutes.required = this.required;
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'value': {
        validate: function(newValue, oldValue) {
          return typeof newValue === 'string';
        },
        get: function() {
          return this._getValueAsString(this._value, 'HH:mm');
        },
        set: function(value) {
          // we do strict conversion of the values
          var time = moment(value, 'HH:mm', true);
          this._value = time.isValid() ? time : null;
          this._elements.input.value = this.value;
        },
        sync: function() {
          if (this._value) {
            this._elements.hours.value = this._value.format('HH');
            this._elements.minutes.value = this._value.format('mm');
          }
          else {
            this._elements.hours.value = '';
            this._elements.minutes.value = '';
          }
        },
      },

      /**
        The current value as a Date. If the value is "" or an invalid date, <code>null</code> will be returned.

        @type {Date}
        @default null
        @memberof Coral.Clock#
      */
      'valueAsDate': {
        attribute: null,
        transform: function(value) {
          return (value instanceof Date) ? moment(value).format('HH:mm') : '';
        },
        get: function() {
          return this._value ? new Date(this._value.toDate().getTime()) : null;
        },
        set: function(value) {
          this.value = value;
        }
      }
    },

    /**
      Kills the internal _onInputChange from formMixin because it does not check the target.

      @private
    */
    _onInputChange: function(event) {
      // stops the event from leaving the component
      event.stopImmediatePropagation();

      var newTime = moment();
      var oldTime = this._value;

      // keeps the values as double digits
      if (event.matchedTarget.value.length === 1) {
        event.matchedTarget.value = '0' + event.matchedTarget.value;
      }

      // if fields are empty, we use 0 to be able to set
      newTime.hours(parseInt(this._elements.hours.value, 10));
      newTime.minutes(parseInt(this._elements.minutes.value, 10));

      // we check if a change event needs to be triggered since it was produced via user interaction
      if (!newTime.isValid()) {
        // does not sync the inputs so allow the user to continue typing the date
        if (this._value !== null) {
          this._value = null;
          this.trigger('change');
        }
      }
      else if (!newTime.isSame(oldTime, 'hour') || !newTime.isSame(oldTime, 'minute')) {
        this.value = newTime.format('HH:mm');
        this.trigger('change');
      }
    },

    /**
      Prevents from entering non-digit characters

      @polyfill ie
      @ignore
    */
    _onInputKeyPress: function(event) {
      var newValue = event.target.value + String.fromCharCode(event.which || event.keyCode);
      if (newValue !== newValue.replace(REG_EXP, '')) {
        event.preventDefault();
      }
    },

    /**
      Modified the label target to be the clock itself and not the first input. This is used by the
      <code>Coral.mixin.formField</code> to be able to properly label the component.

      @private
    */
    _getLabellableElement: function() {
      return this;
    },

    /**
      Helper class that converts the internal moment value into a String using the provided date format. If the value is
      invalid, empty string will be returned.

      @param {?Moment} value
        The value representing the date. It has to be a moment object or <code>null</code>
      @param {String} format
        The Date format to be used.

      @returns {String} a String representing the value in the given format.

      @ignore
    */
    _getValueAsString: function(value, format) {
      return value && value.isValid() ? value.format(format) : '';
    },

    /** @ignore */
    _render: function() {
      // clean up to be able to clone it
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }

      this.appendChild(Coral.templates.Clock.base.call(this._elements));
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Clock"] = this["Coral"]["templates"]["Clock"] || {};
this["Coral"]["templates"]["Clock"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.setAttribute("type", "hidden");
  el0.setAttribute("name", "");
  el0.setAttribute("handle", "input");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["hours"] = document.createElement("input","coral-textfield");
  el2.setAttribute("is", "coral-textfield");
  el2.setAttribute("type", "number");
  el2.setAttribute("min", "0");
  el2.setAttribute("max", "23");
  el2.setAttribute("placeholder", "hh");
  el2.className += " coral-Clock-hour";
  el2.setAttribute("handle", "hours");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = document.createElement("span");
  el4.className += " coral-Clock-divider";
  el4.textContent = ":";
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  var el6 = this["minutes"] = document.createElement("input","coral-textfield");
  el6.setAttribute("is", "coral-textfield");
  el6.setAttribute("type", "number");
  el6.setAttribute("min", "0");
  el6.setAttribute("max", "59");
  el6.setAttribute("placeholder", "mm");
  el6.className += " coral-Clock-minute";
  el6.setAttribute("handle", "minutes");
  frag.appendChild(el6);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var KEYPRESS_TIMEOUT_DURATION = 1000;

  /**
    The distance, in pixels, from the bottom of the SelectList at which we trigger a scrollbottom event. For example, a
    value of 50 would indicate a scrollbottom event should be triggered when the user scrolls to within 50 pixels of the
    bottom.

    @type {Number}
    @ignore
   */
  var SCROLL_BOTTOM_THRESHOLD = 50;

  /**
    The number of milliseconds for which scroll events should be debounced.

    @type {Number}
    @ignore
  */
  var SCROLL_DEBOUNCE = 100;

  /** @ignore */
  var ITEM_TAG_NAME = 'coral-selectlist-item';

  /** @ignore */
  var GROUP_TAG_NAME = 'coral-selectlist-group';

  var SelectListCollection = function(host, itemTagName) {
    this._host = host;
    this._itemTagName = itemTagName;
  };

  SelectListCollection.prototype = Object.create(Coral.Collection.prototype);

  SelectListCollection.prototype.add = function(item, before) {
    if (!(item instanceof HTMLElement)) {
      // creates a new item and initializes its values
      var itemObject = item;
      item = document.createElement(this._itemTagName);
      item.set(itemObject, true);
    }

    return this._host.insertBefore(item, before || null);
  };

  SelectListCollection.prototype.getAll = function() {
    return this._host.$.children(this._itemTagName).toArray();
  };

  Coral.register( /** @lends Coral.SelectList# */ {
    /**
      @class Coral.SelectList
      @classdesc A SelectList component
      @extends Coral.Component
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#multiple as Coral.SelectList#multiple
      @borrows Coral.mixin.selectionList#selectedItem as Coral.SelectList#selectedItem
      @borrows Coral.mixin.selectionList#selectedItems as Coral.SelectList#selectedItems
      @borrows Coral.mixin.selectionList#items as Coral.SelectList#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.SelectList#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.SelectList#coral-collection:remove

      @htmltag coral-selectlist
    */
    // Based on ARIA standard http://www.w3.org/WAI/PF/aria/roles#listbox
    name: 'SelectList',
    tagName: 'coral-selectlist',
    className: 'coral3-SelectList',

    mixins: [
      Coral.mixin.selectionList({
        role: 'listbox',
        itemTagName: ITEM_TAG_NAME
      })
    ],

    events: {
      'scroll': '_onScroll',
      'capture:focus': '_onFocus',
      'capture:blur': '_onBlur',

      'click coral-selectlist-item': '_onItemClick',

      'capture:mouseenter coral-selectlist-item': '_onItemMouseEnter',
      'capture:mouseleave coral-selectlist-item': '_onItemMouseLeave',

      'key:space coral-selectlist-item': '_onToggleItemKey',
      'key:return coral-selectlist-item': '_onToggleItemKey',
      'key:pageup coral-selectlist-item': '_focusPreviousItem',
      'key:left coral-selectlist-item': '_focusPreviousItem',
      'key:up coral-selectlist-item': '_focusPreviousItem',
      'key:pagedown coral-selectlist-item': '_focusNextItem',
      'key:right coral-selectlist-item': '_focusNextItem',
      'key:down coral-selectlist-item': '_focusNextItem',
      'key:home coral-selectlist-item': '_onHomeKey',
      'key:end coral-selectlist-item': '_onEndKey',
      'keypress coral-selectlist-item': '_onKeyPress'
    },

    properties: {
      /**
        The Collection Interface that allows interacting with the {@link Coral.SelectList.Group} elements that the
        SelectList contains. This includes items nested inside groups. To manage items contained within a specific
        group, see {@link Coral.SelectList.Group#items}.

        See {@link Coral.Collection} for more details regarding collection APIs.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.SelectList#
      */
      'groups': {
        set: function() {},
        get: function() {
          if (!this._groups) {
            this._groups = new SelectListCollection(this, GROUP_TAG_NAME);
          }
          return this._groups;
        }
      },

      /**
        Whether items are being loaded for the SelectList. Toggling this merely shows or hides a loading indicator.

        @default false
        @type {Boolean}
        @htmlattribute loading
        @htmlattributereflected
        @memberof Coral.SelectList#
      */
      'loading': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._loading = value;

          var loadIndicator = this._elements.loadIndicator;

          if (this.loading) {
            // if it does not exist we create it
            if (!loadIndicator) {
              loadIndicator = this._elements.loadIndicator = Coral.templates.SelectList.loadIndicator().firstChild;
            }

            // we decide first if we need to scroll to the bottom since adding the load will change the dimentions
            var scrollToBottom = this.scrollTop >= this.scrollHeight - this.clientHeight;

            // inserts the item at the end
            this.appendChild(loadIndicator);

            // we make the load indicator visible
            if (scrollToBottom) {
              this.scrollTop = this.scrollHeight;
            }
          }
          else {
            if (loadIndicator && loadIndicator.parentNode) {
              this.removeChild(loadIndicator);
            }
          }
        }
      },

      /** @private **/
      '_tabTarget': {
        default: null,
        sync: function() {
          var value = this._tabTarget;
          var items = this.items.getAll();

          // Set all but the current set _tabTarget to not be a tab target:
          items.forEach(function(item) {
            item._isTabTarget = item === value;
          });
        }
      }
    },

    /** @private */
    focus: function() {
      // we reset the focus tab and set focus on the right item. This is required in the case that the user had already
      // focus on the an item and he comes back, the focus should be recalculated.
      this._resetTabTarget();
      this._focusItem(this._tabTarget);
    },

    /** @private */
    _onItemMouseEnter: function(event) {
      if (event.target.disabled) {
        return;
      }

      // if the component already has the focus, we can change the activeElement.
      if (this.$.hasClass('is-focused')) {
        this._focusItem(event.target);
      }
      // since we cannot give focus to the item, we mark it as highlighted
      else {
        $(event.target).addClass('is-highlighted');
      }
    },

    /** @private */
    _onItemMouseLeave: function(event) {
      $(event.target).removeClass('is-highlighted');
    },

    /** @private */
    _onFocus: function(event) {
      this.$.addClass('is-focused');
    },

    /** @private */
    _onBlur: function(event) {
      // required otherwise the latest item that had the focus would get it again instead of the selected item
      this._resetTabTarget();
      this.$.removeClass('is-focused');
    },

    /** @private */
    _onItemClick: function(event) {
      var item = event.matchedTarget;
      if (item) {
        event.preventDefault();
        event.stopPropagation();

        // stores the value to be able to determine if something changed
        var oldSelectedValue = item.selected;

        this._selectItem(item);
        this._focusItem(item);

        // since we need to know that the user interacted with the list, we need to trigger an event to indicate that
        // interaction ocurred even though the selection is the same.
        if (oldSelectedValue === item.selected) {
          this.trigger('coral-selectlist:change', {
            oldSelection: this._getSelection(),
            selection: this._getSelection()
          });
        }
      }
    },

    /** @private */
    _focusItem: function(item) {
      if (item) {
        item.focus();
      }

      this._tabTarget = item;
    },

    /** @private */
    _onToggleItemKey: function(event) {
      event.preventDefault();
      event.stopPropagation();

      var item = event.target;

      // stores the value to be able to determine if something changed
      var oldSelectedValue = item.selected;

      this._selectItem(item);
      this._focusItem(item);

      // since we need to know that the user interacted with the list, we need to trigger an event to indicate that
      // interaction ocurred even though the selection is the same.
      if (oldSelectedValue === item.selected) {
        this.trigger('coral-selectlist:change', {
          oldSelection: this._getSelection(),
          selection: this._getSelection()
        });
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getPreviousSelectable(event.target));
    },

    /** @private */
    _focusNextItem: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getNextSelectable(event.target));
    },

    /** @private */
    _onHomeKey: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getFirstSelectable());
    },

    /** @private */
    _onEndKey: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this._focusItem(this.items.getLastSelectable());
    },

    _keypressTimeoutID: null,
    _keypressSearchString: '',

    /**
      Handles keypress event for alphanumeric search.

      @param {KeyboardEvent} event
        The keyboard event.
      @private
     */
    _onKeyPress: function(event) {
      var self = this;
      // The string entered when the key was pressed
      var newString = String.fromCharCode(event.which);

      // Clear the timeout before the _keypressSearchString is cleared
      clearTimeout(this._keypressTimeoutID);

      // If the character entered does not match the last character entered, append it to the _keypressSearchString
      if (newString !== this._keypressSearchString) {
        this._keypressSearchString += newString;
      }

      // Set a timeout so that _keypressSearchString is cleared after 1 second
      this._keypressTimeoutID = setTimeout(function() {
        self._keypressSearchString = '';
      }, KEYPRESS_TIMEOUT_DURATION);

      // Search within selectable items
      var selectableItems = this.items._getSelectableItems();

      // Remember the index of the focused item within the array of selectable items
      var currentIndex = selectableItems.index(this._tabTarget);

      this._keypressSearchString = this._keypressSearchString.trim().toLowerCase();

      var start;
      // If the currentIndex is -1, meaning no item has focus, start from the beginning
      if (currentIndex === -1) {
        start = 0;
      }
      else if (this._keypressSearchString.length === 1) {
        // Otherwise, if there is only one character to compare, start comparing from the next item after the currently
        // focused item. This allows us to iterate through items beginning with the same character
        start = currentIndex + 1;
      }
      else {
        start = currentIndex;
      }

      var newFocusItem;
      var comparison;
      var item;

      // Compare _keypressSearchString against item text until a match is found
      for (var i = start; i < selectableItems.length; i++) {
        item = selectableItems.eq(i);
        comparison = item.text().trim().toLowerCase();
        if (comparison.indexOf(this._keypressSearchString) === 0) {
          newFocusItem = item;
          break;
        }
      }

      // If no match is found, continue searching for a match starting from the top
      if (!newFocusItem) {
        for (var j = 0; j < start; j++) {
          item = selectableItems.eq(j);
          comparison = item.text().trim().toLowerCase();
          if (comparison.indexOf(this._keypressSearchString) === 0) {
            newFocusItem = item;
            break;
          }
        }
      }

      // If a match has been found, focus the matched item
      if (newFocusItem !== undefined) {
        this._focusItem(newFocusItem);
      }
    },

    /**
      Invocation of any of the 4 mixin.selectionList handlers referenced below may result in the internal '_tabTarget'
      property changing. Note that these are not overrides, but additions, invoked via 'Coral.commons.callAll'.

      @private
    */
    _onItemSelected: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemDeselected: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemAttached: function() {
      this._resetTabTarget();
    },

    /** @private **/
    _onItemDetached: function() {
      this._resetTabTarget();
    },

    /**
      Determine what item should get focus (if any) when the user tries to tab into the SelectList. This should be the
      first selected item, or the first selectable item otherwise. When neither is available, it cannot be tabbed into
      the SelectList.

      @private
    */
    _resetTabTarget: function() {
      // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
      var selectedItems = this.items._getNonNestedItems().filter('[selected]:not([disabled],[hidden])');
      this._tabTarget = selectedItems.length ? selectedItems[0] : this.items.getFirstSelectable();
    },

    /** @private */
    _onScroll: function() {
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = setTimeout(this._onDebouncedScroll, SCROLL_DEBOUNCE);
    },

    /**
      @fires Coral.SelectList#coral-selectlist:scrollbottom

      @private
    */
    _onDebouncedScroll: function() {
      if (this.scrollTop >= this.scrollHeight - this.clientHeight - SCROLL_BOTTOM_THRESHOLD) {
        this.trigger('coral-selectlist:scrollbottom');
      }
    },

    /** @private */
    _initialize: function() {
      // even though its a custom element, Firefox gives focus to it
      this.setAttribute('tabindex', '-1');
      // we correctly bind the scroll event
      this._onDebouncedScroll = this._onDebouncedScroll.bind(this);
    }

    /**
      Triggered when the user scrolls to near the bottom of the list. This can be useful for when additional items can
      be loaded asynchronously (i.e., infinite scrolling).

      @event Coral.SelectList#coral-selectlist:scrollbottom

      @param {Object} event
        Event object.
    */

    /**
      Triggered when the selection changes or the user interacts with the list. For example, if something is already
      selected and the user clicks on it again, even it it does not cause the selection to change, a
      <code>coral-selectlist:change</code> event will be triggered so that components can identify that the user
      interacted with the SelectList.

      @event Coral.SelectList#coral-selectlist:change

      @param {Object} event
        Event object.
      @param {Object} event.detail
        Detail object.
      @param {HTMLElement|Array.<HTMLElement>} event.detail.oldSelection
        The old item selection. When {@link Coral.SelectList#multiple}, it includes an Array.
      @param {HTMLElement|Array.<HTMLElement>} event.detail.selection
        The item selection. When {@link Coral.SelectList#multiple}, it includes an Array.
    */
  });

  Coral.register( /** @lends Coral.SelectList.Item# */ {
    /**
      @class Coral.SelectList.Item
      @classdesc A SelectList.Item component
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
      @borrows Coral.mixin.selectionList.Item#disabled as Coral.SelectList.Item#disabled
      @borrows Coral.mixin.selectionList.Item#selected as Coral.SelectList.Item#selected
      @htmltag coral-selectlist-item
    */
    name: 'SelectList.Item',
    tagName: ITEM_TAG_NAME,
    className: 'coral3-SelectList-item',

    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-selectlist',
        role: 'option'
      })
    ],

    events: {
      'focus': '_onFocus',
      'blur': '_onBlur'
    },

    properties: {

      /**
        Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.

        @type {String}
        @default ""
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.SelectList.Item#
      */
      'value': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return typeof this._value === 'undefined' ? this.textContent : this._value;
        }
      },

      /**
        The content element for the item.

        @type {HTMLElement}
        @contentzone
        @readonly
        @memberof Coral.SelectList.Item#
       */
      'content': {
        contentZone: true,
        set: function() {},
        get: function() {
          return this;
        }
      },

      /** @private **/
      '_isTabTarget': {
        default: false,
        sync: function() {
          this.setAttribute('tabindex', this.__isTabTarget ? 0 : -1);
        }
      }
    },

    /** @private */
    _onFocus: function(event) {
      this.$.addClass('is-highlighted');
    },

    /** @private */
    _onBlur: function(event) {
      this.$.removeClass('is-highlighted');
    }
  });

  Coral.register( /** @lends Coral.SelectList.Group# */ {
    /**
      @class Coral.SelectList.Group
      @classdesc A SelectList.Group component
      @extends Coral.Component
      @htmltag coral-selectlist-group
    */
    name: 'SelectList.Group',
    tagName: GROUP_TAG_NAME,
    className: 'coral-SelectList-group',

    properties: {
      /**
        The label of the group. It reflects the <code>label</code> attribute to the DOM.

        @type {String}
        @default ""
        @htmlattribute label
        @htmlattributereflected
        @memberof Coral.SelectList.Group#
      */
      'label': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        sync: function() {
          this.setAttribute('aria-label', this.label);
        }
      },

      /**
        The Collection Interface that allows interacting with the {@link Coral.SelectList.Item}
        elements that the group contains.

        See {@link Coral.Collection} for more details regarding collection APIs.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.SelectList.Group#
      */
      'items': {
        set: function() {},
        get: function() {
          if (!this._groups) {
            this._groups = new SelectListCollection(this, ITEM_TAG_NAME);
          }
          return this._groups;
        }
      }
    },

    /** @private */
    _initialize: function() {
      this.setAttribute('role', 'group');
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["SelectList"] = this["Coral"]["templates"]["SelectList"] || {};
this["Coral"]["templates"]["SelectList"]["loadIndicator"] = (function anonymous(data_0
/**/) {
    var frag = document.createDocumentFragment();
    var data = data_0;
    var el0 = document.createElement("div");
    el0.className += " coral-SelectList-loading";
    var el1 = document.createTextNode("\n  ");
    el0.appendChild(el1);
    var el2 = document.createElement("coral-wait");
    el2.setAttribute("centered", "");
    el0.appendChild(el2);
    var el3 = document.createTextNode("\n");
    el0.appendChild(el3);
    frag.appendChild(el0);
    var el4 = document.createTextNode("\n");
    frag.appendChild(el4);
    return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Regex used to remove whitespace from selectedItem label for use as an aria-label for accessibility.

    @ignore
  */
  var WHITESPACE_REGEX = /[\t\n\r ]+/g;

  /** @ignore */
  var ITEM_TAG_NAME = 'coral-cyclebutton-item';

  /** @ignore */
  var ACTION_TAG_NAME = 'coral-cyclebutton-action';

  Coral.register( /** @lends Coral.CycleButton# */ {
    /**
      A CycleButton is a simple multi-state toggle button.

      @class Coral.CycleButton
      @classdesc A CycleButton component
      @extends Coral.Component
      @borrows Coral.mixin.selectionList#selectedItem as Coral.CycleButton#selectedItem
      @borrows Coral.mixin.selectionList#items as Coral.CycleButton#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.CycleButton#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.CycleButton#coral-collection:remove
      @htmltag coral-cyclebutton
    */
    name: 'CycleButton',
    tagName: 'coral-cyclebutton',
    className: 'coral3-CycleButton',

    mixins: [
      Coral.mixin.selectionList({
        itemTagName: ITEM_TAG_NAME,
        supportMultiple: false,
        forceSelection: true,
        role: 'presentation'
      })
    ],

    events: {
      'click :not(coral-cyclebutton-action)': '_onItemClick',
      'key:down [aria-expanded=false]': '_onItemClick',
      'coral-selectlist:change': '_onSelectListChange',

      'global:click': '_onGlobalClick',
      'global:touchstart': '_onGlobalClick',
      'global:key:escape': '_onEscapeKey'
    },

    properties: {
      /**
        Number of items that can be directly cycled through before collapsing. If <code>0</code> is used, the items
        will never be collapsed.

        @type {Number}
        @default 3
        @htmlattribute threshold
        @memberof Coral.CycleButton#
      */
      'threshold': {
        default: 3,
        transform: Coral.transform.number,
        validate: [
          Coral.validate.valueMustChange,
          function(newValue, oldValue) {
            return newValue !== null && newValue > -1;
          }
        ],
        sync: function() {
          this._checkExtended();
        }
      },

      /**
        The Collection Interface that allows interaction with the {@link Coral.CycleButton.Action} elements.
        See {@link Coral.Collection} for more details regarding Collection APIs.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.CycleButton#
      */
      'actions': {
        set: function() {},
        get: function() {
          if (!this._actions) {
            this._actions = new Coral.Collection({
              host: this,
              itemTagName: ACTION_TAG_NAME,
              itemSelector: ACTION_TAG_NAME
            });
          }
          return this._actions;
        }
      }
    },

    /** @ignore */
    _onEscapeKey: function(event) {
      // When escape is pressed, hide ourselves
      if (this._elements.overlay._isTopOverlay()) {
        this._hideOverlay();
      }
    },

    /** @ignore */
    _onGlobalClick: function(event) {
      if (!this._elements.overlay.open) {
        return;
      }

      // makes sure we don't hide ourselves when clicked
      var eventTargetWithinOverlayTarget = this._elements.overlay.contains(event.target);
      var eventTargetWithinItself = this.contains(event.target);
      if (!eventTargetWithinOverlayTarget && !eventTargetWithinItself) {
        this._elements.overlay.open = false;
      }
    },

    /** @private **/
    _onItemAttached: function() {
      this._checkExtended();
    },

    /** @private **/
    _onItemDetached: function() {
      this._checkExtended();
    },

    /** @private */
    _onItemClick: function(event) {
      event.stopImmediatePropagation();
      event.preventDefault();

      var items = this.items.getAll();
      var itemCount = items.length;

      // When we have more than a specified number of items, use the overlay selection. If threshold is 0, then we never
      // show the popover. If there are actions, we always show the popover.
      if (this._isExtended()) {
        // we toggle the overlay if it was already open
        if (this._elements.overlay.open) {
          this._hideOverlay();
        }
        else {
          this._showOverlay();
          // Set focus on selectList item after overlay opened
          this._focusItem(this.selectedItem._elements.selectListItem);
        }
      }
      // Unless this is the only item we have, select the next item in line:
      else if (itemCount > 1) {
        this._selectCycleItem($(this.selectedItem).next().get(0) || items[0]);
        this._focusItem(this._elements.button);
      }
    },

    /** @private */
    _onItemSelected: function(item) {
      if (item) {
        var icon = item.icon;
        this._elements.button.icon = icon;

        // if no icon is available, we set the text so that the button is not completely empty
        if (icon) {
          this._elements.button.label.textContent = '';

          //@a11y
          var ariaLabel = item.content.textContent.replace(WHITESPACE_REGEX, ' ');
          this._elements.button.setAttribute('aria-label', ariaLabel);
          this._elements.button.setAttribute('title', ariaLabel);
        }
        else {
          this._elements.button.label.innerHTML = item.content.innerHTML;

          //@a11y
          this._elements.button.removeAttribute('aria-label');
          this._elements.button.removeAttribute('title');
        }
      }
    },

    /** @private */
    _onSelectListChange: function(event) {
      event.stopImmediatePropagation();
      event.preventDefault();

      var selectListItem = event.detail.selection;
      if (selectListItem) {
        var origNode = selectListItem._elements.originalItem;

        if (!this._isAction(origNode)) {
          this._selectCycleItem(origNode);
          this._focusItem(this._elements.button);

          // Hide the overlay, cleanup will be done before overlay.show()
          this._elements.overlay.hide();
        }
        else {
          this._proxyClick(origNode);
        }
      }
    },

    /** @private */
    _proxyClick: function(item) {
      var event = item.trigger('click');

      if (!event.defaultPrevented) {
        this._elements.overlay.hide();
      }
    },

    /** @private */
    _isAction: function(item) {
      return item.tagName.toLowerCase() === ACTION_TAG_NAME;
    },

    /** @private */
    _isExtended: function() {
      var hasActions = this.actions.getAll().length > 0;
      return (this.threshold > 0 && this.items.getAll().length >= this.threshold) || hasActions;
    },

    /** @private */
    _checkExtended: function() {
      var isExtended = this._isExtended();
      this.$.toggleClass('coral3-CycleButton--extended', isExtended);

      // @a11y
      if (isExtended) {
        var uid = this._elements.selectList.id;
        this._elements.button.setAttribute('aria-owns', uid);
        this._elements.button.setAttribute('aria-controls', uid);
        this._elements.button.setAttribute('aria-haspopup', true);
        this._elements.button.setAttribute('aria-expanded', false);
      }
      else {
        this._elements.button.removeAttribute('aria-owns');
        this._elements.button.removeAttribute('aria-controls');
        this._elements.button.removeAttribute('aria-haspopup');
        this._elements.button.removeAttribute('aria-expanded');
      }
    },

    /** @ignore */
    _focusItem: function(item) {
      if (item) {
        Coral.commons.nextFrame(function() {
          item.focus();
        });
      }
    },

    /** @ignore */
    _hideOverlay: function() {
      // @a11y
      this._elements.button.setAttribute('aria-expanded', false);
      this._elements.overlay.hide();
    },

    /** @ignore */
    _getSelectListItem: function(item) {
      var selectListItem = new Coral.SelectList.Item();

      // If an icon was specified we need to create an element for it and add it directly to the selectList Item
      if (item.icon) {
        var icon = new Coral.Icon().set({
          icon: item.icon,
          size: Coral.Icon.size.SMALL
        });

        selectListItem.content.appendChild(icon);
      }

      selectListItem.content.appendChild(document.createTextNode(item.content.textContent));

      selectListItem._elements.originalItem = item;
      item._elements.selectListItem = selectListItem;

      return selectListItem;
    },

    /** @ignore */
    _populateSelectList: function() {
      var selectList = this._elements.selectList;
      var actionsSelectList = this._elements.actionsSelectList;
      var items = this.items.getAll();
      var actions = this.actions.getAll();
      var itemCount = items.length;
      var actionCount = actions.length;
      var selectListItem;

      // we empty the existing items before populating the lists again
      selectList.items.clear();
      actionsSelectList.items.clear();

      // adds the items to the selectList
      for (var i = 0; i < itemCount; i++) {
        var item = items[i];
        selectListItem = this._getSelectListItem(item);

        // we have set the selected state after attaching otherwise will get
        // Uncaught Error: Coral.SelectList.Item cannot be selected before being added as a child
        selectList.items.add(selectListItem);

        selectListItem.set({
          disabled: item.disabled,
          selected: item.selected
        }, true);
      }

      // adds any additional actions to the actions selectList
      if (actionCount > 0) {
        for (var j = 0; j < actionCount; j++) {
          var action = actions[j];
          selectListItem = this._getSelectListItem(action);

          // we have set the selected state after attaching otherwise will get
          // Uncaught Error: Coral.SelectList.Item cannot be selected before being added as a child
          actionsSelectList.items.add(selectListItem);

          selectListItem.set({
            disabled: action.disabled
          }, true);
        }

        this._elements.actionsSelectList.removeAttribute('hidden');
      }
      else {
        this._elements.actionsSelectList.setAttribute('hidden', true);
      }
    },

    /** @private */
    _selectCycleItem: function(item) {
      item.selected = true;
    },

    /** @ignore */
    _showOverlay: function() {
      // @a11y
      this._elements.button.setAttribute('aria-expanded', true);

      this._populateSelectList();
      this._elements.overlay.show();
    },

    /** @ignore */
    _render: function() {
      // we insert the template before the items
      this.insertBefore(Coral.templates.CycleButton.base.call(this._elements), this.firstChild);

      // assign the target for the overlay
      var overlay = this._elements.overlay;
      overlay.target = this._elements.button;

      // gives the focus back to button once the overlay is closed
      overlay.returnFocusTo(this._elements.button);
    },

    /** @ignore */
    _initialize: function() {
      // @a11y
      this._elements.button.setAttribute('aria-expanded', false);

      // checks the component's extended mode
      this._checkExtended();

      var self = this;
      // handles the initial selected item's icon
      Coral.commons.nextFrame(function() {
        self._onItemSelected(self.selectedItem);
      });
    }

    /**
      Triggered when the selected item has changed.

      @event Coral.CycleButton#coral-cyclebutton:change

      @param {Object} event Event object
      @param {Object} event.detail
      @param {HTMLElement} event.detail.oldSelection
        The prior selected item(s).
      @param {HTMLElement} event.detail.selection
        The newly selected item(s).
    */
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /* @lends Coral.CycleButton.Item# */ {
    /**
      @class Coral.CycleButton.Item
      @classdesc A CycleButton item
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
      @borrows Coral.mixin.selectionList.Item#selected as Coral.CycleButton.Item#selected
      @htmltag coral-cyclebutton-item
    */
    name: 'CycleButton.Item',
    tagName: 'coral-cyclebutton-item',

    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-cyclebutton'
      })
    ],

    properties: {
      /**
        The Item's icon. See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.CycleButton.Item#
      */
      'icon': {
        default: '',
        reflectAttribute: true
      },

      /**
        Item content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.CycleButton.Item#
      */
      'content': {
        contentZone: true,
        get: function() {
          return this;
        },
        set: function() {}
      }
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /* @lends Coral.CycleButton.Action# */ {
    /**
      @class Coral.CycleButton.Action
      @classdesc A CycleButton action
      @extends Coral.Component
      @htmltag coral-cyclebutton-action
    */
    name: 'CycleButton.Action',
    tagName: 'coral-cyclebutton-action',

    properties: {
      /**
        The Action's icon. See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.CycleButton.Action#
      */
      'icon': {
        default: '',
        reflectAttribute: true
      },

      /**
        Action content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.CycleButton.Action#
      */
      'content': {
        contentZone: true,
        get: function() {
          return this;
        },
        set: function() {}
      }
    }
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["CycleButton"] = window["Coral"]["templates"]["CycleButton"] || {};
window["Coral"]["templates"]["CycleButton"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["button"] = document.createElement("button","coral-button");
  el0.setAttribute("handle", "button");
  el0.className += " coral3-CycleButton-button";
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("variant", "quiet");
  el0.setAttribute("iconsize", "S");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["openIcon"] = document.createElement("coral-icon");
  el2.setAttribute("handle", "openIcon");
  el2.setAttribute("icon", "chevronDown");
  el2.setAttribute("size", "xxs");
  el2.className += " coral3-CycleButton-openIcon";
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  frag.appendChild(el0);
  var el4 = document.createTextNode("\n");
  frag.appendChild(el4);
  var el5 = this["overlay"] = document.createElement("coral-overlay");
  el5.setAttribute("handle", "overlay");
  el5.className += " coral3-CycleButton-overlay";
  el5.setAttribute("returnfocus", "on");
  el5.setAttribute("focusonshow", "on");
  el5.setAttribute("trapfocus", "on");
  el5.setAttribute("placement", "bottom");
  var el6 = document.createTextNode("\n  ");
  el5.appendChild(el6);
  var el7 = this["selectList"] = document.createElement("coral-selectlist");
  el7.setAttribute("handle", "selectList");
  el7.id = Coral["commons"]["getUID"]();
  el5.appendChild(el7);
  var el8 = document.createTextNode("\n  ");
  el5.appendChild(el8);
  var el9 = this["actionsSelectList"] = document.createElement("coral-selectlist");
  el9.setAttribute("handle", "actionsSelectList");
  el9.setAttribute("hidden", "");
  el5.appendChild(el9);
  var el10 = document.createTextNode("\n");
  el5.appendChild(el10);
  frag.appendChild(el5);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /** @ignore */
  function toMoment(value, format) {
    if (value === 'today') {
      return moment().startOf('day');
    }
    else if (moment.isMoment(value)) {
      return value.isValid() ? value.clone() : null;
    }
    else {
      // if the value provided is a date it does not make sense to provide a format to parse the date
      var result = moment(value, value instanceof Date ? null : format);
      return result.isValid() ? result : null;
    }
  }

  /**
    Datepicker types.

    @enum {String}
    @memberof Coral.Datepicker
  */
  var type = {
    /** The selection overlay contains only a calendar. */
    DATE: 'date',
    /** Provides both calendar and time controls in the selection overlay. */
    DATETIME: 'datetime',
    /** The selection overlay provides only time controls */
    TIME: 'time'
  };

  // Used to determine if the client is on a mobile device
  var IS_MOBILE_DEVICE = navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) !== null;

  var NATIVE_FORMATS = {
    date: 'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD[T]HH:mmZ',
    time: 'HH:mm'
  };

  Coral.register( /* @lends Coral.Datepicker# */ {
    /**
      @class Coral.Datepicker
      @classdesc A Datepicker component.
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-datepicker
    */
    name: 'Datepicker',
    tagName: 'coral-datepicker',
    className: 'coral-InputGroup',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'click coral-calendar [handle="table"] a': '_onCalendarDayClick',
      'change coral-calendar,coral-clock': '_onChange',
      'coral-overlay:open [handle="popover"]': '_onPopoverOpenOrClose',
      'coral-overlay:close [handle="popover"]': '_onPopoverOpenOrClose'
    },

    properties: {

      /**
        The type of datepicker to show to the user.

        See {@link Coral.Datepicker.type}

        @type {Coral.Datepicker.type}
        @default Coral.Datepicker.type.DATE
        @htmlattribute type
        @memberof Coral.Datepicker#
      */
      'type': {
        default: type.DATE,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(type)
        ],
        sync: function() {
          this._elements.toggle.icon = this.type === type.TIME ? 'clock' : 'calendar';
          this._elements.clockContainer.style.display = this.type !== type.DATE ? '' : 'none';
          this._elements.calendar.style.display = this.type === type.TIME ? 'none' : '';
        },
        alsoSync: ['_useNativeInput']
      },

      /**
        The format used to display the selected date(time) to the user. If the user manually types a date, this format
        will be used to parse the value. When using this component on a mobile device, the display format must follow
        the format used by the native input. The default value depends on the <code>type</code>, which can be one from
        <code>YYYY-MM-DD</code>, <code>YYYY-MM-DD[T]HH:mmZ</code> or <code>HH:mm</code>. If an empty string is provided,
        then the default value per type will be used. See http://momentjs.com/docs/#/displaying/ for valid format string
        options.

        @type {String}
        @default "YYYY-MM-DD"
        @htmlattribute displayformat
        @memberof Coral.Datepicker#
      */
      'displayFormat': {
        attribute: 'displayformat',
        transform: function(value) {
          value = Coral.transform.string(value).trim();
          return value === '' ? NATIVE_FORMATS[this.type] : value;
        },
        get: function() {
          return this._useNativeInput ?
            NATIVE_FORMATS[this.type] :
            (typeof this._displayFormat === 'undefined' ? NATIVE_FORMATS[this.type] : this._displayFormat);
        },
        sync: function() {
          this._elements.input.value = this._getValueAsString(this._value, this.displayFormat);
        }
      },

      /**
        The format to use on expressing the selected date as a string on the <code>value</code> attribute. The value
        will be sent to the server using this format. If an empty string is provided, then the default value per type
        will be used. See http://momentjs.com/docs/#/displaying/ for valid format string options.

        @type {String}
        @default "YYYY-MM-DD"
        @htmlattribute valueformat
        @memberof Coral.Datepicker#
      */
      'valueFormat': {
        attribute: 'valueformat',
        transform: function(value) {
          value = Coral.transform.string(value).trim();
          return value === '' ? NATIVE_FORMATS[this.type] : value;
        },
        get: function() {
          return typeof this._valueFormat === 'undefined' ? NATIVE_FORMATS[this.type] : this._valueFormat;
        },
        set: function(value) {
          this._valueFormat = value;
          this._elements.calendar.valueFormat = value;
          this._elements.hiddenInput.value = this.value;
        }
      },

      /**
        The value of the element, interpreted as a date, or <code>null</code> if conversion is not possible.

        @type {?Date}
        @default null
        @memberof Coral.Datepicker#
      */
      'valueAsDate': {
        attribute: null,
        transform: function(value) {
          return (value instanceof Date) ? moment(value) : '';
        },
        get: function() {
          return this._value ? this._value.toDate() : null;
        },
        set: function(value) {
          this.value = value;
        }
      },

      /**
        The minimum date that the Datepicker will accept as valid. It must not be greated that its maximum. It accepts
        both date and string values. When a string is provided, it should match the {@link Coral.Datepicker#valueFormat}.

        See {@link Coral.Calendar#min}

        @type {?String|?Date}
        @default null
        @htmlattribute min
        @memberof Coral.Datepicker#
      */
      'min': {
        get: function() {
          return this._elements.calendar.min;
        },
        set: function(value) {
          this._elements.calendar.min = value;
        }
      },

      /**
        The maximum date that the Datepicker will accept as valid. It must not be less than its minimum. It accepts both
        date and string values. When a string is provided, it should match the {@link Coral.Datepicker#valueFormat}.

        See {@link Coral.Calendar#max}

        @type {String|?Date}
        @default null
        @htmlattribute max
        @memberof Coral.Datepicker#
      */
      'max': {
        get: function() {
          return this._elements.calendar.max;
        },
        set: function(value) {
          this._elements.calendar.max = value;
        }
      },

      /**
        The format used to display the current month and year. See http://momentjs.com/docs/#/displaying/ for valid
        format string options.

        See {@link Coral.Calendar#startDay}

        @type {String}
        @default "MMMM YYYY"
        @htmlattribute headerformat
        @memberof Coral.Datepicker#
      */
      'headerFormat': Coral.property.proxyAttr({
        handle: 'calendar',
        attribute: 'headerformat'
      }),

      /**
        Defines the start day for the week, 0 = Sunday, 1 = Monday etc., as depicted on the calendar days grid.

        See {@link Coral.Calendar#startDay}

        @type {Number}
        @default 0
        @htmlattribute startday
        @memberof Coral.Datepicker#
      */
      'startDay': Coral.property.proxyAttr({
        handle: 'calendar',
        attribute: 'startday'
      }),

      /**
        The current value. When set to "today", the value is coerced into the client's local date expressed as string
        formatted in accordance to the set <code>valueFormat</code>.

        See {@link Coral.Calendar#value}

        @type {String}
        @default ""
        @fires Coral.mixin.formField#change
        @htmlattribute value
        @memberof Coral.Datepicker#
      */
      'value': {
        transform: function(value) {
          return toMoment(value, this.valueFormat);
        },
        get: function() {
          return this._getValueAsString(this._value, this.valueFormat);
        },
        set: function(value) {
          this._value = value;

          this._elements.calendar.valueAsDate = this.valueAsDate;
          this._elements.clock.valueAsDate = this.valueAsDate;
          this._elements.input.value = this._getValueAsString(this._value, this.displayFormat);
          this._elements.hiddenInput.value = this.value;
        }
      },

      // JSDocs inherited
      'name': {
        get: function(value) {
          return this._elements.hiddenInput.name;
        },
        set: function(value) {
          this._elements.hiddenInput.name = value;
        }
      },

      // JSDocs inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);

          this._elements.input.disabled = this.disabled;
          this._elements.hiddenInput.disabled = this.disabled;
          this._elements.toggle.disabled = this.disabled || this.readOnly;
        }
      },

      // JSDocs inherited
      'invalid': {
        sync: function() {
          var invalid = this.invalid;

          this.$.toggleClass('is-invalid', invalid);
          this._elements.input.invalid = invalid;
          this._elements.input.setAttribute('aria-invalid', invalid);
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function(value) {
          this._elements.input.readOnly = this.readOnly;
          this._elements.toggle.disabled = this.readOnly || this.disabled;
        }
      },

      // JSDocs inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'labelledBy': {
        sync: function() {
          // in case the user focuses the buttons, he will still get a notion of the usage of the component
          if (this.labelledBy) {
            this.setAttribute('aria-labelledby', this.labelledBy);
          }
          else {
            this.removeAttribute('aria-labelledby');
          }
        }
      },

      /**
        Short hint that describes the expected value of the Datepicker. It is displayed when the Datepicker is empty.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.Datepicker#
      */
      'placeholder': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return this._elements.input.placeholder;
        },
        set: function(value) {
          this._elements.input.placeholder = value;
        }
      },

      /**
        `true` when the component does not use a Popup with Calendar, but a native input instead. This occurs when
        `mode` is set to `native`, and when `mode` is set to `auto`, and we detect being on mobile.

        @ignore
      */
      '_useNativeInput': {
        attribute: null,
        sync: function() {
          if (this._useNativeInput) {
            // Switch to native date/time picker:
            this._elements.toggle.hidden = true;
            this._elements.input.setAttribute('type', this.type);

            // Remove pop-over, and related attributes:
            // @todo: This currently breaks Coral.Select:
            //this.removeChild(this._elements.popover);
            this.removeAttribute('aria-haspopup');
            this.removeAttribute('aria-expanded');
            this.removeAttribute('aria-owns');
          }
          else {
            // Switch to CoralUI Calendar picker:
            this._elements.toggle.hidden = false;
            this._elements.input.setAttribute('type', 'text');

            // Attach pop-over, and related attributes:
            if (this._elements.popover.parentNode !== this) {
              this.insertBefore(this._elements.popover, this.firstChild);
            }

            this.setAttribute('aria-haspopup', 'true');
            this.setAttribute('aria-expanded', 'false');
            this.setAttribute('aria-owns', this._elements.popover.id);
          }
        }
      }
    },

    /**
      Sets the correct labellable target.

      @protected
    */
    _getLabellableElement: function() {
      return this._elements.input;
    },

    /** @ignore */
    _render: function() {
      // creates the inner components
      this.appendChild(Coral.templates.Datepicker.base.call(this._elements));

      // creates and stores the contents of the popover
      this._calendarFragment = Coral.templates.Datepicker.popovercontent.call(this._elements);

      // Point at the button from the bottom
      this._elements.popover.target = this._elements.toggle;
    },

    /** @ignore */
    _renderCalendar: function() {
      if (this._elements.popover.content.innerHTML === '') {
        this._elements.popover.content.appendChild(this._calendarFragment);
        this._calendarFragment = undefined;
      }
    },

    /** @ignore */
    _initialize: function() {
      // we only have AUTO mode.
      this._useNativeInput = IS_MOBILE_DEVICE;
      this.setAttribute('role', 'datepicker');
    },

    /** @ignore */
    _onPopoverOpenOrClose: function(event) {

      if (this._elements.popover.open) {
        this._renderCalendar();
      }
      this.setAttribute('aria-expanded', this._elements.popover.open);
    },

    /** @ignore */
    _onCalendarDayClick: function() {
      // since a selection has been made, we close the popover. we cannot use the _onChange listener to handle this
      // because clicking on the same button will not trigger a change event
      this._elements.popover.open = false;
    },

    /** @ignore */
    _onInputChange: function(event) {
      // we need to make sure the event was triggered by our input and not the one inside the clock
      if (event.target === this._elements.input) {
        // because we are reimplementing the form field mix in, we will have to stop the propagation and trigger the
        // 'change' event from here
        event.stopPropagation();

        this.value = moment(event.target.value, this.displayFormat);
        this._validateValue();

        this.trigger('change');
      }
    },

    /** @ignore */
    _onChange: function(event) {
      event.stopPropagation();

      // we create the new value using both calendar and clock controls
      this.value = this._mergeCalendarAndClockDates();
      this._validateValue();

      this.trigger('change');
    },

    /** @ignore */
    _validateValue: function() {
      // check if the current value is valid and update the internal state of the component

      if (this.type === Coral.Datepicker.type.DATE) {
        this.invalid = this._elements.calendar.invalid;
      }
      else if (this.type === Coral.Datepicker.type.TIME) {
        this.invalid = this._elements.clock.invalid;
      }
      else {
        this.invalid = this._elements.calendar.invalid || this._elements.clock.invalid;
      }

    },

    /** @ignore */
    _mergeCalendarAndClockDates: function() {
      var value = moment(this._elements.calendar.valueAsDate);
      var time = this._elements.clock.valueAsDate;
      if (time) {
        if (!value.isValid()) {
          value = moment();
        }

        value.hours(time.getHours());
        value.minutes(time.getMinutes());
      }

      return value;
    },

    /**
      Helper class that converts the internal moment value into a String using the provided date format. If the value is
      invalid, empty string will be returned.

      @param {?Moment} value
        The value representing the date. It has to be a moment object or <code>null</code>
      @param {String} format
        The Date format to be used.

      @ignore
    */
    _getValueAsString: function(value, format) {
      return value && value.isValid() ? value.format(format) : '';
    }
  });

  // Expose enums globally:
  Coral.Datepicker.type = type;
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Datepicker"] = window["Coral"]["templates"]["Datepicker"] || {};
window["Coral"]["templates"]["Datepicker"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["popover"] = document.createElement("coral-popover");
  el0.setAttribute("handle", "popover");
  el0.id = Coral["commons"]["getUID"]();
  el0.setAttribute("alignmy", "right top");
  el0.setAttribute("alignat", "right bottom");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["hiddenInput"] = document.createElement("input");
  el2.setAttribute("type", "hidden");
  el2.setAttribute("handle", "hiddenInput");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["input"] = document.createElement("input","coral-textfield");
  el4.setAttribute("is", "coral-textfield");
  el4.setAttribute("type", "text");
  el4.setAttribute("handle", "input");
  el4.className += " coral-InputGroup-input";
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  var el6 = document.createElement("div");
  el6.className += " coral-InputGroup-button";
  var el7 = document.createTextNode("\n  ");
  el6.appendChild(el7);
  var el8 = this["toggle"] = document.createElement("button","coral-button");
  el8.setAttribute("is", "coral-button");
  el8.setAttribute("type", "button");
  el8.setAttribute("icon", "calendar");
  el8.setAttribute("iconsize", "S");
  el8.setAttribute("handle", "toggle");
  el6.appendChild(el8);
  var el9 = document.createTextNode("\n");
  el6.appendChild(el9);
  frag.appendChild(el6);
  var el10 = document.createTextNode("\n");
  frag.appendChild(el10);
  return frag;
});

window["Coral"]["templates"]["Datepicker"]["popovercontent"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["calendar"] = document.createElement("coral-calendar");
  el0.setAttribute("handle", "calendar");
  el0.className += " u-coral-borderless";
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["clockContainer"] = document.createElement("div");
  el2.className += " coral-Datepicker-clockContainer";
  el2.setAttribute("handle", "clockContainer");
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["clock"] = document.createElement("coral-clock");
  el4.setAttribute("handle", "clock");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var ITEM_TAG_NAME = 'coral-multifield-item';
  var IS_DRAGGING_CLASS = 'is-dragging';
  var IS_AFTER_CLASS = 'is-after';
  var IS_BEFORE_CLASS = 'is-before';

  // Collection
  var MultifieldCollection = function(multiField) {
    this._multiField = multiField;
  };

  // Assigns the prototype to get access to the Collection signature methods
  MultifieldCollection.prototype = Object.create(Coral.Collection.prototype);

  MultifieldCollection.prototype.add = function(item, before) {
    if (!(item instanceof HTMLElement)) {
      var itemObject = item;
      item = document.createElement(ITEM_TAG_NAME);
      item.set(itemObject, true);
    }

    before = before || this._multiField.$.children(ITEM_TAG_NAME).last().next()[0] || this._multiField.firstChild;

    return this._multiField.insertBefore(item, before);
  };

  MultifieldCollection.prototype.getAll = function() {
    return this._multiField.$.children(ITEM_TAG_NAME).toArray();
  };

  Coral.register( /** @lends Coral.Multifield# */ {

    /**
      @class Coral.Multifield
      @classdesc A Multifield component
      @extends Coral.Component
      @htmltag coral-multifield
    */
    name: 'Multifield',
    tagName: 'coral-multifield',
    className: 'coral-Multifield',

    events: {
      'coral-component:attached coral-multifield-item': '_onItemAttached',
      'coral-dragaction:dragstart coral-multifield-item': '_onDragStart',
      'coral-dragaction:drag coral-multifield-item': '_onDrag',
      'coral-dragaction:dragend coral-multifield-item': '_onDragEnd',

      'click [coral-multifield-add]': '_addItem',
      'click [handle=remove]': '_removeItem'
    },

    properties: {
      /**
        The Collection Interface that allows interacting with the Coral.Multifield items that the component contains.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Multifield#
      */
      'items': {
        get: function() {
          if (!this._items) {
            this._items = new MultifieldCollection(this);
          }
          return this._items;
        },
        set: function() {
          // Read-only
        }
      },

      /**
        The Multifield template element. It will be used to render a new item once the an element with the attribute
        <code>coral-multifield-add</code> is clicked. It supports <code>script</code>, <code>template</code> and
        <code>textarea</code> tags. While specifying the the template from markup, it should include the
        <code>coral-multifield-template</code> attribute.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Multifield#
      */
      'template': Coral.property.contentZone({
        handle: 'template',
        set: function(value) {
          // allows non custom elements to behave like a content zone
          if (!value.set) {
            value.set = this._internalTemplateSet;
          }
        }
      })
    },

    /** @ignore */
    _onItemAttached: function(event) {
      var item = event.target;

      // Verifies that the multifield is the parent of the component
      if (item.parentNode !== this) {
        return;
      }

      item.on('coral-component:detached', this._onItemDetached);

      // triggers the collection API event
      this.trigger('coral-collection:add', {
        item: item
      });
    },

    /** @ignore */
    _onItemDetached: function(event) {
      var item = event.target;

      item.off('coral-component:detached', this._onItemDetached);

      // triggers the collection API event
      this.trigger('coral-collection:remove', {
        item: item
      });
    },

    /** @ignore */
    _addItem: function(event) {
      var $parent = $(event.target).parents('coral-multifield');
      if ($parent.length && $parent[0] === this) {
        this.items.add(new Coral.Multifield.Item());

        this.trigger('change');
      }
    },

    /** @ignore */
    _removeItem: function(event) {
      if (event.matchedTarget.parentNode.parentNode === this) {
        event.matchedTarget.parentNode.remove();

        this.trigger('change');
      }
    },

    /** @ignore */
    _onDragStart: function(event) {
      event.detail.dragElement.$
        .addClass(IS_DRAGGING_CLASS)
        .prevAll(ITEM_TAG_NAME).addClass(IS_BEFORE_CLASS)
        .end()
        .nextAll(ITEM_TAG_NAME).addClass(IS_AFTER_CLASS);
    },

    /** @ignore */
    _onDrag: function(event) {
      if (event.target.parentNode === this) {
        this.items.getAll().forEach(function(item) {
          var $item = $(item);

          if (!$item.hasClass(IS_DRAGGING_CLASS)) {
            var $dragElement = event.detail.dragElement.$;
            var isAfter = event.detail.pageY < ($item.offset().top + $item.height() / 2);
            var itemReorderedTop = $dragElement.height() + 8 + 'px';

            $item
              .toggleClass(IS_AFTER_CLASS, isAfter)
              .toggleClass(IS_BEFORE_CLASS, !isAfter);

            if ($item.hasClass(IS_AFTER_CLASS)) {
              $item.css('top', $item.index(ITEM_TAG_NAME) < $dragElement.index(ITEM_TAG_NAME) ? itemReorderedTop : '');
            }

            if ($item.hasClass(IS_BEFORE_CLASS)) {
              var afterDragElement = $item.index(ITEM_TAG_NAME) > $dragElement.index(ITEM_TAG_NAME);
              $item.css('top', afterDragElement ? '-' + itemReorderedTop : '');
            }
          }
        });
      }
    },

    /** @ignore */
    _onDragEnd: function(event) {
      if (event.target.parentNode === this) {
        var $dragElement = event.detail.dragElement.$;
        var $before = this.$.children(ITEM_TAG_NAME + '.' + IS_AFTER_CLASS).first();
        var $after = this.$.children(ITEM_TAG_NAME + '.' + IS_BEFORE_CLASS).last();

        if ($before.length > 0) {
          $dragElement.insertBefore($before);
          this.trigger('change');

          // @polyfill ie
          // attachedCallback and detachedCallback are not called when reordering items on IE
          this._applyPolyfillClass();
        }
        if ($after.length > 0) {
          $dragElement.insertAfter($after);
          this.trigger('change');

          // @polyfill ie
          // attachedCallback and detachedCallback are not called when reordering items on IE
          this._applyPolyfillClass();
        }

        this.items.getAll().forEach(function(item) {
          $(item)
            .removeClass(IS_DRAGGING_CLASS + ' ' + IS_AFTER_CLASS + ' ' + IS_BEFORE_CLASS)
            .css({
              position: '',
              top: ''
            });
        });
      }
    },

    /**
      IE does not recognize CSS3 selectors first-of-type, last-of-type and only-of-type in this case

      @polyfill ie
      @ignore
    */
    _applyPolyfillClass: function() {
      var $items = this.$.children(ITEM_TAG_NAME);
      $items
        .removeClass('first-of-type last-of-type only-of-type')
        .toggleClass('only-of-type', $items.length === 1)
        .first().addClass('first-of-type').end()
        .last().addClass('last-of-type');
    },

    /** @ignore */
    _render: function() {
      // Fetch the template content zone element
      this._elements.template = this.querySelector('[coral-multifield-template]');

      // Create the template content zone elements if not found and add it to the frag
      if (!this._elements.template) {
        // @polyfill IE - using <textarea> as workaround because IE does not support <template> and
        // <script type="text/html"> has rendering issues in Chrome when too much dom is placed before the multifield.
        var template = document.createElement('textarea');
        template.setAttribute('coral-multifield-template', '');
        this._elements.template = this.appendChild(template);
      }

      // allows non custom elements to behave like a content zone
      if (!this._elements.template.set) {
        this._elements.template.set = this._internalTemplateSet;
      }
    },

    /**
      Register a set function that allows the given tag to behave like a Coral.Component. This allows setting values
      using the set notation.

      @param {Object} properties
        An object with key:value pairs of the properties to assign.

      @private
    */
    _internalTemplateSet: function(properties) {
      var property;
      var value;

      // Set a map of properties
      for (property in properties) {
        value = properties[property];

        this[property] = value;
      }
    },

    /** @ignore */
    _initialize: function() {
      this.setAttribute('role', 'list');
      this._onItemDetached = this._onItemDetached.bind(this);
    }

    /**
      Triggered when the items are reordered/added/removed and when item fields are updated.

      @event Coral.Multifield#change

      @param {Object} event
      Event object
    */
  });

  Coral.register( /** @lends Coral.Multifield.Item# */ {

    /**
      @class Coral.Multifield.Item
      @classdesc A Multifield item component
      @extends Coral.Component
      @htmltag coral-multifield-item
    */
    name: 'Multifield.Item',
    tagName: 'coral-multifield-item',
    className: 'coral-Multifield-item',

    properties: {
      /**
        The item content.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Multifield.Item#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-multifield-item-content'
      })
    },

    /** @private */
    attachedCallback: function() {
      if (this.$.parent('coral-multifield').length) {

        var multifield = this._elements.parent = this._elements.parent || this.parentNode;
        var template = multifield.template;

        // @polyfill ie
        multifield._applyPolyfillClass();

        // Insert the template if item content is empty
        if ($(this.content).is(':empty')) {
          // @polyfill IE - support <textarea>, <script type="text/html"> and <template>
          this.content.innerHTML = 'value' in template ? template.value : template.innerHTML;
        }

        // Attach drag events
        if (!this.dragAction) {
          var dragAction = new Coral.DragAction(this);
          dragAction.axis = 'vertical';
          dragAction.handle = this._elements.move;
        }
      }

      Coral.Component.prototype.attachedCallback.call(this);
    },

    /** @private */
    detachedCallback: function() {
      if (this._elements.parent) {
        // @polyfill ie
        this._elements.parent._applyPolyfillClass();
      }

      Coral.Component.prototype.detachedCallback.call(this);
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      // Query/create content element
      var content = this._elements.content = this.querySelector('coral-multifield-item-content') ||
        document.createElement('coral-multifield-item-content');

      fragment.appendChild(content);

      // Move all into the content element
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Add multifield item template
      fragment.appendChild(Coral.templates.Multifield.item.call(this._elements));

      this.appendChild(fragment);
    },

    /** @ignore */
    _initialize: function() {
      this.setAttribute('role', 'listitem');
    }
  });

  Coral.register( /** lends Coral.Multifield.Item.Content# */ {
    /**
      @class Coral.Multifield.Item.Content
      @classdesc The Multifield item content
      @htmltag coral-multifield-item-content
      @extends Coral.Component
    */
    name: 'Multifield.Item.Content',
    tagName: 'coral-multifield-item-content'
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Multifield"] = this["Coral"]["templates"]["Multifield"] || {};
this["Coral"]["templates"]["Multifield"]["item"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["remove"] = document.createElement("button","coral-button");
  el0.setAttribute("type", "button");
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("handle", "remove");
  el0.setAttribute("variant", "quiet");
  el0.setAttribute("icon", "delete");
  el0.setAttribute("iconsize", "S");
  el0.className += " coral-Multifield-remove";
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["move"] = document.createElement("button","coral-button");
  el2.setAttribute("type", "button");
  el2.setAttribute("is", "coral-button");
  el2.setAttribute("handle", "move");
  el2.setAttribute("variant", "quiet");
  el2.setAttribute("icon", "moveUpDown");
  el2.setAttribute("iconsize", "S");
  el2.className += " coral-Multifield-move";
  frag.appendChild(el2);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // @polyfill ie
  var REG_EXP = new RegExp('[^\\d.-]', 'g');

  Coral.register( /** @lends Coral.NumberInput# */ {
    /**
      @class Coral.NumberInput
      @classdesc A NumberInput component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-numberinput
    */
    name: 'NumberInput',
    tagName: 'coral-numberinput',
    className: 'coral-InputGroup',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'key:up': '_onKeyUp',
      'key:pageup': '_onKeyUp',
      'key:down': '_onKeyDown',
      'key:pagedown': '_onKeyDown',
      'key:home': '_onKeyHome',
      'key:end': '_onKeyEnd',

      'click [handle=stepUp]': '_onStepUpButtonClick',
      'click [handle=stepDown]': '_onStepDownButtonClick',

      'mousewheel [handle="$input"]': '_onInputMouseWheel',
      'DOMMouseScroll [handle="$input"]': '_onInputMouseWheel',

      'focusin': '_onFocus',
      'focusout': '_onBlur',

      // @polyfill ie
      'keypress [handle="$input"]': '_onInputKeyPress',
      'paste [handle="$input"]': '_onInputKeyPress'
    },

    properties: {
      // JSDoc inherited
      'value': {
        transform: function(value) {
          return isNaN(value) ? '' : String(value);
        },
        get: function() {
          return this._elements.input.value;
        },
        set: function(value) {
          // sets the value immediately so it is picked up in form submits
          this._elements.input.value = value;
        },
        alsoSync: ['invalid', 'disabled'],
        sync: function() {
          // @a11y: aria-valuetext is used so that VoiceOver does not announce a percentage
          this._elements.input.setAttribute('aria-valuenow', this.value);
          this._elements.input.setAttribute('aria-valuetext', this.value);
        }
      },

      /**
        The value returned as a Number. Value is <code>NaN</code> if conversion to Number is not possible.

        @type {Number}
        @default NaN
        @memberof Coral.NumberInput#
      */
      'valueAsNumber': {
        attribute: null,
        transform: Coral.transform.float,
        get: function() {
          return parseFloat(this.value);
        },
        set: function(value) {
          // sets the value immediately so it is picked up in form submits
          this._elements.input.value = value;

          this._queueSync('value', 'invalid', 'disabled');
        }
      },

      /**
        The minimum value for the NumberInput. If a value below the minimum is set, the NumberInput will be marked as
        invalid but the value will be preserved. Stepping down the NumberInput via {@link Coral.NumberInput#stepDown}
        or the decrement button respects the minimum value. It reflects the <code>min</code> attribute to the DOM.

        @type {?Number}
        @default null
        @htmlattribute min
        @htmlattributereflected
        @memberof Coral.NumberInput#
      */
      'min': {
        default: null,
        reflectAttribute: true,
        transform: Coral.transform.number,
        alsoSync: ['invalid', 'disabled'],
        sync: function() {
          if (this.min === null) {
            this._elements.input.removeAttribute('aria-valuemin');
            this._elements.input.removeAttribute('min');
          }
          else {
            // sets the min in the input so that keyboard handles this component
            this._elements.input.setAttribute('aria-valuemin', this.min);
            this._elements.input.min = this.min;
          }
        }
      },

      /**
        The maximum value for the NumberInput. If a value above the maximum is set, the NumberInput will be marked as
        invalid but the value will be preserved. Stepping up the NumberInput via {@link Coral.NumberInput#stepUp} or
        the increment button respects the maximum value. It reflects the <code>max</code> attribute to the DOM.

        @type {?Number}
        @default null
        @htmlattribute max
        @htmlattributereflected
        @memberof Coral.NumberInput#
      */
      'max': {
        default: null,
        reflectAttribute: true,
        transform: Coral.transform.number,
        alsoSync: ['invalid', 'disabled'],
        sync: function() {
          if (this.max === null) {
            this._elements.input.removeAttribute('aria-valuemax');
            this._elements.input.removeAttribute('max');
          }
          else {
            // sets the max in the input so that keyboard handles this component
            this._elements.input.setAttribute('aria-valuemax', this.max);
            this._elements.input.max = this.max;
          }
        }
      },

      /**
        The amount to increment by when stepping up or down. It only accepts positive values.

        @type {Number}
        @default 1
        @htmlattribute step
        @htmlattributereflected
        @memberof Coral.NumberInput#
      */
      'step': {
        default: 1,
        transform: Coral.transform.number,
        validate: [
          Coral.validate.valueMustChange,
          function(newValue, oldValue) {
            // step value has to be a positive number
            return newValue !== null && newValue > 0;
          }
        ],
        sync: function() {
          this._elements.input.step = this.step;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);

          this._elements.input.disabled = this.disabled;

          this._setButtonState();
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);

          this._elements.input.invalid = this.invalid;
        }
      },

      // JSDoc inherited
      'readOnly': {
        sync: function() {
          this._elements.input.readOnly = this.readOnly;

          this._setButtonState();
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'labelledBy': {
        sync: function() {
          // in case the user focuses the buttons, he will still get a notion of the usage of the component
          this[this.labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.labelledBy);
        }
      },

      /**
        Short hint that describes the expected value of the NumberInput. It is displayed when the NumberInput is empty.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.NumberInput#
      */
      'placeholder': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return this._elements.input.placeholder;
        },
        set: function(value) {
          this._elements.input.placeholder = value;
        }
      }
    },

    /**
      Increments the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
      considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
    */
    stepUp: function() {
      // uses the Number representation since it simplifies the calculations
      var value = this.valueAsNumber;

      if (isNaN(value)) {
        this.value = this.max !== null ? Math.min(this.step, this.max) : this.step;
      }
      else {
        this.value = this.max !== null ? Math.min(value + this.step, this.max) : value + this.step;
      }
    },

    /**
      Decrements the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
      considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
    */
    stepDown: function() {
      // uses the Number representation since it simplifies the calculations
      var value = this.valueAsNumber;

      if (isNaN(value)) {
        this.value = this.min !== null ? Math.max(-this.step, this.min) : -this.step;
      }
      else {
        this.value = this.min !== null ? Math.max(value - this.step, this.min) : value - this.step;
      }
    },

    /**
      Checks if the current NumberInput is valid or not. This is done by checking that the current value is between the
      provided <code>min</code> and <code>max</code> values. This check is only performed on user interaction.

      @ignore
    */
    _validateInputValue: function() {
      this.invalid = this.value !== '' &&
        (this.max !== null && this.value > this.max || this.min !== null && this.value < this.min);
    },

    /**
      Sets the correct state of the buttons based on <code>disabled</code>, <code>min</code>, <code>max</code> and
      <code>readOnly</code> properties.

      @ignore
    */
    _setButtonState: function() {
      this._elements.stepUp.disabled = this.disabled || (this.max !== null && this.value >= this.max) || this.readOnly;
      this._elements.stepDown.disabled = this.disabled || (this.min !== null && this.value <= this.min) || this.readOnly;
    },

    /**
      Triggers a change event. This is only done if the provided values are different.

      @param {String} newValue
        The new value of the component.
      @param {String} oldValue
        The old value of the component.

      @private
    */
    _triggerChange: function(newValue, oldValue) {
      // if the underlaying value stayed the same, there no need to trigger an event
      if (newValue !== oldValue) {
        this.trigger('change');
      }
    },

    /**
      Handles the click on the step up button. It causes the NumberInput to step up its value and returns the focus back
      to the input. This way the clicked button does not get focus.

      @fires Coral.mixin.formField#change
      @ignore
    */
    _onStepUpButtonClick: function(event) {
      event.preventDefault();

      // stores the old value before stepup
      var oldValue = this.value;

      this.stepUp();

      // we only do this on user interaction
      this._validateInputValue();

      // checks if we need to trigger a change event
      this._triggerChange(this.value, oldValue);
    },

    /**
      Handles the click on the step down button. It causes the NumberInput to step down its value and returns the focus
      back to the input. This way the clicked button does not get focus.

      @fires Coral.mixin.formField#change
      @ignore
    */
    _onStepDownButtonClick: function(event) {
      event.preventDefault();

      // stores the old value before stepdown
      var oldValue = this.value;

      this.stepDown();

      // we only do this on user interaction
      this._validateInputValue();

      // checks if we need to trigger a change event
      this._triggerChange(this.value, oldValue);
    },

    /**
      Handles the home key press. If a max has been set, the value will be modified to match it, otherwise the key is
      ignored.

      @ignore
    */
    _onKeyHome: function(event) {
      event.preventDefault();

      // stops interaction if the numberinput is disabled or readonly
      if (this.disabled || this.readOnly) {
        return;
      }

      // sets the max value only if it exists
      if (this.max !== null) {
        // stores the old value before setting the max
        var oldValue = this.value;

        this.value = this.max;

        // checks if we need to trigger a change event
        this._triggerChange(this.value, oldValue);
      }
    },

    /**
      Handles the end key press. If a min has been set, the value will be modified to match it, otherwise the key is
      ignored.

      @ignore
    */
    _onKeyEnd: function(event) {
      event.preventDefault();

      // stops interaction if the numberinput is disabled or readonly
      if (this.disabled || this.readOnly) {
        return;
      }

      // sets the min value only if it exists
      if (this.min !== null) {
        // stores the old value before setting the min
        var oldValue = this.value;

        this.value = this.min;

        // checks if we need to trigger a change event
        this._triggerChange(this.value, oldValue);
      }
    },

    /**
      Handles the up action by steping up the NumberInput. It prevents the default action.

      @ignore
    */
    _onKeyUp: function(event) {
      event.preventDefault();

      // stops interaction if the numberinput is disabled or readonly
      if (this.disabled || this.readOnly) {
        return;
      }

      this._onStepUpButtonClick(event);
    },

    /**
      Handles the down action by steping down the NumberInput. It prevents the default action.

      @ignore
    */
    _onKeyDown: function(event) {
      event.preventDefault();

      // stops interaction if the numberinput is disabled or readonly
      if (this.disabled || this.readOnly) {
        return;
      }

      this._onStepDownButtonClick(event);
    },

    /**
      Handles the Mousewheel to increment/decrement values.

      @ignore
    */
    _onInputMouseWheel: function(event) {
      event.preventDefault();

      // stops interaction if the numberinput is disabled or readonly
      if (this.disabled || this.readOnly) {
        return;
      }

      // stores the old value to calculate the change
      var oldValue = this.value;

      var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail || event.deltaY)));
      if (delta < 0) {
        this.stepDown();
      }
      else {
        this.stepUp();
      }

      // checks if we need to trigger a change event
      this._triggerChange(this.value, oldValue);
    },

    /**
      Overrides the method from formField to be able to add validation after the user has changed the value.

      @private
    */
    _onInputChange: function(event) {
      // stops the current event
      event.stopPropagation();

      // we only do this on user interaction
      this._validateInputValue();

      // we force the sync of the value,invalid and disabled properties
      this._queueSync('value', 'invalid', 'disabled');

      // we always trigger a change since it came from user interaction
      this.trigger('change');
    },

    /**
      Handles focus event.

      @ignore
    */
    _onFocus: function(event) {
      this.$.addClass('is-focused');
      this._elements.$input.addClass('is-focused');
    },

    /**
      Handles blur event.

      @ignore
    */
    _onBlur: function(event) {
      // if the active element is not inside we remove the class
      if (!this.contains(document.activeElement)) {
        this.$.removeClass('is-focused');
        this._elements.$input.removeClass('is-focused');
      }
    },

    /**
      Modified to target the input instead of the button. This is used by the Coral.mixin.formField to be able to
      properly label the component.

      @private
    */
    _getLabellableElement: function() {
      return this._elements.input;
    },

    /**
      Prevents from entering non-digit characters

      @polyfill ie
      @ignore
    */
    _onInputKeyPress: function(event) {
      var newValue = this.value + String.fromCharCode(event.which || event.keyCode);
      if (newValue !== newValue.replace(REG_EXP, '')) {
        event.preventDefault();
      }
    },

    /** @ignore */
    _initialize: function() {
      this.setAttribute('role', 'group');

      this._elements.input.setAttribute('role', 'spinbutton');

      // sets the very initial aria values, in case the 'value' property is never set
      this._elements.input.setAttribute('aria-valuenow', '');
      this._elements.input.setAttribute('aria-valuetext', '');
    },

    /** @ignore */
    _render: function() {
      // clean up
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }

      this.appendChild(Coral.templates.NumberInput.base.call(this._elements));
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["NumberInput"] = this["Coral"]["templates"]["NumberInput"] || {};
this["Coral"]["templates"]["NumberInput"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  data = data_0;
  
  data.uid = Coral.commons.getUID();

  data_0 = data;
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("span");
  el2.className += " coral-InputGroup-button";
  el2.setAttribute("role", "presentation");
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["stepDown"] = document.createElement("button","coral-button");
  el4.setAttribute("type", "button");
  el4.setAttribute("is", "coral-button");
  el4.setAttribute("handle", "stepDown");
  el4.setAttribute("title", "Decrement");
  el4.setAttribute("aria-label", "Decrement");
  el4.setAttribute("icon", "minus");
  el4.setAttribute("iconsize", "XS");
  el4.setAttribute("tabindex", "-1");
  el4.setAttribute("aria-controls", data_0["uid"]);
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = this["input"] = document.createElement("input","coral-textfield");
this["$"+"input"] = $(el7);
  el7.setAttribute("is", "coral-textfield");
  el7.setAttribute("handle", "$input");
  el7.setAttribute("type", "number");
  el7.className += " coral-InputGroup-input";
  el7.id = data_0["uid"];
  frag.appendChild(el7);
  var el8 = document.createTextNode("\n");
  frag.appendChild(el8);
  var el9 = document.createElement("span");
  el9.className += " coral-InputGroup-button";
  el9.setAttribute("role", "presentation");
  var el10 = document.createTextNode("\n  ");
  el9.appendChild(el10);
  var el11 = this["stepUp"] = document.createElement("button","coral-button");
  el11.setAttribute("type", "button");
  el11.setAttribute("is", "coral-button");
  el11.setAttribute("handle", "stepUp");
  el11.setAttribute("title", "Increment");
  el11.setAttribute("aria-label", "Increment");
  el11.setAttribute("icon", "add");
  el11.setAttribute("iconsize", "XS");
  el11.setAttribute("tabindex", "-1");
  el11.setAttribute("aria-controls", data_0["uid"]);
  el9.appendChild(el11);
  var el12 = document.createTextNode("\n");
  el9.appendChild(el12);
  frag.appendChild(el9);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.PanelStack# */ {

    /**
      @class Coral.PanelStack
      @classdesc An PanelStack component
      @htmltag coral-panelstack
      @extends Coral.Component
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#items as Coral.PanelStack#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.PanelStack#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.PanelStack#coral-collection:remove
    */
    name: 'PanelStack',
    tagName: 'coral-panelstack',
    className: 'coral-PanelStack',
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-panel',
        supportMultiple: false,
        forceSelection: false,
        role: 'presentation'
      })
    ],
    properties: {

      /**
        The selected item of the PanelStack.

        @type {HTMLElement}
        @readonly
        @memberof Coral.PanelStack#
      */
      'selectedItem': {
        get: function() {
          return this.items.getLastSelected();
        },
        set: function() {}
      }
    }

    /**
      Triggered when the selected panel has changed.

      @event Coral.PanelStack#coral-panelstack:change

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.selection
        The new selected panel.
      @param {HTMLElement} event.detail.oldSelection
        The prior selected panel.
    */
  });

  Coral.register( /** @lends Coral.Panel */ {
    /**
      @class Coral.Panel
      @classdesc An Item in the PanelStack
      @htmltag coral-panel
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
    */
    name: 'Panel',
    tagName: 'coral-panel',
    className: 'coral-Panel',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-panelstack',
        // removes disabled
        alwaysEnabled: true,
        role: 'tabpanel'
      })
    ],

    properties: {

      /**
        The panelstack items's content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Panel#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-panel-content'
      }),

      /**
        Whether the item is selected. When true, the item will appear as the active element in the PanelStack. The item
        must be a child of a PanelStack before this property is set to true. This property cannot be programmatically set
        to false.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @memberof Coral.Panel#
      */
      'selected': {
        sync: function() {
          this.$.attr('aria-hidden', !this.selected);
        }
      }
    },

    /** @private */
    _render: function() {
      // Create a temporary fragment to hold contents
      var frag = document.createDocumentFragment();

      // Fetch or create the content zone elements
      var content = this._elements.content = this.querySelector('coral-panel-content') ||
        document.createElement('coral-panel-content');

      // Add the content to the fragment
      frag.appendChild(content);

      // Finally, move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Add the fragment to the component
      this.appendChild(frag);
    }
  });

  Coral.register( /** @lends Coral.Panel.Content */ {
    /**
      @class Coral.Panel.Content
      @classdesc A PanelStack Item Content component
      @extends Coral.Component
      @htmltag coral-panel-content
    */
    name: 'Panel.Content',
    tagName: 'coral-panel-content'
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Event: true */
(function() {
  'use strict';

  var BUTTON_GAP = 10; // MUST be kept in sync with quickactions.styl $coral-quickactions-button-gap
  var TRANSLATE_DISTANCE = 5; // MUST be kept in sync with quickactions.styl $coral-quickactions-translate-distance

  /**
    QuickActions interaction values.

    @enum {String}
    @memberof Coral.QuickActions
  */
  var interaction = {
    /** Show when the target is hovered or focused and hide when the mouse is moved out or focus is lost. */
    ON: 'on',
    /** Do not show or hide automatically. */
    OFF: 'off'
  };

  /**
    QuickActions anchored overlay targets.

    @enum {String}
    @memberof Coral.QuickActions
  */
  var target = {
    /** Use the parent element in the DOM. */
    PARENT: '_parent',
    /** Use the previous sibling element in the DOM. */
    PREVIOUS: '_prev',
    /** Use the next sibling element in the DOM. */
    NEXT: '_next'
  };

  /**
    QuickActions placement values.

    @enum {String}
    @memberof Coral.QuickActions
  */
  var placement = {
    /** QuickActions inset to the top of the target. */
    TOP: 'top',
    /** QuickActions inset to the center of the target. */
    CENTER: 'center',
    /** QuickActions inset to the bottom the target. */
    BOTTOM: 'bottom'
  };


  Coral.register( /* @lends Coral.QuickActions# */ {
    /**
      @class Coral.QuickActions
      @extends Coral.Component
      @extends Coral.Overlay
      @classdesc A QuickActions component.
      @htmltag coral-quickactions
    */
    name: 'QuickActions',
    tagName: 'coral-quickactions',
    className: 'coral-QuickActions',
    extend: Coral.Overlay,

    /** @protected */
    _overlayAnimationTime: Coral.mixin.overlay.FADETIME,

    events: {
      'global:resize': '_onWindowResize',
      'mouseout': '_onMouseOut',
      'capture:blur': '_onBlur',
      'global:click': '_onGlobalClick',

      // Keyboard interaction
      'global:key:escape': '_onEscapeKeypress',
      'key:home > .coral-QuickActions-button': '_onHomeKeypress',
      'key:end > .coral-QuickActions-button': '_onEndKeypress',
      'key:pagedown > .coral-QuickActions-button': '_onButtonKeypressNext',
      'key:right > .coral-QuickActions-button': '_onButtonKeypressNext',
      'key:down > .coral-QuickActions-button': '_onButtonKeypressNext',
      'key:pageup > .coral-QuickActions-button': '_onButtonKeypressPrevious',
      'key:left > .coral-QuickActions-button': '_onButtonKeypressPrevious',
      'key:up > .coral-QuickActions-button': '_onButtonKeypressPrevious',

      // Buttons
      'click > .coral-QuickActions-button:not([handle="moreButton"])': '_onButtonClick',

      // Overlay
      'coral-overlay:beforeopen': '_onOverlayBeforeOpen',
      'coral-overlay:beforeclose': '_onOverlayBeforeClose',
      'coral-overlay:open': '_onOverlayOpen',
      'coral-overlay:close': '_onOverlayClose',
      'coral-overlay:positioned': '_onOverlayPositioned',

      // ButtonList
      'click [coral-list-item]': '_onButtonListItemClick',

      // Items
      'coral-component:attached coral-quickactions-item': '_onItemAttached',
      'coral-quickactions-item:_contentchanged': '_onItemUpdate',
      'coral-quickactions-item:_iconchanged': '_onItemUpdate'
    },

    properties: {
      /**
        The Item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.QuickActions#
      */
      'items': {
        get: function() {
          // Construct the collection on first request
          if (!this._items) {
            this._items = new Coral.Collection({
              itemTagName: 'coral-quickactions-item',
              itemSelector: 'coral-quickactions-item',
              host: this
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        The number of items that are visible in QuickActions (excluding the show more actions button)
        before a collapse is enforced.
        A value <= 0 disables this feature and shows as many items as possible.
        Regardless of this property, the QuickActions will still fit within their target's width.

        @type {Number}
        @default 4
        @htmlattribute threshold
        @memberof Coral.QuickActions#
      */
      'threshold': {
        default: 4,
        reflectAttribute: true,
        attribute: 'threshold',
        transform: Coral.transform.number
      },

      // JSDoc inherited
      'target': {
        set: function(value) {
          var self = this;
          var target = this._getTarget(value);
          var targetHasChanged = (target !== self._previousTarget);

          if (target && targetHasChanged) {
            // Remove listeners from the previous target
            if (self._previousTarget) {
              var previousTarget = self._getTarget(self._previousTarget);
              if (previousTarget) {
                self._removeTargetEventListeners(previousTarget);
                target.removeAttribute('aria-haspopup');
                target.removeAttribute('aria-owns');
              }
            }

            // Set up listeners for the new target
            self._addTargetEventListeners();

            // Mark the target as owning a popup
            target.setAttribute('aria-haspopup', 'true');
            var ariaOwns = target.getAttribute('aria-owns');
            ariaOwns = (ariaOwns && ariaOwns.length) ? ariaOwns.trim() + ' ' + this.id : this.id;
            target.setAttribute('aria-owns', ariaOwns);

            // Cache for use as previous target
            self._previousTarget = target;
          }
        }
      },

      /**
        Whether the QuickActions should show when the target is interacted with.

        @type {Coral.QuickActions.interaction}
        @default Coral.QuickActions.interaction.ON
        @name interaction
        @htmlattribute interaction
        @memberof Coral.QuickActions#
      */
      'interaction': {
        default: interaction.ON,
        set: function(value) {
          this._interaction = value;

          if (value === interaction.ON) {
            this._addTargetEventListeners();
          }
          else {
            this._removeTargetEventListeners();
          }
        }
      },

      /**
        The point on the QuickActions overlay we should anchor from when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.CENTER_TOP
        @htmlattribute alignmy
        @memberof Coral.QuickActions#
       */
      'alignMy': {
        default: Coral.Overlay.align.CENTER_TOP
      },

      /**
        The point on the target we should anchor to when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.CENTER_TOP
        @htmlattribute alignat
        @memberof Coral.QuickActions#
       */
      'alignAt': {
        default: Coral.Overlay.align.CENTER_TOP
      },

      /**
        The distance the QuickActions should be from the target.

        @type {Number}
        @default 10
        @htmlattribute offset
        @memberof Coral.QuickActions#
      */
      'offset': {
        default: 10
      },

      /**
        The placement of the QuickActions. This property sets {@link Coral.Overlay#alignMy} and
        {@link Coral.Overlay#alignAt}. The value may be one of 'top', 'center' and 'bottom' and indicates the vertical
        alignment of the QuickActions relative to their container.

        @type {Coral.Overlay.placement}
        @default null
        @htmlattribute placement
        @memberof Coral.QuickActions#
      */
      'placement': {
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(placement)
        ],
        set: function(value) {
          var alignValues = this._placementAlignValues[value];

          this.alignMy = alignValues.alignMy;
          this.alignAt = alignValues.alignAt;

          this._placement = value;
        }
      },

      // JSDoc inherited
      'open': {
        sync: function() {
          var self = this;

          if (this.open && !this._openedBefore) {
            // Sync all items which were ignored in the _onItemAttached listener (in order to reduce the initial page
            // loading overhead)
            var items = this.querySelectorAll('coral-quickactions-item');
            for (var i = 0; i < items.length; i++) {
              this._attachItem(items[i]);
            }
            this._openedBefore = true;
          }

          var resetMargin = function() {
            // Reset margin following animation
            self.style['marginTop'] = '';
          };

          if (self.open) {
            clearTimeout(this._slideTimeout);
            resetMargin();

            self._layout();

            // We must do the following only after a _layout() otherwise the margin will be considered in the position
            // calculation. We do not want this as we use it to get a sensible starting point for the slide animation.
            self.style['marginTop'] = -TRANSLATE_DISTANCE + 'px';

            Coral.commons.nextFrame(function() {
              // The QuickActions must be visible for us to be able to focus them,
              // this may not be the case if we initially open them, due to the FOUC handling.
              self.style.visibility = 'visible';
              self.focus();
            });
          }
          else {
            Coral.commons.nextFrame(function() {
              if (self._overlayAnimationTime) {
                self._slideTimeout = setTimeout(resetMargin, self._overlayAnimationTime);
              }
              else {
                resetMargin();
              }
            });
          }

          var $target = $(this._getTarget());
          $target.toggleClass('is-selected', this.open);
        }
      }
    },

    /** @ignore */
    focus: function() {
      var firstFocusableButton = this._getFirstFocusableButton();
      if (firstFocusableButton) {
        firstFocusableButton.focus();
      }
    },

    /** @ignore */
    attachedCallback: function() {
      var self = this;

      Coral.Component.prototype.attachedCallback.call(self);
      // We can only take '_prev' or '_next' as target once we've attached
      self.target = self.target;
    },

    /** @ignore */
    _getTarget: function(targetValue) {
      // Use passed target
      targetValue = targetValue || this.target;

      if (targetValue instanceof Node) {
        // Just return the provided Node
        return targetValue;
      }

      // Dynamically get the target node based on target
      var newTarget = null;
      if (typeof targetValue === 'string') {
        if (targetValue === target.PARENT) {
          newTarget = this.parentNode;
        }
        else {
          // Delegate to Coral.Overlay for _prev, _next and general selector
          newTarget = Coral.Overlay.prototype._getTarget.call(this, targetValue);
        }
      }

      return newTarget;
    },

    /** @ignore */
    _addTargetEventListeners: function(target) {
      var self = this;
      var targetElement = (target) ? target : self._getTarget();

      if (!targetElement) {
        return;
      }

      // Interaction-sensitive listeners
      if (self.interaction === interaction.ON) {
        // We do not have to worry about the EventListener being called twice as duplicates are discarded
        targetElement.addEventListener('mouseenter', self._onTargetMouseEnter);
        targetElement.addEventListener('keyup', self._onTargetKeyUp);
        targetElement.addEventListener('keydown', self._onTargetKeyDown);
        targetElement.addEventListener('mouseleave', self._onTargetMouseLeave);
      }
    },

    /** @ignore */
    _removeTargetEventListeners: function(target) {
      var targetElement = (target) ? target : this._getTarget();

      if (!targetElement) {
        return;
      }

      targetElement.removeEventListener('mouseenter', this._onTargetMouseEnter);
      targetElement.removeEventListener('keyup', this._onTargetKeyUp);
      targetElement.removeEventListener('keydown', this._onTargetKeyDown);
      targetElement.removeEventListener('mouseleave', this._onTargetMouseLeave);
    },

    /**
      Toggles whether or not an item is tabbable.

      @param {HTMLElement} item
        The item to process.

      @param {Boolean} tabbable
        Whether the item should be marked tabbable.
      @ignore
    */
    _toggleTabbable: function(item, tabbable) {
      if (item) {
        if (tabbable) {
          if (item.hasAttribute('tabIndex')) {
            item.removeAttribute('tabIndex');
          }
        }
        else {
          item.setAttribute('tabIndex', '-1');
        }
      }
    },

    /**
      Gets the subsequent or previous focusable neighbour relative to an Item button.

      @param {HTMLElement} current
        The current button element from which to find the next selectable neighbour.
      @param {Boolean} [previous]
        Whether to look for a previous neighbour rather than a subsequent one.
      @returns {HTMLElement|undefined}
        The focusable neighbour. Undefined if no suitable neighbour found.
      @ignore
    */
    _getFocusableNeighbour: function(current, previous) {
      var focusableButtons = this._getFocusableButtons();
      var index = focusableButtons.indexOf(current);

      if (index >= 0) {
        if (!previous) {
          // Pick the next focusable button
          if (index < focusableButtons.length - 1) {
            return focusableButtons[index + 1];
          }
        }
        else {
          // Pick the previous focusable button
          if (index !== 0) {
            return focusableButtons[index - 1];
          }
        }
      }
    },

    /**
      Gets the buttons, optionally excluding the more button.

      @param {Boolean} excludeMore
        Whether to exclude the more button.
      @returns {NodeList}
        The buttons.
      @ignore
    */
    _getButtons: function(excludeMore) {
      var buttonSelector = '.coral-QuickActions-button';
      buttonSelector = (excludeMore) ? buttonSelector + ':not([handle="moreButton"])' : buttonSelector;

      return this.querySelectorAll(buttonSelector);
    },

    /** @ignore */
    _getFocusableButtons: function() {
      var focusableButtons = [];
      var buttons = this._getButtons();

      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        if (!button.hasAttribute('disabled') &&
          $(button).is(':focusable')) {
          focusableButtons.push(button);
        }
      }

      return focusableButtons;
    },

    /**
      Gets the first focusable button.

      @returns {HTMLElement|undefined}
        The first focusable button, undefined if none found.
      @ignore
    */
    _getFirstFocusableButton: function() {
      var focusableButtons = this._getFocusableButtons();

      return (focusableButtons.length !== 0) ? focusableButtons[0] : undefined;
    },

    /** @ignore */
    _proxyClick: function(item) {
      var event = item.trigger('click');

      if (!event.defaultPrevented && this.interaction === interaction.ON) {
        this.hide();
      }
    },

    /**
      Gets data from an Item.

      @param {HTMLElement} item
        The Item to get the data from.
      @returns {Object}
        The Item data.
      @ignore
    */
    _getItemData: function(item) {
      return {
        content: item.textContent,
        icon: item.getAttribute('icon')
      };
    },

    /** @ignore */
    _attachItem: function(item) {
      var items = this.items.getAll();
      var itemData = this._getItemData(item);
      var index = Array.prototype.indexOf.call(items, item);

      // Button
      var button = item._elements.button || new Coral.Button();
      button.set({
        icon: itemData.icon,
        iconsize: 'S',
        type: 'button'
      }, true);

      button.className += ' coral-QuickActions-button';
      button.setAttribute('tabindex', '-1');
      button.setAttribute('title', itemData.content);
      button.setAttribute('aria-label', itemData.content);
      button.setAttribute('role', 'menuitem');

      // 'insertBefore' with an undefined "before" argument fails on IE
      this.insertBefore(button, this.children[index] || null);

      // ButtonList Item
      var buttonListItem = item._elements.buttonListItem || new Coral.ButtonList.Item();
      var buttonListItemParent = this._elements.buttonList;

      // 'insertBefore' with an undefined "before" argument fails on IE
      buttonListItemParent.insertBefore(buttonListItem, buttonListItemParent.children[index] || null);
      buttonListItem.tabIndex = -1;
      buttonListItem.content.innerHTML = itemData.content;

      if (itemData.icon) {
        buttonListItem.icon = itemData.icon;
      }

      item._elements.button = button;
      item._elements.buttonListItem = buttonListItem;
      buttonListItem._elements.quickActionsItem = item;
      button._elements.quickActionsItem = item;

      item.on('coral-component:detached', this._onItemDetached);
    },

    /** @ignore */
    _detachItem: function(item) {
      // Remove the associated Button and ButtonList elements
      if (item._elements.button) {
        item._elements.button.remove();
        $(item._elements.button).removeData('quickActionsItem');
      }

      if (item._elements.buttonListItem) {
        item._elements.buttonListItem.remove();
        item._elements.buttonListItem._elements.quickActionsItem = null;
      }

      item.off('coral-component:detached', this._onItemDetached);
    },

    /**
      Layout calculation; collapses QuickActions as necessary.
    */
    _layout: function() {
      // Set the width of the QuickActions to match that of the target
      this._setWidth();

      var display = this.style.display;

      // Temporarily display the QuickActions so we can do the calculation
      if (!this.open) {
        this.style.left -= 10000;
        this.style.top -= 10000;
        this.style.display = 'block';
      }

      var buttons = this._getButtons(true);
      var buttonListItems = this._elements.buttonList.items.getAll();

      if (!buttons.length) {
        return;
      }

      var totalAvailableWidth = this.offsetWidth - BUTTON_GAP;
      var buttonMinWidth = window.getComputedStyle(buttons[0], null).getPropertyValue('min-width');
      var buttonWidth = Math.round(parseFloat(buttonMinWidth, 10));
      var buttonOuterWidth = buttonWidth + BUTTON_GAP;
      var totalFittingButtons = 0;
      var widthUsed = 0;

      while (totalAvailableWidth > widthUsed) {
        widthUsed += buttonOuterWidth;

        if (totalAvailableWidth > widthUsed) {
          totalFittingButtons++;
        }
      }

      var handleThreshold = this.threshold > 0;
      var moreButtonsThanThreshold = handleThreshold && (buttons.length > this.threshold);
      var collapse = buttons.length > totalFittingButtons || moreButtonsThanThreshold;

      // +1 to account for the more button
      var collapseToThreshold = collapse && handleThreshold && (this.threshold + 1 < totalFittingButtons);
      var totalButtons = (collapse) ?
        ((collapseToThreshold) ? this.threshold + 1 : totalFittingButtons) : buttons.length;

      // Show all Buttons and ButtonList Items
      for (var i = 0; i < buttons.length; i++) {
        this._toggleTabbable(buttons[i], false);
        buttons[i].show();
        buttonListItems[i].show();
      }

      this._toggleTabbable(this._elements.moreButton, false);

      if (collapse) {
        if (totalButtons > 0) {
          // Hide the buttons we're collapsing
          for (var j = totalButtons - 1; j < buttons.length; j++) {
            buttons[j].hide();
          }

          // Hide the ButtonList items
          for (var k = 0; k < totalButtons - 1; k++) {
            buttonListItems[k].hide();
          }

          // Mark the first button as tabbable
          this._toggleTabbable(buttons[0], true);
        }
        else {
          this._toggleTabbable(this._elements.moreButton, true);
        }

        this._elements.moreButton.show();
      }
      else {
        // Mark the first button as tabbable
        this._toggleTabbable(buttons[0], true);
        this._elements.moreButton.hide();
      }

      // Center the buttons horizontally
      var totalButtonWidth = totalButtons * buttonOuterWidth;
      var shift = Math.round((totalAvailableWidth - totalButtonWidth) / 2);
      this.style['paddingLeft'] = shift + 'px';

      // Reset the QuickActions display if necessary
      if (!this.open) {
        this.style.left += 10000;
        this.style.top += 10000;
        this.style.display = display;
      }

      // Do a reposition of the overlay
      this._position();
    },

    /**
      Sets the width of QuickActions from the target.

      @ignore
    */
    _setWidth: function() {
      var target = this._getTarget();

      if (target) {
        this.style.width = target.offsetWidth + 'px';
      }
    },

    /** @ignore */
    _setButtonListHeight: function() {
      // Set height of ButtonList
      this._elements.buttonList.style.height = '';

      // Measure actual height
      var style = window.getComputedStyle(this._elements.buttonList);
      var height = parseInt(style.height, 10);
      var maxHeight = parseInt(style.maxHeight, 10);

      if (height < maxHeight) {
        // Make it scrollable
        this._elements.buttonList.style.height = height - 1 + 'px';
      }
    },

    /** @ignore */
    _isInternalToComponent: function(element) {
      var target = this._getTarget();

      return element && (this.contains(element) || (target && target.contains(element)));
    },

    /** @ignore */
    _onWindowResize: function() {
      this._layout();
    },

    /** @ignore */
    _onMouseOut: function(event) {
      var toElement = event.toElement || event.relatedTarget;

      // Hide if we mouse leave to any element external to the component and its target
      if (!this._isInternalToComponent(toElement) && this.interaction === interaction.ON) {
        this.hide();
      }
    },

    /** @ignore */
    _onBlur: function(event) {
      var self = this;
      var toElement = event.toElement || event.relatedTarget;

      if (this.interaction === interaction.ON) {
        // In FF toElement is not available to us so we test the newly-focused element
        if (!toElement) {
          // The active element is not ready until the next frame
          Coral.commons.nextFrame(function() {
            toElement = document.activeElement;

            if (!self._isInternalToComponent(toElement)) {
              self.hide();
            }
          });
        }
        else {
          // Hide if we focus out to any element external to the component and its target
          if (!self._isInternalToComponent(toElement)) {
            this.hide();
          }
        }
      }
    },

    /** @ignore */
    _onTargetMouseEnter: function(event) {
      var fromElement = event.fromElement || event.relatedTarget;

      // Open if we aren't already
      if (!this.open && !this._isInternalToComponent(fromElement)) {
        this.show();
      }
    },

    /** @ignore */
    _onTargetKeyUp: function(event) {
      var keyCode = event.keyCode;

      // shift + F10 or ctrl + space (http://www.w3.org/WAI/PF/aria-practices/#popupmenu)
      if (event.shiftKey && keyCode === 121 || event.ctrlKey && keyCode === 32) {
        if (!this.open) {
          if (this.interaction === interaction.ON) {
            // Launched via keyboard and interaction enabled implies a focus trap and return focus.
            // Remember the relevant properties and return their values on hide.
            this._previousTrapFocus = this.trapFocus;
            this._previousReturnFocus = this.returnFocus;
            this.trapFocus = Coral.mixin.overlay.trapFocus.ON;
            this.returnFocus = Coral.mixin.overlay.returnFocus.ON;
          }

          this.show();
        }
      }
    },

    _onTargetKeyDown: function(event) {
      var keyCode = event.keyCode;

      // shift + F10 or ctrl + space (http://www.w3.org/WAI/PF/aria-practices/#popupmenu)
      if (event.shiftKey && keyCode === 121 || event.ctrlKey && keyCode === 32) {
        // Prevent default context menu show or page scroll behaviour
        event.preventDefault();
      }
    },

    /** @ignore */
    _onTargetMouseLeave: function(event) {
      var toElement = event.toElement || event.relatedTarget;

      // Do not hide if we entered the quick actions
      if (!this._isInternalToComponent(toElement)) {
        this.hide();
      }
    },

    /** @ignore */
    _onEscapeKeypress: function(event) {
      if (this.interaction !== interaction.ON) {
        return;
      }

      if (this._elements.overlay.open && this._elements.overlay._isTopOverlay()) {
        this._elements.overlay.hide();
      }
      else if (this.open && this._isTopOverlay()) {
        this.hide();
      }
    },

    /** @ignore */
    _onHomeKeypress: function(event) {
      // prevents the page from scrolling
      event.preventDefault();

      var firstFocusableButton = this._getFirstFocusableButton();

      // Jump focus to the first focusable button
      if (firstFocusableButton) {
        firstFocusableButton.focus();
      }
    },

    /** @ignore */
    _onEndKeypress: function(event) {
      // prevents the page from scrolling
      event.preventDefault();

      var focusableButtons = this._getFocusableButtons();
      var lastFocusableButton = focusableButtons[focusableButtons.length - 1];

      // Jump focus to the last focusable button
      if (lastFocusableButton) {
        lastFocusableButton.focus();
      }
    },

    /** @ignore */
    _onButtonKeypressNext: function(event) {
      event.preventDefault();

      // Handle key presses that imply focus of the next focusable button
      var nextButton = this._getFocusableNeighbour(event.matchedTarget);
      if (nextButton) {
        nextButton.focus();
      }
    },

    /** @ignore */
    _onButtonKeypressPrevious: function(event) {
      event.preventDefault();

      // Handle key presses that imply focus of the previous focusable button
      var previousButton = this._getFocusableNeighbour(event.matchedTarget, true);
      if (previousButton) {
        previousButton.focus();
      }
    },

    /** @ignore */
    _onButtonClick: function(event) {
      var self = this;

      event.stopPropagation();

      if (self._preventClick) {
        return;
      }

      var button = event.matchedTarget;
      var item = button._elements.quickActionsItem;
      self._proxyClick(item);

      // Prevent double click or alternate selection during animation
      setTimeout(function() {
        self._preventClick = false;
      }, self._overlayAnimationTime);

      self._preventClick = true;
    },

    /** @ignore */
    _onGlobalClick: function(event) {
      if (this._elements.moreButton.contains(event.target)) {
        this._elements.overlay.open = !this._elements.overlay.open;
      }
      else {
        var withinOverlay = this._elements.overlay.contains(event.target);

        if (!withinOverlay) {
          this._elements.overlay.open = false;
        }
      }
    },

    /** @ignore */
    _onOverlayBeforeOpen: function(event) {
      if (event.target === this) {
        // Reset double-click prevention flag
        this._preventClick = false;
        this._layout();
      }
      else if (event.target === this._elements.overlay) {
        // Don't allow internal Overlay events to escape QuickActions
        event.stopImmediatePropagation();
        this._setButtonListHeight();
      }
    },

    /** @ignore */
    _onOverlayBeforeClose: function(event) {
      if (event.target === this._elements.overlay) {
        // Don't allow internal Overlay events to escape QuickActions
        event.stopImmediatePropagation();
      }
    },

    /** @ignore */
    _onOverlayOpen: function(event) {
      var self = this;

      if (event.target === this._elements.overlay) {
        // Don't allow internal Overlay events to escape QuickActions
        event.stopImmediatePropagation();

        Coral.commons.nextFrame(function() {
          var focusableItems = self._elements.buttonList.items.getAll().filter(function(item) {
            return !item.hasAttribute('hidden') && !item.hasAttribute('disabled');
          });

          if (focusableItems.length > 0) {
            focusableItems[0].focus();
          }
        });
      }
    },

    /** @ignore */
    _onOverlayClose: function(event) {
      var self = this;

      if (event.target === self) {
        self._elements.overlay.open = false;

        // Return the trapFocus and returnFocus properties to their state before open.
        // Handles the keyboard launch and interaction enabled case, which implies focus trap and focus return.
        // Wait a frame as this is called before the 'open' property sync. Otherwise, returnFocus is set prematurely.
        Coral.commons.nextFrame(function() {
          if (self._previousTrapFocus) {
            self.trapFocus = self._previousTrapFocus;
            self._previousTrapFocus = undefined;
          }

          if (self._previousReturnFocus) {
            self.returnFocus = self._previousReturnFocus;
            self._previousReturnFocus = undefined;
          }
        });
      }
      else if (event.target === self._elements.overlay) {
        // Don't allow internal Overlay events to escape QuickActions
        event.stopImmediatePropagation();
      }
    },

    /** @ignore */
    _onOverlayPositioned: function(event) {
      this.style.maxWidth = 'none';

      if (event.target === this._elements.overlay) {
        // Don't allow internal Overlay events to escape QuickActions
        event.stopImmediatePropagation();
      }
    },

    /** @ignore */
    _onButtonListItemClick: function(event) {
      var self = this;

      // Stops propagation so that this event remains internal to the component
      event.stopImmediatePropagation();

      var buttonListItem = event.matchedTarget;

      if (!buttonListItem) {
        return;
      }

      var item = buttonListItem._elements.quickActionsItem;
      self._proxyClick(item);
    },

    /** @ignore */
    _onItemAttached: function(event) {
      // Delay sync if the component has not been opened before
      // Ignore events bubbling from deeper descendants
      if (!this._openedBefore || event.target !== event.matchedTarget) {
        return;
      }

      this._attachItem(event.target);
      this._layout();
    },

    /** @ignore */
    _onItemDetached: function(event) {
      // Delay sync if the component has not been opened before
      // Ignore events bubbling from deeper descendants
      if (!this._openedBefore || event.eventPhase !== Event.AT_TARGET) {
        return;
      }

      var item = event.target;
      this._detachItem(item);
      this._layout();
    },

    /** @ignore */
    _onItemUpdate: function(event) {
      // Stops propagation so that this event remains internal to the component
      event.stopImmediatePropagation();

      var item = event.target;

      this._updateItem(item);
    },

    /** @ignore */
    _updateItem: function(item) {
      var itemData = this._getItemData(item);

      if (item._elements.button) {
        var button = item._elements.button;
        button.icon = itemData.icon;
        button.setAttribute('title', itemData.content);
        button.setAttribute('aria-label', itemData.content);
      }

      if (item._elements.buttonListItem) {
        var buttonListItem = item._elements.buttonListItem;

        buttonListItem.content.innerHTML = itemData.content;

        if (itemData.icon) {
          buttonListItem.icon = itemData.icon;
        }
      }
    },

    /** @ignore */
    _render: function() {
      // Get an id for distinguishing QuickActions on a single target
      this.id = this.id || Coral.commons.getUID();

      // Render the base layout
      // 'insertBefore' with an undefined "before" argument fails on IE
      this.insertBefore(Coral.templates.QuickActions.base.call(this._elements), this.firstElementChild || null);

      // Append the overlay content
      this._elements.overlay.appendChild(Coral.templates.QuickActions.overlaycontent.call(this._elements));

      // Cache bound event handler functions
      this._onTargetMouseEnter = this._onTargetMouseEnter.bind(this);
      this._onTargetKeyUp = this._onTargetKeyUp.bind(this);
      this._onTargetMouseLeave = this._onTargetMouseLeave.bind(this);
      this._onItemDetached = this._onItemDetached.bind(this);
    },

    /** @ignore */
    _initialize: function() {
      this._openedBefore = false;

      // Make QuickActions focusable
      this.setAttribute('tabIndex', '-1');

      this.setAttribute('role', 'menu');
    },

    /**
      A map of placement values to their corresponding alignMy and alignAt values. It overrides the default mapping
      provided by Coral.Overlay.

      @ignore
    */
    _placementAlignValues: {
      'top': {
        alignMy: 'center top',
        alignAt: 'center top'
      },
      'center': {
        alignMy: 'center center',
        alignAt: 'center center'
      },
      'bottom': {
        alignMy: 'center bottom',
        alignAt: 'center bottom'
      }
    }
  });

  // Expose enums globally
  Coral.QuickActions.target = target;
  Coral.QuickActions.interaction = interaction;
  Coral.QuickActions.placement = placement;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.QuickActions.Item# */ {
    /**
      @class Coral.QuickActions.Item
      @extends Coral.Component
      @classdesc A QuickActions Item.
      @htmltag coral-quickactions-item
    */
    name: 'QuickActions.Item',
    tagName: 'coral-quickactions-item',

    properties: {
      /**
        The Item's content zone.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.QuickActions.Item#
      */
      'content': {
        contentZone: true,
        get: function() {
          return this;
        },
        set: function() {}
      },

      /**
        Specifies the name of the icon to be shown in the QuickActions Item. See {@link Coral.Icon} for valid icon
        names.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @fires coral-quickactions-item:_iconchanged
        @memberof Coral.QuickActions.Item#

        @see {@link Coral.Icon}
      */
      'icon': {
        default: '',
        reflectAttribute: true,
        transform: Coral.transform.string,
        trigger: 'coral-quickactions-item:_iconchanged'
      }
    },

    /**
      Handles mutations on the Item.

      @fires coral-quickactions-item:_contentchanged

      @private
    */
    _onMutation: function() {
      this.trigger('coral-quickactions-item:_contentchanged');
    },

    /** @ignore */
    _initialize: function() {
      this._observer = new MutationObserver(this._onMutation.bind(this));
      this._observer.observe(this, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }

    /**
      Triggered when an icon of an item was changed.

      @event Coral.QuickActions.Item#coral-quickactions-item:_iconchanged

      @param {Object} event Event object
      @private
    */

    /**
      Triggered when the content of an item was changed.

      @event Coral.QuickActions.Item#coral-quickactions-item:_contentchanged

      @param {Object} event Event object
      @private
    */

  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["QuickActions"] = this["Coral"]["templates"]["QuickActions"] || {};
this["Coral"]["templates"]["QuickActions"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["moreButton"] = document.createElement("button","coral-button");
  el0.className += " coral-QuickActions-button";
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("type", "button");
  el0.setAttribute("icon", "more");
  el0.setAttribute("iconsize", "S");
  el0.setAttribute("handle", "moreButton");
  el0.setAttribute("title", "More actions");
  el0.setAttribute("role", "menuitem");
  el0.setAttribute("aria-haspopup", "true");
  el0.setAttribute("aria-label", "More actions");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["overlay"] = document.createElement("coral-overlay");
  el2.className += " coral-QuickActions-overlay";
  el2.setAttribute("offset", "5");
  el2.setAttribute("placement", "bottom");
  el2.setAttribute("target", "_prev");
  el2.setAttribute("handle", "overlay");
  frag.appendChild(el2);
  return frag;
});

this["Coral"]["templates"]["QuickActions"]["overlaycontent"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["buttonList"] = document.createElement("coral-buttonlist");
  el0.id = Coral["commons"]["getUID"]();
  el0.className += " coral-QuickActions-buttonList";
  el0.setAttribute("handle", "buttonList");
  el0.setAttribute("tabindex", "-1");
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for search variant values.

    @enum {String}
    @memberof Coral.Search
  */
  var variant = {
    /** A default, gray search input */
    DEFAULT: 'default',
    /** A search with no border, no background, no glow */
    QUIET: 'quiet'
  };

  // the search's base classname
  var CLASSNAME = 'coral-Search';

  // builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = '';
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantValue] + ' ';
  }

  Coral.register( /** @lends Coral.Search# */ {
    /**
      @class Coral.Search
      @classdesc A Search component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-search
    */
    name: 'Search',
    tagName: 'coral-search',
    className: CLASSNAME,

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      // @todo use Coral.keys when key combos don't interfere with single key execution
      'keydown [handle=input]': '_onEnterKey',
      'keyup [handle=input]': '_onKeyUp',

      // @todo use coralinternalinput from Autocomplete
      'input [handle=input]': '_triggerInputEvent',

      'key:escape [handle=input]': '_clearInput',
      'click [handle=clearButton]:not(:disabled)': '_clearInput'
    },

    properties: {
      // JSDoc inherited
      'value': {
        get: function() {
          return this._elements.input.value;
        },
        set: function(value) {
          // sets the value immediately so it is picked up in form submits
          this._elements.input.value = value;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);

          this._elements.input.disabled = this.disabled;
          this._elements.clearButton.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);

          this._elements.input.$.toggleClass('is-invalid', this.invalid);
          this._elements.input.setAttribute('aria-invalid', this.invalid);
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'labelledBy': {
        sync: function() {
          // in case the user focuses the buttons, he will still get a notion of the usage of the component
          if (this.labelledBy) {
            this.setAttribute('aria-labelledby', this.labelledBy);
          }
          else {
            this.removeAttribute('aria-labelledby');
          }
        }
      },

      /**
        Short hint that describes the expected value of the Search. It is displayed when the Search is empty.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.Search#
      */
      'placeholder': {
        default: '',
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return this._elements.input.placeholder;
        },
        set: function(value) {
          this._elements.input.placeholder = value;
        }
      },

      /**
        This sets the left icon on the search component.

        @type {String}
        @default "search"
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.Search#
      */
      'icon': {
        default: 'search',
        reflectAttribute: true,
        set: function(value) {
          this._elements.icon.$.attr('icon', value);
        }
      },

      /**
        The search's variant.

        @type {Coral.Search.variant}
        @default Coral.Search.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Search#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // provide the variant internally
          this._elements.input.variant = this.variant;
        }
      }
    },

    /** @ignore */
    _triggerInputEvent: function() {
      this.trigger('coral-search:input');
    },

    /**
      Handles the up action by steping up the Search. It prevents the default action.

      @ignore
    */
    _onEnterKey: function(event) {
      if (event.which === 13) {
        event.preventDefault();

        // stops interaction if the search is disabled
        if (this.disabled) {
          return;
        }

        this.trigger('coral-search:submit');
      }
    },

    /**
      Handles the keydown action.

      @ignore
    */
    _onKeyUp: function(event) {
      this._updateClearButton();
    },

    /**
      Updates the clear button's display status.

      @ignore
    */
    _updateClearButton: function() {
      if (this._elements.input.value === '') {
        this._elements.clearButton.style.display = 'none';
      }
      else {
        this._elements.clearButton.style.display = '';
      }
    },

    /**
      Clears the text in the input box.

      @ignore
    */
    _clearInput: function(event) {
      this._elements.input.value = '';
      this._updateClearButton();
      this._elements.input.focus();

      // If we've been cleared, trigger the event
      this.trigger('coral-search:clear');
    },

    /**
      Modified to target the input instead of the button.

      @private
    */
    _getLabellableElement: function() {
      return this._elements.input;
    },

    /** @ignore */
    _initialize: function() {
      // Add decorated-textfield css
      this.$.addClass('coral-DecoratedTextfield');

      this._updateClearButton();
    },

    /** @ignore */
    _render: function() {
      this.appendChild(Coral.templates.search.base.call(this._elements));
    }

    /**
      Triggerred when input is given.

      @event Coral.Search#coral-search:input

      @param {Object} event
        Event object.
    */

    /**
      Triggerred when the user presses enter.

      @event Coral.Search#coral-search:submit

      @param {Object} event
        Event object.
    */

    /**
      Triggerred when the search is cleared.

      @event Coral.Search#coral-search:clear

      @param {Object} event
        Event object.
    */
  });

  // exports the variants enumeration
  Coral.Search.variant = variant;

}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["search"] = window["Coral"]["templates"]["search"] || {};
window["Coral"]["templates"]["search"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.className += " coral-DecoratedTextfield-icon";
  el0.setAttribute("size", "S");
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["input"] = document.createElement("input","coral-textfield");
  el2.setAttribute("type", "text");
  el2.className += " coral-DecoratedTextfield-input coral-Search-input";
  el2.setAttribute("is", "coral-textfield");
  el2.setAttribute("handle", "input");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = document.createTextNode("\n");
  frag.appendChild(el4);
  var el5 = this["clearButton"] = document.createElement("button","coral-button");
  el5.setAttribute("aria-label", "Clear search");
  el5.setAttribute("is", "coral-button");
  el5.setAttribute("variant", "minimal");
  el5.setAttribute("icon", "close");
  el5.setAttribute("iconsize", "XS");
  el5.className += " coral-DecoratedTextfield-button";
  el5.setAttribute("handle", "clearButton");
  frag.appendChild(el5);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Event: true */
(function() {
  'use strict';

  /**
    Enum for Select variant values.

    @enum {String}
    @memberof Coral.Select
  */
  var variant = {
    /** A default, gray Select. */
    DEFAULT: 'default',
    /** A Select with no border or background. */
    QUIET: 'quiet'
  };

  var CLASSNAME = 'coral3-Select';

  // builds a string containing all possible variant classnames. This will be used to remove
  // classnames when the variant changes.
  var ALL_VARIANT_CLASSES = '';
  for (var variantKey in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantKey] + ' ';
  }

  // used in 'auto' mode to determine if the client is on mobile.
  var IS_MOBILE_DEVICE = navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) !== null;

  Coral.register( /** @lends Coral.Select# */ {
    /**
      @class Coral.Select
      @classdesc A Select component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#multiple as Coral.Select#multiple
      @borrows Coral.mixin.selectionList#selectedItem as Coral.Select#selectedItem
      @borrows Coral.mixin.selectionList#selectedItems as Coral.Select#selectedItems
      @borrows Coral.mixin.selectionList#items as Coral.Select#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.Select#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.Select#coral-collection:remove

      @htmltag coral-select
    */
    // Based on ARIA standard http://www.w3.org/TR/wai-aria/roles#select
    name: 'Select',
    tagName: 'coral-select',
    className: CLASSNAME,
    mixins: [
      Coral.mixin.formField,
      Coral.mixin.selectionList({
        itemTagName: 'coral-select-item',
        role: 'presentation',
        tabIndex: -1
      })
    ],

    events: {
      'coral-component:attached coral-select-item': '_onItemAttached',

      'coral-collection:add coral-taglist': '_onInnerComponentCollectionEvent',
      'coral-collection:add coral-selectlist': '_onSelectListItemAdd',

      'coral-collection:remove coral-taglist': '_onInnerComponentCollectionEvent',
      'coral-collection:remove coral-selectlist': '_onInnerComponentCollectionEvent',

      'coral-select-item:valuechange coral-select-item': '_onItemValueChange',
      'coral-select-item:contentchange coral-select-item': '_onItemContentChange',
      'coral-select-item:disabledchange coral-select-item': '_onItemDisabledChange',

      'coral-selectlist:change': '_onSelectListChange',
      'coral-selectlist:scrollbottom': '_onSelectListScrollBottom',

      'change coral-taglist': '_onTagListChange',
      'change select': '_onNativeSelectChange',
      'click select': '_onNativeSelectClick',
      // selector required since tags also have [handle=button]
      'click > [handle=button]': '_onButtonClick',

      'key:space > [handle=button]': '_onSpaceKey',
      'key:down > [handle=button]': '_onSpaceKey',
      'key:tab coral-selectlist-item': '_onTabKey',
      'key:tab+shift coral-selectlist-item': '_onTabKey',

      'coral-overlay:open': '_onOverlayToggle',
      'coral-overlay:close': '_onOverlayToggle',
      'coral-overlay:positioned': '_onOverlayPositioned'
    },

    properties: {

      // JSDocs inherited
      'multiple': {
        reflectAttribute: true,
        set: function(value) {
          this._multiple = value;

          this._elements.nativeSelect.multiple = value;
          this._elements.list.multiple = value;

          this._setName(this.name);

          // since change the multiple affects the placeholder, we need to force a sync of the "placeholder" property.
          this._queueSync('placeholder', 'selectedItem');
        }
      },

      /**
        Contains a hint to the user of what can be selected in the component. If no placeholder is provided, the first
        option will be displayed in the component.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.Select#
      */
      // p = placeholder, m = multiple, se = selected
      // case 1:  p +  m +  se = p
      // case 2:  p +  m + !se = p
      // case 3: !p + !m +  se = se
      // case 4: !p + !m + !se = firstSelectable (native)
      // case 5:  p + !m +  se = se
      // case 6:  p + !m + !se = p
      // case 7: !p +  m +  se = 'Select'
      // case 8: !p +  m + !se = 'Select'
      'placeholder': {
        default: '',
        reflectAttribute: true,
        transform: Coral.transform.string,
        alsoSync: 'selectedItem',
        sync: function() {
          // case 1:  p +  m +  se = p
          // case 2:  p +  m + !se = p
          // case 6:  p + !m + !se = p
          if (this.placeholder && (this.multiple || !this.selectedItem)) {
            this._elements.label.textContent = this.placeholder;
            // Make sure nothing is selected since default behavior of native select is to select the first item
            this._elements.nativeSelect.value = '';
          }
          // case 7: !p +  m +  se = 'Select'
          // case 8: !p +  m + !se = 'Select'
          else if (this.multiple) {
            // @i18n: 'Select'
            this._elements.label.textContent = 'Select';
          }
          // case 4: !p + !m + !se = firstSelectable (native)
          else {
            var placeholderItem = this.items.getFirstSelectable();
            if (placeholderItem) {
              // Make sure first item is selected
              if (!this.selectedItem) {
                placeholderItem.selected = true;
              }

              this._elements.label.innerHTML = placeholderItem.innerHTML;
            }
          }
        }
      },

      // JSDocs inherited
      'name': {
        get: function() {
          return this.multiple ? this._elements.taglist.name : this._elements.input.name;
        },
        set: function(value) {
          this._setName(value);
        }
      },

      // JSDocs inherited
      'value': {
        get: function() {
          // If not attached to the DOM, the native select is empty so we have to get the selected item value
          return this._elements.nativeSelect.value || ((this.selectedItem && this.selectedItem.value) || '');
        },
        set: function(value) {
          if (!value && !this.multiple) {
            // Select first item by default
            if (!this.placeholder) {
              var placeholderItem = this.items.getFirstSelectable();
              if (placeholderItem) {
                placeholderItem.selected = true;
                value = placeholderItem.value;
              }
            }
            // Deselect selected item and show placeholder instead
            else {
              var selectedItem = this.selectedItem;
              if (selectedItem) {
                selectedItem.selected = false;
              }
            }
          }

          // sets the value on the native select
          this._elements.nativeSelect.value = value;

          // gets all the items
          var items = this.items.getAll();

          // if multiple, we need to explicitely set the selection state of every item
          if (this.multiple) {
            items.forEach(function(item) {
              item.selected = item.value === value;
            });
          }
          // if single selection, we just find the first item that matches the value and let the mixin-selection handle
          // the deselection of the other items
          else {
            items.some(function(item) {
              // once an item matches the value it will return true and exit the loop
              if (item.value === value) {
                item.selected = true;
                // if we find a matching value we stop looping the list
                return true;
              }
            });

            this._elements.input.value = this._elements.nativeSelect.value;
          }
        }
      },

      /**
        The current selected values, as submitted during form submission. When {@link Coral.Select#multiple} is
        <code>false</code>, this will be an array of length 1.

        @type {Array.<String>}
        @memberof Coral.Select#
      */
      'values': {
        attribute: null,
        validate: [
          Coral.validate.valueMustChange,
          function(values) {
            return Array.isArray(values);
          }
        ],
        get: function() {
          var values = [];

          // uses the nativeSelect since it holds the truth of what will be submitted with the form
          var selectedOptions = this._elements.nativeSelect.selectedOptions;

          for (var i = 0; i < selectedOptions.length; i++) {
            values.push(selectedOptions[i].value);
          }

          return values;
        },
        set: function(values) {
          // just keeps the first value if multiple=false and falls back to the value setter
          if (!this.multiple && values.length > 1) {
            values = [values[0]];
          }

          // assumes that multiple=true
          this.items.getAll().forEach(function(item) {
            // if the value is located inside the values array, then we set the item as selected
            item.selected = values.indexOf(item.value) !== -1;
          });

          if (!values.length) {
            this.value = '';
          }
        }
      },

      // JSDocs inherited
      // @todo: native select does not support require
      'required': {
        sync: function() {
          this._elements.nativeSelect.required = this.required;
          this._elements.taglist.required = this.required;
        }
      },

      // JSDocs inherited
      'invalid': {
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid);
        }
      },

      // JSDocs inherited
      'disabled': {
        sync: function() {
          this._elements.button.disabled = this.disabled || this.readOnly;
          this._elements.nativeSelect.disabled = this.disabled || this.readOnly;
          this._elements.taglist.disabled = this.disabled || this.readOnly;
        }
      },

      // JSDocs inherited
      'readOnly': {
        sync: function() {
          this._elements.button.disabled = this.readOnly || this.disabled;
          this._elements.nativeSelect.disabled = this.readOnly || this.disabled;
          this._elements.taglist.readOnly = this.readOnly || this.disabled;
        }
      },

      // @todo: native select actually selects the first option, do we want to do this as well?
      // JSDoc inherited
      'selectedItem': {
        alsoSync: 'placeholder',
        sync: function() {
          // case 3: !p + !m +  se = se
          // case 5:  p + !m +  se = se
          if (this.selectedItem && !this.multiple) {
            this._elements.label.innerHTML = this.selectedItem.innerHTML;
          }
        }
      },

      /**
        Indicates that the Select is currently loading remote data. This will set the wait indicator inside the list.

        @type {Boolean}
        @default false
        @htmlattribute loading
        @memberof Coral.Select#
      */
      // @todo: should we keep this? how do we indicate that items got added?
      'loading': {
        get: function() {
          return this._elements.list.loading;
        },
        set: function(value) {
          this._elements.list.loading = value;
        }
      },

      /**
        The Select's variant.

        @type {Coral.Select.variant}
        @default Coral.Select.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Select#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          this.$.removeClass(ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Select.variant.DEFAULT) {
            this.$.addClass(this._className + '--' + this.variant);
          }
        }
      }
    },

    /**
      Flag used to determine if the change event was triggered by the user.

      @private
    */
    _onUserInteraction: false,

    /** @ignore */
    _setName: function(value) {
      if (this.multiple) {
        this._elements.input.name = '';
        this._elements.taglist.name = value;
      }
      else {
        this._elements.taglist.name = '';
        this._elements.input.name = value;
      }
    },

    /**
      @param {Boolean} [checkAvailableSpace=false]
        If <code>true</code>, the event is triggered based on the available space.

      @private
    */
    _showOptions: function(checkAvailableSpace) {

      if (checkAvailableSpace) {
        // threshold in pixels
        var ITEM_SIZE_THRESHOLD = 30;

        var scrollHeight = this._elements.list.scrollHeight;
        var viewportHeight = this._elements.list.clientHeight;
        var scrollTop = this._elements.list.scrollTop;
        // we should not do this, but it increases performance since we do not need to find the item
        var loadIndicator = this._elements.list._elements.loadIndicator;

        // we remove the size of the load indicator
        if (loadIndicator && loadIndicator.parentNode) {
          scrollHeight -= $(loadIndicator).outerHeight(true);
        }

        // if we are not close to the bottom scroll, we cancel triggering the event
        if (scrollTop + viewportHeight < scrollHeight - ITEM_SIZE_THRESHOLD) {
          return;
        }
      }

      // we do not show the list with native
      if (!this._useNativeInput) {
        // Show the overlay
        this._elements.overlay.open = true;
      }

      // Trigger an event
      // @todo: maybe we should only trigger this event when the button is toggled and we have space for more items
      var event = this.trigger('coral-select:showitems', {
        // amount of items in the select
        start: this.items.length
      });

      // while using native there is no need to show the loading
      if (!this._useNativeInput) {
        // if the default is prevented, we should the loading indicator
        this._elements.list.loading = event.defaultPrevented;
      }
    },

    /** @private */
    _hideOptions: function() {
      this._elements.overlay.open = false;

      this.trigger('coral-select:hideitems');
    },

    /** @private */
    _onSelectListItemAdd: function(event) {
      event.stopImmediatePropagation();

      // When items have been added, we're no longer loading
      this.loading = false;

      // Reset height
      this._elements.list.style.height = '';

      // Measure actual height
      var style = window.getComputedStyle(this._elements.list);
      var height = parseInt(style.height, 10);
      var maxHeight = parseInt(style.maxHeight, 10);

      if (height < maxHeight) {
        // Make it scrollable
        this._elements.list.style.height = height - 1 + 'px';
      }
    },

    /** @private */
    _onInnerComponentCollectionEvent: function(event) {
      event.stopImmediatePropagation();
    },

    /** @private */
    _onItemAttached: function(event) {
      // Ignore events bubbling from deeper descendants.
      if (event.target !== event.matchedTarget) {
        return;
      }

      this._attachItem(event.target);
    },

    /** @ignore */
    _attachItem: function(item) {
      var selectListItemParent = this._elements.list;

      var selectListItem = item._elements.selectListItem || new Coral.SelectList.Item();

      // @todo: Make sure it's added at the right index.
      // because appending the selectingListItem triggers a detach before attaching it again (and then removes the
      // selection as detached elements should not be selected) we have to cache the selected state before attaching
      var itemSelected = item.selected;
      selectListItemParent.appendChild(selectListItem);

      selectListItem.set({
        value: item.value,
        content: {
          innerHTML: item.content.innerHTML
        },
        disabled: item.disabled,
        selected: itemSelected
      }, true);

      var nativeOption = item._elements.nativeOption || new Option();

      // @todo: make sure it is added at the right index.
      this._elements.nativeSelect.appendChild(nativeOption);
      nativeOption.selected = item.selected;
      nativeOption.value = item.value;
      nativeOption.disabled = item.disabled;
      nativeOption.innerHTML = item.content.innerHTML;

      if (this.multiple) {

        // in case it was selected before it was added
        if (item.selected) {
          selectListItem.hidden = true;

          // we prepare the tag
          item._elements.tag = item._elements.tag || new Coral.Tag();
          item._elements.tag.set({
            value: item.value,
            label: {
              innerHTML: item.content.innerHTML
            }
          }, true);

          Coral.commons.nextFrame(function() {
            // we add the new tag at the end
            this._elements.taglist.items.add(item._elements.tag);
          }.bind(this));
        }
      }
      else {
        // Make sure the input value is set to the selected item
        if (item.selected) {
          this._elements.input.value = item.value;
        }
      }

      item._elements.selectListItem = selectListItem;
      item._elements.nativeOption = nativeOption;

      selectListItem._elements.selectItem = item;
      $(nativeOption).data('selectItem', item);

      item.on('coral-component:detached', this._onItemDetached);
    },

    /** @private */
    _onItemDetached: function(event) {
      // Ignore events bubbling from deeper descendants.
      if (event.eventPhase !== Event.AT_TARGET) {
        return;
      }

      var item = event.target;

      // Remove the item from the initial selected values
      var index = this._initalSelectedValues.indexOf(item.value);
      if (index !== -1) {
        this._initalSelectedValues.splice(index, 1);
      }

      // removes the items
      item._elements.selectListItem.remove();
      var $option = $(item._elements.nativeOption);
      $option.remove();

      // we need to check if it exists since only multiple uses tag
      if (item._elements.tag) {
        item._elements.tag.remove();
      }

      // clears the references
      item._elements.selectListItem._elements.selectItem = null;
      $option.removeData('selectItem');

      this._queueSync('placeholder', 'selectedItem');

      item.off('coral-component:detached', this._onItemDetached);
    },

    /** @private */
    _onItemSelected: function(item) {
      // in case the component is not in the DOM or the internals have not been created we force it
      if (!item._elements.selectListItem || !item._elements.selectListItem.parentNode) {
        this._attachItem(item);
      }

      item._elements.selectListItem.selected = true;
      item._elements.nativeOption.selected = true;

      if (this.multiple) {
        // we prepare the tag
        item._elements.tag = item._elements.tag || new Coral.Tag();
        item._elements.tag.set({
          value: item.value,
          label: {
            innerHTML: item.content.innerHTML
          }
        }, true);

        Coral.commons.nextFrame(function() {
          // we add the new tag at the end
          this._elements.taglist.items.add(item._elements.tag);
        }.bind(this));

        // we need to hide the item from further selections
        // @todo: what happens when ALL items have been selected
        //  1. a message is disabled (i18n?)
        //  2. we don't try to open the selectlist (native behavior).
        item._elements.selectListItem.hidden = true;
      }

      // since the selected changed, we need to update the selectedItem in the button
      this._queueSync('placeholder', 'selectedItem');
    },

    /** @private */
    _onItemDeselected: function(item) {
      // in case the component is not in the DOM or the internals have not been created we force it
      if (!item._elements.selectListItem || !item._elements.selectListItem.parentNode) {
        this._attachItem(item);
      }

      item._elements.selectListItem.selected = false;
      item._elements.nativeOption.selected = false;

      // the hidden items need to be reinstated
      if (this.multiple) {

        // we use the internal reference to remove the related tag from the taglist
        if (item._elements.tag) {
          item._elements.tag.remove();
          item._elements.tag = undefined;
        }

        item._elements.selectListItem.hidden = false;
      }

      // since the selected changed, we need to update the selectedItem in the button
      this._queueSync('placeholder', 'selectedItem');
    },

    /** @private */
    _onSelectionChange: function(newSelection, oldSelection) {
      if (this._onUserInteraction) {
        // we set it as false in case the user updates the selection on the change listener, otherwise more events will
        // be triggered
        this._onUserInteraction = false;
        this.trigger('change');
      }
    },

    // @todo: when the component is initialized, i'm getting some "change" events.
    /**
      Detects when something inside the select list changes.

      @private
    */
    _onSelectListChange: function(event) {
      event.stopImmediatePropagation();

      var self = this;

      var oldSelection = event.detail.oldSelection || [];
      oldSelection = !Array.isArray(oldSelection) ? [oldSelection] : oldSelection;

      var selection = event.detail.selection || [];
      selection = !Array.isArray(selection) ? [selection] : selection;

      this._mutateSelection(function() {

        // we deselect first the ones that have to go
        var diff = $(oldSelection).not(selection).get();
        diff.forEach(function(item) {
          item._elements.selectItem.selected = false;
        });

        // we sync the selection with the coral-select-item and the native option
        // @todo: maybe just change the ones that are new?
        selection.forEach(function(item) {
          item._elements.selectItem.selected = true;
        });

        if (selection.length) {
          self._elements.input.value = selection[0].value;
        }
      });

      // hides the list since something was selected
      // @todo: it may be nice if it is not hidden when multiple = true, but it can't hidden items now.
      this._hideOptions();
    },

    /** @private */
    _onTagListChange: function(event) {
      // cancels the change event from the taglist
      event.stopImmediatePropagation();

      var values = event.target.values;
      this.items.getAll().forEach(function(elem) {
        // if the item is inside the values array, then it has to be selected
        elem.selected = values.indexOf(elem.value) !== -1;
      });

      // if the taglist is empty, we should return the focus to the button
      if (!values.length) {
        this._elements.button.focus();
      }

      // reparents the change event with the select as the target
      this.trigger('change');
    },

    /** @private */
    _onSelectListScrollBottom: function(event) {
      // triggers the corresponding event
      // since we got the the event from select list we need to trigger the event
      this._showOptions();
    },

    /** @private */
    _onButtonClick: function(event) {
      event.preventDefault();

      if (this.disabled) {
        return;
      }

      // if native is required, we do not need to do anything
      if (!this._useNativeInput) {
        // @todo: this was removed cause otherwise the coral-select:showitems event is never triggered.
        // if this is a multiselect and all items are selected, there should be nothing in the list to focus so do nothing.
        // if (this.multiple && this.selectedItems.length === this.items.length) {
        //   return;
        // }

        // Toggle openness
        if (this._elements.overlay.open) {
          this._hideOptions();
        }
        else {
          // event should be triggered based on the contents
          this._showOptions(true);

          // once the overlay is open, we focus the list.
          this._focusSelectList();
        }
      }
    },

    /** @private */
    _focusSelectList: function() {
      var self = this;
      // Safari seems to need another frame for this to work.
      Coral.commons.nextFrame(function() {
        if ($(document.activeElement).closest(self._elements.list).length === 0) {
          self._elements.list.focus();
        }
      });
    },

    /** @private */
    _onNativeSelectClick: function(event) {
      this._showOptions(false);
    },

    /** @private */
    _onSpaceKey: function(event) {
      if (this.disabled) {
        return;
      }

      event.preventDefault();

      if (this._useNativeInput) {
        // we try to open the native select
        if (document.createEvent) {
          var e = document.createEvent('MouseEvents');
          e.initMouseEvent('mousedown', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          this._elements.nativeSelect.dispatchEvent(e);
        }
        // @todo: may not be needed due to polyfill
        // @polyfill IE9
        // since there's no mobile device using IE9 this may be removed.
        else if (this._elements.nativeSelect.fireEvent) {
          this._elements.nativeSelect.fireEvent('onmousedown');
        }
      }
      else {
        if (!this._elements.overlay.open || event.keyCode === Coral.Keys.keyToCode('space')) {
          this._elements.button.click();
        }
      }
    },

    /**
      Prevents tab key default handling on selectList Items.

      @private
    */
    _onTabKey: function(event) {
      event.preventDefault();
    },

    /** @private */
    _onOverlayToggle: function(event) {
      // if the overlay is open, we indicate that interaction can be produced
      this._onUserInteraction = event.target.open;

      $(this._elements.button).toggleClass('is-selected', event.target.open);

      // we set the aria accordinly
      this._elements.button.setAttribute('aria-expanded', event.target.open);

      if (!event.target.open) {
        this.$.removeClass('is-openAbove is-openBelow');
      }
    },

    /** @private */
    _onOverlayPositioned: function(event) {
      this.$.addClass(event.detail.vertical === 'top' ? 'is-openBelow' : 'is-openAbove');
    },

    // @todo: while the select is multiple, if everything is deselected no change event will be triggered.
    // @todo: finish this to support native
    _onNativeSelectChange: function(event) {
      // we do not bubble native select events, this behavior is consistant with every component that mixes
      // formField
      event.stopImmediatePropagation();

      // Native selection change should always happen due to a user interaction
      // If an item is set active programatically this method should not be called
      this._onUserInteraction = true;

      // extracts the native options for the selected items. We use the selected options, instead of the complete
      // options to make the diff since it will normally be a smaller set
      var oldSelectedOptions = this.selectedItems.map(function(element) {
        return element._elements.nativeOption;
      });

      var selectedOptions = event.target.selectedOptions;
      var selectedOptionsLength = selectedOptions.length;

      this._mutateSelection(function() {
        var diff = $(oldSelectedOptions).not(selectedOptions).get();
        diff.forEach(function(item) {
          $(item).data('selectItem').selected = false;
        });

        // using for loop since selectedOptions is an HTMLCollection, not an Array
        // @todo: maybe just set the ones that are new
        for (var i = 0; i < selectedOptionsLength; i++) {
          $(selectedOptions.item(i)).data('selectItem').selected = true;
        }
      });

      // returns the focus to the button, otherwise the select will keep it
      if (!this.multiple) {
        this._elements.button.focus();
      }

      // Make sure that the next select is not automatically considered to be due to a user interaction
      this._onUserInteraction = false;
    },

    /**
      This handles content change of coral-select-item and updates its associatives.

      @private
    */
    _onItemContentChange: function(event) {
      // stops propagation cause the event is internal to the component
      event.stopImmediatePropagation();

      var item = event.target;
      if (item._elements.selectListItem && item._elements.selectListItem.content) {
        item._elements.selectListItem.content.innerHTML = item.content.innerHTML;
      }

      if (item._elements.nativeOption) {
        item._elements.nativeOption.innerHTML = item.content.innerHTML;
      }
    },

    /**
      This handles value change of coral-select-item and updates its associatives.

      @private
    */
    _onItemValueChange: function(event) {
      // stops propagation cause the event is internal to the component
      event.stopImmediatePropagation();

      var item = event.target;
      if (item._elements.selectListItem) {
        item._elements.selectListItem.value = item.value;
      }

      if (item._elements.nativeOption) {
        item._elements.nativeOption.value = item.value;
      }
    },

    /**
      This handles disabled change of coral-select-item and updates its associatives.

      @private
    */
    _onItemDisabledChange: function(event) {
      // stops propagation cause the event is internal to the component
      event.stopImmediatePropagation();

      var item = event.target;
      if (item._elements.selectListItem) {
        item._elements.selectListItem.disabled = item.disabled;
      }

      if (item._elements.nativeOption) {
        item._elements.nativeOption.disabled = item.disabled;
      }
    },

      // JSDocs inherited from coralui-mixin-formfield
    reset: function() {
      // reset the values to the initial values
      this.values = this._initalSelectedValues;
    },

    // JSDocs inherited from coralui-mixin-formfield
    clear: function() {
      this.value = '';
    },

    /** @ignore */
    _initialize: function() {
      // we only have AUTO mode.
      this._useNativeInput = IS_MOBILE_DEVICE;
      this.$.toggleClass('coral3-Select--native', this._useNativeInput);

      // bounds the handler functions
      this._onItemDetached = this._onItemDetached.bind(this);

      // handles the initial item in the select
      this._queueSync('placeholder', 'selectedItem');

      // save initial selection (used for reset)
      this._initalSelectedValues = [];
      Coral.commons.nextFrame(function() {
        // currently the native select is only set later => we have to wait one frame
        this._initalSelectedValues = this.values;
      }.bind(this));
    },

    /** @ignore */
    _render: function() {

      // Create a temporary fragment
      var frag = document.createDocumentFragment();

      // Render the main template
      frag.appendChild(Coral.templates.Select.base.call(this._elements));

      var overlay = new Coral.Select.ListOverlay();
      overlay.target = this._elements.button;
      overlay.placement = Coral.Overlay.placement.BOTTOM;
      overlay.offset = -1;
      overlay.trapFocus = Coral.mixin.overlay.trapFocus.ON;
      overlay.focusOnShow = Coral.mixin.overlay.focusOnShow.ON;
      overlay.returnFocus = Coral.mixin.overlay.returnFocus.ON;

      // gives the focus back to button once the overlay is closed
      overlay.returnFocusTo(this._elements.button);

      var selectList = new Coral.SelectList();
      overlay.appendChild(selectList);

      frag.appendChild(overlay);

      this._elements.overlay = overlay;

      // creates a new SelectList to synchronize the options to
      this._elements.list = selectList;

      // constrains the size of the list to 6 items
      this._elements.list.style.maxHeight = 42 * 6 + 'px';

      this._elements.list.id = this._elements.list.id || Coral.commons.getUID();

      this._elements.button.setAttribute('role', 'combobox');
      this._elements.button.setAttribute('aria-expanded', false);
      this._elements.button.setAttribute('aria-haspopup', true);
      this._elements.button.setAttribute('aria-controls', this._elements.list.id);
      this._elements.button.setAttribute('aria-owns', this._elements.list.id);

      // Clean up
      while (this.firstChild) {
        var child = this.firstChild;
        if (child.tagName === 'CORAL-SELECT-ITEM') {
          // Conserve coral-select-item
          frag.appendChild(child);
        }
        else {
          // Remove anything else
          this.removeChild(child);
        }
      }

      // Add the frag to the component
      this.appendChild(frag);
    }

    /**
      Triggered when the select could accept external data to be loaded by the user. If <code>preventDefault()</code> is
      called, then a loading indicator will be shown. {@link Coral.Select#loading} should be set to false to indicate
      that the data has been successfully loaded.

      @event Coral.Select#coral-select:showitems

      @param {Object} event
        Event object.
      @param {Object} event.detail
        Detail object.
      @param {Number} event.detail.start
        The count of existing items, which is the index where new items should start.
    */
  });

  // Exports the variants enumeration.
  Coral.Select.variant = variant;

  Coral.register( /* @lends Coral.Select.Item# */ {
    /**
      @class Coral.Select.Item
      @classdesc A Select.Item component
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
      @borrows Coral.mixin.selectionList.Item#disabled as Coral.Select.Item#disabled
      @borrows Coral.mixin.selectionList.Item#selected as Coral.Select.Item#selected
      @htmltag coral-select-item
    */
    name: 'Select.Item',
    tagName: 'coral-select-item',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-select'
      })
    ],

    properties: {
      // JSDocs inherited
      'disabled': {
        trigger: 'coral-select-item:disabledchange'
      },

      /**
        Item content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Select.Item#
      */
      'content': {
        contentZone: true,
        set: function() {},
        get: function() {
          return this;
        }
      },

      /**
        Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.

        @type {String}
        @default ""
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Select.Item#
      */
      'value': {
        reflectAttribute: true,
        trigger: 'coral-select-item:valuechange',
        transform: Coral.transform.string,
        get: function() {
          // keep spaces to only 1 max and trim to mimic native select option behavior
          return typeof this._value === 'undefined' ? this.textContent.replace(/\s{2,}/g, ' ').trim() : this._value;
        }
      }
    },

    /** @private */
    _handleMutation: function(mutations) {
      this.trigger('coral-select-item:contentchange');
    },

    /** @ignore */
    _initialize: function() {
      this._observer = new MutationObserver(this._handleMutation.bind(this));
      this._observer.observe(this, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  });

  Coral.register( /* @lends Coral.Select.ListOverlay# */ {
    /*
      @class Coral.Select.ListOverlay
      @classdesc A Select.ListOveray component
      @extends Coral.Overlay
      @private
    */
    name: 'Select.ListOverlay',
    tagName: 'coral-select-listoverlay',
    className: 'coral-Overlay',
    extend: Coral.Overlay,

    events: {
      'global:click': '_onGlobalClick',
      'global:touchstart': '_onGlobalClick',
      'global:key:escape': '_onEscapeKey'
    },

    /** @ignore */
    _onGlobalClick: function(event) {
      if (!this.open) {
        return;
      }

      // Make sure we don't hide ourself when clicked
      var eventTargetWithinOverlayTarget = this.target.parentNode.contains(event.target);
      var eventTargetWithinItself = this.contains(event.target);
      if (!eventTargetWithinOverlayTarget && !eventTargetWithinItself) {
        this.open = false;
      }
    },

    /** @ignore */
    _onEscapeKey: function(event) {
      // When escape is pressed, hide ourselves
      if (this._isTopOverlay()) {
        this.hide();
      }
    },

    /**
      Matches the size of the list to the Select button.

      @private
    */
    _beforePosition: function() {
      this.style.width = $(this.target).outerWidth() + 'px';

      Coral.Overlay.prototype._beforePosition.call(this);
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Select"] = this["Coral"]["templates"]["Select"] || {};
this["Coral"]["templates"]["Select"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["button"] = document.createElement("button","coral-button");
  el0.setAttribute("type", "button");
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("block", "");
  el0.setAttribute("handle", "button");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["icon"] = document.createElement("coral-icon");
  el2.setAttribute("icon", "chevronDown");
  el2.setAttribute("size", "xxs");
  el2.className += " coral3-Select-openIcon";
  el2.setAttribute("handle", "icon");
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n  ");
  el0.appendChild(el3);
  var el4 = this["label"] = document.createElement("span");
  el4.className += " coral3-Select-label";
  el4.setAttribute("handle", "label");
  el4.id = Coral["commons"]["getUID"]();
  el0.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el0.appendChild(el5);
  frag.appendChild(el0);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = this["input"] = document.createElement("input");
  el7.setAttribute("type", "hidden");
  el7.setAttribute("handle", "input");
  frag.appendChild(el7);
  var el8 = document.createTextNode("\n");
  frag.appendChild(el8);
  var el9 = this["nativeSelect"] = document.createElement("select");
  el9.className += " coral3-Select-select";
  el9.setAttribute("handle", "nativeSelect");
  el9.setAttribute("tabindex", "-1");
  frag.appendChild(el9);
  var el10 = document.createTextNode("\n");
  frag.appendChild(el10);
  var el11 = this["taglist"] = document.createElement("coral-taglist");
  el11.setAttribute("handle", "taglist");
  frag.appendChild(el11);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /** @ignore */
  var placement = Coral.Overlay.placement;

  var arrowMap = {
    'left': 'Right',
    'right': 'Left',
    'top': 'Down',
    'bottom': 'Up'
  };

  var CLASSNAME = 'coral3-Tooltip';

  // This is in JS as we're setting this to induce wrapping before collision calculations
  // var TOOLTIP_MAX_WIDTH = 300;
  var TOOLTIP_ARROW_SIZE = 12;

  /**
    Tooltip variants.

    @enum {String}
    @memberof Coral.Tooltip
  */
  var variant = {
    /** A blue tooltip that informs the user of non-critical information. */
    INFO: 'info',
    /** A red tooltip that indicates an error has occurred. */
    ERROR: 'error',
    /** An orange tooltip that notifies the user of something important. */
    WARNING: 'warning',
    /** A green tooltip that indicates an operation was successful. */
    SUCCESS: 'success',
    /** A dark gray tooltip that provides additional information for a chart item. */
    INSPECT: 'inspect'
  };

  /**
    Tooltip interaction values.

    @enum {String}
    @memberof Coral.Tooltip
  */
  var interaction = {
    /** Show when the target is hovered or focused and hide when the mouse is moved out or focus is lost. */
    ON: 'on',
    /** Do not show or hide automatically. */
    OFF: 'off'
  };

  // A string of all possible variant classnames
  var ALL_VARIANT_CLASSES = '';
  for (var variantName in variant) {
    ALL_VARIANT_CLASSES += CLASSNAME + '--' + variant[variantName] + ' ';
  }

  // A string of all position placement classnames
  var ALL_PLACEMENT_CLASSES = '';

  // A map of lowercase directions to their corresponding classname
  var placementClassMap = {};
  for (var key in placement) {
    var direction = placement[key];

    var placementClass = CLASSNAME + '--arrow' + arrowMap[direction];

    // Store in map
    placementClassMap[direction] = placementClass;

    // Store in list
    ALL_PLACEMENT_CLASSES += placementClass + ' ';
  }

  Coral.register( /** @lends Coral.Tooltip# */ {
    /**
      @class Coral.Tooltip
      @classdesc A Tooltip component
      @extends Coral.Component
      @htmltag coral-tooltip
      @extends Coral.Overlay

      @borrows Coral.mixin.overlay#focusOnShow as Coral.Tooltip#focusOnShow
      @borrows Coral.mixin.overlay#open as Coral.Tooltip#open
      @borrows Coral.mixin.overlay#returnFocus as Coral.Tooltip#returnFocus
      @borrows Coral.mixin.overlay#trapFocus as Coral.Tooltip#trapFocus
      @borrows Coral.mixin.overlay#show as Coral.Tooltip#show
      @borrows Coral.mixin.overlay#hide as Coral.Tooltip#hide
      @borrows Coral.mixin.overlay#returnFocusTo as Coral.Tooltip#returnFocusTo
      @borrows Coral.mixin.overlay#event:coral-overlay:beforeopen as Coral.Tooltip#coral-overlay:beforeopen
      @borrows Coral.mixin.overlay#event:coral-overlay:beforeclose as Coral.Tooltip#coral-overlay:beforeclose
      @borrows Coral.mixin.overlay#event:coral-overlay:open as Coral.Tooltip#coral-overlay:open
      @borrows Coral.mixin.overlay#event:coral-overlay:close as Coral.Tooltip#coral-overlay:close
    */
    name: 'Tooltip',
    tagName: 'coral-tooltip',
    className: CLASSNAME,
    extend: Coral.Overlay,

    /** @protected */
    _overlayAnimationTime: Coral.mixin.overlay.FADETIME,

    properties: {
      /**
        The variant of tooltip.

        @type {Coral.Tooltip.variant}
        @default Coral.Tooltip.variant.INFO
        @htmlattribute variant
        @htmlattributereflected
        @memberof Coral.Tooltip#
      */
      'variant': {
        default: variant.INFO,
        reflectAttribute: true,
        validate: Coral.validate.enumeration(variant),
        sync: function() {
          this.$.removeClass(ALL_VARIANT_CLASSES).addClass(this._className + '--' + this.variant);
        }
      },

      /**
        The amount of time in miliseconds to wait before showing the tooltip when the target is interacted with.

        @type {Number}
        @default 500
        @htmlattribute delay
        @memberof Coral.Tooltip#
      */
      'delay': {
        default: 500,
        transform: Coral.transform.number
      },

      /**
        The Tooltip content element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Tooltip#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-tooltip-content'
      }),

      /**
        The point on the overlay we should anchor from when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.LEFT_CENTER
        @htmlattribute alignmy
        @memberof Coral.Tooltip#
      */
      'alignMy': {
        default: Coral.Overlay.align.LEFT_CENTER
      },

      /**
        The point on the target we should anchor to when positioning.

        @type {Coral.Overlay.align}
        @default Coral.Overlay.align.RIGHT_CENTER
        @htmlattribute alignat
        @memberof Coral.Tooltip#
      */
      'alignAt': {
        default: Coral.Overlay.align.RIGHT_CENTER
      },

      /**
        The placement of the overlay. This property sets {@link Coral.Tooltip#alignMy} and {@link Coral.Tooltip#alignAt}.

        @type {Coral.Overlay.placement}
        @default Coral.Overlay.placement.RIGHT
        @name placement
        @htmlattribute placement
        @memberof Coral.Tooltip#
      */

      /**
        The distance the overlay should be from its target.

        @type {Number}
        @default 5
        @htmlattribute offset
        @memberof Coral.Tooltip#
      */
      'offset': {
        default: TOOLTIP_ARROW_SIZE
      },

      // JSDoc inherited
      'open': {
        sync: function() {
          if (!this.open) {
            // Stop previous show operations from happening
            this._cancelShow();
          }
        }
      },

      // JSDoc inherited
      'target': {
        set: function(value) {
          if (this.interaction === interaction.ON) {
            // Add listeners to the target
            var target = this._getTarget(value);
            this._addTargetListeners(target);
          }
        }
      },

      /**
        Whether the tooltip should show itself when the target is interacted with.

        @type {Coral.Tooltip.interaction}
        @default Coral.Tooltip.interaction.ON
        @name interaction
        @htmlattribute interaction
        @memberof Coral.Tooltip#
      */
      'interaction': {
        default: interaction.ON,
        set: function(value) {
          var target = this._getTarget();

          if (target) {
            if (value === interaction.ON) {
              this._addTargetListeners(target);
            }
            else {
              this._removeTargetListeners(target);
            }
          }

          this._interaction = value;
        }
      }
    },

    /** @ignore */
    _render: function() {
      this._id = Coral.commons.getUID();

      var fragment = document.createDocumentFragment();

      var content = this._elements.content = this.querySelector('coral-tooltip-content') || document.createElement('coral-tooltip-content');
      fragment.appendChild(content);

      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
    },

    /** @ignore */
    _initialize: function() {
      // Let the tooltip be focusable
      // We'll marshall focus around when its focused
      this.tabIndex = -1;

      // ARIA
      this.setAttribute('role', 'tooltip');
    },

    /** @ignore */
    _applyPosition: function(position, feedback) {
      var top = position.top;
      var left = position.left;

      if (feedback.horizontal === 'left') {
        this._setArrowClass(Coral.Overlay.placement.LEFT);
      }
      else if (feedback.horizontal === 'right') {
        this._setArrowClass(Coral.Overlay.placement.RIGHT);
      }
      else if (feedback.vertical === 'bottom') {
        this._setArrowClass(Coral.Overlay.placement.BOTTOM);
      }
      else if (feedback.vertical === 'top') {
        this._setArrowClass(Coral.Overlay.placement.TOP);
      }

      this.style.top = top + 'px';
      this.style.left = left + 'px';
    },

    _setArrowClass: function(placement) {
      this.$.removeClass(ALL_PLACEMENT_CLASSES).addClass(placementClassMap[placement]);
    },

    /** @ignore */
    _handleFocus: function() {
      // Don't hide
      this._cancelHide();

      // Focus on the first focuable element
      this.$.find(':focusable').first().focus();
    },

    /** @ignore */
    _handleFocusOut: function() {
      var tooltip = this;

      // The item that should have focus will get it on the next frame
      Coral.commons.nextFrame(function() {
        var targetIsFocused = document.activeElement === tooltip._getTarget();
        var tooltipIsFocused = tooltip.contains(document.activeElement);
        if (!targetIsFocused && !tooltipIsFocused) {
          tooltip._cancelShow();
          tooltip.open = false;
        }
      });
    },

    /** @ignore */
    _cancelShow: function() {
      clearTimeout(this._showTimeout);
    },

    /** @ignore */
    _cancelHide: function() {
      clearTimeout(this._hideTimeout);
    },

    /** @ignore */
    _startHide: function() {
      if (this.delay === 0) {
        // Hide immediately
        this._handleFocusOut();
      }
      else {
        var tooltip = this;
        this._hideTimeout = setTimeout(function() {
          tooltip._handleFocusOut();
        }, this.delay);
      }
    },

    /** @ignore */
    _addTargetListeners: function(target) {
      if (!target) {
        return;
      }

      // Make sure we don't add listeners twice to the same element for this particular tooltip
      if (target['_hasCoralTooltipListeners' + this._id]) {
        return;
      }
      target['_hasCoralTooltipListeners' + this._id] = true;

      // Remove listeners from the old target
      if (this._oldTarget) {
        var oldTarget = this._getTarget(this._oldTarget);
        if (oldTarget) {
          this._removeTargetListeners(oldTarget);
        }
      }

      // Store the current target value
      this._oldTarget = target;

      var tooltip = this;
      var $target = $(target);

      $target.on('mouseenter.CoralTooltip' + this._id + ' focusin.CoralTooltip' + this._id, function(event) {
        // Don't let the tooltip hide
        tooltip._cancelHide();

        if (!tooltip.open) {
          tooltip._cancelShow();

          if (tooltip.delay === 0) {
            // Show immediately
            tooltip.show();
          }
          else {
            tooltip._showTimeout = setTimeout(function() {
              tooltip.show();
            }, tooltip.delay);
          }
        }
      });

      $target.on('mouseleave.CoralTooltip' + this._id, function(event) {
        if (!tooltip.preventAutoHide) {
          tooltip._startHide();
        }
      });

      $target.on('focusout.CoralTooltip' + this._id, function(event) {
        if (!tooltip.preventAutoHide) {
          tooltip._handleFocusOut();
        }
      });
    },

    /** @ignore */
    _removeTargetListeners: function(target) {
      // Remove listeners for this tooltip and mark that the element doesn't have them
      // Use the ID so we can support multiple tooltips on the same element
      $(target).off('.CoralTooltip' + this._id);
      target['_hasCoralTooltipListeners' + this._id] = false;
    },

    /**
      Hide the tooltip if it's on the top.
      @ignore
    */
    _handleEscape: function(event) {
      if (this.open && this._isTopOverlay()) {
        this.hide();
      }
    },
  });

  Coral.register( /** lends Coral.Tooltip.Content# */ {
    /**
      @class Coral.Tooltip.Content
      @classdesc The Tooltip content component
      @htmltag coral-tooltip-content
      @extends Coral.Component
    */
    name: 'Tooltip.Content',
    tagName: 'coral-tooltip-content'
  });

  // Expose enums globally
  Coral.Tooltip.variant = variant;

}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral3-Slider';

  var CLASSNAME_HANDLE = 'coral3-Slider-handle';

  var CLASSNAME_INPUT = 'coral3-Slider-input';

  var TAGNAME_ITEM = 'coral-slider-item';

  // Accessibility remark
  //
  // adding both aria attributes to inputs and handles is necessary to
  // make the announcements work on Windows (Surface) Narrator

  /**
    Boolean to flag support for HTML5 input[type=range]

    @ignore
  */
  var supportsRangeInput = (function() {
    var i = document.createElement('input');
    i.setAttribute('type', 'range');
    return (i.type === 'range');
  })();

  /**
    Slider orientations.

    @enum {String}
    @memberof Coral.Slider
  */
  var orientation = {
    /** Horizontal slider. */
    HORIZONTAL: 'horizontal',
    /** Vertical slider. */
    VERTICAL: 'vertical'
  };

  //collection
  var SliderCollection = function(slider) {
    this._slider = slider;
  };

  // assigns the prototype to get access to the Collection signature methods
  SliderCollection.prototype = Object.create(Coral.Collection.prototype);

  SliderCollection.prototype.add = function(item, before) {
    var config;

    if (!(item instanceof HTMLElement)) {
      // creates a new item and initializes its values
      config = item;
      item = document.createElement(TAGNAME_ITEM);
    }

    // insertBefore with an undefined "before" argument fails on IE9.
    this._slider.insertBefore(item, before || null);

    // This needs to come after the DOM insertion since we have a requirement that
    // TabPanel.Item#selected cannot be set to true until after the TabPanel.Item has been added
    // to a TabPanel.
    if (config) {
      item.set(config, true);
    }

    return item;
  };

  SliderCollection.prototype.getAll = function() {
    return this._slider.$.children(TAGNAME_ITEM).toArray();
  };

  Coral.register( /** @lends Coral.Slider# */ {
    /**
      @class Coral.Slider
      @classdesc A Slider component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-slider
    */
    // Based on ARIA standard http://www.w3.org/WAI/PF/aria/roles#slider
    name: 'Slider',
    tagName: 'coral-slider',
    className: CLASSNAME,

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      'key:up .coral3-Slider-handle': '_handleKey',
      'key:right .coral3-Slider-handle': '_handleKey',
      'key:down .coral3-Slider-handle': '_handleKey',
      'key:left .coral3-Slider-handle': '_handleKey',
      'key:pageUp .coral3-Slider-handle': '_handleKey',
      'key:pageDown .coral3-Slider-handle': '_handleKey',
      'key:home .coral3-Slider-handle': '_handleKey',
      'key:end .coral3-Slider-handle': '_handleKey',

      'capture:mouseenter .coral3-Slider-handle': '_onMouseEnter',
      'capture:mouseleave .coral3-Slider-handle': '_onMouseLeave',

      'input': '_onInputChangeHandler',

      'touchstart': '_onMouseDown',
      'mousedown': '_onMouseDown',

      'capture:focus': '_focus',
      'capture:blur': '_blur'
    },

    properties: {
      /**
        Increment value of one step.

        @type {Number}
        @default 1
        @htmlattribute step
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'step': {
        default: 1,
        reflectAttribute: true,
        transform: Coral.transform.number,
        validate: [
          Coral.validate.valueMustChange,
          function(newValue, oldValue) {
            // step value has to be a positive number
            return newValue !== null && newValue > 0;
          }
        ],
        sync: function() {
          this._elements.$inputs.prop('step', this.step);
          this._elements.$inputs.attr('aria-valuestep', this.step);
          // @polyfill IE9
          this._elements.$handles.attr('aria-valuestep', this.step);
        }
      },

      /**
        The minimum value.

        @type {Number}
        @default 1
        @htmlattribute min
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'min': {
        default: 1,
        reflectAttribute: true,
        transform: Coral.transform.number,
        sync: function() {
          this.$.attr('aria-valuemin', this.min);

          this._elements.$inputs.prop('min', this.min);
          this._elements.$inputs.attr('aria-valuemin', this.min);
          // @polyfill IE9
          this._elements.$handles.attr('aria-valuemin', this.min);
        }
      },

      /**
        The maximum value.

        @type {Number}
        @default 100
        @htmlattribute max
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'max': {
        default: 100,
        reflectAttribute: true,
        transform: Coral.transform.number,
        sync: function() {
          this._elements.$inputs.prop('max', this.max);
          this._elements.$inputs.attr('aria-valuemax', this.max);
          // @polyfill IE9
          this._elements.$handles.attr('aria-valuemax', this.max);
        }
      },

      /**
        Display tooltips for the slider value.

        @type {Boolean}
        @default false
        @htmlattribute tooltips
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'tooltips': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {}
      },

      /**
        Orientation of the slider, which can be VERTICAL or HORIZONTAL.

        @type {Coral.Slider.orientation}
        @default Coral.Slider.orientation.HORIZONTAL
        @htmlattribute orientation
        @memberof Coral.Slider#
      */
      'orientation': {
        default: orientation.HORIZONTAL,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(orientation)
        ],
        sync: function() {
          var isVertical = this.orientation === orientation.VERTICAL;

          this.$.toggleClass(CLASSNAME + '--vertical', isVertical);
          this.$.attr('aria-orientation', this.orientation);
          this._elements.$inputs.attr('aria-orientation', this.orientation);
          // @polyfill IE9
          this._elements.$handles.attr('aria-orientation', this.orientation);

          this._moveHandles();
        }
      },

      /**
        The current value of the slider.

        @type {String}
        @default {@link Coral.Slider#min}
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Slider#
        @fires Coral.mixin.formField#change
      */
      'value': {
        default: function() {
          return this.min;
        },
        alsoSync: ['filled'],
        transform: Coral.transform.number,
        get: function() {
          return parseInt(this._elements.$inputs[0].value, 10);
        },
        set: function(value) {
          // setting the value works on single value
          if (this._elements.$handles.length === 1) {
            var handle = this._elements.$handles[0],
              input = this._elements.$inputs[0];

            value = this._snapValueToStep(value, this.min, this.max, this.step);

            input.value = value;
            input.setAttribute('aria-valuenow', value);
            input.setAttribute('aria-valuetext', this._getLabel(value));
            // @polyfill IE9
            handle.setAttribute('aria-valuenow', value);
            handle.setAttribute('aria-valuetext', this._getLabel(value));

            this._moveHandles();
          }
        },
        sync: function() {
          if (this._elements.$handles.length === 1) {
            this.setAttribute('value', this.value);
          }
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.$inputs[0].name;
        },
        set: function(name) {
          for (var i = 0; i < this._elements.$handles.length; i++) {
            this._elements.$inputs[i].name = name;
          }
        }
      },

      /**
        @ignore
      */
      '_values': {
        attribute: null,
        default: function() {
          return [this.min, this.max];
        },
        get: function() {
          var ret = [];

          for (var i = 0; i < this._elements.$inputs.length; i++) {
            ret.push(parseInt(this._elements.$inputs[i].value, 10));
          }

          return ret;
        },
        set: function(values) {
          var handle, input, value;
          if (values && values.length === this._elements.$handles.length) {
            for (var i = 0; i < this._elements.$handles.length; i++) {
              value = values[i] = this._snapValueToStep(values[i], this.min, this.max, this.step);
              handle = this._elements.$handles[i];
              input = this._elements.$inputs[i];

              input.value = value;
              input.setAttribute('aria-valuenow', value);
              input.setAttribute('aria-valuetext', this._getLabel(value));
              // @polyfill IE9
              handle.setAttribute('aria-valuenow', value);
              handle.setAttribute('aria-valuetext', this._getLabel(value));
            }

            this._moveHandles();
          }
        },
        // No-op is required so we can alsoSync
        sync: function() {},
        alsoSync: ['filled']
      },

      /**
        Fill a value or value range using a highlight color.

        @type {Boolean}
        @default false
        @htmlattribute filled
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'filled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          if (this.filled) {
            this._updateFill();
          }
          this._elements.$fill.toggleClass('is-hidden', !this.filled);
        }
      },

      /**
        Whether this field is disabled or not. This value is reflected as an attribute in the DOM. Implementers should
        additionally set 'aria-disabled' to improve accessibility of the component.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.Slider#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.setAttribute('aria-disabled', this.disabled);
          this._elements.$inputs.prop('disabled', this.disabled);
          this._elements.$handles.attr('aria-disabled', this.disabled);

          // if we usually set the focus on the handle,
          // we need to remove the tabindex in order to preserve the taborder
          if (!supportsRangeInput) {
            this._elements.$handles.prop('tabindex', this.disabled ? -1 : 0);
          }
        }
      },

      // JSDoc inherited
      'labelledBy': {
        override: true,
        attribute: 'labelledby',
        transform: Coral.transform.string,
        get: function() {
          if (this._elements.$handles.length === 1) {
            return this._elements.$inputs[0].getAttribute('aria-labelledby');
          }
          else {
            return this.getAttribute('aria-labelledby');
          }
        },
        set: function(value) {
          var label;

          if (!value) { // removing the labels
            this._updateForAttributes(this.labelledBy, this._elements.$inputs[0].id, true);
            this.removeAttribute('aria-labelledby');

            this._elements.$handles.removeAttr('aria-labelledby');
            this._elements.$inputs.removeAttr('aria-labelledby');

            return;
          }

          // adding labels
          if (this._elements.$handles.length === 1) {
            this._elements.$handles[0].setAttribute('aria-labelledby', value);
            this._elements.$inputs[0].setAttribute('aria-labelledby', value);
          }
          else {
            this.setAttribute('aria-labelledby', value);

            for (var i = 0; i < this._elements.$handles.length; i++) {
              label = value + ' ' + this._elements.$handles[i].querySelector('label').id;

              this._elements.$handles[i].setAttribute('aria-labelledby', label);
              this._elements.$inputs[i].setAttribute('aria-labelledby', label);
            }
          }
          this._updateForAttributes(value, this._elements.$inputs[0].id);
        }
      },

      /**
        The Collection Interface that allows interacting with the items that the component contains. See
        {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Slider#
      */
      'items': {
        set: function() {},
        get: function() {
          // just init on demand
          if (!this._items) {
            this._items = new SliderCollection(this);
          }

          return this._items;
        }
      }
    },

    /**
      handles any mousedown/touchstart on the whole slider
      @private
    */
    _onMouseDown: function(event) {
      // do not accept right mouse button clicks
      if (event instanceof MouseEvent) {
        if ((event.which || event.button) !== 1) {
          return;
        }
      }

      event.preventDefault();

      this._currentHandle = $(event.target).closest('.' + CLASSNAME_HANDLE);

      // If no handle was touched:
      // the closest handle needs to jump to the closest valid position
      if (!this._currentHandle.length) {
        var p = this._getPoint(event),
          handle = this._findNearestHandle(p.pageX, p.pageY),
          val = this._getValueFromCoord(p.pageX, p.pageY, true);

        this._updateValue(handle, val);
        this._setHandleFocus(handle);

        return;
      }

      this._currentHandle.addClass('is-dragged');
      $(document.body).addClass('u-coral-closedHand');

      if (this.tooltips) {
        var idx = this._elements.$handles.index(this._currentHandle);

        this._openTooltip(this._currentHandle, this._getLabel(this._values[idx]));
      }

      this._draggingHandler = this._handleDragging.bind(this);
      this._mouseUpHandler = this._mouseUp.bind(this);

      Coral.events.on('mousemove', this._draggingHandler);
      Coral.events.on('mouseup', this._mouseUpHandler);

      Coral.events.on('touchmove', this._draggingHandler);
      Coral.events.on('touchend', this._mouseUpHandler);
      Coral.events.on('touchcancel', this._mouseUpHandler);

      this._setHandleFocus(this._currentHandle);
    },

    /**
      @private
      @return {Object} which contains the real coordinates
    */
    _getPoint: function(event) {
      return event.changedTouches && event.changedTouches.length > 0 ?
        event.changedTouches[0] :
        event.touches && event.touches.length > 0 ?
          event.touches[0] :
          event;
    },

    /**
      will set the focus either on the handle element
      or its input if range is supported

      @protected
    */
    _setHandleFocus: function(handle) {
      if (supportsRangeInput) {
        handle.find('.' + CLASSNAME_INPUT).focus();
      }
      else {
        handle.focus();
      }
    },

    /**
      Handles keyboard interaction with the handlers.
      In case input[type=range] is supported, the focus
      will be on the input and keyboard handling will happen natively

      @private
    */
    _handleKey: function(event) {
      event.preventDefault();

      this._focus(event);

      var handle = $(event.matchedTarget),
        idx = this._elements.$handles.index(handle),
        v = parseInt(this._values[idx], 10);

      if (event.keyCode === Coral.Keys.keyToCode('up') ||
        event.keyCode === Coral.Keys.keyToCode('right') ||
        event.keyCode === Coral.Keys.keyToCode('pageUp')) { // increase
        v += this.step;

      }
      else if (event.keyCode === Coral.Keys.keyToCode('down') ||
        event.keyCode === Coral.Keys.keyToCode('left') ||
        event.keyCode === Coral.Keys.keyToCode('pageDown')) { // decrease
        v -= this.step;

      }
      else if (event.keyCode === Coral.Keys.keyToCode('home')) { // min
        v = this.min;

      }
      else if (event.keyCode === Coral.Keys.keyToCode('end')) { // max
        v = this.max;
      }

      this._updateValue(handle, v);
    },

    /**
      Finds the nearest handle based on X/Y coordinates

      @private
    */
    _findNearestHandle: function(mouseX, mouseY) {
      var closestDistance = Infinity, // Incredible large start value
        closestHandle;

      function calculateDistance(elem, mouseX, mouseY) {
        var box = elem.getBoundingClientRect(),
          top = box.top + window.pageYOffset,
          left = box.left + window.pageXOffset;

        return Math.floor(
          Math.sqrt(Math.pow(mouseX - (left + (box.width / 2)), 2) +
          Math.pow(mouseY - (top + (box.height / 2)), 2))
        );
      }

      // Find the nearest handle
      this._elements.$handles.each(function(index, handle) {
        var distance = calculateDistance(handle, mouseX, mouseY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestHandle = handle;
        }
      });

      return $(closestHandle);
    },

    /**
      Moves the handles to right position
      based on the data in this._values

      @private
    */
    _moveHandles: function() {
      var self = this;

      function calculatePercent(value) {
        return (value - self.min) / (self.max - self.min) * 100;
      }

      // Set the handle position as a percentage based on the stored values
      this._elements.$handles.each(function(index, handle) {
        var $handle = $(handle),
          percent = calculatePercent(self._values[index]);

        if (self.orientation === orientation.VERTICAL) {
          $handle.css({
            'bottom': percent + '%',
            'left': ''
          });
        }
        else { // Horizontal
          $handle.css({
            'left': percent + '%',
            'bottom': ''
          });
        }

        self._updateTooltip($handle, self._getLabel(self._values[index]));
      });
    },

    /**
      Handles "onchange" events from the input.
      This is only neede in case of IE10 which doesn't handle "oninput event".
      In that case, the _onInputChangeHandler will be called from this handler.

      @private
     */
    _onInputChange: function(event) {
      if (typeof (event.target.oninput) === 'undefined') {
        this._onInputChangeHandler(event);
      }
    },

    /**
      Handles "oninput" events from the input.
      This makes ensures native inputs like
      - direct keyboard interaction with input[type=range]
      - accessibility features with input[type=range]

      Note we are not using the "_onInputChange" directly because Firefox
      will trigger the "change" event only after the focus has been lost.

      @private
     */
    _onInputChangeHandler: function(event) {
      // stops the current event
      event.stopPropagation();

      var handle = $(event.target).closest('.' + CLASSNAME_HANDLE);

      if (event.target === document.activeElement) {
        this._focus(event);
      }

      this._updateValue(handle, event.target.value, true);
    },

    /**
      Handles "focusin" event from  either an input or its handle.

      @private
     */
    _focus: function(event) {
      var self = this,
        // Depending on support for input[type=range],
        // the event.target could be either the handle or its child input.
        // Use $.closest() to locate the actual handle.
        $handle = $(event.target).closest('.' + CLASSNAME_HANDLE),
        handle = $handle[0],
        index = this._elements.$handles.index(handle);

      this.$.addClass('is-focused');
      $handle.addClass('is-focused');

      if (this.tooltips) {
        this._openTooltip($handle, self._getLabel(self._values[index]));
      }

      Coral.events.on('touchstart.CoralSlider mousedown.CoralSlider', function(event) {
        if ($(event.target).closest(self).length === 0) {
          return;
        }
        $(event.target).trigger('blur');
      });
    },

    /**
      Handles "focusout" event from  either an input or its handle.

      @private
    */
    _blur: function(event) {
      // Depending on support for input[type=range],
      // the event.target could be either the handle or its child input.
      // Use $.closest() to locate the actual handle.
      var $handle = $(event.target).closest('.' + CLASSNAME_HANDLE),
        handle = $handle[0];

      this.$.removeClass('is-focused');
      $handle.removeClass('is-focused');

      if (this.tooltips) {
        this._closeTooltip(handle);
      }

      Coral.events.off('touchstart.CoralSlider mousedown.CoralSlider');
    },

    /**
      handles mousemove/touchmove after a succesful start on an handle

      @private
    */
    _handleDragging: function(event) {
      var p = this._getPoint(event);

      this._updateValue(this._currentHandle, this._getValueFromCoord(p.pageX, p.pageY));

      event.preventDefault();
    },

    /**
      updates the value for a handle
      @param handle
      @param val
      @param {Boolean} forceEvent
        Always triggers the event. If <code>true</code> the change event will be triggered without checking if the value really changed. This is useful if we are called from something like the _onInputChange where new value has already been updated AND we are certain the change event should be triggered without checking.
      @protected
    */
    _updateValue: function(handle, val, forceEvent) {
      // this is prepared to work for multiple handles
      var idx = this._elements.$handles.index(handle);
      var values = this._values;

      values[idx] = val;

      var oldval = this._values;
      this.set('_values', values);
      var newval = this._values;

      if (forceEvent || oldval.join(':') !== newval.join(':')) {
        this.trigger('change');
      }
    },

    /**
      @private
    */
    _getValueFromCoord: function(posX, posY, restrictBounds) {
      var self = this,
        percent,
        elementOffset = self.$.offset();

      if (self.orientation === orientation.VERTICAL) {
        var elementHeight = self.$.height();
        percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
      }
      else {
        var elementWidth = self.$.width();
        percent = ((posX - elementOffset.left) / elementWidth);
      }

      // if the bounds are retricted, as with _handleClick, we shouldn't change the value.
      if (restrictBounds && (percent < 0 || percent > 1)) {
        return NaN;
      }

      var rawValue = self.min * 1 + ((self.max - self.min) * percent);

      // Snap value to nearest step
      return this._snapValueToStep(rawValue, self.min, self.max, self.step);
    },

    /**
      @private
    */
    _snapValueToStep: function(rawValue, min, max, step) {
      step = parseFloat(step);
      var remainder = ((rawValue - min) % step), snappedValue,
        floatString = step.toString().replace(/^(?:\d+)(?:\.(\d+))?$/g, '$1'),
        precision = floatString.length;

      if (Math.abs(remainder) * 2 >= step) {
        snappedValue = (rawValue - Math.abs(remainder)) + step;
      }
      else {
        snappedValue = rawValue - remainder;
      }

      if (snappedValue < min) {
        snappedValue = min;
      }
      else if (snappedValue > max) {
        snappedValue = min + Math.floor((max - min) / step) * step;
      }

      // correct floating point behavior by rounding to step precision
      if (precision > 0) {
        snappedValue = parseFloat(snappedValue.toFixed(precision));
      }

      return snappedValue;
    },

    /**
     *
     * @private
     */
    _onMouseEnter: function(event) {
      var handle = event.matchedTarget,
        $handle = $(event.matchedTarget),
        index = this._elements.$handles.index(handle);

      if (this.tooltips) {
        this._openTooltip($handle, this._getLabel(this._values[index]));
      }
    },

    /**
     *
     * @private
     */
    _onMouseLeave: function(event) {
      var $handle = $(event.matchedTarget);

      // in case the user drags the handle
      // we do not close the tooltip
      if (this.tooltips && !$handle.hasClass('is-dragged')) {
        this._closeTooltip($handle);
      }
    },

    /**
      end operation of a dragging flow
      @private
    */
    _mouseUp: function() {
      this._currentHandle.removeClass('is-dragged');
      $(document.body).removeClass('u-coral-closedHand');

      this._closeTooltip(this._currentHandle);

      Coral.events.off('mousemove', this._draggingHandler);
      Coral.events.off('touchmove', this._draggingHandler);
      Coral.events.off('mouseup', this._mouseUpHandler);
      Coral.events.off('touchend', this._mouseUpHandler);
      Coral.events.off('touchcancel', this._mouseUpHandler);

      this._currentHandle = null;
      this._draggingHandler = null;
      this._mouseUpHandler = null;
    },

    /**
      called when it is necessary to update the fill
      @protected
     */
    _updateFill: function() {
      var percent = ((this._values[0] - this.min) / (this.max - this.min)) * 100;

      if (this.orientation === orientation.VERTICAL) {
        this._elements.$fill.css('height', percent + '%');
      }
      else {
        this._elements.$fill.css('width', percent + '%');
      }
    },

    /**
      Opens the tooltip of a handle
      @protected
    */
    _openTooltip: function(handle, value) {
      var _tooltip = handle.find('coral-tooltip')[0],
        placement = this.orientation === orientation.VERTICAL ?
          Coral.Overlay.placement.RIGHT :
          Coral.Overlay.placement.TOP;

      _tooltip.set({
        content: {
          textContent: value
        },
        target: handle[0],
        placement: placement
      });

      _tooltip.open = true;
    },

    /**
      Updates the tooltip of a handle
      @protected
    */
    _updateTooltip: function(handle, value) {
      var _tooltip = handle.find('coral-tooltip')[0];

      _tooltip.content.textContent = value;
    },

    /**
      Closes the tooltip of a handle
      @protected
    */
    _closeTooltip: function(handle) {
      var _tooltip = $(handle).find('coral-tooltip')[0];

      _tooltip.open = false;
    },

    /**
      Gets the label for a passed value.

      @param value
      @return {String|Number} the known label from the item or the value itself
      @protected
    */
    _getLabel: function(value) {
      var items = this.items.getAll();
      var item;

      for (var i = 0; i < items.length; i++) {
        if (Coral.transform.number(items[i].value) === Coral.transform.number(value)) {
          item = items[i];
          break;
        }
      }

      // Use the innerHTML of the item if one was found
      return item ? item.content.innerHTML : value;
    },

    /**
      @protected
    */
    _renderTemplate: function() {
      var frag;

      frag = Coral.templates.Slider.base.call(this._elements);
      this.appendChild(frag);
    },

    /**
      @private
    */
    _render: function() {
      this._renderTemplate();

      this._elements.$handles = this.$.find('.' + CLASSNAME_HANDLE);
      this._elements.$inputs = this.$.find('.' + CLASSNAME_INPUT);
      this._elements.$fill = $(this._elements.fillHandle);

      this.setAttribute('role', 'presentation');

      if (!supportsRangeInput) {
        this._elements.$inputs.each(function(i, inputElement) {
          var handleElement = this._elements.$handles.get(i);

          inputElement.type = 'hidden';
          handleElement.setAttribute('id', inputElement.id);
          handleElement.setAttribute('role', 'slider');
          handleElement.setAttribute('tabindex', '0');
          inputElement.removeAttribute('id');

        }.bind(this));
      }
    }
  });

  Coral.Slider.orientation = orientation;

}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral3-Slider-item';

  Coral.register( /** @lends Coral.Slider.Item# */ {
    /**
      @class Coral.Slider.Item
      @classdesc A Slider.Item component
      @extends Coral.Component
      @htmltag coral-slider-item
    */
    name: 'Slider.Item',
    tagName: 'coral-slider-item',
    className: CLASSNAME,

    properties: {

      /**
        The slider's item value. Although this must be a number in the current implement, this may change.  
       
        @type {Number}
        @default null
        @htmlattribute value
        @htmlattributereflected
        @memberof Coral.Slider.Item#
      */
      'value': {
        reflectAttribute: true,
        transform: Coral.transform.number
      },

      /**
        The content zone element of the item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Select.Item#
      */
      'content': {
        contentZone: true,
        set: function() {},
        get: function() {
          return this;
        }
      },
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral3-Slider';

  Coral.register( /** @lends Coral.RangedSlider# */ {
    /**
      @class Coral.RangedSlider
      @classdesc A RangedSlider component
      @extends Coral.Slider
      @htmltag coral-rangedslider
    */
    name: 'RangedSlider',
    tagName: 'coral-rangedslider',
    className: CLASSNAME,
    extend: Coral.Slider,

    properties: {
      /**
        Value property does nothing on a RangedSlider.

        @ignore
        @name value
        @memberof Coral.RangedSlider#
      */

      /**
        Ranged sliders are always filled.

        @type {Boolean}
        @default true
        @override
        @readonly
        @memberof Coral.RangedSlider#
      */
      'filled': {
        default: true,
        override: true,
        set: function() {
          this._elements.$fill.removeClass('is-hidden');
        },
        sync: function() {
          this._updateFill();
        }
      },

      /**
        The starting value of the range.

        @type {String}
        @default {@link Coral.RangedSlider#min}
        @fires Coral.mixin.formField#change
        @memberof Coral.RangedSlider#
        @htmlattribute startValue
        @htmlattributereflected
      */
      'startValue': {
        attribute: 'startvalue',
        set: function(value) {
          var values = this.values;
          values[0] = value;
          this.values = values;
        },
        get: function() {
          return this.values[0];
        }
      },

      /**
        The ending value of the range.

        @type {String}
        @default {@link Coral.RangedSlider#max}
        @fires Coral.mixin.formField#change
        @memberof Coral.RangedSlider#
        @htmlattribute endValue
        @htmlattributereflected
      */
      'endValue': {
        attribute: 'endvalue',
        set: function(value) {
          var values = this.values;
          values[1] = value;
          this.values = values;
        },
        get: function() {
          return this.values[1];
        }
      },

      /**
        The current values of the ranged slider.

        @type {Array.<String>}
        @default [{@link Coral.RangedSlider#startValue},{@link Coral.RangedSlider#endValue}]
        @fires Coral.mixin.formField#change
        @memberof Coral.RangedSlider#
      */
      'values': Coral.property.proxy({
        path: '_values'
      })
    },

    /**
      @private
    */
    _getHighestValue: function() {
      return Math.max.apply(null, this.values);
    },

    /**
      @private
    */
    _getLowestValue: function() {
      return Math.min.apply(null, this.values);
    },

    /**
      @override
    */
    _updateValue: function(handle, val) {
      var idx = this._elements.$handles.index(handle);

      if (idx === 0) {
        if (val > parseFloat(this.values[1])) {
          val = this.values[1];
        }
        this._elements.rightInput.min = val;
        this._elements.rightHandle.setAttribute('aria-valuemin', val);
      }
      else {
        if (val < parseFloat(this.values[0])) {
          val = this.values[0];
        }
        this._elements.leftInput.max = val;
        this._elements.leftHandle.setAttribute('aria-valuemax', val);
      }

      var resValue = [this.values[0], this.values[1]];
      resValue[idx] = val;

      var oldval = this.get('values');
      this.set('values', resValue);
      var newval = this.get('values');

      if (oldval.join(':') !== newval.join(':')) {
        this.trigger('change');
      }
    },

    /**
      @override
    */
    _updateFill: function() {
      var deltaMaxMinBase = 100 / (this.max - this.min);
      var percent = (this._getLowestValue() - this.min) * deltaMaxMinBase;
      var percentDiff = (this._getHighestValue() - this.min) * deltaMaxMinBase - percent;

      if (this.orientation === Coral.Slider.orientation.VERTICAL) {
        this._elements.$fill
          .css('bottom', percent + '%')
          .css('height', percentDiff + '%');
      }
      else { // Horizontal
        this._elements.$fill
          .css('left', percent + '%')
          .css('width', percentDiff + '%');
      }
    },

    /**
      @override
    */
    _renderTemplate: function() {
      var frag = Coral.templates.Slider.range.call(this._elements);

      this.appendChild(frag);
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Slider"] = this["Coral"]["templates"]["Slider"] || {};
this["Coral"]["templates"]["Slider"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  data = data_0;
  data.uid = Coral.commons.getUID();
  data_0 = data;
  var el1 = document.createTextNode("\n\n");
  frag.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral3-Slider-bar";
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["fillHandle"] = document.createElement("div");
  el4.setAttribute("handle", "fillHandle");
  el4.className += " coral3-Slider-fill is-hidden";
  el4.setAttribute("role", "presentation");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = this["leftHandle"] = document.createElement("div");
  el7.setAttribute("handle", "leftHandle");
  el7.className += " coral3-Slider-handle";
  var el8 = document.createTextNode("\n  ");
  el7.appendChild(el8);
  var el9 = this["leftInput"] = document.createElement("input");
  el9.setAttribute("handle", "leftInput");
  el9.setAttribute("type", "range");
  el9.id = data_0["uid"];
  el9.className += " coral3-Slider-input";
  el7.appendChild(el9);
  var el10 = document.createTextNode("\n  ");
  el7.appendChild(el10);
  var el11 = document.createElement("coral-tooltip");
  el11.setAttribute("variant", "inspect");
  el11.id = data_0["uid"]+"-tooltip";
  el11.setAttribute("for", data_0["uid"]);
  el11.setAttribute("interaction", "off");
  el7.appendChild(el11);
  var el12 = document.createTextNode("\n");
  el7.appendChild(el12);
  frag.appendChild(el7);
  var el13 = document.createTextNode("\n");
  frag.appendChild(el13);
  return frag;
});

this["Coral"]["templates"]["Slider"]["range"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  data = data_0;
  
  data.uidMin = Coral.commons.getUID();
  data.uidMax = Coral.commons.getUID();

  data_0 = data;
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral3-Slider-bar";
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["fillHandle"] = document.createElement("div");
  el4.setAttribute("handle", "fillHandle");
  el4.className += " coral3-Slider-fill is-hidden";
  el4.setAttribute("role", "presentation");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = this["leftHandle"] = document.createElement("div");
  el7.setAttribute("handle", "leftHandle");
  el7.className += " coral3-Slider-handle";
  var el8 = document.createTextNode("\n  ");
  el7.appendChild(el8);
  var el9 = this["rightLabel"] = document.createElement("label");
  el9.setAttribute("handle", "rightLabel");
  el9.className += " u-coral-screenReaderOnly";
  el9.id = data_0["uidMin"]+"-label";
  el9.setAttribute("for", data_0["uidMin"]);
  el9.setAttribute("aria-hidden", "true");
  el9.textContent = "Minimum";
  el7.appendChild(el9);
  var el10 = document.createTextNode("\n  ");
  el7.appendChild(el10);
  var el11 = this["leftInput"] = document.createElement("input");
  el11.setAttribute("handle", "leftInput");
  el11.setAttribute("type", "range");
  el11.id = data_0["uidMin"];
  el11.className += " coral3-Slider-input";
  el7.appendChild(el11);
  var el12 = document.createTextNode("\n  ");
  el7.appendChild(el12);
  var el13 = document.createElement("coral-tooltip");
  el13.setAttribute("variant", "inspect");
  el13.id = data_0["uidMin"]+"-tooltip";
  el13.setAttribute("for", data_0["uidMin"]);
  el13.setAttribute("interaction", "off");
  el7.appendChild(el13);
  var el14 = document.createTextNode("\n");
  el7.appendChild(el14);
  frag.appendChild(el7);
  var el15 = document.createTextNode("\n");
  frag.appendChild(el15);
  var el16 = this["rightHandle"] = document.createElement("div");
  el16.setAttribute("handle", "rightHandle");
  el16.className += " coral3-Slider-handle";
  var el17 = document.createTextNode("\n  ");
  el16.appendChild(el17);
  var el18 = this["rightLabel"] = document.createElement("label");
  el18.setAttribute("handle", "rightLabel");
  el18.className += " u-coral-screenReaderOnly";
  el18.id = data_0["uidMax"]+"-label";
  el18.setAttribute("for", data_0["uidMax"]);
  el18.setAttribute("aria-hidden", "true");
  el18.textContent = "Maximum";
  el16.appendChild(el18);
  var el19 = document.createTextNode("\n  ");
  el16.appendChild(el19);
  var el20 = this["rightInput"] = document.createElement("input");
  el20.setAttribute("handle", "rightInput");
  el20.setAttribute("type", "range");
  el20.id = data_0["uidMax"];
  el20.className += " coral3-Slider-input";
  el16.appendChild(el20);
  var el21 = document.createTextNode("\n  ");
  el16.appendChild(el21);
  var el22 = document.createElement("coral-tooltip");
  el22.setAttribute("variant", "inspect");
  el22.id = data_0["uidMax"]+"-tooltip";
  el22.setAttribute("for", data_0["uidMax"]);
  el22.setAttribute("interaction", "off");
  el16.appendChild(el22);
  var el23 = document.createTextNode("\n");
  el16.appendChild(el23);
  frag.appendChild(el16);
  var el24 = document.createTextNode("\n");
  frag.appendChild(el24);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enumeration representing StepList interaction patterns.

    @todo support "click only past steps" mode
    @enum {String}
    @memberof Coral.StepList
  */
  var interaction = {
    /** Steps can be clicked to visit them. */
    ON: 'on',
    /** Steps cannot be clicked. */
    OFF: 'off'
  };

  /**
    Enumeration representing the StepList size.

    @enum {String}
    @memberof Coral.StepList
  */
  var size = {
    /** A small-sized StepList. */
    SMALL: 'S',
    /** A large-sized StepList. */
    LARGE: 'L'
  };

  /**
    Gets the target panel of the item.

    @private
    @param {HTMLElement|String} [targetValue]
      A specific target value to use.
    @returns {?HTMLElement}
  */
  function getTarget(targetValue) {

    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }

    // Dynamically get the target node based on the target
    var newTarget = null;
    if (typeof targetValue === 'string' && targetValue.trim() !== '') {
      newTarget = document.querySelector(targetValue);
    }

    return newTarget;
  }

  // the StepList's base classname
  var CLASSNAME = 'coral-StepList';

  Coral.register( /** @lends Coral.StepList# */ {

    /**
      @class Coral.StepList
      @classdesc A StepList component
      @htmltag coral-steplist
      @extends Coral.Component
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#items as Coral.StepList#items
      @borrows Coral.mixin.selectionList#selectedItem as Coral.StepList#selectedItem
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.StepList#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.StepList#coral-collection:remove
    */
    name: 'StepList',
    tagName: 'coral-steplist',
    className: CLASSNAME,
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-step',
        supportMultiple: false,
        forceSelection: true,
        role: 'tablist'
      })
    ],

    events: {
      'click > coral-step > [handle="stepMarkerContainer"]': '_onStepMarkerClick',
      'click > coral-step > coral-step-label': '_onStepMarkerClick',

      'capture:focus > coral-step': '_onStepMarkerMouseEnter',
      'capture:mouseenter > coral-step': '_onStepMarkerMouseEnter',
      'capture:blur > coral-step': '_onStepMarkerMouseLeave',
      'capture:mouseleave > coral-step': '_onStepMarkerMouseLeave',

      'key:enter > coral-step': '_onStepKeyboardSelect',
      'key:space > coral-step': '_onStepKeyboardSelect',
      'key:home > coral-step': '_onHomeKey',
      'key:end > coral-step': '_onEndKey',
      'key:pagedown > coral-step': '_selectNextItem',
      'key:right > coral-step': '_selectNextItem',
      'key:down > coral-step': '_selectNextItem',
      'key:pageup > coral-step': '_selectPreviousItem',
      'key:left > coral-step': '_selectPreviousItem',
      'key:up > coral-step': '_selectPreviousItem'
    },

    properties: {
      /**
        The target component that will be linked to the StepList. It accepts either a CSS selector or a DOM element. If
        a CSS Selector is provided, the first matching element will be used. Items will be selected based on the index.
        If both target and {@link Coral.Step#target} are set, the second will have higher priority.

        @type {?HTMLElement|String}
        @default null
        @htmlattribute target
        @memberof Coral.StepList#
      */
      'target': {
        default: null,
        validate: function(value) {
          return value === null || typeof value === 'string' || value instanceof Node;
        },
        sync: function() {
          // we do this in the sync in case the target was not yet in the DOM
          var realTarget = getTarget(this.target);

          // we add proper accessibility if available
          if (realTarget) {
            var stepItems = this.items.getAll();
            var panelItems = realTarget.items.getAll();

            // we need to add a11y to all components, regardless of whether they can be perfectly paired
            var maxItems = Math.max(stepItems.length, panelItems.length);

            var step;
            var panel;
            for (var i = 0; i < maxItems; i++) {
              step = stepItems[i];
              panel = panelItems[i];

              // if the step has its own target, we assume the target component will handle its own accessibility.
              // if the target is an empty string we simply ignore it
              if (step && step.target && step.target.trim() !== '') {
                continue;
              }

              if (step && panel) {
                // sets the required ids
                step.id = step.id || Coral.commons.getUID();
                panel.id = panel.id || Coral.commons.getUID();

                // creates a 2 way binding for accessibility
                step.setAttribute('aria-controls', panel.id);
                panel.setAttribute('aria-labelledby', step.id);
              }
              else if (step) {
                // cleans the aria since there is no matching panel
                step.removeAttribute('aria-controls');
              }
              else {
                // cleans the aria since there is no matching Step
                panel.removeAttribute('aria-labelledby');
              }
            }
          }
        }
      },

      /**
        The size of the StepList. It accepts both lower and upper case sizes. Currently only "S" and "L" (the default)
        are available.

        @type {Coral.StepList.size}
        @default Coral.StepList.size.LARGE
        @htmlattribute size
        @memberof Coral.StepList#
      */
      'size': {
        default: size.LARGE,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          this.$[this.size === size.SMALL ? 'addClass' : 'removeClass'](CLASSNAME + '--small');
        }
      },

      /**
        Whether Steps should be interactive or not. When interactive, a Step can be clicked to jump to it.

        @type {Coral.StepList.interaction}
        @default Coral.StepList.interaction.OFF
        @htmlattribute interaction
        @htmlattributereflected
        @memberof Coral.StepList#
      */
      'interaction': {
        default: interaction.OFF,
        reflectAttribute: true,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(interaction)
        ],
        sync: function() {
          var isInteractive = this.interaction === interaction.ON;

          this.$[isInteractive ? 'addClass' : 'removeClass'](CLASSNAME + '--interactive');

          var steps = this.items.getAll();
          var stepsCount = steps.length;

          // update tab index for all children
          for (var i = 0; i < stepsCount; i++) {
            steps[i]._syncTabIndex(isInteractive);
          }
        }
      }
    },

    /** @private */
    _onSelectionChange: function(newSelection, oldSelection) {
      // sets the state-related classes every time the selection changes
      this._setStateClasses();
    },

    /** @private */
    _setStateClasses: function() {
      var selectedItemIndex = Infinity;
      this.items.getAll().forEach(function(item, index) {
        // Use attribute instead of property as items might not be initialized
        if (item.hasAttribute('selected')) {
          // Mark which one is selected
          selectedItemIndex = index;
        }

        // Add/remove classes based on index
        // Use $() instead of item.$ as items might not be initialized
        $(item)[(index < selectedItemIndex) ? 'addClass' : 'removeClass']('is-complete');
      });
    },

    /** @private */
    _onStepKeyboardSelect: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();
        event.stopPropagation();

        var item = event.matchedTarget;
        this._selectAndFocusItem(item);
      }
    },

    /** @private */
    _onStepMarkerClick: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();
        event.stopPropagation();

        var item = event.matchedTarget.parentNode;
        this._selectAndFocusItem(item);
      }
    },

    /** @private */
    _onStepMarkerMouseEnter: function(event) {
      if (this.size === size.SMALL) {
        var step = event.matchedTarget;

        // we only show the tooltip if we have a label to show
        if (step._elements.label.innerHTML.trim() !== '') {
          step._elements.tooltip.content.innerHTML = step._elements.label.innerHTML;
          step._elements.tooltip.open = true;
        }
      }
    },

    /** @private */
    _onStepMarkerMouseLeave: function(event) {
      if (this.size === size.SMALL) {
        var step = event.matchedTarget;

        step._elements.tooltip.open = false;
      }
    },

    /** @private */
    _onHomeKey: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();

        var item = this.items.getFirstSelectable();
        this._selectAndFocusItem(item);
      }
    },

    /** @private */
    _onEndKey: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();

        var item = this.items.getLastSelectable();
        this._selectAndFocusItem(item);
      }
    },

    /** @private */
    _selectNextItem: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();

        this.next();
      }
    },

    /** @private */
    _selectPreviousItem: function(event) {
      if (this.interaction === interaction.ON) {
        event.preventDefault();

        this.previous();
      }
    },

    /** @private */
    _selectAndFocusItem: function(item) {
      if (item) {
        this._selectItem(item);
        item.focus();
      }
    },

    /** @private */
    _initialize: function() {
      this.setAttribute('aria-multiselectable', 'false');

      // sets the classes based on the selection
      this._setStateClasses();
    },

    /**
      Show the next Step.

      @fires Coral.StepList#coral-steplist:change
    */
    next: function() {
      var item = this.selectedItem;
      if (item) {
        item = this.items.getNextSelectable(item);
        this._selectAndFocusItem(item);
      }
    },

    /**
      Show the previous Step.

      @fires Coral.StepList#coral-steplist:change
    */
    previous: function() {
      var item = this.selectedItem;
      if (item) {
        item = this.items.getPreviousSelectable(item);
        this._selectItem(item);
        item.focus();
      }
    }

    /**
      Triggered when the selected Step has changed.

      @event Coral.StepList#coral-steplist:change

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.selection
        The newly selected Step.
      @param {HTMLElement} event.detail.oldSelection
        The previously selected Step.
    */
  });

  // exports the enumerations
  Coral.StepList.size = size;
  Coral.StepList.interaction = interaction;

  Coral.register( /** @lends Coral.Step */ {
    /**
      @class Coral.Step
      @classdesc An Item in the StepList
      @htmltag coral-step
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
    */
    name: 'Step',
    tagName: 'coral-step',
    className: 'coral-Step',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-steplist',
        role: 'tab',
        alwaysEnabled: true
      })
    ],

    properties: {

      /**
        The Step's label element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Step#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-step-label'
      }),

      /**
        Whether the item is selected. When <code>true</code>, the item will appear as the active element in the
        StepList. The item must be a child of a StepList before this property is set to <code>true</code>.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.Step#
      */
      'selected': {
        sync: function() {
          this.$.toggleClass('is-selected', this.selected).attr('aria-selected', this.selected);

          var steplist = this.parentNode;
          if (steplist) {
            this._syncTabIndex(steplist.interaction === interaction.ON);
          }

          // in case the Step is selected, we need to communicate it to the panels.
          if (this.selected) {
            var realTarget = getTarget(this.target);
            // if the target was defined at the Step level, it has precedence over everything.
            if (realTarget) {
              realTarget.setAttribute('selected', '');
            }
            // we use the target defined at the StepList level
            else if (this.parentNode && this.parentNode.target) {
              realTarget = getTarget(this.parentNode.target);

              if (realTarget) {
                // queries the index of this item. Only queries direct children.
                var currentIndex = $(this.parentNode).children('coral-step').index(this);
                // we select the item with the same index
                var targetItem = realTarget.items.getAll()[currentIndex];

                // we select the item if it exists
                if (targetItem) {
                  targetItem.setAttribute('selected', '');
                }
              }
            }
          }
        }
      },

      /**
        The target element that will be selected when this Step is selected. It accepts a CSS selector or a DOM element.
        If a CSS Selector is provided, the first matching element will be used.

        @type {?HTMLElement|String}
        @default null
        @htmlattribute target
        @memberof Coral.Step#
      */
      'target': {
        default: null,
        validate: function(value) {
          return value === null || typeof value === 'string' || value instanceof Node;
        },
        sync: function() {

          var realTarget = getTarget(this.target);

          // we add proper accessibility if available
          if (realTarget) {
            // creates a 2 way binding for accessibility
            this.setAttribute('aria-controls', realTarget.id);
            realTarget.setAttribute('aria-labelledby', this.id);
          }
        }
      }
    },

    /** @private */
    _syncTabIndex: function(isInteractive) {
      // when interaction is on, we enable the tabindex so users can tab into the items
      if (isInteractive) {
        this.setAttribute('tabindex', this.selected ? '0' : '-1');
        this.removeAttribute('aria-readonly');
      }
      else {
        // when off, removing the tabindex allows the component to never get focus
        this.removeAttribute('tabindex');
        this.setAttribute('aria-readonly', 'true');
      }
    },

    /** @private */
    _render: function() {
      // Create a temporary fragment to hold contents
      var frag = Coral.templates.StepList.step.call(this._elements);

      // Fetch or create the content zone elements
      var label = this._elements.label = this.querySelector('coral-step-label') ||
        document.createElement('coral-step-label');

      // Add the label to the fragment
      frag.appendChild(label);

      // Finally, move any remaining elements into the label sub-component
      while (this.firstChild) {
        label.appendChild(this.firstChild);
      }

      // Add the fragment to the component
      this.appendChild(frag);
    },

    /** @private */
    _initialize: function() {
      // Generate a unique ID for the Step panel if one isn't already present
      // This will be used for accessibility purposes
      this.id = this.id || Coral.commons.getUID();
    }
  });

  Coral.register( /** @lends Coral.Step.Label */ {
    /**
      @class Coral.Step.Label
      @classdesc A StepList Item Label component
      @extends Coral.Component
      @htmltag coral-step-label
    */
    name: 'Step.Label',
    tagName: 'coral-step-label',
    className: 'coral-Step-label'
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["StepList"] = this["Coral"]["templates"]["StepList"] || {};
this["Coral"]["templates"]["StepList"]["step"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["stepMarkerContainer"] = document.createElement("span");
  el0.className += " coral-Step-markerContainer";
  el0.setAttribute("handle", "stepMarkerContainer");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = document.createElement("span");
  el2.className += " coral-Step-marker";
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  frag.appendChild(el0);
  var el4 = document.createTextNode("\n");
  frag.appendChild(el4);
  var el5 = this["tooltip"] = document.createElement("coral-tooltip");
  el5.setAttribute("handle", "tooltip");
  el5.setAttribute("target", "_prev");
  el5.setAttribute("placement", "top");
  el5.setAttribute("variant", "inspect");
  el5.setAttribute("interaction", "off");
  el5.setAttribute("offset", "5");
  frag.appendChild(el5);
  var el6 = document.createTextNode("\n");
  frag.appendChild(el6);
  var el7 = document.createElement("span");
  el7.className += " coral-Step-line";
  frag.appendChild(el7);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** lends Coral.Switch# */ {
    /**
      @class Coral.Switch
      @classdesc A Switch component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-switch
    */
    name: 'Switch',
    tagName: 'coral-switch',
    className: 'coral3-Switch',

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      /**
        Whether the switch is on or off. Changing the checked value will cause a
        {@link Coral.mixin.formField#event:change} event to be triggered.

        @type {Boolean}
        @default false
        @htmlattribute checked
        @htmlattributereflected
        @fires Coral.mixin.formField#change
        @memberof Coral.Switch#
      */
      'checked': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(value) {
          this._checked = value;

          // Instead of doing this on sync, set immediately in the setter. Users may expect the form's serialized values
          // to reflect changes immediately
          this._elements.input.checked = value;
        }
      },

      /**
        The value this switch should submit when checked. Changing this value will not trigger an event.

        @type {String}
        @default "on"
        @htmlattribute value
        @memberof Coral.Switch#
      */
      'value': {
        default: 'on',
        get: function() {
          return this._elements.input.value;
        },
        set: function(value) {
          this._elements.input.value = value;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled);
          this._elements.input.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      }
    },

    /*
      Indicates to the formField that the 'checked' property needs to be set in this component.

      @protected
     */
    _componentTargetProperty: 'checked',

    /*
      Indicates to the formField that the 'checked' property has to be extracted from the event.

      @protected
     */
    _eventTargetProperty: 'checked',

    /** @ignore */
    _render: function() {
      this.appendChild(Coral.templates.Switch.base.call(this._elements));
    }
  });
}());

this["Coral"] = this["Coral"] || {};
this["Coral"]["templates"] = this["Coral"]["templates"] || {};
this["Coral"]["templates"]["Switch"] = this["Coral"]["templates"]["Switch"] || {};
this["Coral"]["templates"]["Switch"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["input"] = document.createElement("input");
  el0.className += " coral3-Switch-input";
  el0.setAttribute("handle", "input");
  el0.setAttribute("type", "checkbox");
  el0.id = Coral["commons"]["getUID"]();
  frag.appendChild(el0);
  var el1 = this["label"] = document.createElement("span");
  el1.className += " coral3-Switch-label";
  el1.setAttribute("handle", "label");
  el1.setAttribute("aria-hidden", "true");
  frag.appendChild(el1);
  var el2 = document.createTextNode("\n");
  frag.appendChild(el2);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enumeration representing the TabList size.

    @memberof Coral.TabList
    @enum {String}
  */
  var size = {
    /** A medium-sized tablist. This is the default. */
    MEDIUM: 'M',
    /** A large-sized tablist, typically used for headers. */
    LARGE: 'L'
  };

  /**
    TabList orientations.

    @enum {String}
    @memberof Coral.TabList
  */
  var orientation = {
    /** Horizontal TabList, this is the default value. */
    HORIZONTAL: 'horizontal',
    /** Vertical TabList. */
    VERTICAL: 'vertical'
  };

  /**
    Gets the target panel of the item.

    @private
    @param {HTMLElement|String} [targetValue]
      A specific target value to use.
    @memberof Coral.Tab#

    @returns {?HTMLElement}
  */
  function getTarget(targetValue) {

    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }

    // Dynamically get the target node based on target
    var newTarget = null;
    if (typeof targetValue === 'string' && targetValue.trim() !== '') {
      newTarget = document.querySelector(targetValue);
    }

    return newTarget;
  }

  // the tablist's base classname
  var CLASSNAME = 'coral-TabList';

  Coral.register( /** @lends Coral.TabList# */ {

    /**
      @class Coral.TabList
      @classdesc A TabList component
      @htmltag coral-tablist
      @extends Coral.Component
      @mixes Coral.mixin.selectionList
      @borrows Coral.mixin.selectionList#items as Coral.TabList#items
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:add as Coral.TabList#coral-collection:add
      @borrows Coral.mixin.selectionList.Collection#event:coral-collection:remove as Coral.TabList#coral-collection:remove
    */
    name: 'TabList',
    tagName: 'coral-tablist',
    className: CLASSNAME,
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-tab',
        supportMultiple: false,
        forceSelection: true,
        role: 'tablist'
      })
    ],

    events: {
      'click > coral-tab': '_onTabClick',
      'key:home > coral-tab': '_onHomeKey',
      'key:end > coral-tab': '_onEndKey',
      'key:pagedown > coral-tab': '_selectNextItem',
      'key:right > coral-tab': '_selectNextItem',
      'key:down > coral-tab': '_selectNextItem',
      'key:pageup > coral-tab': '_selectPreviousItem',
      'key:left > coral-tab': '_selectPreviousItem',
      'key:up > coral-tab': '_selectPreviousItem'
    },

    properties: {

      /**
        The selected item in the TabList.

        @type {HTMLElement}
        @readonly
        @memberof Coral.TabList#
      */
      'selectedItem': {
        get: function() {
          return this.items.getLastSelected();
        },
        set: function() {}
      },

      /**
        The target component that will be linked to the TabList. It accepts either a CSS selector or a DOM element. If a
        CSS Selector is provided, the first matching element will be used. Items will be selected based on the index. If
        both target and {@link Coral.Tab#target} are set, the second will have higher priority.

        @type {?HTMLElement|String}
        @default null
        @htmlattribute target
        @memberof Coral.TabList#
      */
      'target': {
        default: null,
        validate: function(value) {
          return value === null || typeof value === 'string' || value instanceof Node;
        },
        sync: function() {
          // we do this in the sync in case the target was not yet in the DOM
          var realTarget = getTarget(this.target);

          // we add proper accessibility if available
          if (realTarget) {

            var tabItems = this.items.getAll();
            var panelItems = realTarget.items.getAll();

            // we need to add a11y to all component, no matter if they can be perfectly paired
            var maxItems = Math.max(tabItems.length, panelItems.length);

            var tab;
            var panel;
            for (var i = 0; i < maxItems; i++) {

              tab = tabItems[i];
              panel = panelItems[i];

              // if the tab has its own target, we assume the target component will handle its own accessibility. if the
              // target is an empty string we simply ignore it
              if (tab && tab.target && tab.target.trim() !== '') {
                continue;
              }

              if (tab && panel) {
                // sets the required ids
                tab.id = tab.id || Coral.commons.getUID();
                panel.id = panel.id || Coral.commons.getUID();

                // creates a 2 way binding for accessibility
                tab.setAttribute('aria-controls', panel.id);
                panel.setAttribute('aria-labelledby', tab.id);
              }
              else if (tab) {
                // cleans the aria since there is no matching panel
                tab.removeAttribute('aria-controls');
              }
              else {
                // cleans the aria since there is no matching tab
                panel.removeAttribute('aria-labelledby');
              }
            }
          }
        }
      },

      /**
        The size of the TabList. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
        are available.

        @type {Coral.TabList.size}
        @default Coral.TabList.size.MEDIUM
        @htmlattribute size
        @memberof Coral.TabList#
      */
      'size': {
        default: size.MEDIUM,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          this.$[this.size === size.LARGE ? 'addClass' : 'removeClass'](CLASSNAME + '--large');
        }
      },

      /**
        Orientation of the TabList.

        @type {Coral.TabList.orientation}
        @default Coral.TabList.orientation.HORIZONTAL
        @htmlattribute orientation
        @memberof Coral.TabList#
      */
      'orientation': {
        default: orientation.HORIZONTAL,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(orientation)
        ],
        sync: function() {
          this.$[this.orientation === orientation.VERTICAL ? 'addClass' : 'removeClass'](CLASSNAME + '--vertical');
        }
      }
    },

    /** @private */
    _onTabClick: function(event) {
      event.preventDefault();
      event.stopPropagation();

      var item = event.matchedTarget;
      this._selectAndFocusItem(item);
    },

    /** @private */
    _onHomeKey: function(event) {

      event.preventDefault();

      var item = this.items.getFirstSelectable();
      this._selectAndFocusItem(item);

    },

    /** @private */
    _onEndKey: function(event) {
      event.preventDefault();

      var item = this.items.getLastSelectable();
      this._selectAndFocusItem(item);
    },

    /** @private */
    _selectNextItem: function(event) {
      event.preventDefault();

      var item = this.selectedItem;
      if (item) {
        item = this.items.getNextSelectable(item);
        this._selectAndFocusItem(item);
      }
    },

    /** @private */
    _selectPreviousItem: function(event) {
      event.preventDefault();

      var item = this.selectedItem;
      if (item) {
        item = this.items.getPreviousSelectable(item);
        this._selectItem(item);
        item.focus();
      }
    },

    /** @private */
    _selectAndFocusItem: function(item) {
      if (item) {
        this._selectItem(item);
        item.focus();
      }
    },

    /** @private */
    _initialize: function() {
      this.setAttribute('aria-multiselectable', 'false');
    }

    /**
      Triggered when the selected TabList item has changed.

      @event Coral.TabList#coral-tablist:change

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.selection
        The newly selected TabList item.
      @param {HTMLElement} event.detail.oldSelection
        The previously selected TabList item.
    */
  });

  // exports the enumerations
  Coral.TabList.orientation = orientation;
  Coral.TabList.size = size;

  Coral.register( /** @lends Coral.Tab */ {
    /**
      @class Coral.Tab
      @classdesc An Item in the TabList
      @htmltag coral-tab
      @extends Coral.Component
      @mixes Coral.mixin.selectionList.Item
    */
    name: 'Tab',
    tagName: 'coral-tab',
    className: 'coral-Tab',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-tablist',
        role: 'tab'
      })
    ],

    properties: {

      /**
        The Tab's label element.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Tab#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-tab-label'
      }),

      /**
        Specifies the name of the icon used inside the Tab. See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Tab#

        @see {@link Coral.Icon}
      */
      'icon': {
        default: '',
        transform: Coral.transform.string,
        sync: function() {
          var tab = this;

          if (this.icon && this._elements.icon && !this._elements.icon.parentNode) {
            // Adds the icon back since it was blown away by textContent
            tab.insertBefore(this._elements.icon, tab.firstChild);
          }
          if (!this.icon && this._elements.icon) {
            // Removes the icon from the DOM.
            this._elements.icon.$.remove();
          }
          if (this.icon) {
            if (!this._elements.icon) {
              // Creates the icon element if necessary
              tab.insertBefore(this._createIconElement(), tab.firstChild);
            }

            // Sets the new icon and the component takes care of handling it
            this._elements.icon.icon = this.icon;
            this._elements.icon.size = Coral.Icon.size.SMALL;
          }
        }
      },

      /**
        Whether the current Tab is invalid.

        @type {Boolean}
        @default false
        @htmlattribute invalid
        @htmlattributereflected
        @memberof Coral.Tab#
      */
      'invalid': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.$.toggleClass('is-invalid', this.invalid)
            .attr('aria-invalid', this.invalid);
        }
      },

      /**
        Whether this Tab is disabled. When set to true, this will prevent every user interacting with the Tab. If
        disabled is set to true for a selected Tab it will be deselected.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @memberof Coral.Tab#
      */
      'disabled': {
        alsoSync: 'selected',
        sync: function() {
          this.$.toggleClass('is-disabled', this.disabled)
            .attr('aria-disabled', this.disabled);
        }
      },

      /**
        Whether the Tab is selected. When true, the Tab will appear as the active element in the TabList. The Tab
        must be a child of a TabList before this property is set to true. This property cannot be programmatically set
        to false.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @memberof Coral.Tab#
      */
      'selected': {
        sync: function() {
          this.$.toggleClass('is-selected', this.selected)
            .attr('tabindex', this.selected ? '0' : '-1')
            .attr('aria-selected', this.selected);

          // in case the tab is selected, we need to communicate it to the panels.
          if (this.selected) {
            var realTarget = getTarget(this.target);
            // if the target was define at the tab level, it has precedence over everything.
            if (realTarget) {
              realTarget.setAttribute('selected', '');
            }
            // we use the target defined at the tablist lavel
            else if (this.parentNode && this.parentNode.target) {
              realTarget = getTarget(this.parentNode.target);

              if (realTarget) {
                // queries the index of this item. it only querries direct children
                var currentIndex = $(this.parentNode).children('coral-tab').index(this);
                // we select the item with the same index
                var targetItem = realTarget.items.getAll()[currentIndex];

                // we select the item if it exists
                if (targetItem) {
                  targetItem.setAttribute('selected', '');
                }
              }
            }
          }
        }
      },

      /**
        The target element that will be selected when this Tab is selected. It accepts a CSS selector or a DOM element.
        If a CSS Selector is provided, the first matching element will be used.

        @type {?HTMLElement|String}
        @default null
        @htmlattribute target
        @memberof Coral.Tab#
      */
      'target': {
        default: null,
        validate: function(value) {
          return value === null || typeof value === 'string' || value instanceof Node;
        },
        sync: function() {

          var realTarget = getTarget(this.target);

          // we add proper accessibility if available
          if (realTarget) {
            // creates a 2 way binding for accessibility
            this.setAttribute('aria-controls', realTarget.id);
            realTarget.setAttribute('aria-labelledby', this.id);
          }
        }
      }
    },

    /**
      Creates the icon element and stores it in the elements cache.

      @ignore
      @returns {HTMLElement} the HTMLElement that represents the icon.
    */
    _createIconElement: function() {
      // creates the elements
      var iconEl = document.createElement('coral-icon');

      // stores the element references as this element is created dynamically
      this._elements.icon = iconEl;
      return iconEl;
    },

    /** @private */
    _render: function() {
      // Create a temporary fragment to hold contents
      var frag = document.createDocumentFragment();

      // Fetch or create the content zone elements
      var label = this._elements.label = this.querySelector('coral-tab-label') ||
        document.createElement('coral-tab-label');

      // Add the label to the fragment
      frag.appendChild(label);

      // Finally, move any remaining elements into the label sub-component
      while (this.firstChild) {
        label.appendChild(this.firstChild);
      }

      // Add the fragment to the component
      this.appendChild(frag);
    },

    /** @private */
    _initialize: function() {
      // Generate a unique ID for the tab panel if one isn't already present
      // This will be used for accessibility purposes
      this.id = this.id || Coral.commons.getUID();
    }
  });

  Coral.register( /** @lends Coral.Tab.Label */ {
    /**
      @class Coral.Tab.Label
      @classdesc A TabList Tab Label component
      @extends Coral.Component
      @htmltag coral-tab-label
    */
    name: 'Tab.Label',
    tagName: 'coral-tab-label'
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    TabView orientations.

    @enum {String}
    @memberof Coral.TabView
  */
  var orientation = {
    /** Tabs on top of the panels. This is the default. */
    HORIZONTAL: 'horizontal',
    /** Tabs are rendered on the side and match the height of the panels. */
    VERTICAL: 'vertical'
  };

  // the tabview's base classname
  var CLASSNAME = 'coral-TabView';

  Coral.register( /** @lends Coral.TabView# */ {

    /**
      @class Coral.TabView
      @classdesc An TabView component
      @htmltag coral-tabview
      @extends Coral.Component
    */
    name: 'TabView',
    tagName: 'coral-tabview',
    className: 'coral-TabView',

    events: {
      'coral-tablist:change > coral-tablist': '_onTabListChange',
      'coral-panelstack:change > coral-panelstack': '_onPanelStackChange'
    },

    properties: {

      /**
        The TabView's orientation.

        @type {Coral.TabView.orientation}
        @default Coral.TabView.orientation.HORIZONTAL
        @htmlattribute orientation
        @memberof Coral.TabView#
      */
      'orientation': {
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(orientation)
        ],
        get: function() {
          return this.tabList.orientation;
        },
        set: function(value) {
          this.tabList.orientation = value;
        },
        sync: function() {
          this.$[this.orientation === orientation.VERTICAL ? 'addClass' : 'removeClass'](CLASSNAME + '--vertical');
        }
      },

      /**
        The TabList which handles all the tabs.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.TabView#
      */
      'tabList': Coral.property.contentZone({
        handle: 'tabList',
        tagName: 'coral-tablist'
      }),

      /**
        The PanelStack which contains all the panels.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.TabView#
      */
      'panelStack': Coral.property.contentZone({
        handle: 'panelStack',
        tagName: 'coral-panelstack'
      })
    },

    /**
      Detects a change in the TabList and triggers an event.

      @private
    */
    _onTabListChange: function(event) {
      this.trigger('coral-tabview:change', {
        'selection': event.detail.selection,
        'oldSelection': event.detail.oldSelection,
      });
    },

    /** @private */
    _onPanelStackChange: function(event) {
      // everytime the panelstack changes, we verify that the tablist and panelstack are up to date
      if (event.detail.selection) {

        var tabSelector = event.detail.selection.getAttribute('aria-labelledby');
        var tab = document.getElementById(tabSelector);

        // we select the tab if this was not the case
        if (tab && tab.getAttribute('selected') === null) {
          tab.setAttribute('selected', '');
        }
      }
    },

    /** @private */
    _render: function() {
      // Create a temporary fragment to hold contents
      var frag = document.createDocumentFragment();

      // Fetch or create the content zone elements
      var tabs = this._elements.tabList = this.querySelector('coral-tablist') || document.createElement('coral-tablist');
      var panels = this._elements.panelStack = this.querySelector('coral-panelstack') || document.createElement('coral-panelstack');

      // binds the tablist and panel stack together using the panel id
      panels.id = panels.id || Coral.commons.getUID();
      tabs.setAttribute('target', '#' + panels.id);

      frag.appendChild(tabs);
      frag.appendChild(panels);

      // Add the fragment to the component
      this.appendChild(frag);
    }

  /**
    Triggered when the selected tab panel item has changed.

    @event Coral.TabView#coral-tabview:change

    @param {Object} event
      Event object.
    @param {HTMLElement} event.detail.selection
      The new selected tab panel item.
    @param {HTMLElement} event.detail.oldSelection
      The prior selected tab panel item.
  */
  });

  // exports the enumeration
  Coral.TabView.orientation = orientation;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.WizardView# */ {

    /**
      @class Coral.WizardView
      @classdesc An WizardView component
      @htmltag coral-wizardview
      @extends Coral.Component
    */
    name: 'WizardView',
    tagName: 'coral-wizardview',
    className: 'coral-WizardView',

    events: {
      'coral-component:attached coral-panelstack[coral-wizardview-panelstack]': '_onComponentAttached',
      'coral-component:attached coral-steplist[coral-wizardview-steplist]': '_onComponentAttached',
      'coral-steplist:change coral-steplist[coral-wizardview-steplist]': '_onStepListChange',
      'click [coral-wizardview-previous]': '_onPreviousClick',
      'click [coral-wizardview-next]': '_onNextClick'
    },

    properties: {
      /**
        The set of controlled PanelStacks. Each PanelStack must have the
        <code>coral-wizardview-panelstack</code> attribute.

        See {@link Coral.Collection} for more details regarding collection APIs.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.WizardView#
      */
      'panelStacks': {
        attribute: null,
        get: function() {
          // Construct the collection on first request:
          if (!this._panelStacks) {
            this._panelStacks = new Coral.Collection({
              host: this,
              itemTagName: 'coral-panelstack',
              itemSelector: 'coral-panelstack[coral-wizardview-panelstack]',
              filter: this._isControlledByThisComponent.bind(this),
              onItemAdded: this._onItemAdded
            });
          }

          return this._panelStacks;
        },
        set: function() {}
      },

      /**
        The set of controlling StepLists. Each StepList must have the <code>coral-wizardview-steplist</code> attribute.

        See {@link Coral.Collection} for more details regarding collection APIs.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.WizardView#
      */
      'stepLists': {
        attribute: null,
        get: function() {
          // Construct the collection on first request:
          if (!this._stepLists) {
            this._stepLists = new Coral.Collection({
              host: this,
              itemTagName: 'coral-steplist',
              itemSelector: 'coral-steplist[coral-wizardview-steplist]',
              filter: this._isControlledByThisComponent.bind(this),
              onItemAdded: this._onItemAdded
            });
          }

          return this._stepLists;
        },
        set: function() {}
      }
    },

    /**
      Called by event handlers when a component is attached.

      @private
    */
    _onComponentAttached: function(event) {
      // Do not catch attached events for steps/panels
      if (event.target !== event.matchedTarget) {
        return;
      }

      // Do not catch attached events for StepLists and PanelStacks we do not control
      if (!this._isControlledByThisComponent(event.target)) {
        return;
      }

      this._selectItemByIndex(event.target, this._getSelectedIndex());
    },

    /**
      Called by the Collection when an item is added with the add() API.

      @private
    */
    _onItemAdded: function(component) {
      this._selectItemByIndex(component, this._getSelectedIndex());
    },

    /**
      Handles the next button click.

      @private
    */
    _onNextClick: function(event) {
      // we stop propagation in case the wizard views are nested
      event.stopPropagation();

      this.next();
    },

    /**
      Handles the previous button click.

      @private
    */
    _onPreviousClick: function(event) {
      // we stop propagation in case the wizard views are nested
      event.stopPropagation();

      this.previous();
    },

    /**
      Detects a change in the StepList and triggers an event.

      @private
    */
    _onStepListChange: function(event) {
      if (!this._isControlledByThisComponent(event.target)) {
        return;
      }

      // Stop propagation of the events to support nested panels
      event.stopPropagation();

      // Get the step number
      var index = event.target.items.getAll().indexOf(event.detail.selection);

      // Sync the other StepLists
      this._selectStep(index);

      this.trigger('coral-wizardview:change', {
        'selection': event.detail.selection,
        'oldSelection': event.detail.oldSelection
      });
    },

    /** @private */
    _getSelectedIndex: function() {
      var stepList = this.stepLists.first();
      if (!stepList) {
        return -1;
      }

      var stepIndex = -1;
      if (stepList._componentReady) {
        stepIndex = stepList.items.getAll().indexOf(stepList.selectedItem);
      }
      else {
        // Manually get the selected step
        var steps = stepList.querySelectorAll('coral-step');

        // Find the last selected step
        for (var i = steps.length - 1; i >= 0; i--) {
          if (steps[i].hasAttribute('selected')) {
            stepIndex = i;
            break;
          }
        }
      }

      return stepIndex;
    },

    /**
      Helper method used to indicate if the given panel should be controller by WizardView.

      @param {HTMLElement} panel
        panel to check whether it is controlled by the current WizardView.

      @private
    */
    _isControlledByThisComponent: function(panel) {
      return $(panel).closest('coral-wizardview').get(0) === this;
    },

    /**
      Select the step according to the provided index.

      @param {*} component
        The StepList to select the step on.
      @param {Number} index
        The index of the step that should be selected.

      @private
    */
    _selectItemByIndex: function(component, index) {
      var item = null;

      if (component._componentReady) {
        // Get the corresponding item
        item = component.items.getAll()[index];
      }
      else {
        // Resort to querying manually on immediately children
        if (component.tagName === 'CORAL-STEPLIST') {
          item = $(component).find('> coral-step')[index];
        }
        else if (component.tagName === 'CORAL-PANELSTACK') {
          item = $(component).find('> coral-panel')[index];
        }
      }

      if (item) {
        if (!item.hasAttribute('selected')) {
          // Select it if it's not already selected
          item.setAttribute('selected', '');
        }
        return true;
      }
      else {
        if (component._componentReady) {
          if (component.selectedItem) {
            // De-select any incorrectly selected item
            // This happens in a StepList is provided that does not have the right number of steps
            component.selectedItem.removeAttribute('selected');
          }
        }
        else {
          // Resort to querying manually on immediately children
          if (component.tagName === 'CORAL-STEPLIST') {
            $(component).find('> coral-step').removeAttr('selected');
          }
          else if (component.tagName === 'CORAL-PANELSTACK') {
            $(component).find('> coral-panel').removeAttr('selected');
          }
        }
      }

      return false;
    },

    /** @private */
    _selectStep: function(index) {
      var self = this;
      this.stepLists.getAll().forEach(function(stepList) {
        self._selectItemByIndex(stepList, index);
      });

      this.panelStacks.getAll().forEach(function(panelStack) {
        self._selectItemByIndex(panelStack, index);
      });
    },

    /**
      Sets the correct selected item in every PanelStack.

      @private
    */
    _syncPanelStackSelection: function() {
      // Find out which step we're on by checking the first StepList
      var index = this._getSelectedIndex();

      if (index === -1) {
        // No step selected
        return;
      }

      var self = this;
      this.panelStacks.getAll().forEach(function(panelStack) {
        self._selectItemByIndex(panelStack, index);
      });
    },

    /**
      Selects the correct step in every StepList.

      @private
    */
    _syncStepListSelection: function() {
      // Find out which step we're on by checking the first StepList
      var index = this._getSelectedIndex();

      if (index === -1) {
        // No step selected
        return;
      }

      var self = this;
      this.stepLists.getAll().forEach(function(stepList) {
        self._selectItemByIndex(stepList, index);
      });
    },

    /** @private */
    _initialize: function() {
      this._syncStepListSelection();
      this._syncPanelStackSelection();
    },

    /**
      Shows the next step. If the WizardView is already in the last step nothing will happen.

      @fires Coral.WizardView#coral-wizardview:change
    */
    next: function() {
      var stepList = this.stepLists.first();
      if (!stepList) {
        return;
      }

      // Change to the next step
      stepList.next();

      // Select the step everywhere
      this._selectStep(stepList.items.getAll().indexOf(stepList.selectedItem));
    },

    /**
      Shows the previous step. If the WizardView is already in the first step nothing will happen.

      @fires Coral.WizardView#coral-wizardview:change
    */
    previous: function() {
      var stepList = this.stepLists.first();
      if (!stepList) {
        return;
      }

      // Change to the previous step
      stepList.previous();

      // Select the step everywhere
      this._selectStep(stepList.items.getAll().indexOf(stepList.selectedItem));
    }

    /**
      Triggered when the selected step list item has changed.

      @event Coral.WizardView#coral-wizardview:change

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.selection
        The new selected step list item.
      @param {HTMLElement} event.detail.oldSelection
        The prior selected step list item.
    */
  });
}());
