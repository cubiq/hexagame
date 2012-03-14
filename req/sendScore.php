<?php
include '../config.php';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

if ( empty($_COOKIE['hexauser']) ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'user not signed in')
	);
	exit;
}

$cookie = explode('+', $_COOKIE['hexauser']);
if ( empty($cookie) || count($cookie) < 2 ) {
	setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

	echo json_encode( array(
		'status' => 'error',
		'message' => 'wrong session')
	);
	exit;
}
$userId = $cookie[0];
$sessionId = $cookie[1];

if ( empty($_POST) || empty($_POST['score']) || empty($_POST['words']) || empty($_POST['letters']) || empty($_POST['level']) ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'missing parameters')
	);
	exit;
}

$score = (int)$_POST['score'];
$words = (int)$_POST['words'];
$letters = (int)$_POST['letters'];
$level = (int)$_POST['level'];
$language = isset($_POST['language']) ? $_POST['language'] : 'en_us';
$language = $language == 'en_us' || $language == 'en_uk' ? $language : 'en_us';

if ( $score <= 0 || $words <= 0 || $letters <= 0 || $level <= 0 ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'wrong parameters')
	);
	exit;
}

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
		'message' => 'wrong session')
	);
	exit;
}

$stmt = $db->prepare( "SELECT `id`, `score` FROM `leaderboards` WHERE `user_id` = :userId LIMIT 1" );
$stmt->execute( array(':userId' => $userId) );
$leaderboard = $stmt->fetch();

if ( $leaderboard && $leaderboard->score > $score ) {
	echo json_encode( array(
		'status' => 'success',
		'message' => 'no update happened',
		'score' => $leaderboard->score)
	);
	exit;
}

// Save the score
$stmt = $db->prepare( "INSERT INTO `scoreboards` (`user_id`, `score`, `words`, `letters`, `level`, `language`, `time`) VALUES (:userId, :score, :words, :letters, :level, :language, :time)" );
$stmt->execute( array(
	':userId' => $userId,
	':score' => $score,
	':words' => $words,
	':letters' => $letters,
	':level' => $level,
	':language' => $language,
	':time' => time())
);

// Update the leaderboard
if ( $leaderboard ) {
	$stmt = $db->prepare( "UPDATE `leaderboards` SET `rank`=:rank, `score`=:score, `words`=:words, `letters`=:letters, `level`=:level, `language`=:language WHERE `id`=:leaderboard_id" );
	$stmt->execute( array(
		':rank'	=> 0,
		':score' => $score,
		':words' => $words,
		':letters' => $letters,
		':level' => $level,
		':language' => $language,
		':leaderboard_id' => $leaderboard->id )
	);
} else {
	$stmt = $db->prepare( "INSERT INTO `leaderboards` (`user_id`, `score`, `words`, `letters`, `level`, `language`) VALUES (:userId, :score, :words, :letters, :level, :language)" );	
	$stmt->execute( array(
		':userId' => $userId,
		':score' => $score,
		':words' => $words,
		':letters' => $letters,
		':level' => $level,
		':language' => $language )
	);
}

echo json_encode( array(
	'status' => 'success',
	'message' => 'score saved',
	'score' => $score)
);
