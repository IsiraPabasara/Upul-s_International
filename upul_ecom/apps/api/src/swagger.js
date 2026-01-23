import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: "Auth Service API",
        description: "Automatically generated Swagger docs",
        version: "1.0.0",
    },

    host: "localhost:4000",
    basePath: "/api",
    schemes: ["http"],
}

const outputFile = "./swagger-output.json";
const endpointsFile = ["./routes/main.router.ts"];

swaggerAutogen()(outputFile, endpointsFile, doc);
