FROM ghcr.io/apollographql/apollo-mcp-server:latest

COPY mcp.yaml /mcp.yaml
COPY operations /operations

EXPOSE 5000

CMD ["mcp.yaml"]