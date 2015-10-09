<?php
	error_reporting(1); 
	session_start();
	$_SESSION['username'] = "Nome";

	echo "1: " . session_name("Logged") . "<br>";
	echo "1: " . session_name() . "<br>";
	echo "2: " . session_id() . "<br>";
	echo "3: " . session_regenerate_id() . "<br>";
	echo "3: " . session_id() . "<br>";
	echo "5: " . session_destroy() . "<br>";
	echo "5: " . $_SERVER['HTTP_USER_AGENT'] . "<br>";	
	echo "5: " . $_SERVER['REMOTE_ADDR'] . "<br>";	
	echo "3: " . session_id() . "<br>";

	class Auth{
		public function __Construct(){
			session_start();
			$session_id = session_id();
		}
	}


?>