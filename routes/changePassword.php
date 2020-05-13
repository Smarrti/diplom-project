<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId']) &&
  isset($formData['currentPassword']) &&
  isset($formData['newPassword'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $validToken = checkToken($formData['token'], $formData['userId']);
  if ($validToken == 'Token valid') {
    $sql = "SELECT `password` FROM `users` WHERE `id_user` = ?";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['userId']))) {
      $password = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0]['password'];
      if (password_verify($formData['currentPassword'], $password)) {
        $newPassword = password_hash($formData['newPassword'], PASSWORD_DEFAULT);
        $sql = "UPDATE `users` SET `password` = ? WHERE `id_user` = ?";
        $dbRequest = $db -> prepare($sql);

        if ($dbRequest -> execute(array($newPassword, $formData['userId']))) {
          $response['Success'] = 'Password changed';
          $code = 200;
        } else {
          $response['Error'] = 'Data base error';
          $code = 400;
        }
      } else {
        $response['Error'] = 'Current password is wrong';
        $code = 400;
      }
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  } else {
    cathErrorForToken($validToken);
  }
}

?>