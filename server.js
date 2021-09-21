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

app.get('/posts', authenticateToken, (req, res) => {
	res.json(posts.filter(post => post.username === req.user.username));
});

app.post('/posts', authenticateToken, (req, res) => {
	const {body, user} = req;
	const post = {username: user.username, content: body.content}
	posts.push(post);

	res.json(post);
});

app.get('/posts/all', (req, res) => {
	res.json(posts);
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