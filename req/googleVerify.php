<?php
include '../config.php';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

if ( empty($_COOKIE['hexauser']) ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'empty session')
	);
	exit;
}

$cookie = explode('+', $_COOKIE['hexauser']);
if ( empty($cookie) || count($cookie) < 2 ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	echo json_encode( array(
		'status' => 'error',
		'message' => 'incomplete session')
	);
	exit;
}
$userId = $cookie[0];
$sessionId = $cookie[1];

require_once '../libs/google/apiClient.php';
//require_once '../libs/google/contrib/apiOauth2Service.php';

$client = new apiClient();
$client->setApplicationName('Hexagame');
$client->setClientId( $config['googleId'] );
$client->setClientSecret( $config['googleSecret'] );
$client->setRedirectUri( $config['googleRedirect'] );
$client->setApprovalPrompt('auto');

//$oauth2 = new apiOauth2Service($client);

$db = new PDO($config['db'], $config['dbUser'], $config['dbPassword']);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

$stmt = $db->prepare( "SELECT `name`, `email`, `token` FROM `users`, `sessions` WHERE `sessions`.`user_id` = `users`.`id` AND `sessions`.`id` = :sessionId AND `users`.`id` = :userId LIMIT 1" );
$stmt->execute( array(
	':userId' => $userId,
	':sessionId' => $sessionId) );
$user = $stmt->fetch();

if ( !$user ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	echo json_encode( array(
		'status' => 'error',
		'message' => 'wrong session')
	);
	exit;
}

$token = $user->token;
$client->setAccessToken($token);
$token = $client->getAccessToken();

if ( !$token ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	$stmt = $db->prepare( "DELETE FROM `sessions` WHERE `id` = :sessionId" );
	$stmt->execute( array( ':sessionId' => $sessionId ) );

	echo json_encode( array(
		'status' => 'error',
		'message' => 'session mismatch')
	);
	exit;
}

// Update session id and token
$newSessionId = sha1(uniqid($userId, true) . $user->email . $config['salt']);
$stmt = $db->prepare( "UPDATE `sessions` SET `id` = :newSessionId, `token` = :token WHERE `id` = :sessionId" );
$stmt->execute( array(
	':newSessionId' => $newSessionId,
	':token' => $token,
	':sessionId' => $sessionId)
);
setcookie('hexauser', $userId . '+' . $newSessionId, time() + 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

// Get highscore
$stmt = $db->prepare( "SELECT `score` FROM `scoreboards` WHERE `user_id` = :userId ORDER BY `score` DESC LIMIT 1" );
$stmt->execute( array( ':userId' => $userId ) );
$scoreboard = $stmt->fetch();
$highScore = $scoreboard ? $scoreboard->score : 0;

echo json_encode( array(
	'status' => 'success',
	'name' => $user->name,
	'id' => $userId,
	'highScore' => $highScore)
);
