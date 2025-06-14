(function ($) {
    $.affix = {
        defaults: {
            offsetTop: 0,      // Default value for additional offset
            breakpoint: null   // Default: no breakpoint
        }
    };

    // Create a single instance of ResizeObserver
    let resizeObserver = null;

    // Main affix plugin function
    $.fn.affix = function (options) {
        // If there are multiple elements, initialize each one individually
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).affix(options);
            });
        }

        // Select the current element
        const $element = $(this);

        // Prevent multiple initializations for the same element
        if (!$element.data('affixInitialized')) {
            let settings;

            // Merge user-provided options, defaults, and DOM data attributes
            settings = $.extend(
                true, // Enable deep merging
                {}, // Start with an empty object
                $.affix.defaults, // Add default settings
                options || {}, // Add user-provided options (if any)

                // Dynamisch alle `data-affix-*` Attribute auslesen
                Object.keys($element.data()).reduce((result, key) => {
                    if (key.startsWith('affix')) {
                        // Entferne 'affix' prefix und formatiere es
                        const optionKey = key.replace(/^affix/, '').replace(/^[A-Z]/, match => match.toLowerCase());
                        result[optionKey] = $element.data(key);
                    }
                    return result;
                }, {})
            );

            // Store the combined settings in the element's data
            $element.data('settings', settings);
            $element.addClass('affix');

            // Initialize ResizeObserver, if not already set
            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(() => setOffsetTop());
                resizeObserver.observe(document.documentElement);

                // Update offsets and sticky states on scroll
                $(window).on('scroll', function () {
                    setOffsetTop();
                });
            }

            // Initialize offsets for the newly initialized element
            setOffsetTop();

            // Mark the element as initialized
            $element.data('affixInitialized', true);
        }

        // Helper function: Check if a breakpoint is active
        function isBreakpointActive(bp) {
            // Predefined breakpoints
            const breakpoints = {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
                xxl: 1400
            };

            // Get the current viewport width
            const currentWidth = window.innerWidth;

            // If `bp` is a number, compare directly
            if (typeof bp === 'number' || !isNaN(bp)) {
                return currentWidth >= bp;
            }

            // If `bp` is a string like 'sm', 'md', etc., get the corresponding value
            return breakpoints[bp] ? currentWidth >= breakpoints[bp] : true;
        }

        // Helper function: Reset the element's sticky state
        function setUnSticky($el) {
            $el
                .css({
                    position: '', // Reset position
                    top: '',
                    zIndex: ''
                })
                .removeClass('affixed') // Mark as not sticky
        }

        // Function to calculate and set offsetTop for affix elements
        function setOffsetTop() {
            // Wähle alle Elemente mit `data-affix` aus
            const $affixElements = $('.affix');

            // Verarbeite jedes Affix-Element
            $affixElements.each(function (index, el) {
                const $currentElement = $(el);

                // Einstellungen für das aktuelle Element abrufen
                const currentElementSettings = $currentElement.data('settings');

                // Fallbehandlung: Überspringen, falls der Breakpoint nicht aktiv ist
                if (
                    currentElementSettings.breakpoint &&
                    !isBreakpointActive(currentElementSettings.breakpoint)
                ) {
                    setUnSticky($currentElement);
                    return; // Überspringe dieses Element
                }

                let topOffset =0;


                // Ermittlung der Positionen des aktuellen Elements (X-Achse)
                const currentLeft = $currentElement.offset().left;
                const currentRight = currentLeft + $currentElement.outerWidth();

                // Berechnung: Kollisionen mit vorherigen Elementen prüfen (nur X-Achse)
                for (let i = 0; i < index; i++) {
                    const $previousElement = $($affixElements[i]);

                    // Hole die Grenzen des vorherigen Elements (X-Achse)
                    const previousLeft = $previousElement.offset().left;
                    const previousRight = previousLeft + $previousElement.outerWidth();

                    // Prüfe, ob sich die Bereiche auf der X-Achse überschneiden
                    const isOverlappingX = currentRight > previousLeft && currentLeft < previousRight;

                    // Falls X-Kollision: Addiere die Höhe des vorherigen Elements zur `topOffset`
                    if (isOverlappingX) {
                        topOffset =
                            Math.max(topOffset, $previousElement.data('offsetTop') + $previousElement.outerHeight());
                    }
                }

                topOffset += currentElementSettings.offsetTop || 0;
                // Speichere den berechneten Offset im Element
                $currentElement.data('offsetTop', topOffset);

                // Wende die berechnete Sticky-Position auf das aktuelle Element an
                $currentElement.css({
                    position: 'sticky',
                    top: `${topOffset}px`,
                    zIndex: 1000 - index // Reduziere den Z-Index für die Stapelreihenfolge
                });

                // Überprüfen, ob das Element sticky ist, und `data-affix` entsprechend setzen
                if (isElementSticky($currentElement)) {
                    $currentElement.addClass('affixed');
                } else {
                    $currentElement.removeClass('affixed');
                }
            });
        }

        // Helper function: Check if an element is in sticky state
        function isElementSticky($element) {
            // Get the offset position of the element relative to the document
            const elementOffset = $element.offset().top;

            // Get the current scroll position of the window
            const scrollTop = $(window).scrollTop();

            // Get the element's sticky start position
            const stickyStart = $element.data('offsetTop') || parseInt($element.css('top')) || 0;

            // Return whether the element should currently be sticky
            return scrollTop >= parseInt(elementOffset - stickyStart);
        }

        // Return the jQuery object for chaining
        return this;
    };
})(jQuery);