var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const { Pool, Client } = require('pg');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use('/', indexRouter);
app.use('/users', usersRouter);


const credenciales = {
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
}; 





app.get('/citas', async (req, res) => {
  // console.log('Resp', objCitas)
  // res.status(200).json(objCitas);

  try{

      const client = new Client(credenciales);
      await client.connect();

      let fechaActual = new Date();
      fechaActual.setHours(fechaActual.getHours() - 6);
      let año = fechaActual.getFullYear();
      let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes porque los meses comienzan desde 0
      let dia = fechaActual.getDate().toString().padStart(2, '0');
      let horas = fechaActual.getHours().toString().padStart(2, '0');
      let minutos = fechaActual.getMinutes().toString().padStart(2, '0');
      let segundos = fechaActual.getSeconds().toString().padStart(2, '0');
      
      // Formatear la fecha y hora en el formato deseado
      let fechaFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
      
      const query =
        `select id, nombre, placas, color, puertas, fecha, marca from citas WHERE fecha >= '${fechaFormateada}'::timestamp - INTERVAL '15 minutes' ORDER BY fecha`;
      const result =await client.query(query);

      // console.log(result.rows)
      if(result.rows.length > 0) {
          // console.log("Existe")
          res.status(200).json({ message: result.rows });
      } else {
          // console.log("No Existe")
          res.status(500).json({ message: result.rows });
      }
  
      await client.end() 
  }
  catch (error) {
      // console.error('No existe', error);
      res.status(500).json({ message: 'El usuario no existe ' + error});
    }

})


app.get('/puertas', async (req, res) => {
const puerta = req.query.puerta;
try{

    const client = new Client(credenciales);
    await client.connect();

    let fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() - 6);
    let año = fechaActual.getFullYear();
    let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes porque los meses comienzan desde 0
    let dia = fechaActual.getDate().toString().padStart(2, '0');
    let horas = fechaActual.getHours().toString().padStart(2, '0');
    let minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    let segundos = fechaActual.getSeconds().toString().padStart(2, '0');
    
    // Formatear la fecha y hora en el formato deseado
    let fechaFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

    const query =
      `select id, nombre, placas, color, puertas, fecha, marca from citas WHERE fecha >= '${fechaFormateada}'::timestamp ORDER BY fecha`;
    const result =await client.query(query);

    // console.log(result.rows)
    if(result.rows.length > 0) {
        // console.log("Existe", result.rows)
        const newArray = []
        for (let i = 0; i< result.rows.length; i+=1 ) {
          if (puerta === "puerta1") {
            if(result.rows[i].puertas.includes("Puerta 1")) {
              newArray.push(result.rows[i])
            }
          } else if (puerta === "puerta2") {
            if(result.rows[i].puertas.includes("Puerta 2")) {
              newArray.push(result.rows[i])
            }
          } else if (puerta === "puerta3") {
            if(result.rows[i].puertas.includes("Puerta 3")) {
              newArray.push(result.rows[i])
            }
          }
        }
        res.status(200).json({ message: newArray });
    } else {
        // console.log("No Existe")
        res.status(500).json({ message: result.rows });
    }

    await client.end() 
}
catch (error) {
    // console.error('No existe', error);
    res.status(500).json({ message: 'El usuario no existe' });
  }

})

app.get('/puertasAtrasadas', async (req, res) => {
  const puerta = req.query.puerta;
  try{
  
      const client = new Client(credenciales);
      await client.connect();
  
      let fechaActual = new Date();
      fechaActual.setHours(fechaActual.getHours() - 6);
      let año = fechaActual.getFullYear();
      let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes porque los meses comienzan desde 0
      let dia = fechaActual.getDate().toString().padStart(2, '0');
      let horas = fechaActual.getHours().toString().padStart(2, '0');
      let minutos = fechaActual.getMinutes().toString().padStart(2, '0');
      let segundos = fechaActual.getSeconds().toString().padStart(2, '0');
      
      // Formatear la fecha y hora en el formato deseado
      let fechaFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  
      const query =
        `select id, nombre, placas, color, puertas, fecha, marca from citas WHERE fecha >= '${fechaFormateada}'::timestamp - INTERVAL '15 minutes' AND fecha < '${fechaFormateada}'::timestamp ORDER BY fecha`;
      const result =await client.query(query);
  
      // console.log(result.rows)
      if(result.rows.length > 0) {
          // console.log("Existe", result.rows)
          const newArray = []
          for (let i = 0; i< result.rows.length; i+=1 ) {
            if (puerta === "puerta1") {
              if(result.rows[i].puertas.includes("Puerta 1")) {
                newArray.push(result.rows[i])
              }
            } else if (puerta === "puerta2") {
              if(result.rows[i].puertas.includes("Puerta 2")) {
                newArray.push(result.rows[i])
              }
            } else if (puerta === "puerta3") {
              if(result.rows[i].puertas.includes("Puerta 3")) {
                newArray.push(result.rows[i])
              }
            }
          }
          res.status(200).json({ message: newArray });
      } else {
          // console.log("No Existe")
          res.status(500).json({ message: result.rows });
      }
  
      await client.end() 
  }
  catch (error) {
      // console.error('No existe', error);
      res.status(500).json({ message: 'El usuario no existe' });
    }
  
  })

app.get('/sesion', async (req, res) => {

  const usuario = req.query.usuario;
  const password = req.query.password;
  // console.log("Parametros", usuario, password)
  try{

      const client = new Client(credenciales);
      await client.connect();
  
      const query =
        'select id from usuarios where usuario = $1 and PassW = crypt($2, PassW)';
      const values = [usuario, password];
      const result =await client.query(query, values);

      console.log(result.rows)
      if(result.rows.length > 0) {
          // console.log("Existe")
          res.status(200).json({ message: result.rows });
      } else {
          // console.log("No Existe")
          res.status(500).json({ message: result.rows });
      }
  
      await client.end() 
  }
  catch (error) {
      // console.error('No existe', error);
      res.status(500).json({ message: 'El usuario no existe' });
    }
  
})


app.post('/registro', async(req, res) => {
  // console.log('OBJE', req.body)
  // objCitas.push(req.body)
  // console.log('Citas', objCitas)
  // res.status(200).json({ message: 'Registro exitoso' });

  const {nombre, marca, placas, color, puertas, fecha} = req.body

  // console.log("Puertas", puertas)
  try {
      const client = new Client(credenciales);
      await client.connect();
  
      const query =
        'INSERT INTO Citas (nombre, marca, placas, color, puertas, fecha) VALUES ($1, $2, $3, $4, $5, $6)';
      const values = [nombre, marca, placas, color, puertas.toString(), fecha];
      await client.query(query, values);
  
      await client.end();
  
      res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
      // console.error('Error al insertar datos', error);
      res.status(500).json({ message: 'Fallo' });

    }
})


app.patch('/editar', async (req, res) => {
const {nombre, marca, placas, color, puertas, fecha, id} = req.body

// console.log("Puertas", puertas)
try {
    const client = new Client(credenciales);
    await client.connect();

    const query =
      'UPDATE Citas SET nombre = $1, marca = $2, placas = $3, color = $4, puertas = $5, fecha = $6 WHERE id = $7';
    const values = [nombre, marca, placas, color, puertas.toString(), fecha, id];
    await client.query(query, values);

    await client.end();

    res.status(200).json({ message: 'Actualizacion exitosa' });
  } catch (error) {
    // console.error('Error al actualizar datos', error);
    res.status(500).json({ message: 'Fallo' });

  }

})

app.delete('/eliminar', async (req, res) => {
  const id = req.query.id;
  try {
      // console.log("ELiinando", id)
      const client = new Client(credenciales);
      await client.connect();
  
      const query =
        'delete from citas where id = $1';
      const values = [id];
      await client.query(query, values);
  
      await client.end();
  
      res.status(200).json({ message: 'Eliminacion exitoso' });
    } catch (error) {
      // console.error('Error al eliminar', error);
      res.status(500).json({ message: 'Fallo' });

    }
})


// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Servidor Express escuchando en el puerto ${PORT}`);
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



