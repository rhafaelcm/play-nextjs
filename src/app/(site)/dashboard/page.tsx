import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SignOutButton from "./SignOutButton";
import { prisma } from "@/utils/prismaDB";

// Função assíncrona para buscar dados do usuário no servidor incluindo sessões ativas
async function getUserActivity(userId: string) {
  try {
    // Buscar o usuário com sua sessão mais recente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: {
          orderBy: { expires: 'desc' },
          take: 1,
        }
      }
    });

    // Contar total de sessões ativas para este usuário
    const activeSessions = await prisma.session.count({
      where: {
        userId: userId,
        expires: {
          gt: new Date(),
        }
      }
    });

    // Retornar dados de atividade do usuário
    return {
      lastLogin: user?.sessions && user.sessions.length > 0
        ? new Date(user.sessions[0].expires.getTime() - (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()
        : "Nunca",
      memberSince: user?.emailVerified
        ? new Date(user.emailVerified).toLocaleDateString()
        : new Date().toLocaleDateString(),
      activeSessions: activeSessions,
    };
  } catch (error) {
    console.error("Erro ao buscar atividade do usuário:", error);
    return {
      lastLogin: "Indisponível",
      memberSince: new Date().toLocaleDateString(),
      activeSessions: 0,
    };
  }
}

export default async function Dashboard() {
  // Obter a sessão do lado do servidor
  const session = await getServerSession(authOptions);
  
  // Verificar se o usuário está autenticado
  if (!session?.user) {
    // Redirecionar para a página de login se não estiver autenticado
    redirect("/signin");
  }

  // Extrair dados do usuário da sessão
  const userData = session.user;
  
  // Garantir que o ID do usuário está disponível
  const userId = (userData as { id?: string }).id || "";

  // Buscar atividades do usuário (exemplo de consulta ao banco)
  const userActivity = await getUserActivity(userId);

  return (
    <>
      <Breadcrumb
        pageName="Dashboard"
        pageDescription="Welcome to your personal dashboard"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="rounded-lg bg-white p-8 shadow-md dark:bg-dark-2">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full">
                {userData?.image ? (
                  <Image
                    src={userData.image}
                    alt={userData.name || "User profile"}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-white">
                    {userData?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {userData?.name || "User"}
                </h3>
                <p className="text-body-color dark:text-body-color-dark">
                  {userData?.email || "No email"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-md bg-[#F8F9FF] p-6 dark:bg-dark">
                <h4 className="mb-3 text-lg font-semibold text-dark dark:text-white">
                  Account Information
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Name:</span>
                    <span className="font-medium text-dark dark:text-white">
                      {userData?.name || "Not provided"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Email:</span>
                    <span className="font-medium text-dark dark:text-white">
                      {userData?.email || "Not provided"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Member since:</span>
                    <span className="font-medium text-dark dark:text-white">
                      {userActivity.memberSince}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-md bg-[#F8F9FF] p-6 dark:bg-dark">
                <h4 className="mb-3 text-lg font-semibold text-dark dark:text-white">
                  Recent Activity
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Last login:</span>
                    <span className="font-medium text-dark dark:text-white">
                      {userActivity.lastLogin}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Active sessions:</span>
                    <span className="font-medium text-dark dark:text-white">
                      {userActivity.activeSessions}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-md bg-[#F8F9FF] p-6 dark:bg-dark">
                <h4 className="mb-3 text-lg font-semibold text-dark dark:text-white">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blogs"
                      className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Blogs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              {/* Usando um componente cliente para o botão de logout */}
              <SignOutButton />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}