# Validar compras no cache

> ## Caso de sucesso
1. Sistema executa o comando "Carregar compras"
2. Sistema carrega os dados do cache
3. Sistema valida se o cache tem menos de 3 dias

> ## Caso de exceção - Erro ao carregar dados do cache
1. Sistema limpa o cache

> ## Caso de exceção - Cache expirado
1. Sistema limpa o cache