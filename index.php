<?php
require_once "config.php";
ini_set('display_errors', 1);
error_reporting(E_ALL);
date_default_timezone_set('UTC');

$response;
$code;
$db = new PDO(createPDOConfig(), DBUSER, DBPASS);

function checkToken($token, $userId) {
  $sql = "SELECT `id_user`, `date_end` FROM `user_tokens` WHERE `token` = ?";
  $db = new PDO(createPDOConfig(), DBUSER, DBPASS);
  $dbRequest = $db -> prepare($sql);

  if ($dbRequest -> execute(array($token))) {
    $dbResponse = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0];

    if (date("Y-m-d") < date("Y-m-d", strtotime($dbResponse['date_end'])) &&
      $userId == $dbResponse['id_user']
    ) {
      return 'Token valid';
    } else {
      return 'Token expired';
    }
  } else {
    return 'Token not found';
  }
}

function isAdministrator($userId) {
  $sql = "SELECT `status` FROM `users` WHERE `id_user` = ?";
  $db = new PDO(createPDOConfig(), DBUSER, DBPASS);
  $dbRequest = $db -> prepare($sql);

  if ($dbRequest -> execute(array($userId))) {
    $status = $dbRequest -> fetchAll(PDO::FETCH_ASSOC)[0];
    if ($status['status'] == 'Administrator') {
      return true;
    } else {
      false;
    }
  } else {
    $response['Error'] = 'Data base error';
    $code = 400;
    return false;
  }
}

function cathErrorForToken($errorType) {
  $response['Error'] = $errorType;
  createResponse($response, 403);
}

function getFormData() {
  return json_decode(file_get_contents("php://input"), true);
}

function createPDOConfig() {
  return "mysql:host=".DBHOST.";dbname=".DBNAME;
}

function createResponse($response, $code) {
  switch ($code) {
    case 200:
      header("Code: 200 Ok");
      break;
    case 400:
      header("Code: 400 Bad Request");
      break;
    case 404:
      header("Code: 404 Not found");
      break;
    default:
      break;
  }
  echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header("Content-Type: application/json");

$url = explode('/',$_SERVER['REQUEST_URI']);
$formData = getFormData();
$method = $_SERVER['REQUEST_METHOD'];
if (file_exists('routes/'.$url[1].'.php')){
  include_once 'routes/'.$url[1].'.php';
} else {
  include_once 'routes/error.php';
}

if (isset($response) && isset($code)) {
  createResponse($response, $code);
}
?>