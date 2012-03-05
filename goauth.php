<?php
include 'config.php';
require_once 'libs/google/apiClient.php';
require_once 'libs/google/contrib/apiOauth2Service.php';

$db = new PDO($config['db'], $config['dbUser'], $config['dbPassword']);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

$userId = false;
$sessionId = false;

// Delete old session if present
if ( isset($_COOKIE['hexauser']) ) {
	$cookie = $_COOKIE['hexauser'];
	$cookie = explode('+', $cookie);

	if ( !empty($cookie[1]) ) {
		$userId = $cookie[0];
		$sessionId = $cookie[1];

		$stmt = $db->prepare( "SELECT `token` FROM `sessions` WHERE `id`=:sessionId AND `user_id`=:userId" );
		$stmt->execute( array(':sessionId' => $sessionId, ':userId' => $userId) );
		$session = $stmt->fetch();

		if ( $session ) {
			$stmt = $db->prepare( "DELETE FROM `sessions` WHERE `id` = :sessionId" );
			$stmt->execute( array(':sessionId' => $sessionId) );
		}
	}

	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);
}

$client = new apiClient();
$client->setApplicationName('Hexagame');
$client->setClientId( $config['googleId'] );
$client->setClientSecret( $config['googleSecret'] );
$client->setRedirectUri( $config['googleRedirect'] );
$client->setApprovalPrompt('auto');

$oauth2 = new apiOauth2Service($client);

if ( isset($_GET['logout']) ) {
	if ( $session ) {
		$client->setAccessToken($session->token);
		$client->revokeToken();
	}

	$redirect = 'http://' . $_SERVER['HTTP_HOST'];
	header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
	exit;
}

if ( isset($_GET['code']) ) {
	$client->authenticate();
	$token = $client->getAccessToken();

	if ( $token ) {
		$googleUser = $oauth2->userinfo->get();

		// Search the email in the database
		$stmt = $db->prepare( "SELECT `id` FROM `users` WHERE `email` = :email LIMIT 1" );
		$stmt->execute( array(':email' => $googleUser['email']) );
		$user = $stmt->fetch();

		// Returning visitor
		if ( $user ) {
			$userId = $user->id;
		}
		// New user
		else {
			$stmt = $db->prepare( "INSERT INTO `users` (`email`) VALUES (:email)" );
			$stmt->execute( array(
				':email' => $googleUser['email'])
			);
			$userId = $db->lastInsertId();
		}

		// Create session
		$sessionId = sha1(uniqid($userId, true) . $googleUser['email'] . $config['salt']);
		$stmt = $db->prepare( "INSERT INTO `sessions` (`id`, `user_id`, `token`) VALUES (:sessionId, :userId, :token)" );
		$stmt->execute( array(
			':sessionId' => $sessionId,
			':userId' => $userId,
			':token' => $token)
		);

		setcookie('hexauser', $userId . '+' . $sessionId, time() + 60*60*24*365, '/', $_SERVER['HTTP_HOST']);
	}
}

$redirect = 'http://' . $_SERVER['HTTP_HOST'];
header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
