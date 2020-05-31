<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $validToken = checkToken($formData['token'], $formData['userId']);
  if ($validToken == 'Token valid') {
    $sql = "SELECT `stats` FROM `users` WHERE `id_user` = ?";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['userId']))) {
      $response['Success'] = 'Data received';
      $response['stats'] = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0]['stats'];
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  } else {
    cathErrorForToken($validToken);
  } 
}


?>