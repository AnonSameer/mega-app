# client/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Use nginx to serve the built files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (now it's in the same folder)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]