FROM node:latest

# front-end files handling in container
WORKDIR /app
COPY ./package* .
RUN npm i
COPY . .
EXPOSE 5173

# change default shell
#SHELL ["/bin/bash", "-c"] 

CMD ["npm", "run", "dev"]

#debug
#CMD tail -f /dev/null