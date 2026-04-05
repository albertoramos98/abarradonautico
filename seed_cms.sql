-- Seed initial CMS data
INSERT INTO site_content (key, value, description) VALUES
('hero_title', 'Os Centenarios dos Aflitos', 'Título da seção Hero'),
('hero_description', 'A Barra Brava do Clube Náutico Capibaribe.', 'Descrição da seção Hero'),
('about_title', 'Quem Somos', 'Título da seção Quem Somos'),
('about_description_1', 'Os Centenários dos Aflitos é uma torcida apaixonada do Clube Náutico Capibaribe, fundada por torcedores que compartilham o amor incondicional pelo time. Nossa missão é apoiar o Náutico em todos os momentos, seja nas vitórias ou nas derrotas.', 'Primeiro parágrafo de Quem Somos'),
('about_description_2', 'Nosso nome homenageia o centenário do clube e o histórico Estádio dos Aflitos, palco de tantas glórias do Timbu. Vestimos com orgulho as cores vermelho e branco e levamos nossa paixão a todos os cantos.', 'Segundo parágrafo de Quem Somos'),
('footer_title', 'Os Centenários dos Aflitos', 'Título no rodapé'),
('footer_description', 'A torcida mais apaixonada do Clube Náutico Capibaribe.', 'Descrição no rodapé'),
('contact_address', 'Recife, Pernambuco', 'Endereço de contato'),
('contact_phone', '(81) 9999-9999', 'Telefone de contato'),
('contact_email', 'contato@centenariosafitos.com.br', 'E-mail de contato'),
('products_title', 'Nossos Produtos', 'Título da página de produtos'),
('products_description', 'Vista-se com orgulho e mostre seu amor pelo Náutico com nossa coleção exclusiva.', 'Descrição da página de produtos')
ON CONFLICT (key) DO NOTHING;
