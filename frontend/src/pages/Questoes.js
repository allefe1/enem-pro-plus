import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Questoes = () => {
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    area: '',
    tema: '',
    ano: '',
    dificuldade: '',
    frequencia: ''
  });
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [mostrarGabarito, setMostrarGabarito] = useState(false);

  const areas = ['Matemática', 'Linguagens', 'Humanas', 'Natureza'];
  const dificuldades = ['Fácil', 'Média', 'Difícil'];
  const frequencias = ['Baixa', 'Média', 'Alta', 'Muito Alta'];
  const anos = ['2020', '2021', '2022', '2023'];

  useEffect(() => {
    buscarQuestoes();
  }, []);

  const buscarQuestoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      const response = await axios.get(`http://localhost:5000/api/questoes?${params}`);
      setQuestoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    buscarQuestoes();
  };

  const limparFiltros = () => {
    setFiltros({
      area: '',
      tema: '',
      ano: '',
      dificuldade: '',
      frequencia: ''
    });
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
              {questaoSelecionada.area}
            </span>
            <span className="text-secondary">
              {questaoSelecionada.tema} • {questaoSelecionada.ano} • {questaoSelecionada.dificuldade}
            </span>
          </div>
          
          <h3 className="mb-3">Questão {questaoSelecionada.id}</h3>
          
          <div className="mb-4">
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
              {questaoSelecionada.enunciado}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="mb-3">Alternativas:</h4>
            {questaoSelecionada.alternativas.map((alternativa, index) => (
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
            ))}
          </div>
          
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
              <h4 className="text-success mb-2">Gabarito: {questaoSelecionada.gabarito}</h4>
              <p style={{ lineHeight: '1.6' }}>
                <strong>Explicação:</strong> {questaoSelecionada.comentario}
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
        Questões que Mais Caem no ENEM
      </h1>
      
      <div className="card mb-4">
        <h3 className="mb-3">Filtros</h3>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Área</label>
            <select 
              className="form-select"
              value={filtros.area}
              onChange={(e) => handleFiltroChange('area', e.target.value)}
            >
              <option value="">Todas as áreas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select 
              className="form-select"
              value={filtros.ano}
              onChange={(e) => handleFiltroChange('ano', e.target.value)}
            >
              <option value="">Todos os anos</option>
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Dificuldade</label>
            <select 
              className="form-select"
              value={filtros.dificuldade}
              onChange={(e) => handleFiltroChange('dificuldade', e.target.value)}
            >
              <option value="">Todas</option>
              {dificuldades.map(dif => (
                <option key={dif} value={dif}>{dif}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Frequência</label>
            <select 
              className="form-select"
              value={filtros.frequencia}
              onChange={(e) => handleFiltroChange('frequencia', e.target.value)}
            >
              <option value="">Todas</option>
              {frequencias.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
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
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="loading"></div>
          <p style={{ color: 'white', marginTop: '1rem' }}>Carregando questões...</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {questoes.map(questao => (
            <div key={questao.id} className="card" style={{ cursor: 'pointer' }} onClick={() => selecionarQuestao(questao)}>
              <div className="mb-2">
                <span className="badge" style={{ 
                  background: '#667eea', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px',
                  marginRight: '1rem'
                }}>
                  {questao.area}
                </span>
                <span className="text-secondary">
                  {questao.tema}
                </span>
              </div>
              
              <h4 className="mb-2">Questão {questao.id}</h4>
              
              <p className="text-secondary mb-3" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {questao.enunciado}
              </p>
              
              <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                <span>Ano: {questao.ano}</span> • 
                <span> Dificuldade: {questao.dificuldade}</span> • 
                <span> Frequência: {questao.frequencia}</span>
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
    </div>
  );
};

export default Questoes;

