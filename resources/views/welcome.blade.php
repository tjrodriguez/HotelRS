@php
    $manifestExists = file_exists(public_path('mix-manifest.json'));
    $stylesPath = $manifestExists ? mix('css/app.css') : asset('css/app.css');
    $scriptsPath = $manifestExists ? mix('js/app.js') : asset('js/app.js');
    $appName = config('app.name', 'Hotel Reservation');
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }}</title>
    <link rel="stylesheet" href="{{ $stylesPath }}">
</head>
<body style="margin: 0; padding: 0;">
    <div id="app" data-app-name="{{ $appName }}"></div>
    <script src="{{ $scriptsPath }}" defer></script>
</body>
</html>
    