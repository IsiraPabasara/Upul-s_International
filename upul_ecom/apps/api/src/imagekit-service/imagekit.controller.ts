import { Request, Response, NextFunction } from 'express';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export const getAuthParams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return res.json(authenticationParameters);
  } catch (error) {
    return next(error);
  }
};