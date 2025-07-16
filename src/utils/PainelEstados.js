import React, { useState } from 'react';
import { REGIOES_BRASIL } from './Regioes.js';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { FaCaretRight, FaCaretDown } from 'react-icons/fa';


export default function PainelEstados({
  onUfClick,
  onBrasilToggle,
  isBrasilChecked,
  onRegionToggle,
  checkedRegions,
  onStateToggle,
  checkedStates,
}) {

  const [expanded, setExpanded] = useState({ Brasil: true });

  const toggleExpand = (itemName) => {
    setExpanded(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  return (
    <div className="tree-container">
      <h4 className="mb-2">Limites e Regiões</h4>
      <small className="text-muted d-block mb-3">Selecione o nível geográfico.</small>

      <ListGroup>
        {/* Nível 1: Brasil */}
        <ListGroup.Item>
          <div className="tree-item">
            <span onClick={() => toggleExpand('Brasil')} className="expand-icon">
              {expanded['Brasil'] ? <FaCaretDown /> : <FaCaretRight />}
            </span>
            <Form.Check
              type="checkbox"
              id="brasil-check"
              label="Brasil"
              checked={isBrasilChecked}
              onChange={(e) => onBrasilToggle(e.target.checked)}
            />
          </div>

          {expanded['Brasil'] && (
            <ul className="tree-submenu">
              {REGIOES_BRASIL.map(regiao => (
                <ListGroup.Item key={regiao.nome}>
                  <div className="tree-item">
                    <span onClick={() => toggleExpand(regiao.nome)} className="expand-icon">
                      {expanded[regiao.nome] ? <FaCaretDown /> : <FaCaretRight />}
                    </span>
                    <Form.Check
                      type="checkbox"
                      id={`region-check-${regiao.nome}`}
                      label={regiao.nome}
                      checked={checkedRegions.includes(regiao.nome)}
                      onChange={(e) => onRegionToggle(regiao, e.target.checked)}
                    />
                  </div>

                  {/* Nível 3: Estados (só aparece se a Região estiver expandida) */}
                  {expanded[regiao.nome] && (
                    <div className="tree-submenu">
                      <ListGroup variant="flush">
                        {regiao.estados.map(uf => (
                          <ListGroup.Item
                            key={uf.sigla}
                            onClick={() => onUfClick(uf)} // Ação de clicar no item todo
                            action
                            className="py-1 d-flex align-items-center"
                          >
                            <Form.Check
                              type="checkbox"
                              id={`state-check-${uf.sigla}`}
                              label={uf.nome}
                              onClick={(e) => e.stopPropagation()}
                              checked={checkedStates.includes(uf.sigla)}
                              onChange={(e) => onStateToggle(uf, e.target.checked)}
                            />
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ul>
          )}
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
}