<?php

if ($method != "POST" &&
  !isset($formData['login']) &&
  !isset($formData['password']) &&
  !isset($formData['date_birthday']) &&
  !isset($formData['surname_user']) &&
  !isset($formData['name_user'])
  ) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $sql = "INSERT INTO `users`(`surname_user`, `name_user`, `date_birth`, `date_registration`, `login`, `password`, `stats`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  $dbRequest = $db -> prepare($sql);
  
  if ($dbRequest -> execute(array($formData['surname_user'], $formData['name_user'], 
    $formData['date_birthday'], date("Y-m-d"), $formData['login'],
    password_hash($formData['password'], PASSWORD_DEFAULT), "", "User"))) {
    $response['Success'] = 'Client registered';
    $code = 200;
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}
?>