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
    $sql = "SELECT `surname_user`, `name_user`, `date_birth`, `stats`, `status` FROM `users` WHERE `id_user` = ?";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['userId']))) {
      $dbResponse = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0];
      $response['Success'] = 'Data received';
      $response['surnameUser'] = $dbResponse['surname_user'];
      $response['nameUser'] = $dbResponse['name_user'];
      $response['date_birth'] = $dbResponse['date_birth'];
      $response['stats'] = $dbResponse['stats'];
      $response['status'] = $dbResponse['status'];
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