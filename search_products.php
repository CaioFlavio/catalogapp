<?php
	### DESABILITA ERROS ###
	### MOSTRAR OS ERROS ###
	ini_set('display_errors',1);
	ini_set('display_startup_erros',1);
	error_reporting(E_ALL);

	define("DB_DSN", "mysql:host=localhost;dbname=app"); // CONNECTION STRING
	define("DB_USERNAME", "root"); //DATABASE USERNAME
	define("DB_PASSWORD", ""); //DATABASE USERNAME
	define("CLS_PATH", "class"); //CLASS PATH

	try{
		$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
	}catch(PDOException $e){
		echo $e->getMessage();
	}

	$search = $_GET['busca'];
	if($search != ""){
		$sql = "SELECT * FROM products WHERE products LIKE '%$search%' ORDER BY products ASC";
		$query = $conn->prepare($sql);
		$query->execute();

		foreach($query as $row){			
?>					

		<div class="row home-content" id="resultados">
			<div class="col-xs-3 product-image text-center">
				<img class="img-responsive" src="img/trakinas.png"/>
			</div>
			<div class="col-xs-9 product-info">
				Produto: <?= $row['products']; ?>
			</div>	
		</div>	
<?php
		}
	}	

?>