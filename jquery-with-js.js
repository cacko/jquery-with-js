(function ($) {
    $.fn.htmlWithJS = function (data) {
        const target = $(this),
            replaceWith = !!arguments[1];
        return $.Deferred(function (mainDeffer) {
            const content = $(data).not('script, style, [rel="stylesheet"], meta'),
                scripts = $(data).filter('script').toArray().reduce(function (result, script) {
                    const src = $(script).attr('src'),
                        inline = $(script).html();
                    if (src) {
                        result.src.push(src);
                    }
                    if (inline) {
                        result.inline.push(inline);
                    }
                    return result;
                }, {
                    'src': [$.Deferred(function (deferred) {
                        $(deferred.resolve);
                    })], 'inline': [], 'head': []
                }),
                css = $(data).filter('style, [rel="stylesheet"]');
            if (replaceWith) {
                $(target).replaceWith(content.append(css, scripts.head));
            } else {
                $(target).html(content.append(css, scripts.head));
            }
            $.ajaxSetup({cache: true});
            scripts.src.reduce((l, src) =>
                    l.pipe(() =>
                        typeof src === 'string' ? $.Deferred(function (d) {
                            $.getScript(src).always(() => $(d.resolve))
                        }) : src
                    )
                , $.Deferred().resolve()).done(function () {
                new Function(scripts.inline.reduce((res, script) => res + ';' + script, ''))();
                mainDeffer.resolveWith($(target));
            }).fail(function () {
                mainDeffer.rejectWith($(target));
            });
        });
    };
    $.fn.loadWithJS = function (src) {
        const target = $(this);
        return $.Deferred(function (deferred) {
            $.get(src, (data) => $(target).htmlWithJS(data))
                .done(() => deferred.resolveWith($(target)))
                .fail(() => deferred.rejectWith($(target)));
        })
    };
    $.fn.replaceWithJS = function (data) {
        return $(this).htmlWithJS(data, true);
    };
})(jQuery);