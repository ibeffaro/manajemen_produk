<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller {

    public function __construct(){
        parent::__construct();
        date_default_timezone_set('Asia/Jakarta');

        $tables = table_lists();
        $tablesList = [];
        foreach($tables as $t) {
            $tablesList[$t]   = $t;
        }
        $this->config->set_item('db_table_list', json_encode($tablesList));
    }

}
