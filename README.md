# Site Helo

Site estatico pronto para publicar no GitHub Pages com contador global via Supabase.

## Como publicar

1. Envie estes arquivos para a branch `main`.
2. No GitHub, abra `Settings` > `Pages`.
3. Em `Build and deployment`, selecione `GitHub Actions`.
4. Aguarde o workflow `Deploy to GitHub Pages` terminar.

## Como ativar o contador global

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e rode o arquivo [supabase/setup.sql](./supabase/setup.sql).
3. Em `Project Settings` > `API`, copie:
   - `Project URL`
   - `anon public key`
4. Edite [scripts/counter-config.js](./scripts/counter-config.js) com esses valores.
5. Faca um novo push para a `main`.

## Estrutura

- `index.html`: pagina publica com a contagem global
- `admin/index.html`: painel para atualizar o contador global
- `scripts/counter-config.js`: configuracao do Supabase
- `scripts/counter-store.js`: sincronizacao com o backend
- `supabase/setup.sql`: tabela, policies e funcoes SQL

## Observacao importante

Este projeto continua sendo um site estatico. Isso quer dizer que o painel `admin` nao fica protegido de verdade apenas com HTML e JavaScript. O contador sera global, mas qualquer pessoa que descubra como a chamada de escrita funciona pode tentar alterar o valor.

Se voce quiser, o proximo passo pode ser endurecer isso com autenticacao real ou um backend proprio para a parte administrativa.
