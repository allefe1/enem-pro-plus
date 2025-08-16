# ENEM Pro+

Uma aplicação web completa para estudantes do ENEM, desenvolvida com React e Node.js.

## 🚀 Funcionalidades

### 📚 Questões que Mais Caem no ENEM
- Questões organizadas por área de conhecimento (Matemática, Linguagens, Humanas, Natureza)
- Filtros por tema, ano, dificuldade e frequência
- Visualização detalhada com enunciado, alternativas, gabarito e comentário explicativo
- Interface intuitiva e responsiva

### 🤖 Corretor de Redação com IA
- Correção automática baseada nas 5 competências do ENEM
- Avaliação de 0 a 200 pontos para cada competência
- Feedback detalhado e sugestões de melhoria
- Integração com API de IA gratuita (OpenRouter)

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- React Router DOM
- Axios
- CSS3 com design moderno e responsivo

### Backend
- Node.js
- Express.js
- CORS
- Axios (para integração com IA)
- dotenv

### IA
- OpenRouter API (modelo gratuito Qwen3 Coder)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
Crie um arquivo `.env` na pasta `backend` com:
```
PORT=5000
OPENROUTER_API_KEY=sua_chave_api_aqui
```

## 🌐 Estrutura do Projeto

```
enem-pro-plus/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependências do backend
│   └── .env              # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── App.js        # Componente principal
│   │   └── App.css       # Estilos globais
│   └── package.json      # Dependências do frontend
└── README.md
```

## 🎯 Funcionalidades Implementadas

### ✅ Questões
- [x] Listagem de questões com filtros
- [x] Visualização detalhada de questões
- [x] Sistema de gabarito e comentários
- [x] Interface responsiva

### ✅ Corretor de Redação
- [x] Formulário para envio de redação
- [x] Integração com IA para correção
- [x] Avaliação por competências do ENEM
- [x] Feedback detalhado e sugestões

### ✅ Interface
- [x] Design moderno e atrativo
- [x] Navegação intuitiva
- [x] Responsividade para mobile
- [x] Sem necessidade de login/cadastro

## 🚀 Como Usar

1. **Página Inicial**: Visão geral das funcionalidades
2. **Questões**: Navegue pelas questões usando os filtros disponíveis
3. **Corretor**: Selecione um tema e digite sua redação para correção automática

## 🔮 Próximas Funcionalidades

- [ ] Mais questões e temas de redação
- [ ] Sistema de estatísticas de desempenho
- [ ] Simulados completos
- [ ] Cronômetro para questões
- [ ] Histórico de redações corrigidas

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do GitHub.

---

Desenvolvido com ❤️ para estudantes do ENEM

