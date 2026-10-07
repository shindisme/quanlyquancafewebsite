import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
    if (req.originalUrl && req.url !== req.originalUrl) {
        req.url = req.originalUrl;
    }
    next();
});

app.use('/api/v1', routes);
app.use('/', routes);

// Xu ly route khong ton tai
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
