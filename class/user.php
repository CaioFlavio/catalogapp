<?php
	include("validations.php");
		
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
			if(isset($data['telefone'])) $this->telefone = stripslashes(strip_tags(preg_replace("/[^0-9\s]/", "", $data['telefone'])));
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
					session_start();
					$_SESSION['user'] = $_POST['username'];
					if(isset($_SESSION['user'])){				
						$success = true;
					}
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
			$this->today = date("Y-m-d");
			$error = '';

			try{
				### CONEXAO ###
				$conn = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD); 
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				### VERIFICA ERROS ###
				$valid = new Validations;
				### USUARIO JÁ CADASTRADO ###
				$error_0 = $conn->prepare("SELECT * FROM users WHERE user = :username");
				$error_0->bindValue("username", $this->username, PDO::PARAM_STR);
				$error_0->execute();
				if ($error_0->fetch(PDO::FETCH_NUM) > 0) $error .= "Usuário já cadastrado!<br/>"; 
				### VERIFICA SE O E-MAIL É VALIDO ###
				if(!$valid->valida_email($this->mail)) $error .= "E-mail inválido!<br/>";				
				### E-MAIL JÁ CADASTRADO ###
				$error_1 = $conn->prepare("SELECT * FROM users WHERE mail = :email");
				$error_1->bindValue("email", $this->mail, PDO::PARAM_STR);
				$error_1->execute();
				if ($error_1->fetch(PDO::FETCH_NUM) > 0) $error .= "E-mail já cadastrado!<br/>";
				### VERIFICA SE O CNPJ É VALIDO ###
				if(!$valid->valida_cnpj($this->username)) $error .= "CNPJ inválido!</br>";


				### ###
				if($error == ''){
					$sql  = "INSERT INTO users (user, name, pass, mail, telephone, created, modified ) VALUES(:username, :name, :password, :email, :telefone, :today, :today)";
					$stmt = $conn->prepare($sql);
					$stmt->bindValue("username", $this->username, PDO::PARAM_STR);
					$stmt->bindValue("name", $this->name, PDO::PARAM_STR);
					$stmt->bindValue("razao", $this->razao, PDO::PARAM_STR);
					$stmt->bindValue("password", hash("md5", $this->password), PDO::PARAM_STR);
					//$stmt->bindValue("password", hash("sha256"), $this->password) . $this->salt, PDO:PARAM_STR); SECURITY
					$stmt->bindValue("email", $this->mail, PDO::PARAM_STR);
					$stmt->bindValue("telefone", $this->telefone, PDO::PARAM_STR);
					$stmt->bindValue("today", $this->today, PDO::PARAM_STR);	
					if($stmt->execute()) {return "Cadastro efetuado com sucesso. <a href='index.php'>Clique aqui</a> para efetuar o login.";}
					else{ return "Erro ao efetuar cadastro. Tente novamente mais tarde."; }		
				}else{
					return $error;
				}
			}catch(PDOException $e){
				return $e->getMessage();
			}
		}
		
	}
?>