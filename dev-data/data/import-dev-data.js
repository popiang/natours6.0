const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log('Database is successfully connected!!');
});

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
	try {
		await Tour.create(tours);
		console.log('Tours successfully imported!!')
	} catch (error) {
		console.log(error);
	}
	process.exit()
}

const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log('Tours successfully deleted!!')
	} catch (error) {
		console.log(error);
	}
	process.exit()
}

if (process.argv[2] === '--import') {
	importData();
}

if (process.argv[2] === '--delete') {
	deleteData();
}