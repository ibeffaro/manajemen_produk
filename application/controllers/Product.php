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

	public function data() {

        $acc    = get_access();
        $period = get('filter_periode');
        $filterMarketing = get('filter_marketing');

        $dates      = preg_split('/\s*-\s*/', $period);
        $filterTgl1 = isset($dates[0]) ? return_date($dates[0]) : '';
        $filterTgl2 = isset($dates[1]) ? return_date($dates[1]) : '';

        $where  = [
            'p.id_proyek'           => user('id_lokasi'),
            'DATE(p.created_at) >=' => $filterTgl1,
            'DATE(p.created_at) <=' => $filterTgl2 
        ];

        $year   = date('Y');
        $data   = get_data('prospek p', [
            'join'      => 'user u ON u.id = p.id_marketing TYPE LEFT',
            'select'    => '
                COUNT(CASE WHEN p.sumber = "Iklan" THEN p.id END) AS jml_crm,
                COUNT(CASE WHEN p.sumber = "Pribadi" THEN p.id END) AS jml_pribadi,
                COUNT(CASE WHEN YEAR(p.created_at) < "'.$year.'" THEN p.id END) AS jml_leads_lama,
                COUNT(CASE WHEN p.sumber = "Iklan" AND p.kualitas = "Rencana Survei" THEN p.id END) AS jml_plan_survei_crm,
                COUNT(CASE WHEN YEAR(p.created_at) < "'.$year.'" AND kualitas = "Rencana Survei" THEN p.id END) AS jml_plan_survei_leads_lama,
                COUNT(CASE WHEN p.kualitas = "Survei" THEN p.id END) AS jml_survei, 
                COUNT(CASE WHEN p.kualitas = "TJ" THEN p.id END) AS jml_tj, 
                u.nama AS marketing, DATE(p.created_at) AS tanggal,
                (
                    COUNT(CASE WHEN p.sumber = "Iklan" THEN p.id END) +
                    COUNT(CASE WHEN p.sumber = "Pribadi" THEN p.id END) +
                    COUNT(CASE WHEN YEAR(p.created_at) < "'.$year.'" THEN p.id END)
                ) AS total,
                (
                    COUNT(CASE WHEN p.kualitas = "Survei" THEN p.id END) * 100.0 / 
                    NULLIF(
                        (
                            COUNT(CASE WHEN p.sumber = "Iklan" THEN p.id END) +
                            COUNT(CASE WHEN p.sumber = "Pribadi" THEN p.id END) +
                            COUNT(CASE WHEN YEAR(p.created_at) < "'.$year.'" THEN p.id END)
                        ), 0
                    )
                ) AS rasio_survei,
                (
                    COUNT(CASE WHEN p.kualitas = "TJ" THEN p.id END) * 100.0 /
                    NULLIF(COUNT(CASE WHEN p.kualitas = "Survei" THEN p.id END), 0)
                ) AS rasio_tj_to_survei',
            'where'     => $where,
            'group_by'  => ['p.id_marketing', 'DATE(p.created_at)'],
            'order_by'  => [
                'tanggal' => 'ASC'
            ],
        ])->result();

		$data = [
			'data'  => $data
		];

		render($data, 'json');
    }

	function get_data()
    {
        $search 		= get('search');
        $filterStatus 	= get('filter_status');
		debug($filterStatus); die;
        $tmp_month  = $tahun . '-' . $bulan . '-01';
        $next_month = date('Y-m-d', strtotime('+1 month', strtotime($tmp_month)));
        $startDate  = 1;
        $endDate    = date('d', strtotime('-1 day', strtotime($next_month)));
        // $endDate    = date('d', strtotime('-1 day', strtotime('Y-m-d', strtotime('+1 month', strtotime(date('Y-m-d'))))));
        for ($i = $startDate; $i <= $endDate; $i++) {
            $j  = $i - 1;
            $tanggal    = $tahun . '-' . $bulan . '-' . sprintf('%02s', $i);
            $where      = [
                'tanggal_chat'  => $tanggal,
                // 'status'        => 3
            ];
            $wherePesanan       = [
                'tanggal_sk'    => $tanggal,
                // 'status_order'  => 1
            ];

            $getCRM = get_data('crm', [
                'select'    => 'count(id) AS jml',
                'where'     => $where
            ])->row();

            $getPesanan = get_data('pesanan', [
                'select'    => 'count(id) AS jml',
                'where'     => $wherePesanan
            ])->row();

            $data[$j]['tanggal']    = sprintf('%02s', $i);
            $data[$j]['jumlah']     = $getCRM->jml ?: 0;
            $data[$j]['jumlah_pes'] = $getPesanan->jml ?: 0;
        }

        echo json_encode($data);
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
