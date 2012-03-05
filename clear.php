<?php

setcookie('hexauser', '', time() - 60*60*24*365, '/', $_SERVER['HTTP_HOST']);

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Hexagame</title>

<script type="text/javascript">
	window.localStorage.removeItem('dictionary1');
	window.localStorage.removeItem('dictionary2');
	window.localStorage.removeItem('userinfo');
</script>

</head>

<body>
Done!
</body>
</html>