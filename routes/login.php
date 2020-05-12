<?php

function generateToken($login, $userId, $status) {
  $sql = "INSERT INTO `user_tokens`(`id_user`, `token`, `date_registration`, `date_end`) VALUES (?, ?, ?, ?)";
  $db = new PDO(createPDOConfig(), DBUSER, DBPASS);
  $dbRequest = $db -> prepare($sql);

  $token = md5(microtime().'salt'.time());

  if ($dbRequest -> execute(array($userId, $token, date("Y-m-d"), 
    date("Y-m-d", mktime(0, 0, 0, date("m"), date("d")+2, date("Y")))))) {
    $result = $dbRequest -> fetchAll(PDO::FETCH_ASSOC);
    $response['Success'] = 'Client is authorized';
    $response['token'] = $token;
    $response['userId'] = $userId;
    $response['status'] = $status;
    $code = 200;
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
  createResponse($response, $code);
}

if ($method != "POST" &&
  !isset($formData['login']) &&
  !isset($formData['password'])
  ) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $login = $formData['login'];
  $password = $formData['password'];

  $sql = "SELECT `id_user`, `password`, `status` FROM `users` WHERE `login` = ?";
  $dbRequest = $db -> prepare($sql);

  if ($dbRequest -> execute(array($login))) {
    $dbResponse = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0];
    $passwordHash = $dbResponse['password'];
    if (password_verify($password, $passwordHash)) {
      generateToken($login, $dbResponse['id_user'], $dbResponse['status']);
    } else {
      $response['Error'] = 'Account not found';
      $code = 403;
    }
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}
?>