-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    valor_unitario_compra NUMERIC NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pessoas (Vendedoras)
CREATE TABLE IF NOT EXISTS pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Reposições
CREATE TABLE IF NOT EXISTS reposicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    valor_unitario NUMERIC NOT NULL,
    data_reposicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    valor_total NUMERIC NOT NULL,
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Relação Venda-Responsáveis (N-N)
CREATE TABLE IF NOT EXISTS venda_responsaveis (
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    PRIMARY KEY (venda_id, pessoa_id)
);

-- Trigger para atualizar estoque na reposição
CREATE OR REPLACE FUNCTION update_stock_on_reposicao()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE produtos
    SET estoque_atual = estoque_atual + NEW.quantidade
    WHERE id = NEW.produto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_stock_on_reposicao
AFTER INSERT ON reposicoes
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_reposicao();

-- Trigger para atualizar estoque na venda
CREATE OR REPLACE FUNCTION update_stock_on_venda()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar se há estoque suficiente
    IF (SELECT estoque_atual FROM produtos WHERE id = NEW.produto_id) < NEW.quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente para a venda';
    END IF;

    UPDATE produtos
    SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_stock_on_venda
AFTER INSERT ON vendas
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_venda();
