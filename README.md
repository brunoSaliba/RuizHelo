# Site Helo

Site estatico pronto para publicar no GitHub Pages.

## Como publicar

1. Crie um repositorio no GitHub.
2. Envie estes arquivos para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Faça um novo push na branch `main` se o deploy nao iniciar sozinho.
6. Aguarde o workflow `Deploy to GitHub Pages` terminar.

## Estrutura

- `index.html`: pagina principal
- `admin/index.html`: painel oculto para ajustar o contador
- `scripts/`: logica do contador
- `styles.css`: visual do site

## Importante

O contador atual usa `localStorage`.
Isso significa que, no GitHub Pages, cada navegador tera a propria contagem salva localmente.
Se voce quiser um contador global de verdade para todos verem o mesmo numero, o proximo passo e ligar o site a um backend como Supabase ou Firebase.
