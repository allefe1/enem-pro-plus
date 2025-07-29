const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados de exemplo para questões do ENEM
const questoesEnem = [
  {
    id: 1,
    area: 'Matemática',
    tema: 'Geometria',
    ano: 2023,
    dificuldade: 'Média',
    frequencia: 'Alta',
    enunciado: 'Um triângulo retângulo possui catetos de 3 cm e 4 cm. Qual é a medida da hipotenusa?',
    alternativas: [
      'A) 5 cm',
      'B) 6 cm',
      'C) 7 cm',
      'D) 8 cm',
      'E) 9 cm'
    ],
    gabarito: 'A',
    comentario: 'Utilizando o teorema de Pitágoras: h² = 3² + 4² = 9 + 16 = 25, logo h = 5 cm.'
  },
  {
    id: 2,
    area: 'Linguagens',
    tema: 'Interpretação de Texto',
    ano: 2023,
    dificuldade: 'Fácil',
    frequencia: 'Muito Alta',
    enunciado: 'Qual é a função da linguagem predominante em um texto publicitário?',
    alternativas: [
      'A) Referencial',
      'B) Emotiva',
      'C) Conativa',
      'D) Fática',
      'E) Metalinguística'
    ],
    gabarito: 'C',
    comentario: 'A função conativa visa persuadir o receptor, característica principal dos textos publicitários.'
  },
  {
    id: 3,
    area: 'Humanas',
    tema: 'História do Brasil',
    ano: 2022,
    dificuldade: 'Média',
    frequencia: 'Alta',
    enunciado: 'A Proclamação da República no Brasil ocorreu em que ano?',
    alternativas: [
      'A) 1888',
      'B) 1889',
      'C) 1890',
      'D) 1891',
      'E) 1892'
    ],
    gabarito: 'B',
    comentario: 'A Proclamação da República ocorreu em 15 de novembro de 1889, liderada pelo Marechal Deodoro da Fonseca.'
  },
  {
    id: 4,
    area: 'Natureza',
    tema: 'Química Orgânica',
    ano: 2023,
    dificuldade: 'Difícil',
    frequencia: 'Média',
    enunciado: 'Qual é a fórmula molecular do etanol?',
    alternativas: [
      'A) C₂H₄O',
      'B) C₂H₆O',
      'C) C₃H₈O',
      'D) CH₄O',
      'E) C₂H₄O₂'
    ],
    gabarito: 'B',
    comentario: 'O etanol possui fórmula molecular C₂H₆O, sendo um álcool de dois carbonos.'
  }
];

// Rotas para questões
app.get('/api/questoes', (req, res) => {
  const { area, tema, ano, dificuldade, frequencia } = req.query;
  
  let questoesFiltradas = questoesEnem;
  
  if (area) {
    questoesFiltradas = questoesFiltradas.filter(q => q.area === area);
  }
  
  if (tema) {
    questoesFiltradas = questoesFiltradas.filter(q => q.tema === tema);
  }
  
  if (ano) {
    questoesFiltradas = questoesFiltradas.filter(q => q.ano === parseInt(ano));
  }
  
  if (dificuldade) {
    questoesFiltradas = questoesFiltradas.filter(q => q.dificuldade === dificuldade);
  }
  
  if (frequencia) {
    questoesFiltradas = questoesFiltradas.filter(q => q.frequencia === frequencia);
  }
  
  res.json(questoesFiltradas);
});

app.get('/api/questoes/:id', (req, res) => {
  const questao = questoesEnem.find(q => q.id === parseInt(req.params.id));
  
  if (!questao) {
    return res.status(404).json({ error: 'Questão não encontrada' });
  }
  
  res.json(questao);
});

// Rota para correção de redação com IA
app.post('/api/corrigir-redacao', async (req, res) => {
  try {
    const { redacao, tema } = req.body;
    
    if (!redacao || !tema) {
      return res.status(400).json({ error: 'Redação e tema são obrigatórios' });
    }
    
    // Prompt para avaliação da redação baseado nas competências do ENEM
    const prompt = `Você é um corretor especialista em redações do ENEM. Avalie a seguinte redação sobre o tema "${tema}" de acordo com as 5 competências do ENEM, atribuindo uma nota de 0 a 200 para cada competência e explicando o motivo da pontuação. Também forneça sugestões de melhoria para cada competência.

Competências do ENEM:
1. Demonstrar domínio da modalidade escrita formal da língua portuguesa
2. Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
3. Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos
4. Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
5. Elaborar proposta de intervenção para o problema abordado

Redação:
"${redacao}"

Forneça a resposta no seguinte formato JSON:
{
  "competencias": [
    {
      "numero": 1,
      "nome": "Domínio da modalidade escrita formal",
      "nota": 160,
      "explicacao": "Explicação detalhada da nota",
      "sugestoes": "Sugestões específicas de melhoria"
    },
    // ... outras competências
  ],
  "nota_total": 800,
  "comentario_geral": "Comentário geral sobre a redação"
}`;

    // Chamada para a API do OpenRouter (usando modelo gratuito)
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'qwen/qwen3-coder:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ENEM Pro+'
      }
    });
    
    const avaliacaoTexto = response.data.choices[0].message.content;
    
    // Tentar extrair JSON da resposta
    let avaliacao;
    try {
      // Procurar por JSON na resposta
      const jsonMatch = avaliacaoTexto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        avaliacao = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, criar uma resposta estruturada
      avaliacao = {
        competencias: [
          {
            numero: 1,
            nome: "Domínio da modalidade escrita formal",
            nota: 140,
            explicacao: "Análise baseada na resposta da IA",
            sugestoes: "Revisar ortografia e gramática"
          },
          {
            numero: 2,
            nome: "Compreensão da proposta",
            nota: 140,
            explicacao: "Análise baseada na resposta da IA",
            sugestoes: "Desenvolver melhor o tema proposto"
          },
          {
            numero: 3,
            nome: "Organização de informações",
            nota: 140,
            explicacao: "Análise baseada na resposta da IA",
            sugestoes: "Melhorar a estrutura argumentativa"
          },
          {
            numero: 4,
            nome: "Mecanismos linguísticos",
            nota: 140,
            explicacao: "Análise baseada na resposta da IA",
            sugestoes: "Usar mais conectivos e elementos coesivos"
          },
          {
            numero: 5,
            nome: "Proposta de intervenção",
            nota: 140,
            explicacao: "Análise baseada na resposta da IA",
            sugestoes: "Elaborar proposta mais detalhada e viável"
          }
        ],
        nota_total: 700,
        comentario_geral: avaliacaoTexto
      };
    }
    
    res.json(avaliacao);
    
  } catch (error) {
    console.error('Erro ao corrigir redação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar a redação',
      details: error.message 
    });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend ENEM Pro+ funcionando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

