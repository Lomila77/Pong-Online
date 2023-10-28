FROM node:latest

WORKDIR /app

COPY package*.json ./
COPY ./tsconfig.json .
COPY prisma ./prisma/

RUN npm install
RUN npm install -g prisma
RUN prisma generate
RUN prisma migrate dev

COPY . .

CMD [  "npm", "run", "start:migrate:dev" ]


#debug
#CMD tail -f /dev/null

