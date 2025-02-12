var xhrSave     = null;
var xhrKey      = null;
var appTable    = {};

// select2 lang
!(function () {
    if($().select2) {
        if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) var n = jQuery.fn.select2.amd;
        n.define("select2/i18n/app", [], function () {
            return {
                errorLoading: function () {
                    return lang.select2_errorLoading;
                },
                inputTooLong: function (n) {
                    return lang.select2_inputTooLong.replace('{replace}',(n.input.length - n.maximum));
                },
                inputTooShort: function (n) {
                    return lang.select2_inputTooShort.replace('{replace}',(n.minimum - n.input.length));
                },
                loadingMore: function () {
                    return lang.select2_loadingMore;
                },
                maximumSelected: function (n) {
                    return lang.select2_maximumSelected.replace('{replace}', n.maximum);
                },
                noResults: function () {
                    return lang.select2_noResults;
                },
                searching: function () {
                    return lang.select2_searching;
                },
                removeAllItems: function () {
                    return lang.select2_removeAllItems;
                },
            };
        }),
        n.define,
        n.require;
    }
})();
$.fn.extend({
    formData: function() {
        var serialize   = this.serializeArray();
        var checkbox    = this.find('input[type="checkbox"]:not([disabled]):visible');
        var selectbox   = this.find('select:not([disabled]):visible');
        checkbox.each(function(){
            if(!$(this).is(':checked') && typeof $(this).attr('name') != 'undefined') {
                serialize.push({
                    name : $(this).attr('name'),
                    value : '0'
                });
            }
        });
        selectbox.each(function(){
            if($(this).val() == null && typeof $(this).attr('name') != 'undefined') {
                serialize.push({
                    name : $(this).attr('name'),
                    value : ''
                });
            }
        });
        return serialize;
    }
});
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-Client-Token", appinityToken.clientToken());
        xhr.setRequestHeader("X-Request-Token", appinityToken.requestToken());
        if($('meta[name="string-uri"]').length > 0) {
            xhr.setRequestHeader("X-Data-Ref", $('meta[name="string-uri"]').attr('content'));
        }
        if(xhrKey != null) {
            xhr.setRequestHeader("X-Data-Key", xhrKey);
            xhrKey  = null;
        }
        if(typeof settings.element != 'undefined') {
            var form    = settings.element;
            xhr.element = form;
            if(typeof form.attr('data-field-ref') != 'undefined') {
                xhr.setRequestHeader("X-Field-Ref", form.attr('data-field-ref'));
            }
            if(typeof form.attr('data-key') != 'undefined') {
                xhr.setRequestHeader("X-Data-Key", form.attr('data-key'));
            }
            if(settings.type == 'POST') {
                form.find(':input:not([disabled]):visible').attr('data-input-post',true).attr('disabled',true);
                if(typeof form.attr('id') != 'undefined') {
                    $('button[form="'+form.attr('id')+'"]').attr('disabled',true);
                }
            }
        }
    },
    complete: function(xhr, stat) {
        xhrSave = null;
        if(typeof xhr.element != 'undefined') {
            var form        = xhr.element;
            form.find(':input[data-input-post]').removeAttr('data-input-post').removeAttr('disabled');
            if(typeof form.attr('id') != 'undefined') {
                $('button[form="'+form.attr('id')+'"]').removeAttr('disabled');
            }
        }
        $('[data-origin-class]').each(function(){
            $(this).attr('class',$(this).attr('data-origin-class'));
            $(this).removeAttr('data-origin-class');
        });

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
				badgeParent();
            }
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        xhrSave = null;
        var message     = lang.terjadi_kesalahan;
        var status      = jqXHR.status;
        var typeInfo    = 'dialog';
        var form        = null;
        $.each(xhrAll,function(kXhr,vXhr){
            xhrAll[kXhr] = null;
        });
        if(status != 0) {
            if(status == 200) status = 'Err';
            if(status == 400) reload();
            if(typeof jqXHR.responseJSON != 'undefined' && typeof jqXHR.responseJSON.message != 'undefined') {
                message = jqXHR.responseJSON.message;
            }
            if(typeof jqXHR.element != 'undefined') {
                form        = jqXHR.element;
                typeInfo    = form.attr('data-info');

                form.find(':input[data-input-post]').removeAttr('data-input-post').removeAttr('disabled');
                if(typeof form.attr('id') != 'undefined') {
                    $('button[form="'+form.attr('id')+'"]').removeAttr('disabled');
                }
                if(typeof typeInfo == 'undefined') typeInfo = 'dialog';
            }
            if(typeInfo == 'alert') {
                if(form.parent().find('.alert-callback').length == 0) {
                    form.before('<div class="alert alert-callback mb-2"></div>');
                }
                var html    = '<span class="fw-bold me-2">['+status+']</span>' + message;
                form.parent().find('.alert-callback').removeAttr('class').attr('class','alert alert-danger alert-callback headShake mb-3').html(html);
                setTimeout(function(){
                    form.parent().find('.alert-callback').removeClass('headShake');
                },500);
            } else if(typeInfo == 'toast') {
                cToast.open(message,'error');
            } else {
                cAlert.open(message,'error');
            }
        }
        $('[data-origin-class]').each(function(){
            $(this).attr('class',$(this).attr('data-origin-class'));
            $(this).removeAttr('data-origin-class');
        });
    }
});
var cAlert = cAlert || (function($) {
    'use strict';
    return {
        open: function(message, status, onClick, paramClick) {
            if (typeof message === 'undefined') {
                message = 'Halo Dunia';
            }
            var title = lang.pemberitahuan;
            var type = 'info';
            if (typeof status !== 'undefined') {
                if (inArray(status,['error','danger'])) {
                    title = lang.kesalahan;
                    type = 'error';
                } else if (status == 'failed') {
                    title = lang.gagal;
                    type = 'error';
                } else if (status == 'success') {
                    title = lang.berhasil;
                    type = 'success';
                } else if (status == 'warning') {
                    title = lang.peringatan;
                    type = 'warning';
                }
            }
            if(typeof swal !== 'undefined') {
                swal({
                    title: title,
                    text: message,
                    icon: type,
                    button: lang.ok,
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then((value) => {
                    if(typeof onClick != 'undefined' && onClick != null) {
                        var parseAct    = onClick.split(':',2);
                        var act = window[parseAct[0]];
                        if (typeof act == 'function') {
                            if(typeof parseAct[1] == 'undefined') {
                                if(typeof paramClick != 'undefined') {
                                    act(paramClick);
                                } else {
                                    act();
                                }
                            } else if(typeof parseAct[1] != 'undefined' && typeof paramClick == 'object') {
                                if(typeof paramClick[parseAct[1]] != 'undefined') {
                                    act(paramClick[parseAct[1]]);
                                } else {
                                    act(parseAct[1]);
                                }
                            } else {
                                act(onClick.replace(parseAct[0] + ':',''));
                            }
                        }
                    }
                });
            } else {
                alert(message);
            }
        }
    }
})(jQuery);
var cConfirm = cConfirm || (function($) {
    'use strict';
    return {
        open: function(message, onConfirm, paramConfirm, tipe) {
            if (typeof message === 'undefined') {
                message = lang.apakah_anda_yakin + '?';
            }
            var title = lang.konfirmasi;
            var type = 'question';
            if (typeof tipe !== 'undefined') type = tipe;
            if (tipe == 'warning') title = lang.peringatan;
            if(typeof swal !== 'undefined') {
                swal({
                    title: title,
                    text: message,
                    icon: type,
                    buttons: {
                        cancel: lang.batalkan,
                        catch: {
                            text: lang.lanjutkan,
                            value: "catch",
                            closeModal: false
                        }
                    },
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then((value) => {
                    if(value == "catch") {
                        $('.swal-button--cancel,.swal-button--catch').attr('disabled',true);
                        setTimeout(function () {
                            if (typeof onConfirm !== 'undefined') {
                                var parseAct    = onConfirm.split(':',2);
                                var act = window[parseAct[0]];
                                if (typeof act == 'function') {
                                    if(typeof parseAct[1] == 'undefined') {
                                        if(typeof paramConfirm != 'undefined') {
                                            act(paramConfirm);
                                        } else {
                                            act();
                                        }
                                    } else {
                                        act(onConfirm.replace(parseAct[0] + ':',''));
                                    }
                                }
                            } else {
                                cAlert.open(lang.lanjutkan,'success');
                            }
                        }, 300);
                    } else {
                        swal.close();
                    }
                });
            } else {
                if(confirm(message)) {
                    if (typeof onConfirm !== 'undefined' && onConfirm != null) {
                        var parseAct    = onConfirm.split(':',2);
                        var act = window[parseAct[0]];
                        if (typeof act == 'function') {
                            if(typeof parseAct[1] == 'undefined') {
                                if(typeof paramConfirm != 'undefined') {
                                    act(paramConfirm);
                                } else {
                                    act();
                                }
                            } else {
                                act(onConfirm.replace(parseAct[0] + ':',''));
                            }
                        }
                    } else {
                        cAlert.open(lang.lanjutkan,'success');
                    }
                }
            }
        }
    }
})(jQuery);
var cModal = cModal || (function($) {
    'use strict';
    var $dialog = $('<div class="modal fade" aria-hidden="true" tabindex="-1"><div class="modal-dialog modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h5 class="modal-title"></h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"></div></div></div></div>');
    return {
        open: function(header, body, size) {
            var title       = 'Modal';
            var subtitle    = '';
            var modalSize   = '';
            if(typeof header == 'object') {
                if(typeof header[0] != 'undefined') title = header[0];
                if(typeof header[1] != 'undefined') subtitle = header[1];
            } else {
                title       = header;
            }
            if(subtitle != '') title += '<small>'+subtitle+'</small>';
            if(typeof size != 'undefined') {
                if(size.indexOf('modal-') == -1) modalSize = 'modal-' + size;
                else modalSize = size;
            }
            $dialog.find('.modal-body').html(body);
            $dialog.find('.modal-header').children('.modal-title').html(title);
            if(modalSize) {
                $dialog.find('.modal-dialog').addClass(modalSize);
            } else {
                $dialog.find('.modal-dialog').attr('class','modal-dialog modal-dialog-scrollable');
            }
            var modalGenerated = new bootstrap.Modal($dialog[0]);
            modalGenerated.show();
        }
    };
})(jQuery);
var cToast = cToast || (function($) {
    'use strict';
    var $dialog = $(
        '<div class="toast align-items-center text-white hide border-0 mt-2" role="alert" aria-live="assertive" aria-atomic="true"><div class="d-flex">' +
        '<div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>'
        );
    return {
        open: function(message, status) {
            var idDialog = 'toast-' + rand();
            if (typeof message === 'undefined') {
                message = 'Halo Dunia';
            }
            var type = 'primary';
            if (typeof status !== 'undefined') {
                if (inArray(status,['error','danger','failed'])) {
                    type = 'danger';
                } else if (status == 'info') {
                    type = 'info';
                } else if (status == 'success') {
                    type = 'success';
                } else if (status == 'warning') {
                    type = 'warning';
                }
            }
            $dialog.attr('id',idDialog);
            $dialog.find('.toast-body').html(message);
            $dialog.removeClass('bg-success').removeClass('bg-primary').removeClass('bg-info').removeClass('bg-warning').removeClass('bg-danger');
            $dialog.addClass('bg-' + type);
            
            if($('#app-toast-lists').length == 0) {
                $('body').append('<div class="position-fixed bottom-0 end-0 p-3" id="app-toast-lists" style="z-index: 3000"></div>');
            }
            $('#app-toast-lists').prepend($dialog[0].outerHTML);
            var myToastEl = document.getElementById(idDialog);
            var myToast = new bootstrap.Toast(myToastEl);
            myToast.show();
            myToastEl.addEventListener('hidden.bs.toast', function () {
                $('#' + idDialog).remove();
                if($('#app-toast-lists .toast').length == 0) {
                    $('#app-toast-lists').remove();
                }
            });
        }
    };
})(jQuery);
$(document).on('submit','[data-submit="ajax"]',function(e){
    e.preventDefault();
    if(typeof xhrAll[$(this).attr('action')] == 'undefined') {
        xhrAll[$(this).attr('action')] = null;
    }
    if(xhrAll[$(this).attr('action')] != null) {
        xhrAll[$(this).attr('action')].abort();
        xhrAll[$(this).attr('action')] = null;
    }
    var proc = true;
    if(typeof $(this).attr('data-beforeSave') !== 'undefined') {
        if($(this).attr('data-beforeSave') != "") {
            var act = window[$(this).attr('data-beforeSave')];
            if(typeof act == 'function') {
                var _act = act();
                if(typeof _act == 'boolean') proc = _act;
            }
        }
    }
    if(validation($(this)) && proc) {
        var url     = window.location.href;
        var method  = 'GET';
        var form    = $(this);
        var data    = form.formData();
        var action  = form.attr('action');
        if(typeof action != 'undefined' && !inArray(action,['','#','javascript:;'])) url = action;
        if(typeof form.attr('method') != 'undefined') method = form.attr('method').toUpperCase();
        if(xhrSave == null) {
            xhrSave = $.ajax({
                element : form,
                url : url,
                type : method,
                data : data,
                dataType : 'json',
                success : function(r) {
                    var typeInfo        = "dialog";
                    var responseStatus  = 'info';
                    var alertAnim       = 'pulse';
                    var message         = '-';
                    var callback        = null;
                    var callbackParam   = null;
                    if(typeof r.status != 'undefined') {
                        if(inArray(r.status.toLowerCase(),["failed","error"])) {
                            responseStatus  = 'danger';
                            alertAnim       = 'headShake';
                        } else if(r.status.toLowerCase() == 'success') {
                            responseStatus  = 'success';
                        }
                    }
                    if(typeof r.message != 'undefined') message = r.message;
                    if(typeof form.attr('data-info') != 'undefined') {
                        typeInfo = form.attr('data-info');
                    }
                    if(typeof form.attr('data-callback') != 'undefined') {
                        callback = form.attr('data-callback');
                    }
                    if(typeInfo == 'alert') {
                        if(form.parent().find('.alert-callback').length == 0) {
                            form.before('<div class="alert alert-callback mb-2"></div>');
                        }
                        form.parent().find('.alert-callback').removeAttr('class').attr('class','alert alert-'+responseStatus+' alert-callback '+alertAnim+' mb-3').html(message);
                        setTimeout(function(){
                            form.parent().find('.alert-callback').removeClass(alertAnim);
                        },500);
                    } else if(typeInfo == 'toast') {
                        if(responseStatus == 'success') {
                            cToast.open(message, responseStatus);
                        } else {
                            cToast.open(message, responseStatus);
                        }
                    } else {
                        if(responseStatus == 'success') {
                            cAlert.open(message, responseStatus, callback, r);
                        } else {
                            cAlert.open(message, responseStatus);
                        }
                    }

                    if(r.status == 'success' && form.attr('data-reset-success') == 'true') {
                        form[0].reset();
                        form.find(':input').trigger('change');
                        form.find('input[type="hidden"]').each(function(){
                            if(typeof $(this).attr('data-value-default') == 'undefined') {
                                $(this).attr('data-value-default',$(this).val());
                            }
                            $(this).val($(this).attr('data-value-default'));
                        });        
                    }
                    
                    if(typeInfo == "toast" || typeInfo == "alert") {
                        if(r.status == 'success' && callback != null) {
                            var _callback = callback.split(":");
                            if(typeof _callback[1] != 'undefined' && _callback[1].trim('') != '') {
                                callbackParam   = callback.replace(_callback[0] + ':', '');
                            }
                            if(_callback[0].trim('') != '') {
                                callback        = _callback[0];
                            }
                            var callbackAction = window[callback];
                            if(typeof callbackAction == 'function') {
                                if(callbackParam != null && typeof r[callbackParam] != 'undefined') {
                                    callbackAction(r[callbackParam]);
                                } else if(callbackParam != null && callbackParam) {
                                    callbackAction(callbackParam);
                                } else {
                                    callbackAction(r);
                                }
                            }
                        }
                    }
                }
            });
        }
    }
});
$(document).on('submit','.modal form:not([data-manual]):not([data-submit])',function(e){
	e.preventDefault();
    var form        = $(this);
    var callback    = 'refreshData';
    var showAlert   = true;
    if(typeof $(this).attr('data-callback') != 'undefined') {
        callback = $(this).attr('data-callback');
    }
    if(typeof $(this).attr('data-showAlert') != 'undefined' && $(this).attr('data-showAlert') == 'false') {
        showAlert = false;
    }
    var proc = true;
    if(typeof $(this).attr('data-beforeSend') !== 'undefined') {
        if($(this).attr('data-beforeSend') != "") {
            var act = window[$(this).attr('data-beforeSend')];
            if(typeof act == 'function') {
                var _act = act();
                if(typeof _act == 'boolean') proc = _act;
            }
        }
    } else if(typeof $(this).attr('app-link') != 'undefined') {
        var act = window[$(this).attr('app-link') + 'BeforeSend'];
        if(typeof act == 'function') {
            var _act = act();
            if(typeof _act == 'boolean') proc = _act;
        }
    }
    if(validation($(this)) && proc) {
        if(xhrSave == null) {
            xhrSave = $.ajax({
                element : $(this),
                url 	: $(this).attr('action'),
                data 	: $(this).formData(),
                type 	: $(this).attr('method'),
                dataType: 'json',
                success : function(response) {
                    if(showAlert) {
                        message = response.message;
                        if(response.status == 'success') {
                            cAlert.open(message,response.status,callback,response.data);
                        } else {
                            temp_message = pregMatchAll(/{(.*?)}/si,response.message);
                            if(typeof temp_message[1] != 'undefined') {
                                $.each(temp_message[1],function(k,v){
                                    if(form.find('[name="'+v+'"]').length > 0) {
                                        var label = getInputLabel(form.find('[name="'+v+'"]'));
                                        message = message.replace(temp_message[0][k],label);
                                    }
                                });
                            }
                            cAlert.open(message,response.status);
                        }
                    }
                    if(typeof form.attr('app-link') != 'undefined') {
                        var actAfterSend = window[form.attr('app-link') + 'AfterSend'];
                        if(typeof actAfterSend == 'function') {
                            actAfterSend(response);
                        } else if(!showAlert) {
                            var parseAct    = callback.split(':',2);
                            var act = window[parseAct[0]];
                            if (typeof act == 'function') {
                                if(typeof parseAct[1] == 'undefined') {
                                    if(typeof paramClick != 'undefined') {
                                        act(paramClick);
                                    } else {
                                        act();
                                    }
                                } else if(typeof parseAct[1] != 'undefined' && typeof paramClick == 'object') {
                                    if(typeof paramClick[parseAct[1]] != 'undefined') {
                                        act(paramClick[parseAct[1]]);
                                    } else {
                                        act(parseAct[1]);
                                    }
                                } else {
                                    act(callback.replace(parseAct[0] + ':',''));
                                }
                            }
                        }
                    } else if(!showAlert) {
                        var parseAct    = callback.split(':',2);
                        var act = window[parseAct[0]];
                        if (typeof act == 'function') {
                            if(typeof parseAct[1] == 'undefined') {
                                if(typeof paramClick != 'undefined') {
                                    act(paramClick);
                                } else {
                                    act();
                                }
                            } else if(typeof parseAct[1] != 'undefined' && typeof paramClick == 'object') {
                                if(typeof paramClick[parseAct[1]] != 'undefined') {
                                    act(paramClick[parseAct[1]]);
                                } else {
                                    act(parseAct[1]);
                                }
                            } else {
                                act(callback.replace(parseAct[0] + ':',''));
                            }
                        }
                    }
                }
            });
        }
    }
});
$(document).on('keyup','.form-floating textarea',function(){
    if($(this).scrollTop() == 0) {
        $(this).parent().children('label').removeClass('d-none');
    } else {
        $(this).parent().children('label').addClass('d-none');
    }
    floatingFormScroll($(this));
});
function floatingFormScroll(e) {
    e.scroll(function(){
        if($(this).scrollTop() == 0) {
            $(this).parent().children('label').removeClass('d-none');
        } else {
            $(this).parent().children('label').addClass('d-none');
        }    
    });
}
function iconpickerInit(parent) {
    var iconElement  = $('.input-icon');
    if(typeof parent != 'undefined') {
        iconElement  = parent.find('.input-icon');
    }
    if($().iconpicker) {
        $.iconpicker.batch('.iconpicker-element', 'destroy');
        iconElement.each(function(){
            $(this).iconpicker();
            $(this).on('iconpickerSelected', function (e) {
                $(this).trigger('change');
            });
            $(this).change(function(){
                if($(this).parent().hasClass('has-error')) {
                    $(this).val('');
                    $(this).siblings('.input-group-text').find('i').attr('class','');
                }
            });
        });
    }
}
function tagsInit(parent) {
    var tagsElement  = $('.input-tags');
    if(typeof parent != 'undefined') {
        tagsElement  = parent.find('.input-tags');
    }
    if($().tagsinput) {
        tagsElement.each(function(){
            if($(this).siblings('.bootstrap-tagsinput').length > 0) {
               $(this).tagsinput('destroy');
            }
            $(this).tagsinput();
        });
    }
}
function dateInit(parent) {
    if($().daterangepicker) {
        if($().inputmask) {
            var maskElement  = $('.input-date');
            if(typeof parent != 'undefined') {
                maskElement  = parent.find('.input-date');
            }

            maskElement.each(function(){
                $(this).inputmask('remove');
                $(this).inputmask({
                    alias: 'datetime',
                    inputFormat: 'dd/mm/yyyy',
                    oncleared: function() {
                        $(this).val('');
                    },
                    onincomplete: function() {
                        $(this).val('');
                    }
                });
            });
        }
    
        var dateElement  = $('.input-date:not([readonly])');
        if(typeof parent != 'undefined') {
            dateElement  = parent.find('.input-date:not([readonly])');
        }
        dateElement.each(function(){
            var mindate = false;
            var maxdate = false;
            var parent  = $('body');
            if($(this).closest('.modal').length > 0) {
                parent  = $(this).closest('.modal');
            } else if($(this).closest('#main-panel').length > 0) {
                parent  = $(this).closest('.panel-content');
            }
            if(typeof $(this).attr('data-mindate') != 'undefined') {
                mindate = new Date($(this).attr('data-mindate'));
            }
            if(typeof $(this).attr('data-maxdate') != 'undefined') {
                maxdate = new Date($(this).attr('data-maxdate'));
            }
            $(this).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                minDate: mindate,
                maxDate: maxdate,
                parentEl: parent,
                locale: {
                    format: 'DD/MM/YYYY',
                    cancelLabel: lang.batal,
                    applyLabel: lang.ok,
                    daysOfWeek: [lang.min, lang.sen, lang.sel, lang.rab, lang.kam, lang.jum, lang.sab],
                    monthNames: [lang.jan, lang.feb, lang.mar, lang.apr, lang.mei, lang.jun, lang.jul, lang.agu, lang.sep, lang.okt, lang.nov, lang.des]
                },
                autoUpdateInput: false,
                autoApply: true
            }, function(start, end, label) {
                $(this.element[0]).removeClass('is-invalid');
                $(this.element[0]).parent().find('.error').remove();
            }).on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY'));
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(picker);
                } else {
                    $(this).trigger('change');
                }
            }).on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(null);
                } else {
                    $(this).trigger('change');
                }
            });
        });
    } else {
        $('.input-date').attr('type','date');
    }
}
function datetimeInit(parent) {
    if($().daterangepicker) {
        if($().inputmask) {
            var maskElement  = $('.input-datetime');
            if(typeof parent != 'undefined') {
                maskElement  = parent.find('.input-datetime');
            }

            maskElement.each(function(){
                $(this).inputmask('remove');
                $(this).inputmask({
                    alias: 'datetime',
                    inputFormat: 'dd/mm/yyyy HH:MM',
                    oncleared: function() {
                        $(this).val('');
                    },
                    onincomplete: function() {
                        $(this).val('');
                    }
                });
            });
        }

        var dateElement  = $('.input-datetime:not([readonly])');
        if(typeof parent != 'undefined') {
            dateElement  = parent.find('.input-datetime:not([readonly])');
        }
        dateElement.each(function(){
            var mindate = false;
            var maxdate = false;
            var parent  = $('body');
            if($(this).closest('.modal').length > 0) {
                parent  = $(this).closest('.modal');
            } else if($(this).closest('#main-panel').length > 0) {
                parent  = $(this).closest('.panel-content');
            }
            if(typeof $(this).attr('data-mindate') != 'undefined') {
                mindate = new Date($(this).attr('data-mindate'));
            }
            if(typeof $(this).attr('data-maxdate') != 'undefined') {
                maxdate = new Date($(this).attr('data-maxdate'));
            }
            $(this).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                timePicker: true,
                timePicker24Hour: true,
                minDate: mindate,
                maxDate: maxdate,
                parentEl: parent,
                locale: {
                    format: 'DD/MM/YYYY HH:mm',
                    cancelLabel: lang.batal,
                    applyLabel: lang.ok,
                    daysOfWeek: [lang.min, lang.sen, lang.sel, lang.rab, lang.kam, lang.jum, lang.sab],
                    monthNames: [lang.jan, lang.feb, lang.mar, lang.apr, lang.mei, lang.jun, lang.jul, lang.agu, lang.sep, lang.okt, lang.nov, lang.des]
                },
                autoUpdateInput: false
            }, function(start, end, label) {
                $(this.element[0]).removeClass('is-invalid');
                $(this.element[0]).parent().find('.error').remove();
            }).on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY HH:mm'));
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(picker);
                } else {
                    $(this).trigger('change');
                }
            }).on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(null);
                } else {
                    $(this).trigger('change');
                }
            });
        });
    } else {
        $('.input-datetime').attr('type','date');
    }
}
function daterangeInit(parent) {
    if($().daterangepicker) {
        if($().inputmask) {
            var maskElement  = $('.input-daterange');
            if(typeof parent != 'undefined') {
                maskElement  = parent.find('.input-daterange');
            }

            maskElement.each(function(){
                $(this).inputmask('remove');
                $(this).inputmask({
                    alias: 'datetime',
                    inputFormat: 'dd/mm/yyyy - dd/mm/yyyy',
                    oncleared: function() {
                        $(this).val('');
                    },
                    onincomplete: function() {
                        $(this).val('');
                    }
                });
            });
        }

        var dateElement  = $('.input-daterange:not([readonly])');
        if(typeof parent != 'undefined') {
            dateElement  = parent.find('.input-daterange:not([readonly])');
        }
        dateElement.each(function(){
            var mindate = false;
            var maxdate = false;
            var parent  = $('body');
            var ranges  = {};
            if($(this).closest('.modal').length > 0) {
                parent  = $(this).closest('.modal');
            } else if($(this).closest('#main-panel').length > 0) {
                parent  = $(this).closest('.panel-content');
            }
            if(typeof $(this).attr('data-mindate') != 'undefined') {
                mindate = new Date($(this).attr('data-mindate'));
            }
            if(typeof $(this).attr('data-maxdate') != 'undefined') {
                maxdate = new Date($(this).attr('data-maxdate'));
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
                minDate: mindate,
                maxDate: maxdate,
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
                $(this.element[0]).removeClass('is-invalid');
                $(this.element[0]).parent().find('.error').remove();
            }).on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(picker);
                } else {
                    $(this).trigger('change');
                }
            }).on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                var act = window[$(this).attr('id') + '_callback'];
                if(typeof act == 'function') {
                    act(null);
                } else {
                    $(this).trigger('change');
                }
            });
        });
    } else {
        $('.input-daterange').attr('type','date');
    }
}
function currencyInit(parent) {
    var currencyElement  = $('.input-currency:not([readonly])');
    if(typeof parent != 'undefined') {
        currencyElement  = parent.find('.input-currency:not([readonly])');
    }
    if($().inputmask) {
        currencyElement.each(function(){
            var digits = 0;
            if(typeof $(this).attr('data-decimal') != 'undefined' && !isNaN(parseInt($(this).attr('data-decimal')))) {
                digits = parseInt($(this).attr('data-decimal'));
            }
            $(this).inputmask('remove');
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
        });
    }
}
function select2TemplateResult(result) {
    return result.text;
}
function select2TemplateSelection(selection) {
    return selection.text;    
}
function select2Init(parent) {
    var select2Element  = $('.select2');
    if(typeof parent != 'undefined') {
        select2Element  = parent.find('.select2');
    }
    if($().select2) {
        select2Element.each(function(){
            var $t          = $(this);

            if($t.data('select2')) {
                $t.select2('destroy');
            }

            var width       = '100%';
            var parent      = $('body');
            if($(this).closest('.modal').length > 0) {
                if($(this).closest('.card').length > 0) {
                    parent  = $(this).closest('.card');
                } /* else if($(this).closest('.row').length > 0) {
                    parent  = $(this).closest('.row');
                }*/ else {
                    parent  = $(this).closest('.modal');
                }
            }
            if(typeof $t.attr('data-width') != 'undefined') {
                width   = $t.attr('data-width');
            }
            if(!width) width = 'resolve';

            var templateResult = select2TemplateResult;
            var templateSelection = select2TemplateSelection;

            if($t.attr('id') != undefined) {
                var fn = window[$t.attr('id') + 'TemplateResult'];
                if(typeof fn == 'function') {
                    templateResult = fn;
                }
                
                var fns = window[$t.attr('id') + 'TemplateSelection'];
                if(typeof fns == 'function') {
                    templateSelection = fns;
                }
            }

            var config = {
                language: 'app',
                width: width,
                dropdownParent: parent,
                templateResult: templateResult,
                templateSelection: templateSelection
            };

            if(typeof $t.attr('data-search') != 'undefined' && $t.attr('data-search').toLowerCase() == 'false') {
                config.minimumResultsForSearch  = -1;
            }
            if(typeof $t.attr('placeholder') != 'undefined' && $t.attr('placeholder') != '') {
                config.placeholder  = $t.attr('placeholder');
            }
            $t.select2(config);
        });
    }
}
function colorInit() {
	$('input[type="color"]').each(function(){
		if($(this).siblings('.input-color-code').length == 0) {
			$(this).wrap('<div class="input-group"></div>');
			$(this).removeClass('mw-100');
			$(this).parent().append('<input type="text" class="form-control input-color-code" maxlength="7" value="'+$(this).val()+'">');
		}
		$(this).change(function(){
			$(this).parent().find('.input-color-code').val($(this).val());
		});
    });
}
$(document).on('keyup','.input-color-code',function(){
    var v = $(this).val();
    if(v == '') {
        $(this).val('#');
    }
    if(v.length == '4') {
        v = '#' + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    }
    $(this).closest('.input-group').find('input[type="color"]').val(v);
});
$(document).on('change','.input-color-code',function(){
    var v = $(this).val();
    if(v == '') {
        $(this).val('#');
    }
    if(v.length == '4') {
        v = '#' + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    }
    $(this).closest('.input-group').find('input[type="color"]').val(v).trigger('change');
});
$(document).on('change','.form-range',function(){
    var prefix  = '';
    if(typeof $(this).attr('data-prefix') != 'undefined') {
        prefix = $(this).attr('data-prefix');
    }
    $(this).parent().find('.range-value').html($(this).val()+prefix);
});
$(document).ready(function(){
    initValidation();
    tagsInit();
    dateInit();
    datetimeInit();
    daterangeInit();
    currencyInit();
    select2Init();
	colorInit();
	badgeParent();
    if($('.input-icon').length > 0) {
        var invIcon = setInterval(function(){
            iconpickerInit();
            if($('.input-icon').eq(0).hasClass('iconpicker-element')) {
                clearInterval(invIcon);
            }
        },500);
    }
    if($('table[data-key]').length > 0) {
        var x = $('table[data-key]').attr('data-key').split('-');
    }
    $('.form-range').each(function(){
        var prefix  = '';
        if(typeof $(this).attr('data-prefix') != 'undefined') {
            prefix = $(this).attr('data-prefix');
        }
        $(this).wrap('<div class="input-group"></div>');
        $(this).parent().append('<div class="range-value">'+$(this).val()+prefix+'</div>');
    });
    $('input[data-type="upload-image"]').each(function(){
        $(this).attr('type','hidden');
        var image_preview   = baseURL('assets/images/image.svg');
        var width           = 0;
        var height          = 0;
        var name            = $(this).attr('name');
        var imgSize         = '200';
        var crop            = '';
        var info            = true;
        if(typeof $(this).attr('data-value') != 'undefined' && $(this).attr('data-value') != '') {
            image_preview   = $(this).attr('data-value');
            imgSize         = '';
        }
        if(typeof $(this).attr('data-info') != 'undefined' && $(this).attr('data-info') == 'false') {
            info            = false;
        }
        if(typeof $(this).attr('data-width') != 'undefined') {
            width           = parseInt($(this).attr('data-width'));
            if(isNaN(width)) width = 0;
        }
        if(typeof $(this).attr('data-height') != 'undefined') {
            height          = parseInt($(this).attr('data-height'));
            if(isNaN(height)) height = 0;
        }
        if(typeof $(this).attr('data-crop') != 'undefined') {
            crop            = 'crop';
        }
        if(width > 0 && height == 0) height = width;
        if(height > 0 && width == 0) width = height;
        var idx 	= 'upl-' + name;
        var url     = baseURL('upload/image/'+width+'/'+height+'/'+crop);

        var ui = '<div class="image-upload">';
            ui += '<div class="image-preview"><img src="'+image_preview+'" alt="upload-image" width="'+imgSize+'" /></div>';
            ui += '<div class="upload-container">';
            if(height > 0 && width > 0 && info) {
                ui += '<div class="upload-recomendation">'+lang.rekomendasi+' '+width+'x'+height+' (px)</div>';
            }
            ui += '<div class="upload-button-container"><button type="button" class="btn-upload-image btn btn-app" data-target="'+idx+'"><i class="fa-upload me-2"></i>'+lang.unggah+'</button></div>';
            ui += '</div>';
            ui += '</div>';
        
        $(this).parent().append(ui);

		var formUpload 	= '<form action="'+url+'" class="d-none">';
		formUpload += '<input type="file" name="image" class="input-image" accept="image/*" id="'+idx+'">';
		formUpload += '<input type="hidden" name="name" value="'+name+'">';
		formUpload += '</form>';
		$(this).attr('data-image',idx);
		$('body').append(formUpload);

        $(document).on('click','.btn-upload-image[data-target="'+idx+'"]',function(){
            $('#' + idx).trigger('click');
		});


		$('#' + idx).fileupload({
			maxFileSize: max_upload_filesize,
			autoUpload: false,
			dataType: 'text',
			acceptFileTypes: /(\.|\/)(gif|jpe?g|png|svg)$/i
		}).on('fileuploadadd', function(e, data) {
			$('.btn-upload-image[data-target="'+idx+'"]').attr('disabled',true);
			data.process();
		}).on('fileuploadprocessalways', function (e, data) {
			if (data.files.error) {
				data.abort();
				cAlert.open(lang.file_yang_diizinkan + ' *.png, *.jpg, ' + lang.atau + ' *.gif ' + lang.dengan_ukuran_maksimal + ' ' + (max_upload_filesize / 1024 / 1024) + 'MB');
                $('.btn-upload-image[data-target="'+idx+'"]').removeAttr('disabled');
			} else {
				data.submit();
			}
		}).on('fileuploadprogressall', function (e, data) {
			var progress = parseInt(data.loaded / data.total * 100, 10);
            $('.btn-upload-image[data-target="'+idx+'"]').html(progress + '%');
		}).on('fileuploaddone', function (e, data) {
            $('.btn-upload-image[data-target="'+idx+'"]').html('<i class="fa-upload me-2"></i>' + lang.unggah);
            $('.btn-upload-image[data-target="'+idx+'"]').removeAttr('disabled');
			if(data.result == 'invalid') {
				cAlert.open(lang.file_gagal_diunggah,'error');
			} else {
				$('.btn-upload-image[data-target="'+idx+'"]').closest('.image-upload').find('img').attr('src',base_url + data.result + '?' + new Date().getTime());
                setTimeout(function(){
                    $('.btn-upload-image[data-target="'+idx+'"]').closest('.image-upload').find('img').removeAttr('width');
                },300);
				$('[data-image="'+idx+'"]').val(data.result);
			}
		}).on('fileuploadfail', function (e, data) {
			cAlert.open(lang.file_gagal_diunggah,'error');
            $('.btn-upload-image[data-target="'+idx+'"]').html('<i class="fa-upload me-2"></i>' + lang.unggah);
            $('.btn-upload-image[data-target="'+idx+'"]').removeAttr('disabled');
		}).on('fileuploadalways', function() {
		});
    });
    $('input[data-type="upload-file"]').each(function(){
        $(this).attr('type','hidden');
        var preview = '';
        var name    = $(this).attr('name');
        var idx 	= 'upl-' + name;
        if($('[data-type="upload-file"][name="'+name+'"]').length > 1) {
            idx += '-' + rand();
        }
        var url     = baseURL('upload/file');
        if(typeof $(this).attr('data-value') != 'undefined' && $(this).attr('data-value') != '') {
            var xResult = $(this).attr('data-value').split('/');
            preview = '<a href="'+baseURL('download?resource=' + Base64.encode($(this).attr('data-value')))+'" target="_blank">' + xResult[xResult.length-1] + '</a>';
        }


        var ui = '<div class="input-group">';
            ui += '<div class="file-preview">'+preview+'</div>';
            ui += '<button type="button" class="btn-upload-file btn btn-app" data-target="'+idx+'"><i class="fa-upload"></i></button></div>';
            ui += '</div>';
            ui += '</div>';
        
        $(this).parent().append(ui);

        var accept 	= $(this).attr('data-accept');
        if(typeof accept == 'undefined' && $('meta[name="m-upl-acc"]').length > 0 && $('meta[name="m-upl-acc"]').attr('content') != '') {
            var accept 	= Base64.decode($('meta[name="m-upl-acc"]').attr('content'));
        }
		var regex 	= "(\.|\/)("+accept+")$";
		var re 		= accept == '*' ? '*' : new RegExp(regex,"i");

		var formUpload 	= '<form action="'+url+'" class="d-none">';
		formUpload += '<input type="file" name="document" class="input-file" id="'+idx+'">';
		formUpload += '<input type="hidden" name="name" value="'+name+'">';
		formUpload += '</form>';
		$(this).attr('data-file',idx);
		$('body').append(formUpload);

        $(document).on('click','.btn-upload-file[data-target="'+idx+'"]',function(){
            $('#' + idx).trigger('click');
        });

		$('#' + idx).fileupload({
			maxFileSize: max_upload_filesize,
			autoUpload: false,
			dataType: 'text',
			acceptFileTypes: re
		}).on('fileuploadadd', function(e, data) {
			$('.btn-upload-file[data-target="'+idx+'"]').attr('disabled',true);
			data.process();
		}).on('fileuploadprocessalways', function (e, data) {
			if (data.files.error) {
				data.abort();
				cAlert.open(lang.file_yang_diizinkan + ' ' + accept.replaceAll('|',', ') + ' ' + lang.dengan_ukuran_maksimal + ' ' + (max_upload_filesize / 1024 / 1024) + 'MB');
                $('.btn-upload-file[data-target="'+idx+'"]').removeAttr('disabled');
			} else {
				data.submit();
			}
		}).on('fileuploadprogressall', function (e, data) {
			var progress = parseInt(data.loaded / data.total * 100, 10);
            $('.btn-upload-file[data-target="'+idx+'"]').html(progress + '%');
		}).on('fileuploaddone', function (e, data) {
            $('.btn-upload-file[data-target="'+idx+'"]').html('<i class="fa-upload"></i>');
            $('.btn-upload-file[data-target="'+idx+'"]').removeAttr('disabled');
            $('[data-file="'+idx+'"]').parent().find('.msg-invalid-form').remove();
			if(data.result == 'invalid') {
				cAlert.open(lang.file_gagal_diunggah,'error');
			} else {
                var xResult = data.result.split('/');
				$('.btn-upload-file[data-target="'+idx+'"]').siblings('.file-preview').html('<a href="'+baseURL('download?resource=' + Base64.encode(data.result))+'" target="_blank">' + xResult[xResult.length-1] + '</a>');
				$('[data-file="'+idx+'"]').val(data.result);
			}
		}).on('fileuploadfail', function (e, data) {
			cAlert.open(lang.file_gagal_diunggah,'error');
            $('.btn-upload-file[data-target="'+idx+'"]').html('<i class="fa-upload"></i>');
            $('.btn-upload-file[data-target="'+idx+'"]').removeAttr('disabled');
            $('[data-file="'+idx+'"]').parent().find('.msg-invalid-form').remove();
		}).on('fileuploadalways', function() {
		});
    });
    $('#left-panel .modal, #main-panel .modal, #right.panel.modal').each(function(){
        $(this).find(':input').each(function(){
            if($(this).data('select2')) {
                $(this).select2('destroy');
            }
            if($(this).siblings('.bootstrap-tagsinput').length > 0) {
                $(this).tagsinput('destroy');
            }
        });
        $('body').append(this.outerHTML);
        $(this).remove();
        initValidation();
        tagsInit();
        dateInit();
        datetimeInit();
        daterangeInit();
        currencyInit();
        select2Init();
        colorInit();
        ckeditorInit();
    });
    if($().appinityTable) {
        var appTableIndex = 0;
        $('.table-appinity').each(function(){
            var id = '';
            if(typeof $(this).attr('id') == 'undefined') {
                id = 'table_' + appTableIndex;
                appTableIndex++;
                $(this).attr('id',id);
            } else {
                id = $(this).attr('id');
            }
            appTable[id] = $('#' + id).appinityTable('reset');
        });
    }
});
function getTableData(appLink) {
    var idTable = $('.table-appinity[app-link="'+appLink+'"]').attr('id');
    if(typeof idTable != 'undefined' && typeof appTable[idTable] != 'undefined') {
        return appTable[idTable].data();
    }
    return null;
}
function refreshData(appLink) {
    var idTable = $('.table-appinity[app-link="'+appLink+'"]').attr('id');
    if(typeof idTable != 'undefined' && typeof appTable[idTable] != 'undefined') {
        appTable[idTable].refreshData();
        closeModal();
        $('table input[type="checkbox"]').prop('checked', false).prop('indeterminate', false);
    } else {
        reload();
    }
}
function xhrCheck(key) {
    if(typeof xhrAll[key] == 'undefined' || xhrAll[key] == null) return false;
    return true;
}
$(document).on('reset','form',function(){
    $(this).find(':input').removeClass('is-invalid');
    $(this).find('.is-invalid').removeClass('is-invalid');
    $(this).find('input[type="checkbox"]').prop('indeterminate',false);
    $(this).find('.image-upload .image-preview img').attr('src',baseURL('assets/images/image.svg'));
    $(this).find('.file-preview').html('');
    $(this).find('.file-preview').parent().siblings('input').val('');
    $(this).find('.bootstrap-tagsinput').each(function(){
        var tags = $(this).siblings('input');
        tags.tagsinput('destroy');
        setTimeout(function(){
            tags.tagsinput();
        },200);
    });
    $(this).find('.msg-invalid-form').remove();
    $(this).find('.iconpicker-container').find('.input-group-text').find('i').attr('class','');
});
$(document).on('click','.btn-input',function(e){
    e.preventDefault();
    var t       = $(this);
    var valID   = t.attr('data-val');
    var valKey  = t.attr('data-key');
    if(typeof valID == 'undefined') valID = '';
    if(typeof valKey == 'undefined') valKey = 'id';
    var appLink = t.attr('app-link');
    if(typeof appLink == 'undefined') appLink = 'default';
    var actInput    = window[appLink + 'Input'];
    if(typeof actInput == 'function') {
        actInput(valID, valKey);
    } else {
        var form        = null;
        var haveForm    = false;
        if($('form[app-link="'+appLink+'"]').length > 0) {
            form    = $('form[app-link="'+appLink+'"]').eq(0);
            $('form[app-link="'+appLink+'"]').each(function(){
                var id = $(this).attr('id');
                if(id.indexOf('import') == -1 && !haveForm) {
                    form        = $(this);
                    haveForm    = true;
                }
            });
        } else if($('form').length == 1) {
            form    = $('form').eq(0);
        }
        if(form != null) {
            var ajaxURL = getAppLinkURL(appLink) + '/';
            if(typeof form.attr('action') == 'undefined' || form.attr('action') == '') {
                form.attr('action',ajaxURL + 'save' + getAppLinkURL(appLink,'param'));
                form.attr('method','post');
            }
            if(typeof form.attr('data-callback') == 'undefined') {
                form.attr('data-callback','refreshData:' + appLink);
            }
            form.attr('data-field-ref',valKey);
                if(form.closest('.modal').length == 1) {
                if(form.closest('.modal').find('.modal-title').length > 0) {
                    if(form.closest('.modal').find('.modal-title').find('small').length == 0) {
                        form.closest('.modal').find('.modal-title').append('<small class="subtitle-info"></small>');
                    }
                    var modalSubtitle = form.closest('.modal').find('.modal-title').find('small');
                    if(modalSubtitle.hasClass('subtitle-info')) {
                        if(valID) {
                            modalSubtitle.text(lang.edit_data);
                        } else {
                            modalSubtitle.text(lang.tambah_data);
                        }
                    }
                }
				var leafletOptIndex = null;
				var iLeaflet = 0;
				form.find('[type="radio"].leaflet-control-layers-selector').each(function(){
					if($(this).is(':checked')) {
						leafletOptIndex = iLeaflet;
					}
					iLeaflet++;
				})
                form[0].reset();
				if(leafletOptIndex != null) {
					form.find('[type="radio"].leaflet-control-layers-selector').eq(leafletOptIndex).prop('checked',true);
				}
                form.find(':input').trigger('change');
                form.find('input[type="hidden"]').each(function(){
                    if(typeof $(this).attr('data-value-default') == 'undefined') {
                        $(this).attr('data-value-default',$(this).val());
                    }
                    $(this).val($(this).attr('data-value-default'));
                });
                var modalID         = form.closest('.modal').attr('id');
                var beforeLoad      = window[appLink + 'BeforeLoad'];
                var processLoad     = true;
                var actionLoad;
                if(typeof beforeLoad == 'function') {
                    actionLoad      = beforeLoad(appLink, valID);
                    if(typeof actionLoad == 'boolean') processLoad = actionLoad;
                }
                if($('#' + modalID + ' .editor').length > 0 && typeof window.CKEDITOR != 'undefined') {
                    $('#' + modalID + ' .editor').each(function(){
                        CKEDITOR.instances[$(this).attr('id')].setData('');
                    });
                }
                if(processLoad) {
                    $('#' + modalID + ' .modal-footer-info').addClass('d-none');
                    $('#' + modalID + ' .modal-footer-info').children().attr('aria-label','');
                    if(valID) {
                        var origin_class = t.find('i').attr('class');
                        t.find('i').attr('class','fa-spinner-third fa-spin d-inline-block');
                        t.find('i').attr('data-origin-class',origin_class);
                        if(typeof xhrAll.getData == 'undefined') {
                            xhrAll.getData = null;
                        }
                        if(xhrAll.getData != null) {
                            xhrAll.getData.abort();
                            xhrAll.getData = null;
                        }
                        var dataAjax = {};
                        dataAjax[valKey] = valID;
                        xhrAll.getData = $.ajax({
                            url : ajaxURL + 'get-data'+ getAppLinkURL(appLink,'param'),
                            data : dataAjax,
                            dataType : 'json',
                            method : 'get',
                            success : function(r) {
                                if(typeof r.status != 'undefined' && typeof r.message != 'undefined') {
                                    cAlert.open(r.message, r.status);
                                } else {
                                    form.find(':input').each(function(){
                                        var t = $(this);
                                        var g = typeof t.attr('name') != 'undefined' ? t.attr('name') : '';
                                        var h = g.split('[');
                                        var f = h[0];
                                        var v = r[f];
                                        if(typeof v != 'undefined') {
                                            if(t.prop('tagName') == 'SELECT') {
                                                if(typeof r['opt_' + f] != 'undefined') {
                                                    t.html(r['opt_' + f]);
                                                }
                                                if(typeof t.attr('multiple') != 'undefined') {
                                                    if(typeof v != 'object') {
                                                        v = v.split(',');
                                                    }
                                                    $.each(v,function(kv,vv){
                                                        t.find('[value="'+vv+'"]').prop('selected',true);
                                                    });
                                                    t.trigger('change');
                                                } else {
                                                    t.val(v).trigger('change');
                                                }
                                            } else if(t.attr('type') == 'checkbox') {
                                                if(parseInt(v) == 1 || v == 't' || v == true) {
                                                    t.prop('checked',true);
                                                } else {
                                                    t.prop('checked',false);
                                                }
                                            } else if(t.attr('type') == 'radio') {
                                                if(t.attr('value') == v) {
                                                    t.prop('checked',true);
                                                } else {
                                                    t.prop('checked',false);
                                                }
                                            } else if(t.attr('data-type') == 'upload-image') {
                                                var dataPath = t.attr('data-path');
                                                if(typeof dataPath != 'undefined' && dataPath != '' && v != '' && v !== null) {
                                                    t.siblings('.image-upload').find('img').attr('src',baseURL(dataPath + v + '?' + rand()));
                                                }
                                            } else if(t.attr('data-type') == 'upload-file') {
                                                var dataPath = t.attr('data-path');
                                                if(typeof dataPath != 'undefined' && dataPath != '' && v != '' && v !== null) {
                                                    t.parent().find('.file-preview').html('<a href="'+baseURL('download?resource=' + Base64.encode(dataPath + v))+'" target="_blank">' + v + '</a>');
                                                }
                                            } else if(t.hasClass('input-date') || t.hasClass('input-datetime')) {
                                                t.val(customDate(v)).trigger('change').trigger('keyup');
                                            } else if(t.hasClass('input-currency')) {
                                                var testCur = parseFloat(v);
                                                if(!isNaN(testCur) && testCur > 0) {
                                                    var xv = testCur.toString().split('.');
                                                    var dec = 0;
                                                    if(xv[1] != undefined) {
                                                        dec = xv[1].length;
                                                    }
                                                    v = numberFormat(v,dec,',','.');
                                                }
                                                t.val(v).trigger('change').trigger('keyup');
                                            } else {
                                                t.val(v).trigger('change').trigger('keyup');
                                            }
                                            if(t.hasClass('editor') && typeof window.CKEDITOR != 'undefined') {
                                                CKEDITOR.instances[t.attr('id')].setData(decodeEntities(v));
                                            }

                                            if(t.closest('form').find('[name="last_'+f+'"]').length > 0) {
                                                t.closest('form').find('[name="last_'+f+'"]').val(v);
                                            }
                                        }

                                        if(t.siblings('.bootstrap-tagsinput').length > 0) {
                                            t.tagsinput('destroy');
                                            setTimeout(function(){
                                                t.tagsinput();
                                            },200);                            
                                        }
                                    });
                                    var dataInfo    = '';
                                    if(
                                        typeof r.created_by != 'undefined' &&
                                        typeof r.created_at != 'undefined' &&
                                        (r.created_at != '0000-00-00 00:00:00' && r.created_at != null) &&
                                        r.created_by != ''
                                    ) {
                                        dataInfo += lang.dibuat_oleh + ' ' + r.created_by + ' @ ' + customDate(r.created_at);
                                    } if(
                                        typeof r.updated_by != 'undefined' &&
                                        typeof r.updated_at != 'undefined' &&
                                        (r.updated_at != '0000-00-00 00:00:00' && r.updated_at != null) &&
                                        r.updated_by != ''
                                    ) {
                                        if(dataInfo != '') dataInfo += '\\n';
                                        dataInfo += lang.diedit_terakhir_oleh + ' ' + r.updated_by + ' @ ' + customDate(r.updated_at);
                                    }
                                    if(dataInfo) {
                                        $('#' + modalID + ' .modal-footer-info').removeClass('d-none');
                                        $('#' + modalID + ' .modal-footer-info').children().attr('aria-label',dataInfo).attr('data-tooltip-width','auto');
                                    }
                                    var afterLoad = window[appLink + 'AfterLoad'];
                                    if(typeof afterLoad == 'function') {
                                        afterLoad(r, appLink);
                                    }
                                    modal(modalID).show();
                                    xhrAll.getData = null;
                                }
                            }
                        })
                    } else {
                        modal(modalID).show();
                    }
                }
            }
        }
    }
});
$(document).on('click','.btn-delete',function(e){
    e.preventDefault();
    var valID   = $(this).attr('data-val');
    var valKey  = $(this).attr('data-key');
    if(typeof valID == 'undefined') valID = '';
    if(typeof valKey == 'undefined') valKey = 'id';
    var appLink = $(this).attr('app-link');
    if(typeof appLink == 'undefined') appLink = 'default';
    var actDelete    = window[appLink + 'Delete'];
    if(typeof actDelete == 'function') {
        actDelete(valID, valKey);
    } else {
        var ajaxURL = getAppLinkURL(appLink) + '/delete' + getAppLinkURL(appLink,'param');
        cConfirm.open(lang.apakah_anda_yakin_ingin_menghapus_data_ini+'?','__deleteData',{
            url : ajaxURL,
            valID : valID,
            valKey: valKey,
            appLink : appLink
        });
    }
});
function deleteSelected(val, appLink) {
    var field   = Object.keys(val)[0];
    
    if(typeof field == 'string' && field.trim() != '') {
        var ajaxURL = getAppLinkURL(appLink) + '/delete' + getAppLinkURL(appLink,'param');
        cConfirm.open( val[field].length+' '+lang.data_terpilih+"\n\n" + lang.apakah_anda_yakin_ingin_menghapus_data_ini+'?','__deleteData',{
            url : ajaxURL,
            valID : val[field],
            valKey: field,
            appLink : appLink
        });
    }
}
function getAppLinkURL(appLink,type) {
    var form    = null;
    if($('form[app-link="'+appLink+'"]').length > 0) {
        var form    = $('form[app-link="'+appLink+'"]').eq(0);
        $('form[app-link="'+appLink+'"]').each(function(){
            var id = $(this).attr('id');
            if(id.indexOf('import') == -1) {
                form = $(this);
            }
        });
    } else if($('form').length == 1) {
        var form    = $('form').eq(0);
    }

    var res = '';
    if(type == 'param') {
        if(form != null) {
            var formParam = form.attr('app-link-param');
            if(typeof formParam != 'undefined') {
                res = formParam;
                if(res.charAt(0) != '/' || res.charAt(0) != '-' || res.charAt(0) != '_') {
                    res = '-' + res;
                }
            }
        }
    } else {
        res = baseURL(stringUri());
        if(form != null) {
            var formKey = form.attr('data-key');
            if(typeof formKey != 'undefined') {
                xhrKey  = formKey;
                res = baseURL('general');
            }
        } else {
            if($('table[app-link="'+appLink+'"][data-key]').length > 0) {
                xhrKey  = $('table[app-link="'+appLink+'"][data-key]').attr('data-key');
                res = baseURL('general');
            }
        }
    }
    return res;
}
function __deleteData(params) {
    var data            = {};
    data[params.valKey] = params.valID;
    $.ajax({
        url : params.url,
        data : data,
        dataType : 'json',
        success : function(r) {
            if(r.status == 'success') {
                cAlert.open(r.message,r.status,'refreshData:' + params.appLink);
            } else {
                cAlert.open(r.message,r.status);
            }
        }
    })
}
$(document).on('click','.btn-import',function(){
    var appLink = $(this).attr('app-link');
    if(typeof appLink == 'undefined') appLink = 'default';
    var actImport   = window[appLink + 'Import'];
    if(typeof actImport == 'function') {
        actImport();
    } else {
        var actParam    = '';
        if($(this).attr('app-action-key') != 'undefined') {
            actParam    = '/' + $(this).attr('app-action-key');
        }
        var ajaxURL = getAppLinkURL(appLink) + '/import' + getAppLinkURL(appLink,'param') + actParam;
        var form    = $('.modal form[app-link="'+appLink+'"]').eq(0);
        $('.modal form[app-link="'+appLink+'"]').each(function(){
            var id = $(this).attr('id');
            if(id.indexOf('import') != -1) {
                form = $(this);
            }
        });
        if(typeof form.attr('action') == 'undefined' || form.attr('action') == '') {
            form.attr('action',ajaxURL);
            form.attr('method','post');
        }
        if(typeof form.attr('data-callback') == 'undefined') {
            form.attr('data-callback','refreshData:' + appLink);
        }
        var _modal   = form.closest('.modal');
        if(typeof _modal.attr('id') == 'undefined' || _modal.attr('id') == '') {
            _modal.attr('id','modal-' + rand() + rand());
        }
        var modalID = _modal.attr('id');
        form[0].reset();
        modal(modalID).show();
    }
});
$(document).on('click','.btn-template-import',function(){
    var appLink = $(this).attr('app-link');
    if(typeof appLink == 'undefined') appLink = 'default';
    var actImport   = window[appLink + 'TemplateImport'];
    if(typeof actImport == 'function') {
        actImport();
    } else {
        var actParam    = '';
        if($(this).attr('app-action-key') != 'undefined') {
            actParam    = '/' + $(this).attr('app-action-key');
        }
        var ajaxURL     = getAppLinkURL(appLink) + '/template-import'+ getAppLinkURL(appLink,'param') + actParam;
        window.open(ajaxURL,'_blank');
    }
});
$(document).on('click','.btn-export',function(){
    var appLink = $(this).attr('app-link');
    if(typeof appLink == 'undefined') appLink = 'default';
    var actExport   = window[appLink + 'Export'];
    if(typeof actExport == 'function') {
        actExport();
    } else {
        var actParam    = '';
        if($(this).attr('app-action-key') != 'undefined') {
            actParam    = '/' + $(this).attr('app-action-key');
        }
        var ajaxURL = getAppLinkURL(appLink) + '/export' + getAppLinkURL(appLink,'param') + actParam;
        window.open(ajaxURL,'_blank');
    }
});
$(document).on('select2:open', function() {
    setTimeout(function(){
        if($('.select2-container--open').find('.select2-selection--single').length > 0 && !$('.select2-search__field').parent().hasClass('select2-search--hide')) {
            $('.select2-search__field')[0].focus();
        }    
    },100);
});
$(document).on('click','[data-print]',function(e){
    e.preventDefault();
    var elem = $(this).attr('data-print');
    if($(elem).length > 0) {
        var printHeader     = null;
        var pageTitle       = '';
        var headerTemp      = '';

        if($(this).attr('data-header') != "false" && $('#appinity-print-header').length == 1) {
            // headerTemp     += $('#appinity-print-header').html();
        }

        if($(this).attr('data-title') != 'undefined') {
            headerTemp     += '<div class="mt-2 fw-bold text-uppercase">' + $(this).attr('data-title') + '</div>';
            pageTitle       = $(this).attr('data-title');
        }

        if(headerTemp) {
            printHeader     = '<div class="mb-3">' + headerTemp + '</div>';
        }

        $(elem).printThis({
            header: printHeader,
            pageTitle: pageTitle
        });
    }
});

function printData(html,header) {
    var printHeader = null;
    if(html == undefined) html = '';
    if(header == undefined) header = true;
    if(header !== false && $('#appinity-print-header').length == 1) {
        printHeader     = '<div class="mb-3">' + $('#appinity-print-header').html() + '</div>';
    }
    $('body').append('<div id="temp-print-data" style="z-index:-1;">'+html+'</div>');
    $('#temp-print-data').printThis({
        header: printHeader,
        afterPrint: function() {
            $('#temp-print-data').remove();
        }
    })
}
function ckeditorInit() {
    if(typeof window.CKEDITOR !== 'undefined') {
        $('textarea.editor').each(function(){
            $(this).closest('.modal').attr('data-bs-focus',false);
            CKEDITOR.replace( $(this).attr('id') ,{
                toolbar : [
                    { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
                    { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                    { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll' ] },
                    '/',
                    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
                    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
                    { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                    { name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
                    { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
                    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                    { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] }
                ],
                filebrowserBrowseUrl : baseURL('filemanager/filemanager/dialog.php?type=2&editor=ckeditor&fldr='),
                filebrowserUploadUrl : baseURL('filemanager/filemanager/dialog.php?type=2&editor=ckeditor&fldr='),
                filebrowserImageBrowseUrl : baseURL('filemanager/filemanager/dialog.php?type=1&editor=ckeditor&fldr='),
                width : 'auto',
                height : 300
            });
        })
    }
}
function badgeParent() {
	$('.have-badge').removeClass('have-badge');
	$('.list-menu .badge.badge-danger').each(function(){
		var p1 = $(this).closest('ul');
		var p2 = p1.parent().closest('ul');
		var jml1 = 0;
		p1.find('.badge.badge-danger').each(function(){
			jml1 += parseInt($(this).text());
		});
		if(jml1 > 0) {
			p1.siblings('a').addClass('have-badge');
			p2.siblings('a').addClass('have-badge');
		}
	});
}
