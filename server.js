const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config({ path: '.env'});

app.use(express.json());

app.listen(process.env.HOST_PORT);

const posts = [
	{username: 'Zhandor', content: 'first post by Zhandor'},
	{username: 'Carol', content: 'first post by Carol'},
	{username: 'Zhandor', content: 'second post by Zhandor'},
	{username: 'Zhandor', content: 'third post by Zhandor'},
	{username: 'Carol', content: 'second post by Carol'},
	{username: 'Zhandor', content: 'forth post by Zhandor'},
	{username: 'Carol', content: 'third post by Carol'},
	{username: 'Zhandor', content: 'fifth post by Zhandor'}
];

const users = [
	{
		"username": "Zhandor",
		"password": "$2b$10$SJ.W3ZEstv/NPMyEov1vUONmRjVPkHoMt3Ix53frbcfwG7RmCnTJi"
	}
];

app.get('/posts', authenticateToken, (req, res) => {
	res.json(posts.filter(post => post.username === req.user.username));
});

app.get('/posts/all', (req, res) => {
	res.json(posts);
});

app.get('/users', (req, res) => {
	res.json(users);
});

app.post('/users', async (req, res) => {
	try{
		const {username, password} = req.body;
		if(users.some(user => user.username === username)){
			return res.status(400).send('nome de usuário jé está em uso')
		}
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = {username, password: hashedPassword};

		users.push(user);
		
		res.json({user});
	}catch(error){
		res.json(error);
	}
	
});

app.post('/login', async (req, res) =>{
	const {username, password} = req.body;
	const user = users.find((user) => user.username == username);
	if(user == null){
		return res.status(400).send('Usuário não encontrado');
	}
	try {
		if(await bcrypt.compare(password, user.password)){
			const accessToken = jwt.sign(user, process.env.JWT_ACCESS_TOKEN);
			res.json({accessToken});
		}else{
			res.send('Usuário não encontrado ou senha incorreta');
		}
	} catch (error) {
		res.status(500).send(error);
	}

});

function authenticateToken(req, res, next){
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if(!token){
		return res.sendStatus(401);
	} 
	jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (error, user) => {
		if(error){
			return res.sendStatus(403)
		}
		req.user = user;
		next();
	});
}