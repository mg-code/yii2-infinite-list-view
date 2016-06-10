(function ($) {
    $.fn.infiniteListView = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist');
            return false;
        }
    };

    var scrollIsReady = true;
    var defaults = {
        stopEvery: null,
        autoloadOnFirst: true,
        clickCounter: 0,
        firstLoaded: false
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
                        stopEvery: $e.attr('data-stop-every') ? parseInt($e.attr('data-stop-every')) : null,
                        autoloadOnFirst: $e.attr('data-autoload-on-first') == "1"
                    } || {});

                $e.data('settings', settings);

                // Scroll event
                methods.scrollEvent.apply($e);

                // Button event
                $e.on('click', '.pagination a', function () {
                    var $pagination = $(this).parent(),
                        resetCounter = $pagination.hasClass('next');

                    methods.loadPage.apply($e, [$pagination, resetCounter]);
                    return false;
                });
            });
        },
        scrollEvent: function () {
            var $e = $(this),
                timer = null;

            $(window).scroll(function () {
                var settings = $e.data('settings');

                // If scroll is not ready terminate action
                if (!settings || !scrollIsReady) {
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    // If scroll is not ready terminate action
                    if (!scrollIsReady) {
                        return;
                    }

                    if (!settings.autoloadOnFirst && !settings.firstLoaded) {
                        return;
                    }

                    if (settings.stopEvery && (settings.clickCounter + 1) % settings.stopEvery == 0) {
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
        loadPage: function ($pagination, resetCounter) {
            var $e = $(this),
                settings = $e.data('settings'),
                url = $pagination.find('a').attr('href'),
                isPrev = $pagination.hasClass('prev');

            if(typeof resetCounter == 'undefined') {
                resetCounter = false;
            }

            scrollIsReady = false;
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
                        if(resetCounter) {
                            settings.clickCounter = 0;
                        } else {
                            settings.clickCounter++;
                        }
                        settings.firstLoaded = true;
                    }

                    // Update page state
                    methods.replaceState.apply($e, [title, url]);
                    scrollIsReady = true;
                    $e.trigger('infiniteListView.afterLoad');
                },
                complete: function () {
                    $pagination.removeClass('loading');
                },
                error: function (XKR, textStatus, errorThrown) {
                    scrollIsReady = false;
                    mgcode.helpers.request.ajaxError(XKR, textStatus);
                }
            });
        }
    };
})(window.jQuery);