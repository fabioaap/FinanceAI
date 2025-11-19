# FinanceAI - Autenticação OAuth

Sistema de gestão financeira inteligente com autenticação OAuth para sincronização de dados.

## 🚀 Recursos

- ✅ Autenticação OAuth com Google e GitHub
- ✅ Sincronização de dados do usuário
- ✅ Interface moderna com Tailwind CSS
- ✅ TypeScript para type safety
- ✅ Next.js 14+ com App Router
- ✅ NextAuth.js v4 para autenticação

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Google Cloud Platform (para OAuth Google)
- Conta GitHub (para OAuth GitHub)

## 🔧 Configuração Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Configurar Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Navegue até "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure o OAuth consent screen se solicitado
6. Selecione "Web application" como tipo
7. Adicione as URLs autorizadas:
   - JavaScript origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copie o Client ID e Client Secret para o `.env.local`

### 4. Configurar GitHub OAuth

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:
   - Application name: `FinanceAI`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Clique em "Register application"
5. Copie o Client ID e gere um Client Secret
6. Adicione ao `.env.local`

### 5. Gerar NEXTAUTH_SECRET

Execute o comando para gerar uma chave secreta:

```bash
openssl rand -base64 32
```

Adicione o resultado ao `.env.local` como `NEXTAUTH_SECRET`

### 6. Arquivo .env.local completo

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-gerada

GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

GITHUB_ID=seu-github-client-id
GITHUB_SECRET=seu-github-client-secret
```

## 🏃 Executar Localmente

### Modo desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build de produção

```bash
npm run build
npm start
```

### Verificar tipos TypeScript

```bash
npm run type-check
```

### Lint do código

```bash
npm run lint
```

## 🌐 Deploy em Produção

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no painel da Vercel
4. Atualize as URLs de callback nos consoles do Google e GitHub:
   - Google: `https://seu-dominio.vercel.app/api/auth/callback/google`
   - GitHub: `https://seu-dominio.vercel.app/api/auth/callback/github`
5. Deploy automático configurado!

### Outras plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

Certifique-se de:
1. Configurar todas as variáveis de ambiente
2. Atualizar `NEXTAUTH_URL` para a URL de produção
3. Atualizar as URLs de callback nos providers OAuth

## 🔒 Segurança

- Nunca commite o arquivo `.env.local`
- Use senhas fortes para `NEXTAUTH_SECRET`
- Mantenha os client secrets seguros
- Revise regularmente os tokens de acesso
- Configure CORS adequadamente em produção

## 📁 Estrutura do Projeto

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts        # Configuração NextAuth
│   │   ├── auth/
│   │   │   └── signin/
│   │   │       └── page.tsx            # Página de login customizada
│   │   ├── globals.css                  # Estilos globais com Tailwind
│   │   ├── layout.tsx                   # Layout raiz com AuthProvider
│   │   └── page.tsx                     # Página inicial
│   └── components/
│       ├── AuthButton.tsx               # Botão de login/logout
│       └── AuthProvider.tsx             # Provider de sessão
├── .env.example                         # Template de variáveis de ambiente
├── next.config.js                       # Configuração Next.js
├── tailwind.config.js                   # Configuração Tailwind
├── tsconfig.json                        # Configuração TypeScript
└── package.json                         # Dependências e scripts
```

## 🧪 Testando a Autenticação

1. Inicie o servidor local: `npm run dev`
2. Acesse `http://localhost:3000`
3. Clique em "Google" ou "GitHub" para fazer login
4. Autorize o aplicativo no provider escolhido
5. Você será redirecionado de volta autenticado
6. Verifique se seu nome e foto aparecem no header
7. Clique em "Sair" para fazer logout

## 🐛 Troubleshooting

### Erro: "Configuration invalid"
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que os Client IDs e Secrets estão corretos

### Erro: "Redirect URI mismatch"
- Verifique se as URLs de callback estão corretas nos consoles
- Confirme que `NEXTAUTH_URL` está correto

### Sessão não persiste
- Verifique se `NEXTAUTH_SECRET` está configurado
- Confirme que os cookies estão habilitados no navegador

### Build falha
- Execute `npm run type-check` para verificar erros de tipo
- Execute `npm run lint` para verificar problemas de estilo

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

ISC License
