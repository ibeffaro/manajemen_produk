	var xhrGetData = null;

    function _getData() {
        var search = $('#search').val();
        var filterStatus = $('#filter_status').val();
        if (xhrGetData !== null) {
            xhrGetData.abort();
            xhrGetData = null;
        }
		$(".notification-loader").remove();
        $("#table-product tbody").prepend('<tr>'+
            '<td colspan="6">'+
                '<div class="notification-loader"><i class="fa-spinner-third fa-spin d-inline-block"></i></div>'+
            '</td>'+
        '</tr>');
        xhrGetData = $.ajax({
            url: baseURL('product/get-data'),
            data: {
                'search': search,
                'filter_status': filterStatus
            },
            dataType: 'json',
            success: function(r) {
                xhrGetData = null;
				$(".notification-loader").remove();
                var result = '';
                if (r.data.length > 0) {
                    $.each(r.data, function(k,v){
                        let No  = k + 1;
                        result	+= '<tr>' +
                                    '<td class="text-center">'+ No +'</td>' +
                                    '<td>'+ customDate(tanggal) +'</td>' +
                                    '<td class="text-end">'+v.marketing+'</td>' +
                                    '<td class="text-center">'+v.jml_crm+'</td>' +
                                    '<td class="text-center">'+v.jml_pribadi+'</td>' +
                                    '<td class="text-center">'+0+'</td>' +
                                '</tr>';
                    });
                } else {
                    result = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
                }

                $('#table-product tbody')[0].innerHTML = result;
            }
        });

		$(document).ready(function(){
			console.log('ibef');
			_getData();
		});
    }