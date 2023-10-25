FROM node:latest

# front-end files handling in container
WORKDIR /app
COPY ./package* .
RUN npm i
COPY . .
EXPOSE 5173


RUN ["npm", "install", "yup"]
RUN ["npm", "install", "react-hook-form"]
RUN ["npm", "install", "@hookform/resolvers"]

CMD ["npm", "run", "dev"]

#debug
#CMD tail -f /dev/null