<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="-">
	<meta name="base_url" content="<?php echo base_url(); ?>">
	<title><?= $title; ?></title>
	<?php
    Asset::css('bootstrap.min.css', true);
    Asset::css('roboto.css', true);
    Asset::css('fontawesome.regular.css', true);
    Asset::css('styles.css', true);
    echo Asset::render();
    ?>
</head>

<body class="shadow-theme right-panel-show" data-theme="light">
	<div id="main-panel">
		<div class="panel-content p-4">
            <?= $__content; ?>
		</div>
	</div>
	<?php
	Asset::js('jquery.js', true);
	Asset::js('jquery.inputmask.js', true);
	Asset::js('jquery.contextmenu.js', true);
	Asset::js('bootstrap.bundle.min.js', true);
	Asset::js('hashids.min.js', true);
	Asset::js('select2.full.js', true);
	Asset::js('sweetalert.min.js', true);
	Asset::js('app.fn.js', true);
	Asset::js('appinityTable.js', true);
	Asset::js('app.js', true);
	Asset::js('main.js', true);
	echo Asset::render();
	echo $__js;
	?>
</body>

</html>