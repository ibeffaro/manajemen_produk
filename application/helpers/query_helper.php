<?php defined('BASEPATH') or exit('No direct script access allowed');

function table_exists($table="") {
    $table = $table ?? '';
    if(strpos($table,'.') !== false) return true;
    else {
        $CI         = get_instance();
        $config     = $CI->config->item('db_table_list');
        // $tableList  = json_decode($config, true); #Versi < PHP 8.1
        $tableList  = json_decode($config ?? '{}', true);
        return is_array($tableList) && is_string($table) && isset($tableList[$table]);
    }
}

function table_prefix($table='') {
    debug($table); die;
    $CI         = get_instance();
    $db_active  = 'default';
    if(!is_array($table)) {
        $xtable     = explode('.',$table);
        $db_active  = isset($xtable[1]) ? $xtable[0] : 'default';
    }
    $db_group   = $db_active != 'default' ? $CI->load->database($db_active,TRUE) : $CI->db;

    $table_prefix   = isset($db_group->table_prefix) ? trim($db_group->table_prefix) : '';
    if($db_active == 'default') {
        if(is_array($table)) {
            $new_table  = [];
            foreach($table as $t) {
                $x_t    = explode(' ',$t)[0];
                if(!table_exists($x_t) && $table_prefix && substr($x_t, 0, strlen($table_prefix)) != $table_prefix && table_exists($table_prefix.$x_t)) {
                    $new_table[]    = $table_prefix.$t;
                } else {
                    $new_table[]    = $t;
                }
            }
            $table  = $new_table;
        } else {
            $x_table    = explode(' ',$table)[0];
            if(!table_exists($x_table) && $table_prefix && substr($x_table, 0, strlen($table_prefix)) != $table_prefix && table_exists($table_prefix.$x_table)) {
                $table      = $table_prefix.$table;
            }
        }
    }

    return $table;
}

function get_data($table="",$attr=[],$column=''){
    $CI         = get_instance();
    $xtable     = explode('.',$table);
    $db_active  = isset($xtable[1]) ? $xtable[0] : 'default';
    $table      = isset($xtable[1]) ? $xtable[1] : $table;
    $db_group   = $db_active != 'default' ? $CI->load->database($db_active,TRUE) : $CI->db;

    $table      = table_prefix($table);

    if(is_array($attr)) {
        $list_param = [
            'select', 'select_max', 'select_min', 'select_sum', 'sort', 'order', 'sort_by', 'order_by', 'limit', 'offset', 'group_by',
            'where', 'like', 'not_like', 'join', 'having'
        ];
        $is_where   = true;
        foreach($attr as $key_at => $val_at) {
            if(in_array($key_at,$list_param)) $is_where = false;
        }
        if($is_where) {
            $attr['where']  = $attr;
        }

        if(isset($attr['select']) && $attr['select'])
            $db_group->select($attr['select'],false);
        if(isset($attr['select_max']) && $attr['select_max'])
            $db_group->select_max($attr['select_max']);
        if(isset($attr['select_min']) && $attr['select_min'])
            $db_group->select_min($attr['select_min']);
        if(isset($attr['select_sum']) && $attr['select_sum'])
            $db_group->select_sum($attr['select_sum']);
        if((isset($attr['sort']) && $attr['sort']) || (isset($attr['order']) && $attr['order'])) {
            $sort = isset($attr['sort']) ? $attr['sort'] : $attr['order'];
        } else
            $sort = 'ASC';
        
        $sort_list  = '';
        if(isset($attr['sort_by'])) {
            $sort_list  = $attr['sort_by'];
        } elseif(isset($attr['order_by'])) {
            $sort_list  = $attr['order_by'];
        }
        if($sort_list) {
            if(is_array($sort_list)) {
                foreach($sort_list as $k_sa => $sa){
                    if($k_sa && (strtolower($sa) == 'asc' || strtolower($sa) == 'desc' || strtolower($sa) == 'random')) {
                        $db_group->order_by($k_sa,$sa);
                    } elseif($sa) {
                        $db_group->order_by($sa,$sort);
                    }
                }
            } elseif($sort_list) {
                $db_group->order_by($sort_list,$sort);
            }
        }
        if(isset($attr['where'])){
            if(is_array($attr['where'])){
                foreach($attr['where'] as $kw => $vw) {
                    if(is_array($vw)) {
                        if(strpos($kw, '!=') !== false ) {
                            $wh = trim(str_replace('!=', '', $kw));
                            $db_group->where_not_in($wh,$vw);
                        } else {
                            $db_group->where_in($kw,$vw);
                        }
                    } else {
                        $vw = (string) $vw;
                        if((string)(int) $kw == (string) $kw) {
                            // jika key bernilai angka / integer berarti where berisi kondisi manual
                            if($vw) $db_group->where($vw);
                        } elseif(strtolower(substr($kw, 0 ,5)) == 'like ') {
                            $db_group->like(substr($kw, 5),$vw);
                        } elseif(strtolower(substr($kw, 0 ,3)) == 'or ') {
                            $db_group->or_where(substr($kw, 3),$vw);
                        } else {
                            if(strtolower($vw) == 'null') {
                                if(strpos($kw, '!=') !== false ) {
                                    $wh = trim(str_replace('!=', '', $kw));
                                    $db_group->where($wh.' IS NOT NULL',NULL,FALSE);
                                } else {
                                    $db_group->where($kw.' IS NULL',NULL,FALSE);
                                }
                            } else {
                                $db_group->where($kw,$vw);
                            }
                        }
                    }
                }
            } else {
                $db_group->where($attr['where']);
            }
        }
        if(isset($attr['having'])){
            if(is_array($attr['having'])){
                foreach($attr['having'] as $kw => $vw) {
                    $db_group->having($kw,$vw);
                }
            } else {
                $db_group->having($attr['having']);
            }
        }
        if(isset($attr['group_by'])){
            if(is_array($attr['group_by'])){
                foreach($attr['group_by'] as $g){
                    if($g) $db_group->group_by($g);
                }
            } elseif($attr['group_by'])
                $db_group->group_by($attr['group_by']);
        }
        if(isset($attr['limit']) && $attr['limit'] > 0){
            if(isset($attr['offset']) && $attr['offset'])
                $db_group->limit($attr['limit'],$attr['offset']);
            else
                $db_group->limit($attr['limit']);
        }
        if(isset($attr['join'])) {
            if(is_array($attr['join'])) {
                foreach($attr['join'] as $kj => $vj) {
                    if(isset($vj['on'])) {
                        $kj = table_prefix($kj);
                        if(isset($vj['type'])) {
                            $db_group->join($kj,$vj['on'],$vj['type']);
                        } else {
                            $db_group->join($kj,$vj['on']);
                        }
                    } elseif (!is_array($vj)) {
                        $spl_on     = preg_split("/ on /i",$vj);
                        if(count($spl_on) == 2) {
                            $table_join     = table_prefix(trim($spl_on[0]));
                            $spl_type       = preg_split("/ type /i",$spl_on[1]);
                            $on_join        = trim($spl_type[0]);
    
                            if(count($spl_type) == 2) {
                                $type_join  = trim($spl_type[1]);
                                $db_group->join($table_join,$on_join,$type_join);
                            } else {
                                $db_group->join($table_join,$on_join);
                            }
                        }        
                    }
                }    
            } else {
                $spl_on     = preg_split("/ on /i",$attr['join']);
                if(count($spl_on) == 2) {
                    $table_join     = table_prefix(trim($spl_on[0]));
                    $spl_type       = preg_split("/ type /i",$spl_on[1]);
                    $on_join        = trim($spl_type[0]);

                    if(count($spl_type) == 2) {
                        $type_join  = trim($spl_type[1]);
                        $db_group->join($table_join,$on_join,$type_join);
                    } else {
                        $db_group->join($table_join,$on_join);
                    }
                }
            }
        }
        if(isset($attr['like']) && is_array($attr['like'])) {
            foreach($attr['like'] as $k_lk => $v_lk) {
                if(is_array($v_lk)) {
                    foreach($v_lk as $k => $vlk) {
                        $db_group->like($k_lk,$vlk);
                    }
                } else {
                    if(strtolower(substr($k_lk, 0 ,3)) == 'or ') {
                        $db_group->or_like(substr($k_lk, 3),$v_lk);
                    } else {
                        $db_group->like($k_lk,$v_lk);
                    }
                }
            }
        }
        if(isset($attr['not_like']) && is_array($attr['not_like'])) {
            foreach($attr['not_like'] as $k_lk => $v_lk) {
                if(is_array($v_lk)) {
                    foreach($v_lk as $k => $vlk) {
                        $db_group->not_like($k_lk,$vlk);
                    }
                } else {
                    if(strtolower(substr($k_lk, 0 ,3)) == 'or ') {
                        $db_group->or_not_like(substr($k_lk, 3),$v_lk);
                    } else {
                        $db_group->not_like($k_lk,$v_lk);
                    }
                }
            }
        }
        return $db_group->get($table);
    } else {
        if(is_array($column)) {
            $db_group->where_in($attr,$column);
        } else {
            $x = preg_split( '/(>|<|=)/', $attr, -1, PREG_SPLIT_NO_EMPTY );
            if(count($x) == 1) {
                $db_group->where($attr,$column);
            } else {
                $db_group->where($attr);
            }
        }
        return $db_group->get($table);
    }
}

function get_fields($table="",$get="") {
    $CI         = get_instance();
    $xtable     = explode('.',$table);
    $db_active  = isset($xtable[1]) ? $xtable[0] : 'default';
    $table      = isset($xtable[1]) ? $xtable[1] : $table;
    $db_group   = $db_active != 'default' ? $CI->load->database($db_active,TRUE) : $CI->db;

    $table      = table_prefix($table);

    if($table && ((table_exists($table) && $db_active == 'default') || $db_active != 'default')) {
        if($get) {
            $field  = $db_group->field_data($table);
            $f      = [];
            foreach ($field as $fi) {
                $f[$fi->$get]   = $fi->$get;
            }
            return $f;
        } else
            return $db_group->field_data($table);
    } else return [];
}

