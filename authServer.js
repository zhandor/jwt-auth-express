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
		"password": "$2b$10$LVe1dgszPWQmaySYogljVOiM/E7251g7fMTIheir/t1SOsjfxDqEi"
	},
	{
		"username": "Carol",
    	"password": "$2b$10$TBI7fZRJ83FiJqpSj30.d.LyGguMea9XWYbbeWA4yd3YbCDxJh4Xa"
	}
];

let refreshTokens = [];

app.get('/tokens', (req, res) => {
	res.json(refreshTokens);
});

app.post('/token', (req, res) => {
	const refreshToken = req.body.token;
	if(refreshToken == null){
		return res.sendStatus(401);
	}
	if(!refreshTokens.includes(refreshToken)){
		return res.sendStatus(403);
	}	
	jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (error, user) => {
		if(error){
			return res.sendStatus(403);
		}
		const {username} = user;
		const accessToken = generateAccessToken({username})
		res.status(200).send(accessToken);
	});
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
		console.log(error)
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
			const accessToken = generateAccessToken({username: user.username});
			const refreshToken = jwt.sign({username: user.username}, process.env.JWT_REFRESH_TOKEN)
			refreshTokens.push(refreshToken);
			res.json({accessToken, refreshToken});
		}else{
			res.send('Usuário não encontrado ou senha incorreta');
		}
	} catch (error) {
		res.status(500).send(error);
	}
});

app.delete('/logout', (req, res) => {
	refreshTokens = refreshTokens.filter(token => token !== req.body.token)
	
	res.sendStatus(204)
})

function generateAccessToken(user){
	return jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {expiresIn: '30s'});
}

