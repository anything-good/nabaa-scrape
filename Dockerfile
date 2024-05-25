FROM oven/bun

# Install necessary packages
RUN apt-get update && apt-get install -y chromium nano git

COPY . .
RUN bun install

CMD ["bun", "app.js"]
