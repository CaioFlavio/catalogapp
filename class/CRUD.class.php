<?php
	class CRUD extends ConnDb{
		private $query;

		private function queryExecute($columns, $values){
			$this->query = $this->getConn()->prepare($columns);
			$this->query->execute($values);
		}

		public function queryInsert($table,$columns,$values){
			//'INSERT INTO table SET column1=?, column2=?, ...', array('column1_value', 'column2_value', ...)
			$this->queryExecute('INSERT INTO '.$table.' SET '.$columns.'', $values);
			return $this->getConn()->lastInsertId();
		}

		public function querySelect($fields, $table, $clauses, $order, $values){
			$this->queryExecute('SELECT '.$fields.' FROM '.$table.' '.$clauses.' '.$order.'',$values); 
			return $this->query;
		}

		public function queryUpdate($table, $fields, $clauses, $values){
			$this->queryExecute('UPDATE '.$table.' SET '.$fields.' '.$clauses.'', $values);
			return $this->query;
		}
		public function queryDelete($table, $clauses, $values){
			$this->queryExecute('DELETE FROM '.$table.' '.$clauses.'',$values);
		}
	}

?>