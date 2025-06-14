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

            // Merge user-provided options with default settings
            if (!options) {
                settings = $.affix.defaults;
            } else {
                settings = $.extend(true, {}, $.affix.defaults, options || {});
            }

            // Store the settings in the element's data
            $element.data('settings', settings);
            $element.attr('data-affix', 'false');

            // Initialize ResizeObserver, if not already set
            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(() => setOffsetTop());
                resizeObserver.observe(document.documentElement);

                // Update offsets and sticky states on scroll
                $(window).on('scroll', function () {
                    setOffsetTop();
                });
            }

            // Initialize offsets on new initialization
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
                .attr('data-affix', 'false'); // Mark as not sticky
        }

        // Function to calculate and set offsetTop for affix elements
        function setOffsetTop() {
            // Select all elements marked with `data-affix`
            const $affixElements = $('[data-affix]');

            // Process each affix element
            $affixElements.each(function (index, el) {
                const $currentElement = $(el);

                // Get the settings for the current element
                const currentElementSettings = $currentElement.data('settings');

                // Handle breakpoints: Skip if the breakpoint is not active
                if (
                    currentElementSettings.breakpoint &&
                    !isBreakpointActive(currentElementSettings.breakpoint)
                ) {
                    setUnSticky($currentElement);
                    return; // Skip this element
                }

                let topOffset = 0;

                // Calculate the combined height of previous affix elements
                for (let i = 0; i < index; i++) {
                    const previousElement = $($affixElements[i]);
                    topOffset += previousElement.outerHeight(); // Add the height of the previous element
                }

                // Add the optional `offsetTop` value from the element's settings
                topOffset += currentElementSettings.offsetTop;

                // Store the calculated offset in the element's data
                $currentElement.data('offsetTop', topOffset);

                // Apply computed sticky positioning to the element
                $currentElement.css({
                    position: 'sticky',
                    top: `${topOffset}px`,
                    zIndex: 1000 - index // Decrease z-index to avoid overlap
                });

                // Check if the element is sticky and update `data-affix` accordingly
                if (isElementSticky($currentElement)) {
                    $currentElement.attr('data-affix', 'true');
                } else {
                    $currentElement.attr('data-affix', 'false');
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