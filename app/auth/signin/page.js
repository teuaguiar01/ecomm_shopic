'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevenir múltiplos cliques
    if (loading || cooldown) {
      return
    }
    
    setLoading(true)
    setCooldown(true)
    setError('')

    try {
      const result = await signIn('email', {
        email,
        redirect: true,
        callbackUrl: '/'
      })

      // Se não redirecionar automaticamente, redirecionar manualmente
      if (!result?.error) {
        window.location.href = '/auth/verify-request'
      } else {
        setError('Erro ao enviar o email. Tente novamente.')
        setLoading(false)
        // Cooldown de 30 segundos antes de permitir novo envio
        setTimeout(() => setCooldown(false), 30000)
      }
    } catch (err) {
      setError('Erro ao enviar o email. Tente novamente.')
      setLoading(false)
      // Cooldown de 30 segundos antes de permitir novo envio
      setTimeout(() => setCooldown(false), 30000)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .signin-button:hover {
          background-color: #374151 !important;
        }
        .signin-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          maxWidth: '400px', 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              Login
            </h2>
            <p style={{ 
              marginTop: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Digite seu email para receber um link de acesso
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fee2e2',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#991b1b'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cooldown}
              className="signin-button"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Enviando...' : cooldown ? 'Aguarde para reenviar' : 'Enviar link de acesso'}
            </button>
            
            {cooldown && !loading && (
              <p style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Aguarde 30 segundos antes de solicitar um novo link
              </p>
            )}
          </form>

          <div style={{ 
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <a
              href="/"
              style={{
                fontSize: '14px',
                color: '#6b7280',
                textDecoration: 'none'
              }}
            >
              ← Voltar para a página inicial
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
