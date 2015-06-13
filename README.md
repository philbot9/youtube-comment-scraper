youtube-comment-web
===================

## About
This is the web client for my Youtube Comment Scraper project. It uses the [youtube-comment-api](https://github.com/philbot9/youtube-comment-api). The user can enter a YouTube video URL and then download all comments from that video as either JSON or CSV. The web client also displays a nicely formatted result for JSON and CSV. 

The results include the following information:

* Comment ID
* Username
* Date
* Timestamp
* Number of Likes
* Comment Text
* Replies

To see it in action go to: [ytcomments.klostermann.ca](http://ytcomments.klostermann.ca)

## Deployment
The project includes a Dockerfile and deploy script. Running `./deploy` will create a new Docker image and deploy a container. The instance will be listening for incoming connections on `http://localhost:49161`.

