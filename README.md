# CallHTML

Simple lead dialer & filter application.

## Running locally

Open `index.html` directly in your browser.

## Docker

Build and run the container to serve the app with Nginx:

```sh
docker build -t callhtml .
docker run -p 8080:80 callhtml
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

## Desktop App

To preview the app as a desktop application using Electron:

```sh
npm run electron
```

To build a Windows installer `.exe` (output to the `release/` directory):

```sh
npm run build:win
```

Building for Windows from macOS or Linux requires [Wine](https://www.winehq.org/) to be installed.
