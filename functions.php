<?php
	function info($user){
		try{
			$userr = preg_replace("/[^0-9\s]/", "", $user);
			### CONEXAO ###
			$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD); 
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$sql  = "SELECT * FROM users WHERE user = $userr LIMIT 1";
			$stmt = $conn->query($sql)->fetchAll();
			foreach ($stmt as $row){
				$us = $row['name'];
			}
			return $us;
			
		}catch(PDOException $e){
			return $e->getMessage();
		}

	}
?>