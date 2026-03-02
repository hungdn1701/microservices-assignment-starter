# ==============================================
# Service A — Dockerfile
# Replace this template with your actual setup
# ==============================================
#
# Examples for common frameworks:
#
# ── Node.js (Express/Fastify/NestJS) ──
# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --production
# COPY src/ ./src/
# EXPOSE 5000
# CMD ["node", "src/index.js"]
#
# ── Python (FastAPI/Flask/Django) ──
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY src/ ./src/
# EXPOSE 5000
# CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5000"]
#
# ── Java (Spring Boot) ──
# FROM maven:3.9-eclipse-temurin-21 AS builder
# WORKDIR /app
# COPY pom.xml .
# RUN mvn dependency:go-offline
# COPY src/ ./src/
# RUN mvn package -DskipTests
# FROM eclipse-temurin:21-jre-alpine
# COPY --from=builder /app/target/*.jar app.jar
# EXPOSE 5000
# CMD ["java", "-jar", "app.jar"]
#
# ── Go ──
# FROM golang:1.22-alpine AS builder
# WORKDIR /app
# COPY go.* ./
# RUN go mod download
# COPY . .
# RUN go build -o service ./src
# FROM alpine:3.19
# COPY --from=builder /app/service /service
# EXPOSE 5000
# CMD ["/service"]
#
# ── .NET (ASP.NET Core) ──
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
# WORKDIR /app
# COPY *.csproj .
# RUN dotnet restore
# COPY . .
# RUN dotnet publish -c Release -o /out
# FROM mcr.microsoft.com/dotnet/aspnet:8.0
# COPY --from=builder /out .
# EXPOSE 5000
# CMD ["dotnet", "ServiceA.dll"]
