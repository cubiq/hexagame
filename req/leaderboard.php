<?php
include '../config.php';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$type = !empty($_GET['t']) ? (int)$_GET['t'] : 2;
$requireUser = $type == 1 ? true : false;

$db = new PDO($config['db'], $config['dbUser'], $config['dbPassword']);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

if ( $requireUser ) {
	if ( empty($_COOKIE['hexauser']) ) {
		echo json_encode( array(
			'status' => 'error',
			'message' => 'Sorry, you need to be signed in to access the leaderboards.')
		);
		exit;
	}

	$cookie = explode('+', $_COOKIE['hexauser']);
	if ( empty($cookie) || count($cookie) < 2 ) {
		setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

		echo json_encode( array(
			'status' => 'error',
			'message' => 'Something went wrong while trying to access the leaderboards. Reload the page and try again.')
		);
		exit;
	}
	$userId = $cookie[0];
	$sessionId = $cookie[1];

	$stmt = $db->prepare( "SELECT `users`.`id` AS userId FROM `users`, `sessions` WHERE `sessions`.`user_id` = `users`.`id` AND `sessions`.`id` = :sessionId AND `users`.`id` = :userId LIMIT 1" );
	$stmt->execute( array(
		':userId' => $userId,
		':sessionId' => $sessionId) );
	$user = $stmt->fetch();

	if ( !$user ) {
		setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

		echo json_encode( array(
			'status' => 'error',
			'message' => 'Sorry, you need to be signed in to access the leaderboards.')
		);
		exit;
	}
}

// Check if we need to update the ranking
$stmt = $db->prepare( "SELECT `id` FROM `leaderboards` WHERE `rank`=0 LIMIT 1" );
$stmt->execute();
$leaderboard = $stmt->fetch();

// Update rankings
if ( $leaderboard ) {
	$stmt = $db->prepare( "SET @r = 0; UPDATE `leaderboards` SET `rank` = @r := @r + 1 ORDER BY score DESC, words DESC, letters ASC, level DESC" );
	$stmt->execute();
}

// Find personal ranking
if ( $type == 1 ) {
	//$stmt = $db->prepare( "SELECT s1.* FROM ( SELECT user_id, MAX(score) AS maxScore FROM scoreboards GROUP BY user_id ) AS s2 INNER JOIN scoreboards AS s1 ON s1.user_id = s2.user_id AND s1.score = s2.maxScore" );
	$stmt = $db->prepare( "SELECT `rank` FROM `leaderboards` WHERE `user_id`=:userId LIMIT 1" );
	$stmt->execute( array( ':userId' => $userId ) );
	$rank = $stmt->fetch();

	if ( !$rank ) {
		$stmt = $db->prepare( "SELECT COUNT(`id`) AS `rank` FROM `leaderboards`" );
		$stmt->execute();
		$rank = $stmt->fetch();
	}

	$rank = floor($rank->rank / 10) * 10;

	$stmt = $db->prepare( "SELECT `users`.`id`, `name`, `score`, `words`, `letters`, `level`, `rank` FROM `leaderboards`, `users` WHERE `user_id` = `users`.`id` AND `rank` >= :rank ORDER BY `rank` ASC LIMIT 10" );
	$stmt->execute(array( ':rank' => $rank ));
	$results = $stmt->fetchAll();

	$json = array(
		'status' => 'success',
		'title' => 'Your Ranking',
		'rows' => $results
	);

	echo json_encode($json);
	exit;
}

// Find user's results
if ( $type == 3 ) {
	$stmt = $db->prepare( "SELECT DATE_FORMAT(FROM_UNIXTIME(`time`), '%a, %b %e, %l:%i %p') AS `datetime`, `score`, `words`, `letters`, `level` FROM `scoreboards` ORDER BY `score` DESC, `words` DESC, `letters` ASC LIMIT 10" );
	$stmt->execute();
	$results = $stmt->fetchAll();

	$json = array(
		'status' => 'success',
		'title' => 'Your Results',
		'rows' => $results
	);

	echo json_encode($json);
	exit;	
}

// Find top 10
$stmt = $db->prepare( "SELECT `users`.`id`, `name`, `score`, `words`, `letters`, `level`, `rank` FROM `leaderboards`, `users` WHERE `user_id` = `users`.`id` ORDER BY `rank` ASC LIMIT 10" );
$stmt->execute(array( ':rank' => $rank ));
$results = $stmt->fetchAll();

$json = array(
	'status' => 'success',
	'title' => 'Top 10',
	'rows' => $results
);

echo json_encode($json);