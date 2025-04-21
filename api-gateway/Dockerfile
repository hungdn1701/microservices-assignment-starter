FROM node:18-alpine

WORKDIR /app

# Cài đặt curl và các phụ thuộc khác
RUN apk add --no-cache curl

# Copy package.json và package-lock.json để cài đặt dependencies trước
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Đảm bảo các package Swagger được cài đặt 
RUN npm install swagger-jsdoc@6.2.8 swagger-ui-express@5.0.0 yamljs@0.3.0 --no-save

# Copy source code vào container
COPY . .

EXPOSE 4000

CMD ["npm", "start"]
