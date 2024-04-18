import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwt";

// Creating a Datatype (struct) to store Google API response object value
interface GoogleTokenResult {
    iss? : string;
    nbf? : string;
    aud? : string;
    sub? : string;
    email : string;
    email_verified : string;
    azp? : string;
    name? : string;
    picture? : string;
    given_name : string;
    family_name? : string;
    iat? : string;
    exp? : string;
    jti? : string;
    alg? : string;
    kid? : string;
    typ? : string;
}

const queries = {
    // User will send me the Google generated token and I will send him the data of the token
    verifyGoogleToken : async(parent : any, {token} : {token : string}) => {
        const googleToken = token;

        // using the google Oauth link where token is given as params
        const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOauthURL.searchParams.set("id_token", googleToken);

        // making API call
        const {data} = await axios.get<GoogleTokenResult>(googleOauthURL.toString(), {
            responseType : "json",
        })

        // console.log(data);

        // make a call to find user with data.email
        const user = await prismaClient.user.findUnique({
            where : {email : data.email},
        })

        // if user do not exist --> create the user
        if(!user){
            await prismaClient.user.create({
                data : {
                    email : data.email,
                    firstName : data.given_name,
                    lastName : data.family_name,
                    profileImageURL : data.picture,
                }
            })
        }

        // now the user is surely present in DB
        // make a search now

        const userInDB = await prismaClient.user.findUnique({
            where : {email : data.email},
        })

        // while passing userInDB to function, you will see error, You have to ensure with code i.e I am handling if userInDB not present case
        if(!userInDB) throw new Error('User with email not found');


        // Generate the token --> JWT
        const userToken = JWTService.generateTokenForUser(userInDB);

        return userToken;

    }
}

export const resolvers = {queries};