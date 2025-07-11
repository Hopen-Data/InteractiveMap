import React from 'react';
import { REGIOES_BRASIL } from './Regioes.js';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';


export default function PainelEstados({ onUfClick }) {
  return (
    <div>
      <h4 className="mb-2">Limites e Regiões</h4>
      <small className="text-muted d-block mb-3">Selecione uma região para ver os estados.</small>

      <Accordion>
        {REGIOES_BRASIL.map((regiao, index) => (
          <Accordion.Item eventKey={String(index)} key={regiao.nome}>
            <Accordion.Header>
              <div
                className="d-flex justify-content-between align-items-center w-100"
                onClick={(e) => e.stopPropagation()} // Impede que o clique na área do div propague
              >
                <Form.Check
                  type="checkbox"
                  id={`region-check-${regiao.nome}`}
                  label={regiao.nome}
                />
              </div></Accordion.Header>
            <Accordion.Body>
              <div className="estado-grid">
                {regiao.estados.map(uf => (
                  <div
                    key={uf.sigla}
                    className="estado-label"
                    onClick={() => onUfClick(uf)}
                  >
                    {uf.sigla}
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}