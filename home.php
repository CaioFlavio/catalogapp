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
	<script>
	//função para pegar o objeto ajax do navegador
	function xmlhttp()
	{
		// XMLHttpRequest para firefox e outros navegadores
		if (window.XMLHttpRequest)
		{
			return new XMLHttpRequest();
		}

		// ActiveXObject para navegadores microsoft
		var versao = ['Microsoft.XMLHttp', 'Msxml2.XMLHttp', 'Msxml2.XMLHttp.6.0', 'Msxml2.XMLHttp.5.0', 'Msxml2.XMLHttp.4.0', 'Msxml2.XMLHttp.3.0','Msxml2.DOMDocument.3.0'];
		for (var i = 0; i < versao.length; i++)
		{
			try
			{
				return new ActiveXObject(versao[i]);
			}
			catch(e)
			{
				alert("Seu navegador não possui recursos para o uso do AJAX!");
			}
		} // fecha for
		return null;
	} // fecha função xmlhttp

	//função para fazer a requisição da página que efetuará a consulta no DB
	function carregar()
	{
	   a = document.getElementById('busca').value;
	   ajax = xmlhttp();
	   if (ajax)
	   {
		   ajax.open('get','search_products.php?busca='+a, true);
		   ajax.onreadystatechange = trazconteudo; 
		   ajax.send(null);
	   }
	}

	//função para incluir o conteúdo na pagina
	function trazconteudo()
	{
		if (ajax.readyState==4)
		{
			if (ajax.status==200)
			{
				document.getElementById('resultados').innerHTML = ajax.responseText;
			}
		}
	}

	</script>

</head>
<body>
	<div class="container">
		<div class="row home-head">
			<div class="col-xs-4 text-center">
				<h1><img src="img/logo.png"></h1>
			</div>
			<div class="col-xs-8 search-form text-center">
				<form class="form-search"  action="" method="post" id="search">
					<label class="text-left"></label>
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
				<a href=""><img src="img/exit.png"/></a>
			</div> 									
		</div>
		<div id="resultados">
										
		</div>		
	</div>
</body>
</html>