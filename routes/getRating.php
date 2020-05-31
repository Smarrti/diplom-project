<?php

if ($method != "GET") {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $sql = "SELECT concat(`surname_user`, ' ', `name_user`) AS `user`, `points` FROM `users` ORDER BY `points` DESC LIMIT 50";
  $dbRequest = $db -> prepare($sql);
  if ($dbRequest -> execute()) {
    $response = $dbRequest -> fetchAll(PDO::FETCH_ASSOC);
    $code = 200;
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}

?>