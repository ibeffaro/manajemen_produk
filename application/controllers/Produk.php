<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Produk extends MY_Controller {
	
	public function index()
	{
		$data['title'] = 'Data Produk';
		render($data);
	}

	public function data() {
        $data   = generate_data();
		debug($this->db->query()); die;
        render($data, 'json');
    }
}
