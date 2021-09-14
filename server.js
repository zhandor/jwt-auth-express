const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());

app.listen(3000);

const posts = [
	{
		username: 'Zhandor',
		title: 'first post'
	},
	{
		username: 'Zhandor',
		title: 'second post'
	}
];

const users = []

app.get('/posts', (req, res) => {
	res.json(posts);
	console.log('hello world');
});

app.get('/users', (req, res) => {
	res.json(users);
});

app.post('/users', async (req, res) => {
	try{
		const {username, password} = req.body;
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		console.log({salt, hashedPassword});

		const user = {username, password: hashedPassword};

		users.push(user);
		
		res.json({user});
	}catch(error){
		res.json(error);
	}
	
});

app.post('/login', async (req, res) =>{
	const {username, password} = req.body;
	const user = users.find((user) => user.username = username);
	if(user == null){
		return res.status(400).send('Usuário não encontrado');
	}
	try {
		console.log({user, password});
		if(await bcrypt.compare(password, user.password)){
			res.send('Usuário logado com sucesso');
		}else{
			res.send('Usuário não encontrado ou senha incorreta');
		}
	} catch (error) {
		res.status(500).send(error);
	}

});
