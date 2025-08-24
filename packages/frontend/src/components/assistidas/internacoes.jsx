import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const Internacoes = ({ formData, formErrors = {}, handleChange }) => {
    const quantidade = parseInt(formData.quantidade_internacoes) || 0;
    const linhas = Array.from({ length: quantidade }, (_, i) => i + 1);

    return (
        <Col md={10}>
            {linhas.map((i) => (
                <Row key={i} className="mb-2">
                    {["local", "duracao", "data"].map((campo) => {
                        const fieldName = `${campo}${i}`;
                        return (
                            <Col key={fieldName}>
                                <Form.Group>
                                    <Form.Control
                                        placeholder={`${campo.charAt(0).toUpperCase() + campo.slice(1)} ${i}`}
                                        type={campo === "data" ? "date" : "text"}
                                        name={fieldName}
                                        value={formData[fieldName] || ""}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors[fieldName]}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors[fieldName]}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        );
                    })}
                </Row>
            ))}
        </Col>
    );
};

export default Internacoes;
