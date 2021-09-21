# jwt-auth-express
https://www.youtube.com/watch?v=mbsmsi7l3r4

para rodar é necessário realizar a criação dos tokens jwt:
1 - no terminal

2 - node

3 - executar 1 vez para cada chave (JWT_ACCESS_TOKEN e JWT_REFRESH_TOKEN) require('crypto').randomBytes(64).toString('hex')

4 - copiar cada valor e colar no .env

5 - executar 
		npm run devStart 
	para iniciar a "aplicação"
	e executar
		npm run authStart
	para iniciar o "servidor de autenticação"
