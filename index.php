<?php
require_once "config.php";
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getFormData(){
  return json_decode(file_get_contents("php://input"), true);
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