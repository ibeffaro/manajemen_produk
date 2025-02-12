<?php defined('BASEPATH') or exit('No direct script access allowed');

function asset_url($str = '')
{
    return base_url('assets/') . $str;
}

function debug($data = '')
{
    echo '<pre>';
    print_r($data);
    echo '</pre>';
}

function user($key = '')
{
    $CI     = get_instance();
    return $CI->config->item('user_' . $key) ? $CI->config->item('user_' . $key) : '';
}

function setting($key = '')
{
    $CI     = get_instance();
    return $CI->config->item('setting_' . $key) ? $CI->config->item('setting_' . $key) : '';
}

function encode_string($str = '', $key = 0)
{
    if (!$key) $key = round((strtotime(date('Y-m-d')) / 1000) * 2);
    $new_str    = '';
    $serialize  = [];
    for ($i = 0; $i < strlen($str); $i++) {
        $serialize[]    = ord($str[$i]);
    }
    if (count($serialize) > 0) {
        $new_str    = encode_id($serialize, $key);
    }
    return $new_str;
}

function encode_id($id = 0, $key = 0)
{
    if (!$key) $key = round((strtotime(date('Y-m-d')) / 1000) * 2);
    if (!is_array($id)) {
        $id = [$id, rand()];
    }
    $hashids    = new Hashids\Hashids((string) $key);
    return $hashids->encode($id);
}

function __rules_path($tbl)
{
    $file   = SCPATH . 'rules' . DIRECTORY_SEPARATOR . $tbl . '.txt';
    $file2  = SCPATH . 'rules' . DIRECTORY_SEPARATOR . table_prefix($tbl) . '.txt';
    $return = [];
    if (file_exists($file)) {
        $rules  = @unserialize(file_get_contents($file));
    } elseif (file_exists($file2)) {
        $rules  = @unserialize(file_get_contents($file2));
    }
    if (isset($rules) && is_array($rules)) {
        foreach ($rules as $field => $r) {
            if (is_array($r) && isset($r['path'])) {
                $return[$field] = upload_path($r['path']);
            }
        }
    }
    return $return;
}

function __recursive_parse($string_join = '', $table = '', $data = [])
{
    $str_join       = explode(',', $string_join);
    foreach ($str_join as $string) {
        $temp_string    = $string;
        preg_match_all('/\[(.*|(?R))\]/si', $string, $join);
        if (isset($join[0][0])) {
            $temp_string    = trim(str_replace($join[0][0], '', $string));
        }
        preg_match_all('/\((.*|(?R))\)/si', $temp_string, $condition);
        if (isset($condition[0][0])) {
            $join_table = trim(str_replace($condition[0][0], '', $temp_string));
        }

        if (isset($condition[1][0])) {
            $cond           = str_replace(['self', '\''], [$join_table, '"'], $condition[1][0]);
            $clean_cond     = str_replace(['(', ')'], '', $cond);
            $x_cond         = explode(' ', $clean_cond);
            foreach ($x_cond as $x) {
                $new_x  = $x;
                $__x    = explode(':', $x);
                if (count($__x) == 2) {
                    $new_x      = '';
                    foreach ($__x as $key__x => $_x) {
                        $new__x = $_x;
                        if (strpos($_x, '.') === false && strpos($_x, '"') === false && !is_numeric($_x)) {
                            $new__x  = str_replace($_x, $table . '.' . $_x, $new__x);
                        }
                        if ($key__x == 0) {
                            $new_x  .= $new__x . '=';
                        } else {
                            $new_x  .= $new__x;
                        }
                    }
                }
                $cond   = str_replace($x, $new_x, $cond);
            }
            $data[$join_table]   = $cond;
        }
        if (isset($join_table) && isset($join[1][0])) {
            $data   = __recursive_parse($join[1][0], $join_table, $data);
        }
    }
    return $data;
}

function __validation($tbl)
{
    $file   = SCPATH . 'rules' . DIRECTORY_SEPARATOR . $tbl . '.txt';
    $file2  = SCPATH . 'rules' . DIRECTORY_SEPARATOR . table_prefix($tbl) . '.txt';
    $return = [];
    if (file_exists($file)) {
        $rules  = @unserialize(file_get_contents($file));
    } elseif (file_exists($file2)) {
        $rules  = @unserialize(file_get_contents($file2));
    }
    if (isset($rules) && is_array($rules)) {
        foreach ($rules as $field => $r) {
            if (is_string($r)) {
                $return[$field] = $r;
            } elseif (is_array($r) && isset($r['validation'])) {
                $return[$field] = $r['validation'];
            }
        }
    }
    return $return;
}

function decode_string($str = '', $key = 0)
{
    if (!$key) $key = round((strtotime(date('Y-m-d')) / 1000) * 2);
    $new_str    = decode_id($str, $key);
    $result     = '';
    if (isset($new_str) && is_array($new_str)) {
        foreach ($new_str as $n) {
            $result .= chr($n);
        }
    }
    return $result;
}

function decode_id($encode_id = '', $key = 0)
{
    if (!$key) $key = round((strtotime(date('Y-m-d')) / 1000) * 2);
    $hashids    = new Hashids\Hashids((string) $key);
    return $hashids->decode($encode_id);
}

function get($param = "")
{
    $CI     = get_instance();
    if ($param) return $CI->input->get($param);
    else return $CI->input->get();
}

function postUpper($post = "")
{
    $x  = post($post);
    if (is_array($x)) {
        foreach ($x as $k => $v) {
            if (!is_array($v)) {
                $v  = strtoupper($v);
            }
            $x[$k]  = $v;
        }
    } else {
        $x  = strtoupper($x);
    }
    return $x;
}

function is_currency($string)
{
    $string        = $string !== null ? $string : '';
    $_str       = explode(',', $string, 2);
    $str        = str_replace('.', '', $_str[0]);
    $parsing    = explode('.', $_str[0]);
    $res        = false;
    if (strlen($string) > 3) {
        if (is_numeric($str)) {
            $res    = true;
            foreach ($parsing as $k => $p) {
                if (($k == 0 && strlen($p) > 3) || ($k > 0 && strlen($p) != 3)) {
                    $res    = false;
                }
            }
        }
        if ($res && isset($_str[1]) && !is_numeric($_str[1])) $res = false;
        if (!$res) {
            $test = explode(',', trim($string, ','));
            $testResult = true;
            foreach ($test as $t) {
                if (!is_numeric($t) || (int) $t != $t) $testResult = false;
            }
            $res = $testResult;
        }
    }
    return $res;
}

function return_number($currency, $return_origin = true)
{
    if (is_currency($currency)) {
        return str_replace(['.', ','], ['', '.'], $currency);
    } else return $return_origin ? $currency : '';
}

function enc_password($password)
{
    return password_hash($password, PASSWORD_DEFAULT, array('cost' => COST));
}

function is_date($datetime)
{
    $datetime    = $datetime ?? '';
    $res    = false;
    $dt     = explode(' ', $datetime);
    $date   = $dt[0];
    if (strlen($date) == 10) {
        $c  = explode('/', $date);
        if (count($c) == 3 && strlen($c[0]) == 2 && strlen($c[1]) == 2 && strlen($c[2]) == 4) $res = true;
    }
    return $res;
}

function is_daterange($daterange)
{
    $daterange    = $daterange ?? '';
    $res    = false;
    $dt     = explode(' - ', $daterange);
    if (count($dt) == 2) {
        $res    = true;
        foreach ($dt as $date) {
            $c          = explode('/', $date);
            $is_valid   = false;
            if (count($c) == 3 && strlen($c[0]) == 2 && strlen($c[1]) == 2 && strlen($c[2]) == 4) $is_valid = true;
            if (!$is_valid) {
                $res    = false;
            }
        }
    }
    return $res;
}

function return_date($date, $return_origin = true)
{
    $res    = $return_origin ? $date : '';
    if ($date) {
        if (strlen($date) >= 10 && strlen($date) <= 19) {
            $dt     = explode(' ', $date);
            $c      = explode('/', $dt[0]);
            if (count($c) == 3 && strlen($c[0]) == 2 && strlen($c[1]) == 2 && strlen($c[2]) == 4) {
                $res    = $c[2] . '-' . $c[1] . '-' . $c[0];
                if (isset($dt[1])) $res  .= ' ' . $dt[1];
            }
        } else {
            $dt     = explode(' - ', $date);
            $res    = [];
            foreach ($dt as $date) {
                $c      = explode('/', $date);
                if (count($c) == 3 && strlen($c[0]) == 2 && strlen($c[1]) == 2 && strlen($c[2]) == 4) {
                    $res[]  = $c[2] . '-' . $c[1] . '-' . $c[0];
                }
            }
        }
    }
    return $res;
}

function post($post = "", $data_type = "")
{
    $CI     = get_instance();
    $r      = $CI->input->post($post);
    if (!$post) {
        $data   = [];
        $_post  = $CI->input->post();
        foreach ($_post as $field => $r) {
            if (!is_array($r)) {
                if ($field == 'password') {
                    if (trim($r)) {
                        $r  = enc_password(xss_clean($r));
                    } else {
                        $r  = 'unsetPost';
                    }
                } elseif (is_currency($r)) {
                    $r  = return_number($r);
                } elseif (is_date($r) || is_daterange($r)) {
                    $r  = return_date($r);
                }
                if ($r === '__CURRENT_DATE__') {
                    $r  = date('Y-m-d H:i:s');
                }
                if ($r != 'unsetPost') {
                    $data[$field]   = xss_clean($r);
                }
            }
        }
        return $data;
    } else {
        $r      = $CI->input->post($post);
        if (!is_array($r)) {
            if ($r) {
                if (is_currency($r)) {
                    $r  = return_number($r);
                } elseif (is_date($r) || is_daterange($r)) {
                    $r  = return_date($r);
                } elseif ($data_type == 'html') {
                    $r  = html_escape($r);
                } elseif ($data_type == 'password') {
                    if (trim($r)) {
                        $r  = enc_password(xss_clean($r));
                    }
                }
                return xss_clean($r);
            } else {
                return $r;
            }
        } else return $r;
    }
}

function generate_data($config = [])
{
    $CI             = get_instance();
    $header         = $CI->input->request_headers();
    $key            = isset($header['X-Data-Key']) ? $header['X-Data-Key'] : '';
    $reference      = isset($header['X-Data-Ref']) ? $header['X-Data-Ref'] : '';

    if (!$key && isset($_SERVER['HTTP_X_DATA_KEY']))         $key        = $_SERVER['HTTP_X_DATA_KEY'];
    if (!$reference && isset($_SERVER['HTTP_X_DATA_REF']))   $reference  = $_SERVER['HTTP_X_DATA_REF'];

    $decode_key     = decode_string($key, TABLE_KEY);

    preg_match_all('/\[(.*|(?R))\]/si', $decode_key, $res);
    $primary_data   = isset($res[0][0]) ? trim(str_replace($res[0][0], '', $decode_key)) : $decode_key;
    $x_primary_data = explode('.', $primary_data);
    $table_orig     = isset($x_primary_data[0]) ? $x_primary_data[0] : '';
    $table          = isset($x_primary_data[0]) ? $x_primary_data[0] : '';
    $primary_field  = isset($x_primary_data[1]) ? $x_primary_data[1] : '';
    if (!table_exists(table_prefix($table_orig))) {
        $table_orig     = $decode_key;
        $table          = isset($x_primary_data[1]) ? $x_primary_data[1] : $table_orig;
        $primary_field  = '';
    }
    $primary_field  = isset($header['X-Primary-Field']) ? $header['X-Primary-Field'] : '';
    if (!$primary_field && isset($_SERVER['HTTP_PRIMARY_FIELD']))   $primary_field  = $_SERVER['HTTP_X_PRIMARY_FIELD'];

    $join_table     = isset($res[1][0]) ? __recursive_parse($res[1][0], $table) : [];
    if (!$table) {
        $join_table = [];
    }

    $limit          = get('limit') ?: 10;
    $page           = (int) get('page') ? get('page') - 1 : 0;
    $offset         = $page * $limit;

    $select         = [];
    $where          = [];
    $filter         = [];
    $join           = [];
    $order_by       = get('order_by');
    $order          = get('order');
    $buttons        = [];
    $paths          = [];

    if (isset($config['paths'])) $paths = $config['paths'];

    if (isset($config['buttons'])) {
        if (is_array($config['buttons'])) {
            if (isset($config['buttons']['class'])) {
                $buttons[]  = $config['buttons'];
            } else {
                foreach ($config['buttons'] as $cb) {
                    if (is_array($cb)) {
                        $buttons[]  = $cb;
                    }
                }
            }
        }
    }

    foreach ($join_table as $k_jt => $v_jt) {
        $_join          = $k_jt . ' ON ' . $v_jt . ' TYPE LEFT ';
        $join[$_join]   = $_join; // meminimalisir duplikat
    }


    // === KONDISI JIKA BUKAN DARI SERVERSIDE ===
    if (!$table && isset($config['table']) && $config['table']) {
        $table      = $config['table'];
        if (isset($config['primary_field'])) {
            $table  = $config['primary_field'];
        }
    }

    // definisi join dari field
    if ($table && is_array(get('select'))) {
        foreach (get('select') as $gx) {
            $x_as       = explode(' as ', $gx);
            for ($n = count($x_as) - 1; $n > 0; $n--) {
                $g          = $x_as[$n - 1] . ' as ' . $x_as[$n];
                $g          = explode('__at__', str_replace('__colon__', '::', str_replace('_single_colon_', ':', $g)), 2);
                if (isset($g[1])) {
                    $p      = explode(' as ', $g[1]);
                    if (count($p) == 2) {
                        $fields         = trim($p[1], ':');
                        $field1         = 'id';
                        $field2         = $fields;
                        $x_field        = explode(':', $fields);
                        if (count($x_field) == 2) {
                            $field1     = $x_field[0];
                            $field2     = $x_field[1];
                        }
                        if (strpos($p[1], '__at__') === false) {
                            if (strpos($p[0], '::') === false) {
                                $_join  = table_prefix($p[0]) . ' ON ' . table_prefix($p[0]) . '.' . $field1 . ' = ' . table_prefix($table) . '.' . $field2 . ' TYPE LEFT';
                            } else {
                                $_p     = explode('::', $p[0]);
                                $_join  = table_prefix($_p[0]) . ' ' . $_p[1] . ' ON ' . $_p[1] . '.' . $field1 . ' = ' . table_prefix($table) . '.' . $field2 . ' TYPE LEFT';
                            }
                        } else {
                            $e_join = explode('__at__', $p[1]);
                            $f_join = $e_join[0];
                            $t_join = $e_join[1];
                            $a_join = $e_join[1];
                            if (strpos($t_join, '::') !== false) {
                                $xt_join    = explode('::', $t_join);
                                $t_join     = table_prefix($xt_join[0]);
                                $a_join     = $xt_join[1];
                            } else {
                                $t_join     = $a_join   = table_prefix($t_join);
                            }

                            if (strpos($p[0], '::') === false) {
                                $_join  = table_prefix($p[0]) . ' ON ' . table_prefix($p[0]) . '.' . $field1 . ' = ' . $a_join . '.' . $f_join . ' TYPE LEFT';
                            } else {
                                $_p     = explode('::', $p[0]);
                                $_join  = table_prefix($_p[0]) . ' ' . $_p[1] . ' ON ' . $_p[1] . '.' . $field1 . ' = ' . $a_join . '.' . $f_join . ' TYPE LEFT';
                            }
                        }
                        $join[$_join]   = $_join;
                    }
                }
            }
        }
    }

    // ==== MEMASUKAN JOIN DARI LAIN
    if (isset($config['join'])) {
        if (is_array($config['join'])) {
            foreach ($config['join'] as $_join) {
                $join[$_join]   = $_join;
            }
        } else {
            $join[$config['join']]  = $config['join'];
        }
    }

    // === LIST TABLE YG AKAN DI QUERY BAIK ITU TABLE GET MAUPUN TABLE JOIN
    $list_path      = [];
    $table_lists    = [];
    if ($table) $table_lists[]   = table_prefix($table);
    $list_path[$table]          = __rules_path($table);
    foreach ($join as $j) {
        $_j                             = explode(' ', $j);
        if (strtoupper($_j[1]) == 'ON') {
            if (trim($_j[0])) $table_lists[] = table_prefix(trim($_j[0]));
        } else {
            $table_lists[] = table_prefix(trim($_j[0])) . '::' . trim($_j[1]);
        }
        $list_path[trim($_j[0])]        = __rules_path(trim($_j[0]));
    }

    $field_lists    = [];
    if (is_array(get('select'))) {
        foreach (get('select') as $g) {
            $x_g        = explode(' ', $g);
            $g          = str_replace(['__at__', '__colon__'], ['@', '::'], $x_g[0]);
            $field_lists[$g]    = '`' . table_prefix($table) . '`.`' . $g . '`';
            if (isset($list_path[$table][$g]) && !isset($paths[$g])) {
                $paths[$g]      = base_url($list_path[$table][$g]);
            }
            $c_g        = explode('@', $g, 2);
            if (isset($c_g[1])) {
                foreach ($table_lists as $t) {
                    if (strtolower(substr($t, -1 * strlen($c_g[1]))) == strtolower($c_g[1])) {
                        $x_t                = explode('::', $t);
                        $tjoin              = isset($x_t[1]) ? $x_t[1] : $t;
                        $torig              = isset($x_t[0]) ? $x_t[0] : $t;
                        $field_lists[$g]    = '`' . $tjoin . '`.`' . $c_g[0] . '`';
                        if (isset($list_path[$table][$g])) {
                            $paths[$g]      = base_url($list_path[$torig][$c_g[0]]);
                        }
                    }
                }
            }
        }
    }
    foreach ($buttons as $btn) {
        if (isset($btn['condition']) && trim($btn['condition'])) {
            preg_match_all('/{(.*?)}/si', $btn['condition'], $res);
            foreach ($res[1] as $rs) {
                if (substr($rs, 0, 1) != '^') {
                    $field_lists[$rs]   = '`' . table_prefix($table) . '`.`' . $rs . '`';
                    $c_g                = explode('@', $rs, 2);
                    if (isset($c_g[1])) {
                        foreach ($table_lists as $t) {
                            if (strtolower(substr($t, -1 * strlen($c_g[1]))) == strtolower($c_g[1])) {
                                $field_lists[$g]   = '`' . $t . '`.`' . $c_g[0] . '`';
                            }
                        }
                    }
                }
            }
        }
    }

    // === INISIASI RESPONSE ===
    // $access     = get_access($reference);
    $response   = [
        'status'            => 'failed',
        'message'           => 'Permintaan Tidak Valid',
        'data'              => [],
        'num_rows'          => 0,
        'total_data'        => 0,
        'total_filter'      => null,
        'primary_field'     => $primary_field,
        // 'edit'              => $access['edit'],
        // 'delete'            => $access['delete'],
        // 'uri'               => $access['target'],
        'default_image'     => asset_url('images/image.svg')
    ];
    if (isset($config['edit']))      $response['edit']   = $config['edit']   ? true : false;
    if (isset($config['delete']))    $response['delete'] = $config['delete'] ? true : false;

    // if (table_exists(table_prefix($table_orig)) && ($access['view'] || (!$access['view'] && !$access['menu']))) {
        if (!$primary_field) {
            $fields = get_fields($table_orig);
            foreach ($fields as $k_field => $v_field) {
                if (isset($v_field->primary_key) && $v_field->primary_key) {
                    $primary_field  = $v_field->name;
                }
            }
            if (count($fields) > 0 && !$primary_field) {
                $primary_field  = $fields[0]->name;
            }
            $response['primary_field']  = $primary_field;
        }

        // === ORDER BY ===
        if (!$order && !$order_by) {
            $order_by   = '';
        }
        // memasukan config order sebagai ORDER BY secara default
        if (!$order_by && isset($config['order_by'])) {
            $order_by   = $config['order_by'];
            if (isset($config['order'])) $order  = $config['order'];
        }

        if ($order_by) {
            $order_by   = str_replace(['__at__', '__colon__'], ['@', '::'], $order_by);
            if (isset($field_lists[$order_by])) $order_by   = $field_lists[$order_by];
        }

        // === WHERE ===
        // memasukan config where
        if (isset($config['where'])) {
            if (is_array($config['where'])) {
                $where      = $config['where'];
            } else {
                $where[]    = $config['where'];
            }
        }
        $where_query    = $where;

        // memasukan filter dari client
        if (get('filter') && is_array(get('filter'))) {
            foreach (get('filter') as $keyFilter => $valFilter) {
                $keyFilter   = str_replace(['__at__', '__colon__'], ['@', '::'], $keyFilter);
                if (isset($field_lists[$keyFilter])) $keyFilter  = $field_lists[$keyFilter];

                if (is_daterange($valFilter)) {
                    $__v  = return_date($valFilter, false);
                    $where_query['DATE(' . $keyFilter . ') >='] = $__v[0];
                    $where_query['DATE(' . $keyFilter . ') <='] = $__v[1];
                } elseif (is_date($valFilter)) {
                    $where_query['DATE(' . $keyFilter . ')']    = return_date($valFilter, false);
                } elseif (is_currency($valFilter)) {
                    $filter[$keyFilter] = return_number($valFilter, false);
                } elseif (substr(strtolower($keyFilter), 0, 5) == 'opt::') {
                    $where_key  = substr($keyFilter, 5);
                    $x_where    = explode('@', $where_key);
                    if (count($x_where) == 2) {
                        $where_key  = table_prefix($x_where[1]) . '.' . $x_where[0];
                    }
                    if (strpos($where_key, '.') === false) {
                        $where_key  = table_prefix($table) . '.' . $where_key;
                    }
                    $_valFilter = $valFilter;
                    if (substr($valFilter, 0, 1) == '[' && substr($valFilter, -1) == ']') {
                        $xValFilter = explode(',', str_replace(['[', ']'], '', $valFilter));
                        $_valFilter = [];
                        foreach ($xValFilter as $xVal) {
                            if (trim($xVal) != '') {
                                $_valFilter[]   = trim($xVal);
                            }
                        }
                    }
                    $where_query[$where_key] = $_valFilter;
                } elseif (is_currency($valFilter)) {
                    $filter[$keyFilter] = return_number($valFilter, false);
                } elseif (is_numeric($valFilter)) {
                    $filter[$keyFilter] = $valFilter;
                } else {
                    $filter[$keyFilter] = $valFilter;
                }
            }
        }

        // === HAPUS IGNORE FILTER === //
        if (isset($config['where_ignore'])) {
            if (is_array($config['where_ignore'])) {
                $where_ignore  = $config['where_ignore'];
            } else {
                foreach (explode(',', str_replace(' ', '', $config['where_ignore'])) as $si) {
                    $where_ignore[]    = $si;
                }
            }
            foreach ($where_ignore as $si) {
                if (isset($filter[$si])) unset($filter[$si]);
                if (isset($filter[$si])) unset($filter[$si]);
                if (isset($where_query[$si])) unset($where_query[$si]);
                if (isset($filter[table_prefix($table) . '.' . $si])) unset($filter[table_prefix($table) . '.' . $si]);
                if (isset($filter[$validTable . '.' . $si])) unset($filter[$validTable . '.' . $si]);
                if (isset($where_query[table_prefix($table) . '.' . $si])) unset($where_query[table_prefix($table) . '.' . $si]);
            }
        }

        // === HAPUS IGNORE SELECT === //
        if (isset($config['select_ignore'])) {
            if (is_array($config['select_ignore'])) {
                $select_ignore  = $config['select_ignore'];
            } else {
                foreach (explode(',', str_replace(' ', '', $config['select_ignore'])) as $si) {
                    $select_ignore[]    = trim($si);
                }
            }
            foreach ($select_ignore as $si) {
                if (isset($field_lists[$si])) unset($field_lists[$si]);
            }
        }

        // === DEFINISI SELECT ===
        $select[$primary_field] = table_prefix($table) . '.' . $primary_field . ' AS ' . $primary_field;
        foreach ($field_lists as $alias => $field_select) {
            $select[$alias]     = $field_select . ' AS `' . $alias . '`';
        }

        $str_select = is_array($select) ? implode(',', $select) : $select;

        // === DEFINISI CONFIG SELECT ===
        if (isset($config['select'])) {
            $add_select = is_array($config['select']) ? implode(',', $config['select']) : $config['select'];
            if (trim($add_select)) {
                if (strpos(strtolower($add_select), 'distinct') !== false) {
                    $str_select = $add_select . ',' . $str_select;
                } else {
                    $str_select .= ',' . $add_select;
                }
            }
        }

        $data       = get_data($table_orig, [
            'select'    => $str_select,
            'where'     => $where_query,
            'join'      => $join,
            'like'      => $filter,
            'limit'     => $limit,
            'offset'    => $offset,
            'order_by'  => $order_by,
            'order'     => $order
        ])->result_array();

        if (count($buttons) > 0) {
            foreach ($data as $k_data => $v_data) {
                $data[$k_data]['buttons']   = [];
                foreach ($buttons as $btn) {
                    $condition      = str_replace('^', '', $btn['condition']);
                    unset($btn['condition']);
                    $btn['active']  = true;
                    if (trim($condition)) {
                        preg_match_all('/{(.*?)}/si', $condition, $res);
                        foreach ($res[0] as $k_res => $v_res) {
                            $condition  = str_replace($v_res, '$v_data["' . $res[1][$k_res] . '"]', $condition);
                        }
                        if (eval('return ' . trim($condition, ';') . ';')) {
                            $btn['active']  = true;
                        } else {
                            $btn['active']  = false;
                        }
                    }
                    $btn_id = $v_data[$primary_field];
                    if (is_numeric($v_data[$primary_field])) $btn_id = encode_id($v_data[$primary_field]);
                    if ($btn['link'] != '#') $btn['link']    .= $btn_id;
                    if ($btn['onclick']) $btn['onclick']     = str_replace('()', '(\'' . $btn_id . '\')', $btn['onclick']);
                    $data[$k_data]['buttons'][] = $btn;
                }
            }
        }

        $nums       = get_data($table_orig, [
            'select'    => $primary_field ? 'COUNT(`' . table_prefix($table) . '`.`' . $primary_field . '`) AS jml' : 'COUNT(*) AS jml',
            'join'      => $join,
            'where'     => $where
        ])->row();

        if (count($filter) > 0 || count($where) != count($where_query)) {
            $filter_nums    = get_data($table_orig, [
                'select'    => $primary_field ? 'COUNT(`' . table_prefix($table) . '`.`' . $primary_field . '`) AS jml' : 'COUNT(*) AS jml',
                'join'      => $join,
                'where'     => $where_query,
                'like'      => $filter
            ])->row();
            $response['total_filter']   = (int) $filter_nums->jml;
        }

        $response['status']     = 'success';
        $response['data']       = $data;
        $response['num_rows']   = count($data);
        $response['total_data'] = (int) $nums->jml;
        if (count($paths)) $response['paths']    = $paths;
    // } else {
    //     $response['message']    = 'Izin Ditolak';
    // }
    return $response;
}
