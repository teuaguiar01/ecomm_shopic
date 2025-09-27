# Requirements Document

## Introduction

Esta funcionalidade implementa o upload obrigatório de comprovante de pagamento durante o processo de finalização de compra. O sistema deve permitir que usuários façam upload de imagens de comprovantes, armazenem essas imagens no Firebase em uma estrutura organizada, e permitam que administradores visualizem e validem esses comprovantes para atualizar o status dos pedidos.

## Requirements

### Requirement 1

**User Story:** Como um cliente, eu quero fazer upload de um comprovante de pagamento durante a finalização da compra, para que meu pedido possa ser processado e validado pelo administrador.

#### Acceptance Criteria

1. WHEN o usuário estiver na página de finalização de compra THEN o sistema SHALL exibir um campo obrigatório para upload de comprovante
2. WHEN o usuário selecionar uma imagem THEN o sistema SHALL validar que o arquivo é uma imagem válida (jpg, jpeg, png, webp)
3. WHEN o usuário fizer upload da imagem THEN o sistema SHALL armazenar a imagem no Firebase Storage em uma pasta específica para comprovantes
4. WHEN o upload for bem-sucedido THEN o sistema SHALL associar o comprovante ao pedido no banco de dados
5. IF o usuário tentar finalizar a compra sem comprovante THEN o sistema SHALL impedir a finalização e exibir mensagem de erro

### Requirement 2

**User Story:** Como um administrador, eu quero visualizar os comprovantes de pagamento associados aos pedidos, para que eu possa validar os pagamentos e atualizar o status dos pedidos.

#### Acceptance Criteria

1. WHEN o administrador acessar a página de detalhes de um pedido THEN o sistema SHALL exibir a imagem do comprovante associado
2. WHEN o administrador visualizar o comprovante THEN o sistema SHALL permitir ampliar/visualizar a imagem em tamanho maior
3. WHEN o administrador validar o pagamento THEN o sistema SHALL permitir atualizar o status do pedido para "pago"
4. WHEN não houver comprovante associado THEN o sistema SHALL exibir uma mensagem indicativa
5. WHEN o comprovante não puder ser carregado THEN o sistema SHALL exibir uma mensagem de erro apropriada

### Requirement 3

**User Story:** Como um desenvolvedor, eu quero que o sistema de upload de comprovantes seja integrado com a infraestrutura existente, para que seja consistente com o sistema atual de upload de imagens de produtos.

#### Acceptance Criteria

1. WHEN implementar o upload THEN o sistema SHALL reutilizar a lógica existente do uploadImage de produtos
2. WHEN armazenar no Firebase THEN o sistema SHALL criar uma estrutura de pastas específica para comprovantes (/receipts/{orderId}/)
3. WHEN salvar no banco de dados THEN o sistema SHALL adicionar um campo para URL do comprovante na tabela de pedidos
4. WHEN processar o upload THEN o sistema SHALL aplicar as mesmas validações de segurança usadas para imagens de produtos
5. WHEN ocorrer erro no upload THEN o sistema SHALL exibir mensagens de erro consistentes com o padrão da aplicação

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que o processo de upload seja intuitivo e responsivo, para que eu tenha uma boa experiência durante a finalização da compra.

#### Acceptance Criteria

1. WHEN fazer upload THEN o sistema SHALL exibir um indicador de progresso durante o processo
2. WHEN o upload estiver em andamento THEN o sistema SHALL desabilitar o botão de finalização da compra
3. WHEN o upload for concluído THEN o sistema SHALL exibir uma confirmação visual
4. WHEN houver erro no upload THEN o sistema SHALL permitir nova tentativa sem perder outros dados do formulário
5. WHEN a imagem for muito grande THEN o sistema SHALL redimensionar automaticamente mantendo a qualidade adequada