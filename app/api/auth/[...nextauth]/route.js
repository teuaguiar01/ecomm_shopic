import NextAuth from 'next-auth/next'
import Email from 'next-auth/providers/email'
import { prisma } from '@/utils/prisma'
import { getServerSession as serverSession } from "next-auth/next"

function PrismaAdapter(p) {
    return {
        createUser: (data) => p.user.create({ data }),
        getUser: (id) => p.user.findUnique({ where: { id } }),
        getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
        async getUserByAccount(provider_providerAccountId) {
            var _a;
            const account = await p.account.findUnique({
                where: { provider_providerAccountId },
                select: { user: true },
            });
            return (_a = account === null || account === void 0 ? void 0 : account.user) !== null && _a !== void 0 ? _a : null;
        },
        updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),
        deleteUser: (id) => p.user.delete({ where: { id } }),
        linkAccount: (data) => p.account.create({ data }),
        unlinkAccount: (provider_providerAccountId) => p.account.delete({
            where: { provider_providerAccountId },
        }),
        async getSessionAndUser(sessionToken) {
            const userAndSession = await p.session.findUnique({
                where: { sessionToken },
                include: { user: true },
            });
            if (!userAndSession)
                return null;
            const { user, ...session } = userAndSession;
            return { user, session };
        },
        createSession: (data) => p.session.create({ data }),
        updateSession: (data) => p.session.update({ where: { sessionToken: data.sessionToken }, data }),
        deleteSession: (sessionToken) => p.session.deleteMany({ where: { sessionToken } }),
        async createVerificationToken(data) {
            const verificationToken = await p.verificationToken.create({ data });
            // @ts-expect-errors // MongoDB needs an ID, but we don't
            if (verificationToken.id)
                delete verificationToken.id;
            return verificationToken;
        },
        async useVerificationToken(identifier_token) {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: { identifier_token },
                });
                // @ts-expect-errors // MongoDB needs an ID, but we don't
                if (verificationToken.id)
                    delete verificationToken.id;
                return verificationToken;
            }
            catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if (error.code === "P2025")
                    return null;
                throw error;
            }
        },
    };
}

// Template de email em texto simples (português)
function textEmail({ url, host }) {
    return `Faça login em ${host}\n\nClique no link abaixo para fazer login:\n${url}\n\nSe você não solicitou este email, pode ignorá-lo com segurança.\n`;
}

// Template de email em HTML (português)
function htmlEmail({ url, host }) {
    const escapedHost = host.replace(/\./g, "&#8203;.");
    const brandColor = "#000000";
    const buttonText = "#ffffff";
    const buttonBackground = brandColor;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faça login</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #333333; font-size: 24px; font-weight: 600;">
                                Faça login em ${escapedHost}
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                Clique no botão abaixo para fazer login na sua conta:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${buttonBackground}; color: ${buttonText}; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                                            Fazer Login
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 20px;">
                                Se você não solicitou este email, pode ignorá-lo com segurança.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 18px;">
                                Ou copie e cole este link no seu navegador:<br>
                                <a href="${url}" style="color: ${brandColor}; word-break: break-all;">${url}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} ${escapedHost}. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

export const authOptions = {
    providers: [
        Email({
            server: {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            },
            type: "email",
            name: "Email Sign-in",
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url, provider }) {
                const { host } = new URL(url);
                const transport = await import('nodemailer').then(m => m.default.createTransport(provider.server));
                
                await transport.sendMail({
                    to: email,
                    from: provider.from,
                    subject: `Faça login em ${host}`,
                    text: textEmail({ url, host }),
                    html: htmlEmail({ url, host }),
                });
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
    },
    theme: {
        colorScheme:"light",
        buttonText: "#ffffff",
        brandColor: "#000000",
        logo: '/static/images/logo.png'
    },
    callbacks: {
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.user.id = user.id
            session.user.name = user.name
            session.user.role = user.role
            session.user.cpf = user.cpf
            session.user.phone = user.phone

            return session
          }
    },
    events: {
        createUser(msg) {
            prisma.user.count().then((c) => {
                if (c <= 1)
                    prisma.user.update({
                        where: {
                            id: msg.user.id
                        },
                        data: {
                            role: "admin"
                        }
                    })
            })
        }
    }
}


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export function getServerSession() {
    return serverSession(authOptions)
}