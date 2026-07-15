# Dockerfile for KSM Real Estate Backend
# Author: ulrich675
# Date: 2026-07-15
# Description: Optimized Dockerfile that reuses locally compiled JAR to avoid Maven downloads.

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the pre-compiled JAR from the target folder on host
COPY target/ksm-real-estate-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose backend WebFlux port
EXPOSE 8080

# Run the reactive application
ENTRYPOINT ["java", "-jar", "app.jar"]
