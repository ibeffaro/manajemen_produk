<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Produk extends MY_Controller
{

	public function index()
	{
		redirect('produk/list');
	}

	public function list() {
		$data['title'] 	= 'Data Produk';
		$data['status'] = [1 => 'Dijual', 0 => 'Tidak Dijual'];
		render($data);
	}

	public function data()
	{
		$config = [
			'edit' 		=> true,
			'delete'	=> true
		];
		$data   = generate_data($config);
		render($data, 'json');
	}

	public function get_data()
	{
		$data = get_data('products', get())->row();
		render($data, 'json');
	}

	public function save()
	{
		$data 		= post();
		$response   = save_data('products', $data);
		render($response, 'json');
	}

	public function delete()
	{
		$response   = destroy_data('products', get());
		render($response, 'json');
	}

}
