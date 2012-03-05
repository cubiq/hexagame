<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

include '../config.php';
require_once '../libs/google/apiClient.php';
require_once '../libs/google/contrib/apiOauth2Service.php';

$client = new apiClient();
$client->setApplicationName('Hexagame');
$client->setClientId( $config['googleId'] );
$client->setClientSecret( $config['googleSecret'] );
$client->setRedirectUri( $config['googleRedirect'] );
$client->setApprovalPrompt('auto');

$oauth2 = new apiOauth2Service($client);

$authUrl = $client->createAuthUrl();

echo json_encode( array('url' => $authUrl) );
