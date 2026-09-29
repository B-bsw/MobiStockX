# setup database

on MacOS and Linux
```bash
export DB_URL=jdbc:postgresql://localhost:5432
export DB_USERNAME=postgres
export DB_PASSWORD=your-password
```

## API documentation (Swagger UI)

Run the application, then open [Swagger UI](http://localhost:8080/swagger-ui/index.html).
The generated OpenAPI JSON is available at [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs).

`/swagger-ui.html` is also available as a short URL that redirects to the Swagger UI page.

## CORS

The API allows requests from `http://localhost:3000` by default. Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of frontend origins in other environments, for example `https://app.example.com,http://localhost:3000`.
