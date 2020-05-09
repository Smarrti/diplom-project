<?php

$response;
$code;

if ($method != "POST" &&
  !isset($formData['login']) &&
  !isset($formData['password']) &&
  !isset($formData['date-birthday']) &&
  !isset($formData['surname_user']) &&
  !isset($formData['name_user'])
  ) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $db = new PDO(createPDOConfig(), DBUSER, DBPASS);
  $sql = "INSERT INTO `users`(`surname_user`, `name_user`, `date_birth`, `date_registration`, `login`, `password`, `stats`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  $dbResponse = $db -> prepare($sql);
  
  if ($dbResponse -> execute(array($formData['surname_user'], $formData['name_user'], 
    $formData['date-birthday'], date("Y-m-d"), $formData['login'],
    password_hash($formData['password'], PASSWORD_DEFAULT), ""))) {
    $response['Success'] = 'Client registered';
    $code = 200;
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}

createResponse($response, $code);
?>