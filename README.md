# scrobble

> A web browser implementation of a popular board game

![preview](.github/board.png?raw=true "Board Preview")

## Why?

My friends and I like to play scrabble occasionally. When we play, we use [Tabletop Simulator](https://store.steampowered.com/app/286160/Tabletop_Simulator/), but some friends do not own Tabletop Simulator, and don't want to purchase it. So I created this project so that I can play **scrobble** with my friends without them needing to pay for a seperate game.

## How?

This project is structured into 2 parts:

- A client that runs in the web browser and presents the board and tiles to the user
- A server that communicates via websockets with the clients to maintain state, and ensure fair play.

### Client

The client is written using React, React Redux (for state management), Reactstrap/Bootstrap (for basic styling), and socketio (for fast, bidirectional communication).

The client works by first presenting a landing page where you can input a server address and port that you wish to connect to.

![landing](.github/landing.png?raw=true "Landing Page")

Once you established a connection with the server, you are presented with the **scrobble** board. If you are the first person to connect, you are granted the host role, which means you decide when the game starts. Once all the other players have joined, you simply press the button at the top left to start the game, and the game proceeds like a normal **scrobble** game.

### Server

The server is single-file, very basic, and written in javascript and ran by nodejs. It uses socketio (for the bidirectional communication) and has several different routes that it responds to based on game state.

## I want to play!

Great. This project was set up in a way to allow anyone to easily create their own servers to play with their friends, instead of hosting a single server that manages different connections (as I can't afford to pay for that!) 

So to host your own server simply do:

```sh
git clone https://github.com/nikita-skobov/scrobble
cd scrobble
npm install
node server/index.js
```

This will start a server on your machine on port 3069 by default. The server also contains a simple root endpoint to test if the server is up and running. You can check this in your browser by going to `http://localhost:3069/`

*But more importantly, you want to know if your friends can connect to your server over the internet*

So I recommend using https://canyouseeme.org/ to test if your friends can connect to your server. If the canyouseeme website fails to connect to your server, that probably means you need to port forward 3069 from your router to your local machine, or otherwise modify your firewall rules to allow traffic on that port.


Once you verified that the server works, you can either have your friends go to `http://scrobble.nikitas.link` for a live version of the clientside react application, and then have them input your ip address and port.

*NOTE: It is important that they go to the HTTP version, and not the HTTPS version of the site because the server that you are using is not set up for HTTPS connections, and browsers these days do not allow mixed HTTP and HTTPS content*

If you want to modify the frontend, or host a newer version that hasn't been deployed yet, you would need to make those changes that you wish, and then have you and your friends do the following:

```sh
git clone https://github.com/nikita-skobov/scrobble
# or if you forked it to make changes, have your friends
# clone your fork, not the upstream repo
cd scrobble
npm install
npm run start
```

This will start the react development server on port 3000 and should automatically open the app in your browser. Then proceed to input the ip and port of the actual game server.

## Deployment

As usual, I like to set up my webapp projects to be easily deployed and updated. You will find the deployment code within the `deployment/` directory. It includes some scripts to build, minify, and compress the frontend code before deploying it to my hosting provider which is AWS. All that the deployment does is upload a new version of the frontend code to S3, which is accessed via a CloudFront distribution which is routed to by my domain: `nikitas.link` with routes in Route53. The actual deployment infrastructure is defined in `deployment/serverless.yml` and `deployment/cloudfront-app.yml`. the serverless.yml file takes in arguments of the bucket name, hosted zone name, https certificate id, AWS account number, etc. This is to avoid hardcoding credentials in a public git repo, but also to allow other users to easily deploy this project to their own AWS accounts if they wish.



## Code quality

This project was written over the course of about 8 hours, with some minor bug fixes after that. The intention was to quickly create a workable game, rather than write good code. As such the code is not necessarily pretty or well commented (especially the server/index.js file).