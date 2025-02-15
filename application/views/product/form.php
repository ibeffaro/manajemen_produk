<div class="card">
	<div class="card-body">
		<h3 class="fw-bold"><?= $title; ?></h3>
		<div class="d-flex mb-4"></div>
		<app-card title="<?= $subtitle; ?>">
            <form id="form-inputs" autocomplete="off">
                <app-input type="hidden" name="id" value="<?= isset($data->id) && $data->id ? $data->id : ''; ?>" />
                <app-input-default size="2:10" />
                <app-input type="text" name="name" label="Nama" validation="required" value="<?= isset($data->name) && $data->name ? $data->name : ''; ?>" />
                <app-input type="currency" name="price" label="Harga" prefix="Rp." validation="required" size="2:4" value="<?= isset($data->price) && $data->price ? return_currency($data->price) : ''; ?>" />
                <app-input type="number" name="stock" label="Stok" validation="required" size="2:4" value="<?= isset($data->stock) && $data->stock ? $data->stock : ''; ?>" />
                <app-select class="select2" name="is_sell" label="Status">
                    <?php foreach ($status as $k => $v) { ?>
                        <option value="<?= $k; ?>" <?= isset($data->is_sell) && $data->is_sell == $k ? 'selected' : ''; ?>><?= $v; ?></option>
                    <?php } ?>
                </app-select>
                <div class="row mt-4">
                    <label for="submit" class="col-md-2 form-label">&nbsp;</label>
                    <div class="col-md-10">
                        <button type="submit" class="btn btn-app btn-sm">Simpan</button>
                        <?php if (isset($data->id) && $data->id) { ?>
                            <button class="btn btn-danger btn-sm btn-deletes" data-val="<?= $data->id; ?>">Hapus</button>
                        <?php } ?>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="history.back()">Kembali</button>
                    </div>
                </div>
            </form>
		</app-card>
	</div>
</div>
<script>

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

</script>