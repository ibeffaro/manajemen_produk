<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?>

<div class="container py-4">
<div style="border:1px solid #990000;padding-left:20px;margin:0 0 10px 0;" class="card border-danger p-0 m-0">

		<h4 class="f-110 fw-bold card-header bg-danger text-white">A PHP Error was encountered</h4>
		<div class="card-body">
			<p class="mb-2">Severity: <span class="fw-bold"><?php echo $severity; ?></span></p>
			<p class="mb-2">Message:  <span class="fw-bold"><?php echo $message; ?></span></p>
			<p class="mb-2">Filename: <span class="fw-bold"><?php echo $filepath; ?></span></p>
			<p class="mb-2">Line Number: <span class="fw-bold"><?php echo $line; ?></span></p>

			<?php if (defined('SHOW_DEBUG_BACKTRACE') && SHOW_DEBUG_BACKTRACE === TRUE): ?>

				<p>Backtrace:</p>
				<ol class="list-group list-group-numbered">
				<?php foreach (debug_backtrace() as $error): ?>

					<?php if (isset($error['file']) && strpos($error['file'], realpath(BASEPATH)) !== 0): ?>

						<li class="list-group-item d-flex justify-content-between align-items-start">
							<div class="ms-2 me-auto">
								<div class="fw-bold">File: <?php echo $error['file'] ?></div>
								Function: <?php echo $error['function'] ?>
							</div>
							<span class="badge bg-danger rounded-pill">Line: <?php echo $error['line'] ?></span>
							
						</li>

					<?php endif ?>

				<?php endforeach ?>
				</ol>

			<?php endif ?>
		</div>
	</div>
</div>