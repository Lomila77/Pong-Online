FROM node:latest

WORKDIR /app

COPY package*.json ./
COPY ./tsconfig.json .
COPY prisma ./prisma/

RUN npm install
RUN npm install -g prisma
RUN prisma generate

COPY . .

CMD [ "npm", "run", "start:dev" ]

#debug
#CMD tail -f /dev/null

