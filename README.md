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
