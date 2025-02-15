<div class="card">
	<div class="card-body">
		<h3 class="fw-bold"><?= $title; ?></h3>
		<div id="data-control" class="d-flex mb-2">
			<div class="ms-auto">
				<a href="base_url{}" class="btn btn-info"><i class="fa-list me-2"></i>CRUD Versi Redirect</a>
				<button class="btn btn-success btn-input" type="button" app-link="default" data-key="id"><i class="fa-plus me-2"></i>Tambah Data</button>
			</div>
		</div>
		<app-table source="produk/data" data-height="560" data-action-select="defaultControl" table="products" class="__appinity__">
			<thead>
				<tr>
					<th max-width="300" data-content="name">Nama Produk</th>
					<th max-width="200" data-content="price" class="text-end" data-type="currency">Harga Produk</th>
					<th max-width="200" data-content="stock" class="text-center">Jumlah Stok</th>
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
	<li data-value="0">
		<div class="badge bg-danger">Tidak Dijual</div>
	</li>
	<li data-value="1">
		<div class="badge bg-primary">Dijual</div>
	</li>
</ul>
<app-modal title="<?= $title; ?>" id="modal-form">
	<form id="form" app-link="default" autocomplete="off">
		<app-input type="hidden" name="id" />
		<app-input-default size="3:9" />
		<app-input type="text" name="name" label="Nama" validation="required" />
		<app-input type="currency" name="price" label="Harga" prefix="Rp." validation="required" size="3:5" />
		<app-input type="number" name="stock" label="Stok" validation="required" size="3:5" />
		<app-select class="select2" name="is_sell" label="Status">
			<?php foreach ($status as $k => $v) { ?>
				<option value="<?= $k; ?>"><?= $v; ?></option>
			<?php } ?>
		</app-select>
	</form>
	<footer-form />
</app-modal>