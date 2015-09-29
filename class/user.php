<?php
	class Users{
		public $username = null;
		public $name = null;
		public $password = null;
		public $salt	 = 'SQtUBkOiyHmhPEH';

		### ###
		public function __construct($data = array()){ 

			if(isset($data['username'])) $this->username = stripcslashes(strip_tags(preg_replace("/[^0-9\s]/", "", $data['username'])));
			if(isset($data['password'])) $this->password = stripslashes(strip_tags($data['password']));
		}

		### GUARDA OS PARAMETROS ###
		public function storeFormValues($params){
			$this->__construct($params);
		}

		### FUNÇÃO DE LOGIN ###
		public function userLogin(){
			$success = false;  // VERIFICA SE O LOGIN FOI EFETUADO;
			try{
				$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD); //CRIANDO A CONEXÃO PDO
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // COMO O PHP LIDA COM OS ERROS
				$sql  = "SELECT * FROM users WHERE user= :username AND pass = :password LIMIT 1";
				$stmt = $conn->prepare($sql);
				$stmt->bindValue("username", $this->username, PDO::PARAM_STR);
				//$stmt->bindValue("password", hash("sha256"), $this->password) . $this->salt, PDO:PARAM_STR); SECURITY
				$stmt->bindValue("password", hash("md5", $this->password), PDO::PARAM_STR);
				$stmt->execute();

				$valid = $stmt->fetchColumn();
				if($valid){
					$success = true;
				}
				$conn = null;
				return $success;
			}catch(PDOException $e){
				echo $e->getMessage();
				return $success;
			}
		}

		### FUNÇÃO DE REGISTRO ###
		public function register(){
			$correct = false;
			try{
				$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD); //CRIANDO A CONEXÃO PDO
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // COMO O PHP LIDA COM OS ERROS
				$sql  = "INSERT INTO users (user, name, pass, created, modified, active) VALUES(:username, :name, :password, sysdate, sysdate, 0)";
				$stmt = $conn->prepare($sql);
				$stmt->bindValue("username", $this->username, PDO::PARAM_STR);
				$stmt->bindValue("name", $this->name, PDO::PARAM_STR);
				$stmt->bindValue("password", hash("md5", $this->password), PDO::PARAM_STR);
				$stmt->execute();
				return "Registro efetuado com sucesso.<br/> <a href='index.html'>Login</a>";				
			}catch(PDOException $e){
				return $e->getMessage();
			}
		}
	}
?>