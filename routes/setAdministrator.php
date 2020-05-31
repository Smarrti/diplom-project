<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId']) &&
  isset($formData['idForSetAdmin'])
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
    $sql = "UPDATE `users` SET `status`= 'Administrator' WHERE `id_user` = ?";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['idForSetAdmin']))) {
      $response['Success'] = 'User updated';
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  }
}

?>