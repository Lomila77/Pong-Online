FROM node:latest

# ********* old installation with ubuntu latest **********
#RUN apt-get update -y && \
#    apt-get install curl -y && \
#    apt-get install npm -y && \
#    apt-get install vite -y



# update npm and node through nvm
#RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
#RUN source ~/.nvm/nvm.sh && nvm install 18.17.1 && npm install -g npm@10.1.0

# front-end files handling in container
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 5173

# change default shell
#SHELL ["/bin/bash", "-c"] 

ENTRYPOINT ["npm", "run", "dev"]

#debug
#CMD tail -f /dev/null