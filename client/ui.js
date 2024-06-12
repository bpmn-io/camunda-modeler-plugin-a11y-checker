import React from 'react';
import { Fill, Modal } from 'camunda-modeler-plugin-helpers/components';


export function A11yCheckerUI({ violations }) {
  const [ modalOpen, setModalOpen ] = React.useState(false);

  return <React.Fragment>
    {
      modalOpen && <ViolationsModal onClose={ () => setModalOpen(false) } violations={ violations } />
    }
    <Fill slot="status-bar__app" group="9_check">
      <button
        className="btn"
        type="button"
        onClick={ () => setModalOpen(true) }
      >
        Accessibility violations: { violations.length }
      </button>
    </Fill>
  </React.Fragment>;
}

function ViolationsModal({ onClose, violations }) {
  const copy = payload => () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).catch(console.error);
  };

  return <Modal onClose={ onClose }>
    <Modal.Title>
      Accessibility Checker
    </Modal.Title>
    <Modal.Body>
      <ul style={ { listStyleType: 'none' } }>
        {
          violations.map((violation, i) => (
            <li key={ i }>
              <details><summary>{ violation.help }</summary>
                <pre>
                  { JSON.stringify(violation, null, 2) }
                </pre>
                <button className="btn btn-secondary" type="button" onClick={ copy(violation) }>Copy</button>
              </details>
            </li>
          ))
        }
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <button className="btn btn-secondary" type="button" onClick={ copy(violations) }>
        Copy all
      </button>
      <button className="btn btn-primary" type="button" onClick={ onClose }>
        Close
      </button>
    </Modal.Footer>
  </Modal>;
}