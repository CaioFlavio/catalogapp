<?php 
	include_once("config.php");
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<title>CatalogApp</title>
	<link href="css/bootstrap.min.css" rel="stylesheet">
	<link href="css/style.css" rel="stylesheet">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script src="js/jquery.maskedinput.js" type="text/javascript"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/script.js"></script>
</head>
<body>
	<div class="container login" id="login">
		<div class="row">
			<div class="col-xs-12 login-head">
				<h1> Login </h1>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 login-form">
				<form class="form-signin" id="formID" method="post" action="">
					<div class="form-group">
						<label for="inputlogin">Login</label>
						<input type="text" class="form-control" name="username" id="cnpj"/> 
					</div>	
					<div class="form-group">
						<label for="inputpass">Senha</label>
						<input type="password" class="form-control" name="password" id="pass" maxlength="8" /> 
					</div>
					<div class="form-group">
						<button type="submit" class="btn btn-default col-xs-12" name="login">Logar</button>
					<?php 
						if(!(isset($_POST['login']))){
							echo $_POST['username'];
						}else{
							$usr = new Users;
							$usr->storeFormValues($_POST);
							if($usr->userLogin()) { ?>
								<span class="pull-left"><?php header("location:home.php") ?></span> <?php	
							}else{?>
								<span class="pull-left">Usuário/Senha Incorretos</span><?php
							}
						}
					?>
						<a href="register.php" class="pull-right new-account">Não sou cliente.</a>
					</div>
						
				</form>
			</div>
		</div>
	</div>
</body>
</html>