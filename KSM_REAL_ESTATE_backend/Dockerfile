# Dockerfile for KSM Real Estate Backend
# Author: ulrich675
# Date: 2026-07-13

# ==================== Build Stage ====================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml to resolve dependencies offline
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package skipping test execution
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==================== Run Stage ====================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/target/ksm-real-estate-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose backend WebFlux port
EXPOSE 8080

# Run the reactive application
ENTRYPOINT ["java", "-jar", "app.jar"]
