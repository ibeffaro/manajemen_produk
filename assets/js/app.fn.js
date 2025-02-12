var xhrAll				= {};
var base_url			= '';
var max_upload_filesize = 0;
var modalList			= {};
var shortcutDelay		= null;
const Base64  			= {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
const stopBrowserBack = callback => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
        window.history.pushState(null, "", window.location.href);
        if(typeof callback == "function") {
            callback();
        }
    };
};
const startBrowserBack = () => {
    if($(window).width() <= 768) {
		window.onpopstate = undefined;
	    window.history.back();
	}
};
const appinityToken = {
	requestToken : function() {
		var appToken	= $('meta[name="app-token"]').attr('content');
		var clientToken	= $('meta[name="client-token"]').attr('content');
		var keyToken	= Base64.decode(appToken).replace('?!&$' + clientToken,'');
		if(typeof keyToken != Base64.decode(appToken)) {
			var key		= decodeId(keyToken)[0];
			var id		= decodeId(clientToken, 'app-' + key);
			if(id.length == 2) {
				id.push(key);
				return Base64.encode(encodeId(id));
			}
		}
		return '';
	},
	clientToken : function() {
		var appToken	= $('meta[name="app-token"]').attr('content');
		var clientToken	= $('meta[name="client-token"]').attr('content');
		var keyToken	= Base64.decode(appToken).replace('?!&$' + clientToken,'');
		if(typeof keyToken != Base64.decode(appToken)) {
			return keyToken;
		}
		return '';
	}
}
function reload() {
    window.location.reload();
}
function redirect(e) {
	if(typeof e == 'string') {
		window.location.href = e;
	} else {
		window.location.reload();
	}
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    if(typeof exdays == 'undefined') exdays = 365;
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}
function validation(e) {
	var valid 			= true;
	e.find('[data-validation]:enabled').each(function(){
		var $t 			= $(this);
		var validate	= $t.attr('data-validation');
		var spl 		= validate.split('|');
		var m 			= '';
		if($(this).closest('.hidden').length == 0) {
			$.each(spl,function(i,d){
				var v 		= d.split(':');
				var t 		= v[0];
				var l 		= typeof v[1] == 'undefined' ? 0 : parseFloat(v[1]);
				var n 		= getInputLabel($t);
				var vl 		= $t.val();
				var int_v 	= vl == null || $.isArray(vl) ? '' : vl.replaceAll('.','').replaceAll(',','.');
				var int_val	= parseFloat(int_v);
				if (isNaN(l)) l = v[1];
				var req_val = typeof $t.val() == 'string' ? $t.val().trim() : $t.val();
				if(t == 'required' && (($t.val() != null && req_val.length == 0) || $t.val() == null) && m == '') {
					m 		= '<strong>' + n + '</strong> ' + lang.harus_diisi;
				}
				else if(t == 'strong_password' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re 	= /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.msg_strong_password;
					}
				}
				else if(t == 'email' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re 	= /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.harus_diisi_format_email + ' (ex@email.xx)';
					}
				}
				else if(t == 'phone' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.harus_diisi_format_nomor_telepon;
					}
				}
				else if(t == 'numeric' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re 	= /^[0-9.,]+$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.harus_diisi_format_angka;
					}
				}
				else if(t == 'letter' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re = /^[a-zA-Z_\-]+$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.harus_diisi_format_huruf;
					}
				}
				else if(t == 'alphanumeric' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re = /^[0-9a-zA-Z_\-]+$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> ' + lang.harus_diisi_format_huruf_atau_angka;
					}
				}
				else if(t == 'username' && m == '' && ($t.val() != null && $t.val().length != 0)) {
					var re = /^[0-9a-zA-Z.,_\-]+$/;
					if(!re.test($t.val())) {
						m 	= '<strong>' + n + '</strong> Format tidak valid';
					}
				}
				else if(t == 'length' && $t.val().length != l && m == '' && ($t.val() != null && $t.val().length != 0)) {
					m 		= '<strong>' + n + '</strong> ' + lang.harus + ' ' + l + ' ' + lang.karakter;
				}
				else if(t == 'min-length' && $t.val().length < l && m == '' && ($t.val() != null && $t.val().length != 0)) {
					m 		= '<strong>' + n + '</strong> ' + lang.minimal + ' ' + l + ' ' + lang.karakter;
				}
				else if(t == 'max-length' && $t.val().length > l && m == '' && ($t.val() != null && $t.val().length != 0)) {
					m 		= '<strong>' + n + '</strong> ' + lang.maksimal + ' ' + l + ' ' + lang.karakter;
				}
				else if(t == 'equal' && m == '' && $t.closest('form').find('[name="'+l+'"]').length == 1 && $t.val() != $t.closest('form').find('[name="'+l+'"]').val() ) {
					if(typeof $t.closest('form').find('[name="'+l+'"]').closest('.form-group').attr('class') != 'undefined') {
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_cocok_dengan + ' ' + $t.closest('form').find('[name="'+l+'"]').closest('.form-group').children('label').text();
					} else if(typeof $t.closest('form').find('[name="'+l+'"]').attr('aria-label') != 'undefined'){
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_cocok_dengan + ' ' + $t.closest('form').find('[name="'+l+'"]').attr('aria-label');
					} else if(typeof $('label[for="'+l+'"]').attr('for') != 'undefined') {
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_cocok_dengan + ' ' + $('label[for="'+l+'"]').text();
					} else {
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_cocok_dengan + ' ' + l;					
					}
				}
				else if(t == 'min' && !isNaN(int_val) && int_val < l) {
					var lView = $t.hasClass('input-currency') ? customFormat(l) : l;
					if($t.hasClass('input-currency') && $t.attr('data-decimal') != undefined && !isNaN(parseInt($t.attr('data-decimal')))) {
						lView = numberFormat(l,parseInt($t.attr('data-decimal')),',','.');
					}
					m 		= '<strong>' + n + '</strong> ' + lang.tidak_boleh_kurang_dari + ' ' + lView;
				}
				else if(t == 'max' && !isNaN(int_val) && int_val > l) {
					var lView = $t.hasClass('input-currency') ? customFormat(l) : l;
					if($t.hasClass('input-currency') && $t.attr('data-decimal') != undefined && !isNaN(parseInt($t.attr('data-decimal')))) {
						lView = numberFormat(l,parseInt($t.attr('data-decimal')),',','.');
					}
					m 		= '<strong>' + n + '</strong> ' + lang.tidak_boleh_lebih_dari + ' ' + lView;
				}
				if(!m && $t.attr('min') != undefined) {
					var min = parseFloat($t.attr('min'));
					if(!isNaN(int_val) && int_val < min) {
						var lView = $t.hasClass('input-currency') ? customFormat(min) : min;
						if($t.hasClass('input-currency') && $t.attr('data-decimal') != undefined && !isNaN(parseInt($t.attr('data-decimal')))) {
							lView = numberFormat(min,parseInt($t.attr('data-decimal')),',','.');
						}
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_boleh_kurang_dari + ' ' + lView;
					}
				}
				if(!m && $t.attr('max') != undefined) {
					var max = parseFloat($t.attr('max'));
					if(!isNaN(int_val) && int_val > max) {
						var lView = $t.hasClass('input-currency') ? customFormat(max) : max;
						if($t.hasClass('input-currency') && $t.attr('data-decimal') != undefined && !isNaN(parseInt($t.attr('data-decimal')))) {
							lView = numberFormat(max,parseInt($t.attr('data-decimal')),',','.');
						}
						m 		= '<strong>' + n + '</strong> ' + lang.tidak_boleh_kurang_dari + ' ' + lView;
					}
				}
			});
			if(m) {
				valid 		= false;
				if($t.parent().hasClass('input-group')) {
					if($t.parent().parent().find('span.msg-invalid-form').length == 0) {
						$t.addClass('is-invalid');
						$t.parent().parent().append('<span class="msg-invalid-form headShake">' + m + '</span>');
						setTimeout(function(){
							$t.parent().parent().find('.msg-invalid-form').removeClass('headShake');
						},500);
					} else {
						$t.parent().parent().find('.msg-invalid-form').addClass('headShake');
						setTimeout(function(){
							$t.parent().parent().find('.msg-invalid-form').removeClass('headShake');
						},500);
					}
				} else {
					if($t.parent().find('span.msg-invalid-form').length == 0) {
						$t.addClass('is-invalid');
						if($t.parent().children('span.select2').length == 1) {
							$t.parent().children('span.select2').addClass('is-invalid');
						}
						$t.parent().append('<span class="msg-invalid-form headShake">' + m + '</span>');
						setTimeout(function(){
							$t.parent().find('.msg-invalid-form').removeClass('headShake');
						},500);
					} else {
						$t.parent().find('.msg-invalid-form').addClass('headShake');
						setTimeout(function(){
							$t.parent().find('.msg-invalid-form').removeClass('headShake');
						},500);
					}
				}
			}
		}
	});
	if(!valid) {
		e.find('.is-invalid').first().focus();
		if(e.find('.tab-content').length > 0) {
			var paneTarget = e.find('.is-invalid').first().closest('.tab-pane').attr('id');
			e.find('.tab-pane').removeClass('active').removeClass('show');
			e.find('.nav-link').removeClass('active');
			$('#' + paneTarget).addClass('active').addClass('show');
			$('[data-bs-target="#'+paneTarget+'"]').addClass('active');
		}
		return false;
	} else {
		return true;
	}
}
function getInputLabel($t) {
	var n = '';
	if(typeof $t.attr('aria-label') == 'undefined') {
		if(typeof $t.attr('placeholder') == 'undefined' || $t.attr('placeholder') == '' || $t.hasClass('input-date') || $t.hasClass('input-daterange') || $().hasClass('input-datetime')) {
			if(typeof $t.attr('id') != 'undefined' && typeof $('[for="' + $t.attr('id') + '"]').text() != 'undefined') {
				n 		= $('[for="' + $t.attr('id') + '"]').text();
			} 
			if($t.closest('.form-group').children('label').length == 1 && (n == '')) {
				n 		= $t.closest('.form-group').children('label').text();
			}
		} else {
			n = $t.attr('placeholder');
		}
	} else {
		n = $t.attr('aria-label');
	}
	return n;
}
function initValidation() {
	$('[data-validation]').each(function(){
		var x = $(this).attr('data-validation');
		var y = x.split('|');

		if(inArray('numeric',y)) {
			$(this).addClass('text-numeric');
		}
	});
}
function stringUri() {
	if($('meta[name="string-uri"]').length > 0) {
		return $('meta[name="string-uri"]').attr('content');
	}
	return '';
}
$(document).ready(function(){
	if($('meta[name="base-url"]').length > 0) {
		base_url = $('meta[name="base-url"]').attr('content');
	} else {
		base_url = window.location.origin;
	}
	if($('meta[name="m-upl-size"]').length > 0) {
		max_upload_filesize = $('meta[name="m-upl-size"]').attr('content');
	}
});
$(document).on('change','[data-validation]',function(){
	if(($(this).hasClass('is-invalid') || $(this).parent().parent().find('span.msg-invalid-form').length > 0) && $(this).val() != '') {
		$(this).removeClass('is-invalid');
		if($(this).parent().hasClass('input-group')) {
			$(this).parent().parent().find('span.msg-invalid-form').remove();
		} else {
			$(this).parent().find('span.msg-invalid-form').remove();
			if($(this).parent().children('span.select2').length == 1) {
				$(this).parent().children('span.select2').removeClass('is-invalid');
			}
		}
	}
});
$(document).on('keyup','[data-validation]',function(){
	$(this).trigger('change');
});
$(document).on('keypress','input.text-numeric',function(e){
	var wh 			= e.which;
	if (e.shiftKey) {
		if(wh == 0) return true;
	}
	if(e.metaKey || e.ctrlKey) {
		if(wh == 86 || wh == 118) {
			$(this)[0].onchange = function(){
				$(this)[0].value = $(this)[0].value.replace(/[^0-9]/g, '');
			}
		}
		return true;
	}
	if(wh == 0 || wh == 8 || wh == 13 || wh == 32 || wh == 44 || wh == 46 || (48 <= wh && wh <= 57)) 
		return true;
	return false;
});
$(document).keydown(function(e){
	var k	= e.which; // a = 65 -> z = 90	
	var t 	= e.target;

	if($(t).is(':focus') && $(t).closest('tr').length == 1 && e.ctrlKey) {
		var tr = $(t).closest('tr');
		if(e.ctrlKey && e.shiftKey) {
			if(k == 40) { // arrow down
				if($(t).closest('table').children('thead').find('button').length == 1) {
					$(t).closest('table').children('thead').find('button').trigger('click');
					tr.siblings().last().find(':input:not(button)')[0].focus();
				}
			}
		} else if(e.ctrlKey) {
			var el = null;
			if(k == 38) { // arrow top
				el = $(t).closest('tr').prev();
			} else if(k == 40) { // arrow down
				el = $(t).closest('tr').next();
				console.log($(t).closest('tr'));
			} else if(k == 37) { // arrow down
				el = $(t).closest('td').prev();
			} else if(k == 39) { // arrow down
				el = $(t).closest('td').next();
			}
			if(el !== null) {
				if(el.prop('tagName') == 'TR') {
					el.find(':input:not(button)').first()[0].focus();
				} if(el.prop('tagName') == 'TD') {
					el.find(':input')[0].focus();
				}
			}
		}
	}
	
	if(e.ctrlKey && e.altKey && $('#main-panel').length > 0) {
		if(k >= 65 && k <= 90) {
			if(k == 65) window.location = baseURL('account/profile');	// a => untuk ke halaman profil
			else if(k == 70) $('#app-search-input').focus();			// f => untuk fokus ke pencarian
			else if(k == 73) window.location = baseURL('notification'); // i => untuk ke halaman notifikasi
			else if(k == 77) $('.toggle-menu').click();					// m => untuk toggle menu
			else if(k == 78) $('.btn-input:not([data-val])').click();	// n => untuk tambah baru
			else if(k == 80) window.location = baseURL('account/change-password'); // p => untuk ke halaman password
			else if(k == 82) $('.toggle-right-panel').click();			// r => untuk toggle right panel
			else if(k == 83) {											// s => untuk mode bayang
				var idxDisplay = 0;
				$('.display-design').each(function(){
					if($(this).hasClass('active')) {
						idxDisplay = $(this).index('.display-design');
					}
				});
				var nextIdx = idxDisplay + 1;
				if($('.display-design').eq(nextIdx).length == 1) {
					$('.display-design').eq(nextIdx).click();
				} else {
					$('.display-design').eq(0).click();
				}
			} else if(k == 84) {										// t => untuk mode gelap
				var idxDisplay = 0;
				$('.display-theme').each(function(){
					if($(this).hasClass('active')) {
						idxDisplay = $(this).index('.display-theme');
					}
				});
				var nextIdx = idxDisplay + 1;
				if($('.display-theme').eq(nextIdx).length == 1) {
					$('.display-theme').eq(nextIdx).click();
				} else {
					$('.display-theme').eq(0).click();
				}
			}
			else if(k == 88) cConfirm.open(lang.apakah_anda_ingin_keluar,'redirect:' + baseURL('auth/logout'));	// x => untuk logout
			else if(k == 90) {											// z => untuk close modal / swal
				closeModal();
				if(typeof swal !== 'undefined' && $('.swal-overlay--show-modal').length > 0) {
					swal.close();
				}
			}
		} else {
			var info	= 	'<div class="app-shortcut">' +
								'<div class="row">' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>A</span></div> '+lang.halaman_profil+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>F</span></div> '+lang.pencarian+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>I</span></div> '+lang.halaman_pemberitahuan+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>M</span></div> '+lang.memperkecil_memperbesar_menu+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>N</span></div> '+lang.tambah_data+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>P</span></div> '+lang.halaman_ubah_kata_sandi+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>R</span></div> '+lang.tampilkan_sembunyikan_panel_kanan+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>S</span></div> '+lang.mode_bayang_mode_datar+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>T</span></div> '+lang.ganti_tema+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>X</span></div> '+lang.keluar+'</div>' +
									'<div class="col-sm-4 col-md-3 col-lg-2 p-2"><div class="app-shortcut-key"><span>CTRL</span> + <span>ALT</span> + <span>Z</span></div> '+lang.tutup_modal+'</div>' +
								'</div>' +
							'</div>';
			if($('.app-shortcut').length == 0 && shortcutDelay == null) {
				shortcutDelay	= setTimeout(function(){
					$('body').append(info);
				}, 1000);
			}
			$(document).keyup(function(){
				clearTimeout(shortcutDelay);
				shortcutDelay = null;
				$('.app-shortcut').remove();
			});
		}
		return false;
	}
});
function modal(id) {
	if(typeof modalList[id] == 'undefined') {
		modalList[id]	= new bootstrap.Modal(document.getElementById(id), {
			keyboard: false,
			backdrop: 'static'
		});

		var mdl	= document.getElementById(id);
		mdl.addEventListener('shown.bs.modal', function (event) {
			$('#' + id).find(':input:not([disabled]):not([readonly]):not([type=hidden]):not(button)').first().focus();
		});
	}
	return modalList[id];
}
function closeModal() {
	$('.modal.show').each(function(){
		modal($(this).attr('id')).hide();
	});
}
function baseURL(string) {
	if(typeof string != "string") string = '';
	return base_url + string;
}
function rand(min, max) {
	if(typeof min != 'undefined' && typeof max != 'undefined') {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	} else {
		return Math.floor(Math.random() * (9999 - 1000 + 1)) + 100;
	}
}
function pregMatchAll(regex, string) {
	var rx		= new RegExp( regex );
	var txt		= string;
	var mtc0	= [];
	var mtc1	= [];
	while( (match = rx.exec( txt )) != null ) {
        mtc0.push(match[0]);
        mtc1.push(match[1].trim());
		txt = txt.replace(match[0]);
	}
	return [mtc0, mtc1];
}
function reload() {
	window.location.reload();
}
function numberFormat(e, c, d, t, z){
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
function customFormat(str) {
	return numberFormat(str,0,',','.');
}
function moneyToNumber(str) {
	if(str == '') {
		return 0;
	} else {
		return parseFloat(str.replace(/\./g,'').replaceAll(',','.'));
	}
}
function toNumber(str) {
	str = str.replace(',','.');
	if(str == '' || isNaN(str)) {
		return 0;
	} else {
		return parseFloat(str);
	}
}
function curDate() {
	var d = new Date,
	dformat = [d.getFullYear(),
		      (d.getMonth()+1).padLeft(),
               d.getDate().padLeft()].join('-') +' ' +
              [d.getHours().padLeft(),
               d.getMinutes().padLeft(),
			   d.getSeconds().padLeft()].join(':');
	return dformat;
}
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
function customDate(e,timeFormat) {
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
function cPercent(str) {
	var x = str.split('.');
	var result = '';
	if(x.length == 2) {
		if(parseInt(x[1]) == 0) {
			result = x[0];
		} else {
			result = str.replace('.',',');
		}
	}
	return result;
}
function encodeId(e, encode_key) {
	if(typeof encode_key == 'undefined') {
		encode_key = $('meta[name="app-number"]').attr('content');
	}
	var hashids_init = new Hashids(encode_key);
	var id = parseInt(e);
	var encode_id = '';
	if(typeof e == 'object') {
		encode_id = hashids_init.encode(e);
	} else {
		encode_id = hashids_init.encode(id, Math.floor(Math.random() * (9999 - 1000 + 1)) + 100 );
	}
	return encode_id;
}
function decodeId(e, encode_key) {
	if(typeof encode_key == 'undefined') {
		encode_key = $('meta[name="app-number"]').attr('content');
	}
	var hashids_init = new Hashids(encode_key);
	var decode_id = hashids_init.decode(e);
	return decode_id;
}
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
