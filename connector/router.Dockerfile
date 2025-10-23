FROM ghcr.io/apollographql/router:v2.8.0-preview.0

COPY router.yaml /config.yaml

CMD ["--config", "/config.yaml"]