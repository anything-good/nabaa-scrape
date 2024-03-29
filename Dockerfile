FROM oven/bun
COPY . .
RUN bun install
RUN apt-get update && apt-get install -y chromium-browser
CMD ["bun", "index.ts"]