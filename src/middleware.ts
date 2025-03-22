import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware com proteção de autenticação para rotas específicas
export default withAuth(
  function middleware(req) {
    // Se o usuário não estiver autenticado e tentar acessar o dashboard
    if (
      req.nextUrl.pathname.startsWith("/dashboard") &&
      !req.nextauth.token
    ) {
      // Redireciona para a página de login
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    // Se estiver autenticado, permite o acesso
    return NextResponse.next();
  },
  {
    callbacks: {
      // Função que verifica se o usuário está autorizado com base no token
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuração de quais rotas o middleware deve proteger
export const config = {
  matcher: ["/dashboard/:path*"],
};