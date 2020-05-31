<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $validToken = checkToken($formData['token'], $formData['userId']);
  $isAdmin = isAdministrator($formData['userId']);
  if ($validToken != 'Token valid') {
    cathErrorForToken($validToken);
  } else if ($isAdmin == false) {
    $response['Error'] = 'You don`t have access';
    $code = 403;
  } else {
    $sql = "SELECT `id_user`, CONCAT(`surname_user`, ' ', `name_user`) AS 'user', `date_birth`, `date_registration`, `login`, `status`, `points` FROM `users`";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute()) {
      $response = $dbRequest -> fetchAll(PDO::FETCH_ASSOC);
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  }
}

?>