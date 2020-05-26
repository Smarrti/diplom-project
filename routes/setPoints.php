<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId']) &&
  isset($formData['points'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $validToken = checkToken($formData['token'], $formData['userId']);
  if ($validToken == 'Token valid') {
    $sql = "UPDATE `users` SET `points`= ? WHERE `id_user` = ?";
    $dbRequest = $db -> prepare($sql);

    if ($dbRequest -> execute(array($formData['points'], $formData['userId']))) {
      $response['Success'] = 'Points updated';
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