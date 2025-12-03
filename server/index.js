import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

// 1. Importar y configurar dotenv
import 'dotenv/config'; 

// 2. Usar la variable de entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // <--- AQUÍ ESTÁ EL CAMBIO
});
console.log("Token cargado:", process.env.MP_ACCESS_TOKEN);
const app = express();
const port = process.env.PORT || 3000; // También es buena práctica para el puerto

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Soy el server :)");
});

app.post("/create_preference", async (req, res) => {
    try {
        // El precio (req.body.price) viene como el total de la orden desde el cliente
        const body = {
            items: [
                {
                    title: req.body.title, // Ej: "Reserva de 2 Horarios - Complejo Q"
                    quantity: 1, // Cantidad fija a 1, ya que 'price' es el total
                    unit_price: Number(req.body.price),
                    currency_id: "ARS",
                },
            ],
            back_urls: {
                success: "https://polideportivoba.netlify.app/html/inicio.html",
                failure: "https://polideportivoba.netlify.app/html/inicio.html",
                pending: "https://polideportivoba.netlify.app/html/inicio.html",
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });

        res.json({
            id: result.id,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Error al crear la preferencia :(",
        });
    }
});

app.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`);
});