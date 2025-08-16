import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Questoes = () => {
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [filtros, setFiltros] = useState({
    ano: '2023',
    limit: '10',
    offset: '0',
    disciplina: ''
  });
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [mostrarGabarito, setMostrarGabarito] = useState(false);
  const [provasDisponiveis, setProvasDisponiveis] = useState([]);

  // Mapeamento de disciplinas da API
  const disciplinas = [
    { value: '', label: 'Todas as disciplinas' },
    { value: 'matematica', label: 'Matemática' },
    { value: 'linguagens', label: 'Linguagens' },
    { value: 'ciencias-humanas', label: 'Ciências Humanas' },
    { value: 'ciencias-natureza', label: 'Ciências da Natureza' }
  ];

  const anosDisponiveis = useMemo(() => {
  if (provasDisponiveis.length > 0) {
    return provasDisponiveis
      .map(prova => prova.year || prova.ano)
      .sort((a, b) => b - a); // Ordem decrescente (mais recente primeiro)
  }
  // Fallback caso não tenha carregado ainda
  return ['2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
}, [provasDisponiveis]); 
  const limitesOpcoes = ['5', '10', '15', '20', '25', '30'];

  useEffect(() => {
    buscarProvasDisponiveis();
    buscarQuestoes();
  }, []);

  const buscarProvasDisponiveis = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/provas');
      setProvasDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao buscar provas:', error);
    }
  };

  const buscarQuestoes = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/questoes?ano=${filtros.ano}&limit=${filtros.limit}&offset=${filtros.offset}`;
      
      // Se há disciplina específica, usar endpoint especializado
      if (filtros.disciplina) {
        url = `http://localhost:5000/api/questoes/disciplina/${filtros.disciplina}?ano=${filtros.ano}&limit=${filtros.limit}`;
      }

      const response = await axios.get(url);
      
      // Adaptar resposta dependendo do endpoint usado
      if (response.data.questoes) {
        setQuestoes(response.data.questoes);
        setMetadata(response.data.metadata || null);
      } else {
        // Resposta direta da API original
        setQuestoes(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      offset: campo !== 'offset' ? '0' : valor // Reset offset quando outros filtros mudam
    }));
  };

  const aplicarFiltros = () => {
    buscarQuestoes();
  };

  const limparFiltros = () => {
    setFiltros({
      ano: '2023',
      limit: '10',
      offset: '0',
      disciplina: ''
    });
    setTimeout(() => {
      buscarQuestoes();
    }, 100);
  };

  const proximaPagina = () => {
    const novoOffset = parseInt(filtros.offset) + parseInt(filtros.limit);
    handleFiltroChange('offset', novoOffset.toString());
    setTimeout(() => {
      buscarQuestoes();
    }, 100);
  };

  const paginaAnterior = () => {
    const novoOffset = Math.max(0, parseInt(filtros.offset) - parseInt(filtros.limit));
    handleFiltroChange('offset', novoOffset.toString());
    setTimeout(() => {
      buscarQuestoes();
    }, 100);
  };

  const selecionarQuestao = (questao) => {
    setQuestaoSelecionada(questao);
    setMostrarGabarito(false);
  };

  const voltarParaLista = () => {
    setQuestaoSelecionada(null);
    setMostrarGabarito(false);
  };

  // Função para renderizar conteúdo com markdown básico
  const renderizarConteudo = (conteudo) => {
    if (!conteudo) return '';
    
    // Converter markdown básico para HTML (simplificado)
    return conteudo
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (questaoSelecionada) {
    return (
      <div className="container">
        <button onClick={voltarParaLista} className="btn btn-secondary mb-3">
          ← Voltar para a lista
        </button>
        
        <div className="card">
          <div className="mb-3">
            <span className="badge" style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '20px',
              marginRight: '1rem'
            }}>
              {questaoSelecionada.area || questaoSelecionada.discipline}
            </span>
            <span className="text-secondary">
              {questaoSelecionada.tema || questaoSelecionada.title} • {questaoSelecionada.ano || questaoSelecionada.year}
            </span>
          </div>
          
          <h3 className="mb-3">Questão {questaoSelecionada.id || questaoSelecionada.index}</h3>
          
          {/* Contexto da questão */}
          {(questaoSelecionada.context || questaoSelecionada.enunciado) && (
            <div className="mb-4">
              <div 
                style={{ lineHeight: '1.6', fontSize: '1.1rem' }}
                dangerouslySetInnerHTML={{ 
                  __html: renderizarConteudo(questaoSelecionada.context || questaoSelecionada.enunciado) 
                }}
              />
            </div>
          )}

          {/* Título da questão se diferente do contexto */}
          {questaoSelecionada.title && questaoSelecionada.title !== questaoSelecionada.context && (
            <div className="mb-4">
              <h4>Pergunta:</h4>
              <div 
                style={{ lineHeight: '1.6', fontSize: '1.1rem' }}
                dangerouslySetInnerHTML={{ 
                  __html: renderizarConteudo(questaoSelecionada.title) 
                }}
              />
            </div>
          )}

          {/* Introdução das alternativas */}
          {questaoSelecionada.alternativesIntroduction && (
            <div className="mb-3">
              <div 
                style={{ lineHeight: '1.6', fontWeight: '500' }}
                dangerouslySetInnerHTML={{ 
                  __html: renderizarConteudo(questaoSelecionada.alternativesIntroduction) 
                }}
              />
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="mb-3">Alternativas:</h4>
            {/* Alternativas da API enem.dev */}
            {questaoSelecionada.alternatives ? (
              questaoSelecionada.alternatives.map((alternativa, index) => (
                <div 
                  key={index} 
                  className="mb-2 p-3" 
                  style={{ 
                    background: mostrarGabarito && alternativa.letter === questaoSelecionada.correctAlternative 
                      ? 'rgba(40, 167, 69, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    border: mostrarGabarito && alternativa.letter === questaoSelecionada.correctAlternative 
                      ? '2px solid #28a745' 
                      : '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <strong>{alternativa.letter})</strong> {alternativa.text || alternativa.file || 'Alternativa com arquivo'}
                </div>
              ))
            ) : (
              /* Alternativas do formato antigo */
              questaoSelecionada.alternativas?.map((alternativa, index) => (
                <div 
                  key={index} 
                  className="mb-2 p-3" 
                  style={{ 
                    background: mostrarGabarito && alternativa.startsWith(questaoSelecionada.gabarito) 
                      ? 'rgba(40, 167, 69, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    border: mostrarGabarito && alternativa.startsWith(questaoSelecionada.gabarito) 
                      ? '2px solid #28a745' 
                      : '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {alternativa}
                </div>
              ))
            )}
          </div>

          {/* Arquivos da questão */}
          {questaoSelecionada.files && questaoSelecionada.files.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-3">Arquivos da questão:</h4>
              {questaoSelecionada.files.map((arquivo, index) => (
                <div key={index} className="mb-2">
                  <a 
                    href={arquivo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Ver arquivo {index + 1}
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <button 
              onClick={() => setMostrarGabarito(!mostrarGabarito)}
              className="btn btn-primary"
            >
              {mostrarGabarito ? 'Ocultar Gabarito' : 'Mostrar Gabarito'}
            </button>
          </div>
          
          {mostrarGabarito && (
            <div className="card" style={{ background: 'rgba(40, 167, 69, 0.1)', border: '1px solid #28a745' }}>
              <h4 className="text-success mb-2">
                Gabarito: {questaoSelecionada.correctAlternative || questaoSelecionada.gabarito}
              </h4>
              <p style={{ lineHeight: '1.6' }}>
                <strong>Explicação:</strong> {questaoSelecionada.comentario || `Questão ${questaoSelecionada.index || questaoSelecionada.id} do ENEM ${questaoSelecionada.year || questaoSelecionada.ano} - ${questaoSelecionada.discipline || questaoSelecionada.area}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-center mb-4" style={{ color: 'white' }}>
        Questões Oficiais do ENEM
      </h1>
      
      <div className="card mb-4">
        <h3 className="mb-3">Filtros</h3>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select 
              className="form-select"
              value={filtros.ano}
              onChange={(e) => handleFiltroChange('ano', e.target.value)}
            >
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Disciplina</label>
            <select 
              className="form-select"
              value={filtros.disciplina}
              onChange={(e) => handleFiltroChange('disciplina', e.target.value)}
            >
              {disciplinas.map(disc => (
                <option key={disc.value} value={disc.value}>{disc.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Questões por página</label>
            <select 
              className="form-select"
              value={filtros.limit}
              onChange={(e) => handleFiltroChange('limit', e.target.value)}
            >
              {limitesOpcoes.map(limite => (
                <option key={limite} value={limite}>{limite}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Página</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={paginaAnterior}
                disabled={parseInt(filtros.offset) === 0}
                className="btn btn-outline-primary btn-sm"
              >
                ←
              </button>
              <span style={{ minWidth: '60px', textAlign: 'center' }}>
                {Math.floor(parseInt(filtros.offset) / parseInt(filtros.limit)) + 1}
              </span>
              <button 
                onClick={proximaPagina}
                className="btn btn-outline-primary btn-sm"
              >
                →
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <button onClick={aplicarFiltros} className="btn btn-primary mr-2" style={{ marginRight: '1rem' }}>
            Aplicar Filtros
          </button>
          <button onClick={limparFiltros} className="btn btn-secondary">
            Limpar Filtros
          </button>
        </div>

        {/* Informações da busca */}
        {metadata && (
          <div className="mt-3 text-secondary" style={{ fontSize: '0.9rem' }}>
            Mostrando {filtros.offset} - {parseInt(filtros.offset) + questoes.length} de {metadata.total || 'muitas'} questões
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="loading"></div>
          <p style={{ color: 'white', marginTop: '1rem' }}>Carregando questões oficiais do ENEM...</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {questoes.map(questao => (
            <div 
              key={questao.id || questao.index} 
              className="card" 
              style={{ cursor: 'pointer' }} 
              onClick={() => selecionarQuestao(questao)}
            >
              <div className="mb-2">
                <span className="badge" style={{ 
                  background: '#667eea', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px',
                  marginRight: '1rem'
                }}>
                  {questao.area || questao.discipline || 'ENEM'}
                </span>
                <span className="text-secondary">
                  {questao.tema || questao.title || 'Questão Oficial'}
                </span>
              </div>
              
              <h4 className="mb-2">Questão {questao.id || questao.index}</h4>
              
              <p className="text-secondary mb-3" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {questao.enunciado || questao.context || questao.title || 'Questão do ENEM'}
              </p>
              
              <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                <span>Ano: {questao.ano || questao.year}</span>
                {questao.dificuldade && <span> • Dificuldade: {questao.dificuldade}</span>}
                {questao.frequencia && <span> • Frequência: {questao.frequencia}</span>}
                {questao.files && questao.files.length > 0 && (
                  <span> • {questao.files.length} arquivo(s)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && questoes.length === 0 && (
        <div className="text-center">
          <p style={{ color: 'white', fontSize: '1.2rem' }}>
            Nenhuma questão encontrada com os filtros selecionados.
          </p>
        </div>
      )}

      {/* Paginação na parte inferior */}
      {!loading && questoes.length > 0 && (
        <div className="text-center mt-4">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={paginaAnterior}
              disabled={parseInt(filtros.offset) === 0}
              className="btn btn-primary"
            >
              ← Página Anterior
            </button>
            <span style={{ color: 'white' }}>
              Página {Math.floor(parseInt(filtros.offset) / parseInt(filtros.limit)) + 1}
            </span>
            <button 
              onClick={proximaPagina}
              className="btn btn-primary"
            >
              Próxima Página →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questoes;
