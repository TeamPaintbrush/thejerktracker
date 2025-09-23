FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install additional tools
RUN apt-get update && apt-get install -y \
    default-jre \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# Install DynamoDB Local
RUN mkdir -p /opt/dynamodb \
    && curl -L https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz \
    | tar xz -C /opt/dynamodb

# Create DynamoDB Local startup script
RUN echo '#!/bin/bash\ncd /opt/dynamodb && java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000' > /usr/local/bin/dynamodb-local \
    && chmod +x /usr/local/bin/dynamodb-local

# Create workspace directory and set permissions
RUN mkdir -p /workspace/.dynamodb \
    && chown -R node:node /workspace

# Switch to node user
USER node

# Set working directory
WORKDIR /workspace

# Copy package files for dependency installation
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci

# Expose ports
EXPOSE 3000 8000