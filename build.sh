#!/usr/bin/env bash

DOCKER_IMAGE_NAME="decentraland/pow-authorization-server"

docker build -t $DOCKER_IMAGE_NAME .

echo "Built docker image: $DOCKER_IMAGE_NAME"
