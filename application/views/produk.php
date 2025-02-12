<div class="card">
	<div class="card-body">
		<h3 class="fw-bold">Data Produk</h3>
		<div id="data-control" class="d-flex mb-2">
			<div class="ms-auto">
				<button class="btn btn-success btn-input" type="button" app-link="default" data-key="id"><i class="fa-plus me-2"></i>Tambah Data</button>
			</div>
		</div>
		<app-table source="produk/data" data-height="560" data-action-select="defaultControl" table="products" class="__appinity__">
			<thead>
				<tr>
					<th max-width="300" data-content="name">Nama Produk</th>
					<th max-width="200" data-content="price">Harga Produk</th>
					<th max-width="200" data-content="stock">Jumlah Stok</th>
					<th data-sort="false" data-content="is_sell" data-filter="filter-status" class="text-center">Status Produk</th>
					<th data-content="button" width="90" class="text-center">Aksi</th>
				</tr>
			</thead>
		</app-table>
		<div data-action-id="defaultControl">
			<button class="btn btn-danger" data-action="deleteSelected"><i class="fa-trash-alt"></i> Hapus</button>
		</div>
	</div>
</div>
<ul data-filter-id="filter-status">
    <li data-value=""></li>
	<li data-value="0"><div class="badge bg-danger">Tidak Dijual</div></li>
	<li data-value="1"><div class="badge bg-primary">Dijual</div></li>
</ul>