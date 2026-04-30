const fs = require('fs');
const path = require('path');

const mixRoot = path.join(__dirname, '..', 'node_modules', 'laravel-mix');

function patchFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const original = fs.readFileSync(filePath, 'utf8');
    let updated = original;

    for (const [searchValue, replaceValue] of replacements) {
        updated = updated.replace(searchValue, replaceValue);
    }

    if (updated !== original) {
        fs.writeFileSync(filePath, updated);
    }
}

patchFile(path.join(mixRoot, 'src', 'config.js'), [
    [
        /    const argv = yargs\(process\.argv\.slice\(2\)\)\n        \.options\(\{[\s\S]*?\n        \}\)\n        \.parseSync\(\);/,
        `    const cli = yargs(process.argv.slice(2))
        .options({
            https: { type: 'boolean', default: false },
            hmrPort: { type: 'string', default: '8080' },
            p: { type: 'boolean', default: false },
            hot: { type: 'boolean', default: false }
        });

    const argv = typeof cli.parseSync === 'function' ? cli.parseSync() : cli.parse();`
    ]
]);

patchFile(path.join(mixRoot, 'src', 'builder', 'webpack-plugins.js'), [
    [/let WebpackBar = require\('webpackbar'\);\n\n/, ''],
    [/\n\n    if \(process\.env\.NODE_ENV !== 'test'\) \{\n        plugins\.push\(new WebpackBar\(\{ name: 'Mix' \}\)\);\n    \}\n/, '\n']
]);