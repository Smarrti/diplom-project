<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId']) &&
  isset($formData['word']) &&
  isset($formData['translation']) &&
  isset($formData['image']) &&
  isset($formData['audio']) &&
  isset($formData['categoryId'])
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
    $sql = "INSERT INTO `words`(`id_category`, `word`, `word_translation`, `image`, `audio_source`) VALUES (?, ?, ?, ?, ?)";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['categoryId'], $formData['word'], $formData['translation'], $formData['image'], $formData['audio']))) {
      $response['Success'] = 'Word added';
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  }
}

?>