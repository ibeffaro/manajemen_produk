(function($){
    $.fn.appinityTable = function(options) {
        var _t          = this;
        var _xhr        = null;
        var ajaxUrl     = '';
        var ajaxKey     = '';
        var control     = false;
        var curWidth    = 0;
        var dataLoaded  = null;
        var primaryField= '';
        var scrLeft     = 0;
        var scrTop      = 0;
        var firstLoad   = false;
        var _this;

        var defaults = {
            freeze              : true,
            border              : true,
            freezeCol           : true,
            freezeRow           : true,
            shadowTheme         : false,
            dataType            : 'json',
            range               : [25, 50, 75, 100],
            filterHighlight     : false,
            controlPlacement    : 'bottom'
        };

        // destroy via call plugin
        if(typeof options == 'string' && options == 'destroy') {
            if(_t.parent().hasClass('appinityTable-container') && _t.parent().parent().hasClass('appinityTable') && _t.hasClass('d-none')) {
                _t.removeClass('d-none').removeClass('table-appinity');
                _t.siblings().remove();
                _t.unwrap().unwrap();
                _t.find('[data-appinity-disabled]').removeAttr('data-appinity-disabled').removeAttr('disabled');
            }
            return;
        }

        // reset
        if(typeof options == 'string' && options == 'reset') {
            if(_t.parent().hasClass('appinityTable-container') && _t.parent().parent().hasClass('appinityTable') && _t.hasClass('d-none')) {
                _t.removeClass('d-none').removeClass('table-appinity');
                _t.siblings().remove();
                _t.unwrap().unwrap();
                _t.find('[data-appinity-disabled]').removeAttr('data-appinity-disabled').removeAttr('disabled');
            }
            options = {};
        }

        var settings = $.extend({}, defaults, options);

        function fixTableCellWidth (table1, table2) {
            // width nya di kosongkan dlu
            $(table1).find('th').css({
                'min-width': '',
                'width': ''
            });
            $(table1).find('td').css({
                'min-width': '',
                'width': ''
            });
            $(table2).find('th').css({
                'min-width': '',
                'width': ''
            });
            $(table2).find('td').css({
                'min-width': '',
                'width': ''
            });

            var t1 = $(table1).find('tr').first().children();
            var t2 = $(table2).find('tr').first().children();

            var minWidth    = 150;
            if($(table1).parent().parent().hasClass('appinityTable-left-container')) {
                minWidth    = 200;
            }

            t1.each(function(){
                var i1  = $(this).index();
                var i2  = i1;
                
                if(typeof t1.eq(i1).attr('colspan') == 'undefined') {
                    //kondisi jika column tidak mempunyai colspan

                    // menyesuaikan dengan column yg mempunyai colspan
                    for(var i = 0; i < i1; i++) {
                        if(typeof t1.eq(i).attr('colspan') != 'undefined') {
                            i2 += ( parseInt(t1.eq(i).attr('colspan')) - 1);
                        }
                    }

                    var w1              = t1.eq(i1).outerWidth();
                    var w2              = t2.eq(i2).outerWidth();
                    var w               = w2 > w1 ? w2 : w1;
                    var limitWidth      = minWidth;
                    var fieldMaxWidth   = 0;
                    var fieldMinWidth   = 0;
                    if(t1.eq(i1).attr('width') && !isNaN(parseInt(t1.eq(i1).attr('width')))) {
                        limitWidth  = parseInt(t1.eq(i1).attr('width'));
                    }
                    if(t1.eq(i1).attr('max-width') && !isNaN(parseInt(t1.eq(i1).attr('max-width')))) {
                        fieldMaxWidth   = parseInt(t1.eq(i1).attr('max-width'));
                    }
                    if(t1.eq(i1).attr('min-width') && !isNaN(parseInt(t1.eq(i1).attr('min-width')))) {
                        fieldMinWidth   = parseInt(t1.eq(i1).attr('min-width'));
                    }
                    if(w < limitWidth) w = limitWidth;
                    if(fieldMaxWidth > 0 && w > fieldMaxWidth) w = fieldMaxWidth;
                    else if(fieldMinWidth > 0 && w < fieldMinWidth) w = fieldMinWidth;

                    t1.eq(i1).css({
                        width : w + 'px',
                        'min-width' : w + 'px',
                    });
                    t2.eq(i2).css({
                        width : w + 'px',
                        'min-width' : w + 'px',
                    });
                } else {
                    // kondisi jika column mempunyai colspan
                    var colspanIndex = 0;
                    for(var i = 0; i < i1; i++) {
                        if(typeof t1.eq(i).attr('colspan') != 'undefined') {
                            i2 += ( parseInt(t1.eq(i).attr('colspan')) - 1 );
                            colspanIndex += parseInt(t1.eq(i).attr('colspan'));
                        }
                    }
                    
                    var colspanNum  = parseInt(t1.eq(i1).attr('colspan'));
                    for(var i = 0; i < colspanNum; i++) {
                        var i3  = i2 + i;
                        var j   = colspanIndex + i;

                        var t3  = t1.closest('thead').children().last().children();

                        var w1  = t3.eq(j).outerWidth();
                        var w2  = t2.eq(i3).outerWidth();
                        var w   = w2 > w1 ? w2 : w1;
                        var limitWidth  = minWidth;
                        var fieldMaxWidth   = 0;
                        var fieldMinWidth   = 0;
                            if(t3.eq(j).attr('width') && isNaN(parseInt(t3.eq(j).attr('width')))) {
                            limitWidth  = parseInt(t3.eq(j).attr('width'));
                        }
                        if(t3.eq(j).attr('max-width') && !isNaN(parseInt(t3.eq(j).attr('max-width')))) {
                            fieldMaxWidth   = parseInt(t3.eq(j).attr('max-width'));
                        }
                        if(t3.eq(j).attr('min-width') && !isNaN(parseInt(t3.eq(j).attr('min-width')))) {
                            fieldMinWidth   = parseInt(t3.eq(j).attr('min-width'));
                        }
                        if(w < limitWidth) w = limitWidth;
                        if(fieldMaxWidth > 0 && w > fieldMaxWidth) w = fieldMaxWidth;
                        else if(fieldMinWidth > 0 && w < fieldMinWidth) w = fieldMinWidth;
        
                        t3.eq(j).css({
                            width : w + 'px',
                            'min-width' : w + 'px',
                        });
                        t2.eq(i3).css({
                            width : w + 'px',
                            'min-width' : w + 'px',
                        });
                    }
                }
            });
        }

        function fixTableCellHeight(e) {
            e.closest('.appinityTable-container').find('th').css({
                'height':'',
                'min-height':''
            });
            e.closest('.appinityTable-container').find('td').css({
                'height':'',
                'min-height':''
            });
            var rowLeft         = e.siblings('.appinityTable-left-container').find('tr');
            var rightContainer  = e.siblings('.appinityTable-right-container');
            rowLeft.each(function(k,v){
                var trLeft  = $(this);
                var index   = $(this).index();
                var cont    = $(this).closest('table').parent().attr('class');
                if(trLeft.parent().prop('tagName') == 'TBODY') {
                    var trRight = rightContainer.find('.' + cont).find('tbody').children().eq(index);
                    var h1      = trLeft.children().first().outerHeight();
                    var h2      = trRight.children().first().outerHeight();
                    var h       = h1 > h2 ? h1 : h2;

                    trLeft.children().css({
                        height: h,
                        'min-height': h
                    });
                    trRight.children().css({
                        height: h,
                        'min-height': h
                    });
                } else {
                    // IDENTIFIKASI TIDAK MEMPUNYAI COLSPAN
                    if(rightContainer.find('.' + cont).find('thead').children().first().children('th[colspan]').length == 0) {
                        var trRight = rightContainer.find('.' + cont).find('thead').children().eq(index);
                        var h1      = trLeft.children().first().outerHeight();
                        var h2      = trRight.children().first().outerHeight();
                        var h       = h1 > h2 ? h1 : h2;
    
                        trLeft.children().css({
                            height: h,
                            'min-height': h
                        });
                        trRight.children().css({
                            height: h,
                            'min-height': h
                        });
                    } else {
                        var trRight = rightContainer.find('.' + cont).find('thead').children('tr');
                        var h1      = trLeft.outerHeight();
                        var h2      = trRight.parent().outerHeight();
                        var h       = h1 > h2 ? h1 : h2;

                        trLeft.children().css({
                            height: h,
                            'min-height': h
                        });
                    }
                }
            });
        }

        function reFixCell(e) {
            fixTableCellHeight(e);

            var tableLeftTop    = e.siblings('.appinityTable-left-container').children('.appinityTable-top-container').children();
            var tableLeftBottom = e.siblings('.appinityTable-left-container').children('.appinityTable-bottom-container').children();
            var tableRightTop   = e.siblings('.appinityTable-right-container').children('.appinityTable-top-container').children();
            var tableRightBottom= e.siblings('.appinityTable-right-container').children('.appinityTable-bottom-container').children();
            fixTableCellWidth(tableLeftTop,tableLeftBottom);
            fixTableCellWidth(tableRightTop,tableRightBottom);

            var topContainer    = e.siblings('.appinityTable-right-container').children('.appinityTable-top-container');
            var leftContainer   = e.siblings('.appinityTable-left-container').children('.appinityTable-bottom-container');
            var rightContainer  = e.siblings('.appinityTable-right-container').children('.appinityTable-bottom-container');

            var bottomHeight    = Math.round(rightContainer[0].clientHeight);
            var bottomYScroller = Math.round(rightContainer[0].scrollHeight);
            var toleransiY      = Math.abs(bottomYScroller - bottomHeight);

            var bottomWidth     = Math.round(rightContainer[0].clientWidth);
            var tableWidth      = Math.round(rightContainer[0].scrollWidth);
            var toleransiX      = tableWidth - bottomWidth;

            if((toleransiY == 0 && toleransiX == 0) || rightContainer.find('table').find('tr').length == 0) {
                if(topContainer.find('table').outerWidth() > topContainer.outerWidth()) {
                    topContainer.css({
                        'overflow-y': 'scroll',
                        'overflow-x': 'hidden',
                        'min-height': topContainer.find('table').outerHeight() + 1
                    });
                    setTimeout(function(){
                        topContainer.css({
                            'min-height': topContainer.find('table').outerHeight() + 1
                        });    
                    },100);
                    leftContainer.css({
                        'overflow-y': 'hidden',
                        'overflow-x': 'scroll'
                    });
                    rightContainer.css('overflow','scroll');    
                    rightContainer.find('table').css({
                        'min-width' : topContainer.find('table').outerWidth(),
                        'height'    : '1px'
                    });
                } else {
                    topContainer.css({
                        'overflow-y': '',
                        'overflow-x': '',
                        'min-height': ''
                    });
                    leftContainer.css({
                        'overflow-y': '',
                        'overflow-x': ''
                    });
                    rightContainer.css('overflow','');
                    rightContainer.find('table').css({
                        'min-width' : '',
                        'height'    : ''
                    });
                }
            } else {
                topContainer.css({
                    'overflow-y': 'scroll',
                    'overflow-x': 'hidden',
                    'min-height': topContainer.find('table').outerHeight() + 1
                });
                setTimeout(function(){
                    topContainer.css({
                        'min-height': topContainer.find('table').outerHeight() + 1
                    });    
                },100);
                leftContainer.css({
                    'overflow-y': 'hidden',
                    'overflow-x': 'scroll'
                });
                rightContainer.css('overflow','scroll');
                rightContainer.find('table').css({
                    'min-width' : '',
                    'height'    : ''
                });
            }
            topContainer.scrollLeft(scrLeft);
            rightContainer.scrollLeft(scrLeft);
            rightContainer.scrollTop(scrTop);
            leftContainer.scrollTop(scrTop);
        }

        function scrollEvent(e) {
            var x   = e.siblings('.appinityTable-right-container').children('.appinityTable-bottom-container');
            var x2  = e.siblings('.appinityTable-left-container').children('.appinityTable-bottom-container');
            x.scroll(function(){
                var left 		= $(this).scrollLeft();
    			var top 		= $(this).scrollTop();
                $(this).siblings('.appinityTable-top-container').scrollLeft(left);
                e.siblings('.appinityTable-left-container').children('.appinityTable-bottom-container').scrollTop(top);
            });

            var Ys, Xs;
            var MOUSE_OVER  = false;
            var container   = e.parent();
            container.on('mouseenter touchstart',function(){
                MOUSE_OVER  = true;
            });
            container.on('mouseleave touchend',function(){
                MOUSE_OVER  = false;
            });
            container.on('touchstart',function(e){
                Ys = e.originalEvent.touches[0].clientY;
                Xs = e.originalEvent.touches[0].clientX;
            });

            var tableScrollParentEl = x.closest('.appinityTable').parent();
            var scrollParent        = getScrollParent(tableScrollParentEl[0]);

            // EVENT SCROLL UNTUK DESKTOP
            e.closest('.appinityTable').bind('wheel touchevent', function(e){
                if(MOUSE_OVER){
                    e.preventDefault();
                    var posTop  = x.scrollTop();
                    var posLeft = x.scrollLeft();
                    if(e.originalEvent.deltaY < 0) posTop -= Math.abs(e.originalEvent.deltaY);
                    else if(e.originalEvent.deltaY > 0) posTop += Math.abs(e.originalEvent.deltaY);
                    
                    if(e.originalEvent.deltaX < 0) posLeft -= Math.abs(e.originalEvent.deltaX);
                    else if(e.originalEvent.deltaX > 0) posLeft += Math.abs(e.originalEvent.deltaX);
                    
                    x2.scrollTop(posTop);
                    x.scrollTop(posTop).scrollLeft(posLeft);

                    var diffHeight = x.children().height() - x.height();
                    var parentTop  = $(scrollParent).scrollTop() + e.originalEvent.deltaY;
                    if(x.scrollTop() == 0 || x.scrollTop() > diffHeight) {
                        $(scrollParent).scrollTop(parentTop);
                    }
                }
            });

            // EVENT TOUCH UNTUK MOBILE
            container.on('touchmove',function(e){
                e.preventDefault();
                if(MOUSE_OVER){
                    var Ye = e.originalEvent.changedTouches[0].clientY;
                    var Xe = e.originalEvent.changedTouches[0].clientX;

                    var posTop  = x.scrollTop();
                    var posLeft = x.scrollLeft();
                    
                    if(Ys > Ye) posTop += (Math.abs(Ye - Ys) / 15);
                    else if(Ys < Ye) posTop -= (Math.abs(Ye - Ys) / 15);

                    if(Xs > Xe) posLeft += (Math.abs(Xe - Xs) / 15);
                    else if(Xs < Xe) posLeft -= (Math.abs(Xe - Xs) / 15);

                    x2.scrollTop(posTop);
                    x.scrollTop(posTop).scrollLeft(posLeft);

                    var diffHeight = x.children().height() - x.height();
                    var parentTop  = $(scrollParent).scrollTop();
                    if(Ys > Ye) parentTop += (Math.abs(Ye - Ys) / 15);
                    else if(Ys < Ye) parentTop -= (Math.abs(Ye - Ys) / 15);

                    if(x.scrollTop() == 0 || x.scrollTop() > diffHeight) {
                        $(scrollParent).scrollTop(parentTop);
                    }
                }
            });
        }

        function getScrollParent(node) {
            if (node == null) {
                return null;
            }

            if (node.scrollHeight > node.clientHeight) {
                return node;
            } else {
                return getScrollParent(node.parentNode);
            }
        }

        function filterDateInit() {
            if($().daterangepicker) {
                if($().inputmask) {
                    _t.parent().find('[data-filterType="date"]').each(function(){
                        $(this).inputmask({
                            alias: 'datetime',
                            inputFormat: 'dd/mm/yyyy',
                            oncleared: function() {
                                $(this).val('');
                                getData();
                            },
                            onincomplete: function() {
                                $(this).val('');
                                getData();
                            },
                            oncomplete: function() {
                                getData();
                            }
                        });
                    });
                }
            
                _t.parent().find('[data-filterType="date"]:not([readonly])').each(function(){
                    var parent  = $(this).closest('.panel-content');
                    if($(this).closest('.modal').length > 0) {
                        parent  = $(this).closest('.modal');
                    }
                    $(this).daterangepicker({
                        singleDatePicker: true,
                        showDropdowns: true,
                        parentEl: parent,
                        locale: {
                            format: 'DD/MM/YYYY',
                            cancelLabel: 'Batal',
                            applyLabel: 'Ok',
                            daysOfWeek: [lang.min, lang.sen, lang.sel, lang.rab, lang.kam, lang.jum, lang.sab],
                            monthNames: [lang.jan, lang.feb, lang.mar, lang.apr, lang.mei, lang.jun, lang.jul, lang.agu, lang.sep, lang.okt, lang.nov, lang.des]
                        },
                        autoUpdateInput: false,
                        autoApply: true
                    }, function(start, end, label) {
                    }).on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format('DD/MM/YYYY'));
                        getData();
                    }).on('cancel.daterangepicker', function(ev, picker) {
                        $(this).val('');
                        getData();
                    });
                });
            }
        }
        function filterDaterangeInit() {
            if($().daterangepicker) {
                if($().inputmask) {
                    _t.parent().find('[data-filterType="daterange"]').each(function(){
                        $(this).inputmask({
                            alias: 'datetime',
                            inputFormat: 'dd/mm/yyyy - dd/mm/yyyy',
                            oncleared: function() {
                                $(this).val('');
                                getData();
                            },
                            onincomplete: function() {
                                $(this).val('');
                                getData();
                            },
                            oncomplete: function() {
                                getData();
                            }
                        });
                    });
                }
        
                _t.parent().find('[data-filterType="daterange"]:not([readonly])').each(function(){
                    var parent  = $(this).closest('.panel-content');
                    var ranges  = {};
                    if($(this).closest('.modal').length > 0) {
                        parent  = $(this).closest('.modal');
                    }
                    if(typeof $(this).attr('data-range') != 'undefined' && $(this).attr('data-range').toLowerCase() == 'true') {
                        ranges = {
                            'Today': [moment(), moment(), lang.hari_ini],
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days'), lang.besok],
                            'Last 7 Days': [moment().subtract(6, 'days'), moment(), lang.tujuh_hari_terakhir],
                            'Last 30 Days': [moment().subtract(29, 'days'), moment(), lang.tigapuluh_hari_terakhir],
                            'This Month': [moment().startOf('month'), moment().endOf('month'), lang.bulan_ini],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month'), lang.bulan_lalu]
                        };
                    }
                    $(this).daterangepicker({
                        showDropdowns: true,
                        ranges: ranges,
                        alwaysShowCalendars: true,
                        parentEl: parent,
                        locale: {
                            format: 'DD/MM/YYYY - DD/MM/YYYY',
                            cancelLabel: lang.batal,
                            customRangeLabel: lang.kustom,
                            applyLabel: lang.ok,
                            daysOfWeek: [lang.min, lang.sen, lang.sel, lang.rab, lang.kam, lang.jum, lang.sab],
                            monthNames: [lang.jan, lang.feb, lang.mar, lang.apr, lang.mei, lang.jun, lang.jul, lang.agu, lang.sep, lang.okt, lang.nov, lang.des]
                        },
                        autoUpdateInput: false
                    }, function(start, end, label) {
                    }).on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                        getData();
                    }).on('cancel.daterangepicker', function(ev, picker) {
                        $(this).val('');
                        getData();
                    });
                });
            }
        }
        function filterCurrencyInit() {
            if($().inputmask) {
                _t.parent().find('[data-filterType="currency"]:not([readonly])').each(function(){
                    var digits = 0;
                    if(typeof $(this).attr('data-decimal') != 'undefined' && !isNaN(parseInt($(this).attr('data-decimal')))) {
                        digits = parseInt($(this).attr('data-decimal'));
                    }
                    $(this).inputmask({
                        prefix: "",
                        groupSeparator: ".",
                        radixPoint: ",",
                        alias: "numeric",
                        digits: digits,
                        digitsOptional: !1,
                        rightAlign: false,
                        oncleared: function() {
                            $(this).val('');
                        }
                    });
                    $(this).keyup(function(){
                        getData();
                    });
                });
            }
        }
        function filterSelect2Init() {
            if($().select2) {
                _t.closest('.appinityTable').find('select').each(function(){
                    var $t          = $(this);
            
                    if($t.data('select2')) {
                        $t.select2('destroy');
                    }
            
                    var width       = '100%';
                    var parent      = $('body');
                    if($(this).closest('.modal').length > 0) {
                        parent  = $(this).closest('.modal');
                    }
                    if(typeof $t.attr('data-width') != 'undefined') {
                        width   = $t.attr('data-width');
                    }
                    if(!width) width = 'resolve';
            
                    var config = {
                        language: 'app',
                        width: width
                    };
            
                    if($t.children().length <= 5) {
                        config.minimumResultsForSearch  = -1;
                    }
                    $t.select2(config);
                });
            }
        }

        function appNumberFormat(e, c, d, t, z){
            var n = e, 
            c = isNaN(c = Math.abs(c)) ? 2 : c, 
            d = d == undefined ? "." : d, 
            t = t == undefined ? "," : t, 
            s = n < 0 ? "-" : "", 
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
            j = (j = i.length) > 3 ? j % 3 : 0;
            x = z == 'absolute' ? false : true;
            var result = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
            return result;
        }  
        
        function appCustomDate(e,timeFormat) {
            var dt = e;
            if(e.length == 10) {
                if(e == '0000-00-00' || e == null) {
                    dt = '';
                } else {
                    var x = dt.split('-');
                    if(x.length == 3) {
                        dt = x[2]+'/'+x[1]+'/'+x[0];
                    }
                }
            } else if(e.length == 19){
                if(e == '0000-00-00 00:00:00' || e == null) {
                    dt = '';
                } else {
                    var x = dt.split(' ');
                    if(x.length == 2) {
                        var y = x[0].split('-');
                        if(y.length == 3) {
                            var dt  = y[2]+'/'+y[1]+'/'+y[0];
                            if(typeof timeFormat == 'undefined') {
                                timeFormat = 'h:m';
                            } else {
                                timeFormat = timeFormat.toLowerCase();
                            }
                            tt = x[1].split(':');
                            if(timeFormat == 'h') {
                                dt += ' ' + tt[0];
                            } else if(timeFormat == 'h:m') {
                                dt += ' ' + tt[0] + ':' + tt[1];
                            } else if(timeFormat == 'h:m:s') {
                                dt += ' ' + tt[0] + ':' + tt[1] + ':' + tt[2];
                            }
                        }
                    }
                }
            }
            return dt;
        }        

        function colContextMenu() {
            if(settings.freezeCol) {
                var elementHeader   = '#' + _this.closest('.appinityTable').attr('id') + ' thead th';
                $(document).on('contextmenu',elementHeader, function(e) {
                    e.preventDefault();
                    $('.col-' + _this.closest('.appinityTable').attr('id') + ' .context-menu-item').each(function(){
                        $(this).addClass('context-menu--disabled');
                    });
                    var parentContainer = $(this).closest('table').parent().parent();
                    $('.col-' + _this.closest('.appinityTable').attr('id') + ' .context-menu-item').each(function(){
                        if( ($(this).text() == lang.freeze_kolom && parentContainer.hasClass('appinityTable-right-container')) || 
                            (($(this).text() == lang.unfreeze_kolom || $(this).text() == lang.unfreeze_semua_kolom) && parentContainer.hasClass('appinityTable-left-container'))
                        ) {
                            $(this).removeClass('context-menu--disabled');
                        }
                    });
                });

                $.contextMenu('destroy', elementHeader);
                $.contextMenu({
                    selector: elementHeader,
                    className: 'col-' + _this.closest('.appinityTable').attr('id'),
                    callback: function(key, options) {
                        var index = $(this).index();
                        var appTable = $(this).closest('.appinityTable');
                        if(key == 'freeze') {
                            if($(this).closest('table').parent().parent().hasClass('appinityTable-right-container')) {
                                var topTable = appTable.find('.appinityTable-left-container').find('.appinityTable-top-container').children();
                                var bottomTable = appTable.find('.appinityTable-left-container').find('.appinityTable-bottom-container').children();
                                if(topTable.children('thead').length == 0) {
                                    topTable.append('<thead></thead>');
                                }
                                if(topTable.children('tbody').length == 0) {
                                    topTable.append('<tbody></tbody>');
                                }
                                if(bottomTable.children('tbody').length == 0) {
                                    bottomTable.append('<tbody></tbody>');
                                }
                                appTable.find('.appinityTable-right-container').children().each(function(){
                                    var containerClass  = $(this).attr('class');
                                    $(this).find('tr').each(function(){
                                        var indexTR     = $(this).index();
                                        var parentEl    = $(this).parent().prop('tagName').toLowerCase();
                                        if($(this).children().eq(index).find('select').length > 0) {
                                            $(this).children().eq(index).find('select').find('option').removeAttr('selected');
                                            $(this).children().eq(index).find('select').find(':selected').attr('selected',true);                        
                                            if($(this).children().eq(index).find('select').data('select2') && $().select2) {
                                                $(this).children().eq(index).find('select').select2('destroy');
                                            }
                                        } else if($(this).children().eq(index).find('input').length > 0) {
                                            if($(this).children().eq(index).find('input').attr('type') != 'checkbox') {
                                                $(this).children().eq(index).find('input').attr('value',$(this).children().eq(index).find('input').val());
                                            } else {
                                                if($(this).children().eq(index).find('input').is(':checked')) {
                                                    $(this).children().eq(index).find('input').attr('checked',true);
                                                } else {
                                                    $(this).children().eq(index).find('input').removeAttr('checked');
                                                }
                                            }
                                        }
                                        var content     = $(this).children().eq(index)[0].outerHTML.replace('context-menu-active','');
                                        if(appTable.find('.appinityTable-left-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).length == 0) {
                                            appTable.find('.appinityTable-left-container').find('.' + containerClass).find(parentEl).append('<tr></tr>');
                                        }
                                        appTable.find('.appinityTable-left-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).append(content);
                                        $(this).children().eq(index).remove();
                                    });
                                });
                            }
                        } else if(key == 'unfreeze') {
                            if($(this).closest('table').parent().parent().hasClass('appinityTable-left-container')) {
                                appTable.find('.appinityTable-left-container').children().each(function(){
                                    var containerClass  = $(this).attr('class');
                                    $(this).find('tr').each(function(){
                                        var indexTR     = $(this).index();
                                        var parentEl    = $(this).parent().prop('tagName').toLowerCase();
                                        if($(this).children().eq(index).find('select').length > 0) {
                                            $(this).children().eq(index).find('select').find('option').removeAttr('selected');
                                            $(this).children().eq(index).find('select').find(':selected').attr('selected',true);                        
                                            if($(this).children().eq(index).find('select').data('select2') && $().select2) {
                                                $(this).children().eq(index).find('select').select2('destroy');
                                            }
                                        } else if($(this).children().eq(index).find('input').length > 0) {
                                            if($(this).children().eq(index).find('input').attr('type') != 'checkbox') {
                                                $(this).children().eq(index).find('input').attr('value',$(this).children().eq(index).find('input').val());
                                            } else {
                                                if($(this).children().eq(index).find('input').is(':checked')) {
                                                    $(this).children().eq(index).find('input').attr('checked',true);
                                                } else {
                                                    $(this).children().eq(index).find('input').removeAttr('checked');
                                                }
                                            }
                                        }
                                        var content     = $(this).children().eq(index)[0].outerHTML.replace('context-menu-active','');
                                        if(appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).length == 0) {
                                            appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).append('<tr></tr>');
                                        }
                                        appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).prepend(content);
                                        $(this).children().eq(index).remove();
                                    });
                                });
                            }
                        } else if(key == 'unfreezeAll') {
                            if($(this).closest('table').parent().parent().hasClass('appinityTable-left-container')) {
                                appTable.find('.appinityTable-left-container').children().each(function(){
                                    var containerClass  = $(this).attr('class');
                                    $(this).find('tr').each(function(){
                                        var indexTR     = $(this).index();
                                        var parentEl    = $(this).parent().prop('tagName').toLowerCase();
                                        $($(this).children().get().reverse()).each(function(){
                                            if($(this).find('select').length > 0) {
                                                $(this).find('select').find('option').removeAttr('selected');
                                                $(this).find('select').find(':selected').attr('selected',true);                        
                                                if($(this).find('select').data('select2') && $().select2) {
                                                    $(this).find('select').select2('destroy');
                                                }
                                            } else if($(this).find('input').length > 0) {
                                                if($(this).find('input').attr('type') != 'checkbox') {
                                                    $(this).find('input').attr('value',$(this).find('input').val());
                                                } else {
                                                    if($(this).find('input').is(':checked')) {
                                                        $(this).find('input').attr('checked',true);
                                                    } else {
                                                        $(this).find('input').removeAttr('checked');
                                                    }
                                                }
                                            }
                                            var content     = $(this)[0].outerHTML.replace('context-menu-active','');
                                            if(appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).length == 0) {
                                                appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).append('<tr></tr>');
                                            }
                                            appTable.find('.appinityTable-right-container').find('.' + containerClass).find(parentEl).children().eq(indexTR).prepend(content);
                                        });
                                        $(this).html('');
                                    });
                                });
                            }
                        }
                        filterDateInit();
                        filterDaterangeInit();
                        filterCurrencyInit();
                        filterSelect2Init();
                        reFixCell(_this);
                        setTimeout(function(){
                            reFixCell(_this);
                        },300);
                    },
                    items: {
                        freeze      : {
                            name    : 'Freeze Kolom',
                            icon    : 'fa-arrow-to-left'
                        },
                        unfreeze    : {
                            name    : 'Unfreeze Kolom',
                            icon    : 'fa-arrow-to-right',
                        },
                        unfreezeAll : {
                            name    : 'Unfreeze Semua Kolom',
                            icon    : 'fa-chevron-double-right'
                        }
                    }
                });
                $(document).on('contextmenu',elementHeader + ' :input', function(e) {
                    e.stopPropagation();
                });
            }
        }

        function rowContextMenu(i) {
            if($.contextMenu) {
                var items   = {};
                if(settings.freezeRow) {
                    items['freeze'] = {
                        name : 'Freeze Baris',
                        icon : 'fa-arrow-to-top'
                    };
                    items['unfreeze'] = {
                        name : 'Unfreeze Baris',
                        icon : 'fa-arrow-to-bottom'
                    };
                    items['unfreezeAll'] = {
                        name : 'Unfreeze Semua Baris',
                        icon : 'fa-chevron-double-down'
                    };
                }
                if(Object.keys(items).length > 0 && Object.keys(i).length > 0) {
                    items['separator'] = '-';
                }
                $.each(i, function(kItems,vItems){
                    items[kItems]   = vItems;
                });
                if(Object.keys(items).length > 0) {
                    var element     = '#' + _this.closest('.appinityTable').attr('id') + ' tbody tr';
                    $(document).on('contextmenu',element, function(e) {
                        e.preventDefault();
                        $('.row-' + _this.closest('.appinityTable').attr('id') + ' .context-menu-item').each(function(){
                            $(this).addClass('context-menu--disabled');
                        });
                        var index       = $(this).index();
                        var parentClass = $(this).closest('table').parent().attr('class');
                        $('#' + _this.closest('.appinityTable').attr('id')).find('.' + parentClass).each(function(){
                            $(this).find('tbody').children().eq(index).find('[data-context-key]').each(function(){
                                var title   = $(this).text();
                                var parentContainer = $(this).closest('table').parent();
                                if(typeof $(this).attr('aria-label') != 'undefined' && $(this).attr('aria-label') != '') {
                                    title   = $(this).attr('aria-label');
                                }
                                $('.row-' + _this.closest('.appinityTable').attr('id') + ' .context-menu-item').each(function(){
                                    if( title == $(this).text() ||
                                        ($(this).text() == 'Freeze Baris' && parentContainer.hasClass('appinityTable-bottom-container')) || 
                                        (($(this).text() == 'Unfreeze Baris' || $(this).text() == 'Unfreeze Semua Baris') && parentContainer.hasClass('appinityTable-top-container'))
                                    ) {
                                        $(this).removeClass('context-menu--disabled');
                                    }
                                });
                            });
                        });
                    });
                    $.contextMenu('destroy', element);
                    $.contextMenu({
                        selector: element,
                        className: 'row-' + _this.closest('.appinityTable').attr('id'),
                        callback: function(key, options) {
                            var index = $(this).index();
                            var parentClass = $(this).closest('table').parent().attr('class');
                            var appTable = $(this).closest('.appinityTable');
                            var el = null;
                            if(key == 'freeze') {
                                if($(this).closest('table').parent().hasClass('appinityTable-bottom-container')) {
                                    appTable.find('.appinityTable-top-container').each(function(){
                                        $(this).find('tbody').append('<tr></tr>');
                                        var appTR = $(this).find('tbody').children().last();
                                        var appContent = $(this).siblings('.appinityTable-bottom-container').find('tbody').children().eq(index);
                                        appTR.html(appContent.html());
                                        appContent.remove();
                                    });
                                    reFixCell(_this);
                                    setTimeout(function(){
                                        reFixCell(_this);
                                    },300);
                                }
                            } else if(key == 'unfreeze') {
                                if($(this).closest('table').parent().hasClass('appinityTable-top-container')) {
                                    appTable.find('.appinityTable-bottom-container').each(function(){
                                        $(this).find('tbody').prepend('<tr></tr>');
                                        var appTR = $(this).find('tbody').children().first();
                                        var appContent = $(this).siblings('.appinityTable-top-container').find('tbody').children().eq(index);
                                        appTR.html(appContent.html());
                                        appContent.remove();
                                    });
                                    reFixCell(_this);
                                    setTimeout(function(){
                                        reFixCell(_this);
                                    },300);
                                }
                            } else if(key == 'unfreezeAll') {
                                if($(this).closest('table').parent().hasClass('appinityTable-top-container')) {
                                    $($(this).parent().children().get().reverse()).each(function(){
                                        var indexTR = $(this).index();
                                        appTable.find('.appinityTable-bottom-container').each(function(){
                                            $(this).find('tbody').prepend('<tr></tr>');
                                            var appTR = $(this).find('tbody').children().first();
                                            var appContent = $(this).siblings('.appinityTable-top-container').find('tbody').children().eq(indexTR);
                                            appTR.html(appContent.html());
                                            appContent.remove();
                                        });
                                    });
                                    reFixCell(_this);
                                    setTimeout(function(){
                                        reFixCell(_this);
                                    },300);
                                }
                            } else {
                                $('#' + _this.closest('.appinityTable').attr('id')).find('.' + parentClass).each(function(){
                                    el = $(this).find('tbody').children().eq(index).find('[data-context-key="'+key+'"]');
                                });
                                if(el != null && typeof el != 'undefined') {
                                    el[0].click();
                                }
                            }
                        },
                        items: items
                    });
                }
            }
        }
        
        function getData(elPos) {
            if(_xhr != null) {
                _xhr.abort();
                _xhr = null;
            }

            scrLeft                 = _t.siblings('.appinityTable-right-container').children('.appinityTable-bottom-container').scrollLeft();
            var triggerAction       = _t.attr('data-trigger');

            var appTable            = _t.closest('.appinityTable');
            var infoSection         = appTable.find('.appinityTable-info-data');
            var totalPageSection    = appTable.find('[data-page-total]');
            var pageSection         = appTable.find('[data-page]');
            var limitSection        = appTable.find('[data-limit]');
            var ajaxData            = {
                select              : [],
                filter              : {}
            };
            if(pageSection.length > 0) {
                ajaxData['limit']   = limitSection.val();
                ajaxData['page']    = pageSection.val();
            }
            if(appTable.find('[data-appinitySort="asc"]').length > 0) {
                var ord             = appTable.find('[data-appinitySort="asc"]').parent().attr('data-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_').split(' ');
                ajaxData['order_by']= ord[0];
                ajaxData['order']   = 'asc';
            } else if(appTable.find('[data-appinitySort="desc"]').length > 0) {
                var ord             = appTable.find('[data-appinitySort="desc"]').parent().attr('data-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_').split(' ');
                ajaxData['order_by']= ord[0];
                ajaxData['order']   = 'desc';
            }
            _t.find('[data-content]').each(function(){
				if($('[data-content-id="'+$(this).attr('data-content')+'"]').length == 1) {
					$('[data-content-id="'+$(this).attr('data-content')+'"] [data-content]').each(function(){
						var _select = $(this).attr('data-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_');
						if(_select && _select != 'button' && _select != '{sequence}' && (_select.indexOf('@') == -1 && _select.indexOf(':') == -1)) {
							ajaxData['select'].push(_select);
						}
					});
				} else {
					var _select = $(this).attr('data-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_');
					if(_select && _select != 'button' && _select != '{sequence}' && (_select.indexOf('@') == -1 && _select.indexOf(':') == -1)) {
						ajaxData['select'].push(_select);
						if(typeof $(this).attr('data-sub-content') != 'undefined') {
							var subContent = $(this).attr('data-sub-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_');
							if(subContent && subContent != 'button' && subContent != '{sequence}') {
								ajaxData['select'].push(subContent);
							}
						}
						if(typeof $(this).attr('data-thumbnail') != 'undefined') {
							var thumbnail = $(this).attr('data-thumbnail').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_');
							if(thumbnail && thumbnail != 'button' && thumbnail != '{sequence}') {
								ajaxData['select'].push(thumbnail);
							}
						}
					}
				}
            });

            if(typeof _this.attr('data-form-filter') != 'undefined' && $('#' + _this.attr('data-form-filter')).length > 0) {
                $('#' + _this.attr('data-form-filter')).find('input[type="text"], textarea, select').each(function(){
                    if($(this).val().trim() != '' && typeof $(this).attr('name') != 'undefined') {
                        var _f  = $(this).attr('name').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_').split(' ');
                        var _c  = _f[0];
                        if($(this).prop('tagName') == 'SELECT') {
                            _c  = 'opt::' + _c;
                        }
                        ajaxData['filter'][_c]  = $(this).val().trim();
                    }
                });
            }

            appTable.find('thead').find(':input').each(function(){
                if($(this).val().trim() != '' && typeof $(this).attr('data-filtertype') != 'undefined') {
                    var _i  = $(this).closest('th').index();
                    var _f  = $(this).closest('thead').children('tr').first().children().eq(_i).attr('data-content').replaceAll('@','__at__').replaceAll('::','__colon__').replaceAll(':','_single_colon_').split(' ');
                    var _c  = _f[0];
                    if($(this).prop('tagName') == 'SELECT') {
                        _c  = 'opt::' + _c;
                    }
                    ajaxData['filter'][_c]  = $(this).val().trim();
                }
            });

            if(infoSection.length > 0) {
                infoSection.html('<i class="d-inline-block fa-spinner-third fa-spin me-2 text-app"></i>Mohon Tunggu');
            }

            ajaxUrl = appTable.find('table[data-source]').attr('data-source');

            var ajaxConfig  = {
                url     : ajaxUrl,
                type    : 'get',
                data    : ajaxData,
                dataType: 'json',
                success : function(r) {
                    var contextItems    = {};
                    dataLoaded          = r;
                    // === RESET CONTROL
                    appTable.find('.appinityTable-control').removeClass('action-mode');
                    appTable.find('.cb-all').prop('checked',false).prop('indeterminate',false);

                    // === MENGHITUNG JUMLAH HALAMAN
                    var totalRecord = typeof r.total_data != 'undefined' ? parseInt(r.total_data) : 0;
                    if(typeof r.total_filter != 'undefined' && r.total_filter != null) {
                        totalRecord = parseInt(r.total_filter);
                    }
                    var totalPage   = Math.ceil(totalRecord / parseInt(limitSection.val()));
                    totalPageSection.text(totalPage);
                    if(totalPage && parseInt(pageSection.val()) == 0) {
                        pageSection.val(1);
                    } else if( totalPage < parseInt(pageSection.val())) {
                        pageSection.val(totalPage).trigger('keyup');
                    }

                    // INFORMASI JUMLAH DATA
                    var indexPage   = parseInt(pageSection.val()) > 0 ? parseInt(pageSection.val()) - 1 : 0;
                    if(parseInt(r.total_data) == 0) {
                       infoSection.html('Tidak ada data'); 
                    } else {
                        if(totalRecord == 0) {
                            infoSection.html('Tidak ada data yang cocok');
                        } else {
                            var firstData   = parseInt(limitSection.val()) * indexPage + 1;
                            var lastData    = firstData + parseInt(r.num_rows) - 1;
                            var showData    = firstData == lastData ? firstData : firstData + ' - ' + lastData;
                            infoSection.html('Data ke ' + showData + ' dari ' + totalRecord + ' data');
                        }
                        if(typeof r.total_filter != 'undefined' && r.total_filter != null) {
                            infoSection.append('<span class="ms-1 fst-italic fw-bold">(Tersaring dari ' + r.total_data + ' Data)</span>');
                        }
                    }

                    // MEMASUKAN DATA KEDALAM TABEL
                    appTable.find('.appinityTable-bottom-container').find('tbody').html('');
                    if(r.status == 'failed') {
                        if(typeof r.message != 'undefined') {
                            infoSection.html('<span class="text-danger">' + r.message + '</span>');
                        } else {
                            infoSection.html('<span class="text-danger">Terjadi Kesalahan</span>');
                        }
                    } else {
                        if(typeof r.html != 'undefined') {
                            appTable.find('.appinityTable-right-container').find('.appinityTable-bottom-container').find('tbody').html(r.html);
                            appTable.find('.appinityTable-right-container').find('.appinityTable-bottom-container').find('tbody').find('button, a').attr('app-link',_t.attr('app-link'));
                            appTable.find('.appinityTable-right-container').find('.appinityTable-bottom-container').find('tbody').find('[data-context-key]').each(function(){
                                var contextName = $(this).text().trim();
                                var contextIcon = null;
                                if($(this).find('.appinityTable-action-icon').length > 0) {
                                    contextIcon = $(this).find('.appinityTable-action-icon').attr('class').replace('appinityTable-action-icon').trim();
                                }
                                if(typeof $(this).attr('aria-label') != 'undefined') {
                                    contextName = $(this).attr('aria-label');
                                }
                                if(contextName) {
                                    contextItems[$(this).attr('data-context-key')] = {
                                        name : contextName,
                                        icon : contextIcon
                                    }
                                }
                            });
                        } else if(typeof r.data != 'undefined') {
                            var fieldReference  = appTable.find('.appinityTable-top-container');
                            if(fieldReference.find('thead').length == 0) {
                                fieldReference  = appTable.find('.appinityTable-bottom-container');
                            }
                            var app_link        = '';
                            if(typeof _this.attr('app-link') != 'undefined') {
                                app_link        = _this.attr('app-link');
                            }
                            var actionTarget    = '';
                            if(typeof _this.attr('data-action-target') != 'undefined') {
                                actionTarget    = _this.attr('data-action-target');
                            }
                            $.each(r.data,function(k,v){
                                primaryField = r.primary_field;
                                $('button[app-link="'+app_link+'"], a[app-link="'+app_link+'"]').attr('data-key',primaryField);
                                if(appTable.find('.appinityTable-top-container').find('tbody').find('[data-val="'+v[r.primary_field]+'"]').length == 0) {
                                    appTable.find('.appinityTable-bottom-container').find('tbody').append('<tr data-key="'+r.primary_field+'" data-val="'+v[r.primary_field]+'"></tr>');
                                    fieldReference.each(function(){
                                        $(this).find('thead').children().first().children().each(function(){
											var __width     = typeof $(this).attr('width') != 'undefined' ? ' width="'+$(this).attr('width')+'"' : '';
											var __class     = typeof $(this).attr('class') != 'undefined' ? $(this).attr('class') : '';
											var container   = $(this).closest('table').parent().siblings('.appinityTable-bottom-container').find('tbody').children().last();
											if(container.length == 0) {
												container   = $(this).closest('table').find('tbody').children().last();
											}
											if($('[data-content-id="'+$(this).attr('data-content')+'"]').length == 1) {
												var _c 			= $('[data-content-id="'+$(this).attr('data-content')+'"]').html();
												var __default  	= typeof $(this).attr('data-default') != 'undefined' ? $(this).attr('data-default') : '';
												container.append('<td'+__width+' class="'+__class+'">'+_c+'</td>');
												var _l = container.children().last();
												_l.find('[data-content]').each(function(){
													var string      = v[$(this).attr('data-content')];
													var __prefix    = typeof $(this).attr('data-prefix') != 'undefined' ? $(this).attr('data-prefix') : '';
													var __suffix    = typeof $(this).attr('data-suffix') != 'undefined' ? $(this).attr('data-suffix') : '';
													if(string !== undefined) {
														var __type = $(this).attr('data-type');
														if(__type != undefined && __type == 'currency') {
															var decimal = 0;
															var xDec = parseFloat(string).toString().split('.');
															if(xDec[1] != undefined) {
																decimal = xDec[1].length;
															} else {
																decimal = 0;
															}
															var dec = $(this).attr('data-decimal');
															if(dec != undefined && !isNaN(parseInt(dec))) {
																decimal = parseInt(dec);
															}
															string  = appNumberFormat(string,decimal,',','.');
														} else if(__type != undefined && __type == 'badge') {
															var __condition = $(this).attr('data-condition');
															var __color = typeof $(this).attr('data-color') !== 'undefined' ? $(this).attr('data-color') : 'primary';
															if(typeof string == 'object') {
																var tempString = '';
																$.each(string, function(bk,bv){
																	tempString += '<span class="badge bg-'+__color+'">'+bv+'</span>';
																});
																if(!tempString && __default) {
																	string = __default;
																} else {
																	string = tempString;
																}
															} else if(__condition != undefined) {
																var cond = __condition.replaceAll('\'','"');
																var jCond = JSON.parse(cond);
																if(typeof jCond == 'object' && typeof jCond[string] != 'undefined') {
																	__color = jCond[string];
																	string = '<span class="badge bg-'+__color+'">'+string+'</span>';
																}
																if(!string && __default) {
																	string = __default;
																}
															}
														}
														if(string && (__prefix || __suffix)) {
															string = __prefix+string+__suffix;
														}
														$(this).html(string);
													}
												});
											} else {
												var __content   = typeof $(this).attr('data-content') != 'undefined' ? $(this).attr('data-content').split(' ') : [];
												var __subContent= typeof $(this).attr('data-sub-content') != 'undefined' ? $(this).attr('data-sub-content').split(' ') : [];
												var __thumbnail = typeof $(this).attr('data-thumbnail') != 'undefined' ? $(this).attr('data-thumbnail').split(' ') : [];
												var __type      = typeof $(this).attr('data-type') != 'undefined' ? $(this).attr('data-type').toLowerCase() : '';
												var __format    = typeof $(this).attr('data-format') != 'undefined' ? $(this).attr('data-format') : '';
												var __filter    = typeof $(this).attr('data-filter') != 'undefined' ? $(this).attr('data-filter') : '';
												var __prefix    = typeof $(this).attr('data-prefix') != 'undefined' ? $(this).attr('data-prefix') : '';
												var __suffix    = typeof $(this).attr('data-suffix') != 'undefined' ? $(this).attr('data-suffix') : '';
												var string      = v[__content[0]];
												var subString   = typeof v[__subContent[0]] != 'undefined' && v[__subContent[0]] != null ? v[__subContent[0]] : '';
												var thumbnail   = typeof v[__thumbnail[0]] != 'undefined' && v[__thumbnail[0]] != null ? v[__thumbnail[0]] : '';
												var __img_popup = false;
												var __img_link	= null;
												var __img_link_title	= 'Lihat Detail';
												var __cache = true;
												var str_search  = '';
												if(typeof $(this).attr('data-popup') != 'undefined' && $(this).attr('data-popup') == 'true') {
													__img_popup = true;
												}
												if(typeof $(this).attr('data-link') != 'undefined') {
													__img_link = $(this).attr('data-link');
												}
												if(typeof $(this).attr('data-link-title') != 'undefined') {
													__img_link_title = $(this).attr('data-link-title');
												}
												if(typeof $(this).attr('data-cache') != 'undefined' && $(this).attr('data-cache') == 'false') {
													__cache = false;
												}
												var colIndex = $(this).index();
												var buttonIndex = $(this).closest('tr').find('[data-content="button"]');
												if(_t.find('[data-content="button"]').length > 0 && buttonIndex.index() == 0) {
													colIndex -= 1;
												}
												if($(this).closest('thead').children().last().find(':input').eq(colIndex).length > 0) {
													str_search  = $(this).closest('thead').children().last().find(':input').eq(colIndex).val().trim();
												}
												if(typeof string != 'undefined') {
													if(string == null) string = '';
													if(__type == 'date' || __type == 'daterange') {
														var stringFormat = __format == 'date' ? '' : 'h:m';
														string  = appCustomDate(string, stringFormat);
													} else if(__type == 'boolean') {
														__prefix = "";
														__suffix = "";
														if(string == '0' || string == false || string == 'f') {
															string  = '<span class="badge badge-icon rounded-pill bg-danger" data-appinity-tooltip="top" aria-label="Tidak"><i class="fa-times"></i></span>';
														} else {
															string  = '<span class="badge badge-icon rounded-pill bg-success" data-appinity-tooltip="top" aria-label="Ya"><i class="fa-check"></i></span>';
														}
													} else if(__type == 'marker') {
														__prefix = "";
														__suffix = "";
														string = '<div class="mx-auto map-marker map-marker-'+string+'" style="background-color: '+subString+'"><i class="'+thumbnail+'"></i></div>';
														subString = '';
													} else if(__type == 'image') {
														var __defaultImage    = typeof $(this).attr('data-default') != 'undefined' && $(this).attr('data-default').toLowerCase() == 'false' ? false : true;
														__prefix = "";
														__suffix = "";
														var imgShow = '';
														var imgPopup = '';
														if(typeof r.default_image != 'undefined') {
															imgShow = r.default_image;
															imgPopup = r.default_image;
														}
														
														if(typeof r.paths != 'undefined' && typeof r.paths[__content[0]] != 'undefined') {
															if(string != '') {
																imgShow  = r.paths[__content[0]] + string;
																imgPopup = r.paths[__content[0]] + string;
																if(typeof r.paths[__content[0] + '_popup'] != 'undefined') {
																	imgPopup = r.paths[__content[0] + '_popup'] + string;
																}
															}
															if(!__cache) {
																imgShow += '?v=' + rand() + rand() + rand();
																imgPopup += '?v=' + rand() + rand() + rand();
															}
														}
														var __link = '';
														if(__img_link != null && string) {
															__link += '<div class="mt-2">';
															if(__img_link.indexOf('/') !== -1) {
																__link += '<a href="'+__img_link+'/'+encodeId(v[primaryField])+'" target="_blank">'+__img_link_title+'</a>';
															} else {
																__link += '<a href="javascript:;" class="'+__img_link+'" data-val="'+v[primaryField]+'">'+__img_link_title+'</a>';
															}
															__link += '</div>';
														}
														if(__img_popup && string) {
															string = '<a href="'+ imgPopup +'" data-lightbox="appinityTable-set"><img src="'+ imgShow +'" class="img-thumbnail" alt="'+string+'"></a>';
														} else {
															if(__defaultImage) {
																string = '<img src="'+ imgShow +'" class="img-thumbnail" alt="'+string+'">';
															} else string = '';
														}
														string += __link;
													} else if(__type == 'progress') {
														__prefix = "";
														__suffix = "";

														var progressPercent = parseInt(string);
														if(isNaN(progressPercent)) progressPercent = 0;
														var progressType = typeof $(this).attr('data-variant') !== 'undefined' ? $(this).attr('data-variant') : 'primary';
														var progressStriped = $(this).attr('data-striped') == 'true' ? ' progress-bar-striped ' : '';
														var progressModel = $(this).attr('data-progress-type') == 'circular' ? 'circular' : 'bar';
														if(progressModel == 'circular') {
															string = `<svg viewBox="0 0 36 36" class="circular-chart">
															<path class="circle-bg"
															  d="M18 2.0845
																a 15.9155 15.9155 0 0 1 0 31.831
																a 15.9155 15.9155 0 0 1 0 -31.831"
															/>
															<path class="circle"
															  stroke-dasharray="${progressPercent}, 100"
															  d="M18 2.0845
																a 15.9155 15.9155 0 0 1 0 31.831
																a 15.9155 15.9155 0 0 1 0 -31.831"
															/>
															<text x="18" y="20.35" class="percentage">${progressPercent}%</text>
														  </svg>`;
														} else {
															string = '<div class="progress"><div class="progress-bar'+progressStriped+' bg-'+progressType+'" role="progressbar" style="width: '+progressPercent+'%" aria-valuenow="'+progressPercent+'" aria-valuemin="0" aria-valuemax="100">'+progressPercent+'%</div></div>';
														}
													} else if(__type == 'download') {
														__prefix = "";
														__suffix = "";
														if(typeof r.paths != 'undefined' && typeof r.paths[__content[0]] != 'undefined') {
															if(string != '') {
																string  = '<a href="' + r.paths[__content[0]] + string + '" target="_blank">'+string+'</a>';
															}
														}
													} else if(__type == 'color') {
														__prefix = "";
														__suffix = "";
														if(string != '') {
															string  = '<span class="me-1 badge" style="color: '+string+'; background: '+string+'">&nbsp;</span> ' + string;
														}
													} else if(__type == 'link') {
														__prefix = "";
														__suffix = "";
														if(string != '') {
															string  = '<a href="' + string + '" target="_blank">'+string+'</a>';
														}
													} else if(__type == 'tags') {
														__prefix = "";
														__suffix = "";
														var splitString = string.split(",");
														string = "";
														$.each(splitString,function(dtag,vtag){
															var xVal = vtag;
															if(__filter && __filter != 'false' && $('select[data-filter-id="'+__filter+'"]').length > 0) {
																if($('select[data-filter-id="'+__filter+'"]').find('[value="'+vtag+'"]').length > 0) {
																	xVal = $('select[data-filter-id="'+__filter+'"]').find('[value="'+vtag+'"]').text();
																}
															}
															string += '<span class="badge bg-app">'+xVal+'</span>';
														});
													} else if(__type == 'list') {
														__prefix = "";
														__suffix = "";
														var splitString = string.split(",");
														string = "<ul>";
														$.each(splitString,function(dtag,vtag){
															string += '<li>'+vtag+'</li>';
														});
														string += '</ul>';
													} else if(__filter && __filter != 'false' && $('select[data-filter-id="'+__filter+'"]').length > 0) {
														string  = $('select[data-filter-id="'+__filter+'"]').find('[value="'+string+'"]').html();
														if(typeof string == 'undefined') {
															var dtVal = '';
															$('select[data-filter-id="'+__filter+'"]').find('option').each(function(){
																var liVal = $(this).attr('value');
																if(liVal != undefined) {
																	var xLiVal = liVal.split(',');
																	$.each(xLiVal,function(k,v){
																		var testVal = v.replace('[','').replace(']','');
																		if(testVal == string) dtVal = liVal;
																	});
																} else {
																	string = '';
																}
															});
															if(dtVal && $('select[data-filter-id="'+__filter+'"]').find('option[value="'+dtVal+'"]').length > 0) {
																string = $('select[data-filter-id="'+__filter+'"]').find('option[value="'+dtVal+'"]').html();
															} else {
																string = '';
															}
														}
													} else if(__filter && __filter != 'false' && $('ul[data-filter-id="'+__filter+'"]').length > 0) {
														var selectedList = '';
														if($('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+string+'"]').length > 0) {
															selectedList = $('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+string+'"]').html();
															var rowBg = $('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+string+'"]').attr('data-row-bg');
															if(rowBg !== undefined) {
																container.addClass('row-' + rowBg);
															}
														} else {
															var dtVal = '';
															$('ul[data-filter-id="'+__filter+'"]').find('li').each(function(){
																var liVal = $(this).attr('data-value');
																if(liVal != undefined) {
																	var xLiVal = liVal.split(',');
																	$.each(xLiVal,function(k,v){
																		var testVal = v.replace('[','').replace(']','');
																		if(testVal == string) dtVal = liVal;
																	});
																}
															});
															if(dtVal && $('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+dtVal+'"]').length > 0) {
																selectedList = $('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+dtVal+'"]').html();
																var rowBg = $('ul[data-filter-id="'+__filter+'"]').find('li[data-value="'+dtVal+'"]').attr('data-row-bg');
																if(rowBg !== undefined) {
																	container.addClass('row-' + rowBg);
																}
															}
														}
														string  = selectedList;
														if(typeof string == 'undefined') string = '';
													} else {
														if(__type == 'currency') {
															var decimal = 0;
															var xDec = parseFloat(string).toString().split('.');
															if(xDec[1] != undefined) {
																decimal = xDec[1].length;
															} else {
																decimal = 0;
															}
															var dec = $(this).attr('data-decimal');
															if(dec != undefined && !isNaN(parseInt(dec))) {
																decimal = parseInt(dec);
															}
															string  = appNumberFormat(string,decimal,',','.');
														}
														if(str_search && settings.filterHighlight) {
															var regex   = new RegExp("(" + str_search + ")", "gi");
															string      = string.replace(regex,"<span class=\"appinityTable-highlight\">$1</span>");
														}
													}
													if(subString) {
														__prefix = "";
														__suffix = "";
														string += '<div class="appinityTable-sub-content">'+subString+'</div>';
													}
													if(typeof $(this).attr('data-thumbnail') != 'undefined') {
														__prefix = "";
														__suffix = "";
														if(typeof r.paths != 'undefined' && typeof r.paths[__thumbnail[0]] != 'undefined') {
															if(thumbnail == '') thumbnail = 'default.png'
															string =    '<div class="d-flex">' +
																			'<div class="appinityTable-thumbnail-container">' +
																				'<img src="'+r.paths[__thumbnail[0]] + thumbnail +'" class="img-thumbnail" alt="'+thumbnail+'">' +
																			'</div>' +
																			'<div class="w-100">'+string+'</div>' +
																		'</div>';
														}
													}
													if(string && (__prefix || __suffix)) {
														string = __prefix+string+__suffix;
													}
													container.append('<td'+__width+' class="'+__class+'">'+string+'</td>');
												} else if(!__content[0]) {
													container.append('<td'+__width+' class="'+__class+'">&nbsp;</td>');
												} else if(__content[0] == '{sequence}') {
													var seq = parseInt(limitSection.val()) * indexPage + k + 1;
													if($(this).closest('thead').children().last().children().eq($(this).index()).find('input[type="checkbox"]').length > 0) {
														seq = '<div class="form-check ps-0 mb-0 d-inline-block"><input type="checkbox" class="form-check-input ms-0 mt-0 cb-child" value="'+v[r.primary_field]+'"></div>'
													}
													container.append('<td'+__width+' class="'+__class+'">'+seq+'</td>');
												} else if(__content[0].indexOf('@') != -1 && __content[0].indexOf(':') != -1) {
													var filterAttr      = '';
													var filterContent   = __content[0].replace('filter@','').split(':');
													if(filterContent.length == 2) {
														var filterRef = appTable.find('[data-content="'+filterContent[0]+'"][data-filter]');
														if(filterRef.length > 0 && typeof v[filterContent[0]] != 'undefined') {
															var filterID    = $('select[data-filter-id="'+filterRef.attr('data-filter')+'"]');
															if(filterID.length > 0 && filterID.find('option[value="'+v[filterContent[0]]+'"]').length > 0) {
																var findRef = filterID.find('option[value="'+v[filterContent[0]]+'"]').attr('data-' + filterContent[1]);
																if(typeof findRef != 'undefined') filterAttr = findRef;
															}
														}
													}
													container.append('<td'+__width+' class="'+__class+'">'+filterAttr+'</td>');
												} else if(__content[0] == 'button') {
													var buttonContent   = '<div class="appinityTable-action">';
													if(typeof v.buttons == 'object') {
														var totalButton = 0;
														$.each(v.buttons, function(kButton, vButton) {
															if(vButton.active) totalButton++;
														});
														if(r.edit) totalButton++;
														if(r.delete) totalButton++;
														if(totalButton > 4) {
															buttonContent   += '<div class="btn-group" role="group">';
															buttonContent   += '<button type="button" class="btn btn-theme dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-ellipsis-h"></i></button>';
															buttonContent   += '<ul class="dropdown-menu dropdown-menu-end">';
														}
														$.each(v.buttons,function(kBtn,vBtn){
															if(vBtn.active) {
																var label       = vBtn.label;
																var onclick     = '';
																var title       = '';
																var refLink     = vBtn.link.replace('blank::','');
																var refTarget   = vBtn.link.indexOf("blank::") != -1 ? ' target="_blank"' : '';
																if(vBtn.onclick != '') {
																	onclick     = ' onclick="'+vBtn.onclick+'"';
																}
																if(totalButton > 4) {
																	var lblButton = '<i class="fa-none"></i>' + label;
																	if(vBtn.title != '') {
																		lblButton = '<i class="'+vBtn.label+'"></i>' + vBtn.title;
																	}
																	buttonContent   += '<li><a href="'+refLink+'"'+refTarget+' class="dropdown-item dropdown-item-icon '+vBtn.class+'" data-key="'+r.primary_field+'"  data-val="'+v[r.primary_field]+'" app-link="'+app_link+'" data-action="'+actionTarget+'" data-context-key="button'+kBtn+'"'+onclick+title+'>'+lblButton+'</a></li>';
																} else {
																	if(vBtn.title != '') {
																		label       = '<i class="'+vBtn.label+'"></i>';
																		title       = ' data-appinity-tooltip="top" aria-label="'+vBtn.title+'"';
																	}
																	buttonContent   += '<a href="'+refLink+'"'+refTarget+' class="'+vBtn.class+'" data-key="'+r.primary_field+'"  data-val="'+v[r.primary_field]+'" app-link="'+app_link+'" data-action="'+actionTarget+'" data-context-key="button'+kBtn+'"'+onclick+title+'>'+label+'</a>';
																}
																contextItems['button'+kBtn] = {
																	name : vBtn.title != '' ? vBtn.title : vBtn.label,
																	icon : vBtn.title != '' ? vBtn.label : null
																}
															}
														});
														if(totalButton > 4) {
															buttonContent   += '</ul></div>';
														}
													}
                                                    
													if(r.edit) {
														buttonContent   += '<button class="btn btn-warning btn-input" data-key="'+r.primary_field+'"  data-val="'+v[r.primary_field]+'" app-link="'+app_link+'" data-action="'+actionTarget+'" data-appinity-tooltip="top" data-context-key="edit" aria-label="Edit"><i class="appinityTable-action-icon fa-edit"></i></button>';
														contextItems['edit']    = {
															name : 'Edit',
															icon : 'fa-edit'
														}
													}
													if(r.delete) {
														buttonContent   += '<button class="btn btn-danger btn-delete" data-key="'+r.primary_field+'"  data-val="'+v[r.primary_field]+'" app-link="'+app_link+'" data-action="'+actionTarget+'" data-appinity-tooltip="top" data-context-key="delete" aria-label="Hapus"><i class="appinityTable-action-icon fa-trash-alt"></i></button>';
														contextItems['delete']  = {
															name : 'Hapus',
															icon : 'fa-trash-alt'
														}
													}
													buttonContent       += '</div>';
													container.append('<td'+__width+' class="'+__class+'">'+buttonContent+'</td>');
												}
											}
                                        });
                                    });
                                }
                            });

                            $('[app-link="'+app_link+'"][app-appinity-data]').each(function(){
                                var reqData = $(this).attr('app-appinity-data');
                                if(reqData && typeof r[reqData] != 'undefined') {
                                    $(this).text(r[reqData]);
                                }
                            });

                        }
                    }
                    rowContextMenu(contextItems);
                    if(typeof elPos == 'object') {
                        scrTop = elPos.top;
                        scrLeft = elPos.left;
                    }
                    reFixCell(_this);
                    if(!firstLoad) {
                        setInterval(reFixCell(_this),300);
                        firstLoad = true;
                    }
                },
                complete : function(xhr, stat){
                    if(xhr.responseJSON !== undefined) {
                        var res = xhr.responseJSON;
                        if(typeof res.__badge === 'object') {
							$('.badge.badge-danger.bg-danger').remove();
                            $.each(res.__badge, function(kb, vb){
                                if(parseInt(vb) > 0) {
                                    $('a[href="'+baseURL(kb)+'"]').append('<span class="badge badge-danger bg-danger">'+vb+'</span>');
                                    $('a[data-link="'+baseURL(kb)+'"]').append('<span class="badge badge-danger bg-danger">'+vb+'</span>');
                                }
                            });
                        }
                    }
                    if(triggerAction !== undefined) {
                        var actionTrigger = window[triggerAction];
                        if(typeof actionTrigger === "function") {
                            actionTrigger();
                        }
                    }        
                },
                error : function(xhr) {
                    if(xhr.statusText != 'abort') {
                        dataLoaded  = null;
                        appTable.find('.appinityTable-bottom-container').find('tbody').html('');
                        if(infoSection.length > 0) {
                            infoSection.html('<span class="text-danger">Terjadi Kesalahan</span>');
                        } else {
                            cAlert.open('Terjadi Kesalahan', 'error');
                        }
                        reFixCell(_this);
                    }
                },
                beforeSend: function(xhr, settings) {
                    if(ajaxKey) {
                        xhr.setRequestHeader("X-Data-Key", ajaxKey);
                        if(typeof _this.attr('data-ref') != 'undefined') {
                            xhr.setRequestHeader("X-Data-Ref", _this.attr('data-ref'));
                        }
                        if(primaryField != '') {
                            xhr.setRequestHeader("X-Primary-Field", primaryField);
                        }
                    }
                }
            }
            if(ajaxUrl) {
                _xhr    = $.ajax(ajaxConfig);
            }
        }

        function clearAllFilterShowHide() {
            var tContainer = _t.parent().parent();
            if(tContainer.find('.appinityClearFilter.d-block').length > 0) {
                if(tContainer.find('.appinityClearAll').length == 0) {
                    var hTh1 = tContainer.find('.appinityTable-top-container').find('thead').children().first().outerHeight() + 1;
                    var hTh2 = tContainer.find('.appinityTable-top-container').find('thead').children().last().outerHeight();
                    if(tContainer.hasClass('control-bottom')) {
                        tContainer.append('<div class="appinityClearContainer"><div class="appinityClearAll" style="top: '+hTh1+'px; height: '+hTh2+'px;"><div class="position-relative"><i class="fa-filter"></i><div class="position-absolute icon-times f-80">×</div></div></div></div>');
                    } else {
                        tContainer.prepend('<div class="appinityClearContainer"><div class="appinityClearAll" style="top: '+hTh1+'px; height: '+hTh2+'px;"><div class="position-relative"><i class="fa-filter"></i><div class="position-absolute icon-times f-80">×</div></div></div></div>');
                    }

                    tContainer.find('.appinityClearAll').click(function(){
                        tContainer.find('.appinityClearFilter.d-block').each(function(){
                            $(this).trigger('click');
                        })
                    });
                }
            } else {
                tContainer.find('.appinityClearContainer').remove();
            }
        }

        this.each(function(){
            var $t      = $(this);
            _this       = $(this);

            // definisi settings dari data
            if( (typeof $t.attr('data-shadow-theme') != 'undefined' && $t.attr('data-shadow-theme').toLowerCase() == 'true') || $t.parent().hasClass('panel-content') ) {
                settings.shadowTheme = true;
            }
            if(typeof $t.attr('data-control-placement') != 'undefined' && $t.attr('data-control-placement').toLowerCase() == 'top') {
                settings.controlPlacement = 'top';
            }
            if(typeof $t.attr('data-type') != 'undefined') {
                settings.dataType = $t.attr('data-type');
            }
            if(typeof $t.attr('data-border') != 'undefined' && $t.attr('data-border').toLowerCase() == 'false') {
                settings.border = false;
            }
            if(typeof $t.attr('data-freeze') != 'undefined' && $t.attr('data-freeze').toLowerCase() == 'false') {
                settings.freeze = false;
            }
            if(typeof $t.attr('data-freeze-col') != 'undefined' && $t.attr('data-freeze-col').toLowerCase() == 'false') {
                settings.freezeCol = false;
            }
            if(typeof $t.attr('data-freeze-row') != 'undefined' && $t.attr('data-freeze-row').toLowerCase() == 'false') {
                settings.freezeRow = false;
            }
            if(typeof $t.attr('data-range') != 'undefined') {
                var xRange = [];
                var sRange = $t.attr('data-range').split(',');
                $.each(sRange,function(ksr,vsr){
                    var _vsr = parseInt(vsr.trim());
                    if(!isNaN(_vsr)) {
                        xRange.push(_vsr);
                    }
                });
                if(xRange.length > 0) {
                    settings.range = xRange;
                }
            }
            if(typeof $t.attr('data-source') != 'undefined' && $t.attr('data-source').trim() != '') {
                ajaxUrl         = $t.attr('data-source');
            }
            if(typeof $t.attr('data-key') != 'undefined' && $t.attr('data-key').trim() != '') {
                ajaxKey         = $t.attr('data-key');
            }

            if(settings.dataType != 'json') {
                settings.freezeCol = false;
                settings.freezeRow = false;
            }

            var $tClass = $(this).attr('class');
            var $tStyle = $(this).attr('style');
            if(typeof $tStyle == 'undefined') $tStyle   = 'height: 350px';

            var $border = settings.border ? ' bordered' : '';
            if(settings.shadowTheme) {
                $border += ' shadow-theme';
            }

            var appinityTableID = "appinityTable-" + rand() + rand() + rand();

            if($t.find('[data-content="button"]').length > 0 && $('body[data-action-pos="left"]').length == 1) {
                var buttonParent    = $t.find('[data-content="button"]').parent();
                var buttonIndex     = buttonParent.find('[data-content="button"]').index();
                $t.find('tr').each(function(){
                    var buttonHTML  = $(this).children().eq(buttonIndex)[0].outerHTML;
                    $(this).children().eq(buttonIndex).remove();
                    $(this).prepend(buttonHTML);
                });
            }

            $t.addClass('d-none');
            $t.wrap('<div class="appinityTable control-'+settings.controlPlacement+'" id="'+appinityTableID+'" style="'+$tStyle+'"></div>');
            $t.wrap('<div class="appinityTable-container'+$border+'"></div>');
            $t.parent().append('<div class="appinityTable-left-container"></div>');
            $t.parent().append('<div class="appinityTable-right-container"></div>');

            var leftContainer           = $t.siblings('.appinityTable-left-container');
            var rightContainer          = $t.siblings('.appinityTable-right-container');

            leftContainer.append('<div class="appinityTable-top-container"></div><div class="appinityTable-bottom-container"></div>');
            rightContainer.append('<div class="appinityTable-top-container"></div><div class="appinityTable-bottom-container"></div>');

            var leftTopContainer        = leftContainer.children('.appinityTable-top-container');
            var leftBottomContainer     = leftContainer.children('.appinityTable-bottom-container');
            var rightTopContainer       = rightContainer.children('.appinityTable-top-container');
            var rightBottomContainer    = rightContainer.children('.appinityTable-bottom-container');

            if(settings.freeze && $t.children('thead').children().length < 3) {
                // right content
                var rightTbody          = $t.find('tbody').html();
                if(typeof rightTbody == 'undefined') {
                    rightTbody          = '';
                }
                rightTopContainer.append('<table class="'+$tClass+'"><thead>'+$t.find('thead').html()+'</thead><tbody></tbody></table>');
                rightBottomContainer.append('<table class="'+$tClass+'"><tbody>'+rightTbody+'</tbody></table>');
            } else {
                var rightSingleContainer = $t.siblings('.appinityTable-right-container').children('.appinityTable-bottom-container');
                rightSingleContainer.append('<table class="'+$tClass+'">'+$t.html()+'</table>');
                if(rightSingleContainer.find('tbody').length == 0) {
                    rightSingleContainer.children('table').append('<tbody></tbody>');
                }
                rightTopContainer   = rightSingleContainer;
            }

            // definisi serverside sort & filter
            if(ajaxKey && ajaxUrl && settings.dataType == 'json') {
                var rightThead          = rightTopContainer.find('thead');
                var _row                = rightThead.children('tr');
                if(rightThead.children('tr').length == 1) {
                    control             = true;
                    rightThead.append('<tr></tr>');

                    _row.children().each(function(){
                        var _col        = $(this);
                        var _sort       = true;
                        var _filter     = 'text';
                        var _class      = '';
						var _style		= '';
						if(_col.attr('data-background')) {
							_col.css('background',_col.attr('data-background'));
							_style += 'background : ' + _col.attr('data-background') + ';';
						}
						if(_col.attr('data-color')) {
							_col.css('color',_col.attr('data-color'));
							_style += 'color : ' + _col.attr('data-color') + ';';
						}
                        if(_col.attr('data-content')) {
							if($('[data-content-id="'+_col.attr('data-content')+'"]').length == 1) {
								_sort = false;
								_filter = false;
							}
                            if(typeof _col.attr('class') != 'undefined') {
                                _class  = _col.attr('class');
                            }
                            if(typeof _col.attr('data-sort') != 'undefined' && _col.attr('data-sort') == 'false') {
                                _sort   = false;
                            }
                            if(typeof _col.attr('data-type') != 'undefined') {
                                var _type   = _col.attr('data-type');
                                if(_type == 'date') {
                                    _filter = 'date';
                                } else if(_type == 'daterange') {
                                    _filter = 'daterange';
                                } else if(_type == 'currency') {
                                    _filter = 'currency';
                                } else if(_type == 'boolean') {
                                    _filter = 'boolean';
                                } else if(_type == 'image' || _type == 'progress' || _type == 'marker' || (_type == 'tags' && typeof _col.attr('data-filter') != 'undefined') ) {
                                    _filter = '';
                                    _sort   = false;
                                }
                            }
                            if(typeof _col.attr('data-filter') != 'undefined' && _type != 'tags') {
                                var attrFilter  = _col.attr('data-filter');
                                if( attrFilter == 'false') {
                                    _filter = '';
                                } else if($('select[data-filter-id="'+attrFilter+'"]').length > 0) {
                                    _filter = 'select';
                                } else if($('ul[data-filter-id="'+attrFilter+'"]').length > 0) {
                                    _filter = 'select-list';
                                }
                            }

                            if(_col.attr('data-sort') == 'false') {
                                _sort   = false;
                            }

                            if( _col.attr('data-content') == 'button' || 
                                _col.attr('data-content') == '{sequence}' ||
                                (_col.attr('data-content').indexOf('@') != -1 && _col.attr('data-content').indexOf(':') != -1 && _col.attr('data-content').indexOf('::') == -1)
                            ) {
                                _sort       = false;
                                _filter     = '';
                            }

                            // menginclude fitur sort
                            if(_sort) {
                                _col.html('<div data-appinitysort="">'+_col.html()+'</div>');
                            } else {
                                _col.html('<div data-appinitysortdisable="">'+_col.html()+'</div>');
                            }

                            // menginclude fitur filter
                            if(inArray(_filter,['text','date','daterange','currency'])) {
                                var _range  = '';
                                if(_filter == 'daterange' && typeof _col.attr('data-range') != 'undefined') {
                                    _range  = ' data-range="' + _col.attr('data-range') + '"';
                                } else if(_filter == 'currency' && _col.attr('data-decimal') != undefined) {
                                    _range = ' data-decimal="' + _col.attr('data-decimal') + '"';
                                }
                                rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'"><div class="appinityInputContainer"><input type="text" class="form-control" data-filterType="'+_filter+'"'+_range+' /><span class="appinityClearFilter">×</span></div></th>');
                            } else if(_filter == 'select') {
                                rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'"><div class="appinityInputContainer"><select class="form-select" data-filterType="'+_filter+'">'+$('select[data-filter-id="'+attrFilter+'"]').html()+'</select><span class="appinityClearFilter">×</span></div></th>');
                            } else if(_filter == 'select-list') {
                                var optList = '';
                                $('ul[data-filter-id="'+attrFilter+'"] li').each(function(){
                                    var optVal      = $(this).attr('data-value') == undefined ? '' : $(this).attr('data-value');
                                    var optLabel    = $(this).text();
                                    var optSelected = $(this).attr('data-selected') == undefined ? '' : ' selected';
                                    optList += '<option value="'+optVal+'"'+optSelected+'>'+optLabel+'</option>';
                                });
                                rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'"><div class="appinityInputContainer"><select class="form-select" data-filterType="'+_filter+'">'+optList+'</select><span class="appinityClearFilter">×</span></div></th>');
                            } else if(_filter == 'boolean') {
                                rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'"><div class="appinityInputContainer"><select class="form-select" data-filterType="'+_filter+'"><option value=""></option><option value="1">'+lang.ya+'</option><option value="0">Tidak</option></select><span class="appinityClearFilter">×</span></div></th>');
                            } else {
                                rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'">&nbsp;</th>');
                            }
                            if(_col.attr('data-filter-default') != undefined && _col.attr('data-filter-default') != null) {
                                rightThead.children().last().children().eq(_col.index()).find(':input').val(_col.attr('data-filter-default'));
                            }
                        } else {
                            rightThead.children().last().append('<th class="'+_class+'" style="'+_style+'">&nbsp;</th>');
                        }
                    });

                    $('.appinityInputContainer select').each(function(){
                        $(this).attr('data-default-value',$(this).val());
                    });
                }
            } else if(ajaxUrl && typeof $t.attr('data-control') != 'undefined' && $t.attr('data-control').toLowerCase() == 'true') {
                control = true;
            }

            if(settings.freeze && $t.children('thead').children().length < 3) {
                if(control && typeof $t.attr('data-action-select') != 'undefined' && $('[data-action-id="'+$t.attr('data-action-select')+'"]').length > 0  && $('[data-action-id="'+$t.attr('data-action-select')+'"]').html().trim() != '') {
                    var cbFreeze = '';
                    if(rightTopContainer.find('thead').children('tr').first().children('[data-freeze="true"]').length > 0) {
                        var cbFreeze = ' data-freeze="true"';
                    }
                    if(rightTopContainer.find('thead').children().length == 1) {
                        rightTopContainer.find('thead').children().prepend('<th'+cbFreeze+' width="50" class="text-center" data-content="{sequence}"><div class="form-check ps-0 mb-0 d-inline-block"><input type="checkbox" class="form-check-input ms-0 mt-0 cb-all"></div></th>');
                    } else {
                        rightTopContainer.find('thead').children().first().prepend('<th'+cbFreeze+' width="50" class="text-center" data-content="{sequence}">&nbsp;</th>');
                        rightTopContainer.find('thead').children().last().prepend('<th class="text-center"><div class="form-check ps-0 mb-0 d-inline-block"><input type="checkbox" class="form-check-input ms-0 mt-0 cb-all"></div></th>');
                    }
                }
                fixTableCellWidth(rightTopContainer.find('table')[0], rightBottomContainer.find('table')[0]);

                // left content
                leftTopContainer.append('<table class="'+$tClass+'"></table>');
                leftBottomContainer.append('<table class="'+$tClass+'"></table>');
                
                // cari header yang mempunyai atribut data-freeze="true"
                if(rightTopContainer.find('thead').children('tr').first().children('[data-freeze="true"]').length > 0 && settings.dataType == 'json') {
                    leftTopContainer.find('table').append('<thead></thead><tbody></tbody>');
                    leftBottomContainer.find('table').append('<tbody></tbody>');

                    rightTopContainer.find('thead').children('tr').first().children('[data-freeze="true"]').each(function(k,v){
                        var index   = $(this).index();
                        var indexTD = index;

                        for(var i = 0; i < index; i++) {
                            var thBefore    = rightTopContainer.find('thead').children('tr').first().children().eq(i);
                            var colspan     = thBefore.attr('colspan');
                            if(typeof colspan != 'undefined') {
                                indexTD += (parseInt(thBefore.attr('colspan')) - 1);
                            }
                        }

                        // generate tag <tr></tr> pada left container (top & bottom)
                        if(k == 0) {
                            for(var z = 0; z < rightTopContainer.find('thead').children().length; z++) {
                                leftTopContainer.find('thead').append('<tr></tr>');
                            }
                            rightBottomContainer.find('tbody').children('tr').each(function(){
                                leftBottomContainer.find('tbody').append('<tr></tr>');
                            });
                        }

                        if(typeof $(this).attr('colspan') == 'undefined') {
                            $(this).css({
                                'min-width':'',
                                width:''
                            }).removeAttr('data-freeze');
                            leftTopContainer.find('thead').children('tr').first().append(this.outerHTML);                            

                            if(typeof $(this).attr('rowspan') == 'undefined') {
                                $(this).closest('thead').children('tr').each(function(x,y){
                                    if(x > 0) {
                                        var indexTR = $(this).index();
                                        var content = $(this).children().eq(index);
                                        content.css({
                                            'min-width':'',
                                            width:''
                                        });

                                        leftTopContainer.find('thead').children('tr').eq(indexTR).append(content[0].outerHTML);
                                        content.remove();
                                    }
                                });
                            }
                            $(this).remove();

                            rightBottomContainer.find('tbody').children('tr').each(function(){
                                var indexTR = $(this).index();
                                var content = $(this).children().eq(indexTD);
                                content.css({
                                    'min-width':'',
                                    width:''
                                });

                                leftBottomContainer.find('tbody').children('tr').eq(indexTR).append(content[0].outerHTML);
                                content.remove();
                            });
                        } else {
                            $(this).removeAttr('data-freeze');
                        }
                    });
                    fixTableCellWidth(leftTopContainer.find('table')[0], leftBottomContainer.find('table')[0]);
                }
                setTimeout(function(){
                    leftBottomContainer.scrollTop(scrTop);
                    rightTopContainer.scrollLeft(scrLeft);
                    rightBottomContainer.scrollTop(scrTop);
                    rightBottomContainer.scrollLeft(scrLeft);
                },100);

                setTimeout(function(){
                    reFixCell($t);

                    //fix di edge / chrome
                    setTimeout(function(){
                        reFixCell($t);
                    },50);
                },50);
                scrollEvent($t);
            }

            // row per page, pagination, info jumlah data (untuk serverside only)
            if(control) {
                $t.closest('.appinityTable').prepend('<div class="appinityTable-control"></div>');
                var _control    = $t.closest('.appinityTable').children('.appinityTable-control');
                _control.append('<div class="appinityTable-control-left"><span class="appinityTable-label">Baris per Halaman</span><select class="form-select" data-width="resolve" data-limit></select><div class="appinityTable-info-data">Tidak ada data</div></div>');
                $.each(settings.range,function(re,ve){
                    _control.find('[data-limit]').append('<option value="'+ve+'">'+ve+'</option>');
                });

                _control.append( 
                    '<div class="appinityTable-control-right">' +
                        '<button class="btn" data-page-button="prev" data-appinity-tooltip="top" aria-label="Halaman Sebelumnya">&lsaquo;</button>' +
                        '<div class="input-group appinityTable-page-input">' +
                            '<input type="number" class="form-control" data-page value="0" />' +
                            '<div class="input-group-text">/ <span data-page-total>0</span></div>' +
                        '</div>' +
                        '<button class="btn" data-page-button="next" data-appinity-tooltip="top" aria-label="Halaman Selanjutnya">&rsaquo;</button>' +
                    '</div>'
                );

                // menambahkan action select jika ada
                if(typeof $t.attr('data-action-select') != 'undefined' && $('[data-action-id="'+$t.attr('data-action-select')+'"]').length > 0 && $('[data-action-id="'+$t.attr('data-action-select')+'"]').html().trim() != '') {
                    _control.append('<div class="appinityTable-control-action">'+$('[data-action-id="'+$t.attr('data-action-select')+'"]').html()+'</div>');
                }


                _control.find('[data-page]').on('focus click',function(){
                    $(this).select();
                });
                _control.find('[data-page]').keydown(function(e){
                    var key = e.charCode || e.keyCode || 0;
                    return (
                        key == 8 || 
                        key == 9 ||
                        key == 13 ||
                        key == 46 ||
                        (key >= 35 && key <= 40) ||
                        (key >= 48 && key <= 57) ||
                        (key >= 96 && key <= 105));
                });
                _control.find('[data-page]').keyup(function(){
                    var maxPage = parseInt($(this).parent().find('[data-page-total]').text());
                    var curPage = parseInt($(this).val());
                    if(isNaN(maxPage)) maxPage = 0;
                    if(isNaN(curPage)) curPage = 0;

                    if(maxPage == 0)            $(this).val(0);
                    else if(curPage > maxPage)  $(this).val(maxPage);
                    else if(curPage == 0)       $(this).val(1);
                    getData();
                });
                _control.find('[data-page-button]').click(function(){
                    var buttonType  = $(this).attr('data-page-button');
                    var curPage     = parseInt($(this).parent().find('[data-page]').val());

                    if(buttonType == 'next') curPage++;
                    else curPage--;
                    $(this).parent().find('[data-page]').val(curPage).trigger('keyup');
                });
                _control.find('[data-limit]').change(function(){
                    getData();
                });

                _control.find('.appinityTable-control-action').on('click','button, a',function(){
                    var app_link        = '';
                    if(typeof $t.attr('app-link') != 'undefined') {
                        app_link        = $t.attr('app-link');
                    }
                    var act = window[$(this).attr('data-action')];
                    if(typeof act == 'function') {
                        var __val   = [];
                        var __key   = '';
                        $t.parent().find('.cb-child:checked').each(function(){
                            __key   = $(this).closest('tr').attr('data-key');
                            __val.push($(this).val());
                        });
                        var __return    = {};
                        __return[__key] = __val;
                        act(__return, app_link);
                    }
                });

                var posInterval = null;
                $t.parent().on('focus','thead :input',function(){
                    posInterval = setInterval(function(){
                        var headerLeft = rightTopContainer.scrollLeft();
                        rightBottomContainer.scrollLeft(headerLeft);
                    },50);
                });
                $t.parent().on('blur','thead :input',function(){
                    if(posInterval != null) {
                        clearInterval(posInterval);
                        posInterval = null;
                    }
                });

                // filter text / select
                $t.parent().on('focus','thead [data-filterType="text"]',function(){
                    $(this).attr('data-last-value','');
                });
                $t.parent().on('blur','thead [data-filterType="text"]',function(){
                    $(this).removeAttr('data-last-value');
                });
                $t.parent().on('keyup change','thead [data-filterType="text"]',function(){
                    if($(this).val() != '') {
                        $(this).siblings('span').addClass('d-block');
                    } else {
                        $(this).siblings('span').removeClass('d-block');
                    }
                    clearAllFilterShowHide();
                    if($(this).val() != $(this).attr('data-last-value')) {
                        getData();
                        $(this).attr('data-last-value',$(this).val());
                    }
                });
                $t.parent().on('change','thead select',function(){
                    if($(this).val() != $(this).attr('data-default-value')) {
                        $(this).siblings('span').addClass('d-block');
                    } else {
                        $(this).siblings('span').removeClass('d-block');
                    }
                    clearAllFilterShowHide();
                    getData();
                });
                $t.parent().on('click','thead .appinityClearFilter',function(){
                    var dtDefault = '';
                    if($(this).attr('data-default-value') != undefined) {
                        dtDefault = $(this).attr('data-default-value');
                    }
                    $(this).siblings(':input').val(dtDefault).trigger('change');
                });

                if(typeof $t.attr('data-form-filter') != 'undefined' && $('#' + $t.attr('data-form-filter')).length > 0) {
                    $('#' + $t.attr('data-form-filter')).on('change keyup','input[type="text"], textarea',function(){
                        getData();
                    });
                    $('#' + $t.attr('data-form-filter')).on('change','select',function(){
                        getData();
                    });
                }

                $t.parent().on('click','.cb-all',function(){
                    var el  = $(this).closest('table').parent().parent();
                    if(!$(this).is(':checked')) {
                        el.find('.cb-child').prop('checked',true);
                        el.find('.cb-child').trigger('click');
                    } else {
                        el.find('.cb-child').prop('checked',false);
                        el.find('.cb-child').trigger('click');
                    }
                });

                $t.parent().on('click','.cb-child',function(){
                    var el  = $(this).closest('table').parent().parent();
                    var elCount = el.find('.cb-child').length;
                    var ckCount = el.find('.cb-child:checked').length;
                    if(ckCount == 0) {
                        el.find('.cb-all').prop('checked',false);
                        el.find('.cb-all').prop('indeterminate',false);
                        $(this).closest('.appinityTable').find('.appinityTable-control').removeClass('action-mode');
                    } else if(ckCount == elCount) {
                        el.find('.cb-all').prop('checked',true);
                        el.find('.cb-all').prop('indeterminate',false);
                        $(this).closest('.appinityTable').find('.appinityTable-control').addClass('action-mode');
                    } else {
                        el.find('.cb-all').prop('checked',false);
                        el.find('.cb-all').prop('indeterminate',true);
                        $(this).closest('.appinityTable').find('.appinityTable-control').addClass('action-mode');
                    }

                    var elTR        = $(this).closest('tr').index();
                    var elContainer = $(this).closest('table').parent().attr('class');
                    var elContent   = $(this).closest('.appinityTable').find('.' + elContainer);
                    if($(this).is(':checked')) {
                        elContent.each(function(){
                            $(this).find('tbody').children().eq(elTR).addClass('is-checked');
                        });
                    } else {
                        elContent.each(function(){
                            $(this).find('tbody').children().eq(elTR).removeClass('is-checked');
                        });
                    }
                });
            }

            var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if(!isMobile) {
                $(window).resize(function(){
                    reFixCell($t);

                    //fix di edge / chrome
                    setTimeout(function(){
                        reFixCell($t);
                    },50);
                });

                // handle resize dari element
                setInterval(function(){
                    if(curWidth != parseInt($t.parent().outerWidth())) {
                        curWidth    = parseInt($t.parent().outerWidth());
                        reFixCell($t);

                        //fix di edge / chrome
                        setTimeout(function(){
                            reFixCell($t);
                        },50);    
                    }
                },200);
            }
            
            $t.parent().on('mouseenter touchstart','tbody tr',function(e){
                var i               = $(this).index();
                var clsContainer    = $(this).closest('table').parent().attr('class');
                $(this).closest('.appinityTable-container').find('.' + clsContainer).each(function(){
                    $(this).find('tbody').children('tr').removeClass('hover');
                    $(this).find('tbody').children('tr').eq(i).addClass('hover');
                });
            });

            $t.parent().on('mouseleave touchend','tbody tr',function(e){
                var i               = $(this).index();
                var clsContainer    = $(this).closest('table').parent().attr('class');
                $(this).closest('.appinityTable-container').find('.' + clsContainer).each(function(){
                    $(this).find('tbody').children('tr').eq(i).removeClass('hover');
                });
            });

            // menjalankan sort
            $t.parent().on('click','[data-appinitysort]',function(){
                var sort    = $(this).attr('data-appinitysort');
                $t.parent().find('[data-appinitysort]').attr('data-appinitysort','');
                if(sort == '') {
                    $(this).attr('data-appinitySort','asc');
                } else if(sort == 'asc') {
                    $(this).attr('data-appinitySort','desc');
                }
                getData();
            });

            $t.find('tbody').find(':input:not([disabled])').attr('data-appinity-disabled',true).attr('disabled',true);

            filterDateInit();
            filterDaterangeInit();
            filterCurrencyInit();
            filterSelect2Init();
            colContextMenu();
            if(ajaxUrl) {
                getData();
            } else {
                var triggerAction       = $t.attr('data-trigger');
                if(triggerAction !== undefined) {
                    var actionTrigger = window[triggerAction];
                    if(typeof actionTrigger === "function") {
                        actionTrigger();
                    }
                }
            }
        });

        return {
            destroy : function() {
                if(_t.parent().hasClass('appinityTable-container') && _t.parent().parent().hasClass('appinityTable') && _t.hasClass('d-none')) {
                    _t.removeClass('d-none').removeClass('table-appinity');
                    _t.siblings().remove();
                    _t.unwrap().unwrap();
                    _t.find('[data-appinity-disabled]').removeAttr('data-appinity-disabled').removeAttr('disabled');
                }
            },
            refreshData : function() {
                var x = _t.siblings('.appinityTable-right-container').find('.appinityTable-bottom-container');
                var topBefore = x.scrollTop();
                var leftBefore = x.scrollLeft();
                getData({
                    top : topBefore,
                    left : leftBefore
                });
            },
            data : function() {
                return dataLoaded;
            }
        }        
    }
}(jQuery));
