<?php

if ($method != "POST" &&
  isset($formData['categoryId'])
) {
  $response['Error'] = 'Not enough data';
  $code = 400;
} else {
  $sql = "SELECT `word`, `word_translation` AS `translation`, `image`, `audio_source` FROM `words` WHERE `id_category` = ?";
  $dbRequest = $db -> prepare($sql);
  if ($dbRequest -> execute(array($formData['categoryId']))) {
    $response['words'] = $dbRequest -> fetchAll(PDO::FETCH_ASSOC);

    $sql = "SELECT `name_category` FROM `category-words` WHERE `id_category` = ?";
    $dbRequest = $db -> prepare($sql);
    if ($dbRequest -> execute(array($formData['categoryId']))) {
      $response['name_category'] = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0]["name_category"];
      $code = 200;
    } else {
      $response['Error'] = 'Data base error';
      $code = 400;
    }
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
  }
}

?>