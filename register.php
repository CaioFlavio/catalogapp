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

	<script type="text/javascript">
	</script>
</head>
<body style="vertical-align:middle;">
	<div class="container login" id="login">
		<div class="row">
			<div class="col-xs-12 login-head">
				<h1> Registre-se </h1>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 login-form">
				<form class="form-signin" id="formID" method="post" action="">
					<div class="form-group">
						<label for="inputlogin">Nome*</label>
						<input type="text" class="form-control" name="name" id="name" required/> 
					</div>
					<div class="form-group">
						<label for="inputlogin">Razão Social*</label>
						<input type="text" class="form-control" name="razao" id="razao" required/> 
					</div>
					<div class="form-group">
						<label for="inputlogin">CNPJ*</label>
						<input type="text" class="form-control" name="username" id="cnpj" required/> 
					</div>
					<div class="form-group">
						<label for="inputlogin">E-mail*</label>
						<input type="email" class="form-control" name="email" id="email" required/> 
					</div>
					<div class="form-group">
						<label for="inputlogin">Telefone*</label>
						<input type="text" class="form-control" name="telefone" id="telefone" required/> 
					</div>

					<div class="form-group">
						<label for="inputpass">Senha</label>
						<input type="password" class="form-control" name="password" id="pass" maxlength="8" required /> 
					</div>
					<div class="form-group">
						<button type="submit" class="btn btn-default col-xs-12" name="cadastro">Solicitar Cadastro</button>
					<?php 
						if(!(isset($_POST['cadastro']))){
							echo $_POST['username'];
						}else{
							$usr = new Users;
							$usr->storeFormValues($_POST);
							if($usr->userRegister()) { ?>
								<span class="pull-left">Bem-vindo</span> <?php	
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