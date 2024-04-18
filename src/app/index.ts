import express from "express";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from "body-parser";
import { User } from "./user";
import cors from "cors";

// just keep seeing the Doc section

export async function initServer() {

    const app = express();

    app.use(bodyParser.json());
    app.use(cors());

    const graphqlserver = new ApolloServer({
    typeDefs : `
        ${User.types}

        type Query {
            ${User.queries}
        }
    `,
    resolvers : {
        Query : {
            ...User.resolvers.queries,
        }
    },
    });

    await graphqlserver.start();
    
    app.use('/graphql', expressMiddleware(graphqlserver));

    return app;
    
}

