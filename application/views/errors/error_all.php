<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="<?=setting('description');?>">
<meta name="base-url" content="<?=base_url();?>">
<meta name="app-number" content="<?=round((strtotime(date('Y-m-d')) / 1000) * 2);?>">
<meta name="app-token" content="<?=isset($__app_token) ? $__app_token : '';?>">
<meta name="client-token" content="<?=isset($__client_token) ? $__client_token : '';?>">
<title><?=$title;?></title>
<link rel="shortcut icon" href="<?=asset_url('uploads/settings/'.setting('favicon'));?>" />
<?php
Asset::css('bootstrap.min.css', true);
Asset::css('roboto.css', true);
Asset::css('fontawesome.regular.css', true);
Asset::css('styles.css', true);
echo Asset::render();
if(setting('font_type') && setting('font_type') != 'roboto') {
    echo '<link rel="stylesheet" href="'.asset_url('fonts/'.setting('font_type').'/font.css').'" />' . "\n";
}
echo Asset::render();
echo $__custom_css;
?>
</head>
<body class="<?php echo get_cookie('app-shadow-theme') != 'flat' ? 'shadow-theme' : '';?>" data-theme="<?=$__theme;?>">
<?php if(setting('background_login_active') && setting('background_login') && file_exists(FCPATH . 'assets/uploads/settings/' . setting('background_login'))) {
	echo '<div class="auth-bg" style="background-image: url('.base_url('assets/uploads/settings/'.setting('background_login')).')"></div>';
} ?>
<div class="container auth-container">
	<div class="row justify-content-center">
		<div class="col col-md-12 col-lg-10 col-xl-8">
			<div id="auth-panel">
				<div class="left-side">
					<a href="#" class="app-logo">
						<img src="<?=asset_url('uploads/settings/'.setting('logo'));?>" alt="" />
					</a>
					<img src="<?=asset_url("images/{$image}.svg"); ?>" class="img-view" />
				</div>
				<div class="right-side">
					<div class="auth-content">
						<div class="setting-menu dropdown d-flex">
							<a href="#" class="dropdown-toggle ms-auto" id="dropdownSetting" data-bs-auto-close="outside" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-ellipsis-v"></i></a>
							<div class="dropdown-menu dropdown-menu-end dropdown-setting p-3" aria-labelledby="dropdownSetting">
							<div class="fw-bold mb-2"><?=lang('tema');?></div>
								<div class="d-flex">
									<div class="w-50 mb-1 me-1">
										<a href="javascript:;" class="display-setting display-theme<?php if($__theme == 'light') echo ' active';?>" data-val="light">
											<i class="fa-sun"></i>
											<?=lang('terang');?>
										</a>
									</div>
									<div class="w-50 mb-1 ms-1">
										<a href="javascript:;" class="display-setting display-theme<?php if($__theme == 'dark') echo ' active';?>" data-val="dark">
											<i class="fa-moon"></i>
											<?=lang('gelap');?>
										</a>
									</div>
								</div>
								<div class="d-flex mb-3">
									<div class="mt-1 w-100">
										<a href="javascript:;" class="display-setting display-theme<?php if($__theme == 'dark2') echo ' active';?>" data-val="dark2">
											<i class="fa-moon-stars"></i>
											<?=lang('gelap_alternatif');?>
										</a>
									</div>
								</div>
								<div class="fw-bold mb-2"><?=lang('desain');?></div>
								<div class="d-flex mb-3">
									<div class="w-50 me-1">
										<a href="javascript:;" class="display-setting display-design<?php if(get_cookie('app-shadow-theme') == 'flat') echo ' active';?>" data-val="flat">
											<i class="fa-square"></i>
											<?=lang('datar');?>
										</a>
									</div>
									<div class="w-50 ms-1">
										<a href="javascript:;" class="display-setting display-design<?php if(get_cookie('app-shadow-theme') != 'flat') echo ' active';?>" data-val="shadow">
											<i class="fa-clone"></i>
											<?=lang('bayang');?>
										</a>
									</div>
								</div>
								<div class="fw-bold mb-2"><?=lang('bahasa');?></div>
								<div id="language-menu">
									<?php foreach($__lang as $l) { ?>
									<a href="javascript:;" data-value="<?=$l['id'];?>" class="<?php if($l['id'] == setting('language')) echo 'active'; ?>" title="<?=$l['label'];?>">
										<img src="<?=asset_url('images/flags/'.$l['code'].'.svg');?>" alt="<?=$l['code'];?>" />
									</a>
									<?php } ?>
								</div>
							</div>
						</div>
						<div class="auth-container error-content">
							<div class="error-code">
								<?php if($error_code) { ?>
								<div class="error-number"><?=$error_code;?></div>
								<?php } ?>
								<div class="error-desc<?php if(!$error_code) echo ' p-0'; ?>"><?=$title;?></div>
							</div>
							<div class="error-message mb-3"><?=$message;?></div>
							<a href="javascript:history.back();" class="btn btn-app pl-4 pr-4"><?=lang('halaman_sebelumnya');?></a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<?php
Asset::js('jquery.js', true);
Asset::js('bootstrap.bundle.min.js', true);
Asset::js('app.fn.js', true);
Asset::js('app.js', true);
echo Asset::render();
?>
</body>
</html>