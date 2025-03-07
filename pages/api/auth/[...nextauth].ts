import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prismadb from '@/lib/prismadb';
import { compare } from 'bcrypt';

import { PrismaAdapter } from "@next-auth/prisma-adapter";

import GithubProviders from 'next-auth/providers/github';
import GoogleProviders from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GithubProviders({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || ''
        }),
        GoogleProviders({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        }),
        Credentials({
            id : 'credentials',
            name : 'credentials',
            credentials : {
                email : {
                    label : 'Email',
                    type : 'text',
                },
                password : {
                    label : 'Password',
                    type : 'password'
                }
            },
             async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide both email and password.');
            }

            const user = await prismadb.user.findUnique({
                 where : {
                    email : credentials.email 
                 },
            });
            if(!user || !user.hashedPassword){
                throw new Error('Invalid email or password.');
            }
            const isCorrectPassword = await compare(
                credentials.password, user.hashedPassword
            );
            if(!isCorrectPassword){
                throw new Error('Invalid email or password.');
            }

            return user;
            }
        })
    ],
    pages : {
        signIn: '/auth'
    },
    debug : process.env.NODE_ENV=='development',
    adapter: PrismaAdapter(prismadb),
    session : {
        strategy : 'jwt',
    },
    jwt: {
        secret : process.env.NEXTAUTH_JWT_SECRET,
    },
    secret : process.env.NEXTAUTH_SECRET,
});