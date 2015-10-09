<?php
	function __autoload($class){
		require_once"{$class}.class.php";
	}
	abstract class ConnDb{
		private static $conn;

		private function setConn(){
			return
			is_null(self::$conn)? self::$conn=new PDO("mysql:host=localhost;dbname=app","root", ""): 
								  self::$conn;
		}
		public function getConn(){
			return $this->setConn();
		}
	}
		//EXEMPLO DE USO DA CLASS CRUD
		$crud = new CRUD;
		//$crud->queryInsert('users', "user=?, name=?, pass=?, mail=?", array('000000000000', 'nomeDoUsuário', md5('1234'), "teste@teste.com"));
		//$sel = $crud->querySelect('*', 'users','WHERE id=?','LIMIT 1',array(1));
		//foreach($sel as $row){
		//	var_dump($row);
		//}
		//$upd = $crud->queryUpdate('users', 'user=?', 'WHERE id=?', array('CaioFlavio', 1));
		//$del = $crud->queryDelete('users', 'WHERE id=?', array(3));
		//var_dump($upd);
		
		//EXEMPLO DA CLASS ValidEmail()
		$valida = new ValidaEmail;
		var_dump($valida->ValidMail());
?>