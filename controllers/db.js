import { createPool } from "mysql2/promise";

export const pool = createPool({
    user: 'root',
    password: '6nhJOvtznYDASaGEYhmP',
    host: 'containers-us-west-148.railway.app',
    port: 6659,
    database: 'railway'
});