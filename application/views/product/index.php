<div class="card">
	<div class="card-body">
		<h3 class="fw-bold"><?= $title; ?></h3>
		<div id="data-control" class="d-flex mb-2">
			<div class="ms-auto">
				<a href="base_url{produk}" class="btn btn-info"><i class="fa-list me-2"></i>CRUD Versi Modal</a>
				<a href="base_url{product/form}" class="btn btn-success"><i class="fa-plus me-2"></i>Tambah Data</a>
			</div>
		</div>
		<app-card class="mb-3">
			<div class="row">
				<div class="col-md-3">
					<app-select class="select2" name="sort_by">
						<option value="">Sort By</option>
						<option value="name">Produk</option>
						<option value="price">Harga</option>
            			<option value="stock">Stok</option>
					</app-select>
				</div>
				<div class="col-md-3">
					<app-select class="select2" name="sort_order" data-search="false">
						<option value="">Sort Order</option>
						<option value="asc">Ascending (A-Z / Terkecil)</option>
            			<option value="desc">Descending (Z-A / Terbesar)</option>
					</app-select>
				</div>
				<div class="col-md-3">
					<app-select class="select2" name="filter_status">
						<option value="">Semua Status</option>
						<?php foreach ($status as $k => $s) { ?>
							<option value="<?= $k; ?>"><?= $s; ?></option>
						<?php } ?>
					</app-select>
				</div>
				<div class="col-md-3">
					<app-input name="search" placeholder="Cari Produk" />
				</div>
			</div>
		</app-card>
		<app-card>
			<div class="table-responsive">
				<table class="table table-stripped" id="table-product" style="vertical-align: middle;">
					<thead>
						<tr>
							<th width="20" class="text-center">No</th>
							<th>Nama Produk</th>
							<th class="text-end">Harga Produk</th>
							<th class="text-center" width="80">Stok</th>
							<th class="text-center" width="120">Status Produk</th>
							<th class="text-center" width="120">Aksi</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</app-card>
	</div>
</div>
<script data-inline data-unminify>
	var xhrGetData = null;

	function _getData() {
		var sortBy = $('#sort_by').val();
		var sortOrder = $('#sort_order').val();
		var filterStatus = $('#filter_status').val();
		var search = $('#search').val();

		if (xhrGetData !== null) {
			xhrGetData.abort();
			xhrGetData = null;
		}

		$(".notification-loader").remove();
		$('#table-product tbody').html('');
		$("#table-product tbody").prepend('<tr>' +
			'<td colspan="6">' +
			'<div class="notification-loader"><i class="fa-spinner-third fa-spin d-inline-block"></i></div>' +
			'</td>' +
		'</tr>');

		xhrGetData = $.ajax({
			url: baseURL('product/get-data'),
			data: {
				'sort_by': sortBy,
				'sort_order': sortOrder,
				'search': search,
				'filter_status': filterStatus
			},
			dataType: 'json',
			success: function(r) {
				$(".notification-loader").remove();
                $('#table-product tbody').html('');
				xhrGetData = null;
				var result = '';
				if (r.data.length > 0) {
					$.each(r.data, function(k, v) {
						var No = k + 1;
						var statusProduk = parseInt(v.is_sell) ? '<div class="badge bg-primary">Dijual</div>' : '<div class="badge bg-danger">Tidak Dijual</div>';
						result += '<tr>' +
							'<td class="text-center">' + No + '</td>' +
							'<td>' + v.name + '</td>' +
							'<td class="text-end">' + customFormat(v.price) + '</td>' +
							'<td class="text-center">' + v.stock + '</td>' +
							'<td class="text-center">' + statusProduk + '</td>' +
							'<td class="text-center">'+
								'<button class="btn btn-warning btn-sm btn-edits me-1" data-val="'+v.id+'" data-appinity-tooltip="top" data-context-key="edit" aria-label="Edit"><i class="fa-edit"></i></button>'+
								'<button class="btn btn-danger btn-sm btn-deletes" data-val="'+v.id+'" data-appinity-tooltip="top" data-context-key="hapus" aria-label="Hapus"><i class="fa-trash-alt"></i></button>'+
							'</td>' +
						'</tr>';
					});
				} else {
					result = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
				}

				$('#table-product tbody')[0].innerHTML = result;
			}
		});
	}

	$(document).on('click', '.btn-edits', function(e) {
		e.preventDefault();
		var ids = $(this).attr('data-val');
		window.location.href = baseURL('product/form/'+ids);
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
				cAlert.open(r.message, r.status, 'reload');
			}
		});
	}

	$(document).ready(function() {
		_getData();

		$('#sort_by, #sort_order').change(function() {
			_getData();
		});

		$('#filter_status').change(function() {
			_getData();
		});

		$('#search').on('input', function() {
			_getData();
		});
	});
</script>
