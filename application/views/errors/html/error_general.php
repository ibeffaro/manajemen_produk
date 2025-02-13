<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Error">
<link rel="stylesheet" href="<?=base_url('assets/css/bootstrap.min.css');?>" />
<link rel="stylesheet" href="<?=base_url('assets/css/roboto.css');?>" />
<link rel="stylesheet" href="<?=base_url('assets/css/styles.css');?>" />
<title>Error</title>
</head>
<body class="shadow-theme">
	<div class="container py-4">
		<div class="card">
			<div class="card-header"><?=$heading;?></div>
			<div class="card-body"><?=$message;?></div>
		</div>
	</div>
</body>
</html>