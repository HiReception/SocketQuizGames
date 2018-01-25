var pg = require("pg");
const {parse} = require("pg-connection-string");

const dbConfig = Object.assign(parse(process.env.DATABASE_URL), {max: 9});
var pool = new pg.Pool(dbConfig);

pool.query("DELETE FROM rooms WHERE row_modified_ < clock_timestamp() - INTERVAL \'1 DAY\'",
	[], (err, dbRes) => {
		if (err) {
			console.log(err);
		} else {
			console.log(dbRes);
		}
	}
);	