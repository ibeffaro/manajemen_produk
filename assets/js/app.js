function heightFull() {
    if($('[data-height=full]').length > 0) {
        $('[data-height=full]').each(function(){
            var parentSpace = parseFloat($(this).closest('.panel-content').css('padding-top')) + parseFloat($(this).closest('.panel-content').css('padding-bottom'));

            if(isNaN(parentSpace)) parentSpace = 0;
            
            $(this).parentsUntil('.panel-content').each(function(){
                parentSpace += parseFloat($(this).css('padding-top'));
                parentSpace += parseFloat($(this).css('padding-bottom'));
                parentSpace += parseFloat($(this).css('border-top-width'));
                parentSpace += parseFloat($(this).css('border-bottom-width'));
            });

            if(typeof $(this).attr('data-height-include') != 'undefined') {
                var inc = $(this).attr('data-height-include').split('|');
                $.each(inc,function(kInc,vInc){
                    if($(vInc.trim()).length > 0) {
                        parentSpace += $(vInc.trim()).outerHeight();
                        parentSpace += parseFloat($(vInc.trim()).css('margin-top'));
                        parentSpace += parseFloat($(vInc.trim()).css('margin-bottom'));
                    }
                });
            }


            if(typeof $(this).attr('data-height-min') != 'undefined') {
                parentSpace += parseFloat($(this).attr('data-height-min'));
            }

            var actionButton = $(this).siblings('.appinityTable-action-button');
            if(actionButton.length >  0) {
                parentSpace += actionButton.outerHeight();
                parentSpace += parseFloat(actionButton.css('margin-top'));
                parentSpace += parseFloat(actionButton.css('margin-bottom'));
            }
            if(isNaN(parentSpace)) parentSpace = 0;

            $(this).css('height','calc(100vh - '+parentSpace+'px - var(--app-height-panel-content))');
            $(this).css('min-height','400px');
        });
    } else if($('[data-height]').length > 0) { 
        $('[data-height]').each(function(){
            var height = $(this).attr('data-height');
            if(isNaN(parseInt(height))) height += 'px';
            $(this).css({
                height : height
            });
        });
    }
}
$(document).ready(function(){
	if(!$('body').hasClass('app-gaya4')) {
		if($('.list-menu li.open').length == 0) {
			$('.list-menu li.have-child').first().children('a').trigger('click');
		} else {
			$('#menu-title').text($('.list-menu li.open').first().children('a').text());
		}
	}

    heightFull();
    $('body').append('<div class="search-input-result"></div>');
    headerActionButton();
});
$(document).on('click','.display-theme',function(e){
    e.preventDefault();
    if(!$(this).hasClass('active')) {
        $('.display-theme').removeClass('active');
        $(this).addClass('active');
        var theme = $(this).attr('data-val');
        $('body').attr('data-theme',theme);
        setCookie('app-theme',theme);
    }
});
$(document).on('click','.display-design',function(e){
    e.preventDefault();
    if(!$(this).hasClass('active')) {
        $('.display-design').removeClass('active');
        $(this).addClass('active');
        var design = $(this).attr('data-val');
        if(design == 'shadow') {
            $('body').addClass('shadow-theme');
            setCookie('app-shadow-theme','shadow');    
        } else {
            $('body').removeClass('shadow-theme');
            setCookie('app-shadow-theme','flat');
        }
    }
});
$('#language-menu a').click(function(){
    if(!$(this).hasClass('active')) {
        setCookie('app-language',$(this).attr('data-value'));
        reload();
    }
});
$('.list-menu').children('ul').children('li').children('a').on('mouseenter focus',function(){
    if($(window).width() > 768 && !$(this).parent().hasClass('open') && typeof $(this).attr('data-id-tooltip') == 'undefined' && !$('body').hasClass('app-gaya4')) {
        var rightPos = $(this)[0].getBoundingClientRect().right  + $(window)['scrollLeft']();
        var topPos   = $(this)[0].getBoundingClientRect().top    + $(window)['scrollTop']() + (($(this).outerHeight() - $(this).height()) / 4);

        var idTooltip = Math.floor(100000 + Math.random() * 900000);
        $(this).attr('data-id-tooltip',idTooltip);
        $('body').append('<div class="app-tooltip" data-id-tooltip="'+idTooltip+'" style="top: '+topPos+'px; left: '+rightPos+'px">'+$(this).text()+'</div>');
    }
});
$('.list-menu').children('ul').children('li').children('a').on('mouseleave blur',function(){
    if($(window).width() > 768 && !$('body').hasClass('app-gaya4')) {
        var idTooltip = $(this).attr('data-id-tooltip');
        $(this).removeAttr('data-id-tooltip');
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').remove();
    }
});
$('.list-menu a').click(function(e){
    e.preventDefault();
    var animSpeed   = 200;
    var elem        = $(this).parent();
    if(typeof $(this).attr('data-id-tooltip') != 'undefined') {
        var idTooltip = $(this).attr('data-id-tooltip');
        $(this).removeAttr('data-id-tooltip');
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').remove();
    }
    if(elem.children('ul').length == 0) {
        window.location = $(this).attr('href');
    } else {
        var isOpen      = elem.hasClass('open');
        var isModule    = elem.parent().parent().hasClass('list-menu');
        if(isModule) {
            if($(window).width() <= 900 && e.originalEvent !== undefined) {
                if(!$('body').hasClass('menu-open')) {
                    $('body').addClass('menu-open');
                    $('body').append('<div class="menu-backdrop"></div>');
                    stopBrowserBack(function(){
                        $('body').removeClass('menu-open');
                        $('.menu-backdrop').remove();
                        startBrowserBack();
                    });
                }
            }
            if(!isOpen) {
                var title = $(this).find('span').text();
                $('#menu-title').text(title);
                if($(window).width() > 768 && !$('body').hasClass('app-gaya4')) {
                    elem.closest('.list-menu').find('li.open').removeClass('open');
                    elem.addClass('open');
                } else {
                    elem.closest('.list-menu').find('li.open').children('ul').slideUp(animSpeed,function(){
                        elem.closest('.list-menu').find('li.open').children('ul').removeAttr('style');
                        elem.closest('.list-menu').find('li.open').removeClass('open').removeClass('hide-child');
                    });
                    elem.find('.open').children('ul').css({
                        display : 'block'
                    });
                    elem.children('ul').slideDown(animSpeed,function(){
                        elem.children('ul').removeAttr('style');
                        elem.find('.open').children('ul').removeAttr('style');
                        elem.addClass('open');
                    });
                }
            } else {
                if($(window).width() <= 768 || $('body').hasClass('app-gaya4')) {
                    if(elem.hasClass('hide-child')) {
                        elem.find('.open').children('ul').css({
                            display : 'block'
                        });
                        elem.children('ul').slideDown(animSpeed,function(){
                            elem.children('ul').removeAttr('style');
                            elem.find('.open').children('ul').removeAttr('style');
                            elem.removeClass('hide-child');
                        });
                    } else {
                        elem.children('ul').slideUp(animSpeed,function(){
                            elem.children('ul').removeAttr('style');
                            elem.addClass('hide-child');
                        });
                    }
                }
            }
        } else {
            if(!isOpen) {
                elem.parent().children('li.open').children('ul').slideUp(animSpeed,function(){
                    elem.parent().children('li.open').children('ul').removeAttr('style');
                    elem.parent().children('li.open').removeClass('open');
                });
                elem.children('ul').slideDown(animSpeed,function(){
                    elem.children('ul').removeAttr('style');
                    elem.addClass('open');
                });
            } else {
                elem.parent().children('li.open').children('ul').slideUp(animSpeed,function(){
                    elem.parent().children('li.open').children('ul').removeAttr('style');
                    elem.parent().children('li.open').removeClass('open');
                });
            }
        }
    }

    // notifikasi
    if($(this).parent().hasClass('list-notification')) {
        if($(this).siblings('ul').html() == '') {
            loadNotification($(this).siblings('ul'));
        }
    }
});
$('.list-menu .list-notification ul').scroll(function(){
    var scrollTop   = Math.round($(this).scrollTop() + $(this).outerHeight());
    var limitScroll = $(this)[0].scrollHeight - 100; // LOAD DATA BARU PAS 100px SEBELUM SCROLL PALING BAWAH
    if(scrollTop >= limitScroll) { 
        loadNotification($(this));
    }
});
$('.toggle-menu').click(function(e){
    e.preventDefault();
    if($(window).width() <= 900) {
        if($('body').hasClass('menu-open')) {
            $('body').removeClass('menu-open');
            $('.menu-backdrop').remove();
            startBrowserBack();
        } else {
            $('body').addClass('menu-open');
            $('body').append('<div class="menu-backdrop"></div>');
            stopBrowserBack(function(){
                $('body').removeClass('menu-open');
                $('.menu-backdrop').remove();
                startBrowserBack();
            });
        }
    } else {
        if($('body').hasClass('min-menu')) {
            $('body').removeClass('min-menu');
            setCookie('app-min-menu','');
        } else {
            $('body').addClass('min-menu');
            setCookie('app-min-menu','min-menu');
        }
        headerActionButton();
    }
});
$('.toggle-right-panel').click(function(){
    if($(window).width() <= 768) {
        if($('body').hasClass('right-panel-mobile-show')) {
            $('body').removeClass('right-panel-mobile-show');
            $('.menu-backdrop').remove();
            startBrowserBack();            
        } else {
            $('body').addClass('right-panel-mobile-show');
            $('body').append('<div class="menu-backdrop"></div>');
            stopBrowserBack(function(){
                $('body').removeClass('right-panel-mobile-show');
                $('.menu-backdrop').remove();
                startBrowserBack();
            });
        }
    } else if($(window).width() <= 1200) {
        if($('body').hasClass('right-panel-mobile-show')) {
            $('body').removeClass('right-panel-mobile-show');
            $('.menu-backdrop').remove();
        } else {
            $('body').addClass('right-panel-mobile-show');
            $('body').append('<div class="menu-backdrop"></div>');
        }
    } else {
        if($('body').hasClass('right-panel-show')) {
            $('body').removeClass('right-panel-show');
        } else {
            $('body').addClass('right-panel-show');
        }
    }
});
$(document).on('click','.menu-backdrop',function(){
    $('body').removeClass('menu-open').removeClass('right-panel-mobile-show');
    $('.menu-backdrop').remove();
    startBrowserBack();
});
$(document).on('click','.password-toggle a',function(){
    var inputToggle = $(this).parent().find('input');
    if(inputToggle.length > 0) {
        if(inputToggle.attr('type') == 'password') {
            inputToggle.attr('type','text').focus();
            $(this).find('i').removeClass('fa-eye');
            $(this).find('i').addClass('fa-eye-slash');
        } else {
            inputToggle.attr('type','password').focus();;
            $(this).find('i').removeClass('fa-eye-slash');
            $(this).find('i').addClass('fa-eye');
        }
    }
});
$(document).on('keypress',function(e){
    if(e.keyCode == 13 && $('.swal-overlay--show-modal .swal-button--confirm').length > 0) {
        e.preventDefault();
        if($('.modal.show').length > 0) {
            if($('.modal.show').find(':input:not([disabled]):not([readonly]):not([type=hidden]):not(button)').length > 0) {
                $('.modal.show').find(':input:not([disabled]):not([readonly]):not([type=hidden]):not(button)').first().focus();
            } else {
                $('.modal.show [data-bs-dismiss="modal"]')[0].blur();
            }
        }
        $('.swal-overlay--show-modal .swal-button--confirm').trigger('click');
    }
});
$(document).on('focus','input',function(){
    if($(this).closest('.bootstrap-tagsinput').length > 0) {
        $(this).closest('.bootstrap-tagsinput').addClass('active');
    }
});
$(document).on('blur','input',function(){
    if($(this).closest('.bootstrap-tagsinput').length > 0) {
        $(this).closest('.bootstrap-tagsinput').removeClass('active');
    }
});
$('#app-search-input').focus(function(){
    var val = $(this).val().trim();
    var w   = $(this).outerWidth();
    var t   = $(this).offset().top + $(this).outerHeight() + 4;
    var l   = $(this).offset().left;
    if(val.length >= 2) {
        $(this).siblings('.search-icon').addClass('fa-spin').addClass('fa-spinner-third').removeClass('fa-search');
        $('.search-input-result').addClass('show').css({
            width : w + 'px',
            top : t + 'px',
            left : l + 'px'
        });
    }
    $('.dropdown-toggle.show').each(function(){
        $(this).removeClass('show').attr('aria-expanded','false');
        $(this).siblings('.dropdown-menu').removeClass('show').attr('style','');
    });
});
$('#app-search-input').keyup(function(e){
    var val = $(this).val().trim();
    var w   = $(this).outerWidth();
    var t   = $(this).offset().top + $(this).outerHeight() + 4;
    var l   = $(this).offset().left;
    var keyCode = e.keyCode;

    if(keyCode == 38 || keyCode == 40 || keyCode == 13) {
        if($('.search-input-result .search-input-list').length > 0) {
            if(keyCode == 40) {
                if($('.search-input-result .search-input-list.active').length == 0) {
                    $('.search-input-result .search-input-list').first().addClass('active');
                } else {
                    $('.search-input-result .search-input-list.active').removeClass('active').next().addClass('active');
                }
            } else if(keyCode == 38) {
                if($('.search-input-result .search-input-list.active').length == 0) {
                    $('.search-input-result .search-input-list').last().addClass('active');
                } else {
                    $('.search-input-result .search-input-list.active').removeClass('active').prev().addClass('active');
                }
            } else {
                var link = $('.search-input-result .search-input-list.active').attr('href');
                window.location = link;
            }
        }
        return false;
    } else {
        if(typeof xhrAll.appSearch == 'undefined') {
            xhrAll.appSearch    = null;
        }
        if(xhrAll.appSearch != null) {
            xhrAll.appSearch.abort();
            xhrAll.appSearch    = null;
        }
        if(val.length >= 2) {
            $(this).siblings('.search-icon').addClass('fa-spin').addClass('fa-spinner-third').removeClass('fa-search');
            $('.search-input-result').addClass('show').css({
                width : w + 'px',
                top : t + 'px',
                left : l + 'px'
            });
            if($('.search-input-result .search-input-list').length == 0) {
                $('.search-input-result').html(lang.mohon_tunggu+'...');
            }
            xhrAll.appSearch = $.ajax({
                url : baseURL('general/search-menu'),
                data : {
                    menu : val
                },
                dataType : 'json',
                success : function(r) {
                    xhrAll.appSearch = null;
                    if(r.length == 0) {
                        $('.search-input-result').html(lang.data_tidak_ditemukan);
                    } else {
                        var html    = '';
                        $.each(r,function(k,v){
							if(v.menu !== undefined) {
								var splitMenu   = v.menu.split('>');
								var lastMenu    = '<span class="search-input-suggestion">' + splitMenu[splitMenu.length - 1] + '</span>';
								var menu        = '';
								$.each(splitMenu, function(x,y){
									if(x < splitMenu.length - 1) {
										menu    += y + ' > ';
									} else {
										menu    += lastMenu;
									}
								});
								html += '<a href="'+v.link+'" class="search-input-list">'+menu+'</a>';
							}
                        });
                        $('.search-input-result')[0].innerHTML = html;
                    }
                }
            })
        } else {
            $(this).siblings('.search-icon').removeClass('fa-spin').removeClass('fa-spinner-third').addClass('fa-search');
            $('.search-input-result').removeClass('show');
        }
    }
});
$('#app-search-input').blur(function(){
    $('.search-input-result').css('opacity','0');
    setTimeout(function(){
        $('.search-input-result').css('opacity','').removeClass('show');
    },500);
    $(this).siblings('.search-icon').removeClass('fa-spin').removeClass('fa-spinner-third').addClass('fa-search');
});
$(document).on('mouseenter','.search-input-list',function(){
    $('.search-input-list.active').removeClass('active');
});
$(window).resize(function(){
    if($('.search-input-result').hasClass('show')) {
        $('#app-search-input').trigger('focus');
    }
    headerActionButton();
});
function headerActionButton() {
    var minWindowWidth      = 500;
    if($('#main-panel .panel-header .notification').length > 0) {
        minWindowWidth      = 1200;
        if($('body').hasClass('min-menu')) {
            minWindowWidth      = 1000;
        }
    } else {
        minWindowWidth      = 1050;
        if($('body').hasClass('min-menu')) {
            minWindowWidth      = 850;
        }
    }
    if($('.action-header .btn-group .btn-group').length > 0) {
        if($(window).width() > minWindowWidth) {
            $('.action-header .btn-group .btn-group').siblings('.d-none').removeClass('d-none');
            $('.action-header .btn-group .dropdown-toggle').removeClass('rounded-circle');
            $('.action-header .additional-resize').remove();
        } else {
            $('.action-header .btn-group .btn-group').siblings().each(function(){
                if(!$(this).hasClass('d-none')) {
                    var html = this.outerHTML.replace('btn','dropdown-item').replace('btn-app','dropdown-item-icon').replace(/<span>|<\/span>/gi,'');
                    $(this).addClass('d-none');
                    $('.action-header .btn-group .dropdown-toggle').addClass('rounded-circle');
                    $('.action-header .btn-group .btn-group ul').prepend('<li class="additional-resize">'+html+'</li>');
                }
            });
        }
    } else {
        if($(window).width() > minWindowWidth) {
            $('.action-header .btn span').removeClass('d-none');
            $('.action-header .btn i').removeClass('f-125');
            $('.action-header .btn').removeClass('rounded-circle').removeClass('btn-icon');
        } else {
            $('.action-header .btn span').addClass('d-none');
            $('.action-header .btn i').addClass('f-125');
            $('.action-header .btn').addClass('rounded-circle').addClass('btn-icon');
        }
    }
}
function showTooltip(_t,idTooltip) {
    var leftPos     = _t.offset().left;
    var rightPos    = _t.offset().left + _t.outerWidth();
    var topPos      = _t.offset().top;
    var bottomPos   = _t.offset().top + _t.outerHeight();
    var t           = 0;
    var l           = 0;
    if(_t.attr('data-appinity-tooltip') == 'left') {
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').addClass('right-arrow');
        tWidth      = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerWidth();
        tHeight     = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerHeight();
        l           = leftPos - tWidth - 10;
        t           = topPos + (_t.outerHeight() / 2) - (tHeight / 2);
    } else if(_t.attr('data-appinity-tooltip') == 'right') {
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').addClass('left-arrow');
        tWidth      = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerWidth();
        tHeight     = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerHeight();
        l           = rightPos + 10;
        t           = topPos + (_t.outerHeight() / 2) - (tHeight / 2);
    } else if(_t.attr('data-appinity-tooltip') == 'bottom') {
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').addClass('top-arrow');
        tWidth      = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerWidth();
        tHeight     = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerHeight();
        l           = leftPos + (_t.outerWidth() / 2) - (tWidth / 2);
        t           = bottomPos + 10;
    } else {
        var toleransi   = 3;
        if(_t.attr('data-appinity-tooltip') == 'top') {
            $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').addClass('bottom-arrow');
            toleransi   = 10;
        }
        tWidth      = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerWidth();
        tHeight     = $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').outerHeight();
        l           = leftPos + (_t.outerWidth() / 2) - (tWidth / 2);
        t           = topPos - tHeight - toleransi;
    }
    $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').css({
        visibility : 'visible',
        top : t,
        left : l
    });
}
$(document).on('mouseenter focus','[data-appinity-tooltip]',function(e){
    e.preventDefault();
    var _t  = $(this);
    if($(this).attr('aria-label') != '' && typeof _t.attr('data-id-tooltip') == 'undefined') {
        var idTooltip   = Math.floor(100000 + Math.random() * 900000);
        var autowidth   = '';
        _t.attr('data-id-tooltip',idTooltip);
        var tooltipInfo = _t.attr('aria-label');
        if(typeof tooltipInfo == 'undefined') {
            tooltipInfo = _t.attr('title');
        }
        if(_t.attr('data-tooltip-width') == 'auto') {
            autowidth   = ' autowidth';
        }
        if(typeof tooltipInfo != 'undefined') {
            tooltipInfo = tooltipInfo.trim('').replace('\\n','<br />');
            $('body').append('<div class="app-tooltip'+autowidth+'" data-id-tooltip="'+idTooltip+'" style="top: 0px; left: 0px; visibility: hidden;">'+tooltipInfo+'</div>');
            showTooltip(_t,idTooltip); // memposisikan di posisi element
            showTooltip(_t,idTooltip); // memperbaharui posisi jadi sengaja di panggil 2x
        }
    }
});
$(document).on('mouseleave blur','[data-appinity-tooltip]',function(){
    if(typeof $(this).attr('data-id-tooltip') != 'undefined') {
        var idTooltip = $(this).attr('data-id-tooltip');
        $(this).removeAttr('data-id-tooltip');
        $('.app-tooltip[data-id-tooltip="'+idTooltip+'"]').remove();
    }
});
function loadNotification(el) {
    if(typeof xhrAll.notification == 'undefined') xhrAll.notification = null;
    if(xhrAll.notification == null) {
        var offset  = el.children().length;
        var limit   = 25;
        el.append('<li><div class="notification-loader"><i class="fa-spinner-third fa-spin d-inline-block"></i></div></li>')
        xhrAll.notification = $.ajax({
            url : baseURL('notification/load'),
            data : {
                limit : limit,
                offset : offset
            },
            dataType : 'json',
            success : function(res) {
                var r = res.data;
                el.find('.notification-loader').parent().remove();
                if(r.length == limit) {
                    xhrAll.notification = null;
                }
                var content = '';
                if(r.length > 0) {
                    $.each(r,function(k,v){
                        content += '<li class="notification-item">';
                        content += '<a href="'+baseURL('notification/read/')+encodeId(v.id)+'" class="notification-link">';
                        content += '<div class="notification-icon bg-'+v.notif_type+'"><i class="'+v.notif_icon+'"></i></div>';
                        if(v.is_read == '0' || v.is_read == false || v.is_read == 'f') {
                            content += '<div class="notification-unread"></div>';
                        }
                        content += '<div class="notification-info">';
                        if(v.is_read == '0' || v.is_read == false || v.is_read == 'f') {
                            content += '<div class="mb-1 fw-bold text-app">'+v.title+'</div>';
                        } else {
                            content += '<div class="mb-1">'+v.title+'</div>';
                        }
                        content += '<div class="f-80 mb-2">'+v.description+'</div>';
                        content += '<div class="f-75">'+v.time+'</div>';
                        content += '</div>';
                        content += '</a>';
                        content += '</li>';
                    });
                } else if(el.html() == '') {
                    content += '<li><div class="py-4 px-2 text-center"><i class="fa-bell f-lg"></i><div class="mt-2">'+lang.tidak_ada_pemberitahuan+'</div></div></li>'
                }
                el.append(content);
            }
        });
    }
}
$(document).on('click','.card-collapse .card-header',function(){
    $(this).parent().toggleClass('open');
});
