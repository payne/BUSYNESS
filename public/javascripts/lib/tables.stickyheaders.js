;(function( win, $ ) {

	function featureTest( property, value, noPrefixes ) {
		// Thanks Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
		var prop = property + ':',
			el = document.createElement( 'test' ),
			mStyle = el.style;

		if( !noPrefixes ) {
			mStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join( value + ';' + prop ).slice( 0, -prop.length );
		} else {
			mStyle.cssText = prop + value;
		}
		return mStyle[ property ].indexOf( value ) !== -1;
	}

	if( typeof $.fn.clone === 'undefined' ) {
		$.fn.clone = function() {
			var ret = [];
			this.each(function() {
				ret.push( this.cloneNode( true ) );
			});
			return $( ret );
		};
	}

	var S = {
		selectors: {
			init: '.stickyheaders'
		},
		tests: {
			sticky: featureTest( 'position', 'sticky' ),
			fixed: featureTest( 'position', 'fixed', true )
		},
		// Thanks jQuery!
		getScrollTop: function() {
			var prop = 'pageYOffset',
				method = 'scrollTop';
			return win ? (prop in win) ? win[ prop ] :
				win.document.documentElement[ method ] :
				elem[ method ];
		},
		init: function( table ) {
			var $table = $( table ),
				$headers = $table.find( 'thead' ).eq( 0 ),
				$cloned = $table.next().is( '.stickyclone' ),
				cloned,
				getCellSelector = function( cell ) {
					return cell.tagName + ':eq(' + $( cell ).prevAll().length + ')'
				},
				updateCell = function( $new, $old ) {
					// style.width includes padding (sometimes—not in Firefox). Use clientWidth for more reliable crossbrowser number.
					$new.replaceWith( $old.clone().width( $old[ 0 ].clientWidth + 'px' ) );
				},
				updateClonedHeaders = function() {
					var $clonedHeaders = $cloned.find( 'th' );

					$cloned.width( $table.width() );
					$headers.find( 'th' ).each(function( index ) {

						var $t = $( this ),
							$cell = $clonedHeaders.eq( index );

						if( $t.css( 'display' ) !== 'none' ) {
							updateCell( $cell, $t );
						} else {
							$cell.css( 'display', 'none' );
						}
					});
				};

			if( !$cloned.length ) {
				cloned = document.createElement( 'table' );
				cloned.className = table.className.replace(/\bstickyheaders\b/, '') + ' stickyclone';
				$cloned = $( cloned );
				$cloned.append( $headers.clone() );
				$cloned.on( 'click', function( event ) {
					var $t = $( event.target ),
						parents = [ getCellSelector( event.target ) ],
						cellSelector;

					// This line is to enable default popup behavior
					if( $t.is( 'a[href]' ) ) {
						return;
					}

					// Trigger a click
					$t.parents().each(function() {
						var tn = this.tagName;

						if( tn === 'THEAD' ) {
							return false;
						}
						parents.unshift( getCellSelector( this ) );
						if( tn === 'TH' || tn === 'TD' ) {
							cellSelector = parents;
						}
					});

					$headers.find( parents.join( ' > ' ) ).trigger( event.type );
					updateClonedHeaders();
				});
				$table.after( $cloned );
			}

			function toggle( turnOn ) {
				$cloned[ $cloned.is( '.on' ) ? 'removeClass' : 'addClass' ]( 'on' );

				if( turnOn ) {
					updateClonedHeaders();
				}
			}

			$( win ).bind( 'scroll', function() {
				var offset = $table.offset().top,
					scroll = S.getScrollTop(),
					isAlreadyOn = $cloned.is( '.on' );

				if( offset > scroll || offset + $table.height() < scroll ) {
					if( isAlreadyOn ) {
						toggle();
					}
				} else {
					if( !isAlreadyOn ) {
						toggle( true );
					}
				}
			}).trigger( 'scroll' );

			$( win ).bind( 'resize', function() {
				if( $cloned.is( '.on' ) ) {
					updateClonedHeaders();
				}
			});
		}
	};

	win.StickyHeaders = S;

	if( !S.tests.sticky && S.tests.fixed ) {
		$( win.document ).on( "enhance" , function( e ){
			$( S.selectors.init ).each(function() {
				S.init( this );
			});
		});
	}

})( this, jQuery );