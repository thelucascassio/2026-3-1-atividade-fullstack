# 2026.3.1 - POS - Frontend web e Backend api restful

## Informações gerais

- **Público alvo**: alunos da disciplina de **Programação orientada a serviços** do curso de [Infoweb](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/) na [DIATINF](https://diatinf.ifrn.edu.br/) no [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- **Professor**: [L A Minora](https://github.com/leonardo-minora/)
- **Objetivo**:
  1. Atividade avaliativa para construção de aplicativo com frontend web e backend api restful

[A descrição da atividade](atividade.md)

---
## Relato da atividade
* Lucas Cássio Araújo Oliveira
* GitHub: www.github.com/thelucascassio
* LinkedIn: www.linkedin.com/in/lucas-cássio-oliveira-014a39343

### Componentes e tecnologias
* **Frontend:** Next.js, React, Node.js
* **Backend:** NestJS (API RESTful), TypeScript, Tailwind CSS
* **Banco de Dados:** SQLite via Prisma ORM

### Agente de IA

Qual e como utilizou a IA?

O agente de IA utilizado para elaborar a atividade foi o Gemini. Solicitei ao agente para me conduzir no passo a passo da atividade para que eu não me perdesse nem seguisse uma ordem errada.
Também utilizei-o para elaborar a arquitetura e me orientar em relação à estruturação das pastas do sistema. Utilizei o Gemini para tirar dúvidas do porquê a aplicação estava dando erro (debuggar), por exemplo: havia um erro nas portas do Codespaces e o Gemini me orientou a alterar a visibilidade da porta no terminal. Além disso, pude ter seu auxílio para desenvolver a estruturação da API RESTful e refatorar o layout para garantir responsividade completa (Mobile-First e depois Desktop).

### Execução do projeto

Como executar o projeto?

Siga os passos abaixo para rodar a aplicação em seu ambiente local:

#### 1. Clonar o repositório
```bash
git clone [https://github.com/thelucascassio/2026-3-1-atividade-fullstack.git](https://github.com/thelucascassio/2026-3-1-atividade-fullstack.git)
cd 2026-3-1-atividade-fullstack
```

#### 2. Configurar e rodar o Backend
cd api
npm install
npx prisma generate
npx prisma db push # ou npx prisma migrate dev
npm run start:dev

#### 3. Configurar e rodar o Frontend
cd web 
npm install
npm run dev

Vídeo do projeto em execução

---
