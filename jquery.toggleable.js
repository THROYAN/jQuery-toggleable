(function($) {

    var defaultOpts = {
        _toggleableClass: '__toggleable',
        beforeToggle: function() {},
        afterToggle: function() {},
        accordion: false
    }, methods;

    methods = {
        /**
         * Initialization of plugin
         *
         * @param  {mixed} options
         */
        init: function(options) {
            console.time('toggleable');
            var $e = $(this), selected = false;

            if (!$.isPlainObject(options)) {
                options = {
                    context: options
                };
            }

            options = $.extend({}, defaultOpts, options);

            options.set = $e;

            var res = $e.each(function() {
                var $this = $(this), opts = $.extend({}, options, true);

                if ($this.hasClass(options._toggleableClass)) {
                    return $this;
                }

                $this.addClass(opts._toggleableClass);

                if (opts.context != null) {
                    if ($.isFunction(opts.context)) {
                        $context = opts.context.apply(this, this);
                        if ($context === false) {
                            $this.removeClass(opts._toggleableClass);
                            return;
                        } else {
                            $context = $($context);
                        }
                    } else {
                        $context = $(opts.context);
                    }
                } else {
                    $context = $('.context', $this);
                }

                $caption = $('.caption', $this);
                if ($caption.size() == 0 && $context.size() != 0)
                    $caption = $this;

                if ($context.size() == 0 || $caption.size() == 0)
                {
                    $children = $this.children();

                    if ($children.size() == 0)
                    {
                        $context = $('<div>' + $this.html() + '</div>');
                        $this.html('');
                        $context.appendTo($this);
                        $context.attr('title', $this.attr('title'));

                        $children = $this.children();
                    }

                    if ($children.size() == 1)
                    {
                        $caption = $('<div></div>');
                        $caption.appendTo($this);
                        $context = $children;
                        $caption.html($context.attr('title'));
                    }
                    else
                    {
                        $caption = $($children[0]);
                        $context = $($children.slice(1));
                    }
                }

                // console.time('each toggleable part3');

                $caption.addClass('caption');
                $context.addClass('context');
                $caption.data('context', $context);
                $caption.data('toggleable', $this);
                $context.data('toggleable', $this);
                // console.timeEnd('each toggleable part3');

                // console.log($caption, $context, 'set toggleable caption data');
                $caption.click(function(e) {
                    e.preventDefault();
                    var $parent = $(this).data('toggleable');
                    $parent.toggleable('toggle');
                });

                opts['caption'] = $caption;
                opts['context'] = $context;
                $this.data('toggleableOptions', opts);

                for (var i in opts) {
                    if (modules[i]) {
                        modules[i].apply($this, [opts[i]]);
                    }
                }

                // var f = $.proxy(toggleContext, $caption);
                // console.time('each toggleable part3.1');
                if ($this.hasClass('closed') || selected)
                {
                    // if (selected) {
                    //  $this.addClass('closed').removeClass('opened');
                    // }
                    // // console.time('each toggleable part3.1.1');
                    // $context.css('display', 'none'); //hide();
                    // // console.timeEnd('each toggleable part3.1.1');
                    // $caption.data('visibility', false);
                    hideContext.apply(this);
                }
                else if ($this.hasClass('opened') && !selected)
                {
                    showContext.apply(this);
                    // // console.time('each toggleable part3.1.2');
                    // $context.show();
                    // $caption.data('visibility', true);
                    // if (opts.accordion) {
                    //  selected = true;
                    // }
                    // console.timeEnd('each toggleable part3.1.2');
                }
                else
                    $this.data('visibility', $context.is(':visible'));
                // console.timeEnd('each toggleable part3.1');
            });

            // if (options.accordion) {
            //  $($e.get(0)).toggleable('toggle');
            // }

            console.timeEnd('toggleable');
            return res;
        },
        /**
         * Toggle state of context
         *
         * @param  {mixed} options
         */
        toggle: function(options) {
            return this.each(function() {
                $.proxy(toggleContext, this)(options)
            });
        },
        /**
         * Toggle state of context and all inner toggleables
         *
         * @param  {mixed} options
         */
        toggleAll: function(options) {
            return this.each(function() {
                $.proxy(toggleContext, this)(options, [], true);
            });
        },
        /**
         * Show context
         */
        show: function() {
            return this.each(function() {
                $.proxy(toggleContext, this)(true);
            });
        },
        /**
         * Hide context
         *
         * @return {[type]} [description]
         */
        hide: function() {
            return this.each(function() {
                $.proxy(toggleContext, this)(false);
            });
        },
        /**
         * Gets all toggleables inside context
         */
        innerToggles: function() {
            var $children = $();
            this.each(function() {
                var $this = $(this),
                    $context = $this.toggleable('option', 'context'),
                    _class = $this.toggleable('option', '_toggleableClass'),
                    $res = $('.' + _class, $context).add($context.filter('.' + _class));
                // if (!$children) {
                //  $children = $res;
                // } else {
                    $children = $children.add($res);
                // }
            });
            return $children;
        },
        /**
         * Gets or sets toggleable option
         *
         * @param  {string|object} option
         * @param  {mixed} value
         */
        option: function(option, value) {
            var $this = $(this),
                options = $this.data('toggleableOptions');

            if ($.isPlainObject(option)) {
                $.extend(options, option);
            } else if (value) {
                options[option] = value;
            } else {
                return options[option];
            }
            return $this;
        }
    };

    /**
     * Start point of plugin
     *
     * @param  {string} method
     */
    $.fn.toggleable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.toggleable');
            return false;
        }
    }

    /**
     * Возвращает контекст по заданному кэпшэну
     *
     * @param  {DOM|jQuery} caption Объект кэпшна
     *
     * @return {jQuery}         Объект контекста
     */
    var getContext = function(caption) {
        var $context = $(caption).data('context');

        // if (!$context)
        //  $context = $('.context', $(caption).parents('.' + UI._toggleableClass)[0]);
        // else
        //  console.log($(caption), $context, 'from toggleable caption data');

        return $context;
    }

    /**
     * Функция - колбэк нажатия на кэпшн тоглэйбл элемента
     * Тажке используется внутри себя для скрывания тоглэйблов внутри тоглэйбла
     * Используется $this
     *
     * @param  {bool} show      показать или скрыть контекст
     * @param  {jQuery|null} contextsBuffer Буффер пройденных контекстов, чтобы не зациклиться
     * @param  {bool} force      скрывает или показывает всё вместе с внутренностями
     *
     * @return array Все пройденные контексты
     */
    var toggleContext = function(show, contextsBuffer, force) {
        if (!contextsBuffer || !$.isArray(contextsBuffer)) // сюда еще попадает event, если передать функцию как обработчик события
        {
            contextsBuffer = [];
        }
        if (typeof show != 'boolean') // теперь сюда может попасть event
            show = null;

        var $this = $(this),
            $context = $this.toggleable('option', 'context');

        var f = false;
        $.each(contextsBuffer, function() { // проверяем контекст на пройденность
            $c = $(this);
            if ($context.equals($c))
                f = true;
        });

        if (f) // точка выхода из рекурсии
        {
            console.log('Опа, попался', $context, contextsBuffer);
            return;
        }

        show = show != null ? show : !$this.data('visibility');//!$context.is(':visible');

        var cb = $this.toggleable('option', 'beforeToggle');
        if ($.isFunction(cb)) {
            cb.apply(this, arguments);
        }

        if (show && $this.toggleable('option', 'accordion')) {
            $this.toggleable('option', 'set').toggleable('toggle', false);
        }

        if (show) {
            showContext.apply(this, arguments);
            // $context.slideDown('slow');
        } else {
            hideContext.apply(this, arguments);
            // $context.slideUp('slow');
        }
        // $context.toggle(show);

        contextsBuffer.push($context);

        // ищем все тоглэйблы внутри контекста и еще проверяем, ли он сам такой
        var $innerToggles = $this.toggleable('innerToggles');

        $innerToggles.each(function() {
            var $e = $(this);
            var f = $.proxy(toggleContext, $e);

            if (!show)
            {
                $e.data('visibility', force ? false : $e.data('visibility')/*getContext($e).is(':visible')*/); // сохраняем текущее состояние контекста
                contextsBuffer.concat(f(show, contextsBuffer));
            }
            else
                contextsBuffer.concat(f(force ? show : $e.data('visibility'), contextsBuffer)); // проверка на force

        });

        var cb = $this.toggleable('option', 'afterToggle');
        if ($.isFunction(cb)) {
            cb.apply(this, [show, contextsBuffer, force]);
        }

        return contextsBuffer;
    }

    var showContext = function() {
        var $this = $(this),
            $context = $this.toggleable('option', 'context'),
            showFunc = $this.toggleable('option', 'show');

        $this.addClass('opened').removeClass('closed').data('visibility', true);
        if ($.isFunction(showFunc)) {
            showFunc.apply($context, arguments);
        } else if ($.isArray(showFunc) && typeof showFunc[0] == 'string' && $.isFunction($.fn[showFunc[0]])) {
            $context[showFunc[0]].apply($context, showFunc.slice(1));
        } else if (typeof showFunc == 'string' && $.isFunction($.fn[showFunc])) {
            $context[showFunc]();
        } else {
            $context.show();
        }
    }

    var hideContext = function() {
        var $this = $(this),
            $context = $this.toggleable('option', 'context'),
            hideFunc = $this.toggleable('option', 'hide');

        $this.removeClass('opened').addClass('closed').data('visibility', false);
        if ($.isFunction(hideFunc)) {
            hideFunc.apply($context, arguments);
        } else if ($.isArray(hideFunc) && typeof hideFunc[0] == 'string' && $.isFunction($.fn[hideFunc[0]])) {
            $context[hideFunc[0]].apply($context, hideFunc.slice(1));
        } else if (typeof hideFunc == 'string' && $.isFunction($.fn[hideFunc])) {
            $context[hideFunc]();
        } else {
            $context.css('display', 'none');
        }
    }

    var modules = {
        /**
         * Plugin to hide opened toggleable when click anywhere outside context
         *
         * @param  {boolean|integer} value False to turn off. Number sets timer to fire hidding in microseconds
         */
        autoClose: function(value) {
            if (!value) {
                return;
            }

            var timer = (typeof value == 'number') ? value : 100;

            var $toggleable = $(this),
                oldCB = $toggleable.toggleable('option', 'afterToggle'),
                $context = $toggleable.toggleable('option', 'context'),
                $caption = $toggleable.toggleable('option', 'caption');

                // (function($toggleable, $context) {

                //  $('body').on('click', function(e) {
                //      var f = false;
                //      if ($(e.target).parents().each(function() {
                //          if ($(this).equals($context)) {
                //              f = true;
                //          }
                //      }))
                //      if (!f) {
                //          $toggleable.toggleable('hide');
                //      }
                //  });
                // })($toggleable, $context);
            (function($toggleable, $context, timer) {
                $toggleable.toggleable('option', 'afterToggle', function(show) {
                    var $this = $(this);
                    if (show) { // после того, как мы открываем тогл, ставим ему флаг autoClose

                        setTimeout(function($t) {
                            $t.data('autoClose', true);
                        }, timer, $toggleable);

                    } else {
                        $this.data('autoClose', false);
                    }
                    if ($.isFunction(oldCB)) {
                        oldCB.apply(this, arguments);
                    }
                });

                $('body').on('click', function() {
                    if ($toggleable.data('autoClose')) {
                        var $children = $toggleable.toggleable('innerToggles'),
                            f = true;
                        $children.each(function() {
                            if ($(this).data('visibility') && !$(this).data('autoClose')) {
                                f = false;
                            }
                        });
                        if (f) {
                            setTimeout(function($t) {
                                if ($t.data('autoClose')) {
                                    var $children = $t.toggleable('innerToggles'),
                                        f = true;
                                    $children.each(function() {
                                        if ($(this).data('visibility') && !$(this).data('autoClose')) {
                                            f = false;
                                        }
                                    });
                                    if (f) {
                                        $t.toggleable('hide');
                                    }
                                }
                            }, timer, $toggleable);
                        }
                    }
                });
                $context.click(function() { // при клике на контекст, запрещаем закрыть его
                    $toggleable.data('autoClose', false);
                    setTimeout(function($t) {
                        $t.data('autoClose', true); // после чего опять включаем закрытие
                    }, timer, $toggleable);
                });
            })($toggleable, $context, timer);
        },
        /**
         * Hides opened context when Escape key is pressed
         *
         * @param  {boolean} value
         */
        closeOnEscape: function(value) {
            if (!value) {
                return;
            }

            (function($toggleable) {
                $('body').on('keyup', function(e) {
                    if (e.which == 27) {
                        $toggleable.toggleable('hide');
                    }
                })
            })($(this));
        },
        /**
         * Makes context floating under all content
         *
         * @param  {mixed} value z-index, or overlay selector, or options object
         */
        modal: function(value) {
            if (!value) {
                return;
            }

            var $this = $(this),
                zIndex = typeof value == 'number' ? value : 100,
                $overlay = typeof value == 'string' ? $(value) : null,
                $popupBox = null;

            if (typeof value == 'object') {
                if (value.zIndex) {
                    zIndex = value.zIndex;
                }
                if (value.overlay) {
                    $overlay = $(value.overlay);
                }
                if (value.popupBox) {
                    $popupBox = $(value.popupBox);
                }
            }

            if (!$overlay || !$overlay.size()) {
                $overlay = $('<div/>');
            }

            if (!$popupBox || !$popupBox.size()) {
                $popupBox = $('<div/>');
            }

            $this.toggleable('option', 'modal', $.extend({}, value, { overlay: $overlay, zIndex: zIndex, popupBox: $popupBox}));
            var beforeCB = $this.toggleable('option', 'beforeToggle'),
                afterCB = $this.toggleable('option', 'afterToggle');

            $this.toggleable('option', 'beforeToggle', function(show) {
                var $this = $(this),
                    options = $this.toggleable('option', 'modal'),
                    $context = $this.toggleable('option', 'context');

                if (options.overlay && show) {
                    options.overlay
                        .css({
                            position: 'fixed',
                            top: '0px',
                            left: '0px',
                            'z-index': zIndex - 1,
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            display: 'none',
                        })
                        .addClass($this.toggleable('option', '_toggleableClass') + '_overlay')
                        .appendTo($('body'))
                        .fadeIn();

                    options.popupBox
                        .css({
                            position: 'fixed',
                            top: '0px',
                            left: '0px',
                            'z-index': zIndex,
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            display: 'none',
                        })
                        .addClass($this.toggleable('option', '_toggleableClass') + '_popupBox')
                        .appendTo($('body'))
                        .fadeIn();

                    options.oldZIndex = $context.css('z-index');

                    if (options.toCenter) {
                        // options.oldPosition = {
                        //  position: $context.css('position'),
                        //  offset: $context.offset()
                        // };
                        var $window = $(window);
                        $context.css({
                            position: 'fixed',
                            top: Math.max(($window.height() - $context.height()) / 2, 0),
                            left: Math.max(($window.width() - $context.width()) / 2, 0),
                        });
                    }
                    $context.css('z-index', options.zIndex);
                }
                if ($.isFunction(beforeCB)) {
                    beforeCB.apply(this, arguments);
                }
            });
            $this.toggleable('option', 'afterToggle', function(show) {
                var $this = $(this),
                    options = $this.toggleable('option', 'modal'),
                    $context = $this.toggleable('option', 'context');

                if (options.overlay && !show) {
                    options.overlay.fadeOut(function() { $(this).remove()});
                    $context.css('z-index', options.oldZIndex);
                    // if (options.toCenter) {
                    //  $context.offset(options.oldPosition.offset).css('position', options.oldPosition.position);
                    // }
                }
                if ($.isFunction(afterCB)) {
                    afterCB.apply(this, arguments);
                }
            });
        },
        /**
         * Module to make some elements inside context to be able to hide context
         *
         * @param  {string|boolean} value Selector of inner close
         */
        innerClose: function(value) {
            if (!value) {
                return;
            }

            var $this = $(this),
                _class = typeof(value) == 'string' ? value : 'toggleableInnerClose';
                $context = $this.toggleable('option', 'context'),
                $innerClose = $context.find('.' + _class);

            if ($innerClose.size() > 0) {
                $innerClose.data('toggleable', $this);
                $innerClose.click(function(e) {
                    e.preventDefault();
                    var $toggleable = $(this).data('toggleable');
                    $toggleable.toggleable('hide');
                })
            }
        }
    };

})(jQuery);