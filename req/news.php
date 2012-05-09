<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$xml = @file_get_contents('http://blog.hexaga.me/feeds/posts/default');

if ( !$xml ) {
	echo json_encode( array(
		'status' => 'error',
		'message' => 'Can\'t load XML')
	);
	exit;
}

$news = new SimpleXMLElement($xml);

setlocale(LC_TIME, "en_US");

echo json_encode( array(
	'status' => 'success',
	'date' => strftime("%h %e", strtotime((string)$news->entry[0]->published)),
	'title' => (string)$news->entry[0]->title,
	'href' => (string)$news->entry[0]->link[4]['href'])
);
