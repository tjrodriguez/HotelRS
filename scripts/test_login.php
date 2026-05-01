<?php
$url = 'http://127.0.0.1:8000/api/auth/login';
$data = json_encode(['email' => 'admin@hotel.com', 'password' => 'password']);
$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $data,
        'ignore_errors' => true,
    ],
];
$context = stream_context_create($options);
$res = @file_get_contents($url, false, $context);
echo (isset($http_response_header[0]) ? $http_response_header[0] : 'No response header') . "\n" . ($res ?? '');
