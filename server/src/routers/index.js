    import express from 'express';
    import authRouter from './authRouter.js';
    import messageRouter from './messageRouter.js';
    import userRouter from './userRouter.js';
    const router = express.Router();

    router.use('/api/auth',authRouter);
    router.use('/api/messages',messageRouter);
    router.use('/api/users',userRouter);


    export default router;