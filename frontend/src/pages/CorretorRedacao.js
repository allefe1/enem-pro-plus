import React, { useState } from 'react';
import axios from 'axios';

const CorretorRedacao = () => {
  const [tema, setTema] = useState('');
  const [temaPersonalizado, setTemaPersonalizado] = useState('');
  const [usarTemaPersonalizado, setUsarTemaPersonalizado] = useState(false);
  const [redacao, setRedacao] = useState('');
  const [avaliacao, setAvaliacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const temasEnem = [
    'Democratização do acesso ao cinema no Brasil',
    'Desafios para a formação educacional de surdos no Brasil',
    'Manipulação do comportamento do usuário pelo controle de dados na internet',
    'O estigma associado às doenças mentais na sociedade brasileira',
    'Publicidade infantil em questão no Brasil',
    'Caminhos para combater a intolerância religiosa no Brasil',
    'Efeitos da implantação da Lei Seca no Brasil',
    'A persistência da violência contra a mulher na sociedade brasileira',
    'Publicidade infantil em questão no Brasil',
    'Os desafios da educação no Brasil'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const temaFinal = usarTemaPersonalizado ? temaPersonalizado : tema;
    
    if (!temaFinal.trim() || !redacao.trim()) {
      setErro('Por favor, preencha o tema e a redação.');
      return;
    }

    if (redacao.length < 100) {
      setErro('A redação deve ter pelo menos 100 caracteres.');
      return;
    }

    setLoading(true);
    setErro('');
    setAvaliacao(null);

    try {
      const response = await axios.post('http://localhost:5000/api/corrigir-redacao', {
        tema: temaFinal,
        redacao
      });

      setAvaliacao(response.data);
    } catch (error) {
      console.error('Erro ao corrigir redação:', error);
      setErro('Erro ao processar a redação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTema('');
    setTemaPersonalizado('');
    setUsarTemaPersonalizado(false);
    setRedacao('');
    setAvaliacao(null);
    setErro('');
  };

  const getNotaColor = (nota) => {
    if (nota >= 160) return '#28a745'; // Verde
    if (nota >= 120) return '#ffc107'; // Amarelo
    if (nota >= 80) return '#fd7e14';  // Laranja
    return '#dc3545'; // Vermelho
  };

  return (
    <div className="container">
      <h1 className="text-center mb-4" style={{ color: 'white' }}>
        Corretor de Redação com IA
      </h1>
      
      {!avaliacao ? (
        <div className="card">
          <h3 className="mb-3">Envie sua redação para correção</h3>
          <p className="text-secondary mb-4">
            Nossa IA irá avaliar sua redação baseada nas 5 competências do ENEM, 
            fornecendo uma nota de 0 a 200 para cada competência e sugestões de melhoria.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tema da Redação</label>
              
              <div className="mb-3">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tipoTema"
                    checked={!usarTemaPersonalizado}
                    onChange={() => setUsarTemaPersonalizado(false)}
                  />
                  Escolher tema pré-definido
                </label>
              </div>
              
              {!usarTemaPersonalizado && (
                <select 
                  className="form-select mb-3"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  required={!usarTemaPersonalizado}
                >
                  <option value="">Selecione um tema</option>
                  {temasEnem.map((temaOption, index) => (
                    <option key={index} value={temaOption}>
                      {temaOption}
                    </option>
                  ))}
                </select>
              )}
              
              <div className="mb-3">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tipoTema"
                    checked={usarTemaPersonalizado}
                    onChange={() => setUsarTemaPersonalizado(true)}
                  />
                  Escrever tema personalizado
                </label>
              </div>
              
              {usarTemaPersonalizado && (
                <input
                  type="text"
                  className="form-select"
                  value={temaPersonalizado}
                  onChange={(e) => setTemaPersonalizado(e.target.value)}
                  placeholder="Digite seu tema personalizado..."
                  required={usarTemaPersonalizado}
                  style={{ 
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    width: '100%'
                  }}
                />
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Sua Redação 
                <span className="text-secondary">({redacao.length} caracteres)</span>
              </label>
              <textarea
                className="form-textarea"
                value={redacao}
                onChange={(e) => setRedacao(e.target.value)}
                placeholder="Digite sua redação aqui... (mínimo 100 caracteres)"
                rows="15"
                required
              />
            </div>
            
            {erro && (
              <div className="mb-3" style={{ 
                background: 'rgba(220, 53, 69, 0.1)', 
                border: '1px solid #dc3545',
                borderRadius: '8px',
                padding: '1rem',
                color: '#dc3545'
              }}>
                {erro}
              </div>
            )}
            
            <div className="text-center">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <>
                    <span className="loading"></span>
                    <span style={{ marginLeft: '0.5rem' }}>Corrigindo...</span>
                  </>
                ) : (
                  'Corrigir Redação'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <button onClick={resetForm} className="btn btn-secondary">
              ← Nova Correção
            </button>
          </div>
          
          <div className="card mb-4">
            <h3 className="text-center mb-3">Resultado da Correção</h3>
            <div className="text-center mb-4">
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: getNotaColor(avaliacao.nota_total),
                marginBottom: '0.5rem'
              }}>
                {avaliacao.nota_total}
              </div>
              <div className="text-secondary">Nota Total (máximo 1000)</div>
            </div>
          </div>
          
          <div className="grid grid-2">
            {avaliacao.competencias && avaliacao.competencias.map((comp, index) => (
              <div key={index} className="card">
                <h4 className="mb-2" style={{ color: getNotaColor(comp.nota) }}>
                  Competência {comp.numero}: {comp.nota}/200
                </h4>
                <h5 className="mb-3 text-secondary">{comp.nome}</h5>
                
                <div className="mb-3">
                  <strong>Avaliação:</strong>
                  <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {comp.explicacao}
                  </p>
                </div>
                
                <div>
                  <strong>Sugestões de Melhoria:</strong>
                  <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {comp.sugestoes}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {avaliacao.comentario_geral && (
            <div className="card mt-4">
              <h4 className="mb-3">Comentário Geral</h4>
              <p style={{ lineHeight: '1.6' }}>
                {avaliacao.comentario_geral}
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="card mt-4">
        <h4 className="mb-3">Como funciona a correção?</h4>
        <div className="grid grid-2">
          <div>
            <h5 className="mb-2">Competências Avaliadas:</h5>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Domínio da modalidade escrita formal da língua portuguesa</li>
              <li>Compreender a proposta de redação e aplicar conceitos</li>
              <li>Selecionar, relacionar, organizar e interpretar informações</li>
              <li>Demonstrar conhecimento dos mecanismos linguísticos</li>
              <li>Elaborar proposta de intervenção para o problema abordado</li>
            </ul>
          </div>
          <div>
            <h5 className="mb-2">Sistema de Pontuação:</h5>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>0-40:</strong> Insuficiente</li>
              <li><strong>40-80:</strong> Regular</li>
              <li><strong>80-120:</strong> Bom</li>
              <li><strong>120-160:</strong> Muito Bom</li>
              <li><strong>160-200:</strong> Excelente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorretorRedacao;

