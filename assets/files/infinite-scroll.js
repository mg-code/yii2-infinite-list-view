(function ($) {
    $.fn.infiniteScroll = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist');
            return false;
        }
    };

    $.fn.infiniteScroll.scrollIsReady = true;

    var defaults = {
        stopAfter: 5,
        autoload: true,
        clickCounter: 0
    };
    var methods = {
        init: function (options) {
            return this.filter(function () {
                return $(this).data('initialized') !== true;
            }).each(function () {
                var $e = $(this);

                // Mark as initialized
                $e.data('initialized', true);

                // init settings
                var settings = $.extend({}, defaults, {
                        stopAfter: parseInt($e.attr('data-stop-after')),
                        autoload: $e.attr('data-autoload') == "1"
                    } || {});

                if (!settings.autoload) {
                    settings.clickCounter = settings.stopAfter;
                }
                $e.data('settings', settings);

                // Scroll event
                methods.scrollEvent.apply($e);

                // Button event
                $e.on('click', '.pagination a', function () {
                    var $pagination = $(this).parent();

                    methods.loadPage.apply($e, [$pagination]);
                    return false;
                });
            });
        },
        scrollEvent: function () {
            var $e = $(this),
                timer = null;

            $(window).scroll(function () {
                var settings = settings = $e.data('settings');

                // If scroll is not ready terminate action
                if (!settings || !$.fn.infiniteScroll.scrollIsReady) {
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    // If scroll is not ready terminate action
                    if (!$.fn.infiniteScroll.scrollIsReady) {
                        return;
                    }

                    if (settings.clickCounter == settings.stopAfter) {
                        return;
                    }

                    var $pagination = $e.find('.pagination.next');
                    if ($pagination.length < 1) {
                        return;
                    }

                    var scrollPosition = $(window).scrollTop() + $(window).height();
                    var paginationPosition = $pagination.offset().top - 100; // Pre-load 100px earlier
                    if (scrollPosition < paginationPosition) {
                        return;
                    }
                    methods.loadPage.apply($e, [$pagination]);
                }, 50);
            });
        },
        replaceState: function (title, url) {
            if (window.history && history.replaceState) {
                var state = History.getState();
                History.replaceState(state.data, title, url);
            }
        },
        loadPage: function ($pagination) {
            var $e = $(this),
                settings = $e.data('settings'),
                url = $pagination.find('a').attr('href'),
                isPrev = $pagination.hasClass('prev');

            $.fn.infiniteScroll.scrollIsReady = false;
            $pagination.addClass('loading');
            $.ajax({
                url: url,
                type: 'GET',
                success: function (data) {
                    var $data = $('<div>' + data + '</div>'),
                        title = $('title', $data).html(),
                        updateId = '#' + $e.attr('id'),
                        $itemsContainer = $e.find('.items'),
                        items = [];

                    $(updateId + ' .items [data-key]', $data).each(function () {
                        var key = $(this).attr('data-key');
                        if ($itemsContainer.find('[data-key=' + key + ']').length === 0) {
                            items.push(this);
                        }
                    });

                    if (items) {
                        if (isPrev) {
                            $itemsContainer.prepend(items);
                        } else {
                            $itemsContainer.append(items);
                        }
                    }

                    // Remove parent navigation
                    $pagination.remove();

                    if (isPrev) {
                        var navigationPrev = $(updateId + ' .pagination.prev', $data);
                        if (navigationPrev) {
                            $itemsContainer.before(navigationPrev);
                        }
                    } else {
                        var navigationNext = $(updateId + ' .pagination.next', $data);
                        if (navigationNext) {
                            $itemsContainer.after(navigationNext);
                        }
                        settings.clickCounter = settings.clickCounter == settings.stopAfter ? 0 : settings.clickCounter + 1;
                    }

                    // Update page state
                    methods.replaceState.apply($e, [title, url]);
                    $.fn.infiniteScroll.scrollIsReady = true;
                },
                complete: function () {
                    $pagination.removeClass('loading');
                },
                error: function (XKR, textStatus, errorThrown) {
                    $.fn.infiniteScroll.scrollIsReady = false;
                    ajaxError(XKR, textStatus);
                }
            });
        }
    };
})(window.jQuery);