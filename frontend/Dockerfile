FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:8080
ENV WDS_SOCKET_PORT=0
ENV NODE_ENV=development

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "start"] 