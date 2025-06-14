(function ($) {
    $.affix = {
        defaults: {
            offsetTop: 0,         // Standardwert für zusätzlichen Offset
            breakpoint: null,     // Standard: Keine Breakpoints
            stackingOnTop: false  // Standard: Darstellung untereinander (false); true: Übereinander
        }
    };

    // Initialisiere einmalig den ResizeObserver
    let resizeObserver = null;

    // Hauptfunktion des Affix-Plugins
    $.fn.affix = function (options) {
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).affix(options);
            });
        }

        const $element = $(this);

        if (!$element.data('affixInitialized')) {
            let settings = $.extend(true, {}, $.affix.defaults, options || {});
            $element.data('settings', settings);
            $element.attr('data-affix', 'false');

            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(() => setOffsetTop());
                resizeObserver.observe(document.documentElement);

                $(window).on('scroll', function () {
                    setOffsetTop();
                });
            }

            setOffsetTop();
            $element.data('affixInitialized', true);
        }

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

        function setUnSticky($el) {
            $el
                .css({
                    position: '',
                    top: '',
                    zIndex: ''
                })
                .attr('data-affix', 'false');
        }

        function setOffsetTop() {
            const $affixElements = $('[data-affix]');
            let topOffset = 0; // Alle Elemente bei "stackingOnTop: true" erhalten denselben Top-Wert

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

                if (currentElementSettings.stackingOnTop) {
                    // Alle Elemente auf denselben Offset setzen
                    topOffset = currentElementSettings.offsetTop;
                } else {
                    // Standarddarstellung: untereinander
                    topOffset = 0;
                    for (let i = 0; i < index; i++) {
                        const previousElement = $($affixElements[i]);
                        topOffset += previousElement.outerHeight();
                    }
                    topOffset += currentElementSettings.offsetTop;
                }

                $currentElement.data('offsetTop', topOffset);

                // Das Element wird jetzt mit entsprechendem Top offset positioniert
                $currentElement.css({
                    position: 'sticky',
                    top: `${topOffset}px`,
                    zIndex: currentElementSettings.stackingOnTop ? 1000 : 1000 - index // Bei "on top" behalten alle denselben Z-Index
                });

                if (isElementSticky($currentElement)) {
                    $currentElement.attr('data-affix', 'true');
                } else {
                    $currentElement.attr('data-affix', 'false');
                }
            });
        }

        function isElementSticky($element) {
            const elementOffset = $element.offset().top;
            const scrollTop = $(window).scrollTop();
            const stickyStart = $element.data('offsetTop') || parseInt($element.css('top')) || 0;

            return scrollTop >= parseInt(elementOffset - stickyStart);
        }

        return this;
    };
})(jQuery);