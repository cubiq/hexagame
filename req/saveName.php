<?php
include '../config.php';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

if ( empty($_COOKIE['hexauser']) ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'Uh-oh something went terribly wrong. Please reload the page and try again.')
	);
	exit;
}

$cookie = explode('+', $_COOKIE['hexauser']);
if ( empty($cookie) || count($cookie) < 2 ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	echo json_encode( array(
		'status' => 'error',
		'message' => 'Uh-oh something went terribly wrong. Please reload the page and try again.')
	);
	exit;
}
$userId = $cookie[0];
$sessionId = $cookie[1];

if ( empty($_POST['n']) || strlen(strip_tags(trim($_POST['n']))) < 3 ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'Nickname must be at least 3 characters long')
	);
	exit;
}

$name = strip_tags(trim($_POST['n']));

$db = new PDO($config['db'], $config['dbUser'], $config['dbPassword']);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

$stmt = $db->prepare( "SELECT `users`.`id` AS userId FROM `users`, `sessions` WHERE `sessions`.`user_id` = `users`.`id` AND `sessions`.`id` = :sessionId AND `users`.`id` = :userId LIMIT 1" );
$stmt->execute( array(
	':userId' => $userId,
	':sessionId' => $sessionId) );
$user = $stmt->fetch();

if ( !$user ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	echo json_encode( array(
		'status' => 'error',
		'message' => 'Uh-oh something went terribly wrong. Please reload the page and try again.')
	);
	exit;
}

$stmt = $db->prepare( "UPDATE `users` SET `name` = :name WHERE `id` = :userId" );
$stmt->execute( array(':name' => $name, ':userId' => $user->userId) );

echo json_encode( array(
	'status' => 'success',
	'message' => 'nickname saved')
);
