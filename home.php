<?php 
	include_once("config.php");
	include_once("functions.php");
	session_start();
	if (isset($_SESSION['user'])){

	}else{
		header('Location: index.php');
	}
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
	<div class="container">
		<div class="row home-head">
			<div class="col-xs-4  text-center">
				<h1><img src="img/logo.png"></h1>
			</div>
			<div class="col-xs-7 col-xs-push-1 search-form text-center">
				<form class="form-search"  action="" method="post" id="search">
					<label class="text-left" style="width:100%;">Bem-vindo <?php $user = $_SESSION['user']; print_r(info($user)); ?></label>
				    <div class="input-group">
				    	<input type="text" class="form-control" id="busca" placeholder="Digite o nome ou código do produto"  onkeyUp="carregar()" value="">				    	
				    	<span class="input-group-btn">
				        	<button class="btn btn-default" type="button"><img width="10px" src="img/search.png"/></button>
				      	</span>	  				      
				    </div>		
				</form>
			</div>
		</div>
		<div class="row home-menu">
			<div class="col-xs-3 text-center">
				<a href=""><img src="img/home.png"/></a>
			</div> 
			<div class="col-xs-3 text-center">
				<a href=""><img src="img/cart.png"/></a>
			</div> 
			<div class="col-xs-3 text-center">
				<a href=""><img src="img/client.png"/></a>
			</div> 
			<div class="col-xs-3 text-center">
				<a href="logout.php"><img src="img/exit.png"/></a>
			</div> 									
		</div>
		<div id="resultados">
										
		</div>		
	</div>
</body>
</html>