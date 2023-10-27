FROM node:latest

WORKDIR /app
COPY ./package* .
COPY ./tsconfig.json .
RUN npm i


#debug
#CMD tail -f /dev/null

CMD ["npm", "run", "start:dev"]
