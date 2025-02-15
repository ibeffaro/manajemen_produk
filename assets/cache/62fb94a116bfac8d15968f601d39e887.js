$('#form-inputs').submit(function(e){
        e.preventDefault();

        var validateName  = $('input[name="name"]').val();
        var validatePrice = $('input[name="price"]').val();
        var validateStock = $('input[name="stock"]').val();

        if (!validateName) {
            cAlert.open('Nama harus di isi');
            return false;
        }

        if (!validatePrice) {
            cAlert.open('Harga harus di isi');
            return false;
        }

        if (!validateStock) {
            cAlert.open('Stok harus di isi');
            return false;
        }

        var xhrRpt = null;
        
        if(xhrRpt != null) {
            xhrRpt.abort();
            xhrRpt = null;
        }
        
        xhrRpt = $.ajax({
            url : baseURL('product/save'),
            data : $(this).serialize(),
            type : 'post',
            dataType : 'json',
            success : function(r) {                
				cAlert.open(r.message, r.status, 'redirect:'+r.href);
            }
        })
    });

    $(document).on('click', '.btn-deletes', function(e) {
		e.preventDefault();
		var ids = $(this).attr('data-val');
		cConfirm.open('Apakah yakin untuk menghapus data ini?', 'destroyData', {
			id: ids
		});
	});

	function destroyData(ids) {
		$.ajax({
			url: baseURL('product/destroy'),
			data: {
				id: ids
			},
			type: 'post',
			dataType: 'json',
			success: function(r) {
				cAlert.open(r.message, r.status, 'redirect:'+r.href);
			}
		});
	}