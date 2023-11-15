# FROM node:latest

# WORKDIR /app

# COPY package*.json ./
# COPY ./tsconfig.json .
# COPY prisma ./prisma/

# RUN npm install
# RUN npm install -g prisma
# RUN prisma generate

# COPY . .

# CMD [ "npm", "run", "start:dev" ]

# #debug
# #CMD tail -f /dev/null


FROM node:latest

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
COPY ./tsconfig.json .
COPY prisma ./prisma/

RUN npm install
RUN npm install curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash-g prisma class-validator bcrypt
# RUN prisma generate

COPY . .

# CMD [ "npm", "run", "start:dev" ]

# Debug
# CMD tail -f /dev/null
