<?php

if ($method != "GET") {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $sql = "SELECT `id_category`, `name_category`, `picture_category` FROM `category-words`";
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