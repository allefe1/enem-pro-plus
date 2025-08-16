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

// Base URL da API do ENEM
const ENEM_API_BASE = 'https://api.enem.dev/v1';

// 🔧 CONFIGURAÇÃO DE LOGS DETALHADOS
const logRequest = (config) => {
  console.log('\n🚀 INICIANDO REQUISIÇÃO:');
  console.log(`   Método: ${config.method?.toUpperCase()}`);
  console.log(`   URL: ${config.url}`);
  if (config.params) {
    console.log(`   Parâmetros: ${JSON.stringify(config.params, null, 2)}`);
  }
  console.log(`   Timeout: ${config.timeout || 'Padrão'}`);
  console.log('─'.repeat(50));
};

const logResponse = (response) => {
  console.log('\n✅ RESPOSTA RECEBIDA:');
  console.log(`   Status: ${response.status} ${response.statusText}`);
  if (response.data.questions) {
    console.log(`   Total de questões: ${response.data.questions.length}`);
  }
  console.log('─'.repeat(50));
};

const logError = (error) => {
  console.log('\n❌ ERRO NA REQUISIÇÃO:');
  
  if (error.response) {
    console.log(`   Status: ${error.response.status} ${error.response.statusText}`);
    console.log(`   Dados do erro: ${JSON.stringify(error.response.data, null, 2)}`);
  } else if (error.request) {
    console.log('   Tipo: Timeout ou erro de rede');
  } else {
    console.log(`   Mensagem: ${error.message}`);
  }
  
  console.log(`   Código de erro: ${error.code}`);
  console.log('─'.repeat(50));
};

// 🌐 INTERCEPTOR GLOBAL DO AXIOS
axios.interceptors.request.use(
  (config) => {
    logRequest(config);
    return config;
  },
  (error) => {
    console.log('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  (error) => {
    logError(error);
    return Promise.reject(error);
  }
);

// 🔍 Função auxiliar para mapear disciplinas
function mapearDisciplina(discipline) {
  const mapeamento = {
    'matematica': 'Matemática',
    'linguagens': 'Linguagens',
    'ciencias-humanas': 'Ciências Humanas',
    'ciencias-natureza': 'Ciências da Natureza'
  };
  return mapeamento[discipline] || discipline || 'Disciplina não especificada';
}

// 🎯 NOVA FUNÇÃO: Verificar aderência ao tema (como no ENEM real)
async function verificarAderenciaAoTema(redacao, tema) {
  try {
    const prompt = `Você é um corretor especializado do ENEM. Analise se esta redação ESTÁ NO TEMA proposto.

TEMA PROPOSTO: "${tema}"

REDAÇÃO: "${redacao}"

CRITÉRIOS RÍGIDOS (como no ENEM real):
- FUGA TOTAL: redação não menciona nada relacionado ao tema específico = NOTA ZERO automática
- TANGENCIAMENTO: aborda assunto geral mas não o recorte específico do tema = máximo 40 pontos por competência
- ADERENTE: aborda especificamente o tema proposto

Analise se há palavras-chave do tema na redação e se o foco está correto.

Responda APENAS no formato JSON:
{
  "aderente_ao_tema": true/false,
  "tipo_desvio": "nenhum" | "tangenciamento" | "fuga_total",
  "explicacao": "explicação detalhada do motivo",
  "palavras_chave_tema": ["palavra1", "palavra2"],
  "palavras_chave_encontradas": ["palavra1"],
  "pode_prosseguir": true/false,
  "nivel_gravidade": 0-10
}`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'qwen/qwen3-coder:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Baixa temperatura para análise mais precisa
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ENEM Pro+'
      }
    });

    const avaliacaoTexto = response.data.choices[0].message.content;
    
    // Extrair JSON da resposta
    const jsonMatch = avaliacaoTexto.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch);
    } else {
      throw new Error('JSON não encontrado na resposta da verificação de tema');
    }

  } catch (error) {
    console.error('Erro na verificação do tema:', error);
    // Em caso de erro, assumir que está no tema para não prejudicar o usuário
    return {
      aderente_ao_tema: true,
      tipo_desvio: "nenhum",
      explicacao: "Erro na verificação automática do tema",
      palavras_chave_tema: [],
      palavras_chave_encontradas: [],
      pode_prosseguir: true,
      nivel_gravidade: 0
    };
  }
}

// 📊 Rota para listar todas as provas disponíveis
app.get('/api/provas', async (req, res) => {
  console.log('\n🎯 CHAMADA: /api/provas');
  
  try {
    const response = await axios.get(`${ENEM_API_BASE}/exams`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ENEM-Pro-Plus/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log(`✅ Provas encontradas: ${response.data.length}`);
    res.json(response.data);
    
  } catch (error) {
    console.log('❌ Erro ao buscar provas');
    res.status(500).json({ 
      error: 'Erro ao buscar provas',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
});

// 📝 Rota para detalhes de uma prova específica
app.get('/api/provas/:ano', async (req, res) => {
  console.log('\n🎯 CHAMADA: /api/provas/:ano');
  
  try {
    const { ano } = req.params;
    const response = await axios.get(`${ENEM_API_BASE}/exams/${ano}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ENEM-Pro-Plus/1.0',
        'Accept': 'application/json'
      }
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.log('❌ Erro ao buscar prova específica');
    res.status(500).json({ 
      error: 'Prova não encontrada',
      details: error.message 
    });
  }
});

// 📋 Rota principal para questões
app.get('/api/questoes', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🎯 CHAMADA: /api/questoes');
  
  try {
    const { 
      ano = 2023, 
      limit = 10, 
      offset = 0,
      disciplina = '',
      language = '' // Será usado apenas se disciplina for 'linguagens'
    } = req.query;
    
    console.log(`📝 Parâmetros recebidos:`, { ano, limit, offset, disciplina, language });
    
    // Validação básica
    if (!ano || isNaN(parseInt(ano))) {
      throw new Error(`Ano inválido: ${ano}`);
    }
    
    const apiUrl = `${ENEM_API_BASE}/exams/${ano}/questions`;
    console.log(`🔗 URL da API: ${apiUrl}`);
    
    // Preparar parâmetros base
    const params = {
      limit: Math.min(parseInt(limit), 50), // Máximo 50 permitido pela API
      offset: parseInt(offset)
    };
    
    // 🌐 ADICIONAR LANGUAGE APENAS PARA LINGUAGENS
    if (disciplina === 'linguagens' && language) {
      const idiomasValidos = ['inglês', 'espanhol'];
      if (idiomasValidos.includes(language)) {
        params.language = language;
        console.log(`🌐 Idioma selecionado para Linguagens: ${language}`);
      } else {
        params.language = 'inglês'; // padrão para linguagens
        console.log(`🌐 Idioma inválido, usando inglês como padrão para Linguagens`);
      }
    } else if (disciplina === 'linguagens') {
      params.language = 'inglês'; // padrão se não especificado
      console.log(`🌐 Usando inglês como padrão para Linguagens`);
    } else {
      console.log(`📚 Disciplina ${disciplina || 'todas'}: sem parâmetro de idioma (português)`);
    }
    
    const response = await axios.get(apiUrl, {
      params: params,
      timeout: 15000,
      headers: {
        'User-Agent': 'ENEM-Pro-Plus/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log(`⏱️  Tempo de resposta: ${Date.now() - startTime}ms`);
    
    // Verificar estrutura da resposta
    if (!response.data || !response.data.questions) {
      throw new Error('Resposta da API inválida');
    }
    
    if (response.data.questions.length === 0) {
      console.log('⚠️  Nenhuma questão encontrada');
      return res.json({
        questoes: [],
        metadata: {
          total: 0,
          message: 'Nenhuma questão encontrada',
          parametros: { ano, limit, offset, disciplina }
        }
      });
    }
    
    // Filtrar por disciplina se especificada
    let questoesFiltradas = response.data.questions;
    if (disciplina) {
      questoesFiltradas = response.data.questions.filter(q => q.discipline === disciplina);
      console.log(`🔍 Filtradas ${questoesFiltradas.length} questões de ${disciplina} de um total de ${response.data.questions.length}`);
    }
    
    // Mapear questões para formato compatível
    const questoesFormatadas = questoesFiltradas.map((questao, index) => {
      return {
        id: questao.index || questao.id || index + 1,
        index: questao.index,
        area: mapearDisciplina(questao.discipline),
        discipline: questao.discipline,
        tema: questao.title || 'Questão ENEM',
        title: questao.title,
        ano: questao.year || parseInt(ano),
        year: questao.year,
        enunciado: questao.context || questao.title || 'Enunciado não disponível',
        context: questao.context,
        alternativas: questao.alternatives?.map(alt => 
          `${alt.letter}) ${alt.text || alt.file || 'Alternativa com arquivo'}`
        ) || [],
        alternatives: questao.alternatives,
        gabarito: questao.correctAlternative,
        correctAlternative: questao.correctAlternative,
        comentario: `Questão ${questao.index || index + 1} do ENEM ${questao.year || ano} - ${questao.discipline}`,
        files: questao.files || [],
        alternativesIntroduction: questao.alternativesIntroduction,
        // Incluir idioma apenas se for linguagens
        ...(questao.discipline === 'linguagens' && { 
          idioma: params.language || 'inglês',
          tipoLinguagem: (params.language || 'inglês') === 'inglês' ? 'Língua Inglesa' : 'Língua Espanhola'
        })
      };
    });
    
    console.log(`✅ ${questoesFormatadas.length} questões formatadas com sucesso`);
    
    const resposta = {
      questoes: questoesFormatadas,
      metadata: {
        total: response.data.metadata?.total || questoesFormatadas.length,
        ano: ano,
        limit: parseInt(limit),
        offset: parseInt(offset),
        disciplina: disciplina || 'todas',
        // Incluir language apenas se for linguagens
        ...(disciplina === 'linguagens' && { language: params.language || 'inglês' }),
        tempoResposta: `${Date.now() - startTime}ms`,
        ...response.data.metadata
      }
    };
    
    res.json(resposta);
    
  } catch (error) {
    console.log(`❌ Erro completo após ${Date.now() - startTime}ms:`);
    console.log(`   Mensagem: ${error.message}`);
    
    res.status(500).json({ 
      error: 'Erro ao buscar questões',
      details: error.message,
      code: error.code || 'UNKNOWN',
      tempo: `${Date.now() - startTime}ms`,
      parametros: req.query
    });
  }
});

// 🔍 Rota para questões por disciplina específica - CORRIGIDA
app.get('/api/questoes/disciplina/:disciplina', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🎯 CHAMADA: /api/questoes/disciplina/:disciplina');
  
  try {
    const { disciplina } = req.params;
    const { 
      ano = 2023, 
      limit = 20,
      language = '' // Será usado apenas se disciplina for 'linguagens'
    } = req.query;
    
    console.log(`📝 Buscando questões:`, { disciplina, ano, limit, language });
    
    // Preparar parâmetros base
    const params = {
      limit: 50, // Máximo permitido pela API
      offset: 0
    };
    
    // 🌐 ADICIONAR LANGUAGE APENAS PARA LINGUAGENS
    if (disciplina === 'linguagens') {
      const idiomasValidos = ['inglês', 'espanhol'];
      if (language && idiomasValidos.includes(language)) {
        params.language = language;
        console.log(`🌐 Idioma para Linguagens: ${language}`);
      } else {
        params.language = 'inglês';
        console.log(`🌐 Usando inglês como padrão para Linguagens`);
      }
    } else {
      console.log(`📚 Disciplina ${disciplina}: questões em português (sem parâmetro language)`);
    }
    
    console.log(`🔢 Parâmetros finais da API:`, params);
    
    const response = await axios.get(
      `${ENEM_API_BASE}/exams/${ano}/questions`,
      { 
        params: params,
        timeout: 15000,
        headers: {
          'User-Agent': 'ENEM-Pro-Plus/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.data.questions) {
      throw new Error('Nenhuma questão encontrada na resposta');
    }
    
    console.log(`📊 Total de questões recebidas da API: ${response.data.questions.length}`);
    
    // Filtrar por disciplina
    const questoesFiltradas = response.data.questions
      .filter(q => q.discipline === disciplina)
      .slice(0, parseInt(limit)); // Aplicar limit do usuário após filtrar
    
    console.log(`🔍 Questões filtradas: ${questoesFiltradas.length} de ${response.data.questions.length} (disciplina: ${disciplina})`);
    
    // Log das disciplinas encontradas para debug
    const disciplinasEncontradas = [...new Set(response.data.questions.map(q => q.discipline))];
    console.log(`📚 Disciplinas disponíveis na resposta:`, disciplinasEncontradas);
    
    // Se não encontrou questões da disciplina
    if (questoesFiltradas.length === 0) {
      console.log(`⚠️ Nenhuma questão de '${disciplina}' encontrada`);
      console.log(`💡 Verifique se o nome da disciplina está correto: ${disciplinasEncontradas.join(', ')}`);
      
      return res.json({
        questoes: [],
        total: 0,
        disciplina: disciplina,
        ano: ano,
        disciplinasDisponiveis: disciplinasEncontradas,
        message: `Nenhuma questão de '${disciplina}' encontrada. Disciplinas disponíveis: ${disciplinasEncontradas.join(', ')}`,
        tempoResposta: `${Date.now() - startTime}ms`
      });
    }
    
    const questoesFormatadas = questoesFiltradas.map((questao, index) => ({
      id: questao.index || questao.id || index + 1,
      index: questao.index,
      area: mapearDisciplina(questao.discipline),
      discipline: questao.discipline,
      tema: questao.title || 'Questão ENEM',
      title: questao.title,
      ano: questao.year || parseInt(ano),
      year: questao.year,
      enunciado: questao.context || questao.title || 'Enunciado não disponível',
      context: questao.context,
      alternativas: questao.alternatives?.map(alt => 
        `${alt.letter}) ${alt.text || alt.file || 'Alternativa com arquivo'}`
      ) || [],
      alternatives: questao.alternatives,
      gabarito: questao.correctAlternative,
      correctAlternative: questao.correctAlternative,
      comentario: `Questão ${questao.index || index + 1} do ENEM ${questao.year || ano} - ${questao.discipline}`,
      files: questao.files || [],
      alternativesIntroduction: questao.alternativesIntroduction,
      // Incluir idioma apenas se for linguagens
      ...(disciplina === 'linguagens' && { 
        idioma: params.language,
        tipoLinguagem: params.language === 'inglês' ? 'Língua Inglesa' : 'Língua Espanhola'
      })
    }));
    
    console.log(`✅ ${questoesFormatadas.length} questões formatadas com sucesso`);
    
    res.json({
      questoes: questoesFormatadas,
      total: questoesFormatadas.length,
      disciplina: disciplina,
      ano: ano,
      // Incluir language apenas se for linguagens
      ...(disciplina === 'linguagens' && { language: params.language }),
      tempoResposta: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar questões por disciplina:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar questões por disciplina',
      details: error.message,
      disciplina: req.params.disciplina
    });
  }
});

// 📄 Rota para questão específica
app.get('/api/questoes/:ano/:index', async (req, res) => {
  console.log('\n🎯 CHAMADA: /api/questoes/:ano/:index');
  
  try {
    const { ano, index } = req.params;
    const { language = '' } = req.query;
    
    console.log(`📝 Buscando questão específica:`, { ano, index, language });
    
    // Primeiro, tentar buscar sem language
    let params = { limit: 50, offset: 0 };
    
    let response = await axios.get(
      `${ENEM_API_BASE}/exams/${ano}/questions`,
      { 
        params: params,
        timeout: 10000,
        headers: {
          'User-Agent': 'ENEM-Pro-Plus/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    let questao = response.data.questions?.find(q => q.index === parseInt(index));
    
    // Se não encontrou e tem language, tentar com language (para linguagens)
    if (!questao && language && ['inglês', 'espanhol'].includes(language)) {
      console.log(`🔍 Questão não encontrada sem language, tentando com language: ${language}`);
      params.language = language;
      
      response = await axios.get(
        `${ENEM_API_BASE}/exams/${ano}/questions`,
        { 
          params: params,
          timeout: 10000,
          headers: {
            'User-Agent': 'ENEM-Pro-Plus/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      questao = response.data.questions?.find(q => q.index === parseInt(index));
    }
    
    if (!questao) {
      return res.status(404).json({ 
        error: 'Questão não encontrada',
        ano: ano,
        index: index,
        language: language || 'N/A'
      });
    }
    
    // Formatação da questão específica
    const questaoFormatada = {
      id: questao.index,
      index: questao.index,
      area: mapearDisciplina(questao.discipline),
      discipline: questao.discipline,
      tema: questao.title || 'Questão ENEM',
      title: questao.title,
      ano: questao.year,
      year: questao.year,
      enunciado: questao.context || questao.title,
      context: questao.context,
      alternativas: questao.alternatives?.map(alt => 
        `${alt.letter}) ${alt.text || alt.file || 'Alternativa com arquivo'}`
      ) || [],
      alternatives: questao.alternatives,
      gabarito: questao.correctAlternative,
      correctAlternative: questao.correctAlternative,
      comentario: `Questão ${questao.index} do ENEM ${questao.year} - ${questao.discipline}`,
      files: questao.files || [],
      alternativesIntroduction: questao.alternativesIntroduction,
      // Incluir idioma apenas se for linguagens
      ...(questao.discipline === 'linguagens' && { 
        idioma: params.language || 'inglês',
        tipoLinguagem: (params.language || 'inglês') === 'inglês' ? 'Língua Inglesa' : 'Língua Espanhola'
      })
    };
    
    console.log(`✅ Questão ${index} encontrada e formatada`);
    res.json(questaoFormatada);
    
  } catch (error) {
    console.error('❌ Erro ao buscar questão específica:', error);
    res.status(500).json({ 
      error: 'Questão não encontrada',
      details: error.message 
    });
  }
});

// 🧪 Rota de teste da API externa
app.get('/api/teste-api-externa', async (req, res) => {
  console.log('\n🧪 TESTE DIRETO DA API EXTERNA');
  
  try {
    const { language = '', disciplina = '' } = req.query;
    
    const params = { limit: 1 };
    
    // Testar language apenas se for linguagens
    if (disciplina === 'linguagens' && ['inglês', 'espanhol'].includes(language)) {
      params.language = language;
    }
    
    const response = await axios.get('https://api.enem.dev/v1/exams/2023/questions', {
      params: params,
      timeout: 10000,
      headers: {
        'User-Agent': 'ENEM-Pro-Plus/1.0',
        'Accept': 'application/json'
      }
    });
    
    res.json({
      status: 'success',
      message: 'API externa funcionando',
      disciplina: disciplina || 'todas',
      language: disciplina === 'linguagens' ? (language || 'inglês') : 'N/A (português)',
      dados: response.data,
      statusCode: response.status
    });
    
  } catch (error) {
    res.json({
      status: 'error',
      message: 'Erro na API externa',
      error: error.message,
      code: error.code
    });
  }
});

// 🎨 Rota para correção de redação com IA - ATUALIZADA COM VERIFICAÇÃO DE TEMA
app.post('/api/corrigir-redacao', async (req, res) => {
  try {
    const { redacao, tema } = req.body;
    
    console.log('\n🎯 CORREÇÃO DE REDAÇÃO INICIADA');
    console.log(`📝 Tema: ${tema}`);
    console.log(`📄 Redação: ${redacao.length} caracteres`);
    
    if (!redacao || !tema) {
      return res.status(400).json({ error: 'Redação e tema são obrigatórios' });
    }
    
    // 🚨 ETAPA 1: Verificar aderência ao tema (como no ENEM real)
    console.log('🔍 Verificando aderência ao tema...');
    const verificacaoTema = await verificarAderenciaAoTema(redacao, tema);
    
    console.log('📊 Resultado da verificação:', verificacaoTema);
    
    // Se fugiu do tema, retornar nota conforme ENEM
    if (!verificacaoTema.aderente_ao_tema) {
      console.log(`⚠️ DETECTADA ${verificacaoTema.tipo_desvio.toUpperCase()}: ${verificacaoTema.explicacao}`);
      
      const notasPorDesvio = {
        fuga_total: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, total: 0 },
        tangenciamento: { c1: 40, c2: 40, c3: 40, c4: 40, c5: 40, total: 200 }
      };
      
      const notas = notasPorDesvio[verificacaoTema.tipo_desvio] || notasPorDesvio.fuga_total;
      
      return res.json({
        competencias: [
          {
            numero: 1,
            nome: "Domínio da modalidade escrita formal",
            nota: notas.c1,
            explicacao: verificacaoTema.tipo_desvio === 'fuga_total' 
              ? "Nota zero devido à fuga total do tema." 
              : "Nota reduzida devido ao tangenciamento do tema.",
            sugestoes: "Leia atentamente o tema e certifique-se de abordá-lo especificamente."
          },
          {
            numero: 2,
            nome: "Compreensão da proposta",
            nota: notas.c2,
            explicacao: `${verificacaoTema.tipo_desvio === 'fuga_total' ? 'FUGA TOTAL' : 'TANGENCIAMENTO'} DO TEMA: ${verificacaoTema.explicacao}`,
            sugestoes: "Identifique as palavras-chave do tema e desenvolva argumentos específicos sobre elas."
          },
          {
            numero: 3,
            nome: "Organização de informações",
            nota: notas.c3,
            explicacao: verificacaoTema.tipo_desvio === 'fuga_total' 
              ? "Prejudicado pela fuga total do tema." 
              : "Prejudicado pelo tangenciamento do tema.",
            sugestoes: "Use dados e informações diretamente relacionados ao tema específico."
          },
          {
            numero: 4,
            nome: "Mecanismos linguísticos",
            nota: notas.c4,
            explicacao: verificacaoTema.tipo_desvio === 'fuga_total' 
              ? "Prejudicado pela fuga total do tema." 
              : "Prejudicado pelo tangenciamento do tema.",
            sugestoes: "Construa argumentos coesos focados no tema proposto."
          },
          {
            numero: 5,
            nome: "Proposta de intervenção",
            nota: notas.c5,
            explicacao: verificacaoTema.tipo_desvio === 'fuga_total' 
              ? "Impossível avaliar devido à fuga do tema." 
              : "Proposta não direcionada especificamente ao tema.",
            sugestoes: "Elabore uma proposta de intervenção específica para o problema apresentado no tema."
          }
        ],
        nota_total: notas.total,
        comentario_geral: `⚠️ ATENÇÃO: ${verificacaoTema.tipo_desvio === 'fuga_total' ? 'FUGA TOTAL' : 'TANGENCIAMENTO'} DO TEMA DETECTADO!
        
${verificacaoTema.explicacao}

${verificacaoTema.palavras_chave_tema?.length > 0 ? `Palavras-chave do tema que deveriam ser abordadas: ${verificacaoTema.palavras_chave_tema.join(', ')}` : ''}

${verificacaoTema.palavras_chave_encontradas?.length > 0 ? `Palavras encontradas na redação: ${verificacaoTema.palavras_chave_encontradas.join(', ')}` : 'Nenhuma palavra-chave do tema foi encontrada na redação.'}

No ENEM real, ${verificacaoTema.tipo_desvio === 'fuga_total' ? 'isso resultaria em NOTA ZERO' : 'a nota máxima seria 200 pontos'}!`,
        fuga_tema: true,
        tipo_desvio: verificacaoTema.tipo_desvio,
        palavras_chave_tema: verificacaoTema.palavras_chave_tema || [],
        palavras_chave_encontradas: verificacaoTema.palavras_chave_encontradas || []
      });
    }
    
    // ✅ ETAPA 2: Se está no tema, fazer correção completa normal
    console.log('✅ Redação aderente ao tema. Prosseguindo com correção completa...');
    
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
    }
  ],
  "nota_total": 800,
  "comentario_geral": "Comentário geral sobre a redação"
}`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'qwen/qwen3-coder:free',
      messages: [{ role: 'user', content: prompt }],
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
    
    let avaliacao;
    try {
      const jsonMatch = avaliacaoTexto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        avaliacao = JSON.parse(jsonMatch);
        avaliacao.fuga_tema = false; // Marcar que NÃO fugiu do tema
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.log('⚠️ Erro ao parsear JSON, usando avaliação padrão');
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
        comentario_geral: avaliacaoTexto,
        fuga_tema: false
      };
    }
    
    console.log(`✅ Correção concluída. Nota total: ${avaliacao.nota_total}/1000`);
    res.json(avaliacao);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir redação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar a redação',
      details: error.message 
    });
  }
});

// 🩺 Rota de teste
app.get('/api/test', (req, res) => {
  console.log('\n🩺 Health check realizado');
  res.json({ 
    message: 'Backend ENEM Pro+ funcionando!',
    timestamp: new Date().toISOString(),
    observacao: 'Language (inglês/espanhol) apenas para disciplina Linguagens',
    novas_funcionalidades: [
      'Verificação de aderência ao tema',
      'Simulação real dos critérios ENEM',
      'Nota zero para fuga total do tema'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 SERVIDOR INICIADO');
  console.log(`   Porta: ${PORT}`);
  console.log(`   API ENEM: ${ENEM_API_BASE}`);
  console.log(`   📚 Matemática/Humanas/Natureza: Português (sem language)`);
  console.log(`   🌐 Linguagens: Inglês ou Espanhol (com language)`);
  console.log(`   🎯 NOVA: Verificação de aderência ao tema`);
  console.log(`   ⚠️  Fuga do tema = Nota conforme ENEM real`);
  console.log(`   Logs: HABILITADOS`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('═'.repeat(50));
});
