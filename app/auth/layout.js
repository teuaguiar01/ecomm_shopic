import '@/app/globals.css'

export const metadata = {
  title: 'Autenticação - SHOPIC',
  description: 'Página de autenticação',
}
 
export default function AuthLayout({ children }) {
 return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
