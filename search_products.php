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
	if($search != "" AND !is_numeric($search)){
		$sql = "SELECT * FROM products WHERE product LIKE '%$search%' ORDER BY product ASC";
		$query = $conn->prepare($sql);
		$query->execute();

		foreach($query as $row){			
?>		
			<div class="row home-content vertical-align">
				<div class="col-xs-3 product-image ">
					<img class="img-responsive trak" src="img/trakinas.png"/>
				</div>
				<div class="col-xs-7 product-info text-left">
					<a href="#">
					Produto: <?= $row['product']; ?> <br/>
					Marca: <?= $row['manufacturer'] ?> <br/>
					Preço: <?= number_format($row['price'], 2) ?> <br/>
					</a>
				</div>
				<div class="col-xs-2 add-to-cart">
					<a href="#"><img src="img/add.png"/></a>
				</div>	

			</div>	
<?php
		}
	}else if ($search != "" AND is_numeric($search)){
		$sql = "SELECT * FROM products WHERE id = $search ORDER BY product ASC";
		$query = $conn->prepare($sql);
		$query->execute();

		foreach($query as $row){			
?>		
			<div class="row home-content vertical-align">
				<div class="col-xs-3 product-image ">
					<img class="img-responsive trak" src="img/trakinas.png"/>
				</div>
				<div class="col-xs-7 product-info text-left">
					<a href="#">
					Produto: <?= $row['product']; ?> <br/>
					Marca: <?= $row['manufacturer'] ?> <br/>
					Preço: <?= number_format($row['price'], 2) ?> <br/>
					</a>
				</div>
				<div class="col-xs-2 add-to-cart">
					<a href="#"><img src="img/add.png"/></a>
				</div>	

			</div>
<?php			
		}			
	}	

?>