<div class="card">
	<div class="card-body">
		<h3 class="fw-bold"><?= $title; ?></h3>
		<div id="data-control" class="d-flex mb-2">
			<div class="ms-auto">
				<a href="<?= base_url('produk'); ?>" class="btn btn-info"><i class="fa-list me-2"></i>CRUD Versi Modal</a>
				<button class="btn btn-success btn-input" type="button" app-link="default" data-key="id"><i class="fa-plus me-2"></i>Tambah Data</button>
			</div>
		</div>
		<app-card class="mb-3">
			<div class="row">
				<div class="col-md-6">
					<app-input name="search" placeholder="Cari Produk" size="12" />
				</div>
				<div class="row col-md-6">
					<app-select class="select2" name="filter_status" size="12">
						<option value="">Semua Status</option>
						<?php foreach ($status as $k => $s) { ?>
							<option value="<?= $k; ?>"><?= $s; ?></option>
						<?php } ?>
					</app-select>
				</div>
			</div>
		</app-card>
		<app-card>
			<div class="table-responsive">
				<table class="table table-bordered" id="table-product">
					<thead>
						<tr>
							<th width="20" class="text-center">No</th>
							<th>Nama Produk</th>
							<th class="text-end">Harga Produk</th>
							<th class="text-center">Stok</th>
							<th class="text-center">Status Produk</th>
							<th class="text-center">Aksi</th>
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
		var search = $('#search').val();
		var filterStatus = $('#filter_status').val();
		if (xhrGetData !== null) {
			xhrGetData.abort();
			xhrGetData = null;
		}
		$(".notification-loader").remove();
		$("#table-product tbody").prepend('<tr>' +
			'<td colspan="6">' +
			'<div class="notification-loader"><i class="fa-spinner-third fa-spin d-inline-block"></i></div>' +
			'</td>' +
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
					$.each(r.data, function(k, v) {
						let No = k + 1;
						result += '<tr>' +
							'<td class="text-center">' + No + '</td>' +
							'<td>' + customDate(tanggal) + '</td>' +
							'<td class="text-end">' + v.marketing + '</td>' +
							'<td class="text-center">' + v.jml_crm + '</td>' +
							'<td class="text-center">' + v.jml_pribadi + '</td>' +
							'<td class="text-center">' + 0 + '</td>' +
							'</tr>';
					});
				} else {
					result = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
				}

				$('#table-product tbody')[0].innerHTML = result;
			}
		});
	}

	$(document).ready(function() {
		_getData();
	});
</script>