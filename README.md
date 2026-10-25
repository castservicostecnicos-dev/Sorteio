# FutSociety Pro - Sorteador & Gestão de Futebol Society

Aplicação web moderna para sorteio randômico e equilibrado de times de futebol Society, com importação de listas do WhatsApp, gestão de atletas frequentes, pontuação e estatísticas.

---

## 🚀 Como Publicar no Render.com

### Opção 1: Como "Web Service" (Node.js - Recomendado)

1. Crie uma conta no [Render.com](https://dashboard.render.com/) e conecte seu repositório GitHub.
2. Clique em **"New +"** $\rightarrow$ **"Web Service"**.
3. Selecione o repositório `Sorteio`.
4. Preencha as configurações:
   - **Name**: `futsociety-pro` (ou outro nome desejado)
   - **Environment / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
5. Clique em **"Create Web Service"**.

---

### Opção 2: Como "Static Site" (Site Estático - 100% Gratuito)

1. No painel do Render, clique em **"New +"** $\rightarrow$ **"Static Site"**.
2. Selecione o repositório.
3. Configure os campos:
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`
4. Em **Advanced** $\rightarrow$ **Redirects/Rewrites**:
   - Adicione uma regra de reescrita para Single Page Application:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
5. Clique em **"Create Static Site"**.
