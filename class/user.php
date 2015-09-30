<?php
	class Users{
		public $username = null;
		public $name = null;
		public $password = null;
		public $razao = null;
		public $mail = null;
		public $telephone = null;
		public $salt	 = 'SQtUBkOiyHmhPEH';

		### ###
		public function __construct($data = array()){ 

			if(isset($data['username'])) $this->username = stripcslashes(strip_tags(preg_replace("/[^0-9\s]/", "", $data['username'])));
			if(isset($data['password'])) $this->password = stripslashes(strip_tags($data['password']));
			if(isset($data['name'])) $this->name = stripslashes(strip_tags($data['name']));
			if(isset($data['razao'])) $this->razao = stripslashes(strip_tags($data['razao']));
			if(isset($data['email'])) $this->mail = stripslashes(strip_tags($data['email']));
			if(isset($data['telefone'])) $this->telephone = stripslashes(strip_tags($data['telefone']));

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
			$error = '';

			try{
				$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD); //CRIANDO A CONEXÃO PDO
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // COMO O PHP LIDA COM OS ERROS
				$sql  = "INSERT INTO users (user, name, razao, mail, telephone, pass, created, modified, active) VALUES(:username, :name, :razao, :email, :telefone, :password, sysdate, sysdate, 0)";
				$stmt = $conn->prepare($sql);
				$stmt->bindValue("name", $this->name, PDO::PARAM_STR);
				$stmt->bindValue("razao", $this->razao, PDO::PARAM_STR);
				$stmt->bindValue("username", $this->username, PDO::PARAM_STR);
				$stmt->bindValue("email", $this->mail, PDO::PARAM_STR);
				$stmt->bindValue("telefone", $this->telephone, PDO::PARAM_STR);
				$stmt->bindValue("password", hash("md5", $this->password), PDO::PARAM_STR);
				### PERS. ERRORS CONFIGURATION ###
				$error_1 = $conn->prepare("SELECT * FROM users WHERE username = :username")->execute();
				if (count($error_1) > 0){
					$success = false;
					//return "CNPJ já cadastrado";
				}else{
					$stmt->execute();
					$sucess = true;
					//return "Registro efetuado com sucesso.<br/> <a href='index.php'>Login</a>";
				}				
				return $success;
			}catch(PDOException $e){
				return $e->getMessage();
			}
		}
		
	}
?>