<?php
	class Validations{
		### VALIDA CNPJ ###
		public function valida_cnpj ( $cnpj ) {
			$cnpj = preg_replace( '/[^0-9]/', '', $cnpj );
			$cnpj = (string)$cnpj;
			$cnpj_original = $cnpj;
			$primeiros_numeros_cnpj = substr( $cnpj, 0, 12 );
			
			/**
			 * Multiplicação do CNPJ
			 *
			 * @param string $cnpj Os digitos do CNPJ
			 * @param int $posicoes A posição que vai iniciar a regressão
			 * @return int O
			 *
			 */

			function multiplica_cnpj( $cnpj, $posicao = 5 ) {
				$calculo = 0;
				for ( $i = 0; $i < strlen( $cnpj ); $i++ ) {
					$calculo = $calculo + ( $cnpj[$i] * $posicao );
					$posicao--;
					if ( $posicao < 2 ) {
						$posicao = 9;
					}
				}
				return $calculo;
			}
			$primeiro_calculo = multiplica_cnpj( $primeiros_numeros_cnpj );
			$primeiro_digito = ( $primeiro_calculo % 11 ) < 2 ? 0 :  11 - ( $primeiro_calculo % 11 );
			$primeiros_numeros_cnpj .= $primeiro_digito;
			$segundo_calculo = multiplica_cnpj( $primeiros_numeros_cnpj, 6 );
			$segundo_digito = ( $segundo_calculo % 11 ) < 2 ? 0 :  11 - ( $segundo_calculo % 11 );
			$cnpj = $primeiros_numeros_cnpj . $segundo_digito;
			if ( $cnpj === $cnpj_original) {
				return true;
			}
		}	
		### VALIDA E-EMAIL ###
		function valida_email($email){
		    $er = "/^(([0-9a-zA-Z]+[-._+&])*[0-9a-zA-Z]+@([-0-9a-zA-Z]+[.])+[a-zA-Z]{2,6}){0,1}$/";
		    if (preg_match($er, $email)){
			return true;
		    } else {
			return false;
		    }
		}
	}		
?>