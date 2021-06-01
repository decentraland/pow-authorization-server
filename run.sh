#!/usr/bin/env bash

DOCKER_IMAGE_NAME="decentraland/pow-authorization-server"

docker build -t $DOCKER_IMAGE_NAME .

docker run -d -p 5000:5000 $DOCKER_IMAGE_NAME

DOCKER_ID=$(docker ps | grep $DOCKER_IMAGE_NAME | awk '{ print $1 }')

echo "Running docker image: '$DOCKER_IMAGE_NAME' with id:  '$DOCKER_ID'"

# docker exec -it ${DOCKER_IMAGE_NAME} /bin/sh
