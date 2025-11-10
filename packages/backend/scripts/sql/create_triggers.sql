-- ========================================
-- Triggers para cálculos automáticos
-- Módulo Produção & Vendas
-- Sistema Casa+
-- ========================================

USE casamais_db;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS trg_update_custo_parcial_receita_mp;
DROP TRIGGER IF EXISTS trg_update_custo_parcial_on_update;
DROP TRIGGER IF EXISTS trg_update_custo_receita_insert;
DROP TRIGGER IF EXISTS trg_update_custo_receita_update;
DROP TRIGGER IF EXISTS trg_update_custo_receita_delete;
DROP TRIGGER IF EXISTS trg_update_custo_parcial_on_mp_update;
DROP TRIGGER IF EXISTS trg_update_produto_custo_receita;
DROP TRIGGER IF EXISTS trg_update_produto_margem_insert;
DROP TRIGGER IF EXISTS trg_update_produto_margem_before;
DROP TRIGGER IF EXISTS trg_calculate_venda_values;
DROP TRIGGER IF EXISTS trg_update_venda_values;

-- ========================================
-- TRIGGER 1: Calcular custo parcial ao inserir matéria-prima em receita
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_parcial_receita_mp
BEFORE INSERT ON receitas_materias_primas
FOR EACH ROW
BEGIN
  DECLARE preco_unidade DECIMAL(10,2);
  SELECT preco_por_unidade INTO preco_unidade
  FROM materias_primas
  WHERE id = NEW.materia_prima_id;
  SET NEW.custo_parcial = NEW.quantidade * IFNULL(preco_unidade, 0);
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 2: Atualizar custo parcial ao modificar quantidade
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_parcial_on_update
BEFORE UPDATE ON receitas_materias_primas
FOR EACH ROW
BEGIN
  DECLARE preco_unidade DECIMAL(10,2);
  SELECT preco_por_unidade INTO preco_unidade
  FROM materias_primas
  WHERE id = NEW.materia_prima_id;
  SET NEW.custo_parcial = NEW.quantidade * IFNULL(preco_unidade, 0);
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 3: Atualizar custo da receita ao inserir matéria-prima
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_receita_insert
AFTER INSERT ON receitas_materias_primas
FOR EACH ROW
BEGIN
  UPDATE receitas
  SET custo_estimado = (
    SELECT IFNULL(SUM(custo_parcial), 0)
    FROM receitas_materias_primas
    WHERE receita_id = NEW.receita_id
  )
  WHERE id = NEW.receita_id;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 4: Atualizar custo da receita ao modificar matéria-prima
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_receita_update
AFTER UPDATE ON receitas_materias_primas
FOR EACH ROW
BEGIN
  UPDATE receitas
  SET custo_estimado = (
    SELECT IFNULL(SUM(custo_parcial), 0)
    FROM receitas_materias_primas
    WHERE receita_id = NEW.receita_id
  )
  WHERE id = NEW.receita_id;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 5: Atualizar custo da receita ao deletar matéria-prima
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_receita_delete
AFTER DELETE ON receitas_materias_primas
FOR EACH ROW
BEGIN
  UPDATE receitas
  SET custo_estimado = IFNULL((
    SELECT SUM(custo_parcial)
    FROM receitas_materias_primas
    WHERE receita_id = OLD.receita_id
  ), 0)
  WHERE id = OLD.receita_id;

  UPDATE produtos p
  JOIN receitas r ON p.receita_id = r.id
  SET p.custo_estimado = CASE
      WHEN r.rendimento > 0 THEN r.custo_estimado / r.rendimento
      ELSE 0
    END,
    p.margem_bruta = p.preco_venda - CASE
      WHEN r.rendimento > 0 THEN r.custo_estimado / r.rendimento
      ELSE 0
    END,
    p.margem_percentual = CASE
      WHEN p.preco_venda > 0 AND r.rendimento > 0 THEN
        ((p.preco_venda - (r.custo_estimado / r.rendimento)) / p.preco_venda) * 100
      ELSE 0
    END
  WHERE r.id = OLD.receita_id;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 6: Atualizar custos quando preço da matéria-prima muda
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_custo_parcial_on_mp_update
AFTER UPDATE ON materias_primas
FOR EACH ROW
BEGIN
  IF OLD.preco_por_unidade != NEW.preco_por_unidade THEN
    UPDATE receitas_materias_primas
    SET custo_parcial = quantidade * NEW.preco_por_unidade
    WHERE materia_prima_id = NEW.id;

    UPDATE receitas r
    SET custo_estimado = (
      SELECT IFNULL(SUM(custo_parcial), 0)
      FROM receitas_materias_primas rmp
      WHERE rmp.receita_id = r.id
    )
    WHERE id IN (
      SELECT DISTINCT receita_id
      FROM receitas_materias_primas
      WHERE materia_prima_id = NEW.id
    );
  END IF;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 7: Atualizar produtos quando receita muda
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_produto_custo_receita
AFTER UPDATE ON receitas
FOR EACH ROW
BEGIN
  IF OLD.custo_estimado != NEW.custo_estimado OR OLD.rendimento != NEW.rendimento THEN
    UPDATE produtos
    SET custo_estimado = CASE
        WHEN NEW.rendimento > 0 THEN NEW.custo_estimado / NEW.rendimento
        ELSE 0
      END,
      margem_bruta = preco_venda - CASE
        WHEN NEW.rendimento > 0 THEN NEW.custo_estimado / NEW.rendimento
        ELSE 0
      END,
      margem_percentual = CASE
        WHEN preco_venda > 0 AND NEW.rendimento > 0 THEN
          ((preco_venda - (NEW.custo_estimado / NEW.rendimento)) / preco_venda) * 100
        ELSE 0
      END
    WHERE receita_id = NEW.id;
  END IF;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 8: Calcular margem ao inserir produto
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_produto_margem_insert
BEFORE INSERT ON produtos
FOR EACH ROW
BEGIN
  SET NEW.margem_bruta = NEW.preco_venda - IFNULL(NEW.custo_estimado, 0);
  SET NEW.margem_percentual = CASE
    WHEN NEW.preco_venda > 0 THEN
      ((NEW.preco_venda - IFNULL(NEW.custo_estimado, 0)) / NEW.preco_venda) * 100
    ELSE 0
  END;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 9: Atualizar margem ao modificar produto
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_produto_margem_before
BEFORE UPDATE ON produtos
FOR EACH ROW
BEGIN
  IF OLD.preco_venda != NEW.preco_venda OR OLD.custo_estimado != NEW.custo_estimado THEN
    SET NEW.margem_bruta = NEW.preco_venda - IFNULL(NEW.custo_estimado, 0);
    SET NEW.margem_percentual = CASE
      WHEN NEW.preco_venda > 0 THEN
        ((NEW.preco_venda - IFNULL(NEW.custo_estimado, 0)) / NEW.preco_venda) * 100
      ELSE 0
    END;
  END IF;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 10: Calcular valores ao inserir venda
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_calculate_venda_values
BEFORE INSERT ON vendas
FOR EACH ROW
BEGIN
  DECLARE preco_venda DECIMAL(10,2);
  DECLARE custo_estimado DECIMAL(10,2);

  SELECT p.preco_venda, p.custo_estimado
  INTO preco_venda, custo_estimado
  FROM produtos p
  WHERE p.id = NEW.produto_id;

  SET NEW.valor_bruto = NEW.quantidade * IFNULL(preco_venda, 0);
  SET NEW.valor_final = NEW.valor_bruto - IFNULL(NEW.desconto, 0);
  SET NEW.custo_estimado_total = NEW.quantidade * IFNULL(custo_estimado, 0);
  SET NEW.lucro_estimado = NEW.valor_final - NEW.custo_estimado_total;
END$$
DELIMITER ;

-- ========================================
-- TRIGGER 11: Recalcular valores ao atualizar venda
-- ========================================
DELIMITER $$
CREATE TRIGGER trg_update_venda_values
BEFORE UPDATE ON vendas
FOR EACH ROW
BEGIN
  DECLARE preco_venda DECIMAL(10,2);
  DECLARE custo_estimado DECIMAL(10,2);

  SELECT p.preco_venda, p.custo_estimado
  INTO preco_venda, custo_estimado
  FROM produtos p
  WHERE p.id = NEW.produto_id;

  SET NEW.valor_bruto = NEW.quantidade * IFNULL(preco_venda, 0);
  SET NEW.valor_final = NEW.valor_bruto - IFNULL(NEW.desconto, 0);
  SET NEW.custo_estimado_total = NEW.quantidade * IFNULL(custo_estimado, 0);
  SET NEW.lucro_estimado = NEW.valor_final - NEW.custo_estimado_total;
END$$
DELIMITER ;

SELECT 'Triggers do módulo Produção & Vendas criados com sucesso!' as status;
