<div align="center">

# ⚡ DEV.SYS — Portfólio Profissional
### Identidade Digital com Design Técnico e Alta Performance

<br>

[![Acessar Site](https://img.shields.io/badge/🌍_ACESSAR_SITE_ONLINE-f97316?style=for-the-badge)](https://meu-portfolio-pro.vercel.app)

<br>

![Next.js](https://img.shields.io/badge/next.js-16.1-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Nodemailer](https://img.shields.io/badge/nodemailer-smtp-22C55E?style=for-the-badge&logo=gmail&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-f97316?style=for-the-badge)

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-design-system">Design System</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-executar">Instalação</a> •
  <a href="#-autor">Autor</a>
</p>

</div>

---

## 💡 Sobre o Projeto

O **DEV.SYS** é um portfólio profissional desenvolvido do zero em **Next.js 16 com TypeScript**, construído para ser diferente — sem nenhum framework de UI externo. Cada componente visual foi criado intencionalmente usando **CSS Custom Properties**, formando um sistema de design completo e coeso.

O diferencial deste projeto está na combinação de uma **identidade visual técnica e autoral** — inspirada em interfaces de cockpit e terminais de missão — com funcionalidades modernas como integração dinâmica com a **API do GitHub**, formulário de contato com **validação em tempo real**, envio de e-mails via **Nodemailer + Gmail SMTP** e um sistema de animações próprio baseado em `IntersectionObserver`.

> O projeto reflete diretamente a identidade do desenvolvedor: preciso, técnico e com atenção aos detalhes.

---

## 🌟 Funcionalidades Principais

### 🖥️ Interface & Navegação
- **Dual Theme System:** Alternância suave entre modo escuro (`#0b0b0f`) e claro (pergaminho `#e8e0d4`) via CSS custom properties em cascata — 40+ tokens atualizados instantaneamente.
- **Navbar com Sliding Indicator:** Underline que desliza entre os links usando `offsetLeft` + `cubic-bezier(.4,0,.2,1)` — a mesma técnica usada por Linear e Vercel.
- **Breadcrumb em Tempo Real:** Contador `sec 01 / 06` atualizado automaticamente pelo scroll via `IntersectionObserver`.
- **Dot Navigation:** Menu lateral de pontos para scroll suave entre seções.
- **Scroll Progress Bar:** Barra de 2px no topo refletindo o progresso de leitura da página.

### 🎬 Sistema de Animações
- **`GlitchText`:** Efeito glitch periódico no nome com intervalo aleatório (5–8s), usando `text-shadow` + `skewX`.
- **`TypeWriter`:** Digitação e deleção de múltiplas palavras com velocidades configuráveis.
- **`Counter`:** Contadores numéricos que animam de `0` até o valor-alvo ao entrar no viewport.
- **`Reveal`:** Fade + `translateY` escalonado ao scroll para cada seção.
- **`SkillBar`:** Barras de progresso com `transition-delay` escalonado por item.

### 🗂️ Seção de Projetos
- **Integração Dinâmica:** Busca em tempo real via `GET /users/Hiann/repos?sort=updated&per_page=50`.
- **`REPO_META`:** Objeto de configuração para sobrescrever títulos e tags de repositórios específicos com nomes mais apresentáveis.
- **Detecção de Linguagem:** Cor automática por linguagem (Python, Java, TypeScript, HTML...).
- **Grid Responsivo:** 3 colunas → 2 colunas → 1 coluna com skeleton de carregamento animado.

### 📬 Formulário de Contato
- **Validação em Tempo Real** com `onBlur` por campo: nome (mín. 2 chars), e-mail (regex), mensagem (mín. 10 chars).
- **Estados Visuais Completos:** `idle` → `sending` → `sent` → `error` com transições animadas.
- **Auto-Reset:** Countdown de 6 segundos com anel SVG progressivo após envio bem-sucedido.
- **Feedback Visual:** Borda verde se válido, vermelha se inválido, laranja se focado.

### 📧 Template de E-mail Premium
- Layout HTML dark com identidade visual DEV.SYS — totalmente compatível com Gmail, Outlook e Apple Mail.
- **ID único por mensagem** (`MSG-AAAAMMDD-XXXXX`) no assunto, topbar e rodapé para rastreabilidade.
- Metadados automáticos: data completa, horário com timezone, contagem de palavras da mensagem.
- Ícone de envelope em **SVG inline** — sem dependência de imagens externas.
- Dois CTAs: responder diretamente ao remetente + link para o GitHub.

---

## 🎨 Design System

O projeto segue uma identidade visual estrita **"Dark Tech / Pergaminho"**, com dois modos completamente distintos.

| **Elemento** | **Detalhes Técnicos** |
|:---|:---|
| **Tokens CSS** | 40+ custom properties em cascata — trocar o `data-theme` no elemento raiz atualiza todo o sistema instantaneamente, sem JavaScript. |
| **Background Animado** | Dot grid com máscara radial elíptica via `radial-gradient` + scanline de 1px em loop de 11 segundos. |
| **Navbar** | Grid de 3 zonas (logo · links · toggle), altura total de 64px, linha de acento com `@keyframes` pulsante. |
| **Cards** | Bordas `rgba`, cantos decorativos com pseudo-elementos, `transform: translateY(-3px)` e `box-shadow` no hover. |
| **Tipografia** | `Space Grotesk` para display (headings, logo) · `JetBrains Mono` para interface (nav, labels, código). |
| **Logo** | Crosshair com quadrado externo e inner square que gira 45° no hover via `cubic-bezier(.34,1.56,.64,1)`. |

---

## 🛠️ Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

**Back-end & Framework:**
- **Next.js 16** (App Router, Server Components, API Routes)
- **TypeScript 5.x** (tipagem estática em todo o projeto)
- **Node.js ≥ 18**

**Front-end:**
- HTML semântico & **CSS Custom Properties** (zero frameworks de UI)
- React 19 (hooks: `useState`, `useEffect`, `useRef`)
- **IntersectionObserver API** (animações acionadas pelo scroll)

**Serviços:**
- **Nodemailer** + Gmail SMTP (envio de e-mails)
- **GitHub REST API** (repositórios em tempo real)
- **Google Fonts** (Space Grotesk + JetBrains Mono)

**Deploy:**
- **Vercel** (CI/CD automático a cada `git push`)

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js `>= 18.x`
- npm `>= 9.x`
- Conta Gmail com **senha de app** habilitada (para o formulário de contato)

### Passo a Passo

**1. Clone o repositório**
```bash
git clone https://github.com/Hiann/meu-portfolio-pro.git
cd meu-portfolio-pro
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
GMAIL_USER=seu-email@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
```

> **Como gerar `GMAIL_PASS`:** Google Account → Segurança → Verificação em duas etapas → **Senhas de app** → Gerar (16 caracteres).
>
> ⚠️ **Nunca commite o `.env.local`** — ele já está no `.gitignore`.

**4. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```
Acesse `http://localhost:3000`

---

## 📂 Estrutura de Arquivos

```
meu-portfolio-pro/
├── public/
│   ├── profile.jpeg                  # Foto de perfil (hero)
│   ├── raio.png                      # Favicon alternativo
│   └── Curriculo_Hiann_Alexander.pdf # CV para download
│
├── src/
│   └── app/
│       ├── icon.png                  # Favicon (App Router)
│       ├── layout.tsx                # Root layout: metadata, SEO, lang
│       ├── page.tsx                  # Portfólio completo (componente único)
│       ├── globals.css               # Reset CSS global
│       └── api/
│           └── contact/
│               └── route.ts         # POST handler + template de e-mail
│
├── .env.local                        # ⚠️  Não commitar
├── .env.local.example                # Template de variáveis
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 📫 Autor

<div align="center">

**Hiann Alexander Mendes de Oliveira**
*Programador Python · Backend · Inteligência Artificial*

<a href="https://linkedin.com/in/hiann-alexander" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-Conectar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
<a href="https://github.com/Hiann" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-Ver_Perfil-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
<a href="mailto:hiannpdr1234@gmail.com" target="_blank">
  <img src="https://img.shields.io/badge/Email-Contato-f97316?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
</a>

📍 Goiânia – GO &nbsp;·&nbsp; 🟢 Disponível para projetos e oportunidades

</div>