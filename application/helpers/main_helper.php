<?php defined('BASEPATH') or exit('No direct script access allowed');

function render($data = [], $output = '', $forceAccess = false)
{
    if (!setting('load_page')) {
        $CI         = get_instance();
        if (is_array($data) || in_array($data, ['403', '404', 'err'])) {
            $init_page = '';
            if (!is_array($data)) {
                $init_page  = $data;
                $data       = [];
            }
            $f_segment  = $CI->uri->segment(1) ?? '';
            $class      = $CI->router->fetch_class() ?? '';
            $method     = $CI->router->fetch_method() ?? '';

            $view       = $f_segment == $class ? str_replace('-', '_', $class) . '/' . $method : str_replace('-', '_', $f_segment) . '/' . $class . '/' . $method;
            $str_view   = $f_segment == $class ? str_replace('-', '_', $class) . '_' . $method : str_replace('-', '_', $f_segment) . '_' . $class . '_' . $method;

            if ($method == 'index' && !file_exists(FCPATH . 'application/views/' . $view . '.php')) {
                $view       = $f_segment == $class ? str_replace('-', '_', $class) . '/' . $method : str_replace('-', '_', $f_segment) . '/' . $class;
                $str_view   = $f_segment == $class ? str_replace('-', '_', $class) . '_' . $method : str_replace('-', '_', $f_segment) . '_' . $class;
            }

            if (strtolower($output) == 'json') {
                header('Content-Type: application/json');
                if (function_exists('info_data_menu')) {
                    $badge              = info_data_menu();
                    if (is_array($badge) && count($badge)) {
                        $data['__badge']    = $badge;
                    }
                }
                echo json_encode($data);
            } else {
                $CI->load->library('asset');
                $layout = 'default';
                if ($output) {
                    $attr_output = explode(' ', $output);
                    foreach ($attr_output as $av) {
                        $attr_av = explode(':', $av);
                        if (count($attr_av) == 2) {
                            if ($attr_av[0] == 'view') {
                                $view       = $attr_av[1];
                                $str_view   = str_replace('/', '_', $view);
                            } else if ($attr_av[0] == 'layout') $layout = $attr_av[1];
                        }
                    }
                }
                if (strtolower($output) == 'error') {
                    $init_page  = 'err';
                }
                if ($layout == 'default' && setting('default_layout')) {
                    $layout     = setting('default_layout');
                }
                if ($init_page) {
                    $error_code = in_array($init_page, [404, 403]) ? $init_page : 400;
                    $CI->output->set_status_header($error_code);
                    $layout             = false;
                    $view               = 'errors/error_all';
                    $data['error_code'] = $init_page;
                    $data['title']      = '';
                    $data['image']      = '';
                    $data['message']    = !isset($data['message']) ? lang($init_page . '_desc') : $data['message'];
                    switch ($init_page) {
                        case "403":
                            $data['title']      = 'Dilarang';
                            $data['image']      = '403';
                            break;
                        case "404":
                            $data['title']      = 'Halaman Tidak Ditemukan';
                            $data['image']      = '404';
                            break;
                        default:
                            $data['error_code'] = "Err";
                            $data['image']      = 'error';
                            $data['title']      = 'Kesalahan';
                    }
                }
                $data['__js']   = '';
                $data['__css']  = '';
                if ($layout && $layout != 'false') {
                    $content    = preg_replace('/<!--(.|\s)*?-->/', '', $CI->load->view($view, $data, true));
                    $data['__content']      = define_custom_tag(
                        clear_custom_tag(
                            clear_js(
                                clear_css($content)
                            )
                        ),
                        $data
                    );
                    
                    $data['__css']      = render_css($content, $str_view);
                    $data['__js']       = render_js($content, $str_view);
                    if (strpos($data['__content'], 'input-icon') !== false && strpos($data['__js'], 'jquery.iconpicker') === false) {
                        $data['__js']                   = '<script type="text/javascript" src="' . asset_url('js/jquery.iconpicker.js') . '"></script>' . "\n" . $data['__js'];
                    }
                    $CI->load->view('layout/' . $layout, $data);
                } else {
                    if (isset($data['error_code'])) {
                        $CI->load->view($view, $data);
                    } else {
                        $content = $CI->load->view($view, $data, true);
                        echo define_custom_tag(
                            clear_custom_tag(
                                clear_js(
                                    clear_css($content)
                                )
                            ),
                            $data
                        );
                    }
                }
            }
        } else {
            header('Content-Type: text/plain');
            echo $data;
        }
    }
}

function get_access($target = '')
{
    $CI                 = get_instance();
    $menu               = [];
    if (user('id')) {
        if (!$target) {
            $target     = $CI->uri->segment(1) ?? '';
            if ($CI->uri->segment(2)) $target   .= '/' . $CI->uri->segment(2);
        }
        $target         = str_replace('_', '-', $target);
        $parsing_target = explode('/', $target);
        if (count($parsing_target) > 2) {
            $target     = $parsing_target[0] . '/' . $parsing_target[1];
        }
        $menu           = get_data('menu', [
            'where'     => [
                'target'    => $target,
                'is_active' => 1
            ]
        ])->row();
        if (!isset($menu->id)) {
            $menu       = get_data('menu', [
                'where' => [
                    'target'    => isset($parsing_target[0]) ? $parsing_target[0] : '',
                    'is_active' => 1
                ]
            ])->row();
        }
    }
    $access         = [
        'menu'      => '',
        'target'    => $target,
        'view'      => 0,
        'input'     => 0,
        'edit'      => 0,
        'delete'    => 0
    ];
    if (isset($menu->id)) {
        $roles =  get_data('user_akses', [
            'where' => [
                'id_menu'   => $menu->id,
                'id_group'  => user('id_group')
            ]
        ])->row();
        if (isset($roles->id)) {
            $access['menu']     = $menu->nama;
            $access['target']   = $menu->target;
            if ($roles->_view)   $access['view']     = 1;
            if ($roles->_input)  $access['input']    = 1;
            if ($roles->_edit)   $access['edit']     = 1;
            if ($roles->_delete) $access['delete']   = 1;
            $additional         = json_decode($roles->_additional, true);
            if (is_array($additional)) {
                foreach ($additional as $ka => $va) {
                    $access[$ka]    = $va;
                }
            }
        }
    }
    return $access;
}

function define_custom_tag($html, $data = [])
{
    $CI                 = get_instance();

    // define app-card
    preg_match_all('/<app-card.*?>(.*?)<\/app-card>/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        $tag            = str_replace($res[1][$key_res], '', $val_res);
        $attr           = trim(str_replace(['app-card', '</', '<', '>'], '', $tag));
        $list_attr      = explode(' ', $attr);
        $x_attr         = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $x_attr[$i]  = $l;
            } else {
                $x_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }

        $new_attr       = '';
        $title          = '';
        $sub_title      = '';
        $collapse       = false;
        $open           = false;
        $class          = 'card';
        foreach ($x_attr as $a) {
            if (strpos($a, 'subtitle=') !== false) {
                $sub_title      = trim(str_replace(['"', 'subtitle='], '', $a));
            } elseif (strpos($a, 'title=') !== false) {
                $title          = trim(str_replace(['"', 'title='], '', $a));
            } elseif (strpos($a, 'class=') !== false) {
                $class          .= ' ' . trim(str_replace(['"', 'class='], '', $a));
            } elseif (strpos($a, 'collapse-mode=') !== false) {
                $collapse       = strtolower(trim(str_replace(['"', 'collapse-mode='], '', $a))) == "true";
            } elseif (strpos($a, 'collapse-default=') !== false) {
                $open           = strtolower(trim(str_replace(['"', 'collapse-default='], '', $a))) == "open";
            } else {
                $new_attr       .= ' ' . $a;
            }
        }
        if ($title && $collapse) {
            $class .= ' card-collapse';
            if ($open) $class .= ' open';
        }

        $new_attr   .= " class=\"{$class}\"";
        $new_html   = "<div{$new_attr}>" . "\n";
        if ($title) {
            $new_html   .= '<div class="card-header">' . "\n";
            $new_html   .= '<div class="card-title fw-semi-bold f-120 mb-1">' . $title . '</div>' . "\n";
            if ($sub_title) {
                $new_html   .= '<div class="card-subtitle">' . $sub_title . '</div>' . "\n";
            }
            $new_html   .= '</div>' . "\n";
        }
        $new_html   .= '<div class="card-body">' . $res[1][$key_res] . '</div>' . "\n";
        $new_html   .= '</div>' . "\n";
        $html       = str_replace($val_res, $new_html, $html);
    }

    // define app-modal
    preg_match_all('/<app-modal.*?>(.*?)<\/app-modal>/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        $tag            = str_replace($res[1][$key_res], '', $val_res);
        $attr           = trim(str_replace(['app-modal', '</', '<', '>'], '', $tag));
        $list_attr      = explode(' ', $attr);
        $x_attr         = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $x_attr[$i]  = $l;
            } else {
                $x_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }

        $new_attr       = ' aria-hidden="true" tabindex="-1"';
        $title          = 'Modal';
        $sub_title      = '';
        $scrollable     = true;
        $class          = 'modal fade';
        $size           = '';
        $modal_id       = '';
        foreach ($x_attr as $a) {
            if (strpos($a, 'subtitle=') !== false) {
                $sub_title      = trim(str_replace(['"', 'subtitle='], '', $a));
            } elseif (strpos($a, 'title=') !== false) {
                $title          = trim(str_replace(['"', 'title='], '', $a));
            } elseif (strpos($a, 'class=') !== false) {
                $class          .= ' ' . trim(str_replace(['"', 'class='], '', $a));
            } elseif (substr($a, 0, 3) == 'id=') {
                $modal_id       = trim(str_replace(['"', 'id='], '', $a));
            } elseif (strpos($a, 'scrollable=') !== false) {
                $_scrollable    = trim(str_replace(['"', 'scrollable='], '', $a));
                if ($_scrollable == 'false') {
                    $scrollable = false;
                }
            } elseif (strpos($a, 'size=') !== false) {
                $_size          = trim(str_replace(['"', 'size=', 'modal-'], '', $a));
                if (in_array($_size, ['fullscreen', 'xl', 'lg', 'md', 'sm'])) {
                    $size       = ' modal-' . $_size;
                }
            } else {
                $new_attr       .= ' ' . $a;
            }
        }
        if (!$modal_id) $new_attr .= ' id="modal-' . rand() . '"';
        else $new_attr .= ' id="' . $modal_id . '"';

        if ($sub_title) $title .= '<small>' . $sub_title . '</small>';

        $class_dialog   = 'modal-dialog';
        if ($scrollable) {
            $class_dialog   .= ' modal-dialog-scrollable';
        }
        if ($size) {
            $class_dialog   .= ' modal-' . $size;
        }

        $modal_content  = $res[1][$key_res];
        $modal_footer   = '';
        preg_match_all('/<footer-form(.*?)\/>/si', $modal_content, $res_modal);
        if (isset($res_modal[0][0])) {
            preg_match_all('/<form(.*?)>/si', $modal_content, $res_form);
            if (isset($res_form[1][0])) {
                $attrForm   = explode(' ', $res_form[1][0]);
                $idForm     = '';
                foreach ($attrForm as $af) {
                    if (substr($af, 0, 3) == 'id=') {
                        $idForm = trim(str_replace(['\'', '"', 'id='], '', $af));
                    }
                }
                if ($idForm) {
                    $modal_footer   .= '<div class="modal-footer-info">' . "\n";
                    $modal_footer   .= '<i class="fa-info-circle" data-appinity-tooltip="right"></i>' . "\n";
                    $modal_footer   .= '</div>' . "\n";
                    $modal_footer   .= '<button type="button" class="btn btn-theme" data-bs-dismiss="modal">' . lang('batal') . '</button>' . "\n";
                    $modal_footer   .= '<button type="submit" class="btn btn-app" form="' . $idForm . '">' . lang('simpan') . '</button>' . "\n";
                }
            }
        }
        foreach ($res_modal[1] as $k_modal => $v_modal) {
            $modal_content  = str_replace($res_modal[0][$k_modal], '', $modal_content);
        }

        $pushFooter = $modal_footer ? false : true;
        preg_match_all('/<footer.*?>(.*?)<\/footer>/si', $modal_content, $res_modal);
        foreach ($res_modal[1] as $k_modal => $v_modal) {
            if ($pushFooter) {
                $modal_footer   .= trim($v_modal);
            }
            $modal_content  = str_replace($res_modal[0][$k_modal], '', $modal_content);
        }

        $add_modal_header   = '';
        preg_match_all('/<header.*?>(.*?)<\/header>/si', $modal_content, $res_modal);
        foreach ($res_modal[1] as $k_modal => $v_modal) {
            $add_modal_header   .= trim($v_modal);
            $modal_content  = str_replace($res_modal[0][$k_modal], '', $modal_content);
        }

        $new_attr   .= " class=\"{$class}\"";
        $new_html   = "<div{$new_attr}>" . "\n";
        $new_html   .= '<div class="' . $class_dialog . '">' . "\n";
        $new_html   .= '<div class="modal-content">' . "\n";
        $new_html   .= '<div class="modal-header">' . "\n";
        if ($add_modal_header) {
            $new_html   .= $add_modal_header . "\n";
        }
        $new_html   .= '<div class="modal-title">' . $title . '</div>';
        $new_html   .= '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' . "\n";
        $new_html   .= '</div>' . "\n";
        $new_html   .= '<div class="modal-body">' . $modal_content . '</div>' . "\n";
        if ($modal_footer) {
            if ($modal_footer == 'null') $modal_footer = '';
            $new_html   .= '<div class="modal-footer">' . $modal_footer . '</div>' . "\n";
        }
        $new_html   .= '</div>' . "\n";
        $new_html   .= '</div>' . "\n";
        $new_html   .= '</div>' . "\n";
        $html       = str_replace($val_res, $new_html, $html);
    }

    // define app-table
    preg_match_all('/<app-table.*?>(.*?)<\/app-table>/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        $tag            = str_replace($res[1][$key_res], '', $val_res);
        $attr           = trim(str_replace(['app-table', '</', '<', '>'], '', $tag));
        $list_attr      = explode(' ', $attr);
        $x_attr         = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $x_attr[$i]  = $l;
            } else {
                $x_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }

        $new_attr       = '';
        $key_table      = '';
        $class_table    = 'table ' . str_replace(',', ' ', setting('table_style'));
        $app_link       = 'default';
        $add_button     = true;
        foreach ($x_attr as $a) {
            if (strpos($a, 'source=') !== false) {
                $n              = trim(str_replace(['"', 'source='], '', $a));
                $source         = strpos($n, base_url()) === false ? base_url($n) : $n;
                $new_attr       .= ' data-source="' . $source . '"';
            } elseif (strpos($a, 'table=') !== false) {
                $n              = trim(str_replace(['"', 'table='], '', $a));
                $key_table      = encode_string($n, TABLE_KEY);
            } elseif (strpos($a, 'class=') !== false) {
                $__class        = trim(str_replace(['"', 'class='], '', $a));
                if ($__class == '__appinity__') {
                    $class_table    .= ' table-appinity';
                } else {
                    $class_table    = $__class;
                }
            } elseif (strpos($a, 'app-link=') !== false) {
                $app_link       = trim(str_replace(['"', 'app-link='], '', $a));
            } elseif (strpos($a, 'add-button=') !== false) {
                $add_button     = trim(str_replace(['"', 'add-button='], '', $a)) == "false" ? false : true;
            } else {
                $new_attr       .= ' ' . $a;
            }
        }
        $new_attr   .= ' app-link="' . $app_link . '"';

        /* CARA PENULISAN ATRIBUT table
            table="tbl_a"                           =>  tbl_a   : nama table,
            table="tbl_a.id"                        =>  tbl_a   : nama table, 
                                                        id      : nama field primary,
            table="tbl_a[tbl_b(id_b:self.tbl_b)]"   =>  tbl_a   : nama table,
                                                        tbl_b   : nama table join,
                                                        ()      : isi dalam kurung adalah kondisi join
                                                                  - self : maksudnya tbl_join itu sendiri
                                                                  - jika field tidak dikaitkan maka akan dikaitkan
                                                                    dengan table parent nya
                                                                  - contoh diatas akan berisi "tbl_a.id_b = tbl_b.id"
            multi join
            table="tbl_a[tbl_b(kondisi),tbl_c(kondisi)]"    => tbl_b dan tbl_c di join dengan table a
            table="tbl_a[tbl_b(kondisi)[tbl_c(kondisi)]]"   => tbl_b di join tbl_a, dan tbl_c di join dengan tbl_b
            kesimpulannya untuk join bentuknya hirarki seperti ini
            tbl_a [
                tbl_b1 [
                    tbl_c [
                        tbl_d [
                            dst
                        ]
                    ]
                ],
                tbl_b2
            ]
            tbl_a join dengan tbl_b1 & tbl_b2
            tbl_b1 join dengan tbl_c
            dst
        */


        $new_attr       .= " class=\"{$class_table}\"";
        if ($key_table) {
            $new_attr   .= " data-key=\"{$key_table}\"";
            if (strpos($new_attr, 'data-source') === false) {
                $new_attr   .= ' data-source="' . base_url('general/data') . '"';
                if (isset($data['__cur_uri'])) {
                    $new_attr   .= ' data-ref="' . $data['__cur_uri'] . '"';
                }
            }
        }
        $new_html   = "";
        if (setting('pos_add_button') == "table" && $add_button) {
            $cls_action = setting('pos_action_button') == 'left' ? 'text-start' : 'text-end';
            $new_html   .= '<div class="mb-3 appinityTable-action-button ' . $cls_action . '">' . setting('action_header') . '</div>';
        }
        $new_html   .= "<table{$new_attr}>{$res[1][$key_res]}</table>\n";
        $html       = str_replace($val_res, $new_html, $html);
    }

    // define base_url
    preg_match_all('/base_url{(.*?)}/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        $html   = str_replace($val_res, base_url(trim($res[1][$key_res])), $html);
    }

    // define asset_url
    preg_match_all('/asset_url{(.*?)}/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        $html   = str_replace($val_res, asset_url(trim($res[1][$key_res])), $html);
    }

    // define app-input-group
    preg_match_all('/<app-input-group.*?>(.*?)<\/app-input-group>/si', $html, $res);
    foreach ($res[0] as $key_res => $val_res) {
        // check default
        $default    = [];
        $temp_html  = substr($html, 0, strpos($html, $val_res));
        preg_match_all('/<app-input-default(.*?)\/>/si', $temp_html, $res2);
        if (count($res2[1]) > 0) {
            $str_attr       = end($res2[1]);
            $list_attr      = explode(' ', $str_attr);
            $new_list_attr  = [];
            $i              = 0;
            $open_attr      = false;
            foreach ($list_attr as $l) {
                if (!$open_attr) {
                    $new_list_attr[$i]  = $l;
                } else {
                    $new_list_attr[$i]  .= ' ' . $l;
                }
                if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
                else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
                if (!$open_attr) $i++;
            }
            foreach ($new_list_attr as $l) {
                if (trim($l)) {
                    $attr_param = explode('=', $l);
                    $attr       = trim($attr_param[0]);
                    $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                    $default[$attr] = $val;
                }
            }
        }

        $label          = '';
        $sub_label      = '';
        $size           = isset($default['size'])       ? $default['size']          : '12:12';
        $size_param     = isset($default['size-param']) ? $default['size-param']    : 'md';
        $other_attr     = '';

        $tag            = str_replace($res[1][$key_res], '', $val_res);
        $attr           = trim(str_replace(['app-input-group', '</', '<', '>'], '', $tag));
        $list_attr      = explode(' ', $attr);
        $x_attr         = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $x_attr[$i]  = $l;
            } else {
                $x_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }

        foreach ($x_attr as $l) {
            if (trim($l)) {
                $attr_param = explode('=', $l);
                $attr       = trim($attr_param[0]);
                $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                if ($attr == 'label' && $val)            $label      = $val;
                else if ($attr == 'sub-label' && $val)   $sub_label  = '<small class="d-block">' . $val . '</small>';
                else if ($attr == 'size' && $val)        $size       = $val;
                else if ($attr == 'size-param' && $val)  $size_param = $val;
                else if (!in_array($attr, ['label', 'sub-label', 'size', 'size-param'])) {
                    $other_attr    .= " {$l}";
                }
            }
        }

        $x_size         = explode(':', $size);
        $label_size     = 0;
        $input_size     = 12;
        if (count($x_size) == 1 && (int) $x_size[0] > 0 && (int) $x_size[0] <= 12) {
            $label_size = $x_size[0];
            $input_size = $x_size[0];
        } elseif (count($x_size) == 2) {
            if ((int) $x_size[0] > 0 && (int) $x_size[0] <= 12) $label_size  = $x_size[0];
            if ((int) $x_size[1] > 0 && (int) $x_size[1] <= 12) $input_size  = $x_size[1];
        }
        if (!in_array($size_param, ['none', 'sm', 'md', 'lg', 'xl'])) $size_param    = 'md-';
        else if ($size_param == 'none') $size_param = '';
        else $size_param .= '-';

        preg_match_all('/<app-input-default(.*?)\/>/si', $html, $res_input_default);

        $new_content    = '';
        $child          = '';
        preg_match_all('/<app-select.*?>(.*?)<\/app-select>/si', $html, $res_child);
        if (count($res_child[0]) > 0 && $label && $label_size) {
            $child      .= define_app_select($res_child, $res[1][$key_res], true, $res_input_default);
        }
        preg_match_all('/<app-input (.*?)\/>/si', $res[1][$key_res], $res_child);
        if (count($res_child[0]) > 0 && $label && $label_size) {
            $child      .= define_app_input($res_child, $res[1][$key_res], true, $res_input_default);
        }

        // clear custom tag
        preg_match_all('/<app-input (.*?)\/>/si', $res[1][$key_res], $res_child);
        foreach ($res_child[0] as $r) {
            $child      = str_replace($r, '', $child);
        }
        preg_match_all('/<app-select.*?>(.*?)<\/app-select>/si', $html, $res_child);
        foreach ($res_child[0] as $r) {
            $child      = str_replace($r, '', $child);
        }

        if ($child) {
            $class_required = strpos($child, 'required') !== false ? ' required' : '';
            $new_content    .= '<div class="row">' . "\n";
            if ($label_size && $label) {
                $new_content    .= '<label class="col-' . $size_param . $label_size . $class_required . ' form-label">' . $label . $sub_label . '</label>' . "\n";
            }
            $new_content    .= '<div class="col-' . $size_param . $input_size . '">' . "\n";
            $new_content    .= '<div class="row">' . "\n";
            $new_content    .= $child;
            $new_content    .= '</div>' . "\n";
            $new_content    .= '</div>' . "\n";
            $new_content    .= '</div>' . "\n";
        }
        $html   = str_replace($val_res, $new_content, $html);
    }

    // define app-input
    // allowed type : text, textarea, password, date, datetime, daterange, icon, tags, currency, color, fileupload, imageupload, range
    preg_match_all('/<app-input (.*?)\/>/si', $html, $res);
    $html   = define_app_input($res, $html);

    // define app-select
    preg_match_all('/<app-select.*?>(.*?)<\/app-select>/si', $html, $res);
    $html   = define_app_select($res, $html);

    //clear default
    preg_match_all('/<app-input-default(.*?)\/>/si', $html, $res);
    foreach ($res[0] as $r) {
        $html   = str_replace($r, '', $html);
    }

    return $html;
}

function define_app_input($res, $html, $grouping = false, $res_input_default = '')
{
    $validation_exist   = [];
    $path_exist         = [];
    $autocode_lists     = [];
    foreach ($res[0] as $key_res => $val_res) {
        $default    = [];

        // check default
        $temp_html      = substr($html, 0, strpos($html, $val_res));
        preg_match_all('/<app-input-default(.*?)\/>/si', $temp_html, $res2);
        if (count($res2[1]) == 0 && is_array($res_input_default) && isset($res_input_default[1])) {
            $res2[1]    = $res_input_default[1];
        }
        if (count($res2[1]) > 0) {
            $str_attr       = end($res2[1]);
            $list_attr      = explode(' ', $str_attr);
            $new_list_attr  = [];
            $i              = 0;
            $open_attr      = false;
            foreach ($list_attr as $l) {
                if (!$open_attr) {
                    $new_list_attr[$i]  = $l;
                } else {
                    $new_list_attr[$i]  .= ' ' . $l;
                }
                if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
                else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
                if (!$open_attr) $i++;
            }
            foreach ($new_list_attr as $l) {
                if (trim($l)) {
                    $attr_param = explode('=', $l);
                    $attr       = trim($attr_param[0]);
                    $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                    $default[$attr] = $val;
                }
            }
        }
        $validation_ref = isset($default['rules']) ? $default['rules'] : '';
        $_validation    = [];
        $_path          = [];
        if ($validation_ref) {
            if (!isset($validation_exist[$validation_ref])) {
                $_validation    = __validation($validation_ref);
                $validation_exist[$validation_ref]  = $_validation;
                $_path          = __rules_path($validation_ref);
                $path_exist[$validation_ref]        = $_path;
            } else {
                $_validation    = $validation_exist[$validation_ref];
                $_path          = $path_exist[$validation_ref];
            }
        }
        $autocode   = false;
        if (count($autocode_lists) == 0 && $validation_ref) {
            $kode       = get_data('kode', ['tabel' => table_prefix($validation_ref), 'is_active' => 1])->result();
            $autocode_lists['false']  = 'false'; // agar tidak di proses lagi loopingan autocode jika query kode tidak ada data
            foreach ($kode as $k) {
                $autocode_lists[$k->kolom]  = $k->kolom;
            }
        }

        $allowed_type   = ['text', 'hidden', 'textarea', 'password', 'password-toggle', 'date', 'datetime', 'daterange', 'number', 'icon', 'tags', 'currency', 'color', 'fileupload', 'imageupload', 'range', 'checkbox', 'switch', 'radio'];
        $type           = 'text';
        $label          = '';
        $sub_label      = '';
        $label_type     = isset($default['label-type']) ? $default['label-type'] : '';
        $id             = '';
        $name           = '';
        $validation     = '';
        $prefix         = '';
        $suffix         = '';
        $checked        = '';
        $length         = '';
        $class          = 'form-control ';
        $parent_class   = 'mb-3 ';
        $size           = isset($default['size'])       ? $default['size']          : '12:12';
        $size_param     = isset($default['size-param']) ? $default['size-param']    : 'md';
        $other_attr     = '';
        $value          = '';
        $locPath        = '';
        $dtPlacement    = 'left';
        $str_attr       = trim($res[1][$key_res]);
        preg_match_all('/<em.*?>(.*?)<\/em>/si', $str_attr, $res2);
        foreach ($res2[0] as $k_res2 => $v_res2) {
            $str_attr   = str_replace($v_res2, 'undefined', $str_attr);
        }
        $list_attr      = explode(' ', $str_attr);
        $new_list_attr  = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $new_list_attr[$i]  = $l;
            } else {
                $new_list_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }
        foreach ($new_list_attr as $l) {
            if (trim($l)) {
                $attr_param = explode('=', $l, 2);
                $attr       = trim($attr_param[0]);
                $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                if ($attr == 'type' && $val)             $type           = $val;
                else if ($attr == 'label' && $val)       $label          = $val;
                else if ($attr == 'sub-label' && $val)   $sub_label      = '<small class="d-block">' . $val . '</small>';
                else if ($attr == 'label-type' && $val)  $label_type     = $val;
                else if ($attr == 'name' && $val)        $name           = $id = $val;
                else if ($attr == 'id' && $val)          $id             = $val;
                else if ($attr == 'validation' && $val)  $validation     = $val;
                else if ($attr == 'class' && $val)       $class         .= $val;
                else if ($attr == 'parent-class' && $val) $parent_class  .= $val;
                else if ($attr == 'size' && $val)        $size           = $val;
                else if ($attr == 'size-param' && $val)  $size_param     = $val;
                else if ($attr == 'value' && $val)       $value          = $val;
                else if ($attr == 'length' && $val)      $length          = $val;
                else if ($attr == 'checked' && $val)     $checked        = $val;
                else if ($attr == 'data-path' && $val && ($type == 'imageupload' || $type == 'fileupload'))      $locPath        = trim($val, '/') . '/';
                else if ($attr == 'data-placement' && $val && in_array($type, ['date', 'datetime', 'daterange']))   $dtPlacement    = $val;
                else if (in_array($attr, ['prefix', 'prepend']) && $val)   $prefix    = $val;
                else if (in_array($attr, ['suffix', 'append']) && $val)    $suffix    = $val;
                else if (!in_array($attr, [
                    'type', 'label', 'sub-label', 'label-type', 'name', 'id', 'validation', 'class', 'size', 'parent-class', 'length',
                    'size-param', 'value', 'checked', 'append', 'prepend', 'suffix', 'prefix'
                ])) {
                    $other_attr    .= " {$l}";
                }
            }
        }
        if (isset($_path[$name])) {
            $locPath = $_path[$name];
        }
        if ($type == 'imageupload' || $type == 'fileupload') {
            $other_attr .= ' data-path="' . $locPath . '"';
        } elseif (in_array($type, ['date', 'datetime', 'daterange'])) {
            $other_attr .= ' data-placement="' . $dtPlacement . '"';
        }
        if (isset($_validation[$name])) {
            $validation = $_validation[$name];
            preg_match_all('/setting{(.*?)}/si', $validation, $res_val);
            foreach ($res_val[0] as $key_res_val => $val_res_val) {
                $validation    = str_replace($val_res_val, setting(trim($res_val[1][$key_res_val])), $validation);
            }
        }
        if (isset($autocode_lists[$name])) {
            if (strpos($other_attr, ' disabled') === false) $other_attr .= ' disabled="disabled"';
            if (strpos($other_attr, ' placeholder') === false) $other_attr .= ' placeholder="' . lang('otomatis_saat_disimpan') . '"';
            else {
                $strPlaceholder         = ' placeholder="';
                $posStartPlaceholder    = strpos($other_attr, $strPlaceholder);
                $posValue               = $posStartPlaceholder + strlen($strPlaceholder);
                $posEndPlaceholder      = strpos($other_attr, '"', $posValue);
                $valuePlaceholder       = substr($other_attr, $posValue, ($posEndPlaceholder - $posValue));
                $other_attr             = str_replace('placeholder="' . $valuePlaceholder . '"', 'placeholder="' . lang('otomatis_saat_disimpan') . '"', $other_attr);
            }
        }
        $new_content        = '';
        $class_container = '';
        if (in_array($type, $allowed_type)) {
            $input_type     = 'text';
            if (in_array($type, ['password', 'color', 'range', 'textarea', 'checkbox', 'radio', 'hidden'])) {
                $input_type = $type;
            } elseif ($type == 'password-toggle') {
                $input_type         = 'password';
                $class_container    .= ' password-toggle';
            } elseif ($type == 'switch') {
                $input_type         = 'checkbox';
            } elseif ($type == 'icon') {
                $prefix     = '';
                $suffix     = '&nbsp;';
                $other_attr .= ' data-placement="bottomLeft"';
            } elseif ($type == 'number') {
                if ($validation) {
                    if (strpos($validation, 'numeric') == false) {
                        $validation .= '|numeric';
                    }
                } else {
                    $validation = 'numeric';
                }
            }
            $x_size         = explode(':', $size);
            $label_size     = 0;
            $input_size     = 12;
            if (count($x_size) == 1 && (((int) $x_size[0] > 0 && (int) $x_size[0] <= 12) || $x_size[0] == 'auto')) {
                $label_size = $x_size[0];
                $input_size = $x_size[0];
            } elseif (count($x_size) == 2) {
                if ((int) $x_size[0] > 0 && (int) $x_size[0] <= 12) $label_size  = $x_size[0];
                if ((int) $x_size[1] > 0 && (int) $x_size[1] <= 12) $input_size  = $x_size[1];
            }
            if (!in_array($size_param, ['none', 'sm', 'md', 'lg', 'xl'])) $size_param    = 'md-';
            else if ($size_param == 'none') $size_param = '';
            else $size_param .= '-';
            $label_class    = strpos($validation, 'required') !== false ? ' required' : '';

            if ($type == 'imageupload') {
                $other_attr .= ' data-type="upload-image" data-value="' . $value . '"';
                $value      = '';
            } elseif ($type == 'fileupload') {
                $other_attr .= ' data-type="upload-file" data-value="' . $value . '"';
                $value      = '';
            } elseif ($type == 'range') {
                $class      = str_replace('form-control', 'form-range', $class);
                if (!$value) $value = 0;
            } elseif (in_array($type, ['checkbox', 'switch', 'radio'])) {
                $class      = str_replace('form-control', 'form-check-input', $class);
            } elseif (in_array($type, ['icon', 'tags', 'date', 'datetime', 'daterange', 'currency'])) {
                $class      .= ' input-' . strtolower($type);
            } elseif ($type == 'color') {
                $class      .= ' form-control-color mw-100';
            }

            $x_class        = explode(' ', $class);
            $a_class        = [];
            foreach ($x_class as $xc) {
                $a_class[$xc]   = $xc;
            }
            $class          = implode(" ", $a_class);

            if ($length) {
                $other_attr .= ' maxlength="' . $length . '" size="' . $length . '"';
            }

            if (!$grouping) {
                if ($label && $label_type == 'floating' && in_array($type, ['textarea', 'text'])) {
                    $new_content    .= '<div class="' . $parent_class . ' form-floating">' . "\n";
                    if ($input_type != 'textarea') {
                        $new_content    .= '<input type="' . $input_type . '" class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '" placeholder="' . strip_tags($label) . '" value="' . $value . '"' . $other_attr . '>';
                    } else {
                        $new_content    .= '<textarea class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '"' . $other_attr . ' placeholder="' . strip_tags($label) . '">' . $value . '</textarea>';
                    }
                    $new_content    .= '<label for="' . $id . '" class="' . $label_class . '">' . $label . $sub_label . '</label>' . "\n";
                    $new_content    .= '</div>' . "\n";
                } else {
                    if ($input_type != 'hidden') {
                        $new_content    .= '<div class="' . $parent_class . ' row">' . "\n";
                        if ($label_size && $label) {
                            $new_content    .= '<label for="' . $id . '" class="col-' . $size_param . $label_size . $label_class . ' form-label">' . $label . $sub_label . '</label>' . "\n";
                        } else {
                            $input_size = 12;
                        }
                        $new_content    .= '<div class="col-' . $size_param . $input_size . $class_container . '">' . "\n";
                        if ($suffix || $prefix) {
                            $new_content    .= '<div class="input-group">' . "\n";
                        }
                        if ($prefix) {
                            if (substr($prefix, 0, 5) == 'help:') {
                                $new_content    .= '<button type="button" class="btn btn-app ' . $name . '-help" data-appinity-tooltip="right" aria-label="' . substr($suffix, 5) . '"><i class="fa-question-circle"></i></button>';
                            } else {
                                if (strpos($prefix, 'fa-') !== false) $prefix = '<i class="' . $prefix . '"></i>';
                                $new_content    .= '<div class="input-group-text">' . $prefix . '</div>' . "\n";
                            }
                        }
                    }
                    if ($input_type == 'textarea') {
                        $new_content    .= '<textarea class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '"' . $other_attr . '>' . $value . '</textarea>' . "\n";
                    } elseif (in_array($type, ['checkbox', 'switch', 'radio'])) {
                        if ($checked == $value) {
                            $other_attr .= ' checked';
                        }
                        $checkbox_class = $type == 'switch' ? ' form-switch' : '';
                        $new_content    .= '<div class="form-check' . $checkbox_class . '">' . "\n";
                        $new_content    .= '<input type="' . $input_type . '" class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" value="' . $value . '"' . $other_attr . '>' . "\n";
                        $new_content    .= '</div>' . "\n";
                    } else {
                        $new_content    .= '<input type="' . $input_type . '" class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '" value="' . $value . '"' . $other_attr . '>' . "\n";
                        if ($type == 'password-toggle') {
                            $new_content .= '<a href="javascript:;"><i class="fa-eye"></i></a>';
                        }
                    }
                    if ($input_type != 'hidden') {
                        if ($suffix) {
                            if (substr($suffix, 0, 5) == 'help:') {
                                $new_content    .= '<button type="button" class="btn btn-app ' . $name . '-help" data-appinity-tooltip="left" aria-label="' . substr($suffix, 5) . '"><i class="fa-question-circle"></i></button>';
                            } else {
                                if (strpos($suffix, 'fa-') !== false) $suffix = '<i class="' . $suffix . '"></i>';
                                $new_content    .= '<div class="input-group-text">' . $suffix . '</div>' . "\n";
                            }
                        }
                        if ($suffix || $prefix) {
                            $new_content    .= '</div>' . "\n";
                        }
                        $new_content    .= '</div>' . "\n";
                        $new_content    .= '</div>' . "\n";
                    }
                }
            } else {
                $new_content    .= '<div class="' . $parent_class . ' col-' . $size_param . $input_size . '">' . "\n";
                if ($suffix || $prefix) {
                    $new_content    .= '<div class="input-group">' . "\n";
                }
                if ($prefix) {
                    if (strpos($prefix, 'fa-') !== false) $prefix = '<i class="' . $prefix . '"></i>';
                    $new_content    .= '<div class="input-group-text">' . $prefix . '</div>' . "\n";
                }
                if ($input_type == 'textarea') {
                    $new_content    .= '<textarea class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" placeholder="' . strip_tags($label) . '" data-validation="' . $validation . '"' . $other_attr . '>' . $value . '</textarea>' . "\n";
                } elseif (in_array($type, ['checkbox', 'switch', 'radio'])) {
                    if ($checked == $value) {
                        $other_attr .= ' checked';
                    }
                    $checkbox_class = $type == 'switch' ? ' form-switch' : '';
                    $new_content    .= '<div class="form-check' . $checkbox_class . '">' . "\n";
                    $new_content    .= '<input type="' . $input_type . '" class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" value="' . $value . '"' . $other_attr . '>' . "\n";
                    if ($label) {
                        $new_content    .= '<label class="form-check-label" for="' . $id . '">' . $label . '</label>' . "\n";
                    }
                    $new_content    .= '</div>' . "\n";
                } else {
                    $new_content    .= '<input type="' . $input_type . '" class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" placeholder="' . strip_tags($label) . '" data-validation="' . $validation . '" value="' . $value . '"' . $other_attr . '>' . "\n";
                }
                if ($suffix) {
                    if (strpos($suffix, 'fa-') !== false) $suffix = '<i class="' . $suffix . '"></i>';
                    $new_content    .= '<div class="input-group-text">' . $suffix . '</div>' . "\n";
                }
                if ($suffix || $prefix) {
                    $new_content    .= '</div>' . "\n";
                }
                $new_content    .= '</div>' . "\n";
            }
        }

        $html   = str_replace($val_res, $new_content, $html);
    }
    return $html;
}

function define_app_select($res, $html, $grouping = false, $res_input_default = '')
{
    $validation_exist   = [];
    foreach ($res[0] as $key_res => $val_res) {
        $default    = [];

        // check default
        $temp_html  = substr($html, 0, strpos($html, $val_res));
        preg_match_all('/<app-input-default(.*?)\/>/si', $temp_html, $res2);
        if (count($res2[1]) == 0 && is_array($res_input_default) && isset($res_input_default[1])) {
            $res2[1]    = $res_input_default[1];
        }
        if (count($res2[1]) > 0) {
            $str_attr       = end($res2[1]);
            $list_attr      = explode(' ', $str_attr);
            $new_list_attr  = [];
            $i              = 0;
            $open_attr      = false;
            foreach ($list_attr as $l) {
                if (!$open_attr) {
                    $new_list_attr[$i]  = $l;
                } else {
                    $new_list_attr[$i]  .= ' ' . $l;
                }
                if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
                else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
                if (!$open_attr) $i++;
            }
            foreach ($new_list_attr as $l) {
                if (trim($l)) {
                    $attr_param = explode('=', $l);
                    $attr       = trim($attr_param[0]);
                    $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                    $default[$attr] = $val;
                }
            }
        }

        $validation_ref = isset($default['rules']) ? $default['rules'] : '';
        $_validation    = [];
        if ($validation_ref) {
            if (!isset($validation_exist[$validation_ref])) {
                $_validation    = __validation($validation_ref);
                $validation_exist[$validation_ref]  = $_validation;
            } else {
                $_validation    = $validation_exist[$validation_ref];
            }
        }

        $label          = '';
        $sub_label      = '';
        $label_type     = isset($default['label-type']) ? $default['label-type'] : '';
        $id             = '';
        $name           = '';
        $validation     = '';
        $prefix         = '';
        $suffix         = '';
        $class          = 'form-select ';
        $parent_class   = 'mb-3 ';
        $size           = isset($default['size'])       ? $default['size']          : '12:12';
        $size_param     = isset($default['size-param']) ? $default['size-param']    : 'md';
        $other_attr     = '';
        $value          = '';

        $tag            = str_replace($res[1][$key_res], '', $val_res);
        $attr           = trim(str_replace(['app-select', '</', '<', '>'], '', $tag));
        $list_attr      = explode(' ', $attr);
        $x_attr         = [];
        $i              = 0;
        $open_attr      = false;
        foreach ($list_attr as $l) {
            if (!$open_attr) {
                $x_attr[$i]  = $l;
            } else {
                $x_attr[$i]  .= ' ' . $l;
            }
            if (!$open_attr && strpos($l, '="') !== false && count(explode('"', $l)) == 2) $open_attr = true;
            else if ($open_attr && strpos($l, '"') !== false) $open_attr   = false;
            if (!$open_attr) $i++;
        }

        foreach ($x_attr as $l) {
            if (trim($l)) {
                $attr_param = explode('=', $l);
                $attr       = trim($attr_param[0]);
                $val        = isset($attr_param[1]) ? trim(trim($attr_param[1]), '"') : '';
                if ($attr == 'label' && $val)       $label      = $val;
                else if ($attr == 'sub-label' && $val)   $sub_label      = '<small class="d-block">' . $val . '</small>';
                else if ($attr == 'label-type' && $val)  $label_type     = $val;
                else if ($attr == 'name' && $val)        $name           = $id = $val;
                else if ($attr == 'id' && $val)          $id             = $val;
                else if ($attr == 'validation' && $val)  $validation     = $val;
                else if ($attr == 'class' && $val)       $class         .= $val;
                else if ($attr == 'parent-class' && $val) $parent_class  .= $val;
                else if ($attr == 'size' && $val)        $size           = $val;
                else if ($attr == 'size-param' && $val)  $size_param     = $val;
                else if ($attr == 'value' && $val)       $value          = $val;
                else if (in_array($attr, ['prefix', 'prepend']) && $val)   $prefix    = $val;
                else if (in_array($attr, ['suffix', 'append']) && $val)    $suffix    = $val;
                else if (!in_array($attr, [
                    'label', 'sub-label', 'label-type', 'name', 'id', 'validation', 'class', 'size',
                    'size-param', 'value', 'append', 'prepend', 'suffix', 'prefix'
                ])) {
                    $other_attr    .= " {$l}";
                }
            }
        }
        if (isset($_validation[$name])) {
            $validation = $_validation[$name];
            preg_match_all('/setting{(.*?)}/si', $validation, $res_val);
            foreach ($res_val[0] as $key_res_val => $val_res_val) {
                $validation    = str_replace($val_res_val, setting(trim($res_val[1][$key_res_val])), $validation);
            }
        }
        $new_content        = '';
        $class_container    = '';

        $x_size         = explode(':', $size);
        $label_size     = 0;
        $input_size     = 12;
        if (count($x_size) == 1 && (int) $x_size[0] > 0 && (int) $x_size[0] <= 12) {
            $label_size = $x_size[0];
            $input_size = $x_size[0];
        } elseif (count($x_size) == 2) {
            if ((int) $x_size[0] > 0 && (int) $x_size[0] <= 12) $label_size  = $x_size[0];
            if ((int) $x_size[1] > 0 && (int) $x_size[1] <= 12) $input_size  = $x_size[1];
        }
        if (!in_array($size_param, ['none', 'sm', 'md', 'lg', 'xl'])) $size_param    = 'md-';
        else if ($size_param == 'none') $size_param = '';
        else $size_param .= '-';
        $label_class    = strpos($validation, 'required') !== false ? ' required' : '';

        $x_class        = explode(' ', $class);
        $a_class        = [];
        foreach ($x_class as $xc) {
            $a_class[$xc]   = $xc;
        }
        $class          = implode(" ", $a_class);

        if (!$grouping) {
            if ($label && $label_type == 'floating') {
                $new_content    .= '<div class="' . $parent_class . ' form-floating">' . "\n";
                $new_content    .= '<select class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '" placeholder="' . strip_tags($label) . '" value="' . $value . '"' . $other_attr . '>' . "\n";
                $new_content    .= $res[1][$key_res];
                $new_content    .= '</select>' . "\n";
                $new_content    .= '<label for="' . $id . '" class="' . $label_class . '">' . $label . $sub_label . '</label>' . "\n";
                $new_content    .= '</div>' . "\n";
            } else {
                $new_content    .= '<div class="' . $parent_class . ' row">' . "\n";
                if ($label_size && $label) {
                    $new_content    .= '<label for="' . $id . '" class="col-' . $size_param . $label_size . $label_class . ' form-label">' . $label . $sub_label . '</label>' . "\n";
                } else {
                    $input_size = 12;
                }
                $new_content    .= '<div class="col-' . $size_param . $input_size . $class_container . '">' . "\n";
                if ($suffix || $prefix) {
                    $new_content    .= '<div class="input-group">' . "\n";
                }
                if ($prefix) {
                    if (strpos($prefix, 'fa-') !== false) $prefix = '<i class="' . $prefix . '"></i>';
                    $new_content    .= '<div class="input-group-text">' . $prefix . '</div>' . "\n";
                }
                $new_content    .= '<select class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '"' . $other_attr . '>' . "\n";
                $option_content = $res[1][$key_res];
                if (strpos($other_attr, 'multiple') !== false) {
                    $option_val = explode(',', $value);
                    foreach ($option_val as $ov) {
                        $option_content = str_replace('value="' . $ov . '"', 'value="' . $ov . '" selected', $option_content);
                    }
                } else {
                    $option_content = str_replace('value="' . $value . '"', 'value="' . $value . '" selected', $option_content);
                }
                $new_content    .= $option_content;
                $new_content    .= '</select>' . "\n";
                if ($suffix) {
                    if (strpos($suffix, 'fa-') !== false) $suffix = '<i class="' . $suffix . '"></i>';
                    $new_content    .= '<div class="input-group-text">' . $suffix . '</div>' . "\n";
                }
                if ($suffix || $prefix) {
                    $new_content    .= '</div>' . "\n";
                }
                $new_content    .= '</div>' . "\n";
                $new_content    .= '</div>' . "\n";
            }
        } else {
            $new_content    .= '<div class="' . $parent_class . ' col-' . $size_param . $input_size . '">' . "\n";
            if ($suffix || $prefix) {
                $new_content    .= '<div class="input-group">' . "\n";
            }
            if ($prefix) {
                if (strpos($prefix, 'fa-') !== false) $prefix = '<i class="' . $prefix . '"></i>';
                $new_content    .= '<div class="input-group-text">' . $prefix . '</div>' . "\n";
            }
            $new_content    .= '<select class="' . $class . '" id="' . $id . '" name="' . $name . '" aria-label="' . strip_tags($label) . '" data-validation="' . $validation . '" placeholder="' . strip_tags($label) . '"' . $other_attr . '>' . "\n";
            $option_content = $res[1][$key_res];
            if (strpos($other_attr, 'multiple') !== false) {
                $option_val = explode(',', $value);
                foreach ($option_val as $ov) {
                    $option_content = str_replace('value="' . $ov . '"', 'value="' . $ov . '" selected', $option_content);
                }
            } else {
                $option_content = str_replace('value="' . $value . '"', 'value="' . $value . '" selected', $option_content);
            }
            $new_content    .= $option_content;
            $new_content    .= '</select>' . "\n";
            if ($suffix) {
                if (strpos($suffix, 'fa-') !== false) $suffix = '<i class="' . $suffix . '"></i>';
                $new_content    .= '<div class="input-group-text">' . $suffix . '</div>' . "\n";
            }
            if ($suffix || $prefix) {
                $new_content    .= '</div>' . "\n";
            }
            $new_content    .= '</div>' . "\n";
        }

        $html   = str_replace($val_res, $new_content, $html);
    }
    return $html;
}

function render_css($content = '', $str_view = '')
{
    $return_css  = '';
    $css         = '';
    $inline_css  = '';
    preg_match_all('/<link.*?(.*?)>/si', $content, $res);
    if (isset($res[0])) {
        foreach ($res[0] as $r) {
            $return_css .= $r . PHP_EOL;
        }
    }

    preg_match_all('/<style.*?>(.*?)<\/style>/si', $content, $res);
    if (isset($res[1])) {
        if (isset($res[0]) && isset($res[0][0]) && strpos($res[0][0], 'data-inline') !== false) {
            foreach ($res[1] as $k => $r) {
                if (ENVIRONMENT == 'production') {
                    $inline_css    .= minify_css($r);
                } else {
                    $inline_css    .= $r;
                }
            }
        } else {
            foreach ($res[1] as $k => $r) {
                if (ENVIRONMENT == 'production') {
                    $css    .= minify_css($r);
                } else {
                    $css    .= $r;
                }
            }
        }
    }

    if (!is_dir(FCPATH . 'assets/cache')) {
        $oldmask = umask(0);
        mkdir(FCPATH . 'assets/cache', 0777);
        umask($oldmask);
    }

    $filename   = 'assets/cache/' . md5($str_view) . '.css';
    if ($css) {
        $render = false;
        if (file_exists($filename)) {
            $str_file   = file_get_contents($filename);
            if ($str_file != $css) $render = true;
        } else $render = true;
        if ($render) {
            $handle = fopen($filename, "wb");
            if ($handle) {
                fwrite($handle, $css);
            }
            fclose($handle);
        }
        $return_css .= file_exists($filename) ? '<link rel="stylesheet" type="text/css" href="' . base_url($filename) . '?v=' . APP_VERSION . '" />' : '<style type="text/css">' . $css . '</style>';
    }
    if ($inline_css) {
        $return_css .= '<style type="text/css">' . $inline_css . '</style>';
    }
    return $return_css;
}

function render_js($content = '', $str_view = '')
{
    $return_js  = '';
    $inline_js  = '';
    $js         = '';
    preg_match_all('/<script.*?>(.*?)<\/script>/si', $content, $res);
    if (isset($res[1])) {
        foreach ($res[1] as $k => $r) {
            $_res0 = str_replace($r, '', $res[0][$k]);
            if (strpos($_res0, ' src=') !== false) {
                $return_js .= str_replace('.js', '.js?v=' . APP_VERSION, $res[0][$k]) . PHP_EOL;
            } elseif (strpos($_res0, 'data-inline') !== false) {
                if (ENVIRONMENT !== 'production' && strpos($_res0, 'data-unminify') == false) {
                    $inline_js  .= minify_js($r);
                } else {
                    $inline_js  .= trim($r, "\n");
                }
            } else {
                if (ENVIRONMENT == 'production') {
                    $js     .= minify_js($r);
                } else {
                    $js     .= trim($r, "\n");
                }
            }
        }
    }

    if (!is_dir(FCPATH . 'assets/cache')) {
        $oldmask = umask(0);
        mkdir(FCPATH . 'assets/cache', 0777);
        umask($oldmask);
    }

    $filename   = 'assets/cache/' . md5($str_view) . '.js';
    if ($js) {
        $render = false;
        if (file_exists($filename)) {
            $str_file   = file_get_contents($filename);
            if ($str_file != $js) $render = true;
        } else $render = true;
        if ($render) {
            $handle = fopen($filename, "wb");
            if ($handle) {
                fwrite($handle, $js);
            }
            fclose($handle);
        }
        $return_js .= file_exists($filename) ? '<script type="text/javascript" src="' . base_url($filename) . '?v=' . APP_VERSION . '"></script>' : '<script type="text/javascript">' . $js . '</script>' . PHP_EOL;
    }
    if ($inline_js) {
        $return_js .= '<script type="text/javascript">' . $inline_js . '</script>' . PHP_EOL;
    }
    return $return_js;
}

function clear_custom_tag($content = '')
{
    $content    = preg_replace('/<action-header\b[^>]*>(.*?)<\/action-header>/is', '', $content);
    $content    = preg_replace('/<action-header-additional\b[^>]*>(.*?)<\/action-header-additional>/is', '', $content);
    $html       = preg_replace('/<right-panel\b[^>]*>(.*?)<\/right-panel>/is', '', $content);
    return $html;
}

function clear_css($content = '')
{
    $content = preg_replace('/<link.*?(.*?)>/is', '', $content);
    $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $content);
    return $html;
}

function clear_js($content = '')
{
    $content    = str_replace('.js', '.js?v=' . APP_VERSION, $content);
    $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $content);
    return $html;
}
