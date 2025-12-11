export default function VerifyRequest() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .verify-button:hover {
          background-color: #374151 !important;
        }
      `}} />
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto',
            backgroundColor: '#dcfce7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              style={{ width: '32px', height: '32px', color: '#16a34a' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <h2 style={{ 
            marginTop: '24px',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            Verifique seu email
          </h2>
          
          <p style={{ 
            marginTop: '16px',
            fontSize: '16px',
            color: '#4b5563'
          }}>
            Um link de acesso foi enviado para o seu endereço de email.
          </p>
          
          <p style={{ 
            marginTop: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Clique no link do email para fazer login. Você pode fechar esta página.
          </p>
        </div>
        
        <div style={{
          marginTop: '32px',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          padding: '16px'
        }}>
          <p style={{ 
            fontSize: '14px',
            color: '#1e40af',
            margin: 0
          }}>
            💡 Não recebeu o email? Verifique sua caixa de spam ou tente fazer login novamente.
          </p>
        </div>

        <div style={{ marginTop: '24px' }}>
          <a
            href="/"
            className="verify-button"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              backgroundColor: '#000',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
