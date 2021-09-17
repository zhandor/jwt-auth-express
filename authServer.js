const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config({ path: '.env'});

app.use(express.json());

app.listen(process.env.AUTH_SERVER_PORT);

const users = [
	{
		"username": "Zhandor",
		"password": "$2b$10$SJ.W3ZEstv/NPMyEov1vUONmRjVPkHoMt3Ix53frbcfwG7RmCnTJi"
	}
];

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

app.post('/login', async (req, res) => {
	const {username, password} = req.body;
	const user = users.find((user) => user.username == username);
	if(user == null){
		return res.status(400).send('Usuário não encontrado');
	}
	try {
		if(await bcrypt.compare(password, user.password)){
			const accessToken = generateAccessToken(user);

			const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_TOKEN)
			res.json({accessToken, refreshToken});
		}else{
			res.send('Usuário não encontrado ou senha incorreta');
		}
	} catch (error) {
		res.status(500).send(error);
	}
});

function generateAccessToken(user){
	return jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {expiresIn: '20s'});
}