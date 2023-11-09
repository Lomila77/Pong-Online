FROM node:latest

# front-end files handling in container
WORKDIR /app
COPY ./package* .
COPY tailwind.config.js .
RUN npm i
COPY . .
EXPOSE 5173


RUN ["npm", "install", "yup"]
RUN ["npm", "install", "react-hook-form"]
RUN ["npm", "install", "@hookform/resolvers"]
RUN ["npm", "install", "@tanstack/react-query"]

CMD ["npm", "run", "dev"]

#debug
#CMD tail -f /dev/null
