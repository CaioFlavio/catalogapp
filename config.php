<?php
	### DESABILITA ERROS ###
	error_reporting(1);

	define("DB_DSN", "mysql:host=localhost;dbname=app"); // CONNECTION STRING
	define("DB_USERNAME", "root"); //DATABASE USERNAME
	define("DB_PASSWORD", ""); //DATABASE USERNAME
	define("CLS_PATH", "class"); //CLASS PATH
	include_once(CLS_PATH . "/user.php");
?>