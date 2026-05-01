const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
    .react()
    .sass('resources/css/app.scss', 'public/css')
    .version();

mix.options({
    processCssUrls: false,
});