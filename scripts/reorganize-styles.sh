#!/usr/bin/env bash

set -euo pipefail

css_dir="resources/css"
scss_dir="resources/scss"

mkdir -p "$scss_dir"

shopt -s nullglob
for scss_file in "$css_dir"/*.scss; do
    mv "$scss_file" "$scss_dir"/
done
shopt -u nullglob

find "$css_dir" -maxdepth 1 -type f ! \( -name 'style.css' -o -name 'reset.css' \) -delete

touch "$css_dir/style.css" "$css_dir/reset.css"