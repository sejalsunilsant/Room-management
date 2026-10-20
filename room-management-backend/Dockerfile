# ---------------------------------------------
# Stage 1: Build the JAR with Maven
# ---------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and pom.xml first for caching dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# ---------------------------------------------
# Stage 2: Minimal Production Runtime
# ---------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy jar from builder
COPY --from=builder /build/target/*.jar app.jar

# Expose standard port (can be overridden by $PORT at runtime)
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
