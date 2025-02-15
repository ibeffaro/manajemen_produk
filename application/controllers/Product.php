<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Product extends MY_Controller
{

	public function index()
	{
		$data['title'] 	= 'Data Produk';
		$data['status'] = [1 => 'Dijual', 0 => 'Tidak Dijual'];
        
		render($data);
	}

	function get_data()
    {
        $sortBy 	    = get('sort_by');
        $sortOrder 	    = get('sort_order');
        $filterStatus 	= get('filter_status');
        $search 		= get('search');
        $where          = [];

        if ($sortBy == "")          $sortBy = 'id';
        if ($sortOrder == "")       $sortOrder = 'desc';
        if ($filterStatus != "")    $where['is_sell'] = $filterStatus;
        if ($search != "")          $where['name LIKE \'%' . $search . '%\' '] = '';

        $data = get_data('products', [
            'where'	    => $where,
            'sort_by'   => $sortBy,
            'sort'      => $sortOrder
        ])->result_array();
        
        $data = [
            'data' => $data
        ];

        echo json_encode($data);
    }

	function form($id=0)
	{
        $data = [
            'title'     => 'Form Produk',
            'status'    => [1 => 'Dijual', 0 => 'Tidak Dijual'] 
        ];
        if ($id) {
            $data['subtitle']   = 'Edit Produk';
            $data['data']       = get_data('products', 'id', $id)->row();
            render($data, 'view:product/form');
        } else {
            $data['subtitle']   = 'Tambah Produk';
            render($data, 'view:product/form');
        }
        
	}

    public function save() {
        $data       = post();
        $response   = [
            'status'    => 'failed',
            'message'   => 'Data Gagal Disimpan',
            'href'      => base_url('product/form')
        ];

        if($data['id']) {
            $data['updated_at']     = date_now();
            update_data('products', $data, 'id', $data['id']);
            $response['status']     = 'success';
            $response['message']    = 'Data Berhasil Diperbaharui';
            $response['href']       = base_url();
        } else {
            $data['created_at']     = date_now();
            insert_data('products', $data);
            $response['status']     = 'success';
            $response['message']    = 'Data Berhasil Disimpan';
            $response['href']       = base_url();
        }
        
        render($response, 'json');
    }

	public function destroy()
	{
        $id         = post('id');
        $response   = [
            'status'    => 'failed',
            'message'   => 'Data Gagal Dihapus',
            'href'      => base_url()
        ];

        $deleteData = delete_data('products', 'id', $id);
        if ($deleteData) {
            $response['status']     = 'success';
            $response['message']    = 'Data Berhasil Dihapus';
        }
        
		render($response, 'json');
	}

}
