const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
    .react()
    .sass('resources/scss/app.scss', 'public/css', {
        sassOptions: {
            silenceDeprecations: ['legacy-js-api'],
        },
    })
    .version();

mix.options({
    processCssUrls: false,
});