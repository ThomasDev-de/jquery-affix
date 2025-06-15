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

            // Save original styles
            saveOriginalStyles($element);

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
            $element.trigger('init');
        }

        // Helper function: Check if a breakpoint is active
        function isBreakpointActive(bp) {
            const breakpoints = {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
                xxl: 1400
            };

            const currentWidth = window.innerWidth;

            if (typeof bp === 'number' || !isNaN(bp)) {
                return currentWidth >= bp;
            }

            return breakpoints[bp] ? currentWidth >= breakpoints[bp] : true;
        }

        // Helper function: Save original styles before modification
        function saveOriginalStyles($el) {
            const originalStyles = {
                position: $el.css('position'),
                top: $el.css('top'),
                zIndex: $el.css('zIndex')
            };
            $el.data('originalStyles', originalStyles);
        }

        // Helper function: Reset the element's sticky state
        function setUnSticky($el) {
            const originalValues = $el.data('originalStyles') || {};
            $el
                .css(originalValues)
                .removeClass('affixed');
            $el.trigger('unaffixed');
        }

        // Function to calculate and set offsetTop for affix elements
        function setOffsetTop() {
            const $affixElements = $('.affix');

            $affixElements.each(function (index, el) {
                const $currentElement = $(el);

                const currentElementSettings = $currentElement.data('settings');

                if (
                    currentElementSettings.breakpoint &&
                    !isBreakpointActive(currentElementSettings.breakpoint)
                ) {
                    setUnSticky($currentElement);
                    return;
                }

                let topOffset = 0;

                const currentLeft = $currentElement.offset().left;
                const currentRight = currentLeft + $currentElement.outerWidth();

                for (let i = 0; i < index; i++) {
                    const $previousElement = $($affixElements[i]);

                    const previousLeft = $previousElement.offset().left;
                    const previousRight = previousLeft + $previousElement.outerWidth();

                    const isOverlappingX = currentRight > previousLeft && currentLeft < previousRight;

                    if (isOverlappingX) {
                        topOffset =
                            Math.max(topOffset, $previousElement.data('offsetTop') + $previousElement.outerHeight());
                    }
                }

                topOffset += currentElementSettings.offsetTop || 0;
                $currentElement.data('offsetTop', topOffset);

                $currentElement.css({
                    position: 'sticky',
                    top: `${topOffset}px`,
                    zIndex: 1000 - index
                });

                if (isElementSticky($currentElement)) {
                    if (!$currentElement.hasClass('affixed')) {
                        $currentElement.trigger('affixed');
                        $currentElement.addClass('affixed');
                    }
                } else {
                    if ($currentElement.hasClass('affixed')) {
                        $currentElement.trigger('unaffixed');
                        $currentElement.removeClass('affixed');
                    }
                }
            });
        }

        // Helper function: Check if an element is in sticky state
        function isElementSticky($element) {
            const elementOffset = $element.offset().top;
            const scrollTop = $(window).scrollTop();
            const stickyStart = $element.data('offsetTop') || parseInt($element.css('top')) || 0;

            return scrollTop >= parseInt(elementOffset - stickyStart);
        }

        return this;
    };
})(jQuery);