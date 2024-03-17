const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
	console.log("Database is successfully connected!!");
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
