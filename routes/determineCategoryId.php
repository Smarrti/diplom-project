<?php

if ($method != "POST" &&
  isset($formData['categoryName'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $sql = "SELECT `id_category` FROM `category-words` WHERE `name_category` = ?";
  $dbRequest = $db -> prepare($sql);
  if ($dbRequest -> execute(array($formData['categoryName']))) {
    $dbResponse = $dbRequest -> fetchAll(PDO::FETCH_ASSOC);
    if (count($dbResponse)) {
      $response['categoryId'] = $dbResponse[0]['id_category'];
      $code = 200;
    } else {
      $response['Error'] = 'Category not found';
      $code = 404;
    }
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}

?>