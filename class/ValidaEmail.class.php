<?php
	class ValidaEmail{
		public function ValidMail($email){
			if(empty($email)){
				return 'E-mail inválido';
			}else{
				return 'E-mail válido';
			}
		}
	}

?>