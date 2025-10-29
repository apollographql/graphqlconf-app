FROM ghcr.io/apollographql/apollo-mcp-server:latest

COPY mcp.yaml /data/mcp.yaml
COPY operations /data/operations
COPY supergraph.graphqls /data/supergraph.graphqls

EXPOSE 5000

CMD ["/data/mcp.yaml"]