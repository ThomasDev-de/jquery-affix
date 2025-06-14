(function ($) {
    $.affix = {
        defaults: {
            offsetTop: 0,      // Standardwert für zusätzlichen Offset
            breakpoint: null   // Standardmäßig kein Breakpoint
        }
    };

    // Erstelle eine Instanz des ResizeObserver (einmalig)
    let resizeObserver = null;

    $.fn.affix = function (options) {
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).affix(options);
            });
        }

        const $element = $(this);

        if (!$element.data('affixInitialized')) {
            let settings;

            if (!options) {
                settings = $.affix.defaults;
            } else {
                settings = $.extend(true, {}, $.affix.defaults, options || {});
            }

            $element.data('settings', settings);
            $element.attr('data-affix', 'false');


            // Registriere den ResizeObserver, falls noch nicht vorhanden
            if (!resizeObserver) {
                resizeObserver = new ResizeObserver(() => setOffsetTop());
                resizeObserver.observe(document.documentElement);

                // Prüfung: Ist das Element sticky oder nicht?
                $(window).on('scroll', function () {
                    setOffsetTop();
                });

            }
            // Bei Neuinitialisierung setze offsetTop aller affixe neu
            setOffsetTop();

            $element.data('affixInitialized', true);
        }

        // Hilfsfunktion: Überprüfung, ob der aktuelle Breakpoint erreicht ist
        function isBreakpointActive(bp) {
            const breakpoints = {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
                xxl: 1400
            };

            // Breite des Viewports abrufen
            const currentWidth = window.innerWidth;

            // Wenn der Breakpoint gültig ist und der Viewport die entsprechende Breite erreicht, aktivieren
            return breakpoints[bp] ? currentWidth >= breakpoints[bp] : true;
        }

        function setUnSticky($el) {
            $el
                .css({
                    position: '', // Kein Sticky anwenden
                    top: '',
                    zIndex: ''
                })
                .attr('data-affix', 'false');
        }

        function setOffsetTop() {
            const $affixElements = $('[data-affix]');

            // Initialisiere jedes Affix-Element
            $affixElements.each(function (index, el) {
                const $currentElement = $(el);

                const currentElementSettings = $currentElement.data('settings');

                // Breakpoint-Logik: Nur fortfahren, wenn der Breakpoint aktiv ist
                if (
                    currentElementSettings.breakpoint &&
                    !isBreakpointActive(currentElementSettings.breakpoint)
                ) {
                    setUnSticky($currentElement);
                    return; // Aktuelles Element überspringen
                }

                let topOffset = 0;

                // Gehe durch alle vorherigen Affix-Elemente und summiere deren Höhe
                for (let i = 0; i < index; i++) {
                    const previousElement = $($affixElements[i]);
                    topOffset += previousElement.outerHeight(); // Höhe des vorherigen Elements
                }

                // Addiere den optionalen offsetTop-Wert
                topOffset += currentElementSettings.offsetTop;

                $currentElement.data('offsetTop', topOffset);
                // Setze das aktuelle Element auf die berechnete Top-Position
                $currentElement.css({
                    position: 'sticky',
                    top: `${topOffset}px`,
                    zIndex: 1000 - index // Um Überdeckungsprobleme zu vermeiden
                });
                if( isElementSticky( $currentElement ) ) {
                    $currentElement.attr('data-affix', 'true');
                } else {
                    $currentElement.attr('data-affix', 'false');

                }
            });
        }

        function isElementSticky($element) {
            // Die aktuelle Offset-Position des Elements relativ zum Dokument
            const elementOffset = $element.offset().top;

            // Die aktuelle Scroll-Position des Fensters
            const scrollTop = $(window).scrollTop();

            // Die Sticky-Position des Elements
            const stickyStart = $element.data('offsetTop') || parseInt($element.css('top')) || 0;

            // Prüfen, ob die Scroll-Position das Sticky-Verhalten aktiviert
            return scrollTop >= parseInt(elementOffset - stickyStart);
        }


        return this;
    };
})(jQuery);