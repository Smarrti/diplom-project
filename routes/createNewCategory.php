<?php

if ($method != "POST" &&
  isset($formData['token']) &&
  isset($formData['userId']) &&
  isset($formData['category']) &&
  isset($formData['photo'])
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
    $sql = "INSERT INTO `category-words`(`name_category`, `picture_category`) VALUES (?, ?)";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['category'], $formData['photo']))) {
      $response['Success'] = 'Category added';
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  }
}

?>