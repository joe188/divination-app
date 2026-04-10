#!/bin/sh
cd "$(dirname "$0")/android"
exec ./gradlew "$@"
