import "next-auth";
import "next-auth/jwt"
import { DateTime } from "next-auth/providers/kakao";

declare module "next-auth"{
    interface Session {
        accessToken?: string
        refreshToken?:string
        error?:string
    }
    interface User {
        accessToken?:string,
        refreshToken?:string,
        accessTokenExpirationDate?:number
    }
}

declare module "next-auth/jwt"{
        interface JWT {
        accessToken?:string,
        refreshToken?:string,
        accessTokenExpires?:number
        error?:string
    }
}