<?php
require_once "config.php";
ini_set('display_errors', 1);
error_reporting(E_ALL);
date_default_timezone_set('UTC');

function getFormData(){
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
?>