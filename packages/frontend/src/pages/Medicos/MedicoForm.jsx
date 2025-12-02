import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

function MedicoForm({ formData, formErrors, handleChange, isEditMode }) {
    return (
        <>
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3" controlId="formMedicoNome">
                        <Form.Label>Nome Completo *</Form.Label>
                        <Form.Control
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            isInvalid={!!formErrors.nome}
                            placeholder="Digite o nome completo do médico"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.nome}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formMedicoCrm">
                        <Form.Label>CRM *</Form.Label>
                        <Form.Control
                            type="text"
                            name="crm"
                            value={formData.crm}
                            onChange={handleChange}
                            isInvalid={!!formErrors.crm}
                            placeholder="Ex: 123456/SP"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.crm}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formMedicoEspecialidade">
                        <Form.Label>Especialidade *</Form.Label>
                        <Form.Control
                            type="text"
                            name="especialidade"
                            value={formData.especialidade}
                            onChange={handleChange}
                            isInvalid={!!formErrors.especialidade}
                            placeholder="Ex: Cardiologia"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.especialidade}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
}

export default MedicoForm;
